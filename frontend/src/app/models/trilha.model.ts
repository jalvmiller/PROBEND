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
  totalQuestoes: number;
  itens?: ItemTrilha[];
}
