import { Usuario } from './auth.model';

export type Dificuldade = 'FACIL' | 'MEDIA' | 'DIFICIL';

export interface Tag {
  id?: number;
  nome: string;
}

export interface Resolucao {
  id: number;
  conteudo: string;
  codigo?: string;
  linguagemCodigo?: string;
  autor: Usuario;
  upvotesCount?: number;
  criadoEm: string;
}

export interface Questao {
  id: number;
  titulo: string;
  enunciado: string;
  dificuldade: Dificuldade;
  tags?: Tag[] | string[];
  imagemUrl?: string;
  autor?: Usuario;
  resolucoes?: Resolucao[];
  upvotesCount?: number;
  resolucoesCount?: number;
  criadoEm?: string;
}
