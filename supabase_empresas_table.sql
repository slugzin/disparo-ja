-- Tabela para armazenar empresas captadas
CREATE TABLE IF NOT EXISTS empresas (
  id BIGSERIAL PRIMARY KEY,
  
  -- Dados básicos da empresa
  titulo VARCHAR(255) NOT NULL,
  endereco TEXT,
  categoria VARCHAR(100),
  telefone VARCHAR(50),
  website VARCHAR(500),
  
  -- Localização
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  
  -- Avaliações
  avaliacao DECIMAL(2, 1), -- rating (ex: 4.8)
  total_avaliacoes INTEGER DEFAULT 0, -- ratingCount
  
  -- Identificadores externos
  posicao INTEGER,
  cid VARCHAR(50), -- Google CID
  
  -- Links de agendamento (JSON array)
  links_agendamento JSONB,
  
  -- Parâmetros da busca (para histórico)
  parametros_busca JSONB,
  
  -- Controle
  capturado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Índices para otimizar buscas
  UNIQUE(cid) -- Evitar duplicatas baseadas no Google CID
);

-- Índices para melhorar performance
CREATE INDEX IF NOT EXISTS idx_empresas_categoria ON empresas(categoria);
CREATE INDEX IF NOT EXISTS idx_empresas_avaliacao ON empresas(avaliacao);
CREATE INDEX IF NOT EXISTS idx_empresas_capturado_em ON empresas(capturado_em);
CREATE INDEX IF NOT EXISTS idx_empresas_latitude_longitude ON empresas(latitude, longitude);

-- Trigger para atualizar timestamp automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.atualizado_em = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_empresas_updated_at 
    BEFORE UPDATE ON empresas 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Comentários nas colunas
COMMENT ON TABLE empresas IS 'Tabela para armazenar empresas captadas da API Serper/Google Places';
COMMENT ON COLUMN empresas.titulo IS 'Nome da empresa';
COMMENT ON COLUMN empresas.endereco IS 'Endereço completo da empresa';
COMMENT ON COLUMN empresas.categoria IS 'Categoria da empresa (ex: Barbearia, Restaurante)';
COMMENT ON COLUMN empresas.telefone IS 'Número de telefone da empresa';
COMMENT ON COLUMN empresas.website IS 'Website da empresa';
COMMENT ON COLUMN empresas.latitude IS 'Latitude da localização';
COMMENT ON COLUMN empresas.longitude IS 'Longitude da localização';
COMMENT ON COLUMN empresas.avaliacao IS 'Nota de avaliação da empresa (1-5)';
COMMENT ON COLUMN empresas.total_avaliacoes IS 'Número total de avaliações recebidas';
COMMENT ON COLUMN empresas.posicao IS 'Posição da empresa nos resultados de busca';
COMMENT ON COLUMN empresas.cid IS 'Google CID (identificador único do Google)';
COMMENT ON COLUMN empresas.links_agendamento IS 'Array JSON com links de agendamento';
COMMENT ON COLUMN empresas.parametros_busca IS 'JSON com os parâmetros usados na busca que encontrou esta empresa'; 

-- Adicionar coluna pesquisa
ALTER TABLE empresas ADD COLUMN pesquisa TEXT;
COMMENT ON COLUMN empresas.pesquisa IS 'Query original usada para encontrar esta empresa';

-- Criar índice para pesquisa rápida
CREATE INDEX idx_empresas_pesquisa ON empresas(pesquisa); 

-- Adicionar campo status
ALTER TABLE empresas ADD COLUMN status TEXT DEFAULT 'a_contatar';
COMMENT ON COLUMN empresas.status IS 'Status da empresa no Kanban (a_contatar, contato_realizado, em_negociacao, ganhos, perdidos)';

-- Criar índice para status
CREATE INDEX idx_empresas_status ON empresas(status); 

-- Criar enum para status do Kanban
CREATE TYPE status_kanban AS ENUM (
  'a_contatar',
  'contato_realizado',
  'em_negociacao',
  'ganhos',
  'perdidos'
);

-- Adicionar coluna status na tabela empresas
ALTER TABLE empresas ADD COLUMN status status_kanban DEFAULT 'a_contatar';
COMMENT ON COLUMN empresas.status IS 'Status atual da empresa no Kanban';

-- Criar índice para busca rápida por status
CREATE INDEX idx_empresas_status ON empresas(status);

