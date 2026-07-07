import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs';
import { environment } from '../../environments/environment';

export interface AuthResponse {
  token: string;
  user: { email: string; name: string };
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;
  private tokenKey = 'grocery_token';
  private userKey = 'grocery_user';

  isLoggedIn = signal(this.hasToken());
  currentUser = signal<{ email: string; name: string } | null>(this.getSavedUser());

  constructor(private http: HttpClient, private router: Router) {
    if (!this.hasToken()) {
      this.clearSession();
    }
  }

  register(email: string, password: string, name?: string) {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, { email, password, name })
      .pipe(tap(res => this.handleAuth(res)));
  }

  login(email: string, password: string) {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, { email, password })
      .pipe(tap(res => this.handleAuth(res)));
  }

  logout() {
    this.clearSession();
    this.router.navigate(['/login']);
  }

  clearSession() {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    this.isLoggedIn.set(false);
    this.currentUser.set(null);
  }

  getToken(): string | null {
    const token = localStorage.getItem(this.tokenKey);
    if (!token || !this.isTokenValid(token)) {
      return null;
    }
    return token;
  }

  private handleAuth(res: AuthResponse) {
    localStorage.setItem(this.tokenKey, res.token);
    localStorage.setItem(this.userKey, JSON.stringify(res.user));
    this.isLoggedIn.set(true);
    this.currentUser.set(res.user);
    this.router.navigate(['/recipes']);
  }

  private hasToken(): boolean {
    return !!this.getToken();
  }

  private getSavedUser(): { email: string; name: string } | null {
    const saved = localStorage.getItem(this.userKey);
    return saved ? JSON.parse(saved) : null;
  }

  private isTokenValid(token: string): boolean {
    try {
      const payloadRaw = token.split('.')[1];
      if (!payloadRaw) return false;

      const payloadJson = atob(payloadRaw.replace(/-/g, '+').replace(/_/g, '/'));
      const payload = JSON.parse(payloadJson) as { exp?: number };

      // If no exp claim exists, treat token as persistent session token.
      if (!payload.exp) return true;

      const nowSeconds = Math.floor(Date.now() / 1000);
      return payload.exp > nowSeconds;
    } catch {
      return false;
    }
  }
}
