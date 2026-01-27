import { mutation } from "../_generated/server";
import { v } from "convex/values";

// Criar ou atualizar conversa
export const createOrUpdate = mutation({
  args: {
    telefone: v.string(),
    instanceId: v.string(),
    nome: v.optional(v.string()),
    empresaId: v.optional(v.id("empresas")),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("conversas")
      .withIndex("by_telefone", (q) => q.eq("telefone", args.telefone))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        nome: args.nome || existing.nome,
        instanceId: args.instanceId,
        empresaId: args.empresaId || existing.empresaId,
      });
      return existing._id;
    }

    return await ctx.db.insert("conversas", {
      telefone: args.telefone,
      nome: args.nome,
      instanceId: args.instanceId,
      empresaId: args.empresaId,
      naoLidas: 0,
    });
  },
});

// Adicionar mensagem
export const addMensagem = mutation({
  args: {
    conversaId: v.id("conversas"),
    conteudo: v.string(),
    tipo: v.union(
      v.literal("texto"),
      v.literal("imagem"),
      v.literal("audio"),
      v.literal("documento"),
      v.literal("video")
    ),
    direcao: v.union(v.literal("enviada"), v.literal("recebida")),
    status: v.optional(
      v.union(
        v.literal("enviando"),
        v.literal("enviada"),
        v.literal("entregue"),
        v.literal("lida"),
        v.literal("erro")
      )
    ),
    mediaUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    // Criar mensagem
    const mensagemId = await ctx.db.insert("mensagens", {
      conversaId: args.conversaId,
      conteudo: args.conteudo,
      tipo: args.tipo,
      direcao: args.direcao,
      status: args.status || (args.direcao === "enviada" ? "enviada" : "entregue"),
      mediaUrl: args.mediaUrl,
      timestamp: now,
    });

    // Atualizar conversa
    const conversa = await ctx.db.get(args.conversaId);
    if (conversa) {
      await ctx.db.patch(args.conversaId, {
        ultimaMensagem: args.conteudo,
        ultimaMensagemEm: now,
        naoLidas:
          args.direcao === "recebida" ? conversa.naoLidas + 1 : conversa.naoLidas,
      });
    }

    return mensagemId;
  },
});

// Marcar mensagens como lidas
export const marcarLidas = mutation({
  args: { conversaId: v.id("conversas") },
  handler: async (ctx, args) => {
    // Resetar contador de não lidas
    await ctx.db.patch(args.conversaId, { naoLidas: 0 });

    // Marcar mensagens recebidas como lidas
    const mensagens = await ctx.db
      .query("mensagens")
      .withIndex("by_conversa", (q) => q.eq("conversaId", args.conversaId))
      .collect();

    for (const msg of mensagens) {
      if (msg.direcao === "recebida" && msg.status !== "lida") {
        await ctx.db.patch(msg._id, { status: "lida" });
      }
    }

    return args.conversaId;
  },
});

// Atualizar status da mensagem
export const updateMensagemStatus = mutation({
  args: {
    id: v.id("mensagens"),
    status: v.union(
      v.literal("enviando"),
      v.literal("enviada"),
      v.literal("entregue"),
      v.literal("lida"),
      v.literal("erro")
    ),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { status: args.status });
    return args.id;
  },
});

// Remover conversa
export const remove = mutation({
  args: { id: v.id("conversas") },
  handler: async (ctx, args) => {
    // Remover mensagens
    const mensagens = await ctx.db
      .query("mensagens")
      .withIndex("by_conversa", (q) => q.eq("conversaId", args.id))
      .collect();

    for (const msg of mensagens) {
      await ctx.db.delete(msg._id);
    }

    await ctx.db.delete(args.id);
  },
});
