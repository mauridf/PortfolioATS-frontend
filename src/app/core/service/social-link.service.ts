import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SocialLink, SocialLinkRequest } from '../../models/social-link.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class SocialLinkService {
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

  getAllSocialLinks(): Observable<SocialLink[]> {
    return this.http.get<SocialLink[]>(`${this.apiUrl}/SocialLinks`, {
      headers: this.getHeaders()
    });
  }

  createSocialLink(socialLink: SocialLinkRequest): Observable<SocialLink> {
    return this.http.post<SocialLink>(`${this.apiUrl}/SocialLinks`, socialLink, {
      headers: this.getHeaders()
    });
  }

  updateSocialLink(id: string, socialLink: SocialLinkRequest): Observable<any> {
    return this.http.put(`${this.apiUrl}/SocialLinks/${id}`, socialLink, {
      headers: this.getHeaders()
    });
  }

  deleteSocialLink(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/SocialLinks/${id}`, {
      headers: this.getHeaders()
    });
  }
}