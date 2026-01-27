import { query } from "../_generated/server";
import { v } from "convex/values";

// Listar todas as empresas
export const list = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let query = ctx.db.query("empresas").order("desc");

    if (args.limit) {
      return await query.take(args.limit);
    }

    return await query.collect();
  },
});

// Buscar empresa por ID
export const getById = query({
  args: { id: v.id("empresas") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Listar empresas por pesquisa (termo de busca usado na captação)
export const listByPesquisa = query({
  args: { pesquisa: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("empresas")
      .withIndex("by_pesquisa", (q) => q.eq("pesquisa", args.pesquisa))
      .collect();
  },
});

// Listar empresas por status
export const listByStatus = query({
  args: {
    status: v.union(
      v.literal("a_contatar"),
      v.literal("contato_realizado"),
      v.literal("sem_interesse"),
      v.literal("negociando"),
      v.literal("convertido")
    ),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("empresas")
      .withIndex("by_status", (q) => q.eq("status", args.status))
      .collect();
  },
});

// Listar modalidades/categorias únicas
export const listModalidades = query({
  handler: async (ctx) => {
    const empresas = await ctx.db.query("empresas").collect();
    const categorias = new Set<string>();

    empresas.forEach((e) => {
      if (e.categoria) {
        categorias.add(e.categoria);
      }
    });

    return Array.from(categorias).sort();
  },
});

// Listar pesquisas únicas
export const listPesquisas = query({
  handler: async (ctx) => {
    const empresas = await ctx.db.query("empresas").collect();
    const pesquisas = new Set<string>();

    empresas.forEach((e) => {
      if (e.pesquisa) {
        pesquisas.add(e.pesquisa);
      }
    });

    return Array.from(pesquisas).sort();
  },
});

// Estatísticas do funil de empresas
export const getFunilStats = query({
  handler: async (ctx) => {
    const empresas = await ctx.db.query("empresas").collect();

    return {
      total: empresas.length,
      aContatar: empresas.filter((e) => e.status === "a_contatar").length,
      contatoRealizado: empresas.filter((e) => e.status === "contato_realizado")
        .length,
      semInteresse: empresas.filter((e) => e.status === "sem_interesse").length,
      negociando: empresas.filter((e) => e.status === "negociando").length,
      convertido: empresas.filter((e) => e.status === "convertido").length,
    };
  },
});

// Buscar empresas por telefone
export const getByTelefone = query({
  args: { telefone: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("empresas")
      .withIndex("by_telefone", (q) => q.eq("telefone", args.telefone))
      .first();
  },
});

// Buscar empresas com filtros
export const listWithFilters = query({
  args: {
    status: v.optional(
      v.union(
        v.literal("a_contatar"),
        v.literal("contato_realizado"),
        v.literal("sem_interesse"),
        v.literal("negociando"),
        v.literal("convertido")
      )
    ),
    pesquisa: v.optional(v.string()),
    categoria: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let empresas;

    if (args.status) {
      empresas = await ctx.db
        .query("empresas")
        .withIndex("by_status", (q) => q.eq("status", args.status!))
        .collect();
    } else if (args.pesquisa) {
      empresas = await ctx.db
        .query("empresas")
        .withIndex("by_pesquisa", (q) => q.eq("pesquisa", args.pesquisa!))
        .collect();
    } else {
      empresas = await ctx.db.query("empresas").collect();
    }

    // Filtrar por categoria em memória se necessário
    if (args.categoria) {
      empresas = empresas.filter((e) => e.categoria === args.categoria);
    }

    // Aplicar limite
    if (args.limit && empresas.length > args.limit) {
      empresas = empresas.slice(0, args.limit);
    }

    return empresas;
  },
});
