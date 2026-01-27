import { query } from "../_generated/server";
import { v } from "convex/values";

// Listar todos os leads de um usuário
export const list = query({
  args: { userId: v.id("profiles") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("leads")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .collect();
  },
});

// Buscar lead por ID
export const getById = query({
  args: { id: v.id("leads") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Listar leads por status
export const listByStatus = query({
  args: {
    userId: v.id("profiles"),
    status: v.union(
      v.literal("Novo"),
      v.literal("Qualificado"),
      v.literal("Em Negociação"),
      v.literal("Convertido"),
      v.literal("Perdido")
    ),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("leads")
      .withIndex("by_user_status", (q) =>
        q.eq("userId", args.userId).eq("status", args.status)
      )
      .collect();
  },
});

// Listar leads com dados da empresa
export const listWithEmpresas = query({
  args: { userId: v.id("profiles") },
  handler: async (ctx, args) => {
    const leads = await ctx.db
      .query("leads")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .collect();

    // Buscar empresas relacionadas
    const leadsWithEmpresas = await Promise.all(
      leads.map(async (lead) => {
        const empresa = lead.empresaId
          ? await ctx.db.get(lead.empresaId)
          : null;
        return { ...lead, empresa };
      })
    );

    return leadsWithEmpresas;
  },
});

// Estatísticas de leads por status
export const getStats = query({
  args: { userId: v.id("profiles") },
  handler: async (ctx, args) => {
    const leads = await ctx.db
      .query("leads")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    const stats = {
      total: leads.length,
      novos: leads.filter((l) => l.status === "Novo").length,
      qualificados: leads.filter((l) => l.status === "Qualificado").length,
      emNegociacao: leads.filter((l) => l.status === "Em Negociação").length,
      convertidos: leads.filter((l) => l.status === "Convertido").length,
      perdidos: leads.filter((l) => l.status === "Perdido").length,
    };

    return stats;
  },
});
