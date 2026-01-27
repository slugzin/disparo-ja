-- Remover o trigger problemático
DROP TRIGGER IF EXISTS update_whatsapp_instances_updated_at ON whatsapp_instances;

-- Remover a função se existir
DROP FUNCTION IF EXISTS update_updated_at_column();

-- Recriar a função corretamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Recriar o trigger corretamente
CREATE TRIGGER update_whatsapp_instances_updated_at 
    BEFORE UPDATE ON whatsapp_instances 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); 