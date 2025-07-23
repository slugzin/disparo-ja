-- Script para inserir dados de teste no sistema de prospecção
-- Execute este script no SQL Editor do Supabase para testar o novo dashboard

-- Inserir algumas empresas de teste
INSERT INTO empresas (titulo, endereco, categoria, telefone, website, avaliacao, total_avaliacoes, pesquisa, status, capturado_em) VALUES

-- Clínicas
('Clínica São José', 'Rua das Flores, 123 - Centro, São Paulo - SP, 01234-567', 'Clínica Médica', '(11) 3456-7890', 'https://clinicasaojose.com.br', 4.5, 150, 'clinica', 'a_contatar', NOW() - INTERVAL '2 days'),
('Clínica Vida Saudável', 'Av. Paulista, 1000 - Bela Vista, São Paulo - SP, 01310-100', 'Clínica Médica', '(11) 2345-6789', 'https://vidasaudavel.com.br', 4.8, 220, 'clinica', 'contato_realizado', NOW() - INTERVAL '5 days'),
('Centro Médico Excellence', 'Rua Augusta, 500 - Consolação, São Paulo - SP, 01305-000', 'Clínica Médica', '(11) 3333-4444', 'https://excellence.med.br', 4.7, 180, 'clinica', 'em_negociacao', NOW() - INTERVAL '1 week'),
('Clínica Bem Estar', 'Rua Oscar Freire, 200 - Jardins, São Paulo - SP, 01426-000', 'Clínica Médica', '(11) 5555-6666', NULL, 4.2, 95, 'clinica', 'ganhos', NOW() - INTERVAL '3 days'),
('Policlínica Central', 'Av. Rebouças, 800 - Pinheiros, São Paulo - SP, 05401-100', 'Clínica Médica', '(11) 7777-8888', 'https://policlinicacentral.com.br', 4.6, 300, 'clinica', 'perdidos', NOW() - INTERVAL '1 week'),

-- Barbearias  
('Barbearia Classic', 'Rua da Consolação, 150 - Centro, São Paulo - SP, 01301-000', 'Barbearia', '(11) 9999-1111', 'https://barbeariaclassic.com.br', 4.9, 450, 'barbearia', 'a_contatar', NOW() - INTERVAL '1 day'),
('Corte & Estilo', 'Rua Teodoro Sampaio, 300 - Pinheiros, São Paulo - SP, 05405-000', 'Barbearia', '(11) 8888-2222', NULL, 4.4, 120, 'barbearia', 'contato_realizado', NOW() - INTERVAL '4 days'),
('Barbearia do João', 'Av. Ipiranga, 600 - República, São Paulo - SP, 01046-010', 'Barbearia', '(11) 7777-3333', 'https://barbeariajoa.com.br', 4.1, 85, 'barbearia', 'em_negociacao', NOW() - INTERVAL '6 days'),
('The Barber Shop', 'Rua Haddock Lobo, 400 - Cerqueira César, São Paulo - SP, 01414-001', 'Barbearia', '(11) 6666-4444', 'https://thebarbershop.com.br', 4.7, 200, 'barbearia', 'ganhos', NOW() - INTERVAL '2 days'),

-- Restaurantes
('Restaurante Sabor Brasileiro', 'Av. Faria Lima, 1500 - Itaim Bibi, São Paulo - SP, 04538-132', 'Restaurante', '(11) 5555-7777', 'https://saborbrasileiro.com.br', 4.3, 380, 'restaurante', 'a_contatar', NOW() - INTERVAL '3 days'),
('Pizzaria Roma', 'Rua Bela Cintra, 250 - Consolação, São Paulo - SP, 01415-000', 'Restaurante', '(11) 4444-8888', NULL, 4.6, 250, 'restaurante', 'contato_realizado', NOW() - INTERVAL '1 week'),
('Cantina da Nonna', 'Rua 13 de Maio, 180 - Bela Vista, São Paulo - SP, 01327-000', 'Restaurante', '(11) 3333-9999', 'https://cantinanonna.com.br', 4.8, 420, 'restaurante', 'em_negociacao', NOW() - INTERVAL '5 days'),

-- Salões de Estética
('Estética Total', 'Rua Pamplona, 800 - Jardim Paulista, São Paulo - SP, 01405-001', 'Estética', '(11) 2222-1111', 'https://esteticatotal.com.br', 4.5, 160, 'estetica', 'a_contatar', NOW() - INTERVAL '2 days'),
('Beleza & Cia', 'Av. Brasil, 1200 - Jardins, São Paulo - SP, 01430-000', 'Estética', '(11) 1111-2222', NULL, 4.2, 90, 'estetica', 'contato_realizado', NOW() - INTERVAL '6 days'),
('Studio de Beleza Elite', 'Rua Estados Unidos, 500 - Jardim América, São Paulo - SP, 01427-001', 'Estética', '(11) 9999-3333', 'https://belezaelite.com.br', 4.9, 300, 'estetica', 'ganhos', NOW() - INTERVAL '4 days');

-- Inserir algumas mensagens de teste (caso a tabela exista)
INSERT INTO mensagens_enviadas (empresa_id, tipo_mensagem, conteudo, status, enviado_em) 
SELECT 
  id,
  'primeira_mensagem',
  'Olá! Somos da [Sua Empresa] e temos uma solução que pode ajudar seu negócio...',
  'enviado',
  NOW() - INTERVAL '2 days'
FROM empresas 
WHERE status IN ('contato_realizado', 'em_negociacao') 
LIMIT 5
ON CONFLICT DO NOTHING;

-- Verificar os dados inseridos
SELECT 
  pesquisa as categoria,
  status,
  COUNT(*) as total
FROM empresas 
GROUP BY pesquisa, status 
ORDER BY pesquisa, status;

-- Mostrar resumo do funil
SELECT 
  status,
  COUNT(*) as total
FROM empresas 
GROUP BY status 
ORDER BY 
  CASE status 
    WHEN 'a_contatar' THEN 1
    WHEN 'contato_realizado' THEN 2  
    WHEN 'em_negociacao' THEN 3
    WHEN 'ganhos' THEN 4
    WHEN 'perdidos' THEN 5
  END; 