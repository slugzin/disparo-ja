import { query } from "../_generated/server";
import { v } from "convex/values";

// Listar disparos pendentes
export const listPendentes = query({
  handler: async (ctx) => {
    return await ctx.db
      .query("disparosAgendados")
      .withIndex("by_status", (q) => q.eq("status", "pendente"))
      .order("asc")
      .collect();
  },
});

// Listar disparos por campanha
export const listByCampanha = query({
  args: { campanhaId: v.id("campanhasDisparo") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("disparosAgendados")
      .withIndex("by_campanha", (q) => q.eq("campanhaId", args.campanhaId))
      .collect();
  },
});

// Listar disparos por status
export const listByStatus = query({
  args: {
    status: v.union(
      v.literal("pendente"),
      v.literal("enviando"),
      v.literal("enviado"),
      v.literal("erro"),
      v.literal("cancelado")
    ),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("disparosAgendados")
      .withIndex("by_status", (q) => q.eq("status", args.status))
      .collect();
  },
});

// Listar disparos agendados para um período
export const listByPeriodo = query({
  args: {
    inicio: v.number(),
    fim: v.number(),
  },
  handler: async (ctx, args) => {
    const disparos = await ctx.db
      .query("disparosAgendados")
      .withIndex("by_agendado")
      .collect();

    return disparos.filter(
      (d) => d.agendadoPara >= args.inicio && d.agendadoPara <= args.fim
    );
  },
});

// Estatísticas de disparos
export const getStats = query({
  handler: async (ctx) => {
    const disparos = await ctx.db.query("disparosAgendados").collect();

    return {
      total: disparos.length,
      pendentes: disparos.filter((d) => d.status === "pendente").length,
      enviando: disparos.filter((d) => d.status === "enviando").length,
      enviados: disparos.filter((d) => d.status === "enviado").length,
      erros: disparos.filter((d) => d.status === "erro").length,
      cancelados: disparos.filter((d) => d.status === "cancelado").length,
    };
  },
});

// Buscar disparo por ID
export const getById = query({
  args: { id: v.id("disparosAgendados") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Listar todos os disparos com paginação
export const list = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let query = ctx.db.query("disparosAgendados").order("desc");

    if (args.limit) {
      return await query.take(args.limit);
    }

    return await query.collect();
  },
});
