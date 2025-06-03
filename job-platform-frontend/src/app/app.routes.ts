
import { Routes } from '@angular/router';
import { AuthGuard } from '../shared/guards/auth.guard';
import { EscolherPerfilComponent } from '../pages/escolher-perfil/escolher-perfil.component';
export const routes: Routes = [
{ path: '', redirectTo: '/login', pathMatch: 'full' },
{
path: 'login',
loadComponent: () => import('../pages/auth/login.component').then(m =>
m.LoginComponent)
},
{
path: 'registro',
loadComponent: () => import('../pages/auth/registro.component').then(m =>
m.RegistroComponent)
},
{
path: 'empresa/criar-vaga',
loadComponent: () => import('../pages/empresa/criar-vaga.component').then(m=> m.CriarVagaComponent),
canActivate: [AuthGuard]
},
{
path: 'empresa/vagas-em-aberto',
loadComponent: () =>
import('../pages/empresa/vagas-em-aberto.component').then(m =>
m.VagasEmAbertoComponent),
canActivate: [AuthGuard]
},
{
path: 'pessoa/perfil',
loadComponent: () => import('../pages/pessoa/perfil.component').then(m =>
m.PerfilComponent),
canActivate: [AuthGuard]
},
{
path: 'pessoa/vagas',
loadComponent: () => import('../pages/pessoa/vagas.component').then(m =>
m.VagasComponent),
canActivate: [AuthGuard]
},
{
path: 'pessoa/candidaturas',
loadComponent: () =>
import('../pages/pessoa/candidaturas.component').then(m =>
m.PessoaCandidaturasComponent),
canActivate: [AuthGuard]
},
 {
    path: 'escolher-perfil',
    component: EscolherPerfilComponent,
  },
];