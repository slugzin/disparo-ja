"use node";
import { action } from "../_generated/server";
import { v } from "convex/values";
import { api } from "../_generated/api";

// Função auxiliar para fazer requisições à WAHA API
async function wahaRequest(
  endpoint: string,
  method: string = "GET",
  body?: Record<string, unknown>
): Promise<{ success: boolean; data?: unknown; error?: string }> {
  const baseUrl = process.env.WAHA_API_URL;
  const apiKey = process.env.WAHA_API_KEY;

  if (!baseUrl) {
    return { success: false, error: "WAHA_API_URL não configurada" };
  }

  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (apiKey) {
      headers["Authorization"] = `Bearer ${apiKey}`;
    }

    const response = await fetch(`${baseUrl}${endpoint}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.message || `Erro ${response.status}`,
      };
    }

    return { success: true, data };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro de conexão",
    };
  }
}

// Criar nova instância WhatsApp
export const createInstance = action({
  args: {
    instanceName: v.string(),
  },
  handler: async (ctx, args): Promise<{
    success: boolean;
    instanceId?: string;
    error?: string;
  }> => {
    const result = await wahaRequest("/api/sessions", "POST", {
      name: args.instanceName,
    });

    if (!result.success) {
      return { success: false, error: result.error };
    }

    const data = result.data as { name: string };
    const instanceId = data.name || args.instanceName;

    // Salvar instância no banco
    await ctx.runMutation(api.mutations.whatsappInstances.create, {
      instanceName: args.instanceName,
      instanceId,
      status: "disconnected",
    });

    return { success: true, instanceId };
  },
});

// Conectar instância (gerar QR Code)
export const connectInstance = action({
  args: {
    instanceId: v.string(),
  },
  handler: async (ctx, args): Promise<{
    success: boolean;
    qrcode?: string;
    error?: string;
  }> => {
    const result = await wahaRequest(
      `/api/sessions/${args.instanceId}/start`,
      "POST"
    );

    if (!result.success) {
      return { success: false, error: result.error };
    }

    // Buscar QR Code
    const qrResult = await wahaRequest(
      `/api/${args.instanceId}/auth/qr?format=raw`
    );

    if (!qrResult.success) {
      return { success: false, error: qrResult.error };
    }

    const qrcode = (qrResult.data as { value?: string })?.value || String(qrResult.data);

    // Atualizar status no banco
    await ctx.runMutation(api.mutations.whatsappInstances.updateStatusByInstanceId, {
      instanceId: args.instanceId,
      status: "qrcode",
      qrcode,
    });

    return { success: true, qrcode };
  },
});

// Sincronizar status da instância
export const syncStatus = action({
  args: {
    instanceId: v.string(),
  },
  handler: async (ctx, args): Promise<{
    success: boolean;
    status?: string;
    profile?: {
      name?: string;
      picture?: string;
      jid?: string;
    };
    error?: string;
  }> => {
    const result = await wahaRequest(`/api/sessions/${args.instanceId}`);

    if (!result.success) {
      return { success: false, error: result.error };
    }

    const data = result.data as {
      status?: string;
      me?: {
        pushName?: string;
        profilePicUrl?: string;
        id?: string;
      };
    };

    const status = data.status === "WORKING" ? "connected" : "disconnected";
    const profile = data.me;

    // Atualizar no banco
    await ctx.runMutation(api.mutations.whatsappInstances.updateStatusByInstanceId, {
      instanceId: args.instanceId,
      status: status as "connected" | "disconnected",
      profileName: profile?.pushName,
      profilePicUrl: profile?.profilePicUrl,
      ownerJid: profile?.id,
    });

    return {
      success: true,
      status,
      profile: profile
        ? {
            name: profile.pushName,
            picture: profile.profilePicUrl,
            jid: profile.id,
          }
        : undefined,
    };
  },
});

// Enviar mensagem de texto
export const sendMessage = action({
  args: {
    instanceId: v.string(),
    telefone: v.string(),
    mensagem: v.string(),
  },
  handler: async (ctx, args): Promise<{
    success: boolean;
    messageId?: string;
    error?: string;
  }> => {
    // Formatar número de telefone (remover caracteres especiais, adicionar código do país)
    let phone = args.telefone.replace(/\D/g, "");
    if (!phone.startsWith("55")) {
      phone = "55" + phone;
    }
    phone = phone + "@c.us";

    const result = await wahaRequest(
      `/api/sendText`,
      "POST",
      {
        session: args.instanceId,
        chatId: phone,
        text: args.mensagem,
      }
    );

    if (!result.success) {
      return { success: false, error: result.error };
    }

    const data = result.data as { id?: string };

    return { success: true, messageId: data.id };
  },
});

// Desconectar instância
export const disconnectInstance = action({
  args: {
    instanceId: v.string(),
  },
  handler: async (ctx, args): Promise<{
    success: boolean;
    error?: string;
  }> => {
    const result = await wahaRequest(
      `/api/sessions/${args.instanceId}/stop`,
      "POST"
    );

    if (!result.success) {
      return { success: false, error: result.error };
    }

    // Atualizar status no banco
    await ctx.runMutation(api.mutations.whatsappInstances.updateStatusByInstanceId, {
      instanceId: args.instanceId,
      status: "disconnected",
    });

    return { success: true };
  },
});

// Deletar instância
export const deleteInstance = action({
  args: {
    instanceId: v.string(),
  },
  handler: async (ctx, args): Promise<{
    success: boolean;
    error?: string;
  }> => {
    const result = await wahaRequest(
      `/api/sessions/${args.instanceId}`,
      "DELETE"
    );

    if (!result.success) {
      return { success: false, error: result.error };
    }

    // Remover do banco
    await ctx.runMutation(api.mutations.whatsappInstances.removeByInstanceId, {
      instanceId: args.instanceId,
    });

    return { success: true };
  },
});

// Listar todas as instâncias da WAHA
export const listInstances = action({
  args: {},
  handler: async (): Promise<{
    success: boolean;
    instances?: Array<{ name: string; status: string }>;
    error?: string;
  }> => {
    const result = await wahaRequest("/api/sessions");

    if (!result.success) {
      return { success: false, error: result.error };
    }

    return { success: true, instances: result.data as Array<{ name: string; status: string }> };
  },
});
