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
styleUrls: ['./login.component.css'],
template: `
 <div class="login-container">
      <div class="login-card">
        <h2 class="login-title">Login</h2>

        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label class="form-label">Usuário</label>
            <input type="text" formControlName="username" class="form-input" />
            <div *ngIf="loginForm.get('username')?.touched && loginForm.get('username')?.errors" class="error-message">
              Campo obrigatório
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Senha</label>
            <input type="password" formControlName="password" class="form-input" />
            <div *ngIf="loginForm.get('password')?.touched && loginForm.get('password')?.errors" class="error-message">
              Campo obrigatório
            </div>
          </div>

          <div *ngIf="error" class="error-message">
            {{ error }}
          </div>

          <button type="submit" [disabled]="loginForm.invalid || loading" class="login-button">
            <span *ngIf="loading">
              <span class="loading-spinner"></span> Carregando...
            </span>
            <span *ngIf="!loading">Entrar</span>
          </button>
        </form>

        <div class="register-link">
          <a routerLink="/registro">Criar conta</a>
        </div>
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