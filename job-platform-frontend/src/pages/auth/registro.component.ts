import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../shared/services/auth.service';

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  styleUrls: ['./registro.component.css'],
  template: `
   <div class="registro-container">
      <div class="registro-card">
        <h2 class="registro-title">Criar Conta</h2>

        <div class="user-type-selector">
          <label class="user-type-label">Tipo de Usuário</label>
          <select (change)="onTipoUsuarioChange($event)" class="user-type-select">
            <option value="">Selecione...</option>
            <option value="candidato">Candidato</option>
            <option value="empresa">Empresa</option>
          </select>
        </div>

        <form [formGroup]="registroForm" (ngSubmit)="onSubmit()" *ngIf="tipoUsuario" class="form-section">
          <div class="form-group">
            <label class="form-label">Usuário</label>
            <input type="text" formControlName="username" class="form-input" />
          </div>

          <div class="form-group">
            <label class="form-label">E-mail</label>
            <input type="email" formControlName="email" class="form-input" />
          </div>

          <div class="form-group">
            <label class="form-label">Senha</label>
            <input type="password" formControlName="password" class="form-input" />
          </div>

          <!-- Candidato -->
          <div *ngIf="tipoUsuario === 'candidato'" class="candidato-section">
            <div class="form-group">
              <label class="form-label">Nome Completo</label>
              <input type="text" formControlName="nome_completo" class="form-input" />
            </div>

            <div class="form-group">
              <label class="form-label">CPF</label>
              <input type="text" formControlName="cpf" class="form-input" />
            </div>
          </div>

          <!-- Empresa -->
          <div *ngIf="tipoUsuario === 'empresa'" class="empresa-section">
            <div class="form-group">
              <label class="form-label">Nome da Empresa</label>
              <input type="text" formControlName="nome_empresa" class="form-input" />
            </div>

            <div class="form-group">
              <label class="form-label">CNPJ</label>
              <input type="text" formControlName="cnpj" class="form-input" />
            </div>
          </div>

          <div class="form-group file-input-wrapper">
            <label class="form-label">Foto de Perfil</label>
            <input type="file" (change)="onFileSelect($event)" accept="image/*" class="file-input" />
          </div>

          <div *ngIf="error" class="error-message">{{ error }}</div>

          <button type="submit" [disabled]="registroForm.invalid || loading" class="registro-button">
            <span *ngIf="loading">Carregando...</span>
            <span *ngIf="!loading">Criar Conta</span>
          </button>
        </form>

        <div class="login-link">
          <a routerLink="/login">Já tem conta? Faça login</a>
        </div>
      </div>
    </div>
  `
})
export class RegistroComponent {
  registroForm: FormGroup;
  tipoUsuario = '';
  loading = false;
  error = '';
  selectedFile: File | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.registroForm = this.fb.group({
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      nome_completo: [''],
      cpf: [''],
      nome_empresa: [''],
      cnpj: ['']
    });
  }

  onTipoUsuarioChange(event: any) {
    this.tipoUsuario = event.target.value;
    this.updateValidators();
  }

  updateValidators() {
    if (this.tipoUsuario === 'candidato') {
      this.registroForm.get('nome_completo')?.setValidators([Validators.required]);
      this.registroForm.get('cpf')?.setValidators([Validators.required]);
      this.registroForm.get('nome_empresa')?.clearValidators();
      this.registroForm.get('cnpj')?.clearValidators();
    } else if (this.tipoUsuario === 'empresa') {
      this.registroForm.get('nome_empresa')?.setValidators([Validators.required]);
      this.registroForm.get('cnpj')?.setValidators([Validators.required]);
      this.registroForm.get('nome_completo')?.clearValidators();
      this.registroForm.get('cpf')?.clearValidators();
    }
    this.registroForm.updateValueAndValidity();
  }

  onFileSelect(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
    }
  }

  onSubmit() {
    if (this.registroForm.valid) {
      this.loading = true;
      this.error = '';
      const formData = new FormData();
      const formValue = this.registroForm.value;

      formData.append('username', formValue.username);
      formData.append('email', formValue.email);
      formData.append('password', formValue.password);
      formData.append('user_type', this.tipoUsuario); // ✅ corrigido aqui!

      if (this.tipoUsuario === 'candidato') {
        formData.append('nome_completo', formValue.nome_completo);
        formData.append('cpf', formValue.cpf);
      } else {
        formData.append('nome_empresa', formValue.nome_empresa);
        formData.append('cnpj', formValue.cnpj);
      }

      if (this.selectedFile) {
        formData.append('foto_perfil', this.selectedFile);
      }

      this.authService.register(formData).subscribe({
        next: () => this.router.navigate(['/login']),
        error: (err) => {
          this.error = 'Erro ao criar conta. Verifique os dados.';
          console.error('Erro no registro:', err.error); // para debug
          this.loading = false;
        }
      });
    }
  }
}
