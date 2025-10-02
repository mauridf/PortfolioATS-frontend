import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Profile, ProfileRequest } from '../../models/profile.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
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

  getProfile(): Observable<Profile> {
    return this.http.get<Profile>(`${this.apiUrl}/Profile`, {
      headers: this.getHeaders()
    });
  }

  updateProfile(profileData: ProfileRequest): Observable<Profile> {
    return this.http.put<Profile>(`${this.apiUrl}/Profile`, profileData, {
      headers: this.getHeaders()
    });
  }

  // Método para calcular completude do perfil
  calculateProfileCompleteness(profile: Profile): number {
    let completedFields = 0;
    const totalFields = 7; // Campos principais do perfil

    if (profile.fullName?.trim()) completedFields++;
    if (profile.email?.trim()) completedFields++;
    if (profile.phone?.trim()) completedFields++;
    if (profile.location?.trim()) completedFields++;
    if (profile.professionalSummary?.trim()) completedFields++;
    if (profile.skills?.length > 0) completedFields++;
    if (profile.experiences?.length > 0) completedFields++;

    return Math.round((completedFields / totalFields) * 100);
  }

  // Método para verificar campos obrigatórios faltantes
  getMissingRequiredFields(profile: Profile): string[] {
    const missingFields: string[] = [];

    if (!profile.fullName?.trim()) missingFields.push('Nome completo');
    if (!profile.email?.trim()) missingFields.push('E-mail');
    if (!profile.phone?.trim()) missingFields.push('Telefone');
    if (!profile.location?.trim()) missingFields.push('Localização');
    if (!profile.professionalSummary?.trim()) missingFields.push('Resumo profissional');

    return missingFields;
  }
}