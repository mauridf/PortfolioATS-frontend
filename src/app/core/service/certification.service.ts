import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Certification, CertificationRequest } from '../../models/certification.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class CertificationService {
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

  getAllCertifications(): Observable<Certification[]> {
    return this.http.get<Certification[]>(`${this.apiUrl}/Certifications`, {
      headers: this.getHeaders()
    });
  }

  getExpiredCertifications(): Observable<Certification[]> {
    return this.http.get<Certification[]>(`${this.apiUrl}/Certifications/expired`, {
      headers: this.getHeaders()
    });
  }

  createCertification(certification: CertificationRequest): Observable<Certification> {
    return this.http.post<Certification>(`${this.apiUrl}/Certifications`, certification, {
      headers: this.getHeaders()
    });
  }

  updateCertification(id: string, certification: CertificationRequest): Observable<any> {
    return this.http.put(`${this.apiUrl}/Certifications/${id}`, certification, {
      headers: this.getHeaders()
    });
  }

  deleteCertification(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/Certifications/${id}`, {
      headers: this.getHeaders()
    });
  }
}