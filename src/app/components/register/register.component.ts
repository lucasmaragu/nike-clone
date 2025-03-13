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
    username: new FormControl<string>('', [Validators.required]),
    password: new FormControl<string>('', [Validators.required]),
    confirmPassword: new FormControl<string>('', [Validators.required])
  });
  registerError: string = '';

  registerStatus = signal(null);

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit() {
    const { username, password, confirmPassword } = this.registerForm.value;

    // Validación explícita para asegurar que los valores no sean null ni undefined
    if (!username || !password || !confirmPassword) {
      this.registerError = 'Todos los campos son obligatorios';
      return;
    }

    const safeUsername = username ?? '';
    const safePassword = password ?? ''; 
    const safeConfirmPassword = confirmPassword ?? ''; 

    if (safePassword !== safeConfirmPassword) {
      this.registerError = 'Las contraseñas no coinciden'; 
    } else {
      this.registerError = ''; // Limpiar error si es correcto
      this.authService.register(safeUsername, safePassword);  this.router.navigate(['/']);
    }
  }


}
