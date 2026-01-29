import type { Id } from '../../convex/_generated/dataModel';

export type KanbanStatus =
  | 'a_contatar'
  | 'contato_realizado'
  | 'negociando'
  | 'convertido'
  | 'sem_interesse';

export interface EmpresaKanban {
  id: number;
  _id: Id<"empresas">;
  titulo: string;
  endereco?: string;
  categoria?: string;
  telefone?: string;
  website?: string;
  avaliacao?: number;
  total_avaliacoes?: number;
  totalAvaliacoes?: number;
  status: KanbanStatus;
  pesquisa?: string;
  links_agendamento?: string;
}

export interface KanbanColumn {
  id: KanbanStatus;
  title: string;
  icon: string;
  color: string;
  items: EmpresaKanban[];
}

export interface KanbanState {
  columns: Record<KanbanStatus, KanbanColumn>;
  empresaStatus: Record<number, KanbanStatus>;
}

export interface KanbanFilters {
  tipo: string;
  cidade: string;
}

export const KANBAN_COLUMNS: KanbanColumn[] = [
  {
    id: 'a_contatar',
    title: 'A Contatar',
    icon: '🎯',
    color: 'from-blue-500 to-blue-600',
    items: []
  },
  {
    id: 'contato_realizado',
    title: 'Contatado',
    icon: '📨',
    color: 'from-yellow-500 to-yellow-600',
    items: []
  },
  {
    id: 'negociando',
    title: 'Negociando',
    icon: '💬',
    color: 'from-purple-500 to-purple-600',
    items: []
  },
  {
    id: 'convertido',
    title: 'Convertido',
    icon: '🏆',
    color: 'from-green-500 to-green-600',
    items: []
  },
  {
    id: 'sem_interesse',
    title: 'Sem Interesse',
    icon: '❌',
    color: 'from-red-500 to-red-600',
    items: []
  }
];
