# 🚀 Configuração do Twilio para WhatsApp Automático

## 📋 Pré-requisitos

1. **Conta no Twilio**: Crie uma conta gratuita em [twilio.com](https://www.twilio.com)
2. **Número do WhatsApp**: Seu número deve estar verificado no Twilio
3. **Sandbox do WhatsApp**: Para testes (gratuito)

## 🔧 Passo a Passo

### 1. Criar Conta no Twilio

1. Acesse [console.twilio.com](https://console.twilio.com)
2. Crie sua conta gratuita
3. Verifique seu número de telefone
4. Anote suas credenciais:
   - **Account SID**
   - **Auth Token**

### 2. Configurar WhatsApp Sandbox

1. No console do Twilio, vá em **Messaging** → **Try it out** → **Send a WhatsApp message**
2. Siga as instruções para conectar seu WhatsApp ao sandbox
3. Envie a mensagem de ativação para o número do Twilio
4. Anote o **Sandbox Number** (formato: `whatsapp:+14155238886`)

### 3. Configurar Variáveis de Ambiente

Edite o arquivo `.env.local` e adicione:

```env
# Configurações do Twilio
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886

# Seu número (apenas números, com DDD)
DOCTOR_WHATSAPP=83991221599
```

### 4. Testar a Configuração

1. Reinicie o servidor: `npm run dev`
2. Faça um agendamento de teste
3. Verifique o console para mensagens de sucesso
4. Você deve receber a mensagem no seu WhatsApp!

## 💰 Custos

- **Sandbox**: Gratuito (limitado)
- **Produção**: ~$0.005 por mensagem
- **Conta gratuita**: $15 de crédito inicial

## 🔍 Troubleshooting

### Erro: "Credenciais do Twilio não configuradas"

- Verifique se todas as variáveis estão no `.env.local`
- Reinicie o servidor após adicionar as variáveis

### Erro: "Número não autorizado"

- Certifique-se de que seu número está no sandbox
- Envie a mensagem de ativação novamente

### Mensagem não chega

- Verifique se o número está correto (apenas números)
- Confirme que o WhatsApp está conectado ao sandbox
- Verifique os logs do Twilio no console

## 🎯 Próximos Passos

### Para Produção:

1. **Upgrade da conta**: Adicione cartão de crédito
2. **WhatsApp Business**: Configure número próprio
3. **Templates**: Crie templates aprovados pelo WhatsApp

### Alternativas:

- **WhatsApp Business API**: Para grandes volumes
- **Baileys**: Biblioteca não oficial (mais complexa)
- **Zapier/Make**: Automação no-code

## 📞 Suporte

Se precisar de ajuda:

1. Documentação oficial: [twilio.com/docs/whatsapp](https://www.twilio.com/docs/whatsapp)
2. Console do Twilio: Logs detalhados de todas as mensagens
3. Suporte Twilio: Chat disponível no console

---

**✅ Com essa configuração, você receberá notificações automáticas no WhatsApp sempre que houver um novo agendamento!**
