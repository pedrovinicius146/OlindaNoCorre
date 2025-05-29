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
export interface Candidatura {
id?: number;
vaga: number;
candidato: number;
resposta_pergunta: string;
curriculo?: File;
carta_apresentacao?: string;
status: 'aguardando' | 'selecionado' | 'rejeitado';
data_candidatura?: string;
vaga_detalhes?: Vaga;
}
