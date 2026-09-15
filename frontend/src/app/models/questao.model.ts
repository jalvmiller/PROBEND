import { Usuario } from './auth.model';

export type Dificuldade = number | string;

export function getDificuldadeTexto(dif: number | string | undefined): string {
  if (dif === 2 || dif === '2' || dif === 'DIFICIL') return 'Difícil';
  if (dif === 1 || dif === '1' || dif === 'MEDIO' || dif === 'MEDIA') return 'Médio';
  return 'Fácil';
}

export function getDificuldadeClasse(dif: number | string | undefined): string {
  if (dif === 2 || dif === '2' || dif === 'DIFICIL') return 'badge-dificil';
  if (dif === 1 || dif === '1' || dif === 'MEDIO' || dif === 'MEDIA') return 'badge-media';
  return 'badge-facil';
}

export interface Tag {
  id?: number;
  nome: string;
}

export interface Comentario {
  id: number;
  conteudo: string;
  autor: Usuario;
  dataCriacao?: string;
}

export interface Resolucao {
  id: number;
  conteudo: string;
  trechoCodigo?: string;
  linguagemCodigo?: string;
  autor: Usuario;
  upvotes?: number;
  upvotesCount?: number;
  qtdComentarios?: number;
  comentarios?: Comentario[];
  dataCriacao?: string;
  criadoEm?: string;
}

export interface Questao {
  id: number;
  titulo?: string;
  enunciado: string;
  materia?: string;
  assunto?: string;
  dificuldade: Dificuldade;
  solucionada?: boolean;
  fonte?: string;
  trechoCodigo?: string;
  linguagemCodigo?: string;
  tags?: Tag[] | string[];
  imagemUrl?: string;
  autor?: Usuario;
  resolucoes?: Resolucao[];
  upvotes?: number;
  upvotesCount?: number;
  resolucoesCount?: number;
  numeroResolucoes?: number;
  dataInsercao?: string;
  criadoEm?: string;
}

export interface QuestaoRequest {
  titulo?: string;
  enunciado: string;
  materia: string;
  assunto?: string;
  dificuldade: Dificuldade;
  fonte?: string;
  trechoCodigo?: string;
  linguagemCodigo?: string;
  imagemUrl?: string;
  tags?: string[];
}

export interface UpvoteResponse {
  upvotes: number;
  upvoted: boolean;
}
