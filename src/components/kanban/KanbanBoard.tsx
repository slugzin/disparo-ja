import React, { useState, useMemo, useCallback } from 'react';
import { DndContext, DragEndEvent, DragStartEvent, DragOverEvent, MouseSensor, TouchSensor, useSensor, useSensors } from '@dnd-kit/core';
import { KanbanColumn } from './KanbanColumn';
import { DragOverlay } from './DragOverlay';
import { useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { Id } from '../../../convex/_generated/dataModel';
import { KANBAN_COLUMNS, type EmpresaKanban, type KanbanStatus, type KanbanColumn as IKanbanColumn } from '../../types/kanban';

interface Empresa {
  _id: Id<"empresas">;
  titulo: string;
  endereco?: string;
  categoria?: string;
  telefone?: string;
  website?: string;
  avaliacao?: number;
  totalAvaliacoes?: number;
  status: string;
  capturadoEm: number;
}

interface KanbanBoardProps {
  empresas: Empresa[];
}

export function KanbanBoard({ empresas }: KanbanBoardProps) {
  const updateStatus = useMutation(api.mutations.empresas.updateStatus);
  const [activeItem, setActiveItem] = useState<EmpresaKanban | null>(null);
  const [overColumn, setOverColumn] = useState<KanbanStatus | null>(null);

  // Converter empresas do Convex para o formato do Kanban
  const empresasKanban = useMemo((): EmpresaKanban[] => {
    return empresas.map((empresa, index) => ({
      id: index,
      _id: empresa._id,
      titulo: empresa.titulo,
      endereco: empresa.endereco,
      categoria: empresa.categoria,
      telefone: empresa.telefone,
      website: empresa.website,
      avaliacao: empresa.avaliacao,
      totalAvaliacoes: empresa.totalAvaliacoes,
      status: empresa.status as KanbanStatus,
    }));
  }, [empresas]);

  // Organizar empresas em colunas
  const columns = useMemo(() => {
    const cols: Record<KanbanStatus, IKanbanColumn> = {} as any;

    KANBAN_COLUMNS.forEach(col => {
      cols[col.id] = {
        ...col,
        items: empresasKanban.filter(e => e.status === col.id)
      };
    });

    return cols;
  }, [empresasKanban]);

  // Configurar sensores para drag and drop
  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 8
      }
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200,
        tolerance: 5
      }
    })
  );

  // Manipular início do drag
  const handleDragStart = useCallback((event: DragStartEvent) => {
    const empresaId = event.active.id.toString().replace('empresa-', '');
    const empresa = empresasKanban.find(e => e._id === empresaId);

    if (empresa) {
      setActiveItem(empresa);
    }
  }, [empresasKanban]);

  // Manipular drag sobre coluna
  const handleDragOver = useCallback((event: DragOverEvent) => {
    if (!event.over) {
      setOverColumn(null);
      return;
    }

    const newOverColumn = event.over.id as KanbanStatus;
    if (KANBAN_COLUMNS.some(col => col.id === newOverColumn)) {
      setOverColumn(newOverColumn);
    }
  }, []);

  // Manipular fim do drag
  const handleDragEnd = useCallback(async (event: DragEndEvent) => {
    const { active, over } = event;

    setActiveItem(null);
    setOverColumn(null);

    if (!over) return;

    const empresaId = active.id.toString().replace('empresa-', '') as Id<"empresas">;
    const toStatus = over.id as KanbanStatus;

    // Verificar se é uma coluna válida
    if (!KANBAN_COLUMNS.some(col => col.id === toStatus)) return;

    // Encontrar empresa e verificar se mudou de status
    const empresa = empresasKanban.find(e => e._id === empresaId);
    if (!empresa || empresa.status === toStatus) return;

    // Atualizar no banco
    try {
      await updateStatus({
        id: empresaId,
        status: toStatus
      });
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
    }
  }, [empresasKanban, updateStatus]);

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-3 pb-4 overflow-x-auto scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
        {KANBAN_COLUMNS.map((column) => (
          <KanbanColumn
            key={column.id}
            column={columns[column.id]}
            isOver={overColumn === column.id}
          />
        ))}
      </div>

      <DragOverlay draggedItem={activeItem} />
    </DndContext>
  );
}
