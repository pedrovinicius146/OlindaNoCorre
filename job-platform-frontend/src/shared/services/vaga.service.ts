import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Vaga, Candidatura } from '../models/models/models.component';
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
return this.http.get<Vaga[]>(`${this.apiUrl}/vagas/`, { params: filtros });
}
listarVagasEmpresa(): Observable<Vaga[]> {
return this.http.get<Vaga[]>(`${this.apiUrl}/vagas/empresa/`);
}
obterVaga(id: number): Observable<Vaga> {
return this.http.get<Vaga>(`${this.apiUrl}/vagas/${id}/`);
}
candidatarSeVaga(candidatura: FormData): Observable<Candidatura> {
return this.http.post<Candidatura>(`${this.apiUrl}/candidaturas/`, candidatura);
}
listarCandidaturas(): Observable<Candidatura[]> {
return this.http.get<Candidatura[]>(`${this.apiUrl}/candidaturas/`);
}
}