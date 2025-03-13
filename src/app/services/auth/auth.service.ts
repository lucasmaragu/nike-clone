import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';


@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl = 'http://localhost:3000/api';

  loginStatus = signal<any>(null);
  registerStatus = signal<any>(null);


  constructor(private http: HttpClient) { }

  register(username: string, password: string): void{
    this.http.post(`${this.apiUrl}/register`, {username, password}).subscribe({
      next: (response) => {
        this.registerStatus.set(response);
      },
      error: (err) => {
        this.registerStatus.set(err);
      }
    });
  }

  login(username: string, password: string): void{
    this.http.post(`${this.apiUrl}/login`, {username, password}).subscribe({
      next: (response) => {
        this.loginStatus.set(response);
      },
      error: (err) => {

        this.loginStatus.set(err);
      }
    });
  }
}
