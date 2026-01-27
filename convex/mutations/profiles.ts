import { mutation } from "../_generated/server";
import { v } from "convex/values";

// Criar ou atualizar perfil
export const createOrUpdate = mutation({
  args: {
    clerkId: v.string(),
    email: v.string(),
    nome: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Verificar se perfil já existe
    const existing = await ctx.db
      .query("profiles")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .unique();

    if (existing) {
      // Atualizar perfil existente
      await ctx.db.patch(existing._id, {
        email: args.email,
        nome: args.nome,
        avatarUrl: args.avatarUrl,
      });
      return existing._id;
    }

    // Criar novo perfil
    return await ctx.db.insert("profiles", {
      clerkId: args.clerkId,
      email: args.email,
      nome: args.nome,
      avatarUrl: args.avatarUrl,
      createdAt: Date.now(),
    });
  },
});

// Atualizar perfil
export const update = mutation({
  args: {
    id: v.id("profiles"),
    nome: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    await ctx.db.patch(id, updates);
    return id;
  },
});

// Remover perfil
export const remove = mutation({
  args: { id: v.id("profiles") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
