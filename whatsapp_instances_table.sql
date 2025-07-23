-- Criar tabela para armazenar instâncias WhatsApp
CREATE TABLE IF NOT EXISTS whatsapp_instances (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    instance_name VARCHAR(255) NOT NULL,
    instance_id VARCHAR(255) UNIQUE NOT NULL,
    integration VARCHAR(100) DEFAULT 'WHATSAPP-BAILEYS',
    hash VARCHAR(255),
    status VARCHAR(50) DEFAULT 'connecting',
    webhook_wa_business TEXT,
    access_token_wa_business TEXT,
    qr_code_data TEXT, -- Base64 do QR Code
    qr_code_count INTEGER DEFAULT 0,
    pairing_code TEXT,
    settings JSONB DEFAULT '{}',
    webhook_config JSONB DEFAULT '{}',
    websocket_config JSONB DEFAULT '{}',
    rabbitmq_config JSONB DEFAULT '{}',
    sqs_config JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_whatsapp_instances_user_id ON whatsapp_instances(user_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_instances_instance_id ON whatsapp_instances(instance_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_instances_status ON whatsapp_instances(status);

-- Habilitar RLS (Row Level Security)
ALTER TABLE whatsapp_instances ENABLE ROW LEVEL SECURITY;

-- Política para usuários só verem suas próprias instâncias
CREATE POLICY "Users can view own whatsapp instances" ON whatsapp_instances
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own whatsapp instances" ON whatsapp_instances
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own whatsapp instances" ON whatsapp_instances
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own whatsapp instances" ON whatsapp_instances
    FOR DELETE USING (auth.uid() = user_id);

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_whatsapp_instances_updated_at 
    BEFORE UPDATE ON whatsapp_instances 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); 