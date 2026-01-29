import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { KanbanCard } from './KanbanCard';
import type { KanbanColumn as IKanbanColumn, EmpresaKanban } from '../../types/kanban';

interface KanbanColumnProps {
  column: IKanbanColumn;
  onWhatsApp?: (empresa: EmpresaKanban) => void;
  isOver?: boolean;
  minWidthClass?: string;
}

export function KanbanColumn({ column, onWhatsApp, isOver, minWidthClass }: KanbanColumnProps) {
  const { setNodeRef } = useDroppable({
    id: column.id
  });

  return (
    <div className={`
      flex flex-col h-full
      ${minWidthClass || 'min-w-[280px] max-w-[280px]'}
      transform transition-transform duration-300
      ${isOver ? 'scale-[1.02]' : 'scale-100'}
    `}>
      {/* Cabeçalho da Coluna */}
      <div className={`
        p-3 rounded-t-xl bg-gradient-to-r ${column.color} shadow-sm
        transition-all duration-300
        ${isOver ? 'shadow-lg shadow-accent/20' : ''}
      `}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`
              w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center
              transition-all duration-300
              ${isOver ? 'scale-110 bg-white/30' : ''}
            `}>
              <span className="text-base">
                {column.icon}
              </span>
            </div>
            <div>
              <h3 className="font-semibold text-white text-sm">{column.title}</h3>
            </div>
          </div>
          <span className={`
            px-2.5 py-0.5 bg-white/20 rounded-full text-white text-sm font-medium
            transition-all duration-300
            ${isOver ? 'bg-white/30 scale-110' : ''}
          `}>
            {column.items.length}
          </span>
        </div>
      </div>

      {/* Lista de Cards */}
      <div
        ref={setNodeRef}
        className={`
          flex-1 p-2 space-y-2 bg-muted/30 border-x border-b border-border rounded-b-xl
          transition-colors duration-300 overflow-y-auto
          ${isOver ? 'bg-accent/10 border-accent/30' : ''}
        `}
        style={{ maxHeight: 'calc(100vh - 280px)' }}
      >
        {column.items.map((empresa) => (
          <KanbanCard
            key={empresa._id}
            empresa={empresa}
            onWhatsApp={onWhatsApp}
            isAContatar={column.id === 'a_contatar'}
          />
        ))}

        {column.items.length === 0 && (
          <div className={`
            flex flex-col items-center justify-center h-32 text-center p-4
            transition-all duration-300
            ${isOver ? 'scale-105' : ''}
          `}>
            <div className={`
              w-10 h-10 rounded-lg bg-muted/50 flex items-center justify-center mb-2
              transition-all duration-300
              ${isOver ? 'scale-125 bg-accent/20' : ''}
            `}>
              <span className={`
                text-xl transition-transform duration-300
                ${isOver ? 'scale-110' : ''}
              `}>
                {column.icon}
              </span>
            </div>
            <p className={`
              text-muted-foreground text-xs font-medium
              transition-colors duration-300
              ${isOver ? 'text-accent' : ''}
            `}>
              {isOver ? 'Solte aqui!' : 'Arraste empresas aqui'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
