import { Component, computed, effect, signal } from '@angular/core';
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  loginForm = new FormGroup({
    username: new FormControl<string>('', [Validators.required]),
    password: new FormControl<string>('', [Validators.required])
  });

  loginError: string | null = null;

  constructor(private authService: AuthService, private router: Router) {
    effect(() => {
      const status = this.authService.loginStatus();
      console.log('Estado de login actualizado:', status);

      if (status) {
        if (status.error) {
          this.loginError = 'Usuario o contraseña incorrectos';
        } else {
          console.log('Login correcto:', status);
          this.router.navigate(['/']); // Redirige si el login es exitoso
        }
      }
    });
  }

  onSubmit() {
    const { username, password } = this.loginForm.value;

    if (!username || !password) {
      this.loginError = 'Todos los campos son obligatorios';
      return;
    }

    this.loginError = null; // Limpiar mensaje de error
    this.authService.login(username, password);
  }

  goToRegister() {
    this.router.navigate(['/register']);
  }
}
