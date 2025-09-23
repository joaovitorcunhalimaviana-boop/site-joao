# 🤖 Configuração do Telegram Bot - SOLUÇÃO RECOMENDADA

**Esta é a melhor alternativa para receber notificações instantâneas e confiáveis!**

## 📱 Por que usar Telegram?
- ✅ **Notificação instantânea** no celular
- ✅ **100% gratuito** e confiável
- ✅ **Funciona em qualquer lugar** do mundo
- ✅ **Não depende de email** ou configurações complexas
- ✅ **Link direto do WhatsApp** incluído na mensagem

---

## 🚀 Configuração Passo-a-Passo (5 minutos)

### **PASSO 1: Criar o Bot**
1. Abra o **Telegram** no seu celular
2. Procure por: `@BotFather`
3. Clique em **INICIAR**
4. Digite: `/newbot`
5. Escolha um **nome** para seu bot:
   ```
   Consultas Dr João Vítor
   ```
6. Escolha um **username** (deve terminar com "bot"):
   ```
   consultasdrjoao_bot
   ```
7. **COPIE O TOKEN** que aparecerá (algo como: `123456789:ABCdefGHIjklMNOpqrsTUVwxyz`)

### **PASSO 2: Obter seu Chat ID**
1. **Envie qualquer mensagem** para seu bot (ex: "oi")
2. No **navegador do computador**, acesse:
   ```
   https://api.telegram.org/bot<SEU_TOKEN>/getUpdates
   ```
   *(Substitua `<SEU_TOKEN>` pelo token do passo 1)*

3. **Procure** por algo como:
   ```json
   "chat":{"id":123456789,
   ```
4. **COPIE O NÚMERO** (seu Chat ID)

### **PASSO 3: Configurar no Sistema**
1. Abra o arquivo `.env.local`
2. **Preencha** as linhas:
   ```env
   TELEGRAM_BOT_TOKEN=seu_token_aqui
   TELEGRAM_CHAT_ID=seu_chat_id_aqui
   ```

### **PASSO 4: Reiniciar e Testar**
1. **Pare** o servidor (Ctrl+C)
2. **Inicie** novamente: `npm run dev`
3. **Teste** fazendo um agendamento
4. **Verifique** se recebeu a mensagem no Telegram!

---

## 📋 Exemplo de Configuração

**Arquivo `.env.local`:**
```env
TELEGRAM_BOT_TOKEN=123456789:ABCdefGHIjklMNOpqrsTUVwxyz
TELEGRAM_CHAT_ID=987654321
```

---

## 📱 Como será a notificação

Você receberá mensagens assim:

```
🩺 NOVA CONSULTA AGENDADA

👤 Paciente: Maria Silva
📧 Email: maria@email.com
📞 Telefone: (83) 99999-9999
📱 WhatsApp: (83) 91234-5678
🏥 Plano: Unimed
📅 Data: 15/01/2024
⏰ Horário: 14:00

🔗 Clique aqui para WhatsApp
```

---

## 🔧 Solução de Problemas

**❌ Não recebo mensagens:**
- Verifique se enviou uma mensagem para o bot primeiro
- Confirme se o TOKEN e CHAT_ID estão corretos
- Reinicie o servidor após configurar

**❌ Erro "chat not found":**
- Você precisa enviar uma mensagem para o bot antes
- Verifique se o CHAT_ID está correto

**❌ Erro "unauthorized":**
- Verifique se o TOKEN está correto
- Não inclua espaços ou caracteres extras

---

## ✅ Vantagens desta Solução

1. **Instantâneo**: Recebe na hora
2. **Confiável**: Telegram tem 99.9% de uptime
3. **Móvel**: Notificação no celular
4. **Gratuito**: Sem custos
5. **Simples**: Configuração em 5 minutos
6. **Global**: Funciona em qualquer país

**🎯 Esta é a solução mais eficiente para seu consultório!**