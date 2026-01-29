// DEPRECADO: Este serviço está sendo substituído pelos hooks do Convex
// Use os hooks em src/hooks/useWhatsAppInstances.ts ao invés deste serviço

import { Id } from '../../convex/_generated/dataModel';

// Interfaces para o serviço WhatsApp
export interface WhatsAppInstance {
  id: string;
  _id?: Id<"whatsappInstances">;
  name: string;
  phone?: string;
  status: 'connected' | 'disconnected' | 'connecting';
  createdAt: string;
  lastActivity?: string;
  qrCode?: string;
  webhook_url?: string;
  token?: string;
  hash?: string;
  instanceId?: string;
  profilePicUrl?: string;
  profileName?: string;
  ownerJid?: string;
  lastSync?: string;
}

export interface CreateInstanceResponse {
  success: boolean;
  data?: {
    instanceId: string;
    name: string;
    hash: string;
    qrCode?: string;
    status: string;
  };
  error?: string;
}

// NOTA: Este service está DEPRECADO
// Use os hooks do Convex diretamente:
// - useWhatsAppInstances() para listar
// - useCreateWhatsAppInstance() para criar no banco
// - useCreateEvolutionInstance() para criar na API Evolution
// - useConnectEvolutionInstance() para conectar e gerar QR
// - useSyncEvolutionStatus() para sincronizar status

export const whatsappService = {
  // Função deprecada - use useCreateEvolutionInstance() do Convex
  async createInstance(_name: string): Promise<CreateInstanceResponse> {
    console.warn('DEPRECATION: whatsappService.createInstance() está deprecada. Use useAction(api.actions.evolutionApi.createInstance) do Convex.');
    return {
      success: false,
      error: 'Este serviço está deprecado. Use os hooks do Convex.'
    };
  },

  // Função deprecada - use useConnectEvolutionInstance() do Convex
  async connectInstance(_instanceName: string): Promise<{ success: boolean; data?: unknown; error?: string }> {
    console.warn('DEPRECATION: whatsappService.connectInstance() está deprecada. Use useAction(api.actions.evolutionApi.connectInstance) do Convex.');
    return {
      success: false,
      error: 'Este serviço está deprecado. Use os hooks do Convex.'
    };
  },

  // Função deprecada - use useWhatsAppInstances() do Convex
  async listInstances(): Promise<{ success: boolean; data?: WhatsAppInstance[]; error?: string }> {
    console.warn('DEPRECATION: whatsappService.listInstances() está deprecada. Use useQuery(api.queries.whatsappInstances.list) do Convex.');
    return {
      success: false,
      error: 'Este serviço está deprecado. Use os hooks do Convex.'
    };
  },

  // Função deprecada - use useUpdateWhatsAppStatus() do Convex
  async updateInstanceStatus(_instanceId: string, _status: string): Promise<{ success: boolean; error?: string }> {
    console.warn('DEPRECATION: whatsappService.updateInstanceStatus() está deprecada. Use useMutation(api.mutations.whatsappInstances.updateStatus) do Convex.');
    return {
      success: false,
      error: 'Este serviço está deprecado. Use os hooks do Convex.'
    };
  },

  // Função deprecada - use useWhatsAppInstanceById() do Convex
  async getInstanceById(_instanceId: string): Promise<{ success: boolean; data?: WhatsAppInstance; error?: string }> {
    console.warn('DEPRECATION: whatsappService.getInstanceById() está deprecada. Use useQuery(api.queries.whatsappInstances.getByInstanceId) do Convex.');
    return {
      success: false,
      error: 'Este serviço está deprecado. Use os hooks do Convex.'
    };
  },

  // Função deprecada - use useRemoveWhatsAppInstanceByInstanceId() do Convex
  async deleteInstance(_instanceId: string): Promise<{ success: boolean; error?: string }> {
    console.warn('DEPRECATION: whatsappService.deleteInstance() está deprecada. Use useMutation(api.mutations.whatsappInstances.removeByInstanceId) do Convex.');
    return {
      success: false,
      error: 'Este serviço está deprecado. Use os hooks do Convex.'
    };
  },

  // Função deprecada - use useSyncEvolutionStatus() do Convex
  async syncInstancesStatus(): Promise<{ success: boolean; data?: unknown[]; error?: string }> {
    console.warn('DEPRECATION: whatsappService.syncInstancesStatus() está deprecada. Use useAction(api.actions.evolutionApi.syncStatus) do Convex.');
    return {
      success: false,
      error: 'Este serviço está deprecado. Use os hooks do Convex.'
    };
  }
};
