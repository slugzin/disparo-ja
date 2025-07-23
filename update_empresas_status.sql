-- Atualizar empresas que não têm status definido
UPDATE empresas 
SET status = 'a_contatar' 
WHERE status IS NULL OR status = '';

-- Verificar quantas empresas foram atualizadas
SELECT 
  status,
  COUNT(*) as quantidade
FROM empresas 
GROUP BY status; 