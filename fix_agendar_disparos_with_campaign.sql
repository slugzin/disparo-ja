-- Função RPC completa - com agendamento E histórico de campanhas
CREATE OR REPLACE FUNCTION agendar_disparos(
    p_empresa_ids INTEGER[],
    p_mensagem TEXT,
    p_conexao_id TEXT,
    p_tipo_midia TEXT DEFAULT 'nenhum',
    p_midia_url TEXT DEFAULT NULL,
    p_delay_segundos INTEGER DEFAULT 30,
    p_nome_campanha TEXT DEFAULT NULL
) RETURNS JSON AS $$
DECLARE
    v_empresa RECORD;
    v_agendado TIMESTAMP;
    v_now TIMESTAMP;
    v_contador INTEGER := 0;
    v_resultado JSON;
    v_tasks_criadas INTEGER := 0;
    v_erros TEXT[] := ARRAY[]::TEXT[];
    v_nome_campanha TEXT;
    v_campanha_id UUID;
BEGIN
    v_now := NOW();
    
    v_nome_campanha := COALESCE(
        p_nome_campanha,
        'Campanha de ' || array_length(p_empresa_ids, 1)::TEXT || ' empresas - ' || 
        to_char(v_now, 'DD/MM/YYYY HH24:MI')
    );

    -- CRIAR CAMPANHA PARA HISTÓRICO
    INSERT INTO campanhas_disparo (
        nome,
        descricao,
        tipo,
        status,
        total_empresas,
        total_enviados,
        total_erros,
        mensagem,
        tipo_midia,
        midia_url,
        conexao_id,
        criado_em,
        atualizado_em
    ) VALUES (
        v_nome_campanha,
        'Disparo automático via sistema',
        'whatsapp',
        'em_andamento',
        array_length(p_empresa_ids, 1),
        0,
        0,
        p_mensagem,
        p_tipo_midia,
        p_midia_url,
        p_conexao_id,
        v_now,
        v_now
    ) RETURNING id INTO v_campanha_id;

    -- Para cada empresa no array de IDs
    FOR v_empresa IN 
        SELECT 
            id,  -- Mantém como INTEGER
            titulo as nome,
            telefone,
            website,
            endereco
        FROM empresas 
        WHERE id = ANY(p_empresa_ids)
    LOOP
        BEGIN
            v_agendado := v_now + (v_contador * p_delay_segundos * interval '1 second');
            
            -- Formatar telefone para WhatsApp
            IF v_empresa.telefone IS NOT NULL THEN
                IF NOT v_empresa.telefone LIKE '55%' THEN
                    v_empresa.telefone := '55' || v_empresa.telefone;
                END IF;
                v_empresa.telefone := v_empresa.telefone || '@s.whatsapp.net';
            END IF;

            -- INSERIR DISPARO AGENDADO (mantém funcionando como antes)
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

            -- REGISTRAR EMPRESA NA CAMPANHA (para histórico)
            INSERT INTO campanhas_empresas (
                campanha_id,
                empresa_id,
                empresa_nome,
                status,
                criado_em
            ) VALUES (
                v_campanha_id,
                v_empresa.id::TEXT,
                v_empresa.nome,
                'pendente',
                v_now
            );

            v_tasks_criadas := v_tasks_criadas + 1;
            v_contador := v_contador + 1;

        EXCEPTION WHEN OTHERS THEN
            v_erros := array_append(v_erros, 'Erro ao agendar para empresa ' || v_empresa.nome || ': ' || SQLERRM);
            
            -- REGISTRAR ERRO NA CAMPANHA
            INSERT INTO campanhas_empresas (
                campanha_id,
                empresa_id,
                empresa_nome,
                status,
                erro_mensagem,
                criado_em
            ) VALUES (
                v_campanha_id,
                v_empresa.id::TEXT,
                v_empresa.nome,
                'erro',
                SQLERRM,
                v_now
            );
        END;
    END LOOP;

    -- ATUALIZAR TOTAIS DA CAMPANHA
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

    -- Retornar resultado
    v_resultado := json_build_object(
        'success', v_tasks_criadas > 0,
        'tasks_criadas', v_tasks_criadas,
        'total_empresas', array_length(p_empresa_ids, 1),
        'erros', v_erros,
        'nome_campanha', v_nome_campanha,
        'campanha_id', v_campanha_id
    );

    RETURN v_resultado;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 