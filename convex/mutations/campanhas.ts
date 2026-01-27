import { mutation } from "../_generated/server";
import { v } from "convex/values";

// Criar campanha
export const create = mutation({
  args: {
    nome: v.optional(v.string()),
    conexaoId: v.string(),
    mensagem: v.string(),
    empresaIds: v.array(v.id("empresas")),
    intervaloMinutos: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    // Criar a campanha
    const campanhaId = await ctx.db.insert("campanhasDisparo", {
      nome: args.nome || `Campanha ${new Date().toLocaleDateString("pt-BR")}`,
      conexaoId: args.conexaoId,
      mensagem: args.mensagem,
      totalEmpresas: args.empresaIds.length,
      totalEnviados: 0,
      totalErros: 0,
      status: "em_andamento",
      criadoEm: now,
    });

    // Agendar disparos
    const intervalo = (args.intervaloMinutos || 1) * 60 * 1000;

    for (let i = 0; i < args.empresaIds.length; i++) {
      const empresaId = args.empresaIds[i];
      const empresa = await ctx.db.get(empresaId);

      if (!empresa || !empresa.telefone) continue;

      await ctx.db.insert("disparosAgendados", {
        empresaId,
        empresaTitulo: empresa.titulo,
        empresaTelefone: empresa.telefone,
        mensagem: args.mensagem,
        status: "pendente",
        agendadoPara: now + i * intervalo,
        conexaoId: args.conexaoId,
        campanhaId,
        createdAt: now,
      });
    }

    return campanhaId;
  },
});

// Atualizar campanha
export const update = mutation({
  args: {
    id: v.id("campanhasDisparo"),
    nome: v.optional(v.string()),
    status: v.optional(
      v.union(
        v.literal("em_andamento"),
        v.literal("concluida"),
        v.literal("pausada"),
        v.literal("cancelada")
      )
    ),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;

    if (updates.status === "concluida") {
      (updates as Record<string, unknown>).concluidoEm = Date.now();
    }

    await ctx.db.patch(id, updates);
    return id;
  },
});

// Pausar campanha
export const pausar = mutation({
  args: { id: v.id("campanhasDisparo") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { status: "pausada" });

    // Pausar disparos pendentes
    const disparos = await ctx.db
      .query("disparosAgendados")
      .withIndex("by_campanha", (q) => q.eq("campanhaId", args.id))
      .collect();

    for (const disparo of disparos) {
      if (disparo.status === "pendente") {
        await ctx.db.patch(disparo._id, { status: "cancelado" });
      }
    }

    return args.id;
  },
});

// Retomar campanha
export const retomar = mutation({
  args: { id: v.id("campanhasDisparo") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { status: "em_andamento" });

    // Reativar disparos cancelados
    const disparos = await ctx.db
      .query("disparosAgendados")
      .withIndex("by_campanha", (q) => q.eq("campanhaId", args.id))
      .collect();

    const now = Date.now();
    let offset = 0;

    for (const disparo of disparos) {
      if (disparo.status === "cancelado") {
        await ctx.db.patch(disparo._id, {
          status: "pendente",
          agendadoPara: now + offset * 60 * 1000, // 1 minuto entre cada
        });
        offset++;
      }
    }

    return args.id;
  },
});

// Cancelar campanha
export const cancelar = mutation({
  args: { id: v.id("campanhasDisparo") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { status: "cancelada" });

    // Cancelar todos os disparos pendentes
    const disparos = await ctx.db
      .query("disparosAgendados")
      .withIndex("by_campanha", (q) => q.eq("campanhaId", args.id))
      .collect();

    for (const disparo of disparos) {
      if (disparo.status === "pendente" || disparo.status === "enviando") {
        await ctx.db.patch(disparo._id, { status: "cancelado" });
      }
    }

    return args.id;
  },
});

// Verificar e marcar campanha como concluída
export const verificarConclusao = mutation({
  args: { id: v.id("campanhasDisparo") },
  handler: async (ctx, args) => {
    const campanha = await ctx.db.get(args.id);
    if (!campanha) return;

    const disparos = await ctx.db
      .query("disparosAgendados")
      .withIndex("by_campanha", (q) => q.eq("campanhaId", args.id))
      .collect();

    const pendentes = disparos.filter(
      (d) => d.status === "pendente" || d.status === "enviando"
    );

    if (pendentes.length === 0 && campanha.status === "em_andamento") {
      await ctx.db.patch(args.id, {
        status: "concluida",
        concluidoEm: Date.now(),
      });
    }

    return args.id;
  },
});

// Remover campanha
export const remove = mutation({
  args: { id: v.id("campanhasDisparo") },
  handler: async (ctx, args) => {
    // Remover disparos relacionados
    const disparos = await ctx.db
      .query("disparosAgendados")
      .withIndex("by_campanha", (q) => q.eq("campanhaId", args.id))
      .collect();

    for (const disparo of disparos) {
      await ctx.db.delete(disparo._id);
    }

    await ctx.db.delete(args.id);
  },
});
