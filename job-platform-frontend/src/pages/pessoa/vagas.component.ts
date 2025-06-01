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
  template: `
    <div class="max-w-6xl mx-auto">
      <h2 class="text-2xl font-bold mb-6">🔍 Vagas Disponíveis</h2>

      <!-- Filtros -->
      <div class="bg-white rounded-lg shadow-md p-4 mb-6">
        <form [formGroup]="filtroForm" (ngSubmit)="aplicarFiltros()">
          <div class="flex flex-wrap gap-4 items-end">
            <!-- Área de Atuação -->
            <div class="flex-1 min-w-48">
              <label class="block text-gray-700 text-sm font-bold mb-2">
                🏢 Área de Atuação
              </label>
              <select formControlName="area_atuacao"
                      class="w-full px-3 py-2 border rounded-md">
                <option value="">Todas as áreas</option>
                <option *ngFor="let area of areasAtuacao" [value]="area.id">
                  {{ area.nome | titlecase }}
                </option>
              </select>
            </div>

            <!-- Salário mínimo -->
            <div class="flex-1 min-w-48">
              <label class="block text-gray-700 text-sm font-bold mb-2">
                💰 Salário Mínimo
              </label>
              <input type="number" formControlName="salario_minimo"
                     class="w-full px-3 py-2 border rounded-md"
                     placeholder="0,00" />
            </div>

            <button type="submit"
                    class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
              🔍 Filtrar
            </button>
            <button type="button" (click)="limparFiltros()"
                    class="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600">
              🗑 Limpar
            </button>
          </div>
        </form>
      </div>

      <!-- Loading -->
      <div *ngIf="loading" class="text-center py-8">
        Carregando vagas...
      </div>

      <!-- Sem resultados -->
      <div *ngIf="!loading && vagas.length === 0"
           class="text-center py-8 text-gray-500">
        Nenhuma vaga encontrada com os filtros aplicados.
      </div>

      <!-- Lista de Vagas -->
      <div *ngIf="!loading && vagas.length > 0"
           class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div *ngFor="let vaga of vagas"
             class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
          
          <div class="h-48 bg-gray-200 flex items-center justify-center">
            <img *ngIf="vaga.foto_vaga" [src]="vaga.foto_vaga"
                 [alt]="vaga.titulo" class="w-full h-full object-cover" />
            <div *ngIf="!vaga.foto_vaga" class="text-gray-400">
              📷 Sem foto
            </div>
          </div>
          
          <div class="p-4">
            <div class="flex justify-between items-start mb-2">
              <h3 class="text-lg font-semibold">{{ vaga.titulo }}</h3>
              <span class="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                {{ vaga.area_atuacao_nome | titlecase }}
              </span>
            </div>
            
            <p class="text-gray-600 text-sm mb-3">{{ vaga.requisitos }}</p>
            
            <div class="flex justify-between items-center text-sm text-gray-500 mb-4">
              <span>💰 R$ {{ vaga.salario_min | number:'1.2-2' }}</span>
            </div>
            
            <button (click)="abrirModalCandidatura(vaga)"
                    class="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700">
              📝 Candidatar-se
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de Candidatura -->
    <div *ngIf="modalAberto"
         class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 class="text-xl font-bold mb-4">Candidatar-se à vaga</h3>
        
        <div class="mb-4">
          <strong>{{ vagaSelecionada?.titulo }}</strong><br />
          <small>{{ vagaSelecionada?.area_atuacao_nome | titlecase }}</small>
        </div>
        
        <form [formGroup]="candidaturaForm" (ngSubmit)="enviarCandidatura()">
          <div class="mb-4">
            <label class="block text-gray-700 mb-2">
              {{ vagaSelecionada?.pergunta_personalizada }}
            </label>
            <textarea formControlName="resposta_pergunta" rows="3"
                      class="w-full px-3 py-2 border rounded-md"
                      placeholder="Sua resposta"></textarea>
          </div>
          
          <div class="mb-4">
            <label class="block text-gray-700 mb-2">📎 Currículo (PDF)</label>
            <input type="file" (change)="onCurriculoSelect($event)" accept=".pdf"
                   class="w-full" />
          </div>
          
          <div *ngIf="erroCandidatura" class="text-red-500 mb-4">
            {{ erroCandidatura }}
          </div>
          
          <div class="flex space-x-2">
            <button type="submit"
                    [disabled]="candidaturaForm.invalid || carregandoCandidatura"
                    class="flex-1 bg-green-600 text-white py-2 rounded-md hover:bg-green-700">
              {{ carregandoCandidatura ? 'Enviando...' : 'Enviar' }}
            </button>
            <button type="button" (click)="fecharModal()"
                    class="flex-1 bg-gray-500 text-white py-2 rounded-md hover:bg-gray-600">
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
