import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

// Hook para listar templates
export function useTemplates() {
  return useQuery(api.queries.templates.list);
}

// Hook para buscar template por ID
export function useTemplateById(id: Id<"messageTemplates">) {
  return useQuery(api.queries.templates.getById, { id });
}

// Hook para listar templates por categoria
export function useTemplatesByCategoria(categoria: string) {
  return useQuery(api.queries.templates.listByCategoria, { categoria });
}

// Hook para listar categorias de templates
export function useTemplatesCategorias() {
  return useQuery(api.queries.templates.listCategorias);
}

// Hooks de mutations
export function useCreateTemplate() {
  return useMutation(api.mutations.templates.create);
}

export function useUpdateTemplate() {
  return useMutation(api.mutations.templates.update);
}

export function useRemoveTemplate() {
  return useMutation(api.mutations.templates.remove);
}

export function useDuplicateTemplate() {
  return useMutation(api.mutations.templates.duplicate);
}
