import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

// Hook para listar empresas
export function useEmpresas(limit?: number) {
  const empresas = useQuery(api.queries.empresas.list, { limit });
  return empresas;
}

// Hook para buscar empresa por ID
export function useEmpresaById(id: Id<"empresas">) {
  return useQuery(api.queries.empresas.getById, { id });
}

// Hook para listar empresas por status
export function useEmpresasByStatus(
  status:
    | "a_contatar"
    | "contato_realizado"
    | "sem_interesse"
    | "negociando"
    | "convertido"
) {
  return useQuery(api.queries.empresas.listByStatus, { status });
}

// Hook para listar pesquisas únicas
export function usePesquisas() {
  return useQuery(api.queries.empresas.listPesquisas);
}

// Hook para listar modalidades
export function useModalidades() {
  return useQuery(api.queries.empresas.listModalidades);
}

// Hook para estatísticas do funil
export function useFunilStats() {
  return useQuery(api.queries.empresas.getFunilStats);
}

// Hook para listar empresas com filtros
export function useEmpresasComFiltros(filtros?: {
  status?:
    | "a_contatar"
    | "contato_realizado"
    | "sem_interesse"
    | "negociando"
    | "convertido";
  pesquisa?: string;
  categoria?: string;
  limit?: number;
}) {
  return useQuery(api.queries.empresas.listWithFilters, filtros || {});
}

// Hooks de mutations
export function useCreateEmpresa() {
  return useMutation(api.mutations.empresas.create);
}

export function useCreateManyEmpresas() {
  return useMutation(api.mutations.empresas.createMany);
}

export function useUpdateEmpresa() {
  return useMutation(api.mutations.empresas.update);
}

export function useUpdateEmpresaStatus() {
  return useMutation(api.mutations.empresas.updateStatus);
}

export function useUpdateManyEmpresasStatus() {
  return useMutation(api.mutations.empresas.updateManyStatus);
}

export function useRemoveEmpresa() {
  return useMutation(api.mutations.empresas.remove);
}

export function useRemoveManyEmpresas() {
  return useMutation(api.mutations.empresas.removeMany);
}
