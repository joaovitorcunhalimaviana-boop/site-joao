# 🚂 Deploy Final no Railway - Site Dr. João Vitor Viana

## ✅ Status Pré-Deploy

- ✅ Build de produção funcionando (`npm run build` - sucesso)
- ✅ Sistema de emails testado e funcionando
- ✅ Dockerfile configurado corretamente
- ✅ railway.json configurado
- ✅ Todas as funcionalidades testadas localmente

## 🚀 Passo a Passo para Deploy

### 1. **Acessar Railway**
1. Vá para [railway.app](https://railway.app)
2. Faça login com GitHub
3. Clique em "New Project"
4. Selecione "Deploy from GitHub repo"
5. Escolha o repositório do projeto

### 2. **Configurar Variáveis de Ambiente Essenciais**

No painel do Railway, vá em **Variables** e adicione:

#### Variáveis Obrigatórias:
```env
# Next.js
NODE_ENV=production
NEXT_TELEMETRY_DISABLED=1

# Autenticação
NEXTAUTH_SECRET=gere_um_secret_super_seguro_aqui_com_32_caracteres
NEXTAUTH_URL=https://seu-app.railway.app

# Banco de Dados (Railway fornece automaticamente)
DATABASE_URL=postgresql://...

# Email - Gmail (OBRIGATÓRIO para emails funcionarem)
EMAIL_USER=seu-email@gmail.com
EMAIL_PASSWORD=sua_senha_de_app_gmail
EMAIL_FROM=seu-email@gmail.com
EMAIL_FROM_NAME=Dr. João Vitor Viana
EMAIL_REPLY_TO=seu-email@gmail.com

# SMTP
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
```

#### Variáveis Opcionais (Mailtrap):
```env
# Mailtrap (para testes de email)
MAILTRAP_API_TOKEN=seu_token_mailtrap
MAILTRAP_INBOX_ID=seu_inbox_id
```

#### Variáveis Opcionais (Notificações):
```env
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
4. A variável será disponibilizada automaticamente

### 4. **Configurações de Segurança**

Adicione estas variáveis para segurança:

```env
# Segurança
ENCRYPTION_KEY=gere_uma_chave_de_32_caracteres_aqui
JWT_SECRET=outro_secret_seguro_para_jwt_tokens

# LGPD
LGPD_ENCRYPTION_KEY=chave_especifica_para_lgpd_32_chars
```

### 5. **Deploy Automático**

O Railway detectará automaticamente:
- ✅ Dockerfile configurado
- ✅ railway.json com configurações
- ✅ Build command: `npm run build`
- ✅ Start command: `npm start`

### 6. **Verificar Deploy**

Após o deploy:

1. **Verificar Logs**: Vá para "Deployments" > "View Logs"
2. **Testar URL**: Acesse a URL fornecida pelo Railway
3. **Testar Emails**: Use os endpoints de teste:
   - `POST /api/send-welcome-email`
   - `POST /api/birthday-emails`

### 7. **Configurar Domínio Personalizado (Opcional)**

1. No Railway, vá para "Settings" > "Domains"
2. Clique em "Custom Domain"
3. Adicione `joaovitorviana.com.br`
4. Configure os DNS conforme instruções

## 🔧 Comandos de Teste Pós-Deploy

```bash
# Testar email de boas-vindas
curl -X POST https://seu-app.railway.app/api/send-welcome-email \
  -H "Content-Type: application/json" \
  -d '{"email":"teste@example.com","name":"Teste"}'

# Testar verificação de aniversários
curl -X POST https://seu-app.railway.app/api/birthday-emails \
  -H "Content-Type: application/json"

# Verificar saúde da aplicação
curl https://seu-app.railway.app/api/health
```

## 🚨 Troubleshooting

### Problemas Comuns:

1. **Build falha**:
   - Verifique se todas as dependências estão no package.json
   - Confirme se o Dockerfile está correto

2. **Emails não funcionam**:
   - Verifique se EMAIL_USER e EMAIL_PASSWORD estão configurados
   - Confirme se a senha de app do Gmail está correta

3. **Banco de dados não conecta**:
   - Verifique se o serviço PostgreSQL foi criado
   - Confirme se DATABASE_URL está disponível

4. **Aplicação não inicia**:
   - Verifique os logs no Railway
   - Confirme se a porta está configurada corretamente

## 📋 Checklist Final

Antes de considerar o deploy completo:

- [ ] ✅ Aplicação carrega sem erros
- [ ] ✅ Sistema de emails funcionando
- [ ] ✅ Banco de dados conectado
- [ ] ✅ Todas as páginas acessíveis
- [ ] ✅ Formulários funcionando
- [ ] ✅ Sistema de newsletter operacional
- [ ] ✅ Calculadoras médicas funcionando
- [ ] ✅ Sistema de agendamento operacional

## 🎯 Próximos Passos Pós-Deploy

1. **Monitoramento**: Configure alertas no Railway
2. **Backup**: Implemente backup automático do banco
3. **SSL**: Verificar se HTTPS está ativo
4. **Performance**: Monitorar métricas de performance
5. **SEO**: Submeter sitemap aos motores de busca

---

**🚀 Projeto pronto para deploy no Railway!**

**URL de exemplo**: `https://site-joao-production.railway.app`
**Domínio personalizado**: `https://joaovitorviana.com.br` (após configuração DNS)