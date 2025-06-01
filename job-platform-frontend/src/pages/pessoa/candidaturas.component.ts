// src/app/pages/pessoa/pessoa-candidaturas.component.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VagaService } from '../../shared/services/vaga.service';
import { Candidatura } from '../../shared/models/models/models.component';

@Component({
  selector: 'app-pessoa-candidaturas',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="max-w-6xl mx-auto">
      <h2 class="text-2xl font-bold mb-6">📋 Minhas Candidaturas</h2>

      <!-- Loading Indicator -->
      <div *ngIf="loading" class="text-center py-8">
        Carregando candidaturas...
      </div>

      <!-- Se não houver candidaturas -->
      <div
        *ngIf="!loading && candidaturas.length === 0"
        class="text-center py-8 text-gray-500"
      >
        Você ainda não se candidatou a nenhuma vaga.
      </div>

      <!-- Lista de candidaturas -->
      <div *ngIf="!loading && candidaturas.length > 0" class="space-y-6">
        <div
          *ngFor="let cand of candidaturas"
          class="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
        >
          <div class="flex justify-between items-start mb-2">
            <div>
              <h3 class="text-xl font-semibold text-gray-900 mb-1">
                {{ cand.vaga_titulo }}
              </h3>
              <p class="text-sm text-gray-600">🏢 {{ cand.vaga_empresa }}</p>
            </div>
            <span
              class="text-xs px-2 py-1 rounded-full"
              [ngClass]="{
                'bg-yellow-100 text-yellow-800': cand.status === 'aguardando',
                'bg-blue-100 text-blue-800': cand.status === 'em_analise',
                'bg-green-100 text-green-800': cand.status === 'selecionado',
                'bg-red-100 text-red-800': cand.status === 'rejeitado',
                'bg-purple-100 text-purple-800': cand.status === 'contratado'
              }"
            >
              {{ statusText(cand.status) }}
            </span>
          </div>


          <div class="mb-4">
            <h4 class="font-medium text-gray-800 mb-1">💬 Sua resposta:</h4>
            <p class="text-gray-600">{{ cand.resposta_pergunta }}</p>
          </div>

          <div *ngIf="cand.curriculum_especifico" class="mb-2 text-sm">
            📎 Currículo enviado:
            <a
              class="text-blue-600 hover:underline"
              [href]="cand.curriculum_especifico"
              target="_blank"
              >Ver currículo</a
            >
          </div>

          <div *ngIf="cand.carta_apresentacao" class="text-sm">
            📝 Carta de apresentação:
            <span class="text-gray-700">{{ cand.carta_apresentacao }}</span>
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
