-- Verificar estrutura da tabela whatsapp_instances
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'whatsapp_instances' 
ORDER BY ordinal_position; 