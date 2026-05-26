import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './login.component.html',
})
export class LoginComponent {
  isRegister = signal(false);
  email = '';
  password = '';
  name = '';
  error = signal('');
  loading = signal(false);

  constructor(private authService: AuthService, private router: Router) {
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/recipes']);
    }
  }

  toggleMode() {
    this.isRegister.set(!this.isRegister());
    this.error.set('');
  }

  submit() {
    if (!this.email || !this.password) {
      this.error.set('Inserisci email e password');
      return;
    }

    this.loading.set(true);
    this.error.set('');

    const request = this.isRegister()
      ? this.authService.register(this.email, this.password, this.name)
      : this.authService.login(this.email, this.password);

    request.subscribe({
      next: () => this.loading.set(false),
      error: (err) => {
        this.loading.set(false);
        this.error.set(err.error?.message || 'Errore durante l\'autenticazione');
      },
    });
  }
}
