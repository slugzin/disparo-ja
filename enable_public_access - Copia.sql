-- Remover políticas existentes da tabela whatsapp_instances
DROP POLICY IF EXISTS "Enable read access for all users" ON "public"."whatsapp_instances";
DROP POLICY IF EXISTS "Enable insert for all users" ON "public"."whatsapp_instances";
DROP POLICY IF EXISTS "Enable update for all users" ON "public"."whatsapp_instances";
DROP POLICY IF EXISTS "Enable delete for all users" ON "public"."whatsapp_instances";

-- Habilitar RLS (Row Level Security)
ALTER TABLE "public"."whatsapp_instances" ENABLE ROW LEVEL SECURITY;

-- Criar políticas que permitem TODAS as operações para TODOS os usuários
CREATE POLICY "Enable read access for all users" 
ON "public"."whatsapp_instances" 
FOR SELECT 
USING (true);

CREATE POLICY "Enable insert for all users" 
ON "public"."whatsapp_instances" 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Enable update for all users" 
ON "public"."whatsapp_instances" 
FOR UPDATE 
USING (true) 
WITH CHECK (true);

CREATE POLICY "Enable delete for all users" 
ON "public"."whatsapp_instances" 
FOR DELETE 
USING (true); 