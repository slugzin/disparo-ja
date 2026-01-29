import React from 'react';
import { DragOverlay as DndDragOverlay } from '@dnd-kit/core';
import { KanbanCard } from './KanbanCard';
import type { EmpresaKanban } from '../../types/kanban';

interface DragOverlayProps {
  draggedItem: EmpresaKanban | null;
}

export function DragOverlay({ draggedItem }: DragOverlayProps) {
  if (!draggedItem) return null;

  return (
    <DndDragOverlay dropAnimation={{
      duration: 300,
      easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)',
    }}>
      <div style={{
        transform: 'rotate(-2deg) scale(1.05)',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)',
        width: '280px',
      }}>
        <KanbanCard
          empresa={draggedItem}
          isDragging
        />
      </div>
    </DndDragOverlay>
  );
}
