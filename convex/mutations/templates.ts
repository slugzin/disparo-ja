import { mutation } from "../_generated/server";
import { v } from "convex/values";

// Criar template
export const create = mutation({
  args: {
    name: v.string(),
    content: v.string(),
    preview: v.string(),
    variaveis: v.optional(v.array(v.string())),
    categoria: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert("messageTemplates", {
      name: args.name,
      content: args.content,
      preview: args.preview,
      variaveis: args.variaveis,
      categoria: args.categoria,
      createdAt: now,
      updatedAt: now,
    });
  },
});

// Atualizar template
export const update = mutation({
  args: {
    id: v.id("messageTemplates"),
    name: v.optional(v.string()),
    content: v.optional(v.string()),
    preview: v.optional(v.string()),
    variaveis: v.optional(v.array(v.string())),
    categoria: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    await ctx.db.patch(id, {
      ...updates,
      updatedAt: Date.now(),
    });
    return id;
  },
});

// Remover template
export const remove = mutation({
  args: { id: v.id("messageTemplates") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

// Duplicar template
export const duplicate = mutation({
  args: { id: v.id("messageTemplates") },
  handler: async (ctx, args) => {
    const template = await ctx.db.get(args.id);
    if (!template) throw new Error("Template não encontrado");

    const now = Date.now();
    return await ctx.db.insert("messageTemplates", {
      name: `${template.name} (cópia)`,
      content: template.content,
      preview: template.preview,
      variaveis: template.variaveis,
      categoria: template.categoria,
      createdAt: now,
      updatedAt: now,
    });
  },
});
