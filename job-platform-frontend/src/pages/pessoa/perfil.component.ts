import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from
'@angular/forms';
import { AuthService } from '../../shared/services/auth.service';
import { Usuario } from '../../shared/models/models/models.component';
import { Router } from '@angular/router';
@Component({
selector: 'app-perfil',
standalone: true,
imports: [CommonModule, ReactiveFormsModule],
styleUrls: ['./perfil.component.css'],
template: `
<div class="perfil-container">
      <h2 class="perfil-title">👤 Meu Perfil</h2>

      <!-- Cabeçalho com foto e informações -->
      <!-- Cabeçalho com foto e informações -->
<div class="perfil-header" *ngIf="currentUser">
  <div class="perfil-avatar">
    <img
      *ngIf="currentUser.foto_perfil"
      [src]="currentUser.foto_perfil"
      alt="Foto de perfil"
      class="object-cover"
    />
    <span
      *ngIf="!currentUser.foto_perfil"
      class="placeholder-icon"
      >👤</span
    >
  </div>
  <div class="perfil-userinfo">
    <h3>{{ currentUser.username }}</h3>
    <p>{{ currentUser.email }}</p>
    <span class="perfil-badge">
      {{ currentUser.tipo_usuario === 'candidato' ? 'Candidato' : 'Empresa' }}
    </span>
  </div>
</div>


      <!-- Formulário de Edição -->
      <form
        class="perfil-form"
        [formGroup]="perfilForm"
        (ngSubmit)="onSubmit()"
      >
        <!-- Nome de Usuário -->
        <div class="form-group">
          <label class="form-label">Nome de Usuário</label>
          <input
            type="text"
            formControlName="username"
            class="form-input"
          />
        </div>

        <!-- E-mail -->
        <div class="form-group">
          <label class="form-label">E-mail</label>
          <input
            type="email"
            formControlName="email"
            class="form-input"
          />
        </div>

        <!-- Nome Completo (para candidato) -->
        <div
          *ngIf="currentUser?.tipo_usuario === 'candidato'"
          class="form-group"
        >
          <label class="form-label">Nome Completo</label>
          <input
            type="text"
            formControlName="nome_completo"
            class="form-input"
          />
        </div>

        <!-- Nova Foto de Perfil -->
        <div class="form-group">
          <label class="form-label">Nova Foto de Perfil</label>
          <input
            type="file"
            (change)="onFileSelect($event)"
            accept="image/*"
            class="perfil-file-input"
          />
        </div>

        <!-- Nova Senha -->
        <div class="form-group">
          <label class="form-label">
            Nova Senha (deixe em branco para manter a atual)
          </label>
          <input
            type="password"
            formControlName="password"
            class="form-input"
          />
        </div>

        <!-- Mensagem de Erro/Sucesso -->
        <div
          *ngIf="message"
          class="perfil-message"
          [ngClass]="{
            'success': messageType === 'success',
            'error': messageType === 'error'
          }"
        >
          {{ message }}
        </div>

        <!-- Botão de Salvar -->
        <button
          type="submit"
          [disabled]="perfilForm.invalid || loading"
          class="perfil-button"
        >
          <span
            *ngIf="loading"
            class="loading-spinner"
          ></span>
          <span *ngIf="!loading">💾 Salvar Alterações</span>
        </button><button (click)="goToPessoaVagas()" class="btn-secondary">Voltar</button>
      </form>
           
    </div>
`
})
export class PerfilComponent implements OnInit {
  perfilForm: FormGroup;
  currentUser: Usuario | null = null;
  loading = false;
  message = '';
  messageType = '';
  selectedFile: File | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router  // <-- injeta Router aqui
  ) {
    this.perfilForm = this.fb.group({
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      nome_completo: [''],
      password: ['']
    });
  }

  ngOnInit() {
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.currentUser = user;
        this.perfilForm.patchValue({
          username: user.username,
          email: user.email,
          nome_completo: (user as any).nome_completo || ''
        });
      }
    });
  }

  onFileSelect(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
    }
  }

  onSubmit() {
    if (this.perfilForm.valid) {
      this.loading = true;
      this.message = '';

      const formData = new FormData();
      formData.append('username', this.perfilForm.value.username);
      formData.append('email', this.perfilForm.value.email);
      if (this.perfilForm.value.password) {
        formData.append('password', this.perfilForm.value.password);
      }
      if (this.selectedFile) {
        formData.append('foto_perfil', this.selectedFile);
      }

      this.authService.updateProfile(formData).subscribe({
        next: (user) => {
          this.message = 'Perfil atualizado com sucesso!';
          this.messageType = 'success';
          this.loading = false;
          this.authService.getCurrentUser().subscribe(); // atualiza observable global
        },
        error: () => {
          this.message = 'Erro ao atualizar perfil.';
          this.messageType = 'error';
          this.loading = false;
        }
      });
    }
  }

  // Métodos de navegação:
  goToEmpresaVagas() {
    this.router.navigate(['empresa/vagas-em-aberto']);
  }

  goToPessoaVagas() {
    this.router.navigate(['pessoa/vagas']);
  }
}