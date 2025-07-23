# 🚀 Deploy da Edge Function - Captar Empresas

## 📋 **Pré-requisitos**
- Supabase CLI instalado
- Projeto Supabase configurado
- API Key do Google Serper

## 🔧 **Instalação do Supabase CLI**

```bash
# Windows (PowerShell)
npm install -g supabase

# Verificar instalação
supabase --version
```

## 🚀 **Configuração e Deploy**

### 1. **Fazer login no Supabase**
```bash
supabase login
```

### 2. **Linkar o projeto**
```bash
supabase link --project-ref SEU_PROJECT_ID
```

### 3. **Fazer deploy da Edge Function**
```bash
supabase functions deploy captar-empresas
```

### 4. **Definir variáveis de ambiente (se necessário)**
```bash
supabase secrets set SERPER_API_KEY=a30632a100c0737cf6b57c0f2fd1d0755e392af3
```

### 5. **Testar a função**
```bash
supabase functions invoke captar-empresas --data '{
  "tipoEmpresa": "restaurante",
  "pais": "BR",
  "localizacao": "São Paulo",
  "idioma": "pt-br",
  "quantidadeEmpresas": 10
}'
```

## 🔄 **Comandos Úteis**

### Verificar logs
```bash
supabase functions logs captar-empresas
```

### Redeploy após mudanças
```bash
supabase functions deploy captar-empresas
```

### Listar funções
```bash
supabase functions list
```

## 🎯 **Estrutura de Resposta**

```json
{
  "success": true,
  "data": {
    "empresas": [
      {
        "title": "Restaurante Exemplo",
        "address": "Rua das Flores, 123",
        "phone": "(11) 99999-9999",
        "website": "https://exemplo.com",
        "rating": 4.5,
        "reviews": 150,
        "category": "Restaurante",
        "position": 1
      }
    ],
    "totalEncontradas": 10,
    "parametrosBusca": {
      "tipoEmpresa": "restaurante",
      "localizacao": "São Paulo, Brazil",
      "pais": "BR",
      "idioma": "pt-br",
      "quantidadeSolicitada": 10
    }
  },
  "message": "Encontradas 10 empresas do tipo 'restaurante' em São Paulo, Brazil"
}
```

## 🎨 **Funcionalidades Implementadas**

✅ **Múltiplas páginas**: Busca até 20 empresas fazendo 2 requisições (página 1 e 2)
✅ **Remoção de duplicatas**: Filtra empresas duplicadas por nome e endereço
✅ **Mapeamento de países**: Converte códigos de país para formato da API
✅ **Validação de entrada**: Verifica campos obrigatórios
✅ **Tratamento de erro**: Retorna erros formatados
✅ **CORS configurado**: Permite requisições do frontend
✅ **Execução paralela**: Faz as requisições simultaneamente para melhor performance

## 🔧 **Troubleshooting**

### Erro de CORS
- Verifique se o arquivo `_shared/cors.ts` está correto
- Confirme que a função está tratando requisições OPTIONS

### Erro de API Key
- Verifique se a API Key do Serper está correta
- Confirme se você tem créditos na conta

### Timeout
- A função tem timeout de 60 segundos
- Para muitas empresas, considere implementar paginação lazy

## 📊 **Limites do Plano Free**
- Máximo 20 empresas por busca
- Rate limit da API Serper
- Timeout de 60 segundos por requisição 