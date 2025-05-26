import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VagaService } from '../../shared/services/vaga.service';
import { Candidatura } from '../../shared/models/models/models.component';
@Component({
selector: 'app-candidaturas',
standalone: true,
imports: [CommonModule],
template: `
<div class="max-w-4xl mx-auto">
<h2 class="text-2xl font-bold mb-6">📋 Minhas Candidaturas</h2>
<div *ngIf="loading" class="text-center py-8">
Carregando candidaturas...
</div>
<div *ngIf="!loading && candidaturas.length === 0" class="text-center py-8
text-gray-500">
Você ainda não se candidatou a nenhuma vaga.
<a routerLink="/pessoa/vagas" class="text-blue-600 hover:text-blue-800 ml-1">
Ver vagas disponíveis
</a>
</div>
<div class="space-y-4" *ngIf="!loading && candidaturas.length > 0">
<div *ngFor="let candidatura of candidaturas"
class="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
<div class="flex justify-between items-start mb-4">
<div>
<h3 class="text-lg font-semibold text-gray-900 mb-1">
{{ candidatura.vaga_detalhes?.titulo }}
</h3>
<p class="text-sm text-gray-600">
{{ candidatura.vaga_detalhes?.area_atuacao | titlecase }}
</p>
</div>
<div class="flex flex-col items-end space-y-2">
<span [class]="getStatusClass(candidatura.status)"
class="px-3 py-1 rounded-full text-xs font-medium">
{{ getStatusText(candidatura.status) }}
</span>
<span class="text-xs text-gray-500">
{{ candidatura.data_candidatura | date:'dd/MM/yyyy' }}
</span>
</div>
</div>
<div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
<div>
<h4 class="font-medium text-gray-700 mb-1">Requisitos da Vaga:</h4>
<p class="text-gray-600 line-clamp-3">{{ candidatura.vaga_detalhes?.requisitos
}}</p>
</div>
<div>
<h4 class="font-medium text-gray-700 mb-1">Sua Resposta:</h4>
<p class="text-gray-600 line-clamp-3">{{ candidatura.resposta_pergunta }}</p>
</div>
</div>
<div class="flex justify-between items-center mt-4 pt-4 border-t border-gray-200">
<div class="flex items-center space-x-4 text-sm text-gray-500">
<span *ngIf="candidatura.curriculo">📎 Currículo enviado</span>
<span *ngIf="candidatura.carta_apresentacao">📝 Carta enviada</span>
<span>💰 R$ {{ candidatura.vaga_detalhes?.expectativa_salarial | number:'1.2-2'
}}</span>
</div>
<button class="text-blue-600 hover:text-blue-800 text-sm font-medium">
Ver Detalhes
</button>
</div>
</div>
</div>
</div>
`
})
export class CandidaturasComponent implements OnInit {
candidaturas: Candidatura[] = [];
loading = true;
constructor(private vagaService: VagaService) {}
ngOnInit() {
this.carregarCandidaturas();
}
carregarCandidaturas() {
this.vagaService.listarCandidaturas().subscribe({
next: (candidaturas) => {
this.candidaturas = candidaturas;
this.loading = false;
},
error: (err) => {
console.error('Erro ao carregar candidaturas:', err);
this.loading = false;
}
});
}
getStatusClass(status: string): string {
switch (status) {
case 'aguardando':
return 'bg-yellow-100 text-yellow-800';
case 'selecionado':
return 'bg-green-100 text-green-800';
case 'rejeitado':
return 'bg-red-100 text-red-800';
default:
return 'bg-gray-100 text-gray-800';
}
}
getStatusText(status: string): string {
switch (status) {
case 'aguardando':
return '⏳ Aguardando';
case 'selecionado':
return '✅ Selecionado';
case 'rejeitado':
return '❌ Rejeitado';
default:
return status;
}
}
}