import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Usuario } from '../models/models/models.component';
import { authInterceptor } from '../interceptors/auth.interceptor';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8000/api';
  private currentUserSubject = new BehaviorSubject<Usuario | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
    // Só tenta carregar do localStorage se estiver no browser
    if (typeof window !== 'undefined' && window.localStorage) {
      this.loadUserFromStorage();
    }
  }

  login(credentials: { username: string; password: string }): Observable<any> {
  return this.http.post<{ access: string; refresh: string; user: Usuario }>(
    `${this.apiUrl}/auth/login/`,
    credentials
  ).pipe(
    tap(response => {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem('token', response.access);
        localStorage.setItem('refresh_token', response.refresh);
        localStorage.setItem('currentUser', JSON.stringify(response.user)); // ✅ salva o usuário
        this.currentUserSubject.next(response.user); // ✅ atualiza observable
      }
    })
  );
}

  register(userData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/register/`, userData);
  }

  getCurrentUser(): Observable<Usuario> {
    return this.http.get<Usuario>(`${this.apiUrl}/auth/user/`).pipe(
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
      // em ambiente sem localStorage ou JSON inválido, ignora
    }
  }
}
