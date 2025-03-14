import { Component, signal } from '@angular/core';
import { FormGroup, Validators, FormControl, ReactiveFormsModule, AbstractControl, ValidationErrors  } from "@angular/forms";
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth/auth.service';
import { Router } from '@angular/router';


@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  registerForm = new FormGroup({
    email: new FormControl<string>('', [Validators.required]),
    password: new FormControl<string>('', [Validators.required]),
    confirmPassword: new FormControl<string>('', [Validators.required]),
    role: new FormControl<string>('', [Validators.required])
  });
  registerError: string = '';

  registerStatus = signal(null);

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit() {
    const { email, password, confirmPassword, role } = this.registerForm.value;

    // Validación explícita para asegurar que los valores no sean null ni undefined
    if (!email || !password || !confirmPassword || !role) {
      this.registerError = 'Todos los campos son obligatorios';
      return;
    }

    const safeemail = email ?? '';
    const safePassword = password ?? ''; 
    const safeConfirmPassword = confirmPassword ?? ''; 
    const saferole = role ?? '';

    if (safePassword !== safeConfirmPassword) {
      this.registerError = 'Las contraseñas no coinciden'; 
    } else {
      this.registerError = ''; // Limpiar error si es correcto
      this.authService.register(safeemail, safePassword, saferole);  this.router.navigate(['/']);
    }
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }


}
