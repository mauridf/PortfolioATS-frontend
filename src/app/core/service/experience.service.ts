import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Experience, ExperienceRequest } from '../../models/experience.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class ExperienceService {
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

  getAllExperiences(): Observable<Experience[]> {
    return this.http.get<Experience[]>(`${this.apiUrl}/Experiences`, {
      headers: this.getHeaders()
    });
  }

  getCurrentExperiences(): Observable<Experience[]> {
    return this.http.get<Experience[]>(`${this.apiUrl}/Experience/current`, {
      headers: this.getHeaders()
    });
  }

  getExperienceById(id: string): Observable<Experience> {
    return this.http.get<Experience>(`${this.apiUrl}/Experience/${id}`, {
      headers: this.getHeaders()
    });
  }

  createExperience(experience: ExperienceRequest): Observable<Experience> {
    return this.http.post<Experience>(`${this.apiUrl}/Experience`, experience, {
      headers: this.getHeaders()
    });
  }

  updateExperience(id: string, experience: ExperienceRequest): Observable<any> {
    return this.http.put(`${this.apiUrl}/Experience/${id}`, experience, {
      headers: this.getHeaders()
    });
  }

  deleteExperience(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/Experience/${id}`, {
      headers: this.getHeaders()
    });
  }
}