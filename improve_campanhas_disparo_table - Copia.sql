-- Melhorar tabela campanhas_disparo com mais dados das empresas
-- Adicionar colunas para armazenar informações resumidas das empresas

ALTER TABLE public.campanhas_disparo 
ADD COLUMN IF NOT EXISTS empresas_detalhes JSONB,
ADD COLUMN IF NOT EXISTS empresas_resumo TEXT,
ADD COLUMN IF NOT EXISTS modalidade_pesquisa TEXT,
ADD COLUMN IF NOT EXISTS status_empresas TEXT,
ADD COLUMN IF NOT EXISTS avaliacao_media DECIMAL(2,1),
ADD COLUMN IF NOT EXISTS total_avaliacoes_soma INTEGER,
ADD COLUMN IF NOT EXISTS categorias_encontradas TEXT[],
ADD COLUMN IF NOT EXISTS cidades_encontradas TEXT[];

-- Índices para as novas colunas
CREATE INDEX IF NOT EXISTS idx_campanhas_disparo_modalidade ON public.campanhas_disparo(modalidade_pesquisa);
CREATE INDEX IF NOT EXISTS idx_campanhas_disparo_status_empresas ON public.campanhas_disparo(status_empresas);
CREATE INDEX IF NOT EXISTS idx_campanhas_disparo_avaliacao_media ON public.campanhas_disparo(avaliacao_media);

-- Comentários para documentar
COMMENT ON COLUMN public.campanhas_disparo.empresas_detalhes IS 'JSON com detalhes completos das empresas selecionadas';
COMMENT ON COLUMN public.campanhas_disparo.empresas_resumo IS 'Resumo textual das empresas (ex: "3 restaurantes, 2 barbearias")';
COMMENT ON COLUMN public.campanhas_disparo.modalidade_pesquisa IS 'Modalidade de pesquisa usada para encontrar as empresas';
COMMENT ON COLUMN public.campanhas_disparo.status_empresas IS 'Status das empresas (ex: "a_contatar", "contatado")';
COMMENT ON COLUMN public.campanhas_disparo.avaliacao_media IS 'Média das avaliações das empresas selecionadas';
COMMENT ON COLUMN public.campanhas_disparo.total_avaliacoes_soma IS 'Soma total de avaliações de todas as empresas';
COMMENT ON COLUMN public.campanhas_disparo.categorias_encontradas IS 'Array com as categorias das empresas';
COMMENT ON COLUMN public.campanhas_disparo.cidades_encontradas IS 'Array com as cidades das empresas'; 