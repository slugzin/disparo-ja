import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

// Hook para listar instâncias
export function useWhatsAppInstances() {
  return useQuery(api.queries.whatsappInstances.list);
}

// Hook para buscar instância por ID
export function useWhatsAppInstanceById(id: Id<"whatsappInstances">) {
  return useQuery(api.queries.whatsappInstances.getById, { id });
}

// Hook para buscar instância por instanceId
export function useWhatsAppInstanceByInstanceId(instanceId: string) {
  return useQuery(api.queries.whatsappInstances.getByInstanceId, { instanceId });
}

// Hook para buscar instância por nome
export function useWhatsAppInstanceByName(instanceName: string) {
  return useQuery(api.queries.whatsappInstances.getByInstanceName, { instanceName });
}

// Hook para listar instâncias conectadas
export function useConnectedInstances() {
  return useQuery(api.queries.whatsappInstances.listConnected);
}

// Hook para estatísticas de instâncias
export function useWhatsAppStats() {
  return useQuery(api.queries.whatsappInstances.getStats);
}

// Hooks de mutations
export function useCreateWhatsAppInstance() {
  return useMutation(api.mutations.whatsappInstances.create);
}

export function useUpdateWhatsAppStatus() {
  return useMutation(api.mutations.whatsappInstances.updateStatus);
}

export function useUpdateWhatsAppStatusByInstanceId() {
  return useMutation(api.mutations.whatsappInstances.updateStatusByInstanceId);
}

export function useUpdateWhatsAppProfile() {
  return useMutation(api.mutations.whatsappInstances.updateProfile);
}

export function useRemoveWhatsAppInstance() {
  return useMutation(api.mutations.whatsappInstances.remove);
}

export function useRemoveWhatsAppInstanceByInstanceId() {
  return useMutation(api.mutations.whatsappInstances.removeByInstanceId);
}

// Actions (operações que interagem com APIs externas)
export function useCreateEvolutionInstance() {
  return useAction(api.actions.evolutionApi.createInstance);
}

export function useConnectEvolutionInstance() {
  return useAction(api.actions.evolutionApi.connectInstance);
}

export function useSyncEvolutionStatus() {
  return useAction(api.actions.evolutionApi.syncStatus);
}

export function useSendWhatsAppMessage() {
  return useAction(api.actions.evolutionApi.sendMessage);
}

export function useDisconnectEvolutionInstance() {
  return useAction(api.actions.evolutionApi.disconnectInstance);
}

export function useDeleteEvolutionInstance() {
  return useAction(api.actions.evolutionApi.deleteInstance);
}

export function useListEvolutionInstances() {
  return useAction(api.actions.evolutionApi.listInstances);
}
