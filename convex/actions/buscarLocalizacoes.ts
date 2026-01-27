"use node";
import { action } from "../_generated/server";
import { v } from "convex/values";

interface SerperAutocomplete {
  value: string;
  // outros campos opcionais que podem vir da API
}

interface SerperSuggestion {
  value: string;
}

// Buscar sugestões de localização
export const buscarSugestoes = action({
  args: {
    query: v.string(),
  },
  handler: async (ctx, args): Promise<{
    success: boolean;
    sugestoes?: string[];
    error?: string;
  }> => {
    const apiKey = process.env.SERPER_API_KEY;

    if (!apiKey) {
      return { success: false, error: "SERPER_API_KEY não configurada" };
    }

    try {
      const response = await fetch("https://google.serper.dev/autocomplete", {
        method: "POST",
        headers: {
          "X-API-KEY": apiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          q: args.query,
          gl: "br",
          hl: "pt-br",
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        return { success: false, error: `Erro na API: ${error}` };
      }

      const data = await response.json();

      // Filtrar apenas localizações (cidades, estados, etc)
      const sugestoes = (data.suggestions || [])
        .map((s: SerperAutocomplete | SerperSuggestion) => s.value)
        .filter((s: string) =>
          s.toLowerCase().includes("brasil") ||
          s.toLowerCase().includes("br") ||
          /\b(sp|rj|mg|ba|pr|rs|sc|pe|ce|go|pa|ma|am|es|pb|rn|pi|al|se|mt|ms|df|ro|to|ac|ap|rr)\b/i.test(s)
        )
        .slice(0, 10);

      return { success: true, sugestoes };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Erro desconhecido",
      };
    }
  },
});

// Lista de cidades brasileiras pré-definidas (fallback)
export const listarCidadesBrasileiras = action({
  args: {},
  handler: async (): Promise<{ cidades: string[] }> => {
    const cidades = [
      "São Paulo, SP",
      "Rio de Janeiro, RJ",
      "Belo Horizonte, MG",
      "Salvador, BA",
      "Brasília, DF",
      "Fortaleza, CE",
      "Curitiba, PR",
      "Recife, PE",
      "Porto Alegre, RS",
      "Manaus, AM",
      "Belém, PA",
      "Goiânia, GO",
      "Guarulhos, SP",
      "Campinas, SP",
      "São Luís, MA",
      "São Gonçalo, RJ",
      "Maceió, AL",
      "Duque de Caxias, RJ",
      "Natal, RN",
      "Teresina, PI",
      "Campo Grande, MS",
      "São Bernardo do Campo, SP",
      "Nova Iguaçu, RJ",
      "João Pessoa, PB",
      "Santo André, SP",
      "Osasco, SP",
      "São José dos Campos, SP",
      "Ribeirão Preto, SP",
      "Jaboatão dos Guararapes, PE",
      "Uberlândia, MG",
    ];

    return { cidades };
  },
});
