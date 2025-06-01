import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { Vaga, Candidatura, AreaAtuacao } from '../models/models/models.component';

@Injectable({
  providedIn: 'root'
})
export class VagaService {
  private apiUrl = 'http://localhost:8000/api';

  constructor(private http: HttpClient) {}

  criarVaga(vaga: FormData): Observable<Vaga> {
    return this.http.post<Vaga>(`${this.apiUrl}/vagas/`, vaga);
  }

  listarVagas(filtros?: any): Observable<Vaga[]> {
    // Aqui mudamos para pegar o objeto e extrair o .results
    return this.http
      .get<{ results: Vaga[] }>(`${this.apiUrl}/vagas/`, { params: filtros })
      .pipe(map(res => res.results));
  }

  listarVagasEmpresa(): Observable<Vaga[]> {
    return this.http
      .get<{ results: Vaga[] }>(`${this.apiUrl}/vagas/minhas_vagas/`)
      .pipe(map(res => res.results));
  }

  obterVaga(id: number): Observable<Vaga> {
    return this.http.get<Vaga>(`${this.apiUrl}/vagas/${id}/`);
  }

  candidatarSeVaga(candidatura: FormData): Observable<Candidatura> {
    return this.http.post<Candidatura>(`${this.apiUrl}/candidaturas/`, candidatura);
  }
   listarCandidaturas(): Observable<{
    count: number;
    next: string | null;
    previous: string | null;
    results: Candidatura[];
  }> {
    return this.http.get<{
      count: number;
      next: string | null;
      previous: string | null;
      results: Candidatura[];
    }>(`${this.apiUrl}/candidaturas/`);
  }


  
  
  listarAreasAtuacao(): Observable<{ results: AreaAtuacao[] }> {
    return this.http.get<{ results: AreaAtuacao[] }>(`${this.apiUrl}/areas-atuacao/`);
  }
}
