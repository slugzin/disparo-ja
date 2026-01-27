"use node";
import { action, internalAction } from "../_generated/server";
import { v } from "convex/values";
import { api, internal } from "../_generated/api";

// Processar próximo disparo da fila
export const processarProximo = action({
  args: {},
  handler: async (ctx): Promise<{
    success: boolean;
    processed?: boolean;
    disparoId?: string;
    error?: string;
  }> => {
    // Buscar próximo disparo pendente
    const disparos = await ctx.runQuery(api.queries.disparos.listPendentes);

    if (disparos.length === 0) {
      return { success: true, processed: false };
    }

    // Pegar o primeiro disparo que já passou do horário agendado
    const now = Date.now();
    const disparo = disparos.find((d) => d.agendadoPara <= now);

    if (!disparo) {
      return { success: true, processed: false };
    }

    // Marcar como enviando
    await ctx.runMutation(api.mutations.disparos.atualizarStatus, {
      id: disparo._id,
      status: "enviando",
    });

    try {
      // Enviar mensagem
      const resultado = await ctx.runAction(api.actions.evolutionApi.sendMessage, {
        instanceId: disparo.conexaoId,
        telefone: disparo.empresaTelefone,
        mensagem: disparo.mensagem,
      });

      if (resultado.success) {
        // Marcar como enviado
        await ctx.runMutation(api.mutations.disparos.marcarEnviado, {
          id: disparo._id,
        });

        // Atualizar status da empresa
        await ctx.runMutation(api.mutations.empresas.updateStatus, {
          id: disparo.empresaId,
          status: "contato_realizado",
        });

        return { success: true, processed: true, disparoId: disparo._id };
      } else {
        // Marcar erro
        await ctx.runMutation(api.mutations.disparos.marcarErro, {
          id: disparo._id,
          erro: resultado.error || "Erro desconhecido",
        });

        return {
          success: false,
          error: resultado.error,
          disparoId: disparo._id,
        };
      }
    } catch (error) {
      // Marcar erro
      await ctx.runMutation(api.mutations.disparos.marcarErro, {
        id: disparo._id,
        erro: error instanceof Error ? error.message : "Erro desconhecido",
      });

      return {
        success: false,
        error: error instanceof Error ? error.message : "Erro desconhecido",
        disparoId: disparo._id,
      };
    }
  },
});

// Processar múltiplos disparos
export const processarLote = action({
  args: {
    limite: v.optional(v.number()),
  },
  handler: async (ctx, args): Promise<{
    success: boolean;
    enviados: number;
    erros: number;
  }> => {
    const limite = args.limite || 10;
    let enviados = 0;
    let erros = 0;

    for (let i = 0; i < limite; i++) {
      const resultado = await ctx.runAction(
        api.actions.processarDisparos.processarProximo,
        {}
      );

      if (!resultado.processed) {
        // Não há mais disparos para processar
        break;
      }

      if (resultado.success) {
        enviados++;
      } else {
        erros++;
      }

      // Aguardar um pouco entre cada disparo para evitar bloqueio
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }

    return { success: true, enviados, erros };
  },
});

// Verificar campanhas concluídas
export const verificarCampanhasConcluidas = action({
  args: {},
  handler: async (ctx): Promise<{
    success: boolean;
    campanhasVerificadas: number;
  }> => {
    // Buscar campanhas em andamento
    const campanhas = await ctx.runQuery(api.queries.campanhas.listByStatus, {
      status: "em_andamento",
    });

    let verificadas = 0;

    for (const campanha of campanhas) {
      await ctx.runMutation(api.mutations.campanhas.verificarConclusao, {
        id: campanha._id,
      });
      verificadas++;
    }

    return { success: true, campanhasVerificadas: verificadas };
  },
});
