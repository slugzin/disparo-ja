-- Verificar e corrigir estrutura da tabela disparos_agendados
-- Garantir que o campo empresa_id seja INTEGER

-- Primeiro, verificar se a tabela existe e se empresa_id precisa ser alterado
DO $$
BEGIN
    -- Verificar se a coluna empresa_id é TEXT e alterar para INTEGER
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'disparos_agendados' 
        AND column_name = 'empresa_id' 
        AND data_type = 'text'
    ) THEN
        -- Alterar tipo da coluna
        ALTER TABLE disparos_agendados 
        ALTER COLUMN empresa_id TYPE INTEGER USING empresa_id::INTEGER;
        
        RAISE NOTICE 'Coluna empresa_id alterada de TEXT para INTEGER';
    END IF;
    
    -- Garantir que as colunas de timestamp existem
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'disparos_agendados' 
        AND column_name = 'created_at'
    ) THEN
        ALTER TABLE disparos_agendados 
        ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
        
        RAISE NOTICE 'Coluna created_at adicionada';
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'disparos_agendados' 
        AND column_name = 'updated_at'
    ) THEN
        ALTER TABLE disparos_agendados 
        ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
        
        RAISE NOTICE 'Coluna updated_at adicionada';
    END IF;
END $$; 