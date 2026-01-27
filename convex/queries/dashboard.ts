import { query } from "../_generated/server";
import { v } from "convex/values";

// Estatísticas gerais do dashboard
export const getStats = query({
  handler: async (ctx) => {
    // Empresas
    const empresas = await ctx.db.query("empresas").collect();
    const empresasStats = {
      total: empresas.length,
      aContatar: empresas.filter((e) => e.status === "a_contatar").length,
      contatoRealizado: empresas.filter((e) => e.status === "contato_realizado")
        .length,
      negociando: empresas.filter((e) => e.status === "negociando").length,
      convertido: empresas.filter((e) => e.status === "convertido").length,
    };

    // Campanhas
    const campanhas = await ctx.db.query("campanhasDisparo").collect();
    const campanhasStats = {
      total: campanhas.length,
      emAndamento: campanhas.filter((c) => c.status === "em_andamento").length,
      concluidas: campanhas.filter((c) => c.status === "concluida").length,
    };

    // Disparos
    const disparos = await ctx.db.query("disparosAgendados").collect();
    const totalEnviados = disparos.filter((d) => d.status === "enviado").length;
    const totalErros = disparos.filter((d) => d.status === "erro").length;
    const totalPendentes = disparos.filter(
      (d) => d.status === "pendente"
    ).length;

    const disparosStats = {
      total: disparos.length,
      enviados: totalEnviados,
      erros: totalErros,
      pendentes: totalPendentes,
      taxaSucesso:
        disparos.length > 0
          ? ((totalEnviados / disparos.length) * 100).toFixed(1)
          : "0",
    };

    // Instâncias WhatsApp
    const instances = await ctx.db.query("whatsappInstances").collect();
    const instancesStats = {
      total: instances.length,
      connected: instances.filter((i) => i.status === "connected").length,
    };

    // Leads
    const leads = await ctx.db.query("leads").collect();
    const leadsStats = {
      total: leads.length,
      novos: leads.filter((l) => l.status === "Novo").length,
      convertidos: leads.filter((l) => l.status === "Convertido").length,
    };

    return {
      empresas: empresasStats,
      campanhas: campanhasStats,
      disparos: disparosStats,
      instances: instancesStats,
      leads: leadsStats,
    };
  },
});

// Últimas atividades (empresas captadas recentemente)
export const getRecentActivity = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = args.limit || 10;

    // Últimas empresas captadas
    const empresas = await ctx.db
      .query("empresas")
      .order("desc")
      .take(limit);

    // Últimos disparos
    const disparos = await ctx.db
      .query("disparosAgendados")
      .order("desc")
      .take(limit);

    // Últimas campanhas
    const campanhas = await ctx.db
      .query("campanhasDisparo")
      .order("desc")
      .take(limit);

    return {
      empresas,
      disparos,
      campanhas,
    };
  },
});

// Estatísticas por período
export const getStatsByPeriod = query({
  args: {
    inicio: v.number(),
    fim: v.number(),
  },
  handler: async (ctx, args) => {
    // Empresas captadas no período
    const empresas = await ctx.db.query("empresas").collect();
    const empresasNoPeriodo = empresas.filter(
      (e) => e.capturadoEm >= args.inicio && e.capturadoEm <= args.fim
    );

    // Disparos no período
    const disparos = await ctx.db.query("disparosAgendados").collect();
    const disparosNoPeriodo = disparos.filter(
      (d) => d.agendadoPara >= args.inicio && d.agendadoPara <= args.fim
    );

    // Campanhas criadas no período
    const campanhas = await ctx.db.query("campanhasDisparo").collect();
    const campanhasNoPeriodo = campanhas.filter(
      (c) => c.criadoEm >= args.inicio && c.criadoEm <= args.fim
    );

    return {
      empresasCaptadas: empresasNoPeriodo.length,
      disparosAgendados: disparosNoPeriodo.length,
      disparosEnviados: disparosNoPeriodo.filter((d) => d.status === "enviado")
        .length,
      campanhasCriadas: campanhasNoPeriodo.length,
    };
  },
});
