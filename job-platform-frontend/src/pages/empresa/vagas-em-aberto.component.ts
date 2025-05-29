import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { VagaService } from '../../shared/services/vaga.service';
import { Vaga } from '../../shared/models/models/models.component';
@Component({
selector: 'app-vagas-em-aberto',
standalone: true,
imports: [CommonModule],
template: `
<div class="max-w-6xl mx-auto">
<div class="flex justify-between items-center mb-6">
<h2 class="text-2xl font-bold">📋 Minhas Vagas em Aberto</h2>
<button (click)="criarNovaVaga()"
class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
➕ Nova Vaga
</button>
</div>
<div *ngIf="loading" class="text-center py-8">
Carregando vagas...
</div>
<div *ngIf="!loading && vagas.length === 0" class="text-center py-8 text-gray-500">
Nenhuma vaga criada ainda.
<button (click)="criarNovaVaga()" class="text-blue-600 hover:text-blue-800 ml-1">
Criar primeira vaga
</button>
</div>
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" *ngIf="!loading &&
vagas.length > 0">
<div *ngFor="let vaga of vagas"
class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg
transition-shadow">
<div class="h-48 bg-gray-200 flex items-center justify-center">
<img *ngIf="vaga.foto_vaga" [src]="vaga.foto_vaga"
[alt]="vaga.titulo" class="w-full h-full object-cover">
<div *ngIf="!vaga.foto_vaga" class="text-gray-400">
📷 Sem foto
</div>
</div>
<div class="p-4">
<div class="flex justify-between items-start mb-2">
<h3 class="text-lg font-semibold text-gray-900 line-clamp-2">
{{ vaga.titulo }}
</h3>
<span class="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full
whitespace-nowrap ml-2">
{{ vaga.area_atuacao_nome || 'Área desconhecida' }}

</span>
</div>
<p class="text-gray-600 text-sm mb-3 line-clamp-3">
{{ vaga.requisitos }}
</p>
<div class="flex justify-between items-center text-sm text-gray-500 mb-3">
<span>💰 R$ {{ vaga.salario_min | number:'1.2-2' }}</span>
<span>📅 {{ vaga.data_criacao | date:'dd/MM/yyyy' }}</span>
</div>
<div class="flex justify-between items-center">
<div class="flex items-center space-x-2">
<span class="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
👥 {{ vaga.total_candidaturas || 0 }} candidato(s)
</span>
<span [class]="vaga.ativa ? 'bg-green-100 text-green-800' : 'bg-red-100
text-red-800'"
class="text-xs px-2 py-1 rounded-full">
<span [class]="vaga.status === 'aberta' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'"
      class="text-xs px-2 py-1 rounded-full">
  {{ vaga.status === 'aberta' ? '✅ Ativa' : (vaga.status === 'fechada' ? '❌ Fechada' : '⏸️ Pausada') }}
</span>

</span>
</div>
<button class="text-blue-600 hover:text-blue-800 text-sm font-medium">
Ver Detalhes
</button>
</div>
</div>
</div>
</div>
</div>
`
})
export class VagasEmAbertoComponent implements OnInit {
vagas: Vaga[] = [];
loading = true;
constructor(
private vagaService: VagaService,
private router: Router
) {}
ngOnInit() {
this.carregarVagas();
}
carregarVagas() {
this.vagaService.listarVagasEmpresa().subscribe({
next: (vagas) => {
this.vagas = vagas;
this.loading = false;
},
error: (err) => {
console.error('Erro ao carregar vagas:', err);
this.loading = false;
}
});
}
criarNovaVaga() {
this.router.navigate(['/empresa/criar-vaga']);
}
}
