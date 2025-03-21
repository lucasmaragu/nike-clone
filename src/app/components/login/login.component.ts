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
    email: new FormControl<string>('', [Validators.required]),
    password: new FormControl<string>('', [Validators.required])
  });

  loginError: string | null = null;

  constructor(private authService: AuthService, private router: Router) {
    effect(() => {
      const status = this.authService.loginStatus();
      

      if (status) {
        if (status.error) {
          this.loginError = 'Email o contraseña incorrectos';
        } else {
          console.log('Login correcto:', status);
          this.router.navigate(['/']); // Redirige si el login es exitoso
        }
      }
    });
  }

  onSubmit() {
    const { email, password } = this.loginForm.value;

    if (!email || !password) {
      this.loginError = 'Todos los campos son obligatorios';
      return;
    }

    this.loginError = null; // Limpiar mensaje de error
    this.authService.login(email, password);
  
  }

  goToRegister() {
    this.router.navigate(['/register']);
  }
}
