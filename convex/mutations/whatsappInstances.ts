import { mutation } from "../_generated/server";
import { v } from "convex/values";

// Criar instância
export const create = mutation({
  args: {
    instanceName: v.string(),
    instanceId: v.string(),
    status: v.optional(
      v.union(
        v.literal("connected"),
        v.literal("disconnected"),
        v.literal("connecting"),
        v.literal("qrcode")
      )
    ),
  },
  handler: async (ctx, args) => {
    // Verificar se já existe instância com mesmo nome ou ID
    const existingByName = await ctx.db
      .query("whatsappInstances")
      .withIndex("by_instance_name", (q) =>
        q.eq("instanceName", args.instanceName)
      )
      .first();

    if (existingByName) {
      throw new Error("Já existe uma instância com este nome");
    }

    const existingById = await ctx.db
      .query("whatsappInstances")
      .withIndex("by_instance_id", (q) => q.eq("instanceId", args.instanceId))
      .first();

    if (existingById) {
      throw new Error("Já existe uma instância com este ID");
    }

    return await ctx.db.insert("whatsappInstances", {
      instanceName: args.instanceName,
      instanceId: args.instanceId,
      status: args.status || "disconnected",
      createdAt: Date.now(),
    });
  },
});

// Atualizar status da instância
export const updateStatus = mutation({
  args: {
    id: v.id("whatsappInstances"),
    status: v.union(
      v.literal("connected"),
      v.literal("disconnected"),
      v.literal("connecting"),
      v.literal("qrcode")
    ),
    qrcode: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      status: args.status,
      qrcode: args.qrcode,
      lastSync: Date.now(),
    });
    return args.id;
  },
});

// Atualizar status por instanceId
export const updateStatusByInstanceId = mutation({
  args: {
    instanceId: v.string(),
    status: v.union(
      v.literal("connected"),
      v.literal("disconnected"),
      v.literal("connecting"),
      v.literal("qrcode")
    ),
    qrcode: v.optional(v.string()),
    profilePicUrl: v.optional(v.string()),
    profileName: v.optional(v.string()),
    ownerJid: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const instance = await ctx.db
      .query("whatsappInstances")
      .withIndex("by_instance_id", (q) => q.eq("instanceId", args.instanceId))
      .unique();

    if (!instance) {
      throw new Error("Instância não encontrada");
    }

    const { instanceId, ...updates } = args;
    await ctx.db.patch(instance._id, {
      ...updates,
      lastSync: Date.now(),
    });

    return instance._id;
  },
});

// Atualizar perfil da instância
export const updateProfile = mutation({
  args: {
    id: v.id("whatsappInstances"),
    profilePicUrl: v.optional(v.string()),
    profileName: v.optional(v.string()),
    ownerJid: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    await ctx.db.patch(id, {
      ...updates,
      lastSync: Date.now(),
    });
    return id;
  },
});

// Remover instância
export const remove = mutation({
  args: { id: v.id("whatsappInstances") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

// Remover instância por instanceId
export const removeByInstanceId = mutation({
  args: { instanceId: v.string() },
  handler: async (ctx, args) => {
    const instance = await ctx.db
      .query("whatsappInstances")
      .withIndex("by_instance_id", (q) => q.eq("instanceId", args.instanceId))
      .unique();

    if (instance) {
      await ctx.db.delete(instance._id);
    }
  },
});
