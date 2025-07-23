-- Script para corrigir problemas com triggers e resetar status das empresas

-- 1. Primeiro, vamos verificar se existe algum trigger problemático
DROP TRIGGER IF EXISTS update_empresas_updated_at ON empresas;

-- 2. Recriar o trigger corretamente
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

-- 3. Resetar todas as empresas para status 'a_contatar'
UPDATE empresas SET status = 'a_contatar'::status_kanban;

-- 4. Verificar se a atualização funcionou
SELECT COUNT(*) as total_empresas, 
       COUNT(CASE WHEN status = 'a_contatar' THEN 1 END) as em_a_contatar
FROM empresas; 