/**
 * Modelos e Contratos para o Módulo de Perfil e Atividades do Usuário
 */

export interface AtualizarPerfilRequest {
  nome: string;
  email: string;
}

export interface AlterarSenhaRequest {
  senhaAtual: string;
  novaSenha: string;
  confirmacaoSenha?: string;
}

export interface MinhaResolucao {
  id: number;
  conteudo: string;
  trechoCodigo?: string;
  linguagemCodigo?: string;
  upvotes: number;
  verificadoPorEspecialista: boolean;
  qtdComentarios: number;
  dataCriacao: string;
  questaoId: number;
  questaoEnunciado: string;
  questaoMateria: string;
}

export interface MeuComentario {
  id: number;
  conteudo: string;
  dataCriacao: string;
  resolucaoId: number;
  questaoId: number;
  questaoEnunciado: string;
}

export type PainelSidebar = 'menu' | 'questoes' | 'resolucoes' | 'comentarios';
export type PainelSecundario = 'questoes' | 'resolucoes' | 'comentarios' | null;
