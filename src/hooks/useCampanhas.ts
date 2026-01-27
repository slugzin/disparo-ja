import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

export type CampanhaStatus = "em_andamento" | "concluida" | "pausada" | "cancelada";

export interface Campanha {
  _id: Id<"campanhasDisparo">;
  nome?: string;
  conexaoId: string;
  mensagem: string;
  totalEmpresas: number;
  totalEnviados: number;
  totalErros: number;
  status: CampanhaStatus;
  criadoEm: number;
  concluidoEm?: number;
}

export function useCampanhas() {
  // Queries
  const campanhas = useQuery(api.queries.campanhas.list, {});
  const stats = useQuery(api.queries.campanhas.getStats);

  // Mutations
  const createCampanha = useMutation(api.mutations.campanhas.create);
  const updateCampanha = useMutation(api.mutations.campanhas.update);
  const pausarCampanha = useMutation(api.mutations.campanhas.pausar);
  const retomarCampanha = useMutation(api.mutations.campanhas.retomar);
  const cancelarCampanha = useMutation(api.mutations.campanhas.cancelar);
  const removeCampanha = useMutation(api.mutations.campanhas.remove);

  const isLoading = campanhas === undefined;

  return {
    // Data
    campanhas: campanhas || [],
    stats,
    isLoading,

    // Mutations
    createCampanha,
    updateCampanha,
    pausarCampanha,
    retomarCampanha,
    cancelarCampanha,
    removeCampanha,
  };
}

// Hook para buscar campanha com disparos
export function useCampanhaWithDisparos(id: Id<"campanhasDisparo"> | undefined) {
  const campanha = useQuery(
    api.queries.campanhas.getWithDisparos,
    id ? { id } : "skip"
  );
  return {
    campanha,
    isLoading: id ? campanha === undefined : false,
  };
}

// Hook para disparos
export function useDisparos() {
  // Queries
  const disparosPendentes = useQuery(api.queries.disparos.listPendentes);
  const disparosStats = useQuery(api.queries.disparos.getStats);

  // Mutations
  const agendarDisparos = useMutation(api.mutations.disparos.agendarDisparos);
  const marcarEnviado = useMutation(api.mutations.disparos.marcarEnviado);
  const marcarErro = useMutation(api.mutations.disparos.marcarErro);
  const cancelarDisparo = useMutation(api.mutations.disparos.cancelar);
  const cancelarManyDisparos = useMutation(api.mutations.disparos.cancelarMany);

  return {
    // Data
    disparosPendentes: disparosPendentes || [],
    disparosStats,
    isLoading: disparosPendentes === undefined,

    // Mutations
    agendarDisparos,
    marcarEnviado,
    marcarErro,
    cancelarDisparo,
    cancelarManyDisparos,
  };
}
