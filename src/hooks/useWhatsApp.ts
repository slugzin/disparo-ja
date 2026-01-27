import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

export type InstanceStatus = "connected" | "disconnected" | "connecting" | "qrcode";

export interface WhatsAppInstance {
  _id: Id<"whatsappInstances">;
  instanceName: string;
  instanceId: string;
  status: InstanceStatus;
  qrcode?: string;
  profilePicUrl?: string;
  profileName?: string;
  ownerJid?: string;
  lastSync?: number;
  createdAt: number;
}

export function useWhatsApp() {
  // Queries
  const instances = useQuery(api.queries.whatsappInstances.list);
  const connectedInstances = useQuery(api.queries.whatsappInstances.listConnected);
  const stats = useQuery(api.queries.whatsappInstances.getStats);

  // Mutations
  const createInstance = useMutation(api.mutations.whatsappInstances.create);
  const updateStatus = useMutation(api.mutations.whatsappInstances.updateStatus);
  const updateProfile = useMutation(api.mutations.whatsappInstances.updateProfile);
  const removeInstance = useMutation(api.mutations.whatsappInstances.remove);

  // Actions - WAHA API
  const apiCreateInstance = useAction(api.actions.evolutionApi.createInstance);
  const apiConnectInstance = useAction(api.actions.evolutionApi.connectInstance);
  const apiSyncStatus = useAction(api.actions.evolutionApi.syncStatus);
  const apiSendMessage = useAction(api.actions.evolutionApi.sendMessage);
  const apiDisconnectInstance = useAction(api.actions.evolutionApi.disconnectInstance);
  const apiDeleteInstance = useAction(api.actions.evolutionApi.deleteInstance);
  const apiListInstances = useAction(api.actions.evolutionApi.listInstances);

  const isLoading = instances === undefined;

  return {
    // Data
    instances: instances || [],
    connectedInstances: connectedInstances || [],
    stats,
    isLoading,

    // Mutations (banco local)
    createInstance,
    updateStatus,
    updateProfile,
    removeInstance,

    // Actions (API externa)
    apiCreateInstance,
    apiConnectInstance,
    apiSyncStatus,
    apiSendMessage,
    apiDisconnectInstance,
    apiDeleteInstance,
    apiListInstances,
  };
}

// Hook para buscar instância por ID
export function useWhatsAppInstance(instanceId: string | undefined) {
  const instance = useQuery(
    api.queries.whatsappInstances.getByInstanceId,
    instanceId ? { instanceId } : "skip"
  );
  return {
    instance,
    isLoading: instanceId ? instance === undefined : false,
  };
}
