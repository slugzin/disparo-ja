import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

// Hooks para queries de campanhas

export function useCampanhas(limit?: number) {
  return useQuery(api.queries.campanhas.list, { limit });
}

export function useCampanhaById(id: Id<"campanhasDisparo">) {
  return useQuery(api.queries.campanhas.getById, { id });
}

export function useCampanhaWithDisparos(id: Id<"campanhasDisparo">) {
  return useQuery(api.queries.campanhas.getWithDisparos, { id });
}

export function useCampanhasByStatus(
  status: "em_andamento" | "concluida" | "pausada" | "cancelada"
) {
  return useQuery(api.queries.campanhas.listByStatus, { status });
}

export function useCampanhasStats() {
  return useQuery(api.queries.campanhas.getStats);
}

// Hooks para mutations de campanhas

export function useCreateCampanha() {
  return useMutation(api.mutations.campanhas.create);
}

export function useUpdateCampanha() {
  return useMutation(api.mutations.campanhas.update);
}

export function usePausarCampanha() {
  return useMutation(api.mutations.campanhas.pausar);
}

export function useRetomarCampanha() {
  return useMutation(api.mutations.campanhas.retomar);
}

export function useCancelarCampanha() {
  return useMutation(api.mutations.campanhas.cancelar);
}

export function useVerificarConclusaoCampanha() {
  return useMutation(api.mutations.campanhas.verificarConclusao);
}

export function useRemoveCampanha() {
  return useMutation(api.mutations.campanhas.remove);
}
