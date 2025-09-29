# 🚀 Configuração do Mailtrap no Railway

## 📋 **Passo a Passo Completo**

### 1. **Criar Conta no Mailtrap**

1. Acesse: https://mailtrap.io/
2. Clique em **"Sign Up"** e crie uma conta gratuita
3. Confirme seu email
4. Faça login na sua conta

### 2. **Obter Credenciais do Mailtrap**

1. No painel do Mailtrap, vá para **"Email API"**
2. Clique em **"SMTP"** 
3. Selecione **"Transactional Stream"**
4. Copie as seguintes informações:
   - **API Token** (será usado como MAILTRAP_API_TOKEN)
   - **Inbox ID** (será usado como MAILTRAP_INBOX_ID)

### 3. **Configurar no Railway**

#### Método 1: Interface Web (Recomendado)

1. Acesse: https://railway.app/project/55e5b00b-05de-4241-baa3-437a2c5c630b
2. Selecione o serviço correto
3. Clique na aba **"Variables"**
4. Clique em "New Variable" para cada variável:

```env
MAILTRAP_API_TOKEN=seu_token_aqui
MAILTRAP_INBOX_ID=seu_inbox_id_aqui
```

#### Método 2: Raw Editor

1. Na aba "Variables", clique em "RAW Editor"
2. Cole o conteúdo das variáveis:

```env
MAILTRAP_API_TOKEN=seu_token_aqui
MAILTRAP_INBOX_ID=seu_inbox_id_aqui
```

#### Método 3: CLI do Railway

```bash
# Instalar CLI do Railway
npm install -g @railway/cli

# Fazer login
railway login

# Conectar ao projeto
railway link

# Adicionar variáveis
railway variables set MAILTRAP_API_TOKEN=seu_token_aqui
railway variables set MAILTRAP_INBOX_ID=seu_inbox_id_aqui
```

### 4. **Deploy das Alterações**

1. **Automático**: As variáveis são aplicadas automaticamente no próximo deploy
2. **Manual**: Force um novo deploy se necessário:
   - Clique em "Deploy" no painel do Railway
   - Ou use `railway up` via CLI

### 5. **Exemplo de Configuração**

```env
# Exemplo (substitua pelos seus valores reais)
MAILTRAP_API_TOKEN=a1b2c3d4e5f6g7h8i9j0
MAILTRAP_INBOX_ID=1234567
```

### 6. **Segurança - Variáveis Seladas**

Para maior segurança, considere "selar" as variáveis sensíveis:

1. Clique nos 3 pontos ao lado da variável
2. Selecione "Seal"
3. A variável ficará oculta na interface

**Nota**: Variáveis seladas não podem ser "desseladas" posteriormente.

---

## ✅ **Verificar Configuração**

Após configurar no Railway, teste se está funcionando:

### Método 1: Via API
```bash
curl -X POST https://joaovitorviana.com.br/api/send-welcome-email \
  -H "Content-Type: application/json" \
  -d '{"name":"Teste","email":"teste@example.com","phone":"11999999999"}'
```

### Método 2: Via Site
1. Acesse: https://joaovitorviana.com.br/newsletter
2. Cadastre um email de teste
3. Verifique se o email de boas-vindas foi enviado

---

## 🎯 **Benefícios do Mailtrap**

- ✅ **3.500 emails grátis por mês**
- ✅ **Alta deliverabilidade**
- ✅ **Fácil configuração**
- ✅ **Ideal para emails automáticos**
- ✅ **Relatórios detalhados**
- ✅ **Suporte a templates**

---

## 🔧 **Troubleshooting**

### Problema: "Mailtrap não configurado"
**Solução:** Verifique se as variáveis estão corretas no Railway

### Problema: "Emails não chegam"
**Solução:** 
1. Verifique se o token está correto
2. Confirme se o Inbox ID está correto
3. Verifique os logs no Railway

### Problema: "Token inválido"
**Solução:**
1. Gere um novo token no Mailtrap
2. Atualize a variável no Railway
3. Faça um novo deploy

---

## 📊 **Monitoramento**

Após configurar, você pode monitorar:
- **Emails enviados** no painel do Mailtrap
- **Taxa de entrega** e **bounces**
- **Logs de erro** no Railway
- **Estatísticas** via API do site

---

## 🚀 **Próximos Passos**

1. ✅ Configurar variáveis no Railway
2. ✅ Testar envio de emails
3. ✅ Verificar logs de funcionamento
4. ✅ Monitorar deliverabilidade
5. ✅ Configurar alertas (opcional)

---

**💡 Dica:** O Mailtrap oferece 3.500 emails gratuitos por mês, ideal para o volume do site médico!