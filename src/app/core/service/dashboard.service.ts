import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Dashboard, AtsScore } from '../../models/dashboard.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
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

  getDashboard(): Observable<Dashboard> {
    return this.http.get<Dashboard>(`${this.apiUrl}/Dashboard`, {
      headers: this.getHeaders()
    });
  }

  getProfileCompletion(): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/Dashboard/completion`, {
      headers: this.getHeaders()
    });
  }

  getAtsScore(): Observable<AtsScore> {
    return this.http.get<AtsScore>(`${this.apiUrl}/Dashboard/ats-score`, {
      headers: this.getHeaders()
    });
  }
}