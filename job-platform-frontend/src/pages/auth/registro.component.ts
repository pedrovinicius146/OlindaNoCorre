import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../shared/services/auth.service';

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
  <div class="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
    <h2 class="text-2xl font-bold text-center mb-6">Criar Conta</h2>

    <div class="mb-4">
      <label class="block text-gray-700 text-sm font-bold mb-2">Tipo de Usuário</label>
      <select (change)="onTipoUsuarioChange($event)" class="w-full px-3 py-2 border border-gray-300 rounded-md">
        <option value="">Selecione...</option>
        <option value="candidato">Candidato</option>
        <option value="empresa">Empresa</option>
      </select>
    </div>

    <form [formGroup]="registroForm" (ngSubmit)="onSubmit()" *ngIf="tipoUsuario">
      <div class="mb-4">
        <label class="block text-gray-700 text-sm font-bold mb-2">Usuário</label>
        <input type="text" formControlName="username" class="w-full px-3 py-2 border border-gray-300 rounded-md">
      </div>

      <div class="mb-4">
        <label class="block text-gray-700 text-sm font-bold mb-2">E-mail</label>
        <input type="email" formControlName="email" class="w-full px-3 py-2 border border-gray-300 rounded-md">
      </div>

      <div class="mb-4">
        <label class="block text-gray-700 text-sm font-bold mb-2">Senha</label>
        <input type="password" formControlName="password" class="w-full px-3 py-2 border border-gray-300 rounded-md">
      </div>

      <!-- Candidato -->
      <div *ngIf="tipoUsuario === 'candidato'">
        <div class="mb-4">
          <label class="block text-gray-700 text-sm font-bold mb-2">Nome Completo</label>
          <input type="text" formControlName="nome_completo" class="w-full px-3 py-2 border border-gray-300 rounded-md">
        </div>

        <div class="mb-4">
          <label class="block text-gray-700 text-sm font-bold mb-2">CPF</label>
          <input type="text" formControlName="cpf" class="w-full px-3 py-2 border border-gray-300 rounded-md">
        </div>
      </div>

      <!-- Empresa -->
      <div *ngIf="tipoUsuario === 'empresa'">
        <div class="mb-4">
          <label class="block text-gray-700 text-sm font-bold mb-2">Nome da Empresa</label>
          <input type="text" formControlName="nome_empresa" class="w-full px-3 py-2 border border-gray-300 rounded-md">
        </div>

        <div class="mb-4">
          <label class="block text-gray-700 text-sm font-bold mb-2">CNPJ</label>
          <input type="text" formControlName="cnpj" class="w-full px-3 py-2 border border-gray-300 rounded-md">
        </div>
      </div>

      <div class="mb-4">
        <label class="block text-gray-700 text-sm font-bold mb-2">Foto de Perfil</label>
        <input type="file" (change)="onFileSelect($event)" accept="image/*" class="w-full px-3 py-2 border border-gray-300 rounded-md">
      </div>

      <div *ngIf="error" class="text-red-500 text-sm mb-4">{{ error }}</div>

      <button type="submit" [disabled]="registroForm.invalid || loading"
              class="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:opacity-50">
        <span *ngIf="loading">Carregando...</span>
        <span *ngIf="!loading">Criar Conta</span>
      </button>
    </form>

    <div class="text-center mt-4">
      <a routerLink="/login" class="text-blue-600 hover:text-blue-800">Já tem conta? Faça login</a>
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
