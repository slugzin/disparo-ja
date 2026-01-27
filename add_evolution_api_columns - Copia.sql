-- Adicionar colunas para sincronização com Evolution API
ALTER TABLE whatsapp_instances 
ADD COLUMN IF NOT EXISTS profile_pic_url TEXT,
ADD COLUMN IF NOT EXISTS profile_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS owner_jid VARCHAR(255),
ADD COLUMN IF NOT EXISTS last_sync TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS token VARCHAR(255),
ADD COLUMN IF NOT EXISTS client_name VARCHAR(100) DEFAULT 'evolution',
ADD COLUMN IF NOT EXISTS disconnection_reason_code INTEGER,
ADD COLUMN IF NOT EXISTS disconnection_object JSONB,
ADD COLUMN IF NOT EXISTS disconnection_at TIMESTAMP WITH TIME ZONE;

-- Criar índices para as novas colunas
CREATE INDEX IF NOT EXISTS idx_whatsapp_instances_owner_jid ON whatsapp_instances(owner_jid);
CREATE INDEX IF NOT EXISTS idx_whatsapp_instances_last_sync ON whatsapp_instances(last_sync);
CREATE INDEX IF NOT EXISTS idx_whatsapp_instances_token ON whatsapp_instances(token);

-- Comentários para documentar as colunas
COMMENT ON COLUMN whatsapp_instances.profile_pic_url IS 'URL da foto de perfil do WhatsApp';
COMMENT ON COLUMN whatsapp_instances.profile_name IS 'Nome do perfil do WhatsApp';
COMMENT ON COLUMN whatsapp_instances.owner_jid IS 'JID do proprietário da instância';
COMMENT ON COLUMN whatsapp_instances.last_sync IS 'Data/hora da última sincronização com Evolution API';
COMMENT ON COLUMN whatsapp_instances.token IS 'Token da instância na Evolution API';
COMMENT ON COLUMN whatsapp_instances.client_name IS 'Nome do cliente (evolution)';
COMMENT ON COLUMN whatsapp_instances.disconnection_reason_code IS 'Código do motivo da desconexão';
COMMENT ON COLUMN whatsapp_instances.disconnection_object IS 'Objeto com detalhes da desconexão';
COMMENT ON COLUMN whatsapp_instances.disconnection_at IS 'Data/hora da desconexão'; 