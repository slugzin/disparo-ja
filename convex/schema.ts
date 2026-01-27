import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Perfis de usuário (sincronizado com Clerk)
  profiles: defineTable({
    clerkId: v.string(),
    email: v.string(),
    nome: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_clerk_id", ["clerkId"])
    .index("by_email", ["email"]),

  // Leads
  leads: defineTable({
    userId: v.id("profiles"),
    nome: v.string(),
    empresaId: v.optional(v.id("empresas")),
    email: v.optional(v.string()),
    telefone: v.optional(v.string()),
    whatsapp: v.optional(v.string()),
    cargo: v.optional(v.string()),
    origem: v.union(
      v.literal("Website"),
      v.literal("LinkedIn"),
      v.literal("Indicação"),
      v.literal("Google Maps"),
      v.literal("Outro")
    ),
    status: v.union(
      v.literal("Novo"),
      v.literal("Qualificado"),
      v.literal("Em Negociação"),
      v.literal("Convertido"),
      v.literal("Perdido")
    ),
    score: v.number(),
    notas: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_status", ["userId", "status"])
    .index("by_empresa", ["empresaId"]),

  // Empresas captadas
  empresas: defineTable({
    titulo: v.string(),
    endereco: v.optional(v.string()),
    categoria: v.optional(v.string()),
    telefone: v.optional(v.string()),
    website: v.optional(v.string()),
    avaliacao: v.optional(v.number()),
    totalAvaliacoes: v.optional(v.number()),
    placeId: v.optional(v.string()),
    latitude: v.optional(v.number()),
    longitude: v.optional(v.number()),
    pesquisa: v.optional(v.string()),
    status: v.union(
      v.literal("a_contatar"),
      v.literal("contato_realizado"),
      v.literal("sem_interesse"),
      v.literal("negociando"),
      v.literal("convertido")
    ),
    capturadoEm: v.number(),
    ultimoContato: v.optional(v.number()),
    notas: v.optional(v.string()),
  })
    .index("by_status", ["status"])
    .index("by_pesquisa", ["pesquisa"])
    .index("by_place_id", ["placeId"])
    .index("by_telefone", ["telefone"]),

  // Templates de mensagem
  messageTemplates: defineTable({
    name: v.string(),
    content: v.string(),
    preview: v.string(),
    variaveis: v.optional(v.array(v.string())),
    categoria: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_categoria", ["categoria"]),

  // Instâncias WhatsApp
  whatsappInstances: defineTable({
    instanceName: v.string(),
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
    lastSync: v.optional(v.number()),
    createdAt: v.number(),
  })
    .index("by_instance_id", ["instanceId"])
    .index("by_status", ["status"])
    .index("by_instance_name", ["instanceName"]),

  // Disparos agendados
  disparosAgendados: defineTable({
    empresaId: v.id("empresas"),
    empresaTitulo: v.string(),
    empresaTelefone: v.string(),
    mensagem: v.string(),
    status: v.union(
      v.literal("pendente"),
      v.literal("enviando"),
      v.literal("enviado"),
      v.literal("erro"),
      v.literal("cancelado")
    ),
    erro: v.optional(v.string()),
    agendadoPara: v.number(),
    enviadoEm: v.optional(v.number()),
    conexaoId: v.string(),
    campanhaId: v.optional(v.id("campanhasDisparo")),
    createdAt: v.number(),
  })
    .index("by_status", ["status"])
    .index("by_agendado", ["agendadoPara"])
    .index("by_campanha", ["campanhaId"])
    .index("by_empresa", ["empresaId"]),

  // Campanhas de disparo
  campanhasDisparo: defineTable({
    nome: v.optional(v.string()),
    conexaoId: v.string(),
    mensagem: v.string(),
    totalEmpresas: v.number(),
    totalEnviados: v.number(),
    totalErros: v.number(),
    status: v.union(
      v.literal("em_andamento"),
      v.literal("concluida"),
      v.literal("pausada"),
      v.literal("cancelada")
    ),
    criadoEm: v.number(),
    concluidoEm: v.optional(v.number()),
  })
    .index("by_status", ["status"])
    .index("by_criado", ["criadoEm"]),

  // Conversas (histórico de mensagens)
  conversas: defineTable({
    empresaId: v.optional(v.id("empresas")),
    telefone: v.string(),
    nome: v.optional(v.string()),
    ultimaMensagem: v.optional(v.string()),
    ultimaMensagemEm: v.optional(v.number()),
    naoLidas: v.number(),
    instanceId: v.string(),
  })
    .index("by_telefone", ["telefone"])
    .index("by_instance", ["instanceId"])
    .index("by_ultima_mensagem", ["ultimaMensagemEm"]),

  // Mensagens individuais
  mensagens: defineTable({
    conversaId: v.id("conversas"),
    conteudo: v.string(),
    tipo: v.union(
      v.literal("texto"),
      v.literal("imagem"),
      v.literal("audio"),
      v.literal("documento"),
      v.literal("video")
    ),
    direcao: v.union(v.literal("enviada"), v.literal("recebida")),
    status: v.union(
      v.literal("enviando"),
      v.literal("enviada"),
      v.literal("entregue"),
      v.literal("lida"),
      v.literal("erro")
    ),
    mediaUrl: v.optional(v.string()),
    timestamp: v.number(),
  })
    .index("by_conversa", ["conversaId"])
    .index("by_timestamp", ["timestamp"]),

  // Pesquisas salvas (histórico de captação)
  pesquisasSalvas: defineTable({
    termo: v.string(),
    localizacao: v.string(),
    totalResultados: v.number(),
    criadoEm: v.number(),
  }).index("by_criado", ["criadoEm"]),

  // Configurações do usuário
  configuracoes: defineTable({
    userId: v.id("profiles"),
    chave: v.string(),
    valor: v.string(),
  })
    .index("by_user", ["userId"])
    .index("by_user_chave", ["userId", "chave"]),
});
