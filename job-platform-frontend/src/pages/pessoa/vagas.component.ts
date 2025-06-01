import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { map } from 'rxjs/operators';
import { VagaService } from '../../shared/services/vaga.service';
import { Vaga, AreaAtuacao, Candidatura } from '../../shared/models/models/models.component';

@Component({
  selector: 'app-vagas',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  styleUrls: ['./vagas.component.css'],
  template: `
     <div class="vagas-container">
      <h2 class="vagas-title">🔍 Vagas Disponíveis</h2>

      <!-- Filtros -->
      <div class="filtros-card">
        <form [formGroup]="filtroForm" (ngSubmit)="aplicarFiltros()">
          <div class="filtros-form">
            <!-- Área de Atuação -->
            <div class="form-group">
              <label class="form-label">🏢 Área de Atuação</label>
              <select
                formControlName="area_atuacao"
                class="form-select"
              >
                <option value="">Todas as áreas</option>
                <option *ngFor="let area of areasAtuacao" [value]="area.id">
                  {{ area.nome | titlecase }}
                </option>
              </select>
            </div>

            <!-- Salário mínimo -->
            <div class="form-group">
              <label class="form-label">💰 Salário Mínimo</label>
              <input
                type="number"
                formControlName="salario_minimo"
                class="form-input"
                placeholder="0,00"
              />
            </div>

            <button type="submit" class="btn-filtro">🔍 Filtrar</button>
            <button type="button" (click)="limparFiltros()" class="btn-limpar">
              🗑 Limpar
            </button>
          </div>
        </form>
      </div>

      <!-- Loading -->
      <div *ngIf="loading" class="loading-text">
        Carregando vagas...
      </div>

      <!-- Sem resultados -->
      <div *ngIf="!loading && vagas.length === 0" class="no-results">
        Nenhuma vaga encontrada com os filtros aplicados.
      </div>

      <!-- Lista de Vagas -->
      <div *ngIf="!loading && vagas.length > 0" class="vagas-grid">
        <div *ngFor="let vaga of vagas" class="vaga-card">
          <div class="vaga-image-wrapper">
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

          <div class="vaga-content">
            <div class="vaga-header">
              <h3 class="vaga-title">{{ vaga.titulo }}</h3>
              <span class="vaga-badge">
                {{ vaga.area_atuacao_nome | titlecase }}
              </span>
            </div>

            <p class="vaga-desc">{{ vaga.requisitos }}</p>

            <div class="vaga-info">
              <span>💰 R$ {{ vaga.salario_min | number:'1.2-2' }}</span>
            </div>

            <button
              (click)="abrirModalCandidatura(vaga)"
              class="btn-candidatar"
            >
              📝 Candidatar-se
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de Candidatura -->
    <div *ngIf="modalAberto" class="modal-overlay">
      <div class="modal-content">
        <h3 class="modal-header">Candidatar-se à vaga</h3>

        <div class="modal-form-group mb-4">
          <strong>{{ vagaSelecionada?.titulo }}</strong><br />
          <small>{{ vagaSelecionada?.area_atuacao_nome | titlecase }}</small>
        </div>

        <form [formGroup]="candidaturaForm" (ngSubmit)="enviarCandidatura()">
          <div class="modal-form-group">
            <label class="modal-form-label">
              {{ vagaSelecionada?.pergunta_personalizada }}
            </label>
            <textarea
              formControlName="resposta_pergunta"
              rows="3"
              class="modal-form-textarea"
              placeholder="Sua resposta"
            ></textarea>
          </div>

          <div class="modal-form-group">
            <label class="modal-form-label">📎 Currículo (PDF)</label>
            <input
              type="file"
              (change)="onCurriculoSelect($event)"
              accept=".pdf"
              class="modal-file-input"
            />
          </div>

          <div *ngIf="erroCandidatura" class="modal-error">
            {{ erroCandidatura }}
          </div>

          <div class="flex space-x-2">
            <button
              type="submit"
              [disabled]="candidaturaForm.invalid || carregandoCandidatura"
              class="modal-btn modal-btn-enviar"
            >
              {{ carregandoCandidatura ? 'Enviando...' : 'Enviar' }}
            </button>
            <button
              type="button"
              (click)="fecharModal()"
              class="modal-btn modal-btn-cancelar"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
})
export class VagasComponent implements OnInit {
  filtroForm: FormGroup;
  areasAtuacao: AreaAtuacao[] = [];
  vagas: Vaga[] = [];
  loading = false;

  // Modal
  modalAberto = false;
  vagaSelecionada: Vaga | null = null;
  candidaturaForm: FormGroup;
  carregandoCandidatura = false;
  erroCandidatura = '';
  selectedCurriculo: File | null = null;

  constructor(
    private fb: FormBuilder,
    private vagaService: VagaService
  ) {
    this.filtroForm = this.fb.group({
      area_atuacao: [''],
      salario_minimo: [''],
    });
    this.candidaturaForm = this.fb.group({
      resposta_pergunta: ['', Validators.required],
    });
  }

  ngOnInit() {
    // popula áreas de atuação
    this.vagaService
      .listarAreasAtuacao()
      .pipe(map(res => res.results))
      .subscribe({
        next: areas => this.areasAtuacao = areas,
        error: () => console.error('Falha ao carregar áreas')
      });

    // lista inicial de vagas
    this.carregarVagas();
  }

  private carregarVagas() {
    this.loading = true;
    const filtros: any = { ...this.filtroForm.value };
    if (filtros.salario_minimo) {
      filtros.salario_min = filtros.salario_minimo;
    }
    delete filtros.salario_minimo;

    this.vagaService.listarVagas(filtros).subscribe({
      next: v => {
        this.vagas = v;
        this.loading = false;
      },
      error: err => {
        console.error('Erro ao carregar vagas:', err);
        this.vagas = [];
        this.loading = false;
      }
    });
  }

  aplicarFiltros() {
    this.carregarVagas();
  }

  limparFiltros() {
    this.filtroForm.reset({ area_atuacao: '', salario_minimo: '' });
    this.carregarVagas();
  }

  abrirModalCandidatura(vaga: Vaga) {
    this.vagaSelecionada = vaga;
    this.selectedCurriculo = null;
    this.erroCandidatura = '';
    this.candidaturaForm.reset();
    this.modalAberto = true;
  }

  fecharModal() {
    this.modalAberto = false;
    this.vagaSelecionada = null;
  }

  onCurriculoSelect(evt: any) {
    const file = evt.target.files[0];
    if (file) this.selectedCurriculo = file;
  }

  enviarCandidatura() {
    if (!this.vagaSelecionada) return;
    this.carregandoCandidatura = true;
    this.erroCandidatura = '';

    const formData = new FormData();
    formData.append('vaga', String(this.vagaSelecionada?.id ?? ''));

    formData.append('resposta_pergunta', this.candidaturaForm.value.resposta_pergunta);
    if (this.selectedCurriculo) {
      formData.append('curriculum_especifico', this.selectedCurriculo);
    }

    this.vagaService.candidatarSeVaga(formData).subscribe({
      next: () => {
        this.carregandoCandidatura = false;
        this.fecharModal();
        // opcional: notificar sucesso…
      },
      error: err => {
        this.erroCandidatura = 'Erro ao enviar candidatura.';
        this.carregandoCandidatura = false;
      }
    });
  }
}
