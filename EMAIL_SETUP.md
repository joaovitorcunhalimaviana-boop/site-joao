# 📧 Configuração de Email Gratuito - Gmail

## 🎯 **Solução 100% Gratuita para Notificações**

Este guia mostra como configurar notificações automáticas por email usando sua conta Gmail **gratuitamente**.

## 📋 **Pré-requisitos**

- ✅ Conta Gmail ativa
- ✅ Acesso às configurações de segurança do Google
- ✅ 5 minutos para configuração

## 🔧 **Passo a Passo**

### **1. Ativar Verificação em 2 Etapas**

1. Acesse: https://myaccount.google.com/security
2. Clique em **"Verificação em duas etapas"**
3. Siga as instruções para ativar (obrigatório para App Passwords)

### **2. Gerar App Password**

1. Ainda em https://myaccount.google.com/security
2. Clique em **"Senhas de app"** (aparece após ativar 2FA)
3. Selecione **"Outro (nome personalizado)"**
4. Digite: **"Sistema Agendamento"**
5. Clique **"Gerar"**
6. **COPIE a senha de 16 caracteres** (ex: `abcd efgh ijkl mnop`)

### **3. Configurar Variáveis de Ambiente**

Edite o arquivo `.env.local`:

```env
# Configurações de Email (Gratuito)
EMAIL_USER=seu.email@gmail.com
EMAIL_PASSWORD=abcd efgh ijkl mnop
DOCTOR_EMAIL=seu.email@gmail.com
```

**⚠️ Importante:**

- Use a **App Password** (16 caracteres), não sua senha normal
- `EMAIL_USER` = seu email Gmail
- `DOCTOR_EMAIL` = email onde quer receber as notificações (pode ser o mesmo)

### **4. Exemplo de Configuração**

```env
# Configurações de Email
EMAIL_USER=drjoao@gmail.com
EMAIL_PASSWORD=abcd efgh ijkl mnop
DOCTOR_EMAIL=drjoao@gmail.com

# Configurações WhatsApp
DOCTOR_WHATSAPP=83991221599
DOCTOR_NAME="Dr. João Vítor Viana"
DOCTOR_SPECIALTY="Coloproctologista"
```

## 📱 **Como Funciona**

Quando um paciente agenda:

1. **📧 Email automático** é enviado instantaneamente
2. **📱 Link WhatsApp** é gerado no console
3. **🔔 Notificação** aparece no seu email/celular
4. **📋 Histórico** fica salvo no Gmail

## 📧 **Formato do Email**

```
Assunto: 🏥 Nova Consulta: João Silva - 15/01/2024 às 14:00

🏥 NOVA CONSULTA AGENDADA
Dr. João Vítor Viana - Coloproctologista

👤 Paciente: João Silva
📅 Data: 15/01/2024
🕐 Horário: 14:00
📧 Email: joao@email.com
📱 WhatsApp: (83) 99122-1599
💳 Plano: Unimed

[📱 Confirmar via WhatsApp] <- Botão clicável

✅ Agendamento confirmado automaticamente pelo sistema online.
```

## 🔔 **Configurar Notificações no Celular**

### **iPhone:**

1. App **Mail** > Configurações
2. Ative **"Buscar Novos Dados"**
3. Configure para **"Push"** ou **"A cada 15 min"**

### **Android:**

1. App **Gmail** > Configurações
2. Selecione sua conta
3. Ative **"Notificações"**
4. Configure **"Som"** personalizado

## 🎯 **Vantagens desta Solução**

✅ **100% Gratuita** - Sem custos mensais
✅ **Instantânea** - Email chega em segundos
✅ **Confiável** - Gmail tem 99.9% uptime
✅ **Histórico** - Todos os agendamentos ficam salvos
✅ **Mobile** - Recebe no celular também
✅ **Botão WhatsApp** - Link direto no email
✅ **Automática** - Não precisa monitorar terminal

## 🔍 **Testando a Configuração**

1. **Reinicie o servidor:**

   ```bash
   npm run dev
   ```

2. **Faça um agendamento teste:**
   - Acesse: http://localhost:3000/agendamento
   - Complete o formulário
   - Confirme o agendamento

3. **Verifique:**
   - ✅ Console mostra: "📧 Email enviado"
   - ✅ Email chegou na sua caixa de entrada
   - ✅ Link WhatsApp funciona

## 🛠️ **Troubleshooting**

### **❌ "Erro ao enviar email"**

- Verifique se a App Password está correta
- Confirme se a verificação em 2 etapas está ativa
- Teste com outro email Gmail

### **❌ "Email não chegou"**

- Verifique a pasta **Spam/Lixo Eletrônico**
- Confirme se `DOCTOR_EMAIL` está correto
- Teste enviando para outro email

### **❌ "Credenciais inválidas"**

- Use a **App Password**, não a senha normal
- Remova espaços da App Password
- Gere uma nova App Password

## 🚀 **Próximos Passos**

1. **Configure as variáveis** no `.env.local`
2. **Reinicie o servidor**
3. **Teste com um agendamento**
4. **Configure notificações no celular**
5. **Aproveite o sistema automático!**

---

**🎉 Pronto! Agora você tem um sistema de notificações 100% gratuito e automático!**

**💡 Dica:** Crie uma regra no Gmail para marcar emails de agendamento como "Importante" automaticamente.
