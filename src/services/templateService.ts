// DEPRECADO: Este serviço está sendo substituído pelos hooks do Convex
// Use os hooks em src/hooks/useTemplates.ts ao invés deste serviço

import { Id } from '../../convex/_generated/dataModel';

export interface MessageTemplate {
  id: number;
  _id?: Id<"messageTemplates">;
  name: string;
  content: string;
  preview: string;
  categoria?: string;
  created_at: string;
  updated_at: string;
}

// NOTA: Este service está DEPRECADO
// Use os hooks do Convex diretamente:
// - useTemplates() para listar
// - useCreateTemplate() para criar
// - useUpdateTemplate() para atualizar
// - useRemoveTemplate() para deletar

export const templateService = {
  // Função deprecada - use useTemplates() do Convex
  async listTemplates(): Promise<{ success: boolean; data?: MessageTemplate[]; error?: string }> {
    console.warn('DEPRECATION: templateService.listTemplates() está deprecada. Use useTemplates() do Convex.');
    return {
      success: false,
      error: 'Este serviço está deprecado. Use os hooks do Convex.'
    };
  },

  // Função deprecada - use useCreateTemplate() do Convex
  async createTemplate(_template: { name: string; content: string; preview: string }): Promise<{ success: boolean; data?: MessageTemplate; error?: string }> {
    console.warn('DEPRECATION: templateService.createTemplate() está deprecada. Use useCreateTemplate() do Convex.');
    return {
      success: false,
      error: 'Este serviço está deprecado. Use os hooks do Convex.'
    };
  },

  // Função deprecada - use useUpdateTemplate() do Convex
  async updateTemplate(_id: number, _template: { name: string; content: string; preview: string }): Promise<{ success: boolean; data?: MessageTemplate; error?: string }> {
    console.warn('DEPRECATION: templateService.updateTemplate() está deprecada. Use useUpdateTemplate() do Convex.');
    return {
      success: false,
      error: 'Este serviço está deprecado. Use os hooks do Convex.'
    };
  },

  // Função deprecada - use useRemoveTemplate() do Convex
  async deleteTemplate(_id: number): Promise<{ success: boolean; error?: string }> {
    console.warn('DEPRECATION: templateService.deleteTemplate() está deprecada. Use useRemoveTemplate() do Convex.');
    return {
      success: false,
      error: 'Este serviço está deprecado. Use os hooks do Convex.'
    };
  }
};
