import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { AuthResponse, LoginRequest, RegisterRequest, ChangePasswordRequest, User } from '../../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'https://localhost:7197/api';
  private tokenKey = 'portfolio_token';
  private userKey = 'portfolio_user';
  
  private currentUserSubject = new BehaviorSubject<User | null>(this.getStoredUser());
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {}

  register(registerData: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/Auth/register`, registerData)
      .pipe(
        tap(response => {
          console.log('Register Response:', response); // Para debug
          this.setAuthData(response);
        })
      );
  }

  login(loginData: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/Auth/login`, loginData)
      .pipe(
        tap(response => {
          console.log('Login Response:', response); // Para debug
          this.setAuthData(response);
        })
      );
  }

  changePassword(passwordData: ChangePasswordRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/Auth/change-password`, passwordData, {
      headers: this.getAuthHeaders()
    });
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    this.currentUserSubject.next(null);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  private setAuthData(response: AuthResponse): void {
    // Armazena o token JWT
    localStorage.setItem(this.tokenKey, response.token);
    
    // Armazena os dados completos do usuário
    const userData: User = {
      id: response.user.id,
      email: response.user.email,
      fullName: response.user.fullName,
      role: response.user.role
    };
    
    localStorage.setItem(this.userKey, JSON.stringify(userData));
    this.currentUserSubject.next(userData);
  }

  private getStoredUser(): User | null {
    const userData = localStorage.getItem(this.userKey);
    if (userData) {
      try {
        return JSON.parse(userData) as User;
      } catch (error) {
        console.error('Error parsing stored user data:', error);
        return null;
      }
    }
    return null;
  }

  private getAuthHeaders(): { [header: string]: string } {
    const token = this.getToken();
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  }

  // Método para verificar se o token expirou (opcional)
  isTokenExpired(): boolean {
    const token = this.getToken();
    if (!token) return true;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expiration = payload.exp * 1000; // Convert to milliseconds
      return Date.now() >= expiration;
    } catch (error) {
      console.error('Error checking token expiration:', error);
      return true;
    }
  }
}