import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Usuario } from '../models/models/models.component';
@Component({
selector: 'app-navbar',
standalone: true,
imports: [CommonModule, RouterModule],
template: `
<nav class="bg-blue-600 text-white shadow-lg">
<div class="container mx-auto px-4">
<div class="flex justify-between items-center py-4">
<div class="text-xl font-bold">
JobPlatform
</div>
<div class="flex items-center space-x-4" *ngIf="currentUser">
<div class="flex items-center space-x-2">
<img [src]="currentUser.foto_perfil || '/api/placeholder/32/32'"
alt="Profile" class="w-8 h-8 rounded-full">
<span>{{ currentUser.username }}</span>
</div>
<div class="flex space-x-4" *ngIf="currentUser.tipo_usuario === 'empresa'">
<a routerLink="/empresa/criar-vaga"
class="hover:text-blue-200 transition-colors">Criar Vaga</a>
<a routerLink="/empresa/vagas-em-aberto"
class="hover:text-blue-200 transition-colors">Minhas Vagas</a>
</div>
<div class="flex space-x-4" *ngIf="currentUser.tipo_usuario === 'candidato'">
<a routerLink="/pessoa/perfil"
class="hover:text-blue-200 transition-colors">Perfil</a>
<a routerLink="/pessoa/vagas"
class="hover:text-blue-200 transition-colors">Vagas</a>
<a routerLink="/pessoa/candidaturas"
class="hover:text-blue-200 transition-colors">Candidaturas</a>
</div>
<button (click)="logout()"
class="bg-red-500 hover:bg-red-600 px-3 py-1 rounded transition-colors">
Sair
</button>
</div>
</div>
</div>
</nav>
`
})
export class NavbarComponent implements OnInit {
currentUser: Usuario | null = null;
constructor(
private authService: AuthService,
private router: Router
) {}
ngOnInit() {
this.authService.currentUser$.subscribe(user => {
this.currentUser = user;
});
}
logout() {
this.authService.logout();
this.router.navigate(['/login']);
}
}