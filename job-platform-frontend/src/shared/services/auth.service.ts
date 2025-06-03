// src/app/shared/services/auth.service.ts

import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Usuario } from '../models/models/models.component';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8000/api';
  private currentUserSubject = new BehaviorSubject<Usuario | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
    // Carrega de localStorage, se existir
    if (typeof window !== 'undefined' && window.localStorage) {
      this.loadUserFromStorage();
    }
  }

  /**
   * Faz login. Espera receber { access, refresh, user }.
   * Salva token + usuário em localStorage/BehaviorSubject.
   */
  login(credentials: { username: string; password: string }): Observable<any> {
    return this.http.post<{ access: string; refresh: string; user: Usuario }>(
      `${this.apiUrl}/auth/login/`,
      credentials
    ).pipe(
      tap(response => {
        if (typeof window !== 'undefined' && window.localStorage) {
          localStorage.setItem('token', response.access);
          localStorage.setItem('refresh_token', response.refresh);
          localStorage.setItem('currentUser', JSON.stringify(response.user));
          this.currentUserSubject.next(response.user);
        }
      })
    );
  }

  register(userData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/register/`, userData);
  }

  /**
   * Busca dados atualizados do perfil no back-end.
   * Utilizado, por exemplo, depois de todo login ou refresh.
   */
  getCurrentUser(): Observable<Usuario> {
    return this.http.get<Usuario>(`${this.apiUrl}/auth/profile/`).pipe(
      tap(user => {
        if (typeof window !== 'undefined' && window.localStorage) {
          this.currentUserSubject.next(user);
          localStorage.setItem('currentUser', JSON.stringify(user));
        } else {
          this.currentUserSubject.next(user);
        }
      })
    );
  }

  /**
   * Atualiza o perfil. Monta um FormData e faz PATCH /api/auth/profile/.
   * O retorno deve ser o objeto Usuario atualizado (incluindo URL da nova foto).
   */
  updateProfile(formData: FormData): Observable<Usuario> {
    const token = this.getToken();
    const headers = token
      ? new HttpHeaders({ Authorization: `Bearer ${token}` })
      : undefined;

    return this.http.put<Usuario>(
      `${this.apiUrl}/auth/profile/`,
      formData,
      { headers }
    ).pipe(
      tap(user => {
        if (typeof window !== 'undefined' && window.localStorage) {
          this.currentUserSubject.next(user);
          localStorage.setItem('currentUser', JSON.stringify(user));
        } else {
          this.currentUserSubject.next(user);
        }
      })
    );
  }

  logout(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.removeItem('token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('currentUser');
    }
    this.currentUserSubject.next(null);
  }

  isAuthenticated(): boolean {
    return (typeof window !== 'undefined' && !!localStorage.getItem('token')) || false;
  }

  getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token');
    }
    return null;
  }

  private loadUserFromStorage(): void {
    try {
      const userStr = localStorage.getItem('currentUser');
      if (userStr) {
        this.currentUserSubject.next(JSON.parse(userStr));
      }
    } catch {
      // ignora erro de leitura
    }
  }

  
}
