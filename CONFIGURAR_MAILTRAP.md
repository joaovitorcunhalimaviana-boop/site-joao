# 📧 Configuração do Mailtrap para Railway

## 🎯 **O que é o Mailtrap?**

O Mailtrap é um serviço de email transacional que oferece:
- **3.500 emails grátis por mês**
- **Alta deliverabilidade**
- **Fácil configuração**
- **Ideal para emails automáticos**

---

## ⚙️ **Configuração no Railway:**

### 1. **Criar conta no Mailtrap:**
1. Acesse: https://mailtrap.io/
2. Crie uma conta gratuita
3. Vá para "Email API" → "SMTP"
4. Copie suas credenciais

### 2. **Configurar variáveis no Railway:**

No painel do Railway, adicione estas variáveis de ambiente:

```env
MAILTRAP_API_TOKEN=seu_token_aqui
MAILTRAP_INBOX_ID=seu_inbox_id_aqui
```

### 3. **Exemplo de configuração:**

```env
# Mailtrap - Principal (3500 emails grátis/mês)
MAILTRAP_API_TOKEN=abcd1234567890
MAILTRAP_INBOX_ID=1234567
```

---

## 🧪 **Testar configuração:**

Após configurar no Railway, teste com:

```bash
# Testar todos os provedores
curl https://seu-site.railway.app/api/test-email-providers

# Enviar email de teste
curl -X POST https://seu-site.railway.app/api/test-email-providers \
  -H "Content-Type: application/json" \
  -d '{"testEmail": "seu-email@gmail.com"}'
```

---

## ✅ **Benefícios do Mailtrap:**

- ✅ **3.500 emails grátis/mês**
- ✅ **99% de deliverabilidade**
- ✅ **Configuração simples**
- ✅ **Ideal para boas-vindas e aniversários**
- ✅ **Backup automático para Gmail**

---

## 🔄 **Sistema de Fallback:**

1. **Mailtrap** (Principal - 3500 emails/mês)
2. **Postmark** (Backup)
3. **Mailgun** (Backup)
4. **SendGrid** (Backup)
5. **Gmail** (Último recurso)

---

## 📋 **Próximos passos:**

1. Configure as variáveis no Railway
2. Faça deploy das mudanças
3. Teste o sistema
4. Configure emails automáticos de boas-vindas
5. Configure emails automáticos de aniversário