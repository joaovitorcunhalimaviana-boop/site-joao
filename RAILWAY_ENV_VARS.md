# Variáveis de Ambiente para Railway - Dr. João Vitor Viana

## Variáveis Essenciais (OBRIGATÓRIAS)

### 1. Configuração do Banco de Dados
```
DATABASE_URL=postgresql://username:password@host:port/database
```
*Será fornecida automaticamente pelo Railway PostgreSQL*

### 2. Configuração de Segurança
```
NEXTAUTH_SECRET=/2Rlko=hH1>(4P^s@Sn&Xqh]JE=pASY1
NEXTAUTH_URL=https://seu-dominio.railway.app
ENCRYPTION_KEY=pS7tpq6+!vkhb;+kA5/Hrg>YZO]T8Xw[
JWT_SECRET=bbtIx#u[hqN[0Gv>9}^&i^el8w_[D2Rx
```

### 3. Configuração do Ambiente
```
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://seu-dominio.railway.app
```

### 4. Configuração LGPD
```
LGPD_ENCRYPTION_KEY=8b>&K!B{)|Z)-0T:#}Lq}q0MN)3CCor>
```

## Variáveis de Email (RECOMENDADAS)

### Gmail SMTP (Principal)
```
GMAIL_USER=seu-email@gmail.com
GMAIL_PASS=sua-senha-de-app
```

### Mailtrap (Backup/Desenvolvimento)
```
MAILTRAP_API_TOKEN=seu-token-mailtrap
MAILTRAP_INBOX_ID=seu-inbox-id
```

## Variáveis Opcionais

### Notificações WhatsApp
```
WHATSAPP_API_URL=https://api.whatsapp.com
WHATSAPP_TOKEN=seu-token-whatsapp
WHATSAPP_PHONE_ID=seu-phone-id
```

### Notificações Telegram
```
TELEGRAM_BOT_TOKEN=seu-bot-token
TELEGRAM_CHAT_ID=seu-chat-id
```

### Configurações de Upload
```
MAX_FILE_SIZE=10485760
ALLOWED_FILE_TYPES=pdf,doc,docx,jpg,jpeg,png
```

### Configurações de Sessão
```
SESSION_MAX_AGE=2592000
```

### Monitoramento (Sentry)
```
SENTRY_DSN=https://seu-dsn@sentry.io/projeto
```

### Configurações de Rate Limiting
```
RATE_LIMIT_MAX=100
RATE_LIMIT_WINDOW=900000
```

### Configurações de Auditoria
```
AUDIT_LOG_RETENTION_DAYS=90
```

## Instruções de Configuração no Railway

1. **Acesse o Railway Dashboard**
2. **Selecione seu projeto**
3. **Vá para a aba "Variables"**
4. **Adicione as variáveis uma por uma ou use o Raw Editor**

### Método Raw Editor (Recomendado):
```
NODE_ENV=production
NEXTAUTH_SECRET=/2Rlko=hH1>(4P^s@Sn&Xqh]JE=pASY1
NEXTAUTH_URL=https://seu-dominio.railway.app
ENCRYPTION_KEY=pS7tpq6+!vkhb;+kA5/Hrg>YZO]T8Xw[
JWT_SECRET=bbtIx#u[hqN[0Gv>9}^&i^el8w_[D2Rx
LGPD_ENCRYPTION_KEY=8b>&K!B{)|Z)-0T:#}Lq}q0MN)3CCor>
NEXT_PUBLIC_APP_URL=https://seu-dominio.railway.app
GMAIL_USER=seu-email@gmail.com
GMAIL_PASS=sua-senha-de-app
```

## Notas Importantes

1. **Substitua os valores de exemplo pelos seus valores reais**
2. **DATABASE_URL será gerada automaticamente pelo Railway PostgreSQL**
3. **NEXTAUTH_URL e NEXT_PUBLIC_APP_URL devem usar o domínio do Railway**
4. **Use "Sealed Variables" para informações sensíveis**
5. **Teste todas as funcionalidades após o deploy**

## Próximos Passos

1. Configurar PostgreSQL no Railway
2. Adicionar as variáveis de ambiente
3. Fazer o deploy
4. Testar todas as funcionalidades