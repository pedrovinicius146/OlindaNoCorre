import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from
'@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../shared/services/auth.service';
@Component({
selector: 'app-login',
standalone: true,
imports: [CommonModule, ReactiveFormsModule, RouterModule],
template: `
<div class="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
<h2 class="text-2xl font-bold text-center mb-6">Login</h2>
<form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
<div class="mb-4">
<label class="block text-gray-700 text-sm font-bold mb-2">
Usuário
</label>
<input type="text" formControlName="username"
class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none
focus:ring-2 focus:ring-blue-500">
<div *ngIf="loginForm.get('username')?.touched &&
loginForm.get('username')?.errors"
class="text-red-500 text-sm mt-1">
Campo obrigatório
</div>
</div>
<div class="mb-6">
<label class="block text-gray-700 text-sm font-bold mb-2">
Senha
</label>
<input type="password" formControlName="password"
class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none
focus:ring-2 focus:ring-blue-500">
<div *ngIf="loginForm.get('password')?.touched && loginForm.get('password')?.errors"
class="text-red-500 text-sm mt-1">
Campo obrigatório
</div>
</div>
<div *ngIf="error" class="text-red-500 text-sm mb-4">
{{ error }}
</div>
<button type="submit" [disabled]="loginForm.invalid || loading"
class="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700
disabled:opacity-50">
<span *ngIf="loading">Carregando...</span>
<span *ngIf="!loading">Entrar</span>
</button>
</form>
<div class="text-center mt-4">
<a routerLink="/registro" class="text-blue-600 hover:text-blue-800">
Criar conta
</a>
</div>
</div>
`
})
export class LoginComponent {
loginForm: FormGroup;
loading = false;
error = '';
constructor(
private fb: FormBuilder,
private authService: AuthService,
private router: Router
) {
this.loginForm = this.fb.group({
username: ['', Validators.required],
password: ['', Validators.required]
});
}
onSubmit() {
if (this.loginForm.valid) {
this.loading = true;
this.error = '';
this.authService.login(this.loginForm.value).subscribe({
next: () => {
this.authService.getCurrentUser().subscribe(user => {
if (user.tipo_usuario === 'empresa') {
this.router.navigate(['/empresa/vagas-em-aberto']);
} else {
this.router.navigate(['/pessoa/vagas']);
}
});
},
error: (err) => {
this.error = 'Credenciais inválidas';
this.loading = false;
}
});
}
}
}