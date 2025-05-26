import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from
'@angular/forms';
import { Router } from '@angular/router';
import { VagaService } from '../../shared/services/vaga.service';
@Component({
selector: 'app-criar-vaga',
standalone: true,
imports: [CommonModule, ReactiveFormsModule],
template: `
<div class="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
<h2 class="text-2xl font-bold mb-6">📋 Criar Nova Vaga</h2>
<form [formGroup]="vagaForm" (ngSubmit)="onSubmit()">
<div class="mb-4">
<label class="block text-gray-700 text-sm font-bold mb-2">
📷 Foto da Vaga
</label>
<input type="file" (change)="onFileSelect($event)" accept="image/*"
class="w-full px-3 py-2 border border-gray-300 rounded-md">
</div>
<div class="mb-4">
<label class="block text-gray-700 text-sm font-bold mb-2">
📋 Nome da Vaga
</label>
<input type="text" formControlName="titulo"
class="w-full px-3 py-2 border border-gray-300 rounded-md">
</div>
<div class="mb-4">
<label class="block text-gray-700 text-sm font-bold mb-2">
🏢 Área de Atuação
</label>
<select formControlName="area_atuacao"
class="w-full px-3 py-2 border border-gray-300 rounded-md">
<option value="">Selecione...</option>
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
<div class="mb-4">
<label class="block text-gray-700 text-sm font-bold mb-2">
🧾 Requisitos da Vaga
</label>
<textarea formControlName="requisitos" rows="4"
class="w-full px-3 py-2 border border-gray-300 rounded-md"
placeholder="Descreva os requisitos necessários para a vaga..."></textarea>
</div>
<div class="mb-4">
<label class="block text-gray-700 text-sm font-bold mb-2">
💬 Pergunta Personalizada para o Candidato
</label>
<input type="text" formControlName="pergunta_personalizada"
class="w-full px-3 py-2 border border-gray-300 rounded-md"
placeholder="Ex: Por que você se interessou por esta vaga?">
</div>
<div class="mb-6">
<label class="block text-gray-700 text-sm font-bold mb-2">
💸 Expectativa Salarial (R$)
</label>
<input type="number" formControlName="expectativa_salarial"
class="w-full px-3 py-2 border border-gray-300 rounded-md"
placeholder="0,00">
</div>
<div *ngIf="error" class="text-red-500 text-sm mb-4">
{{ error }}
</div>
<div class="flex space-x-4">
<button type="submit" [disabled]="vagaForm.invalid || loading"
class="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700
disabled:opacity-50">
<span *ngIf="loading">Criando...</span>
<span *ngIf="!loading">📤 Criar Vaga</span>
</button>
<button type="button" (click)="cancelar()"
class="flex-1 bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-600">
Cancelar
</button>
</div>
</form>
</div>
`
})
export class CriarVagaComponent {
vagaForm: FormGroup;
loading = false;
error = '';
selectedFile: File | null = null;
constructor(
private fb: FormBuilder,
private vagaService: VagaService,
private router: Router
) {
this.vagaForm = this.fb.group({
titulo: ['', Validators.required],
area_atuacao: ['', Validators.required],
requisitos: ['', Validators.required],
pergunta_personalizada: ['', Validators.required],
expectativa_salarial: ['', [Validators.required, Validators.min(0)]]
});
}
onFileSelect(event: any) {
const file = event.target.files[0];
if (file) {
this.selectedFile = file;
}
}
onSubmit() {
if (this.vagaForm.valid) {
this.loading = true;
this.error = '';
const formData = new FormData();
const formValue = this.vagaForm.value;
Object.keys(formValue).forEach(key => {
formData.append(key, formValue[key]);
});
if (this.selectedFile) {
formData.append('foto_vaga', this.selectedFile);
}
this.vagaService.criarVaga(formData).subscribe({
next: () => {
this.router.navigate(['/empresa/vagas-em-aberto']);
},
error: (err) => {
this.error = 'Erro ao criar vaga. Tente novamente.';
this.loading = false;
}
});
}
}
cancelar() {
this.router.navigate(['/empresa/vagas-em-aberto']);
}
}