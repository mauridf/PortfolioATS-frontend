import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Skill, SkillRequest } from '../../models/skill.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class SkillService {
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

  getAllSkills(): Observable<Skill[]> {
    return this.http.get<Skill[]>(`${this.apiUrl}/Skills`, {
      headers: this.getHeaders()
    });
  }

  getSkillsByCategory(category: string): Observable<Skill[]> {
    return this.http.get<Skill[]>(`${this.apiUrl}/Skills/category/${encodeURIComponent(category)}`, {
      headers: this.getHeaders()
    });
  }

  createSkill(skill: SkillRequest): Observable<Skill> {
    return this.http.post<Skill>(`${this.apiUrl}/Skills`, skill, {
      headers: this.getHeaders()
    });
  }

  updateSkill(id: string, skill: SkillRequest): Observable<any> {
    return this.http.put(`${this.apiUrl}/Skills/${id}`, skill, {
      headers: this.getHeaders()
    });
  }

  deleteSkill(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/Skills/${id}`, {
      headers: this.getHeaders()
    });
  }
}