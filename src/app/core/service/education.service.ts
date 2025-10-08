import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Education, EducationRequest } from '../../models/education.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class EducationService {
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

  getAllEducations(): Observable<Education[]> {
    return this.http.get<Education[]>(`${this.apiUrl}/Educations`, {
      headers: this.getHeaders()
    });
  }

  getEducationsByDegree(degree: string): Observable<Education[]> {
    return this.http.get<Education[]>(`${this.apiUrl}/Educations/degree/${encodeURIComponent(degree)}`, {
      headers: this.getHeaders()
    });
  }

  createEducation(education: EducationRequest): Observable<Education> {
    return this.http.post<Education>(`${this.apiUrl}/Educations`, education, {
      headers: this.getHeaders()
    });
  }

  updateEducation(id: string, education: EducationRequest): Observable<any> {
    return this.http.put(`${this.apiUrl}/Educations/${id}`, education, {
      headers: this.getHeaders()
    });
  }

  deleteEducation(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/Educations/${id}`, {
      headers: this.getHeaders()
    });
  }
}