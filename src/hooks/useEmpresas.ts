import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

export type EmpresaStatus =
  | "a_contatar"
  | "contato_realizado"
  | "sem_interesse"
  | "negociando"
  | "convertido";

export interface Empresa {
  _id: Id<"empresas">;
  titulo: string;
  endereco?: string;
  categoria?: string;
  telefone?: string;
  website?: string;
  avaliacao?: number;
  totalAvaliacoes?: number;
  placeId?: string;
  latitude?: number;
  longitude?: number;
  pesquisa?: string;
  status: EmpresaStatus;
  capturadoEm: number;
  ultimoContato?: number;
  notas?: string;
}

export function useEmpresas() {
  // Queries
  const empresas = useQuery(api.queries.empresas.list, {});
  const funilStats = useQuery(api.queries.empresas.getFunilStats);
  const modalidades = useQuery(api.queries.empresas.listModalidades);
  const pesquisas = useQuery(api.queries.empresas.listPesquisas);

  // Mutations
  const createEmpresa = useMutation(api.mutations.empresas.create);
  const createManyEmpresas = useMutation(api.mutations.empresas.createMany);
  const updateEmpresa = useMutation(api.mutations.empresas.update);
  const updateStatus = useMutation(api.mutations.empresas.updateStatus);
  const updateManyStatus = useMutation(api.mutations.empresas.updateManyStatus);
  const removeEmpresa = useMutation(api.mutations.empresas.remove);
  const removeManyEmpresas = useMutation(api.mutations.empresas.removeMany);

  // Actions
  const buscarEmpresas = useAction(api.actions.captarEmpresas.buscarEmpresas);
  const captarESalvar = useAction(api.actions.captarEmpresas.captarESalvar);

  const isLoading = empresas === undefined;

  return {
    // Data
    empresas: empresas || [],
    funilStats,
    modalidades: modalidades || [],
    pesquisas: pesquisas || [],
    isLoading,

    // Mutations
    createEmpresa,
    createManyEmpresas,
    updateEmpresa,
    updateStatus,
    updateManyStatus,
    removeEmpresa,
    removeManyEmpresas,

    // Actions
    buscarEmpresas,
    captarESalvar,
  };
}

// Hook para buscar empresas com filtros
export function useEmpresasWithFilters(filters: {
  status?: EmpresaStatus;
  pesquisa?: string;
  categoria?: string;
  limit?: number;
}) {
  const empresas = useQuery(api.queries.empresas.listWithFilters, filters);
  return {
    empresas: empresas || [],
    isLoading: empresas === undefined,
  };
}

// Hook para buscar empresa por ID
export function useEmpresa(id: Id<"empresas"> | undefined) {
  const empresa = useQuery(
    api.queries.empresas.getById,
    id ? { id } : "skip"
  );
  return {
    empresa,
    isLoading: id ? empresa === undefined : false,
  };
}
