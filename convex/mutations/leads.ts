import { mutation } from "../_generated/server";
import { v } from "convex/values";

// Criar lead
export const create = mutation({
  args: {
    userId: v.id("profiles"),
    nome: v.string(),
    empresaId: v.optional(v.id("empresas")),
    email: v.optional(v.string()),
    telefone: v.optional(v.string()),
    whatsapp: v.optional(v.string()),
    cargo: v.optional(v.string()),
    origem: v.union(
      v.literal("Website"),
      v.literal("LinkedIn"),
      v.literal("Indicação"),
      v.literal("Google Maps"),
      v.literal("Outro")
    ),
    status: v.optional(
      v.union(
        v.literal("Novo"),
        v.literal("Qualificado"),
        v.literal("Em Negociação"),
        v.literal("Convertido"),
        v.literal("Perdido")
      )
    ),
    score: v.optional(v.number()),
    notas: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert("leads", {
      userId: args.userId,
      nome: args.nome,
      empresaId: args.empresaId,
      email: args.email,
      telefone: args.telefone,
      whatsapp: args.whatsapp,
      cargo: args.cargo,
      origem: args.origem,
      status: args.status || "Novo",
      score: args.score || 0,
      notas: args.notas,
      createdAt: now,
      updatedAt: now,
    });
  },
});

// Atualizar lead
export const update = mutation({
  args: {
    id: v.id("leads"),
    nome: v.optional(v.string()),
    empresaId: v.optional(v.id("empresas")),
    email: v.optional(v.string()),
    telefone: v.optional(v.string()),
    whatsapp: v.optional(v.string()),
    cargo: v.optional(v.string()),
    origem: v.optional(
      v.union(
        v.literal("Website"),
        v.literal("LinkedIn"),
        v.literal("Indicação"),
        v.literal("Google Maps"),
        v.literal("Outro")
      )
    ),
    status: v.optional(
      v.union(
        v.literal("Novo"),
        v.literal("Qualificado"),
        v.literal("Em Negociação"),
        v.literal("Convertido"),
        v.literal("Perdido")
      )
    ),
    score: v.optional(v.number()),
    notas: v.optional(v.string()),
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

// Atualizar status do lead
export const updateStatus = mutation({
  args: {
    id: v.id("leads"),
    status: v.union(
      v.literal("Novo"),
      v.literal("Qualificado"),
      v.literal("Em Negociação"),
      v.literal("Convertido"),
      v.literal("Perdido")
    ),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      status: args.status,
      updatedAt: Date.now(),
    });
    return args.id;
  },
});

// Remover lead
export const remove = mutation({
  args: { id: v.id("leads") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

// Remover múltiplos leads
export const removeMany = mutation({
  args: { ids: v.array(v.id("leads")) },
  handler: async (ctx, args) => {
    for (const id of args.ids) {
      await ctx.db.delete(id);
    }
    return args.ids.length;
  },
});
