// src/app/pages/auth/escolher-perfil.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';

@Component({
  selector: 'app-escolher-perfil',
  standalone: true,
  imports: [CommonModule, RouterModule],
  styleUrls: ['./escolher-perfil.component.css'],
  template: `
    <div class="escolher-perfil-container">
      <div class="escolher-perfil-card">
        <h2 class="escolher-perfil-title">👋 Bem-vindo! Escolha seu perfil:</h2>

        <div class="buttons-wrapper">
          <button (click)="irParaEmpresa()" class="perfil-button empresa-button">
            Sou Empresa
          </button>
          <button (click)="irParaCandidato()" class="perfil-button candidato-button">
            Sou Candidato
          </button>
        </div>
      </div>
    </div>
  `
})
export class EscolherPerfilComponent {
  constructor(private router: Router) {}

  irParaEmpresa(): void {
    this.router.navigate(['/empresa/vagas-em-aberto']);
  }

  irParaCandidato(): void {
    this.router.navigate(['/pessoa/vagas']);
  }
}
