export interface Usuario {
id?: number;
username: string;
email: string;
tipo_usuario: 'empresa' | 'candidato';
foto_perfil?: string;
}
export interface Empresa extends Usuario {
nome_empresa: string;
cnpj: string;
}
export interface Candidato extends Usuario {
nome_completo: string;
cpf: string;
}
export interface Vaga {
area_atuacao_nome: any;
id?: number;
empresa: number;
titulo: string;
requisitos: string;
pergunta_personalizada: string;
expectativa_salarial: number;
foto_vaga?: string;
area_atuacao: string;
data_criacao?: string;
ativa: boolean;
total_candidaturas?: number;
 salario_min?: number; // ✅ Adicione esta linha
  salario_max?: number;
  salario_a_combinar?: boolean;
  status: 'aberta' | 'fechada' | 'pausada';
}
// src/app/shared/models/models/models.component.ts

export interface Candidatura {
  id: string;
  vaga: string | { id: string; titulo: string; empresa_nome: string; area_atuacao_nome: string; requisitos: string; salario_min: number | null; }; 
  vaga_id?: string;        // às vezes a resposta inclui vaga_id em vez de objeto aninhado
  vaga_titulo?: string;    // serializer expõe "vaga_titulo"
  vaga_empresa?: string;   // serializer expõe "vaga_empresa"
  status: 'aguardando' | 'em_analise' | 'selecionado' | 'rejeitado' | 'contratado';
  resposta_pergunta?: string;
  curriculum_especifico?: string;  // URL do PDF enviado
  carta_apresentacao?: string;     // Texto / URL, se houver
  data_candidatura?: string;       // ISO string
  // … outras propriedades que você queira exibir …
}

export interface AreaAtuacao {
  id: number;
  nome: string;
  descricao?: string;
  ativo: boolean;
}