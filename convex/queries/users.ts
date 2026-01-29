import { query } from "../_generated/server";
import { v } from "convex/values";

// Buscar usuário por ID
export const getById = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) return null;

    // Não retornar a senha
    return {
      id: user._id,
      email: user.email,
      nome: user.nome,
      role: user.role,
      ativo: user.ativo,
      createdAt: user.createdAt,
      lastLogin: user.lastLogin,
    };
  },
});

// Listar todos os usuários (admin)
export const list = query({
  args: {},
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect();

    return users.map((user) => ({
      id: user._id,
      email: user.email,
      nome: user.nome,
      role: user.role,
      ativo: user.ativo,
      createdAt: user.createdAt,
      lastLogin: user.lastLogin,
    }));
  },
});
