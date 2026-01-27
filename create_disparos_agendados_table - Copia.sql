-- Criar tabela para armazenar disparos agendados
CREATE TABLE IF NOT EXISTS public.disparos_agendados (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    empresa_id TEXT NOT NULL,
    empresa_nome TEXT NOT NULL,
    empresa_telefone TEXT,
    empresa_website TEXT,
    empresa_endereco TEXT,
    mensagem TEXT NOT NULL,
    tipo_midia TEXT DEFAULT 'nenhum',
    midia_url TEXT,
    status TEXT DEFAULT 'pendente' CHECK (status IN ('pendente', 'enviado', 'falhou', 'cancelado')),
    agendado_para TIMESTAMP WITH TIME ZONE NOT NULL,
    enviado_em TIMESTAMP WITH TIME ZONE,
    conexao_id TEXT NOT NULL,
    erro_mensagem TEXT,
    tentativas INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_disparos_agendados_status ON public.disparos_agendados(status);
CREATE INDEX IF NOT EXISTS idx_disparos_agendados_agendado_para ON public.disparos_agendados(agendado_para);
CREATE INDEX IF NOT EXISTS idx_disparos_agendados_empresa_id ON public.disparos_agendados(empresa_id);
CREATE INDEX IF NOT EXISTS idx_disparos_agendados_conexao_id ON public.disparos_agendados(conexao_id);

-- Trigger para updated_at
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.disparos_agendados
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Comentários
COMMENT ON TABLE public.disparos_agendados IS 'Tabela para armazenar disparos de mensagens agendados';
COMMENT ON COLUMN public.disparos_agendados.empresa_id IS 'ID da empresa (pode ser diferente do UUID)';
COMMENT ON COLUMN public.disparos_agendados.empresa_nome IS 'Nome da empresa para facilitar consultas';
COMMENT ON COLUMN public.disparos_agendados.empresa_telefone IS 'Telefone formatado para WhatsApp';
COMMENT ON COLUMN public.disparos_agendados.mensagem IS 'Conteúdo da mensagem a ser enviada';
COMMENT ON COLUMN public.disparos_agendados.tipo_midia IS 'Tipo de mídia anexa (nenhum, imagem, audio)';
COMMENT ON COLUMN public.disparos_agendados.agendado_para IS 'Data/hora para envio da mensagem';
COMMENT ON COLUMN public.disparos_agendados.conexao_id IS 'ID da conexão WhatsApp a ser usada';
COMMENT ON COLUMN public.disparos_agendados.tentativas IS 'Número de tentativas de envio'; 