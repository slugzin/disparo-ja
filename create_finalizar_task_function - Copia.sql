-- Função RPC para finalizar tarefa de disparo (chamada pelo n8n)
-- Atualiza status da empresa e registra sucesso no histórico

CREATE OR REPLACE FUNCTION finalizar_task(
    p_empresa_id INTEGER,
    p_status_envio TEXT DEFAULT 'enviado', -- 'enviado' ou 'erro'
    p_erro_mensagem TEXT DEFAULT NULL,
    p_campanha_id UUID DEFAULT NULL
) RETURNS JSON AS $$
DECLARE
    v_empresa_atual RECORD;
    v_resultado JSON;
    v_sucesso BOOLEAN := FALSE;
    v_mensagem TEXT;
BEGIN
    -- Verificar se a empresa existe
    SELECT id, titulo, status INTO v_empresa_atual
    FROM empresas 
    WHERE id = p_empresa_id;
    
    IF NOT FOUND THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Empresa não encontrada com ID: ' || p_empresa_id::TEXT,
            'empresa_id', p_empresa_id
        );
    END IF;

    -- ATUALIZAR STATUS DA EMPRESA (se foi enviado com sucesso)
    IF p_status_envio = 'enviado' THEN
        UPDATE empresas 
        SET 
            status = CASE 
                WHEN status = 'a_contatar' THEN 'contato_realizado'
                ELSE status -- Manter status atual se não for 'a_contatar'
            END,
            atualizado_em = NOW()
        WHERE id = p_empresa_id;
        
        v_sucesso := TRUE;
        v_mensagem := 'Empresa atualizada com sucesso para contato_realizado';
    ELSE
        v_mensagem := 'Status da empresa mantido (erro no envio)';
    END IF;

    -- ATUALIZAR HISTÓRICO NO DISPAROS_AGENDADOS
    UPDATE disparos_agendados 
    SET 
        status = p_status_envio,
        enviado_em = CASE WHEN p_status_envio = 'enviado' THEN NOW() ELSE enviado_em END,
        erro_mensagem = p_erro_mensagem,
        tentativas = tentativas + 1,
        updated_at = NOW()
    WHERE empresa_id = p_empresa_id
      AND status = 'pendente'
      AND agendado_para <= NOW(); -- Apenas tarefas que já deveriam ter sido processadas

    -- ATUALIZAR HISTÓRICO NA CAMPANHA (se campanha_id foi fornecido)
    IF p_campanha_id IS NOT NULL THEN
        UPDATE campanhas_empresas 
        SET 
            status = p_status_envio,
            erro_mensagem = p_erro_mensagem,
            enviado_em = CASE WHEN p_status_envio = 'enviado' THEN NOW() ELSE enviado_em END
        WHERE campanha_id = p_campanha_id 
          AND empresa_id = p_empresa_id::TEXT;

        -- Atualizar totais da campanha
        UPDATE campanhas_disparo 
        SET 
            total_enviados = (
                SELECT COUNT(*) 
                FROM campanhas_empresas 
                WHERE campanha_id = p_campanha_id AND status = 'enviado'
            ),
            total_erros = (
                SELECT COUNT(*) 
                FROM campanhas_empresas 
                WHERE campanha_id = p_campanha_id AND status = 'erro'
            ),
            status = CASE 
                WHEN (
                    SELECT COUNT(*) 
                    FROM campanhas_empresas 
                    WHERE campanha_id = p_campanha_id AND status IN ('enviado', 'erro')
                ) = total_empresas THEN 'concluida'
                ELSE status
            END,
            atualizado_em = NOW()
        WHERE id = p_campanha_id;
    END IF;

    -- Retornar resultado
    v_resultado := json_build_object(
        'success', true,
        'empresa_id', p_empresa_id,
        'empresa_nome', v_empresa_atual.titulo,
        'status_anterior', v_empresa_atual.status,
        'status_envio', p_status_envio,
        'status_atualizado', v_sucesso,
        'mensagem', v_mensagem,
        'campanha_id', p_campanha_id,
        'timestamp', NOW()
    );

    RETURN v_resultado;

EXCEPTION WHEN OTHERS THEN
    -- Em caso de erro, retornar detalhes
    RETURN json_build_object(
        'success', false,
        'error', 'Erro interno: ' || SQLERRM,
        'empresa_id', p_empresa_id,
        'status_envio', p_status_envio,
        'timestamp', NOW()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comentário da função
COMMENT ON FUNCTION finalizar_task IS 'Finaliza tarefa de disparo atualizando status da empresa e histórico. Chamada pelo n8n após envio.';

-- Permissões
GRANT EXECUTE ON FUNCTION finalizar_task TO authenticated;
GRANT EXECUTE ON FUNCTION finalizar_task TO anon; -- Para permitir chamada externa do n8n

-- ====================================
-- FUNÇÃO AUXILIAR: Buscar próximas tarefas pendentes
-- ====================================

CREATE OR REPLACE FUNCTION buscar_tarefas_pendentes(
    p_limit INTEGER DEFAULT 10
) RETURNS TABLE (
    id UUID,
    empresa_id INTEGER,
    empresa_nome TEXT,
    empresa_telefone TEXT,
    mensagem TEXT,
    conexao_id TEXT,
    agendado_para TIMESTAMP WITH TIME ZONE,
    criado_em TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        da.id,
        da.empresa_id,
        da.empresa_nome,
        da.empresa_telefone,
        da.mensagem,
        da.conexao_id,
        da.agendado_para,
        da.criado_em
    FROM disparos_agendados da
    WHERE da.status = 'pendente'
      AND da.agendado_para <= NOW()
    ORDER BY da.agendado_para ASC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comentário da função auxiliar
COMMENT ON FUNCTION buscar_tarefas_pendentes IS 'Busca próximas tarefas pendentes para processamento pelo n8n.';

-- Permissões para função auxiliar
GRANT EXECUTE ON FUNCTION buscar_tarefas_pendentes TO authenticated;
GRANT EXECUTE ON FUNCTION buscar_tarefas_pendentes TO anon; 