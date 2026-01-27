import { query } from "../_generated/server";
import { v } from "convex/values";

// Buscar perfil do usuário atual pelo clerkId
export const getCurrentProfile = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .unique();
    return profile;
  },
});

// Buscar perfil por ID
export const getById = query({
  args: { id: v.id("profiles") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Listar todos os perfis
export const list = query({
  handler: async (ctx) => {
    return await ctx.db.query("profiles").collect();
  },
});
