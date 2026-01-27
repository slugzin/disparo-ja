import { query } from "../_generated/server";
import { v } from "convex/values";

// Listar todas as conversas
export const list = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let query = ctx.db
      .query("conversas")
      .order("desc");

    if (args.limit) {
      return await query.take(args.limit);
    }

    return await query.collect();
  },
});

// Buscar conversa por ID
export const getById = query({
  args: { id: v.id("conversas") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Buscar conversa por telefone
export const getByTelefone = query({
  args: { telefone: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("conversas")
      .withIndex("by_telefone", (q) => q.eq("telefone", args.telefone))
      .first();
  },
});

// Listar conversas por instância
export const listByInstance = query({
  args: { instanceId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("conversas")
      .withIndex("by_instance", (q) => q.eq("instanceId", args.instanceId))
      .collect();
  },
});

// Contar mensagens não lidas
export const countNaoLidas = query({
  handler: async (ctx) => {
    const conversas = await ctx.db.query("conversas").collect();
    return conversas.reduce((acc, c) => acc + c.naoLidas, 0);
  },
});

// Buscar conversa com mensagens
export const getWithMensagens = query({
  args: {
    id: v.id("conversas"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const conversa = await ctx.db.get(args.id);
    if (!conversa) return null;

    let mensagensQuery = ctx.db
      .query("mensagens")
      .withIndex("by_conversa", (q) => q.eq("conversaId", args.id))
      .order("asc");

    const mensagens = args.limit
      ? await mensagensQuery.take(args.limit)
      : await mensagensQuery.collect();

    // Buscar empresa relacionada se houver
    const empresa = conversa.empresaId
      ? await ctx.db.get(conversa.empresaId)
      : null;

    return {
      ...conversa,
      empresa,
      mensagens,
    };
  },
});
