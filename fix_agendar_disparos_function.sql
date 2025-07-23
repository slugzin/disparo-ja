-- Função RPC corrigida para agendar disparos
CREATE OR REPLACE FUNCTION agendar_disparos(
    p_empresa_ids INTEGER[],           -- Array com IDs das empresas selecionadas
    p_mensagem TEXT,                   -- Mensagem a ser enviada
    p_conexao_id TEXT,                 -- ID da conexão WhatsApp
    p_tipo_midia TEXT DEFAULT 'nenhum',-- Tipo de mídia (imagem, audio, nenhum)
    p_midia_url TEXT DEFAULT NULL,     -- URL da mídia (se houver)
    p_delay_segundos INTEGER DEFAULT 30,-- Delay entre mensagens em segundos
    p_nome_campanha TEXT DEFAULT NULL  -- Nome opcional para a campanha
) RETURNS JSON AS $$
DECLARE
    v_empresa RECORD;
    v_agendado TIMESTAMP;
    v_now TIMESTAMP;
    v_contador INTEGER := 0;
    v_resultado JSON;
    v_tasks_criadas INTEGER := 0;
    v_erros TEXT[] := ARRAY[]::TEXT[];
    v_campanha_id UUID;
    v_nome_campanha TEXT;
BEGIN
    -- Obter timestamp atual
    v_now := NOW();

    -- Gerar nome da campanha se não fornecido
    v_nome_campanha := COALESCE(
        p_nome_campanha,
        'Campanha de ' || array_length(p_empresa_ids, 1)::TEXT || ' empresas - ' || 
        to_char(v_now, 'DD/MM/YYYY HH24:MI')
    );

    -- Criar campanha (usando os nomes corretos das colunas)
    INSERT INTO campanhas_disparo (
        nome,
        descricao,
        mensagem,
        tipo_midia,
        midia_url,
        conexao_id,
        total_empresas,
        criado_em,
        atualizado_em
    ) VALUES (
        v_nome_campanha,
        'Disparo automático via sistema',
        p_mensagem,
        p_tipo_midia,
        p_midia_url,
        p_conexao_id,
        array_length(p_empresa_ids, 1),
        v_now,
        v_now
    ) RETURNING id INTO v_campanha_id;

    -- Para cada empresa no array de IDs
    FOR v_empresa IN 
        SELECT 
            id::TEXT,
            titulo as nome,
            CASE 
                WHEN telefone IS NULL THEN NULL
                WHEN telefone !~ '^\+?[0-9]+$' THEN REGEXP_REPLACE(telefone, '[^0-9]', '', 'g')
                ELSE telefone
            END as telefone,
            website,
            endereco
        FROM empresas 
        WHERE id = ANY(p_empresa_ids)
    LOOP
        BEGIN
            -- Calcular horário de agendamento com base no delay
            v_agendado := v_now + (v_contador * p_delay_segundos * interval '1 second');
            
            -- Formatar telefone para padrão Evolution API
            IF v_empresa.telefone IS NOT NULL THEN
                -- Garantir que começa com 55
                IF NOT v_empresa.telefone LIKE '55%' THEN
                    v_empresa.telefone := '55' || v_empresa.telefone;
                END IF;
                
                -- Adicionar sufixo do WhatsApp
                v_empresa.telefone := v_empresa.telefone || '@s.whatsapp.net';
            END IF;

            -- Inserir disparo agendado (usando os nomes corretos das colunas)
            INSERT INTO disparos_agendados (
                empresa_id,
                empresa_nome,
                empresa_telefone,
                empresa_website,
                empresa_endereco,
                mensagem,
                tipo_midia,
                midia_url,
                status,
                agendado_para,
                conexao_id,
                criado_em
            ) VALUES (
                v_empresa.id,
                v_empresa.nome,
                v_empresa.telefone,
                v_empresa.website,
                v_empresa.endereco,
                p_mensagem,
                p_tipo_midia,
                p_midia_url,
                'pendente',
                v_agendado,
                p_conexao_id,
                v_now
            );

            -- Registrar empresa na campanha
            INSERT INTO campanhas_empresas (
                campanha_id,
                empresa_id,
                empresa_nome,
                criado_em
            ) VALUES (
                v_campanha_id,
                v_empresa.id,
                v_empresa.nome,
                v_now
            );

            v_tasks_criadas := v_tasks_criadas + 1;
            v_contador := v_contador + 1;

        EXCEPTION WHEN OTHERS THEN
            -- Armazenar erro para retornar no resultado
            v_erros := array_append(v_erros, 'Erro ao agendar para empresa ' || v_empresa.nome || ': ' || SQLERRM);
            
            -- Registrar erro na campanha
            INSERT INTO campanhas_empresas (
                campanha_id,
                empresa_id,
                empresa_nome,
                status,
                erro_mensagem,
                criado_em
            ) VALUES (
                v_campanha_id,
                v_empresa.id,
                v_empresa.nome,
                'erro',
                SQLERRM,
                v_now
            );
        END;
    END LOOP;

    -- Atualizar totais da campanha
    UPDATE campanhas_disparo SET
        total_enviados = v_tasks_criadas,
        total_erros = array_length(v_erros, 1),
        status = CASE 
            WHEN v_tasks_criadas = 0 THEN 'cancelada'
            WHEN v_tasks_criadas = array_length(p_empresa_ids, 1) THEN 'concluida'
            ELSE 'em_andamento'
        END,
        atualizado_em = v_now
    WHERE id = v_campanha_id;

    -- Construir JSON de resultado
    v_resultado := json_build_object(
        'success', v_tasks_criadas > 0,
        'tasks_criadas', v_tasks_criadas,
        'total_empresas', array_length(p_empresa_ids, 1),
        'erros', v_erros,
        'campanha_id', v_campanha_id,
        'nome_campanha', v_nome_campanha
    );

    RETURN v_resultado;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comentário da função
COMMENT ON FUNCTION agendar_disparos IS 'Agenda disparos de mensagens para uma lista de empresas e registra na campanha para histórico.';

-- Permissões
GRANT EXECUTE ON FUNCTION agendar_disparos TO authenticated; 