# Integração n8n - Disparos WhatsApp

## 🎯 **Fluxo de Integração**

### **1. Buscar Tarefas Pendentes**
O n8n deve consultar periodicamente as tarefas pendentes:

```http
POST https://seu-projeto.supabase.co/rest/v1/rpc/buscar_tarefas_pendentes
Content-Type: application/json
apikey: sua-api-key
Authorization: Bearer sua-api-key

{
  "p_limit": 10
}
```

**Resposta:**
```json
[
  {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "empresa_id": 1,
    "empresa_nome": "Restaurante Marcondes",
    "empresa_telefone": "5541999887766@s.whatsapp.net",
    "mensagem": "Olá! Como vai?",
    "conexao_id": "Tech Vendas",
    "agendado_para": "2025-07-22T20:30:00Z",
    "criado_em": "2025-07-22T20:00:00Z"
  }
]
```

### **2. Enviar Mensagem via Evolution API**
Para cada tarefa, o n8n envia via Evolution API:

```http
POST https://sua-evolution-api.com/message/sendText/Tech_Vendas
Content-Type: application/json
apikey: sua-evolution-key

{
  "number": "5541999887766@s.whatsapp.net",
  "text": "Olá! Como vai?"
}
```

### **3. Finalizar Tarefa (SUCESSO)**
Após envio bem-sucedido:

```http
POST https://seu-projeto.supabase.co/rest/v1/rpc/finalizar_task
Content-Type: application/json
apikey: sua-api-key
Authorization: Bearer sua-api-key

{
  "p_empresa_id": 1,
  "p_status_envio": "enviado",
  "p_campanha_id": "123e4567-e89b-12d3-a456-426614174000"
}
```

**Resposta de Sucesso:**
```json
{
  "success": true,
  "empresa_id": 1,
  "empresa_nome": "Restaurante Marcondes",
  "status_anterior": "a_contatar",
  "status_envio": "enviado",
  "status_atualizado": true,
  "mensagem": "Empresa atualizada com sucesso para contato_realizado",
  "campanha_id": "123e4567-e89b-12d3-a456-426614174000",
  "timestamp": "2025-07-22T20:35:00Z"
}
```

### **4. Finalizar Tarefa (ERRO)**
Em caso de erro no envio:

```http
POST https://seu-projeto.supabase.co/rest/v1/rpc/finalizar_task
Content-Type: application/json
apikey: sua-api-key
Authorization: Bearer sua-api-key

{
  "p_empresa_id": 1,
  "p_status_envio": "erro",
  "p_erro_mensagem": "Número inválido ou bloqueado",
  "p_campanha_id": "123e4567-e89b-12d3-a456-426614174000"
}
```

**Resposta de Erro:**
```json
{
  "success": true,
  "empresa_id": 1,
  "empresa_nome": "Restaurante Marcondes",
  "status_anterior": "a_contatar",
  "status_envio": "erro",
  "status_atualizado": false,
  "mensagem": "Status da empresa mantido (erro no envio)",
  "campanha_id": "123e4567-e89b-12d3-a456-426614174000",
  "timestamp": "2025-07-22T20:35:00Z"
}
```

## 🔄 **Workflow n8n Sugerido**

### **Nó 1: Schedule Trigger**
- **Intervalo**: A cada 30 segundos
- **Ativo**: Somente durante horário comercial

### **Nó 2: HTTP Request - Buscar Tarefas**
- **Method**: POST
- **URL**: `{{$env.SUPABASE_URL}}/rest/v1/rpc/buscar_tarefas_pendentes`
- **Headers**: 
  - `apikey`: `{{$env.SUPABASE_KEY}}`
  - `Authorization`: `Bearer {{$env.SUPABASE_KEY}}`
- **Body**: `{"p_limit": 10}`

### **Nó 3: Split In Batches**
- **Batch Size**: 1
- **Input Data**: `{{$json}}`

### **Nó 4: HTTP Request - Enviar WhatsApp**
- **Method**: POST  
- **URL**: `{{$env.EVOLUTION_URL}}/message/sendText/{{$json.conexao_id.replace(' ', '_')}}`
- **Headers**: `apikey`: `{{$env.EVOLUTION_KEY}}`
- **Body**: 
```json
{
  "number": "{{$json.empresa_telefone}}",
  "text": "{{$json.mensagem}}"
}
```

### **Nó 5: IF - Sucesso/Erro**
- **Condition**: `{{$json.status}} === 'success'`

### **Nó 6A: HTTP Request - Finalizar Sucesso**
- **Method**: POST
- **URL**: `{{$env.SUPABASE_URL}}/rest/v1/rpc/finalizar_task`
- **Body**: 
```json
{
  "p_empresa_id": {{$node["Split In Batches"].json.empresa_id}},
  "p_status_envio": "enviado",
  "p_campanha_id": "{{$node["Split In Batches"].json.campanha_id}}"
}
```

### **Nó 6B: HTTP Request - Finalizar Erro**
- **Method**: POST
- **URL**: `{{$env.SUPABASE_URL}}/rest/v1/rpc/finalizar_task`
- **Body**: 
```json
{
  "p_empresa_id": {{$node["Split In Batches"].json.empresa_id}},
  "p_status_envio": "erro",
  "p_erro_mensagem": "{{$json.error || 'Erro desconhecido'}}",
  "p_campanha_id": "{{$node["Split In Batches"].json.campanha_id}}"
}
```

## 🔧 **Variáveis de Ambiente**

Configure no n8n:
```env
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_KEY=sua-api-key-supabase
EVOLUTION_URL=https://sua-evolution-api.com
EVOLUTION_KEY=sua-api-key-evolution
```

## 📊 **Monitoramento**

### **Logs de Sucesso:**
- ✅ Empresa status: `a_contatar` → `contato_realizado`
- ✅ Histórico: Status `enviado` com timestamp
- ✅ Campanha: Totais atualizados automaticamente

### **Logs de Erro:**
- ❌ Empresa status: Mantido
- ❌ Histórico: Status `erro` com mensagem
- ❌ Campanha: Total de erros incrementado

## 🔍 **Queries de Monitoramento**

### **Tarefas Pendentes:**
```sql
SELECT COUNT(*) as pendentes 
FROM disparos_agendados 
WHERE status = 'pendente' AND agendado_para <= NOW();
```

### **Taxa de Sucesso por Campanha:**
```sql
SELECT 
  c.nome,
  c.total_empresas,
  c.total_enviados,
  c.total_erros,
  ROUND((c.total_enviados::FLOAT / c.total_empresas) * 100, 2) as taxa_sucesso
FROM campanhas_disparo c
ORDER BY c.criado_em DESC;
```

### **Empresas por Status:**
```sql
SELECT status, COUNT(*) as total
FROM empresas 
GROUP BY status
ORDER BY total DESC;
``` 