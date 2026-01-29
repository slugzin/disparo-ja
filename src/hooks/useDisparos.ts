import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

// Hooks para queries de disparos

export function useDisparos(limit?: number) {
  return useQuery(api.queries.disparos.list, { limit });
}

export function useDisparosPendentes() {
  return useQuery(api.queries.disparos.listPendentes);
}

export function useDisparosByCampanha(campanhaId: Id<"campanhasDisparo">) {
  return useQuery(api.queries.disparos.listByCampanha, { campanhaId });
}

export function useDisparosStats() {
  return useQuery(api.queries.disparos.getStats);
}

export function useDisparoById(id: Id<"disparosAgendados">) {
  return useQuery(api.queries.disparos.getById, { id });
}

// Hooks para mutations de disparos

export function useAgendarDisparos() {
  return useMutation(api.mutations.disparos.agendarDisparos);
}

export function useCreateDisparo() {
  return useMutation(api.mutations.disparos.create);
}

export function useMarcarDisparoEnviado() {
  return useMutation(api.mutations.disparos.marcarEnviado);
}

export function useMarcarDisparoErro() {
  return useMutation(api.mutations.disparos.marcarErro);
}

export function useAtualizarDisparoStatus() {
  return useMutation(api.mutations.disparos.atualizarStatus);
}

export function useCancelarDisparo() {
  return useMutation(api.mutations.disparos.cancelar);
}

export function useCancelarDisparos() {
  return useMutation(api.mutations.disparos.cancelarMany);
}

export function useRemoveDisparo() {
  return useMutation(api.mutations.disparos.remove);
}

// Actions para processamento

export function useProcessarProximoDisparo() {
  return useAction(api.actions.processarDisparos.processarProximo);
}

export function useProcessarLoteDisparos() {
  return useAction(api.actions.processarDisparos.processarLote);
}

export function useVerificarCampanhasConcluidas() {
  return useAction(api.actions.processarDisparos.verificarCampanhasConcluidas);
}
