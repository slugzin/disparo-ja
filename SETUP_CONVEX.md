# Setup do Convex + Clerk para Disparo Já

## Passo 1: Criar conta no Convex

1. Acesse [convex.dev](https://convex.dev)
2. Crie uma conta ou faça login
3. Crie um novo projeto

## Passo 2: Configurar o Convex

```bash
# Inicializar o Convex (vai pedir login)
npx convex dev
```

Isso vai:
- Conectar ao seu projeto Convex
- Gerar os arquivos em `convex/_generated/`
- Criar o schema no banco de dados
- Iniciar o servidor de desenvolvimento

## Passo 3: Criar conta no Clerk

1. Acesse [clerk.com](https://clerk.com)
2. Crie uma conta ou faça login
3. Crie uma nova aplicação
4. Configure os métodos de autenticação (Email, Google, etc.)

## Passo 4: Configurar variáveis de ambiente

### Frontend (.env.local)

```env
VITE_CONVEX_URL=https://seu-projeto.convex.cloud
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
```

### Convex Dashboard (Environment Variables)

No painel do Convex, adicione:

```
CLERK_JWT_ISSUER_DOMAIN=https://seu-projeto.clerk.accounts.dev
SERPER_API_KEY=sua_chave_serper
WAHA_API_URL=https://sua-waha-api.com
WAHA_API_KEY=sua_chave_waha
```

## Passo 5: Configurar Clerk no Convex

1. No Clerk Dashboard, vá em "JWT Templates"
2. Crie um template chamado "convex"
3. No Convex Dashboard, vá em "Settings" > "Authentication"
4. Configure o Clerk como provider

## Passo 6: Executar o projeto

```bash
# Terminal 1 - Backend Convex
npm run convex:dev

# Terminal 2 - Frontend Vite
npm run dev
```

Ou use o comando combinado:

```bash
npm run dev:all
```

## Estrutura do Convex

```
convex/
├── schema.ts              # Definição das tabelas
├── auth.config.ts         # Configuração do Clerk
├── queries/               # Consultas (leitura)
│   ├── dashboard.ts
│   ├── empresas.ts
│   ├── leads.ts
│   ├── campanhas.ts
│   ├── disparos.ts
│   ├── templates.ts
│   ├── whatsappInstances.ts
│   ├── conversas.ts
│   └── profiles.ts
├── mutations/             # Mutações (escrita)
│   ├── empresas.ts
│   ├── leads.ts
│   ├── campanhas.ts
│   ├── disparos.ts
│   ├── templates.ts
│   ├── whatsappInstances.ts
│   ├── conversas.ts
│   └── profiles.ts
└── actions/               # Actions (código Node.js)
    ├── captarEmpresas.ts  # Serper API
    ├── buscarLocalizacoes.ts
    ├── evolutionApi.ts    # WAHA API
    └── processarDisparos.ts
```

## APIs Externas

### Serper API (Busca de empresas)
- Site: [serper.dev](https://serper.dev)
- Usado para buscar empresas no Google Maps
- Configure a chave `SERPER_API_KEY` no Convex

### WAHA API (WhatsApp)
- Auto-hospedado ou serviço terceiro
- Configure `WAHA_API_URL` e `WAHA_API_KEY` no Convex

## Benefícios do Convex

1. **Real-time automático**: Todas as queries são reativas
2. **TypeScript end-to-end**: Tipos gerados automaticamente
3. **Sem servidor**: Backend serverless escalável
4. **Cache inteligente**: Otimização automática
5. **Dashboard**: Interface para visualizar dados

## Troubleshooting

### Erro "CONVEX_URL não configurada"
- Verifique se `.env.local` tem a variável `VITE_CONVEX_URL`
- Reinicie o servidor de desenvolvimento

### Erro "Clerk não autenticado"
- Verifique se `VITE_CLERK_PUBLISHABLE_KEY` está correta
- Verifique se o JWT Issuer está configurado no Convex

### Erro nas Actions
- Verifique se as variáveis de ambiente estão no Convex Dashboard
- As actions rodam no servidor, não no browser
