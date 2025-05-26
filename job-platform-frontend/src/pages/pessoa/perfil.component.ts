import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from
'@angular/forms';
import { AuthService } from '../../shared/services/auth.service';
import { Usuario } from '../../shared/models/models/models.component';
@Component({
selector: 'app-perfil',
standalone: true,
imports: [CommonModule, ReactiveFormsModule],
template: `
<div class="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
<h2 class="text-2xl font-bold mb-6">👤 Meu Perfil</h2>
<div class="flex items-center space-x-4 mb-6" *ngIf="currentUser">
<div class="h-20 w-20 bg-gray-200 rounded-full flex items-center justify-center
overflow-hidden">
<img *ngIf="currentUser.foto_perfil" [src]="currentUser.foto_perfil"
alt="Foto de perfil" class="w-full h-full object-cover">
<span *ngIf="!currentUser.foto_perfil" class="text-gray-400 text-2xl">👤</span>
</div>
<div>
<h3 class="text-xl font-semibold">{{ currentUser.username }}</h3>
<p class="text-gray-600">{{ currentUser.email }}</p>
<span class="bg-blue-100 text-blue-800 text-sm px-2 py-1 rounded-full">
{{ currentUser.tipo_usuario === 'candidato' ? 'Candidato' : 'Empresa' }}
</span>
</div>
</div>
<form [formGroup]="perfilForm" (ngSubmit)="onSubmit()">
<div class="mb-4">
<label class="block text-gray-700 text-sm font-bold mb-2">
Nome de Usuário
</label>
<input type="text" formControlName="username"
class="w-full px-3 py-2 border border-gray-300 rounded-md">
</div>
<div class="mb-4">
<label class="block text-gray-700 text-sm font-bold mb-2">
E-mail
</label>
<input type="email" formControlName="email"
class="w-full px-3 py-2 border border-gray-300 rounded-md">
</div>
<div class="mb-4" *ngIf="currentUser?.tipo_usuario === 'candidato'">
<label class="block text-gray-700 text-sm font-bold mb-2">
Nome Completo
</label>
<input type="text" formControlName="nome_completo"
class="w-full px-3 py-2 border border-gray-300 rounded-md">
</div>
<div class="mb-4">
<label class="block text-gray-700 text-sm font-bold mb-2">
Nova Foto de Perfil
</label>
<input type="file" (change)="onFileSelect($event)" accept="image/*"
class="w-full px-3 py-2 border border-gray-300 rounded-md">
</div>
<div class="mb-6">
<label class="block text-gray-700 text-sm font-bold mb-2">
Nova Senha (deixe em branco para manter a atual)
</label>
<input type="password" formControlName="password"
class="w-full px-3 py-2 border border-gray-300 rounded-md">
</div>
<div *ngIf="message" [class]="messageType === 'success' ? 'text-green-600' :
'text-red-600'"
class="text-sm mb-4">
{{ message }}
</div>
<button type="submit" [disabled]="perfilForm.invalid || loading"
class="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700
disabled:opacity-50">
<span *ngIf="loading">Salvando...</span>
<span *ngIf="!loading">💾 Salvar Alterações</span>
</button>
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
private authService: AuthService
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
// Simular atualização do perfil
setTimeout(() => {
this.message = 'Perfil atualizado com sucesso!';
this.messageType = 'success';
this.loading = false;
}, 1000);
}
}
}
