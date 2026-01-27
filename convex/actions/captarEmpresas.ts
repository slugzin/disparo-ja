"use node";
import { action } from "../_generated/server";
import { v } from "convex/values";
import { api } from "../_generated/api";

interface SerperResult {
  title: string;
  address?: string;
  phone?: string;
  website?: string;
  rating?: number;
  ratingCount?: number;
  category?: string;
  placeId?: string;
  latitude?: number;
  longitude?: number;
}

interface SerperResponse {
  places?: SerperResult[];
}

// Buscar empresas via Serper API (Google Places)
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
          num: limit,
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        return { success: false, error: `Erro na API Serper: ${error}` };
      }

      const data: SerperResponse = await response.json();

      if (!data.places || data.places.length === 0) {
        return { success: true, empresas: [], total: 0 };
      }

      const empresas = data.places.map((place: SerperResult) => ({
        titulo: place.title,
        endereco: place.address,
        telefone: place.phone,
        website: place.website,
        avaliacao: place.rating,
        totalAvaliacoes: place.ratingCount,
        categoria: place.category,
        placeId: place.placeId,
        latitude: place.latitude,
        longitude: place.longitude,
      }));

      return {
        success: true,
        empresas,
        total: empresas.length,
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
