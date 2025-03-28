import { Injectable, signal } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";  // Asegúrate de que esto es correcto
import { Observable, catchError, map, tap, throwError } from "rxjs";
import { AuthService } from "../auth/auth.service";

export interface UserProfile {
  id: number
  email: string
  role: string
  created_at: string
}

export interface ProfileUpdateRequest {
  email?: string
  role?: string
}

export interface PasswordUpdateRequest {
  currentPassword: string
  newPassword: string
}

@Injectable({
  providedIn: "root",
})
export class ProfileService {
  private apiUrl = "http://localhost:3000/api"

  // Signals para el estado
  loading = signal(false)
  error = signal<string | null>(null)
  success = signal<string | null>(null)
  userProfile = signal<UserProfile | null>(null)

  constructor(private http: HttpClient, private authService: AuthService) {}

  

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem("token")
    return new HttpHeaders({
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    })
  }

  /**
   * Obtiene el perfil del usuario actual
   */
  getProfile(): Observable<UserProfile> {
    this.loading.set(true);
    this.error.set(null);

    const userId = this.authService.getUserId(); // Obtener userId
    const token = localStorage.getItem('token'); // Obtener token de localStorage
    
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,  // Usamos el token si es necesario
      'userId': `${userId}`, // Agregar el userId en los headers
    });
    console.log(`${this.apiUrl}/profile`, headers)
    return this.http
      .get<{ user: UserProfile }>(`${this.apiUrl}/profile`, { headers }) // Pasar los headers en el objeto de configuración
      .pipe(
        map((response) => response.user),  // Extraer el usuario de la respuesta
        tap((user) => {
          this.userProfile.set(user);
          this.loading.set(false);
        }),
        catchError((error) => {
          this.loading.set(false);
          this.error.set(error.error?.error || "Error al obtener el perfil");
          return throwError(() => error);
        })
      );
  }

  /**
   * Actualiza el perfil del usuario
   */
  updateProfile(profileData: ProfileUpdateRequest): Observable<UserProfile> {
    this.loading.set(true)
    this.error.set(null)
    this.success.set(null)

    return this.http
      .put<{ user: UserProfile }>(`${this.apiUrl}/profile`, profileData, {
        headers: this.getHeaders(),
      })
      .pipe(
        map((response) => response.user),
        tap((user) => {
          this.userProfile.set(user)
          this.loading.set(false)
          this.success.set("Perfil actualizado correctamente")

          // Limpiar mensaje de éxito después de 3 segundos
          setTimeout(() => this.success.set(null), 3000)
        }),
        catchError((error) => {
          this.loading.set(false)
          this.error.set(error.error?.error || "Error al actualizar el perfil")
          return throwError(() => error)
        }),
      )
  }

  /**
   * Cambia la contraseña del usuario
   */
  updatePassword(passwordData: PasswordUpdateRequest): Observable<{ message: string }> {
    this.loading.set(true)
    this.error.set(null)
    this.success.set(null)

    return this.http
      .put<{ message: string }>(`${this.apiUrl}/profile/password`, passwordData, {
        headers: this.getHeaders(),
      })
      .pipe(
        tap((response) => {
          this.loading.set(false)
          this.success.set(response.message || "Contraseña actualizada correctamente")

          // Limpiar mensaje de éxito después de 3 segundos
          setTimeout(() => this.success.set(null), 3000)
        }),
        catchError((error) => {
          this.loading.set(false)
          this.error.set(error.error?.error || "Error al cambiar la contraseña")
          return throwError(() => error)
        }),
      )
  }

  /**
   * Obtiene las compras del usuario
   */
  getPurchases(): Observable<any[]> {
    this.loading.set(true)

    const userId = this.getUserIdFromToken()
    const headers = new HttpHeaders({
      "Content-Type": "application/json",
      userid: userId?.toString() || "",
    })

    return this.http.get<{ purchases: any[] }>(`${this.apiUrl}/compras`, { headers }).pipe(
      map((response) => response.purchases),
      tap(() => {
        this.loading.set(false)
      }),
      catchError((error) => {
        this.loading.set(false)
        this.error.set(error.error?.error || "Error al obtener las compras")
        return throwError(() => error)
      }),
    )
  }

  /**
   * Obtiene los detalles de una compra específica
   */
  getPurchaseItems(purchaseId: number): Observable<any[]> {
    this.loading.set(true)

    const userId = this.getUserIdFromToken()
    const headers = new HttpHeaders({
      "Content-Type": "application/json",
      userid: userId?.toString() || "",
    })

    return this.http.get<{ items: any[] }>(`${this.apiUrl}/compras/${purchaseId}/items`, { headers }).pipe(
      map((response) => response.items),
      tap(() => {
        this.loading.set(false)
      }),
      catchError((error) => {
        this.loading.set(false)
        this.error.set(error.error?.error || "Error al obtener los detalles de la compra")
        return throwError(() => error)
      }),
    )
  }

  /**
   * Extrae el ID del usuario del token JWT
   */
  private getUserIdFromToken(): number | null {
    const token = localStorage.getItem("token")
    if (!token) return null

    try {
      // Decodificar el token (parte simple sin verificación)
      const payload = JSON.parse(atob(token.split(".")[1]))
      return payload.id
    } catch (e) {
      console.error("Error al decodificar el token", e)
      return null
    }
  }

  /**
   * Limpia los mensajes de error y éxito
   */
  clearMessages(): void {
    this.error.set(null)
    this.success.set(null)
  }
}

