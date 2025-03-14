import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';

// Creamos una interfaz para la respuesta del login
interface LoginResponse {
  email: string;
  token: string;
  role: string; // Por ejemplo, si también recibes un token
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl = 'http://localhost:3000/api';

  loginStatus = signal<any>(null);  // Para almacenar la información del login
  registerStatus = signal<any>(null);  // Para almacenar el estado del registro

  private usernameSignal = signal<string | null>(null);  // Signal para el username

  constructor(private http: HttpClient) { }

  // Registrar un nuevo usuario
  register(email: string, password: string, role: string): void {
    this.http.post(`${this.apiUrl}/register`, { email, password, role }).subscribe({
      next: (response) => {
        this.registerStatus.set(response);
      },
      error: (err) => {
        this.registerStatus.set(err);
      }
    });
  }

  // Login de usuario
  login(email: string, password: string): void {
    this.http.post<LoginResponse>(`${this.apiUrl}/login`, { email, password }).subscribe({
      next: (response) => {
        this.loginStatus.set(response);
        // Ahora TypeScript sabe que la respuesta tiene un username
        this.usernameSignal.set(response.email);  // Actualizamos el username
      },
      error: (err) => {
        this.loginStatus.set(err);
      }
    });
  }

  // Obtener el username del signal
  getUsername() {
    return this.usernameSignal();  // Devuelve el valor actual del signal
  }

  // Método para verificar si el usuario está logueado
  isLoggedIn(): boolean {
    return this.usernameSignal() !== null;
  }

  // Puedes agregar un método para hacer logout si lo necesitas
  logout(): void {
    this.usernameSignal.set(null);  // Limpiar el username
    this.loginStatus.set(null);  // Limpiar el estado de login
  }
}
