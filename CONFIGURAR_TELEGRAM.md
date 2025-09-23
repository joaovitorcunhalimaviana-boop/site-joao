# ⚡ CONFIGURAÇÃO RÁPIDA - TELEGRAM

## 🎯 SOLUÇÃO DEFINITIVA PARA NOTIFICAÇÕES

**Siga estes passos e tenha notificações instantâneas no celular:**

---

## 📱 PASSO 1: Criar Bot (2 minutos)

1. **Abra o Telegram**
2. **Procure:** `@BotFather`
3. **Digite:** `/newbot`
4. **Nome do bot:** `Consultas Dr João Vítor`
5. **Username:** `consultasdrjoao_bot`
6. **COPIE O TOKEN** (guarde bem!)

---

## 🔍 PASSO 2: Pegar Chat ID (1 minuto)

1. **Envie "oi"** para seu bot
2. **Abra no navegador:**
   ```
   https://api.telegram.org/botSEU_TOKEN/getUpdates
   ```
   *(Substitua SEU_TOKEN)*

3. **Procure:** `"chat":{"id":123456789`
4. **COPIE O NÚMERO** (seu Chat ID)

---

## ⚙️ PASSO 3: Configurar Sistema (1 minuto)

**Edite o arquivo `.env.local`:**

```env
TELEGRAM_BOT_TOKEN=cole_seu_token_aqui
TELEGRAM_CHAT_ID=cole_seu_chat_id_aqui
```

---

## 🚀 PASSO 4: Testar (1 minuto)

1. **Pare o servidor:** `Ctrl+C`
2. **Inicie:** `npm run dev`
3. **Teste:** Faça um agendamento
4. **Verifique:** Telegram no celular!

---

## ✅ PRONTO!

**Agora você receberá:**
- 📱 Notificação instantânea no celular
- 👤 Dados completos do paciente
- 🔗 Link direto para WhatsApp
- 📅 Data e horário da consulta

---

## 🆘 PROBLEMAS?

**Não funciona?**
- Verifique se enviou mensagem para o bot primeiro
- Confirme TOKEN e CHAT_ID corretos
- Reinicie o servidor após configurar

**Dúvidas?**
- Veja o arquivo `TELEGRAM_WEBHOOK.md` para detalhes completos

---

**🎉 Esta é a solução mais confiável e rápida!**