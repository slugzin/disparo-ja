-- Função RPC melhorada - com análise completa das empresas
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
    
    -- Variáveis para análise das empresas
    v_empresas_detalhes JSONB := '[]'::JSONB;
    v_empresas_resumo TEXT;
    v_modalidade_pesquisa TEXT;
    v_status_empresas TEXT;
    v_avaliacao_media DECIMAL(2,1);
    v_total_avaliacoes_soma INTEGER := 0;
    v_categorias_encontradas TEXT[] := ARRAY[]::TEXT[];
    v_cidades_encontradas TEXT[] := ARRAY[]::TEXT[];
    v_avaliacao_soma DECIMAL := 0;
    v_avaliacao_count INTEGER := 0;
    v_categoria_temp TEXT;
    v_cidade_temp TEXT;
BEGIN
    v_now := NOW();
    
    v_nome_campanha := COALESCE(
        p_nome_campanha,
        'Campanha de ' || array_length(p_empresa_ids, 1)::TEXT || ' empresas - ' || 
        to_char(v_now, 'DD/MM/YYYY HH24:MI')
    );

    -- ANALISAR EMPRESAS SELECIONADAS ANTES DE PROCESSAR
    FOR v_empresa IN 
        SELECT 
            id,
            titulo,
            endereco,
            categoria,
            telefone,
            website,
            latitude,
            longitude,
            avaliacao,
            total_avaliacoes,
            posicao,
            cid,
            pesquisa,
            status,
            capturado_em
        FROM empresas 
        WHERE id = ANY(p_empresa_ids)
        ORDER BY titulo
    LOOP
        -- Construir JSON com detalhes de cada empresa
        v_empresas_detalhes := v_empresas_detalhes || jsonb_build_object(
            'id', v_empresa.id,
            'titulo', v_empresa.titulo,
            'endereco', v_empresa.endereco,
            'categoria', v_empresa.categoria,
            'telefone', v_empresa.telefone,
            'website', v_empresa.website,
            'avaliacao', v_empresa.avaliacao,
            'total_avaliacoes', v_empresa.total_avaliacoes,
            'posicao', v_empresa.posicao,
            'cid', v_empresa.cid,
            'status', v_empresa.status
        );
        
        -- Calcular métricas
        IF v_empresa.avaliacao IS NOT NULL THEN
            v_avaliacao_soma := v_avaliacao_soma + v_empresa.avaliacao;
            v_avaliacao_count := v_avaliacao_count + 1;
        END IF;
        
        IF v_empresa.total_avaliacoes IS NOT NULL THEN
            v_total_avaliacoes_soma := v_total_avaliacoes_soma + v_empresa.total_avaliacoes;
        END IF;
        
        -- Coletar categorias únicas
        IF v_empresa.categoria IS NOT NULL THEN
            v_categoria_temp := v_empresa.categoria;
            IF NOT v_categoria_temp = ANY(v_categorias_encontradas) THEN
                v_categorias_encontradas := array_append(v_categorias_encontradas, v_categoria_temp);
            END IF;
        END IF;
        
        -- Coletar cidades únicas (extrair da primeira parte do endereço)
        IF v_empresa.endereco IS NOT NULL THEN
            v_cidade_temp := split_part(split_part(v_empresa.endereco, ',', -2), '-', 1);
            v_cidade_temp := trim(v_cidade_temp);
            IF v_cidade_temp != '' AND NOT v_cidade_temp = ANY(v_cidades_encontradas) THEN
                v_cidades_encontradas := array_append(v_cidades_encontradas, v_cidade_temp);
            END IF;
        END IF;
        
        -- Capturar modalidade e status (assume que todas têm os mesmos)
        IF v_modalidade_pesquisa IS NULL THEN
            v_modalidade_pesquisa := v_empresa.pesquisa;
        END IF;
        
        IF v_status_empresas IS NULL THEN
            v_status_empresas := v_empresa.status;
        END IF;
    END LOOP;
    
    -- Calcular média de avaliações
    IF v_avaliacao_count > 0 THEN
        v_avaliacao_media := ROUND(v_avaliacao_soma / v_avaliacao_count, 1);
    END IF;
    
    -- Construir resumo textual
    v_empresas_resumo := array_length(p_empresa_ids, 1)::TEXT || ' empresas';
    IF array_length(v_categorias_encontradas, 1) > 0 THEN
        v_empresas_resumo := v_empresas_resumo || ' (' || array_to_string(v_categorias_encontradas, ', ') || ')';
    END IF;
    IF array_length(v_cidades_encontradas, 1) > 0 THEN
        v_empresas_resumo := v_empresas_resumo || ' em ' || array_to_string(v_cidades_encontradas, ', ');
    END IF;

    -- CRIAR CAMPANHA COM DADOS COMPLETOS
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
        empresas_detalhes,
        empresas_resumo,
        modalidade_pesquisa,
        status_empresas,
        avaliacao_media,
        total_avaliacoes_soma,
        categorias_encontradas,
        cidades_encontradas,
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
        v_empresas_detalhes,
        v_empresas_resumo,
        v_modalidade_pesquisa,
        v_status_empresas,
        v_avaliacao_media,
        v_total_avaliacoes_soma,
        v_categorias_encontradas,
        v_cidades_encontradas,
        v_now,
        v_now
    ) RETURNING id INTO v_campanha_id;

    -- PROCESSAR AGENDAMENTOS (como antes)
    FOR v_empresa IN 
        SELECT 
            id,
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

            -- INSERIR DISPARO AGENDADO
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

            -- REGISTRAR EMPRESA NA CAMPANHA
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

    -- Retornar resultado com mais informações
    v_resultado := json_build_object(
        'success', v_tasks_criadas > 0,
        'tasks_criadas', v_tasks_criadas,
        'total_empresas', array_length(p_empresa_ids, 1),
        'erros', v_erros,
        'nome_campanha', v_nome_campanha,
        'campanha_id', v_campanha_id,
        'empresas_resumo', v_empresas_resumo,
        'avaliacao_media', v_avaliacao_media,
        'categorias', v_categorias_encontradas,
        'cidades', v_cidades_encontradas
    );

    RETURN v_resultado;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 