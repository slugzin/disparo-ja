# Troubleshooting - WhatsApp Instances

## 🔍 Diagnóstico Passo a Passo

### 1. Verificar Banco de Dados

Execute o script `test_whatsapp_table.sql` no SQL Editor do Supabase:

```sql
-- Cole todo o conteúdo de test_whatsapp_table.sql
```

**Resultados esperados:**
- ✅ `table_exists`: true
- ✅ Estrutura da tabela com todos os campos
- ✅ RLS habilitado: true  
- ✅ Políticas criadas para CRUD
- ✅ `current_user_id`: seu UUID de usuário

### 2. Verificar Console do Navegador

1. Abra a aba **Disparos**
2. Pressione **F12** para abrir DevTools
3. Vá na aba **Console**
4. Procure por estas mensagens:

**Carregamento:**
```
🔄 Carregando instâncias do banco de dados...
🔍 Verificando autenticação...
✅ Usuário autenticado: [seu-uuid]
🗄️ Buscando instâncias na tabela whatsapp_instances...
📋 Dados retornados do banco: []
📭 Nenhuma instância encontrada no banco
```

### 3. Criar Instância de Teste

1. Clique em **"Nova Instância"**
2. Digite: `Teste WhatsApp`
3. Clique **"Criar Agente"**
4. Verifique logs no console:

**Criação:**
```
Criando instância WhatsApp: Teste WhatsApp
Resposta da API Evolution: {...}
💾 Iniciando salvamento no banco...
✅ Usuário autenticado para salvar: [uuid]
🗄️ Inserindo dados na tabela whatsapp_instances...
✅ Dados inseridos com sucesso: [...]
✅ Instância salva no banco com sucesso!
```

### 4. Problemas Comuns e Soluções

#### ❌ "Usuário não autenticado"
**Solução:**
```sql
-- Verificar se está logado
SELECT auth.uid();
-- Se retornar NULL, faça login novamente
```

#### ❌ "Table 'whatsapp_instances' doesn't exist"
**Solução:**
```sql
-- Execute novamente o script de criação
-- whatsapp_instances_table.sql
```

#### ❌ "RLS policy violation"
**Solução:**
```sql
-- Verificar se políticas estão ativas
SELECT * FROM pg_policies WHERE tablename = 'whatsapp_instances';
-- Reexecutar as políticas se necessário
```

#### ❌ Edge Function "evolution" falha
**Possíveis causas:**
- Edge function não existe
- Edge function com erro
- URL da API Evolution incorreta
- Parâmetros incorretos

**Debug:**
```javascript
// No console do navegador
await supabase.functions.invoke('evolution', {
  body: {
    instanceName: "teste",
    token: "",
    qrcode: true,
    integration: "WHATSAPP-BAILEYS"
  }
});
```

### 5. Verificação Manual no Banco

Execute no SQL Editor:

```sql
-- Ver todas as instâncias do usuário atual
SELECT * FROM whatsapp_instances WHERE user_id = auth.uid();

-- Inserir instância de teste manual
INSERT INTO whatsapp_instances (
    user_id,
    instance_name,
    instance_id,
    integration,
    hash,
    status,
    qr_code_data,
    qr_code_count
) VALUES (
    auth.uid(),
    'Teste Manual',
    'manual-test-' || random()::text,
    'WHATSAPP-BAILEYS',
    'TEST-HASH',
    'connecting',
    'data:image/png;base64,test',
    1
);
```

### 6. Logs Detalhados Ativados

Com as mudanças feitas, você verá logs detalhados:

**Símbolos dos Logs:**
- 🔄 = Carregando
- ✅ = Sucesso  
- ❌ = Erro
- 📋 = Dados
- 🗄️ = Banco de dados
- 💾 = Salvando
- 🔍 = Verificando

### 7. Checklist de Verificação

- [ ] Tabela `whatsapp_instances` existe
- [ ] RLS habilitado
- [ ] Políticas criadas
- [ ] Usuário autenticado
- [ ] Edge function `evolution` funcionando
- [ ] Console mostra logs detalhados
- [ ] Instâncias são salvas no banco
- [ ] Instâncias são carregadas na interface

### 8. Teste de Fluxo Completo

1. **Criar instância** → Deve salvar no banco
2. **Recarregar página** → Deve carregar do banco
3. **Clicar no card** → Deve mostrar QR real
4. **"Escaneei QR Code"** → Deve atualizar status
5. **Verificar banco** → Status deve ser "connected"

### 9. Comandos Úteis SQL

```sql
-- Limpar todas as instâncias do usuário
DELETE FROM whatsapp_instances WHERE user_id = auth.uid();

-- Ver estrutura da tabela
\d whatsapp_instances

-- Verificar permissões
SELECT grantee, privilege_type 
FROM information_schema.role_table_grants 
WHERE table_name='whatsapp_instances';
```

### 10. Em Caso de Problema Persistente

Execute estes comandos para resetar:

```sql
-- 1. Dropar tabela
DROP TABLE IF EXISTS whatsapp_instances CASCADE;

-- 2. Recriar tabela
-- (Execute novamente whatsapp_instances_table.sql)

-- 3. Verificar novamente
SELECT * FROM test_whatsapp_table.sql;
```

---

## 📞 Status de Debug

Execute os passos acima e me informe:

1. **Resultado do test_whatsapp_table.sql**
2. **Logs do console ao carregar a página**
3. **Logs do console ao criar instância**
4. **Mensagens de erro específicas**

Assim posso ajudar com o problema específico! 