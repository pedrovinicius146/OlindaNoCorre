import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { VagaService } from '../../shared/services/vaga.service';
import { Vaga } from '../../shared/models/models/models.component';
@Component({
selector: 'app-vagas-em-aberto',
standalone: true,
imports: [CommonModule],
 styleUrls: ['./vagas-em-aberto.component.css'],
template: `
<div class="vagas-container">
  <!-- Header -->
  <div class="vagas-header">
    <h2 class="vagas-title">📋 Minhas Vagas em Aberto</h2>
    <button (click)="criarNovaVaga()" class="vagas-button">➕ Nova Vaga</button>
  </div>

  <!-- Loading State -->
  <div *ngIf="loading" class="vagas-loading">
    Carregando vagas...
  </div>

  <!-- Empty State -->
  <div *ngIf="!loading && vagas.length === 0" class="vagas-empty">
    Nenhuma vaga criada ainda.
    <button (click)="criarNovaVaga()" class="vaga-details-button" style="margin-left: 0.5rem;">
      Criar primeira vaga
    </button>
  </div>

  <!-- Grid de Vagas -->
  <div *ngIf="!loading && vagas.length > 0" class="vagas-grid">
    <div *ngFor="let vaga of vagas" class="vaga-card">
      <!-- Imagem da Vaga -->
      <div class="vaga-image-container">
        <img
          *ngIf="vaga.foto_vaga"
          [src]="vaga.foto_vaga"
          [alt]="vaga.titulo"
          class="vaga-image"
        />
        <div *ngIf="!vaga.foto_vaga" class="text-gray-400">
          📷 Sem foto
        </div>
      </div>

      <!-- Conteúdo da Vaga -->
      <div class="vaga-content">
        <div class="vaga-header">
          <h3 class="vaga-title">{{ vaga.titulo }}</h3>
          <span class="vaga-badge">
            {{ vaga.area_atuacao_nome || 'Área desconhecida' | titlecase }}
          </span>
        </div>

        <p class="vaga-description">{{ vaga.requisitos }}</p>

        <div class="vaga-info">
          <span>💰 R$ {{ vaga.salario_min | number:'1.2-2' }}</span>
          
        </div>

        <div class="vaga-footer">
          <span class="vaga-candidates">
            👥 {{ vaga.total_candidaturas || 0 }} candidato(s)
          </span>
          <span
            [ngClass]="{
              'vaga-status aberta': vaga.status === 'aberta',
              'vaga-status fechada': vaga.status === 'fechada',
              'vaga-status pausada': vaga.status === 'pausada'
            }"
            class="vaga-status"
          >
            {{ vaga.status === 'aberta'
              ? '✅ Ativa'
              : vaga.status === 'fechada'
              ? '❌ Fechada'
              : '⏸️ Pausada' }}
          </span>
        </div>

        
      </div>
    </div>
  </div>
</div>

`
})
export class VagasEmAbertoComponent implements OnInit {
vagas: Vaga[] = [];
loading = true;
constructor(
private vagaService: VagaService,
private router: Router
) {}
ngOnInit() {
this.carregarVagas();
}
carregarVagas() {
this.vagaService.listarVagasEmpresa().subscribe({
next: (vagas) => {
this.vagas = vagas;
this.loading = false;
},
error: (err) => {
console.error('Erro ao carregar vagas:', err);
this.loading = false;
}
});
}
criarNovaVaga() {
this.router.navigate(['/empresa/criar-vaga']);
}
}
