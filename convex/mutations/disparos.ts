import { mutation } from "../_generated/server";
import { v } from "convex/values";

// Agendar disparos para uma lista de empresas
export const agendarDisparos = mutation({
  args: {
    empresaIds: v.array(v.id("empresas")),
    mensagem: v.string(),
    conexaoId: v.string(),
    campanhaId: v.optional(v.id("campanhasDisparo")),
    intervaloMinutos: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const intervalo = (args.intervaloMinutos || 1) * 60 * 1000; // Converter para ms
    const now = Date.now();
    const ids = [];

    for (let i = 0; i < args.empresaIds.length; i++) {
      const empresaId = args.empresaIds[i];
      const empresa = await ctx.db.get(empresaId);

      if (!empresa || !empresa.telefone) continue;

      const id = await ctx.db.insert("disparosAgendados", {
        empresaId,
        empresaTitulo: empresa.titulo,
        empresaTelefone: empresa.telefone,
        mensagem: args.mensagem,
        status: "pendente",
        agendadoPara: now + i * intervalo,
        conexaoId: args.conexaoId,
        campanhaId: args.campanhaId,
        createdAt: now,
      });

      ids.push(id);
    }

    return { agendados: ids.length };
  },
});

// Criar disparo individual
export const create = mutation({
  args: {
    empresaId: v.id("empresas"),
    mensagem: v.string(),
    conexaoId: v.string(),
    agendadoPara: v.number(),
    campanhaId: v.optional(v.id("campanhasDisparo")),
  },
  handler: async (ctx, args) => {
    const empresa = await ctx.db.get(args.empresaId);
    if (!empresa) throw new Error("Empresa não encontrada");
    if (!empresa.telefone) throw new Error("Empresa sem telefone");

    return await ctx.db.insert("disparosAgendados", {
      empresaId: args.empresaId,
      empresaTitulo: empresa.titulo,
      empresaTelefone: empresa.telefone,
      mensagem: args.mensagem,
      status: "pendente",
      agendadoPara: args.agendadoPara,
      conexaoId: args.conexaoId,
      campanhaId: args.campanhaId,
      createdAt: Date.now(),
    });
  },
});

// Marcar disparo como enviado
export const marcarEnviado = mutation({
  args: { id: v.id("disparosAgendados") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      status: "enviado",
      enviadoEm: Date.now(),
    });

    // Atualizar campanha se existir
    const disparo = await ctx.db.get(args.id);
    if (disparo?.campanhaId) {
      const campanha = await ctx.db.get(disparo.campanhaId);
      if (campanha) {
        await ctx.db.patch(disparo.campanhaId, {
          totalEnviados: campanha.totalEnviados + 1,
        });
      }
    }

    return args.id;
  },
});

// Marcar disparo com erro
export const marcarErro = mutation({
  args: {
    id: v.id("disparosAgendados"),
    erro: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      status: "erro",
      erro: args.erro,
    });

    // Atualizar campanha se existir
    const disparo = await ctx.db.get(args.id);
    if (disparo?.campanhaId) {
      const campanha = await ctx.db.get(disparo.campanhaId);
      if (campanha) {
        await ctx.db.patch(disparo.campanhaId, {
          totalErros: campanha.totalErros + 1,
        });
      }
    }

    return args.id;
  },
});

// Atualizar status do disparo
export const atualizarStatus = mutation({
  args: {
    id: v.id("disparosAgendados"),
    status: v.union(
      v.literal("pendente"),
      v.literal("enviando"),
      v.literal("enviado"),
      v.literal("erro"),
      v.literal("cancelado")
    ),
    erro: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const updates: Record<string, unknown> = { status: args.status };

    if (args.status === "enviado") {
      updates.enviadoEm = Date.now();
    }

    if (args.erro) {
      updates.erro = args.erro;
    }

    await ctx.db.patch(args.id, updates);
    return args.id;
  },
});

// Cancelar disparo
export const cancelar = mutation({
  args: { id: v.id("disparosAgendados") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { status: "cancelado" });
    return args.id;
  },
});

// Cancelar múltiplos disparos
export const cancelarMany = mutation({
  args: { ids: v.array(v.id("disparosAgendados")) },
  handler: async (ctx, args) => {
    for (const id of args.ids) {
      await ctx.db.patch(id, { status: "cancelado" });
    }
    return args.ids.length;
  },
});

// Remover disparo
export const remove = mutation({
  args: { id: v.id("disparosAgendados") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
