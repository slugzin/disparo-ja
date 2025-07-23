-- ====================================
-- SCHEMA SQL PARA PROSPECT CRM
-- ====================================

-- Habilitar Row Level Security (RLS) para todas as tabelas
-- Execute este SQL no editor SQL do Supabase

-- ====================================
-- 1. TABELA DE PERFIS (USUARIOS)
-- ====================================

CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    nome TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    PRIMARY KEY (id)
);

-- RLS para profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policy para profiles
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- ====================================
-- 2. TABELA DE EMPRESAS
-- ====================================

CREATE TABLE IF NOT EXISTS public.empresas (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nome TEXT NOT NULL,
    setor TEXT,
    website TEXT,
    telefone TEXT,
    email TEXT,
    cidade TEXT,
    estado TEXT,
    funcionarios INTEGER,
    status TEXT DEFAULT 'Prospect' CHECK (status IN ('Prospect', 'Ativo', 'Cliente', 'Inativo')),
    observacoes TEXT,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- RLS para empresas
ALTER TABLE public.empresas ENABLE ROW LEVEL SECURITY;

-- Policy para empresas
CREATE POLICY "Users can view own companies" ON public.empresas
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own companies" ON public.empresas
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own companies" ON public.empresas
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own companies" ON public.empresas
    FOR DELETE USING (auth.uid() = user_id);

-- ====================================
-- 3. TABELA DE LEADS
-- ====================================

CREATE TABLE IF NOT EXISTS public.leads (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nome TEXT NOT NULL,
    empresa_id UUID REFERENCES public.empresas(id) ON DELETE SET NULL,
    email TEXT,
    telefone TEXT,
    whatsapp TEXT,
    cargo TEXT,
    origem TEXT DEFAULT 'Website' CHECK (origem IN ('Website', 'LinkedIn', 'Google Ads', 'Indicação', 'Evento', 'Cold Call', 'Outros')),
    status TEXT DEFAULT 'Novo' CHECK (status IN ('Novo', 'Qualificado', 'Em Contato', 'Proposta', 'Fechado', 'Perdido')),
    score INTEGER DEFAULT 0 CHECK (score >= 0 AND score <= 100),
    observacoes TEXT,
    ultimo_contato TIMESTAMP WITH TIME ZONE,
    proximo_followup TIMESTAMP WITH TIME ZONE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- RLS para leads
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Policy para leads
CREATE POLICY "Users can view own leads" ON public.leads
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own leads" ON public.leads
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own leads" ON public.leads
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own leads" ON public.leads
    FOR DELETE USING (auth.uid() = user_id);

-- ====================================
-- 4. TABELA DE CAMPANHAS
-- ====================================

CREATE TABLE IF NOT EXISTS public.campanhas (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nome TEXT NOT NULL,
    tipo TEXT DEFAULT 'WhatsApp' CHECK (tipo IN ('WhatsApp', 'Email', 'SMS', 'LinkedIn')),
    status TEXT DEFAULT 'Rascunho' CHECK (status IN ('Rascunho', 'Ativa', 'Pausada', 'Concluída', 'Cancelada')),
    mensagem_template TEXT,
    data_inicio TIMESTAMP WITH TIME ZONE,
    data_fim TIMESTAMP WITH TIME ZONE,
    total_leads INTEGER DEFAULT 0,
    mensagens_enviadas INTEGER DEFAULT 0,
    respostas_recebidas INTEGER DEFAULT 0,
    taxa_resposta DECIMAL(5,2) DEFAULT 0.00,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- RLS para campanhas
ALTER TABLE public.campanhas ENABLE ROW LEVEL SECURITY;

-- Policy para campanhas
CREATE POLICY "Users can view own campaigns" ON public.campanhas
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own campaigns" ON public.campanhas
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own campaigns" ON public.campanhas
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own campaigns" ON public.campanhas
    FOR DELETE USING (auth.uid() = user_id);

-- ====================================
-- 5. TABELA DE BASES DE DADOS
-- ====================================

CREATE TABLE IF NOT EXISTS public.bases_dados (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nome TEXT NOT NULL,
    categoria TEXT,
    origem TEXT DEFAULT 'Manual' CHECK (origem IN ('Manual', 'Google Maps', 'LinkedIn', 'Yellow Pages', 'Importação', 'API', 'Outros')),
    total_registros INTEGER DEFAULT 0,
    registros_validos INTEGER DEFAULT 0,
    qualidade_score DECIMAL(5,2) DEFAULT 0.00,
    status TEXT DEFAULT 'Ativo' CHECK (status IN ('Ativo', 'Inativo', 'Processando', 'Erro')),
    arquivo_original TEXT,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- RLS para bases_dados
ALTER TABLE public.bases_dados ENABLE ROW LEVEL SECURITY;

-- Policy para bases_dados
CREATE POLICY "Users can view own databases" ON public.bases_dados
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own databases" ON public.bases_dados
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own databases" ON public.bases_dados
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own databases" ON public.bases_dados
    FOR DELETE USING (auth.uid() = user_id);

-- ====================================
-- 6. TABELA DE MENSAGENS
-- ====================================

CREATE TABLE IF NOT EXISTS public.mensagens (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    campanha_id UUID REFERENCES public.campanhas(id) ON DELETE CASCADE,
    lead_id UUID REFERENCES public.leads(id) ON DELETE CASCADE,
    tipo TEXT DEFAULT 'WhatsApp' CHECK (tipo IN ('WhatsApp', 'Email', 'SMS', 'LinkedIn')),
    conteudo TEXT NOT NULL,
    status TEXT DEFAULT 'Enviada' CHECK (status IN ('Pendente', 'Enviada', 'Entregue', 'Lida', 'Respondida', 'Erro')),
    data_envio TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    data_resposta TIMESTAMP WITH TIME ZONE,
    resposta_conteudo TEXT,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- RLS para mensagens
ALTER TABLE public.mensagens ENABLE ROW LEVEL SECURITY;

-- Policy para mensagens
CREATE POLICY "Users can view own messages" ON public.mensagens
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own messages" ON public.mensagens
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own messages" ON public.mensagens
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own messages" ON public.mensagens
    FOR DELETE USING (auth.uid() = user_id);

-- ====================================
-- 7. TABELA DE RELACIONAMENTO CAMPANHA-LEAD
-- ====================================

CREATE TABLE IF NOT EXISTS public.campanha_leads (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    campanha_id UUID REFERENCES public.campanhas(id) ON DELETE CASCADE,
    lead_id UUID REFERENCES public.leads(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'Pendente' CHECK (status IN ('Pendente', 'Enviado', 'Respondido', 'Erro')),
    data_envio TIMESTAMP WITH TIME ZONE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(campanha_id, lead_id)
);

-- RLS para campanha_leads
ALTER TABLE public.campanha_leads ENABLE ROW LEVEL SECURITY;

-- Policy para campanha_leads
CREATE POLICY "Users can view own campaign leads" ON public.campanha_leads
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own campaign leads" ON public.campanha_leads
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own campaign leads" ON public.campanha_leads
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own campaign leads" ON public.campanha_leads
    FOR DELETE USING (auth.uid() = user_id);

-- ====================================
-- 8. ÍNDICES PARA PERFORMANCE
-- ====================================

-- Índices para tabela empresas
CREATE INDEX IF NOT EXISTS idx_empresas_user_id ON public.empresas(user_id);
CREATE INDEX IF NOT EXISTS idx_empresas_status ON public.empresas(status);
CREATE INDEX IF NOT EXISTS idx_empresas_setor ON public.empresas(setor);

-- Índices para tabela leads
CREATE INDEX IF NOT EXISTS idx_leads_user_id ON public.leads(user_id);
CREATE INDEX IF NOT EXISTS idx_leads_empresa_id ON public.leads(empresa_id);
CREATE INDEX IF NOT EXISTS idx_leads_status ON public.leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_origem ON public.leads(origem);
CREATE INDEX IF NOT EXISTS idx_leads_score ON public.leads(score);

-- Índices para tabela campanhas
CREATE INDEX IF NOT EXISTS idx_campanhas_user_id ON public.campanhas(user_id);
CREATE INDEX IF NOT EXISTS idx_campanhas_status ON public.campanhas(status);
CREATE INDEX IF NOT EXISTS idx_campanhas_tipo ON public.campanhas(tipo);

-- Índices para tabela mensagens
CREATE INDEX IF NOT EXISTS idx_mensagens_user_id ON public.mensagens(user_id);
CREATE INDEX IF NOT EXISTS idx_mensagens_campanha_id ON public.mensagens(campanha_id);
CREATE INDEX IF NOT EXISTS idx_mensagens_lead_id ON public.mensagens(lead_id);
CREATE INDEX IF NOT EXISTS idx_mensagens_status ON public.mensagens(status);

-- Índices para tabela bases_dados
CREATE INDEX IF NOT EXISTS idx_bases_dados_user_id ON public.bases_dados(user_id);
CREATE INDEX IF NOT EXISTS idx_bases_dados_status ON public.bases_dados(status);

-- ====================================
-- 9. TRIGGERS PARA UPDATED_AT
-- ====================================

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para updated_at
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.empresas
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.leads
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.campanhas
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.bases_dados
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ====================================
-- 10. FUNÇÃO PARA CRIAR PERFIL AUTOMATICAMENTE
-- ====================================

-- Função para criar perfil automaticamente quando usuário se registra
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, nome)
    VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'name');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para criar perfil automaticamente
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ====================================
-- 11. VIEWS PARA DASHBOARD
-- ====================================

-- View para estatísticas do dashboard
CREATE OR REPLACE VIEW public.dashboard_stats AS
SELECT 
    p.id as user_id,
    (SELECT COUNT(*) FROM public.leads WHERE user_id = p.id) as total_leads,
    (SELECT COUNT(*) FROM public.leads WHERE user_id = p.id AND status IN ('Qualificado', 'Em Contato', 'Proposta')) as leads_ativos,
    (SELECT COUNT(*) FROM public.leads WHERE user_id = p.id AND status = 'Fechado') as leads_fechados,
    (SELECT COUNT(*) FROM public.empresas WHERE user_id = p.id) as total_empresas,
    (SELECT COUNT(*) FROM public.campanhas WHERE user_id = p.id AND status = 'Ativa') as campanhas_ativas,
    (SELECT COALESCE(SUM(mensagens_enviadas), 0) FROM public.campanhas WHERE user_id = p.id) as mensagens_enviadas,
    (SELECT COALESCE(AVG(taxa_resposta), 0) FROM public.campanhas WHERE user_id = p.id AND status = 'Ativa') as taxa_resposta_media
FROM public.profiles p;

-- RLS para dashboard_stats
ALTER VIEW public.dashboard_stats ENABLE ROW LEVEL SECURITY;

-- Policy para dashboard_stats
CREATE POLICY "Users can view own dashboard stats" ON public.dashboard_stats
    FOR SELECT USING (auth.uid() = user_id);

-- ====================================
-- 12. FUNÇÃO RPC PARA AGENDAR DISPAROS
-- ====================================

-- ====================================
-- 13. TABELA DE CAMPANHAS DE DISPARO
-- ====================================

CREATE TABLE IF NOT EXISTS public.campanhas_disparo (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nome TEXT NOT NULL,
    descricao TEXT,
    tipo TEXT DEFAULT 'whatsapp' CHECK (tipo IN ('whatsapp', 'email', 'sms')),
    status TEXT DEFAULT 'em_andamento' CHECK (status IN ('em_andamento', 'concluida', 'cancelada')),
    total_empresas INTEGER DEFAULT 0,
    total_enviados INTEGER DEFAULT 0,
    total_erros INTEGER DEFAULT 0,
    mensagem TEXT NOT NULL,
    tipo_midia TEXT DEFAULT 'nenhum',
    midia_url TEXT,
    conexao_id TEXT,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Tabela de relacionamento entre campanhas e empresas
CREATE TABLE IF NOT EXISTS public.campanhas_empresas (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    campanha_id UUID REFERENCES public.campanhas_disparo(id) ON DELETE CASCADE,
    empresa_id TEXT NOT NULL,
    empresa_nome TEXT NOT NULL,
    status TEXT DEFAULT 'pendente' CHECK (status IN ('pendente', 'enviado', 'erro')),
    erro_mensagem TEXT,
    enviado_em TIMESTAMP WITH TIME ZONE,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_campanhas_disparo_status ON public.campanhas_disparo(status);
CREATE INDEX IF NOT EXISTS idx_campanhas_disparo_tipo ON public.campanhas_disparo(tipo);
CREATE INDEX IF NOT EXISTS idx_campanhas_empresas_campanha_id ON public.campanhas_empresas(campanha_id);
CREATE INDEX IF NOT EXISTS idx_campanhas_empresas_empresa_id ON public.campanhas_empresas(empresa_id);
CREATE INDEX IF NOT EXISTS idx_campanhas_empresas_status ON public.campanhas_empresas(status);

-- Trigger para atualizado_em
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.campanhas_disparo
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Atualizar a função RPC para incluir o registro na campanha
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

    -- Criar campanha
    INSERT INTO campanhas_disparo (
        nome,
        descricao,
        mensagem,
        tipo_midia,
        midia_url,
        conexao_id,
        total_empresas
    ) VALUES (
        v_nome_campanha,
        'Disparo automático via sistema',
        p_mensagem,
        p_tipo_midia,
        p_midia_url,
        p_conexao_id,
        array_length(p_empresa_ids, 1)
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

            -- Inserir disparo agendado
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
                conexao_id
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
                p_conexao_id
            );

            -- Registrar empresa na campanha
            INSERT INTO campanhas_empresas (
                campanha_id,
                empresa_id,
                empresa_nome
            ) VALUES (
                v_campanha_id,
                v_empresa.id,
                v_empresa.nome
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
                erro_mensagem
            ) VALUES (
                v_campanha_id,
                v_empresa.id,
                v_empresa.nome,
                'erro',
                SQLERRM
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
        END
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
GRANT ALL ON TABLE campanhas_disparo TO authenticated;
GRANT ALL ON TABLE campanhas_empresas TO authenticated;
GRANT EXECUTE ON FUNCTION agendar_disparos TO authenticated;

-- ====================================
-- FINALIZADO!
-- ====================================
-- 
-- Cole todo este SQL no editor SQL do Supabase para criar
-- todas as tabelas e configurações necessárias para o CRM.
--
-- Depois execute os arquivos TypeScript para integrar com o frontend.
-- ==================================== 