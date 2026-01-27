-- Criar tabela para templates de mensagem
CREATE TABLE IF NOT EXISTS message_templates (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  preview TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Trigger para atualizar timestamp automaticamente
CREATE OR REPLACE FUNCTION update_message_templates_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_message_templates_updated_at 
    BEFORE UPDATE ON message_templates 
    FOR EACH ROW 
    EXECUTE FUNCTION update_message_templates_updated_at();

-- Inserir alguns templates padrão
INSERT INTO message_templates (name, content, preview) VALUES
(
  'Prospecção Inicial',
  'Olá! 👋

Identificamos que vocês podem se beneficiar muito de nossa solução. 

Somos especialistas em [sua área] e ajudamos empresas como a de vocês a [benefício principal].

Gostaria de agendar uma conversa rápida para entender melhor suas necessidades e mostrar como podemos ajudar?

Aguardo seu retorno! 😊',
  'Primeira abordagem profissional para novos leads'
),
(
  'Follow-up Cordial',
  'Oi! 😊

Estou retornando o contato para saber se tiveram a oportunidade de avaliar nossa proposta.

Ficou alguma dúvida ou gostaria de agendar uma demonstração?

Estou aqui para ajudar! 🤝',
  'Acompanhamento amigável para leads em andamento'
),
(
  'Reativação',
  'Olá! 🚀

Faz um tempo que não conversamos, mas trouxemos novidades que podem interessar vocês.

Temos uma oferta especial para clientes que ainda não começaram conosco.

Que tal uma conversa rápida para ver se faz sentido? 😉',
  'Mensagem para reengajar contatos antigos'
);

-- Criar índices para melhorar performance
CREATE INDEX idx_message_templates_name ON message_templates(name);
CREATE INDEX idx_message_templates_created_at ON message_templates(created_at); 