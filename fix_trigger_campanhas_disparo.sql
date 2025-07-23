-- Corrigir trigger da tabela campanhas_disparo
-- O problema é que o trigger está tentando acessar 'updated_at' mas a coluna é 'atualizado_em'

-- Primeiro, remover o trigger atual se existir
DROP TRIGGER IF EXISTS handle_updated_at ON public.campanhas_disparo;

-- Criar função específica para a tabela campanhas_disparo
CREATE OR REPLACE FUNCTION public.handle_campanhas_disparo_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.atualizado_em = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar o trigger correto
CREATE TRIGGER handle_campanhas_disparo_updated_at 
    BEFORE UPDATE ON public.campanhas_disparo
    FOR EACH ROW 
    EXECUTE FUNCTION public.handle_campanhas_disparo_updated_at();

-- Comentário
COMMENT ON FUNCTION public.handle_campanhas_disparo_updated_at IS 'Atualiza automaticamente o campo atualizado_em na tabela campanhas_disparo'; 