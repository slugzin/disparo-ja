"use node";
import { action } from "../_generated/server";
import { v } from "convex/values";
import { api } from "../_generated/api";

interface SerperResult {
  title: string;
  address?: string;
  phoneNumber?: string;
  website?: string;
  rating?: number;
  ratingCount?: number;
  category?: string;
  cid?: string;
  latitude?: number;
  longitude?: number;
}

interface SerperResponse {
  places?: SerperResult[];
}

// Buscar empresas via Serper API (Google Places)
// A API retorna ~10 resultados por página, então fazemos múltiplas requisições
export const buscarEmpresas = action({
  args: {
    termo: v.string(),
    localizacao: v.string(),
    limite: v.optional(v.number()),
  },
  handler: async (ctx, args): Promise<{
    success: boolean;
    empresas?: Array<{
      titulo: string;
      endereco?: string;
      telefone?: string;
      website?: string;
      avaliacao?: number;
      totalAvaliacoes?: number;
      categoria?: string;
      placeId?: string;
      latitude?: number;
      longitude?: number;
    }>;
    total?: number;
    error?: string;
  }> => {
    const apiKey = process.env.SERPER_API_KEY;

    if (!apiKey) {
      return { success: false, error: "SERPER_API_KEY não configurada" };
    }

    try {
      const query = `${args.termo} em ${args.localizacao}`;
      const limit = args.limite || 20;
      const RESULTS_PER_PAGE = 10;
      const totalPages = Math.ceil(limit / RESULTS_PER_PAGE);

      const allEmpresas: Array<{
        titulo: string;
        endereco?: string;
        telefone?: string;
        website?: string;
        avaliacao?: number;
        totalAvaliacoes?: number;
        categoria?: string;
        placeId?: string;
        latitude?: number;
        longitude?: number;
      }> = [];

      // Buscar cada página
      for (let page = 1; page <= totalPages; page++) {
        const response = await fetch("https://google.serper.dev/places", {
          method: "POST",
          headers: {
            "X-API-KEY": apiKey,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            q: query,
            gl: "br",
            hl: "pt-br",
            page: page,
          }),
        });

        if (!response.ok) {
          const error = await response.text();
          // Se já temos alguns resultados, retornar o que temos
          if (allEmpresas.length > 0) {
            console.warn(`Erro na página ${page}, retornando resultados parciais: ${error}`);
            break;
          }
          return { success: false, error: `Erro na API Serper: ${error}` };
        }

        const data: SerperResponse = await response.json();

        if (!data.places || data.places.length === 0) {
          // Não há mais resultados
          break;
        }

        const empresasDaPagina = data.places.map((place: SerperResult) => ({
          titulo: place.title,
          endereco: place.address,
          telefone: place.phoneNumber,
          website: place.website,
          avaliacao: place.rating,
          totalAvaliacoes: place.ratingCount,
          categoria: place.category,
          placeId: place.cid,
          latitude: place.latitude,
          longitude: place.longitude,
        }));

        allEmpresas.push(...empresasDaPagina);

        // Se já temos o suficiente, parar
        if (allEmpresas.length >= limit) {
          break;
        }

        // Pequena pausa entre requisições para não sobrecarregar a API
        if (page < totalPages) {
          await new Promise((resolve) => setTimeout(resolve, 200));
        }
      }

      // Limitar ao número solicitado
      const empresasLimitadas = allEmpresas.slice(0, limit);

      return {
        success: true,
        empresas: empresasLimitadas,
        total: empresasLimitadas.length,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Erro desconhecido",
      };
    }
  },
});

// Captar e salvar empresas
export const captarESalvar = action({
  args: {
    termo: v.string(),
    localizacao: v.string(),
    limite: v.optional(v.number()),
  },
  handler: async (ctx, args): Promise<{
    success: boolean;
    inserted?: number;
    duplicates?: number;
    total?: number;
    error?: string;
  }> => {
    // Buscar empresas
    const resultado = await ctx.runAction(api.actions.captarEmpresas.buscarEmpresas, {
      termo: args.termo,
      localizacao: args.localizacao,
      limite: args.limite,
    });

    if (!resultado.success || !resultado.empresas) {
      return { success: false, error: resultado.error };
    }

    // Salvar empresas no banco
    const empresasParaSalvar = resultado.empresas.map((e) => ({
      ...e,
      pesquisa: `${args.termo} - ${args.localizacao}`,
    }));

    const resultadoSalvar = await ctx.runMutation(
      api.mutations.empresas.createMany,
      { empresas: empresasParaSalvar }
    );

    return {
      success: true,
      inserted: resultadoSalvar.inserted,
      duplicates: resultado.total! - resultadoSalvar.inserted,
      total: resultado.total,
    };
  },
});
