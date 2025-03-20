import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';

// Creamos una interfaz para la respuesta del login
interface LoginResponse {
  id: number;
  email: string;
  token: string;
  role: string; // Por ejemplo, si también recibes un token
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl = 'http://localhost:3000/api';

  userIdSignal = signal<number | null>(null);  // Signal para el userId
  loginStatus = signal<any>(null);  // Para almacenar la información del login
  registerStatus = signal<any>(null);  // Para almacenar el estado del registro
  roleSignal = signal<string | null>(null);  // Signal para el role

  private usernameSignal = signal<string | null>(null);  // Signal para el username

  constructor(private http: HttpClient) {
    // Comprobar si estamos en el cliente (navegador)
    if (typeof window !== 'undefined') {
      const storedRole = localStorage.getItem('role');
      const storedToken = localStorage.getItem('token');
      if (storedRole && storedToken) {
        this.roleSignal.set(storedRole); // Restaurar el rol desde localStorage
        this.loginStatus.set({ email: '', token: storedToken, role: storedRole }); // Restaurar el loginStatus
      }
    }
  }

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
        this.roleSignal.set(response.role); 
        this.usernameSignal.set(response.email);  // Establecer el username en el signal
        this.userIdSignal.set(response.id);  // Establecer el userId en el signal 

        localStorage.setItem('role', response.role);
        localStorage.setItem('token', response.token);
      },
      error: (err) => {
        this.loginStatus.set(err);
        this.roleSignal.set(null);
      }
    });
  }

  // Obtener el username del signal
  getUsername() {
    return this.usernameSignal();  // Devuelve el valor actual del signal
  }

  getRole() {
    return this.roleSignal();  // Devuelve el valor actual del signal
  }

  getUserId() {
    return this.userIdSignal();  // Devuelve el valor actual del signal 
  }


  // Método para verificar si el usuario está logueado
  isLoggedIn(): boolean {
    return this.usernameSignal() !== null;
  }

  // Puedes agregar un método para hacer logout si lo necesitas
  logout(): void {
    localStorage.removeItem('role'); // Eliminar el rol de localStorage
    localStorage.removeItem('token'); // Eliminar el token de localStorage
    this.roleSignal.set(null);
    this.loginStatus.set(null);
  }

  
}
