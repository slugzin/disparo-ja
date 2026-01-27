import { query } from "../_generated/server";
import { v } from "convex/values";

// Listar todos os templates
export const list = query({
  handler: async (ctx) => {
    return await ctx.db.query("messageTemplates").order("desc").collect();
  },
});

// Buscar template por ID
export const getById = query({
  args: { id: v.id("messageTemplates") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Listar templates por categoria
export const listByCategoria = query({
  args: { categoria: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("messageTemplates")
      .withIndex("by_categoria", (q) => q.eq("categoria", args.categoria))
      .collect();
  },
});

// Listar categorias únicas
export const listCategorias = query({
  handler: async (ctx) => {
    const templates = await ctx.db.query("messageTemplates").collect();
    const categorias = new Set<string>();

    templates.forEach((t) => {
      if (t.categoria) {
        categorias.add(t.categoria);
      }
    });

    return Array.from(categorias).sort();
  },
});
