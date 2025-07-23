-- Remover completamente o trigger problemático
DROP TRIGGER IF EXISTS update_whatsapp_instances_updated_at ON whatsapp_instances;

-- Remover a função
DROP FUNCTION IF EXISTS update_updated_at_column(); 