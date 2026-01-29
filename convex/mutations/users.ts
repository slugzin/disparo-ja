import { mutation } from "../_generated/server";
import { v } from "convex/values";

// Registrar novo usuário
export const register = mutation({
  args: {
    email: v.string(),
    senha: v.string(),
    nome: v.string(),
  },
  handler: async (ctx, args) => {
    // Verificar se email já existe
    const existing = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email.toLowerCase()))
      .first();

    if (existing) {
      throw new Error("Email já cadastrado");
    }

    // Criar usuário
    const userId = await ctx.db.insert("users", {
      email: args.email.toLowerCase(),
      senha: args.senha, // Em produção, usar bcrypt ou similar
      nome: args.nome,
      role: "user",
      ativo: true,
      createdAt: Date.now(),
    });

    return { success: true, userId };
  },
});

// Login
export const login = mutation({
  args: {
    email: v.string(),
    senha: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email.toLowerCase()))
      .first();

    if (!user) {
      throw new Error("Email ou senha incorretos");
    }

    if (!user.ativo) {
      throw new Error("Usuário desativado");
    }

    if (user.senha !== args.senha) {
      throw new Error("Email ou senha incorretos");
    }

    // Atualizar último login
    await ctx.db.patch(user._id, {
      lastLogin: Date.now(),
    });

    return {
      success: true,
      user: {
        id: user._id,
        email: user.email,
        nome: user.nome,
        role: user.role,
      },
    };
  },
});

// Criar usuário admin inicial (rodar uma vez)
export const createAdminUser = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", "admin@admin.com"))
      .first();

    if (existing) {
      return { success: false, message: "Admin já existe" };
    }

    await ctx.db.insert("users", {
      email: "admin@admin.com",
      senha: "admin123",
      nome: "Administrador",
      role: "admin",
      ativo: true,
      createdAt: Date.now(),
    });

    return { success: true, message: "Admin criado: admin@admin.com / admin123" };
  },
});
