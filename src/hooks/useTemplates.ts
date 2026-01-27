import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

export interface MessageTemplate {
  _id: Id<"messageTemplates">;
  name: string;
  content: string;
  preview: string;
  variaveis?: string[];
  categoria?: string;
  createdAt: number;
  updatedAt: number;
}

export function useTemplates() {
  // Queries
  const templates = useQuery(api.queries.templates.list);
  const categorias = useQuery(api.queries.templates.listCategorias);

  // Mutations
  const createTemplate = useMutation(api.mutations.templates.create);
  const updateTemplate = useMutation(api.mutations.templates.update);
  const removeTemplate = useMutation(api.mutations.templates.remove);
  const duplicateTemplate = useMutation(api.mutations.templates.duplicate);

  const isLoading = templates === undefined;

  return {
    // Data
    templates: templates || [],
    categorias: categorias || [],
    isLoading,

    // Mutations
    createTemplate,
    updateTemplate,
    removeTemplate,
    duplicateTemplate,
  };
}

// Hook para buscar template por ID
export function useTemplate(id: Id<"messageTemplates"> | undefined) {
  const template = useQuery(
    api.queries.templates.getById,
    id ? { id } : "skip"
  );
  return {
    template,
    isLoading: id ? template === undefined : false,
  };
}

// Função auxiliar para processar variáveis do template
export function processTemplate(
  content: string,
  empresa: { titulo?: string; telefone?: string; endereco?: string; categoria?: string }
): string {
  return content
    .replace(/\{nome\}/g, empresa.titulo || "")
    .replace(/\{empresa\}/g, empresa.titulo || "")
    .replace(/\{telefone\}/g, empresa.telefone || "")
    .replace(/\{endereco\}/g, empresa.endereco || "")
    .replace(/\{categoria\}/g, empresa.categoria || "");
}
