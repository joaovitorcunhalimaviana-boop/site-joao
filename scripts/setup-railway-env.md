# 🚀 Configuração de Variáveis de Ambiente no Railway

## 📋 Problema Identificado
Os sistemas de email e Telegram funcionam localmente mas não no Railway porque as variáveis de ambiente não estão configuradas na plataforma.

## 🔧 Variáveis Necessárias no Railway

### 📧 Configurações de Email (CRÍTICAS)
```
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=joaovitorvianacoloprocto@gmail.com
EMAIL_PASSWORD=qsalbowsyqphsexr
EMAIL_FROM=Dr. João Vitor Viana <joaovitorvianacoloprocto@gmail.com>
DOCTOR_EMAIL=joaovitorvianacoloprocto@gmail.com
```

### 📱 Configurações de Telegram (CRÍTICAS)
```
TELEGRAM_BOT_TOKEN=8380812457:AAFsjqlvgQr4XAP7C39t5eqFq6eWbrR90T4
TELEGRAM_CHAT_ID=8432481593
```

### 📞 Configurações de WhatsApp
```
DOCTOR_WHATSAPP=83991221599
```

### 🌐 Configurações de Ambiente
```
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://site-joao-production.up.railway.app
```

## 📝 Passo a Passo para Configurar

### 1. Acessar o Railway
- URL: https://railway.app/project/55e5b00b-05de-4241-baa3-437a2c5c630b
- Fazer login na conta

### 2. Navegar para Variables
- Clicar no serviço do projeto
- Ir na aba "Variables"

### 3. Adicionar Cada Variável
Para cada variável listada acima:
- Clicar em "New Variable"
- Inserir o nome da variável (ex: `EMAIL_HOST`)
- Inserir o valor correspondente
- Clicar em "Add"

### 4. Verificar Configuração
Após adicionar todas as variáveis, o Railway fará redeploy automático.

## ⚠️ Variáveis Críticas (SEM ELAS O SISTEMA NÃO FUNCIONA)

### Email:
- `EMAIL_HOST` - Servidor SMTP
- `EMAIL_PORT` - Porta SMTP
- `EMAIL_USER` - Usuário do email
- `EMAIL_PASSWORD` - Senha de app do Gmail
- `EMAIL_FROM` - Remetente dos emails

### Telegram:
- `TELEGRAM_BOT_TOKEN` - Token do bot
- `TELEGRAM_CHAT_ID` - ID do chat para receber notificações

## 🧪 Como Testar Após Configuração

### 1. Testar Email
```bash
curl -X POST https://site-joao-production.up.railway.app/api/email/test-welcome \
  -H "Content-Type: application/json" \
  -d '{"name": "Teste", "email": "seu-email@gmail.com"}'
```

### 2. Testar Telegram
Fazer um agendamento no site e verificar se a notificação chega no Telegram.

## 🔍 Diagnóstico de Problemas

Se ainda não funcionar após configurar:

1. **Verificar logs do Railway:**
   - Ir em "Deployments"
   - Clicar no último deploy
   - Verificar logs de erro

2. **Testar variáveis:**
   - Adicionar endpoint de teste temporário
   - Verificar se as variáveis estão sendo lidas

3. **Verificar conectividade:**
   - Gmail: Confirmar que a senha de app está correta
   - Telegram: Testar se o bot está ativo

## 📞 Contatos para Suporte
- Railway: https://railway.app/help
- Gmail: Verificar configurações de segurança
- Telegram: @BotFather para problemas com bot

---

**⚡ IMPORTANTE:** Após configurar todas as variáveis, aguarde alguns minutos para o redeploy automático do Railway completar.