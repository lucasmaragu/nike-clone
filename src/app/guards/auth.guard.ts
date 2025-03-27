import { Injectable, computed } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth/auth.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(): boolean {
    const userRole = this.authService.getRole(); // Obtener rol del usuario

    if (userRole === 'admin') {
      return true; // Si es admin, permitir acceso
    }

    this.router.navigate(['/']); // Si no es admin, redirigir a login
    return false;
  }
}
