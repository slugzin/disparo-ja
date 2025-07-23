-- Reset todas as empresas para status 'a_contatar'
UPDATE empresas SET status = 'a_contatar'::status_kanban; 