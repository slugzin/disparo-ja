-- Remover o trigger com CASCADE para resolver dependências
DROP TRIGGER IF EXISTS update_whatsapp_instances_updated_at ON whatsapp_instances CASCADE;

-- Remover a função com CASCADE
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE; 