-- Criar tabela de histórico de movimentações
CREATE TABLE movimentacoes_kanban (
  id BIGSERIAL PRIMARY KEY,
  empresa_id BIGINT REFERENCES empresas(id) ON DELETE CASCADE,
  status_anterior status_kanban,
  status_novo status_kanban,
  movido_por UUID REFERENCES auth.users(id),
  observacao TEXT,
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  
  CONSTRAINT movimentacoes_kanban_status_check 
    CHECK (status_anterior != status_novo)
);

-- Índices para a tabela de movimentações
CREATE INDEX idx_movimentacoes_empresa ON movimentacoes_kanban(empresa_id);
CREATE INDEX idx_movimentacoes_data ON movimentacoes_kanban(criado_em);

-- Criar tabela de mensagens enviadas
CREATE TABLE mensagens_enviadas (
  id BIGSERIAL PRIMARY KEY,
  empresa_id BIGINT REFERENCES empresas(id) ON DELETE CASCADE,
  enviado_por UUID REFERENCES auth.users(id),
  tipo_mensagem TEXT NOT NULL,
  conteudo TEXT NOT NULL,
  status TEXT NOT NULL,
  erro TEXT,
  enviado_em TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Índices para a tabela de mensagens
CREATE INDEX idx_mensagens_empresa ON mensagens_enviadas(empresa_id);
CREATE INDEX idx_mensagens_data ON mensagens_enviadas(enviado_em);

-- Função para registrar movimentação
CREATE OR REPLACE FUNCTION registrar_movimentacao_kanban()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO movimentacoes_kanban (
      empresa_id,
      status_anterior,
      status_novo,
      movido_por,
      observacao
    ) VALUES (
      NEW.id,
      OLD.status,
      NEW.status,
      auth.uid(),
      'Movimentação automática via Kanban'
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para registrar movimentações automaticamente
CREATE TRIGGER trg_movimentacao_kanban
AFTER UPDATE OF status ON empresas
FOR EACH ROW
EXECUTE FUNCTION registrar_movimentacao_kanban();

-- Políticas de segurança RLS (Row Level Security)
ALTER TABLE movimentacoes_kanban ENABLE ROW LEVEL SECURITY;
ALTER TABLE mensagens_enviadas ENABLE ROW LEVEL SECURITY;

-- Política para movimentações
CREATE POLICY "Usuários podem ver movimentações das empresas" ON movimentacoes_kanban
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Usuários podem criar movimentações" ON movimentacoes_kanban
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Política para mensagens
CREATE POLICY "Usuários podem ver mensagens enviadas" ON mensagens_enviadas
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Usuários podem registrar mensagens" ON mensagens_enviadas
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Views para análise
CREATE VIEW vw_metricas_kanban AS
SELECT 
  status,
  COUNT(*) as total_empresas,
  COUNT(CASE WHEN website IS NOT NULL THEN 1 END) as com_website,
  COUNT(CASE WHEN telefone ~ '^\([0-9]{2}\) 9[0-9]{4}-[0-9]{4}$' THEN 1 END) as com_whatsapp
FROM empresas
GROUP BY status;

CREATE VIEW vw_historico_movimentacoes AS
SELECT 
  e.titulo as empresa,
  m.status_anterior,
  m.status_novo,
  u.email as movido_por,
  m.observacao,
  m.criado_em
FROM movimentacoes_kanban m
JOIN empresas e ON e.id = m.empresa_id
JOIN auth.users u ON u.id = m.movido_por
ORDER BY m.criado_em DESC;

-- Função para mover empresa e enviar mensagem
CREATE OR REPLACE FUNCTION mover_empresa_enviar_mensagem(
  p_empresa_id BIGINT,
  p_novo_status status_kanban,
  p_mensagem TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  v_status_atual status_kanban;
BEGIN
  -- Verificar status atual
  SELECT status INTO v_status_atual
  FROM empresas
  WHERE id = p_empresa_id;

  -- Se status é diferente, atualizar
  IF v_status_atual IS DISTINCT FROM p_novo_status THEN
    UPDATE empresas
    SET status = p_novo_status
    WHERE id = p_empresa_id;
  END IF;

  -- Se tem mensagem, registrar envio
  IF p_mensagem IS NOT NULL THEN
    INSERT INTO mensagens_enviadas (
      empresa_id,
      enviado_por,
      tipo_mensagem,
      conteudo,
      status
    ) VALUES (
      p_empresa_id,
      auth.uid(),
      CASE 
        WHEN p_novo_status = 'contato_realizado' THEN 'primeira_mensagem'
        ELSE 'follow_up'
      END,
      p_mensagem,
      'enviado'
    );
  END IF;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 