// src/app/pages/pessoa/pessoa-candidaturas.component.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VagaService } from '../../shared/services/vaga.service';
import { Candidatura } from '../../shared/models/models/models.component';

@Component({
  selector: 'app-pessoa-candidaturas',
  standalone: true,
  imports: [CommonModule],
  styleUrls: ['./candidaturas.component.css'],
  template: `
    <div class="candidaturas-container">
      <h2 class="candidaturas-title">📋 Minhas Candidaturas</h2>

      <!-- Loading Indicator -->
      <div *ngIf="loading" class="candidaturas-loading">
        Carregando candidaturas...
      </div>

      <!-- Empty State -->
      <div *ngIf="!loading && candidaturas.length === 0" class="candidaturas-empty">
        Você ainda não se candidatou a nenhuma vaga.
      </div>

      <!-- Lista de Candidaturas -->
      <div *ngIf="!loading && candidaturas.length > 0" class="candidaturas-list">
        <div *ngFor="let cand of candidaturas" class="candidatura-card">
          <div class="candidatura-header">
            <div>
              <h3 class="candidatura-vaga-title">{{ cand.vaga_titulo }}</h3>
              <p class="candidatura-vaga-empresa">🏢 {{ cand.vaga_empresa }}</p>
            </div>
            <span
              class="candidatura-status"
              [ngClass]="{
                'status-aguardando': cand.status === 'aguardando',
                'status-analise': cand.status === 'em_analise',
                'status-selecionado': cand.status === 'selecionado',
                'status-rejeitado': cand.status === 'rejeitado',
                'status-contratado': cand.status === 'contratado'
              }"
            >
              {{ statusText(cand.status) }}
            </span>
          </div>

          <div class="candidatura-response">
            <h4 class="candidatura-subtitle">💬 Sua resposta:</h4>
            <p class="candidatura-text">{{ cand.resposta_pergunta }}</p>
          </div>

          <div *ngIf="cand.curriculum_especifico" class="candidatura-doc">
            📎 Currículo enviado:
            <a
              class="candidatura-link"
              [href]="cand.curriculum_especifico"
              target="_blank"
              >Ver currículo</a
            >
          </div>

          <div *ngIf="cand.carta_apresentacao" class="candidatura-doc">
            📝 Carta de apresentação:
            <span class="candidatura-text">{{ cand.carta_apresentacao }}</span>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      /* Espaçamento vertical entre itens */
      .space-y-6 > * + * {
        margin-top: 1.5rem;
      }
    `,
  ],
})
export class PessoaCandidaturasComponent implements OnInit {
  candidaturas: Candidatura[] = [];
  loading = false;

  constructor(private vagaService: VagaService) {}

  ngOnInit() {
    this.loading = true;

    // Chama API de Candidaturas (paginada):
    this.vagaService.listarCandidaturas().subscribe({
      next: (res: {
        count: number;
        next: string | null;
        previous: string | null;
        results: Candidatura[];
      }) => {
        // Atribui apenas o array de resultados
        this.candidaturas = res.results || [];
        this.loading = false;
      },
      error: (err) => {
        console.error('Erro ao carregar candidaturas:', err);
        this.candidaturas = [];
        this.loading = false;
      },
    });
  }

  /**
   * Retorna texto amigável para o status da candidatura
   */
  statusText(status: string): string {
    switch (status) {
      case 'aguardando':
        return '⏳ Aguardando';
      case 'em_analise':
        return '🔍 Em Análise';
      case 'selecionado':
        return '✅ Selecionado';
      case 'rejeitado':
        return '❌ Rejeitado';
      case 'contratado':
        return '🎯 Contratado';
      default:
        return status;
    }
  }
}
