import { Usuario } from './auth.model';

export interface ItemTrilhaSlot {
  itemId: number;
  numero: number;
  questaoId: number;
  titulo: string;
  concluida: boolean;
}

export interface TrilhaAtiva {
  trilhaId: number;
  titulo: string;
  totalQuestoes: number;
  concluidas: number;
  slots: ItemTrilhaSlot[];
}

export interface ItemTrilha {
  id: number;
  ordem: number;
  questaoId: number;
  questaoTitulo: string;
  materia: string;
  assunto?: string;
  dificuldade: number;
  concluido: boolean;
}

export interface TrilhaResumo {
  id: number;
  titulo: string;
  descricao?: string;
  publica: boolean;
  criadoEm: string;
  autor?: Usuario;
  totalQuestoes: number;
  concluidas?: number;
  ativa?: boolean;
  itens?: ItemTrilha[];
}
