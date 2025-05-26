import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { VagaService } from '../../shared/services/vaga.service';
import { Vaga } from '../../shared/models/models/models.component';
@Component({
selector: 'app-vagas',
standalone: true,
imports: [CommonModule, ReactiveFormsModule],
template: `
<div class="max-w-6xl mx-auto">
<h2 class="text-2xl font-bold mb-6">🔍 Vagas Disponíveis</h2>
<!-- Filtros -->
<div class="bg-white rounded-lg shadow-md p-4 mb-6">
<form [formGroup]="filtroForm" (ngSubmit)="aplicarFiltros()">
<div class="flex flex-wrap gap-4 items-end">
<div class="flex-1 min-w-48">
<label class="block text-gray-700 text-sm font-bold mb-2">
🏢 Área de Atuação
</label>
<select formControlName="area_atuacao"
class="w-full px-3 py-2 border border-gray-300 rounded-md">
<option value="">Todas as áreas</option>
<option value="tecnologia">Tecnologia</option>
<option value="administracao">Administração</option>
<option value="saude">Saúde</option>
<option value="educacao">Educação</option>
<option value="vendas">Vendas</option>
<option value="marketing">Marketing</option>
<option value="recursos_humanos">Recursos Humanos</option>
<option value="financeiro">Financeiro</option>
</select>
</div>
<div class="flex-1 min-w-48">
<label class="block text-gray-700 text-sm font-bold mb-2">
💰 Salário Mínimo
</label>
<input type="number" formControlName="salario_minimo"
class="w-full px-3 py-2 border border-gray-300 rounded-md"
placeholder="0,00">
</div>
<button type="submit"
class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
🔍 Filtrar
</button>
<button type="button" (click)="limparFiltros()"
class="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600">
🗑 Limpar
</button>
</div>
</form>
</div>
<div *ngIf="loading" class="text-center py-8">
Carregando vagas...
</div>
<div *ngIf="!loading && vagas.length === 0" class="text-center py-8 text-gray-500">
Nenhuma vaga encontrada com os filtros aplicados.
</div>
<!-- Lista de Vagas -->
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
<span class="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full
whitespace-nowrap ml-2">
{{ vaga.area_atuacao | titlecase }}
</span>
</div>
<p class="text-gray-600 text-sm mb-3 line-clamp-3">
{{ vaga.requisitos }}
</p>
<div class="flex justify-between items-center text-sm text-gray-500 mb-4">
<span>💰 R$ {{ vaga.expectativa_salarial | number:'1.2-2' }}</span>
<span>📅 {{ vaga.data_criacao | date:'dd/MM/yyyy' }}</span>
</div>
<button (click)="abrirModalCandidatura(vaga)"
class="w-full bg-green-600 text-white py-2 px-4 rounded-md
hover:bg-green-700 transition-colors">
📝 Candidatar-se
</button>
</div>
</div>
</div>
</div>
<!-- Modal de Candidatura -->
<div *ngIf="modalAberto" class="fixed inset-0 bg-black bg-opacity-50 flex items-center
justify-center z-50">
<div class="bg-white rounded-lg p-6 max-w-md w-full mx-4 max-h-96 overflow-y-auto">
<h3 class="text-xl font-bold mb-4">Candidatar-se à vaga</h3>
<div class="mb-4">
<h4 class="font-semibold text-gray-800">{{ vagaSelecionada?.titulo }}</h4>
<p class="text-sm text-gray-600">{{ vagaSelecionada?.area_atuacao | titlecase }}</p>
</div>
<form [formGroup]="candidaturaForm" (ngSubmit)="enviarCandidatura()">
<div class="mb-4">
<label class="block text-gray-700 text-sm font-bold mb-2">
{{ vagaSelecionada?.pergunta_personalizada }}
</label>
<textarea formControlName="resposta_pergunta" rows="3"
class="w-full px-3 py-2 border border-gray-300 rounded-md"
placeholder="Sua resposta..."></textarea>
</div>
<div class="mb-4">
<label class="block text-gray-700 text-sm font-bold mb-2">
📎 Currículo (PDF)
</label>
<input type="file" (change)="onCurriculoSelect($event)" accept=".pdf"
class="w-full px-3 py-2 border border-gray-300 rounded-md">
</div>
<div class="mb-6">
<label class="block text-gray-700 text-sm font-bold mb-2">
📝 Carta de Apresentação (opcional)
</label>
<textarea formControlName="carta_apresentacao" rows="3"
class="w-full px-3 py-2 border border-gray-300 rounded-md"
placeholder="Conte um pouco sobre você..."></textarea>
</div>
<div *ngIf="errorCandidatura" class="text-red-500 text-sm mb-4">
{{ errorCandidatura }}
</div>
<div class="flex space-x-4">
<button type="submit" [disabled]="candidaturaForm.invalid || loadingCandidatura"
class="flex-1 bg-green-600 text-white py-2 px-4 rounded-md
hover:bg-green-700 disabled:opacity-50">
<span *ngIf="loadingCandidatura">Enviando...</span>
<span *ngIf="!loadingCandidatura">📤 Enviar Candidatura</span>
</button>
<button type="button" (click)="fecharModal()"
class="flex-1 bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-600">
Cancelar
</button>
</div>
</form>
</div>
</div>
`
})
export class VagasComponent implements OnInit {
vagas: Vaga[] = [];
loading = true;
filtroForm: FormGroup;
modalAberto = false;
vagaSelecionada: Vaga | null = null;
candidaturaForm: FormGroup;
loadingCandidatura = false;
errorCandidatura = '';
selectedCurriculo: File | null = null;
constructor(
private fb: FormBuilder,
private vagaService: VagaService
) {
this.filtroForm = this.fb.group({
area_atuacao: [''],
salario_minimo: ['']
});
this.candidaturaForm = this.fb.group({
resposta_pergunta: ['', Validators.required],
carta_apresentacao: ['']
});
}
ngOnInit() {
this.carregarVagas();
}
carregarVagas() {
this.loading = true;
const filtros = this.filtroForm.value;
// Remove campos vazios
Object.keys(filtros).forEach(key => {
if (!filtros[key]) {
delete filtros[key];
}
});
this.vagaService.listarVagas(filtros).subscribe({
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
aplicarFiltros() {
this.carregarVagas();
}
limparFiltros() {
this.filtroForm.reset();
this.carregarVagas();
}
abrirModalCandidatura(vaga: Vaga) {
this.vagaSelecionada = vaga;
this.modalAberto = true;
this.candidaturaForm.reset();
this.selectedCurriculo = null;
this.errorCandidatura = '';
}
fecharModal() {
this.modalAberto = false;
this.vagaSelecionada = null;
}
onCurriculoSelect(event: any) {
const file = event.target.files[0];
if (file) {
this.selectedCurriculo = file;
}
}
enviarCandidatura() {
if (this.candidaturaForm.valid && this.vagaSelecionada) {
this.loadingCandidatura = true;
this.errorCandidatura = '';
const formData = new FormData();
formData.append('vaga', this.vagaSelecionada.id!.toString());
formData.append('resposta_pergunta',
this.candidaturaForm.get('resposta_pergunta')?.value);
const cartaApresentacao = this.candidaturaForm.get('carta_apresentacao')?.value;
if (cartaApresentacao) {
formData.append('carta_apresentacao', cartaApresentacao);
}
if (this.selectedCurriculo) {
formData.append('curriculo', this.selectedCurriculo);
}
this.vagaService.candidatarSeVaga(formData).subscribe({
next: () => {
this.fecharModal();
// Mostrar mensagem de sucesso
},
error: (err) => {
this.errorCandidatura = 'Erro ao enviar candidatura. Tente novamente.';
this.loadingCandidatura = false;
}
});
}
}
}