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

  isLoggedIn = signal(this.hasToken());
  currentUser = signal<{ email: string; name: string } | null>(this.getSavedUser());

  constructor(private http: HttpClient, private router: Router) {}

  register(email: string, password: string, name?: string) {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, { email, password, name })
      .pipe(tap(res => this.handleAuth(res)));
  }

  login(email: string, password: string) {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, { email, password })
      .pipe(tap(res => this.handleAuth(res)));
  }

  logout() {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem('grocery_user');
    this.isLoggedIn.set(false);
    this.currentUser.set(null);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  private handleAuth(res: AuthResponse) {
    localStorage.setItem(this.tokenKey, res.token);
    localStorage.setItem('grocery_user', JSON.stringify(res.user));
    this.isLoggedIn.set(true);
    this.currentUser.set(res.user);
    this.router.navigate(['/recipes']);
  }

  private hasToken(): boolean {
    return !!localStorage.getItem(this.tokenKey);
  }

  private getSavedUser(): { email: string; name: string } | null {
    const saved = localStorage.getItem('grocery_user');
    return saved ? JSON.parse(saved) : null;
  }
}
