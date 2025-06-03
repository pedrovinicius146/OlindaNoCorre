import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { VagaService } from '../../shared/services/vaga.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-criar-vaga',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  styleUrls: ['./criar-vaga.component.css'],
  template: `
    <div class="criar-vaga-container">
      <!-- Botão no canto superior direito -->
      

      <div class="criar-vaga-card">
        <h2 class="page-title">📋 Criar Nova Vaga</h2>

        <form [formGroup]="vagaForm" (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label class="form-label">📷 Foto da Vaga</label>
            <input
              type="file"
              (change)="onFileSelect($event)"
              accept="image/*"
              class="form-input"
            />
          </div>

          <div class="form-group">
            <label class="form-label">📋 Nome da Vaga</label>
            <input type="text" formControlName="titulo" class="form-input" />
          </div>

          <div class="form-group">
            <label class="form-label">🏢 Área de Atuação</label>
            <select formControlName="area_atuacao" class="form-select">
              <option value="">Selecione...</option>
              <option *ngFor="let area of areasAtuacao" [value]="area.id">
                {{ area.nome }}
              </option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">🧾 Requisitos da Vaga</label>
            <textarea
              formControlName="requisitos"
              class="form-textarea"
              placeholder="Descreva os requisitos necessários para a vaga..."
            ></textarea>
          </div>

          <div class="form-group">
            <label class="form-label">💬 Pergunta Personalizada</label>
            <input
              type="text"
              formControlName="pergunta_personalizada"
              class="form-input"
              placeholder="Ex: Por que você se interessou por esta vaga?"
            />
          </div>

          <div class="form-group salary-input-group">
            <label class="form-label">💸 Expectativa Salarial</label>
            <input
              type="number"
              formControlName="salario_min"
              class="form-input salary-input"
              placeholder="0,00"
            />
          </div>

          <div *ngIf="error" class="error-message">
            {{ error }}
          </div>

          <div class="button-group">
            <button
              type="submit"
              [disabled]="vagaForm.invalid || loading"
              class="btn-primary"
            >
              <span *ngIf="loading" class="loading-spinner"></span>
              <span *ngIf="!loading">📤 Criar Vaga</span>
            </button>

            <button
              type="button"
              (click)="cancelar()"
              class="btn-secondary"
            >
              Cancelar
            </button>
            <button
              type="button"
              (click)="goToEmpresaVagas()"
              class="btn-secondary"
            >
              Voltar
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
})
export class CriarVagaComponent implements OnInit {
  vagaForm: FormGroup;
  loading = false;
  error = '';
  selectedFile: File | null = null;
  areasAtuacao: any[] = [];

  constructor(
    private fb: FormBuilder,
    private vagaService: VagaService,
    private router: Router,
    private http: HttpClient
  ) {
    this.vagaForm = this.fb.group({
      titulo: ['', Validators.required],
      area_atuacao: ['', Validators.required],
      requisitos: ['', Validators.required],
      pergunta_personalizada: ['', Validators.required],
      salario_min: ['', [Validators.required, Validators.min(0)]],
    });
  }

  ngOnInit() {
    this.http.get('http://localhost:8000/api/areas-atuacao/').subscribe({
      next: (data: any) => {
        this.areasAtuacao = data.results;
      },
      error: () => {
        this.error = 'Erro ao carregar áreas de atuação.';
      },
    });
  }

  onFileSelect(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
    }
  }

  onSubmit() {
    if (this.vagaForm.valid) {
      this.loading = true;
      this.error = '';
      const formValue = this.vagaForm.value;
      const formData = new FormData();

      formData.append('titulo', formValue.titulo);
      formData.append('descricao', formValue.requisitos);
      formData.append('area_atuacao', formValue.area_atuacao);
      formData.append('pergunta_personalizada', formValue.pergunta_personalizada);
      formData.append('requisitos', formValue.requisitos);
      formData.append('salario_min', formValue.salario_min);

      if (this.selectedFile) {
        formData.append('foto_vaga', this.selectedFile);
      }

      this.vagaService.criarVaga(formData).subscribe({
        next: () => {
          this.router.navigate(['/empresa/vagas-em-aberto']);
        },
        error: () => {
          this.error = 'Erro ao criar vaga. Tente novamente.';
          this.loading = false;
        },
      });
    }
  }

  cancelar() {
    this.router.navigate(['/empresa/vagas-em-aberto']);
  }

  goToEmpresaVagas() {
    this.router.navigate(['empresa/vagas-em-aberto']);
  }

  irParaPerfilPessoa() {
    this.router.navigate(['pessoa/perfil']);
  }
}
