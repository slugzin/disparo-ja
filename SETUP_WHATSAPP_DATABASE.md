# Setup do Banco de Dados para WhatsApp Instances

## Instruções para Configuração

### 1. Aplicar o Script SQL

Execute o script `whatsapp_instances_table.sql` no seu banco de dados Supabase:

```sql
-- Copie e cole todo o conteúdo do arquivo whatsapp_instances_table.sql
-- no SQL Editor do Supabase Dashboard
```

### 2. Verificar se a Tabela foi Criada

Execute este comando para verificar:

```sql
SELECT * FROM whatsapp_instances LIMIT 5;
```

### 3. Testar a Funcionalidade

1. **Acesse a aba "Disparos"** no sistema
2. **Clique em "Nova Instância"**
3. **Digite um nome** (ex: "WhatsApp Teste")
4. **Clique em "Criar Agente"**

### 4. Monitorar os Logs

Verifique os logs no console do navegador para:
- ✅ Sucesso na criação da instância
- ✅ Salvamento no banco de dados
- ✅ Exibição do QR Code real

### 5. Estrutura da Tabela

A tabela `whatsapp_instances` contém:

- **Dados da Instância**: name, instance_id, status
- **Configurações**: integration, settings
- **QR Code**: qr_code_data (base64), qr_code_count
- **Segurança**: hash, tokens
- **Webhooks**: webhook_config, websocket_config
- **Auditoria**: created_at, updated_at
- **RLS**: Row Level Security habilitado

### 6. Funcionalidades Implementadas

✅ **Criar Instância**: Chama API Evolution + Salva no banco
✅ **Listar Instâncias**: Carrega do banco de dados
✅ **Exibir QR Code**: QR real da API em base64
✅ **Atualizar Status**: connected/disconnected/connecting
✅ **Deletar Instância**: Remove do banco
✅ **Segurança**: RLS por usuário

### 7. Próximos Passos

Para completar a integração:

1. **Edge Function para QR Code**: Buscar QR atualizado
2. **Webhook Handler**: Receber status de conexão
3. **Auto-refresh**: Atualizar status automaticamente
4. **Reconexão**: Gerar novo QR quando expirar

### 8. Troubleshooting

**Erro: Tabela não existe**
```sql
-- Execute o script SQL novamente
```

**Erro: RLS bloqueando**
```sql
-- Verifique se o usuário está autenticado
SELECT auth.uid();
```

**QR Code não aparece**
- Verifique se `qr_code_data` tem valor na tabela
- Confirme que a API Evolution retornou base64

### 9. Exemplo de Dados

Após criar uma instância, você verá dados assim:

```json
{
  "instance_name": "WhatsApp Teste",
  "instance_id": "9b569699-8f0a-40d9-975f-d056ffe904a0",
  "status": "connecting",
  "qr_code_data": "data:image/png;base64,iVBORw0KGgo...",
  "hash": "E743E6D9-4575-48FF-AA78-23366585CEB9"
}
``` 