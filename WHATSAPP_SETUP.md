# 📱 Configuração do Sistema de Notificações WhatsApp

Este sistema envia automaticamente uma notificação via WhatsApp para o médico sempre que um paciente agenda uma consulta.

## 🔧 Configuração Básica

### 1. Configurar Variáveis de Ambiente

Edite o arquivo `.env.local` na raiz do projeto:

```env
# Seu número de WhatsApp (apenas números, com DDD)
DOCTOR_WHATSAPP=11999999999

# Informações do médico
DOCTOR_NAME="Dr. João Vítor Viana"
DOCTOR_SPECIALTY="Coloproctologista"
```

### 2. Como Funciona

Quando um paciente confirma um agendamento:
1. ✅ Os dados são validados
2. 📱 Uma notificação é enviada automaticamente
3. 📋 A mensagem inclui: nome, email, WhatsApp, data, horário e tipo de plano
4. 🔗 Um link direto para WhatsApp é gerado (visível no console)

### 3. Formato da Mensagem

```
🏥 NOVA CONSULTA AGENDADA

👤 Paciente: João Silva
📅 Data: segunda-feira, 15 de janeiro de 2024
🕐 Horário: 14:00
📧 Email: joao@email.com
📱 WhatsApp: (11) 99999-9999
💳 Plano: Unimed

✅ Agendamento confirmado pelo sistema online.
```

## 🚀 Opções de Integração

### Opção 1: Manual (Atual)
- As notificações aparecem no console do servidor
- Um link direto para WhatsApp é gerado
- Você pode clicar no link para enviar manualmente

### Opção 2: Twilio WhatsApp API

Para envio automático via Twilio:

1. Crie uma conta no [Twilio](https://www.twilio.com/)
2. Configure o WhatsApp Business API
3. Adicione as credenciais no `.env.local`:

```env
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886
```

4. Descomente o código do Twilio em `/app/api/notify-whatsapp/route.ts`

### Opção 3: WhatsApp Business API

- Integração direta com a API oficial do WhatsApp
- Requer aprovação do Facebook/Meta
- Ideal para alto volume de mensagens

### Opção 4: Baileys (Não Oficial)

- Biblioteca Node.js para WhatsApp Web
- Não requer aprovação, mas pode ser instável
- Boa para uso pessoal/pequenos consultórios

## 🔍 Monitoramento

### Logs do Sistema

Todas as notificações são registradas no console:

```
📱 Nova consulta agendada - Enviando notificação:
Mensagem: [conteúdo da mensagem]
WhatsApp do médico: 11999999999
🔗 Link direto WhatsApp: https://wa.me/5511999999999?text=...
```

### Verificar Funcionamento

1. Acesse: `http://localhost:3001/agendamento`
2. Complete um agendamento de teste
3. Verifique o console do servidor
4. Procure pelas mensagens de log

## 🛡️ Segurança

- ✅ Arquivo `.env.local` está no `.gitignore`
- ✅ Credenciais não são expostas no frontend
- ✅ Validação de dados antes do envio
- ✅ Tratamento de erros (agendamento continua mesmo se notificação falhar)

## 🔧 Troubleshooting

### Problema: Notificação não está sendo enviada

1. Verifique se o arquivo `.env.local` existe
2. Confirme se `DOCTOR_WHATSAPP` está configurado
3. Verifique o console do servidor para erros
4. Teste a API diretamente: `POST /api/notify-whatsapp`

### Problema: Formato de número incorreto

- Use apenas números: `11999999999`
- Inclua o DDD: `11` para São Paulo
- Não use parênteses, espaços ou hífens

### Problema: Link do WhatsApp não funciona

- Verifique se o WhatsApp está instalado
- Teste o link em diferentes navegadores
- Confirme se o número está correto

## 📞 Suporte

Para dúvidas sobre a implementação:
1. Verifique os logs do console
2. Teste com dados de exemplo
3. Consulte a documentação da API escolhida (Twilio, etc.)

---

**Nota:** Este sistema está configurado para desenvolvimento. Para produção, recomenda-se usar uma solução robusta como Twilio ou WhatsApp Business API.