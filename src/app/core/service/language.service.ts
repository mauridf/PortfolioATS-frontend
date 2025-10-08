import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Language, LanguageRequest } from '../../models/language.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class LanguageService {
  private apiUrl = 'https://localhost:7197/api';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  getAllLanguages(): Observable<Language[]> {
    return this.http.get<Language[]>(`${this.apiUrl}/Languages`, {
      headers: this.getHeaders()
    });
  }

  getLanguagesByProficiency(proficiency: string): Observable<Language[]> {
    return this.http.get<Language[]>(`${this.apiUrl}/Languages/proficiency/${encodeURIComponent(proficiency)}`, {
      headers: this.getHeaders()
    });
  }

  createLanguage(language: LanguageRequest): Observable<Language> {
    return this.http.post<Language>(`${this.apiUrl}/Languages`, language, {
      headers: this.getHeaders()
    });
  }

  updateLanguage(id: string, language: LanguageRequest): Observable<any> {
    return this.http.put(`${this.apiUrl}/Languages/${id}`, language, {
      headers: this.getHeaders()
    });
  }

  deleteLanguage(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/Languages/${id}`, {
      headers: this.getHeaders()
    });
  }
}