import { query } from "../_generated/server";
import { v } from "convex/values";

// Listar todas as instâncias
export const list = query({
  handler: async (ctx) => {
    return await ctx.db.query("whatsappInstances").order("desc").collect();
  },
});

// Buscar instância por ID
export const getById = query({
  args: { id: v.id("whatsappInstances") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Buscar instância por instanceId
export const getByInstanceId = query({
  args: { instanceId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("whatsappInstances")
      .withIndex("by_instance_id", (q) => q.eq("instanceId", args.instanceId))
      .unique();
  },
});

// Buscar instância por nome
export const getByInstanceName = query({
  args: { instanceName: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("whatsappInstances")
      .withIndex("by_instance_name", (q) =>
        q.eq("instanceName", args.instanceName)
      )
      .unique();
  },
});

// Listar instâncias conectadas
export const listConnected = query({
  handler: async (ctx) => {
    return await ctx.db
      .query("whatsappInstances")
      .withIndex("by_status", (q) => q.eq("status", "connected"))
      .collect();
  },
});

// Listar instâncias por status
export const listByStatus = query({
  args: {
    status: v.union(
      v.literal("connected"),
      v.literal("disconnected"),
      v.literal("connecting"),
      v.literal("qrcode")
    ),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("whatsappInstances")
      .withIndex("by_status", (q) => q.eq("status", args.status))
      .collect();
  },
});

// Estatísticas de instâncias
export const getStats = query({
  handler: async (ctx) => {
    const instances = await ctx.db.query("whatsappInstances").collect();

    return {
      total: instances.length,
      connected: instances.filter((i) => i.status === "connected").length,
      disconnected: instances.filter((i) => i.status === "disconnected").length,
      connecting: instances.filter((i) => i.status === "connecting").length,
      qrcode: instances.filter((i) => i.status === "qrcode").length,
    };
  },
});
