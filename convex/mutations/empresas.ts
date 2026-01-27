import { mutation } from "../_generated/server";
import { v } from "convex/values";

// Criar empresa
export const create = mutation({
  args: {
    titulo: v.string(),
    endereco: v.optional(v.string()),
    categoria: v.optional(v.string()),
    telefone: v.optional(v.string()),
    website: v.optional(v.string()),
    avaliacao: v.optional(v.number()),
    totalAvaliacoes: v.optional(v.number()),
    placeId: v.optional(v.string()),
    latitude: v.optional(v.number()),
    longitude: v.optional(v.number()),
    pesquisa: v.optional(v.string()),
    status: v.optional(
      v.union(
        v.literal("a_contatar"),
        v.literal("contato_realizado"),
        v.literal("sem_interesse"),
        v.literal("negociando"),
        v.literal("convertido")
      )
    ),
    notas: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("empresas", {
      titulo: args.titulo,
      endereco: args.endereco,
      categoria: args.categoria,
      telefone: args.telefone,
      website: args.website,
      avaliacao: args.avaliacao,
      totalAvaliacoes: args.totalAvaliacoes,
      placeId: args.placeId,
      latitude: args.latitude,
      longitude: args.longitude,
      pesquisa: args.pesquisa,
      status: args.status || "a_contatar",
      capturadoEm: Date.now(),
      notas: args.notas,
    });
  },
});

// Criar múltiplas empresas
export const createMany = mutation({
  args: {
    empresas: v.array(
      v.object({
        titulo: v.string(),
        endereco: v.optional(v.string()),
        categoria: v.optional(v.string()),
        telefone: v.optional(v.string()),
        website: v.optional(v.string()),
        avaliacao: v.optional(v.number()),
        totalAvaliacoes: v.optional(v.number()),
        placeId: v.optional(v.string()),
        latitude: v.optional(v.number()),
        longitude: v.optional(v.number()),
        pesquisa: v.optional(v.string()),
      })
    ),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const ids = [];

    for (const empresa of args.empresas) {
      // Verificar se empresa já existe pelo placeId ou telefone
      let existing = null;

      if (empresa.placeId) {
        existing = await ctx.db
          .query("empresas")
          .withIndex("by_place_id", (q) => q.eq("placeId", empresa.placeId))
          .first();
      }

      if (!existing && empresa.telefone) {
        existing = await ctx.db
          .query("empresas")
          .withIndex("by_telefone", (q) => q.eq("telefone", empresa.telefone))
          .first();
      }

      if (existing) {
        // Empresa já existe, pular
        continue;
      }

      const id = await ctx.db.insert("empresas", {
        ...empresa,
        status: "a_contatar",
        capturadoEm: now,
      });
      ids.push(id);
    }

    return { inserted: ids.length, total: args.empresas.length };
  },
});

// Atualizar empresa
export const update = mutation({
  args: {
    id: v.id("empresas"),
    titulo: v.optional(v.string()),
    endereco: v.optional(v.string()),
    categoria: v.optional(v.string()),
    telefone: v.optional(v.string()),
    website: v.optional(v.string()),
    avaliacao: v.optional(v.number()),
    totalAvaliacoes: v.optional(v.number()),
    notas: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    await ctx.db.patch(id, updates);
    return id;
  },
});

// Atualizar status da empresa
export const updateStatus = mutation({
  args: {
    id: v.id("empresas"),
    status: v.union(
      v.literal("a_contatar"),
      v.literal("contato_realizado"),
      v.literal("sem_interesse"),
      v.literal("negociando"),
      v.literal("convertido")
    ),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      status: args.status,
      ultimoContato: Date.now(),
    });
    return args.id;
  },
});

// Atualizar status de múltiplas empresas
export const updateManyStatus = mutation({
  args: {
    ids: v.array(v.id("empresas")),
    status: v.union(
      v.literal("a_contatar"),
      v.literal("contato_realizado"),
      v.literal("sem_interesse"),
      v.literal("negociando"),
      v.literal("convertido")
    ),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    for (const id of args.ids) {
      await ctx.db.patch(id, {
        status: args.status,
        ultimoContato: now,
      });
    }
    return args.ids.length;
  },
});

// Remover empresa
export const remove = mutation({
  args: { id: v.id("empresas") },
  handler: async (ctx, args) => {
    // Remover disparos relacionados
    const disparos = await ctx.db
      .query("disparosAgendados")
      .withIndex("by_empresa", (q) => q.eq("empresaId", args.id))
      .collect();

    for (const disparo of disparos) {
      await ctx.db.delete(disparo._id);
    }

    await ctx.db.delete(args.id);
  },
});

// Remover múltiplas empresas
export const removeMany = mutation({
  args: { ids: v.array(v.id("empresas")) },
  handler: async (ctx, args) => {
    for (const id of args.ids) {
      // Remover disparos relacionados
      const disparos = await ctx.db
        .query("disparosAgendados")
        .withIndex("by_empresa", (q) => q.eq("empresaId", id))
        .collect();

      for (const disparo of disparos) {
        await ctx.db.delete(disparo._id);
      }

      await ctx.db.delete(id);
    }
    return args.ids.length;
  },
});
