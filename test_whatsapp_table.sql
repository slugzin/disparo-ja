-- Script para testar a tabela whatsapp_instances

-- 1. Verificar se a tabela existe
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'whatsapp_instances'
) as table_exists;

-- 2. Mostrar estrutura da tabela
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'whatsapp_instances'
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 3. Verificar políticas RLS
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'whatsapp_instances';

-- 4. Verificar se RLS está habilitado
SELECT tablename, rowsecurity
FROM pg_tables
WHERE tablename = 'whatsapp_instances';

-- 5. Contar registros existentes (se houver)
SELECT COUNT(*) as total_instances FROM whatsapp_instances;

-- 6. Mostrar últimas 3 instâncias (se houver)
SELECT instance_name, instance_id, status, created_at
FROM whatsapp_instances
ORDER BY created_at DESC
LIMIT 3;

-- 7. Verificar usuário atual
SELECT auth.uid() as current_user_id;

-- 8. Testar inserção (descomente para testar)
/*
INSERT INTO whatsapp_instances (
    user_id,
    instance_name,
    instance_id,
    integration,
    hash,
    status,
    qr_code_data,
    qr_code_count
) VALUES (
    auth.uid(),
    'Teste WhatsApp',
    'test-instance-' || generate_random_uuid(),
    'WHATSAPP-BAILEYS',
    'TEST-HASH-' || random(),
    'connecting',
    'data:image/png;base64,test',
    1
);
*/

-- 9. Verificar se o usuário consegue ver suas instâncias
SELECT instance_name, status, created_at
FROM whatsapp_instances
WHERE user_id = auth.uid()
ORDER BY created_at DESC; 