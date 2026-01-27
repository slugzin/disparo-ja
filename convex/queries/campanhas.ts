import { query } from "../_generated/server";
import { v } from "convex/values";

// Listar todas as campanhas
export const list = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let query = ctx.db.query("campanhasDisparo").order("desc");

    if (args.limit) {
      return await query.take(args.limit);
    }

    return await query.collect();
  },
});

// Buscar campanha por ID
export const getById = query({
  args: { id: v.id("campanhasDisparo") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Listar campanhas por status
export const listByStatus = query({
  args: {
    status: v.union(
      v.literal("em_andamento"),
      v.literal("concluida"),
      v.literal("pausada"),
      v.literal("cancelada")
    ),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("campanhasDisparo")
      .withIndex("by_status", (q) => q.eq("status", args.status))
      .collect();
  },
});

// Estatísticas de campanhas
export const getStats = query({
  handler: async (ctx) => {
    const campanhas = await ctx.db.query("campanhasDisparo").collect();

    const totalEnviados = campanhas.reduce((acc, c) => acc + c.totalEnviados, 0);
    const totalErros = campanhas.reduce((acc, c) => acc + c.totalErros, 0);
    const totalEmpresas = campanhas.reduce(
      (acc, c) => acc + c.totalEmpresas,
      0
    );

    return {
      total: campanhas.length,
      emAndamento: campanhas.filter((c) => c.status === "em_andamento").length,
      concluidas: campanhas.filter((c) => c.status === "concluida").length,
      pausadas: campanhas.filter((c) => c.status === "pausada").length,
      canceladas: campanhas.filter((c) => c.status === "cancelada").length,
      totalEnviados,
      totalErros,
      totalEmpresas,
      taxaSucesso:
        totalEmpresas > 0
          ? ((totalEnviados / totalEmpresas) * 100).toFixed(1)
          : "0",
    };
  },
});

// Buscar campanha com seus disparos
export const getWithDisparos = query({
  args: { id: v.id("campanhasDisparo") },
  handler: async (ctx, args) => {
    const campanha = await ctx.db.get(args.id);
    if (!campanha) return null;

    const disparos = await ctx.db
      .query("disparosAgendados")
      .withIndex("by_campanha", (q) => q.eq("campanhaId", args.id))
      .collect();

    return {
      ...campanha,
      disparos,
    };
  },
});
