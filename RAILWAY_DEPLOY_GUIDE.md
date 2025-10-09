# 🚂 Guia de Deploy no Railway

## 📋 Pré-requisitos

- ✅ Projeto no GitHub (site-joao)
- ✅ Conta no Railway ([railway.app](https://railway.app))
- ✅ Configurações preparadas

## 🚀 Passo a Passo - Deploy no Railway

### 1. **Criar Conta e Projeto**

1. Acesse [railway.app](https://railway.app)
2. Faça login com GitHub
3. Clique em "New Project"
4. Selecione "Deploy from GitHub repo"
5. Escolha o repositório `site-joao`

### 2. **Configurar Variáveis de Ambiente**

No painel do Railway, vá em **Variables** e adicione:

```env
# Banco de Dados (Railway fornece automaticamente)
DATABASE_URL=postgresql://...

# Next.js
NODE_ENV=production
NEXT_TELEMETRY_DISABLED=1

# Autenticação
NEXTAUTH_SECRET=seu_secret_super_seguro_aqui
NEXTAUTH_URL=https://seu-app.railway.app

# Email (Gmail)
EMAIL_FROM=seu-email@gmail.com
EMAIL_PASSWORD=sua_senha_de_app_gmail

# Telegram (opcional)
TELEGRAM_BOT_TOKEN=seu_token_do_bot
TELEGRAM_CHAT_ID=seu_chat_id

# Google Analytics (opcional)
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
```

### 3. **Configurar Banco PostgreSQL**

1. No Railway, clique em "Add Service"
2. Selecione "PostgreSQL"
3. O Railway criará automaticamente a `DATABASE_URL`
4. Copie a URL e adicione nas variáveis

### 4. **Deploy Automático**

- ✅ O Railway detecta automaticamente Next.js
- ✅ Instala dependências com `npm install`
- ✅ Executa `npm run build`
- ✅ Inicia com `npm start`

### 5. **Configurar Domínio**

1. No painel, vá em **Settings**
2. Em **Domains**, clique "Generate Domain"
3. Seu site estará em: `https://site-joao-production.railway.app`

## 🔧 Comandos de Build

O Railway executará automaticamente:

```bash
npm install          # Instalar dependências
npm run build        # Build da aplicação
npm start           # Iniciar servidor
```

## 🗄️ Banco de Dados

### Executar Migrações:

```bash
# No Railway, adicione este comando em "Build Command"
npm run db:migrate:deploy && npm run build
```

### Seed do Banco (opcional):

```bash
# Após deploy, execute no Railway Console:
npm run db:seed
```

## 📊 Monitoramento

### Health Check:

- ✅ Endpoint: `/api/health`
- ✅ Configurado automaticamente
- ✅ Railway monitora a aplicação

### Logs:

- Acesse logs em tempo real no painel Railway
- Monitore erros e performance

## 🔒 Segurança

### Variáveis Protegidas:

- ✅ Todas as credenciais ficam no Railway
- ✅ Não expostas no código
- ✅ Criptografadas automaticamente

### HTTPS:

- ✅ SSL automático
- ✅ Certificados gerenciados pelo Railway

## 💰 Custos

### Plano Gratuito:

- ✅ $5 de crédito mensal
- ✅ Suficiente para desenvolvimento
- ✅ Sleep após inatividade

### Plano Pro:

- 💳 $20/mês
- ⚡ Sem sleep
- 📈 Mais recursos

## 🚨 Troubleshooting

### Build Falha:

```bash
# Verificar logs no Railway
# Comum: dependências ou TypeScript errors
```

### Banco não Conecta:

```bash
# Verificar DATABASE_URL nas variáveis
# Executar migrações: npm run db:migrate:deploy
```

### 500 Error:

```bash
# Verificar logs
# Comum: variáveis de ambiente faltando
```

## 📱 URLs Finais

Após deploy completo:

- 🌐 **Aplicação**: `https://site-joao-production.railway.app`
- 🔍 **Health Check**: `https://site-joao-production.railway.app/api/health`
- 📊 **Admin**: `https://site-joao-production.railway.app/admin`

## ✅ Checklist Final

- [ ] Projeto criado no Railway
- [ ] Repositório GitHub conectado
- [ ] PostgreSQL adicionado
- [ ] Variáveis de ambiente configuradas
- [ ] Deploy executado com sucesso
- [ ] Domínio configurado
- [ ] Health check funcionando
- [ ] Banco migrado e populado
- [ ] Testes de funcionalidade

**🎉 Seu sistema médico estará online e funcionando!**
