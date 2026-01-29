import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Id } from '../../convex/_generated/dataModel';
import { KANBAN_COLUMNS } from '../types/kanban';
import type { KanbanState, KanbanStatus, KanbanColumn, EmpresaKanban } from '../types/kanban';

export function useKanban(empresas: EmpresaKanban[]) {
  const navigate = useNavigate();
  const updateStatus = useMutation(api.mutations.empresas.updateStatus);

  // Estado do Kanban - inicializar com colunas vazias
  const [state, setState] = useState<KanbanState>(() => {
    return {
      columns: KANBAN_COLUMNS.reduce((acc, col) => ({
        ...acc,
        [col.id]: { ...col, items: [] }
      }), {} as Record<KanbanStatus, KanbanColumn>),
      empresaStatus: {}
    };
  });

  // Carregar empresas nas colunas baseado no status do banco
  useEffect(() => {
    setState(currentState => {
      const newState = { ...currentState };

      // Limpar todas as colunas
      Object.values(newState.columns).forEach(col => {
        col.items = [];
      });

      // Resetar mapeamento de status
      newState.empresaStatus = {};

      // Distribuir empresas nas colunas baseado no status do banco
      empresas.forEach(empresa => {
        let status = empresa.status || 'a_contatar';

        // Validar se o status é válido
        if (newState.columns[status]) {
          newState.columns[status].items.push(empresa);
          newState.empresaStatus[empresa.id] = status;
        } else {
          // Se status inválido, colocar em 'a_contatar'
          newState.columns['a_contatar'].items.push(empresa);
          newState.empresaStatus[empresa.id] = 'a_contatar';
        }
      });

      return newState;
    });
  }, [empresas]);

  // Mover empresa entre colunas
  const moveEmpresa = useCallback(async (empresaId: Id<"empresas">, fromStatus: KanbanStatus, toStatus: KanbanStatus) => {
    // Atualizar estado local primeiro para responsividade
    setState(currentState => {
      const newState = { ...currentState };

      // Encontrar empresa em qualquer coluna
      let empresa: EmpresaKanban | undefined;
      let actualFromStatus = fromStatus;

      // Procurar em todas as colunas
      for (const status of Object.keys(newState.columns) as KanbanStatus[]) {
        empresa = newState.columns[status].items.find(e => e._id === empresaId);
        if (empresa) {
          actualFromStatus = status;
          break;
        }
      }

      if (!empresa) {
        return currentState;
      }

      // Remover da coluna atual
      newState.columns[actualFromStatus].items = newState.columns[actualFromStatus].items.filter(e => e._id !== empresaId);

      // Adicionar na nova coluna
      newState.columns[toStatus].items.push(empresa);

      // Atualizar status no mapeamento local
      newState.empresaStatus[empresa.id] = toStatus;

      return newState;
    });

    // Salvar no banco de dados via Convex
    try {
      await updateStatus({
        id: empresaId,
        status: toStatus
      });
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
    }
  }, [updateStatus]);

  // Função para disparar mensagem - redireciona para página de disparos
  const dispararMensagem = useCallback((empresa: EmpresaKanban) => {
    navigate('/admin/disparos', {
      state: {
        empresaSelecionada: empresa,
        modalidadeSelecionada: empresa.pesquisa || 'todas'
      }
    });
  }, [navigate]);

  return {
    state,
    moveEmpresa,
    dispararMensagem
  };
}
