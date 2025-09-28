# 🔧 Troubleshooting Gmail SMTP - Guia Completo

## 🚨 Problema Identificado
O Gmail SMTP está falhando tanto no ambiente local quanto em produção. Todos os testes mostram "FAILED" para o provedor Gmail.

## 📊 Status Atual
- **Local**: Gmail configurado mas não conecta ❌
- **Produção**: Gmail configurado mas não conecta ❌
- **Outros provedores**: Não configurados

## 🔍 Possíveis Causas

### 1. **Senha de App Inválida ou Expirada**
- A senha de app pode ter expirado
- Pode ter sido digitada incorretamente
- Google pode ter revogado automaticamente

### 2. **Configurações de Segurança do Google**
- 2FA pode estar desabilitado
- "Acesso de apps menos seguros" pode estar bloqueado
- Conta pode ter proteção avançada ativada

### 3. **Mudanças Recentes do Google (2024)**
- Google está desabilitando apps menos seguros desde setembro 2024
- Algumas configurações SMTP podem ter sido alteradas

## 🛠️ Soluções Passo a Passo

### **Solução 1: Regenerar Senha de App**

1. **Acesse**: https://myaccount.google.com/security
2. **Verifique 2FA**: Certifique-se que está ativo
3. **Vá em "Senhas de app"**
4. **Delete a senha atual** (se existir)
5. **Gere nova senha**:
   - Selecione "Outro (nome personalizado)"
   - Digite: "Sistema Médico Dr João"
   - Copie a senha de 16 caracteres

### **Solução 2: Verificar Configurações da Conta**

1. **2-Step Verification**: DEVE estar ativo
2. **Advanced Protection**: Se ativo, desative temporariamente
3. **Account Type**: Contas corporativas podem ter restrições

### **Solução 3: Testar Configurações SMTP**

Teste estas configurações na ordem:

```env
# Configuração 1 (Recomendada)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=joaovitorvianacoloprocto@gmail.com
EMAIL_PASSWORD=[NOVA_SENHA_APP_16_DIGITOS]
```

```env
# Configuração 2 (Alternativa SSL)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=465
EMAIL_USER=joaovitorvianacoloprocto@gmail.com
EMAIL_PASSWORD=[NOVA_SENHA_APP_16_DIGITOS]
```

### **Solução 4: Configurar Provedor Alternativo (RECOMENDADO)**

Como o Gmail está instável, configure um provedor mais confiável:

#### **Postmark (Gratuito até 100 emails/mês)**
1. Cadastre-se: https://postmarkapp.com/
2. Crie um servidor
3. Copie o Server Token
4. Configure:
```env
POSTMARK_SERVER_TOKEN=seu_token_aqui
```

#### **SendGrid (Gratuito até 100 emails/dia)**
1. Cadastre-se: https://sendgrid.com/
2. Crie uma API Key
3. Configure:
```env
SENDGRID_API_KEY=sua_api_key_aqui
```

## 🧪 Como Testar

### **1. Teste Local**
```bash
# Reinicie o servidor
npm run dev

# Teste o endpoint
curl -X POST http://localhost:3000/api/test-email-providers \
  -H "Content-Type: application/json" \
  -d '{"testEmail":"joaovitorvianacoloprocto@gmail.com"}'
```

### **2. Teste em Produção**
```bash
curl -X POST https://joaovitorviana.com.br/api/test-email-providers \
  -H "Content-Type: application/json" \
  -d '{"testEmail":"joaovitorvianacoloprocto@gmail.com"}'
```

## 🎯 Recomendação Final

**Para resolver IMEDIATAMENTE:**

1. **Configure Postmark** (mais confiável que Gmail)
2. **Mantenha Gmail como backup**
3. **Teste ambos os provedores**

**Vantagens do Postmark:**
- ✅ Mais confiável que Gmail SMTP
- ✅ Melhor deliverability
- ✅ Não tem problemas de autenticação
- ✅ Funciona perfeitamente no Railway
- ✅ 100 emails gratuitos por mês

## 📞 Próximos Passos

1. **Regenerar senha de app do Gmail**
2. **Configurar Postmark como provedor principal**
3. **Testar ambos os provedores**
4. **Atualizar configurações no Railway**

---

**🚀 Quer que eu configure o Postmark agora? É mais rápido e confiável que corrigir o Gmail!**