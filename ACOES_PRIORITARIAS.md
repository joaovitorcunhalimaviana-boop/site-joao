# 🚀 AÇÕES PRIORITÁRIAS - GUIA RÁPIDO

**Análise completa realizada em: 08/10/2025**

---

## 📋 RESUMO EXECUTIVO

✅ **Correções Aplicadas Automaticamente:**
- Encoding UTF-8 corrigido em `lib/unified-patient-system.ts`
- Verificação de configuração do Next.js (está correta)

⚠️ **Problemas Identificados que Requerem Decisão do Desenvolvedor:**
- Sistema híbrido JSON + PostgreSQL
- Duplicação de modelos no Prisma
- Credenciais não configuradas (.env)
- Sistema de email não funcional

📊 **Estatísticas do Projeto:**
- 69 rotas de API identificadas
- 3 sistemas de pacientes em paralelo
- 2 sistemas de armazenamento (JSON + PostgreSQL)
- Modelos duplicados: 5 (Patient/Paciente, User/Usuario, etc.)

---

## 🔴 CRÍTICO - FAZER AGORA (30 minutos)

### 1. Gerar Chaves de Segurança Fortes

**Problema:** JWT secrets usam valores de exemplo inseguros

**Solução:**
```bash
# Execute estes comandos no terminal:
node -e "console.log('JWT_SECRET=' + require('crypto').randomBytes(32).toString('base64'))"
node -e "console.log('JWT_REFRESH_SECRET=' + require('crypto').randomBytes(32).toString('base64'))"
node -e "console.log('ENCRYPTION_KEY_V1=' + require('crypto').randomBytes(32).toString('hex'))"
node -e "console.log('ENCRYPTION_KEY_V2=' + require('crypto').randomBytes(32).toString('hex'))"
```

**Atualize o `.env` com os valores gerados.**

---

### 2. Configurar Telegram (Notificações Funcionam)

**O sistema já está implementado**, só precisa configurar:

#### Passo 1: Criar Bot do Telegram
```
1. Abra o Telegram
2. Busque por @BotFather
3. Envie: /newbot
4. Escolha um nome: "Dr João Vitor Viana Bot"
5. Escolha um username: "drjoaovitorbot" (ou similar)
6. Copie o TOKEN fornecido
```

#### Passo 2: Obter Chat ID
```
1. Adicione o bot criado aos seus contatos
2. Envie qualquer mensagem para o bot
3. Acesse: https://api.telegram.org/bot<SEU_TOKEN>/getUpdates
4. Procure por "chat":{"id":123456789}
5. Copie o ID numérico
```

#### Passo 3: Atualizar .env
```env
TELEGRAM_BOT_TOKEN="1234567890:ABCdefGHIjklMNOpqrsTUVwxyz"
TELEGRAM_CHAT_ID="123456789"
```

**Pronto!** Notificações de agendamento funcionarão automaticamente.

---

### 3. Testar Sistema Básico

```bash
# 1. Instalar dependências
npm install

# 2. Gerar Prisma Client
npm run db:generate

# 3. Executar migrations
npm run db:migrate:deploy

# 4. Iniciar servidor
npm run dev

# 5. Acessar em: http://localhost:3000
```

**Teste o fluxo:**
1. Área pública → Fazer agendamento
2. Verificar se notificação Telegram chegou
3. Login médico → Ver agendamentos
4. Criar consulta/atendimento
5. Registrar prontuário

---

## 🟡 IMPORTANTE - FAZER ESTA SEMANA

### 4. Decidir sobre Arquitetura de Dados (2-3 horas)

**Problema:** Projeto usa 2 sistemas de armazenamento simultaneamente

**Opção A: Migrar Tudo para PostgreSQL (Recomendado)**

✅ **Vantagens:**
- Performance melhor
- Backup automático
- Queries relacionais
- Escalável

❌ **Desvantagens:**
- Requer migração de dados JSON existentes
- Mais complexo para deploy

**Como fazer:**
```bash
# 1. Verificar dados existentes em JSON
ls -la data/unified-system/

# 2. Executar migration (já existe código)
# Acesse: http://localhost:3000/api/unified-system/migrate
# Isso migra todos os dados JSON para PostgreSQL

# 3. Mover JSONs para pasta de backup
mkdir -p backups/json-legacy
mv data/unified-system/*.json backups/json-legacy/

# 4. Atualizar código para usar APENAS Prisma
# (remover funções loadFromStorage/saveToStorage)
```

**Opção B: Manter Sistema Híbrido (Não Recomendado)**

Se escolher manter ambos, documente claramente qual sistema usa cada rota.

---

### 5. Resolver Duplicação de Modelos Prisma (1-2 horas)

**Problema:** Schema tem modelos duplicados em Inglês e Português

**Decisão Necessária:** Escolher UM padrão

#### Opção A: Manter Inglês (Padrão Internacional)
```prisma
// Usar:
model Patient { ... }
model User { ... }
model Appointment { ... }

// Remover:
model Paciente { ... }
model Usuario { ... }
```

#### Opção B: Manter Português (Mais Natural)
```prisma
// Usar:
model Paciente { ... }
model Usuario { ... }
model Consulta { ... }

// Remover:
model Patient { ... }
model User { ... }
```

**Recomendação:** Inglês (melhor para manutenção futura)

**Como fazer:**
```bash
# 1. Editar prisma/schema.prisma
# 2. Remover modelos duplicados
# 3. Criar migration
npx prisma migrate dev --name remove_duplicate_models

# 4. Atualizar código que usa modelos removidos
# Buscar por: Patient, Paciente, etc.
```

---

### 6. Configurar Serviço de Email (1 hora)

**Recomendação:** SendGrid (100 emails/dia grátis)

#### Passo 1: Criar Conta SendGrid
```
1. Acesse: https://sendgrid.com
2. Criar conta grátis
3. Verificar email
4. Criar API Key em Settings > API Keys
```

#### Passo 2: Atualizar .env
```env
EMAIL_SERVICE="sendgrid"
EMAIL_API_KEY="SG.xxxxxxxxxxxxxxxxxxx"
EMAIL_FROM="Dr. João Vitor Viana <noreply@drjoaovitor.com.br>"
EMAIL_REPLY_TO="contato@drjoaovitor.com.br"
```

#### Passo 3: Instalar Dependência
```bash
npm install @sendgrid/mail
```

#### Passo 4: Implementar Envio
Criar arquivo `lib/email-service.ts`:
```typescript
import sgMail from '@sendgrid/mail'

sgMail.setApiKey(process.env.EMAIL_API_KEY!)

export async function sendEmail({
  to,
  subject,
  html
}: {
  to: string
  subject: string
  html: string
}) {
  const msg = {
    to,
    from: process.env.EMAIL_FROM!,
    subject,
    html,
  }

  return sgMail.send(msg)
}
```

---

## 🟢 MELHORIAS - FAZER ESTE MÊS

### 7. Implementar Criptografia LGPD (3-4 horas)

**Campos que precisam ser criptografados:**
- CPF
- RG
- Dados médicos sensíveis
- Anexos médicos

**Biblioteca recomendada:**
```bash
npm install crypto-js
```

**Exemplo de implementação:**
```typescript
import CryptoJS from 'crypto-js'

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY_V1!

export function encrypt(text: string): string {
  return CryptoJS.AES.encrypt(text, ENCRYPTION_KEY).toString()
}

export function decrypt(ciphertext: string): string {
  const bytes = CryptoJS.AES.decrypt(ciphertext, ENCRYPTION_KEY)
  return bytes.toString(CryptoJS.enc.Utf8)
}
```

---

### 8. Aumentar Cobertura de Testes (4-5 horas)

**Áreas críticas sem testes:**
- ❌ APIs de autenticação
- ❌ APIs de agendamento
- ❌ APIs de prontuário
- ❌ Sistema de notificações
- ❌ Criptografia LGPD

**Meta:** 80% de cobertura

**Exemplo de teste:**
```typescript
// __tests__/api/appointments.test.ts
import { POST } from '@/app/api/appointments/route'

describe('POST /api/appointments', () => {
  it('should create appointment with valid data', async () => {
    const request = new Request('http://localhost/api/appointments', {
      method: 'POST',
      body: JSON.stringify({
        communicationContactId: 'test-id',
        appointmentDate: '2025-10-10',
        appointmentTime: '10:00',
        appointmentType: 'consulta',
        source: 'public_appointment'
      })
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
  })
})
```

---

### 9. Configurar WhatsApp Business API (2-3 horas)

**Requer:**
- Conta do WhatsApp Business
- Número de telefone dedicado
- Verificação da Meta (Facebook)

**Alternativa mais simples:** Continuar usando links `wa.me` (já funciona)

---

### 10. Documentação e Diagramas (2-3 horas)

**Criar documentos:**
1. `ARQUITETURA.md` - Diagrama de componentes
2. `DEPLOY_GUIDE.md` - Guia de deploy completo
3. `USER_MANUAL.md` - Manual do usuário
4. `DEVELOPER_GUIDE.md` - Guia para desenvolvedores

---

## 📊 CHECKLIST DE PRODUÇÃO

Antes de colocar em produção, verificar:

### Segurança
- [ ] JWT_SECRET gerado e forte
- [ ] JWT_REFRESH_SECRET gerado e forte
- [ ] Chaves de criptografia LGPD geradas
- [ ] HTTPS habilitado
- [ ] Headers de segurança configurados
- [ ] Rate limiting testado
- [ ] 2FA testado

### Banco de Dados
- [ ] DATABASE_URL configurada (produção)
- [ ] Migrations aplicadas
- [ ] Backup automático testado
- [ ] Índices verificados
- [ ] Criptografia implementada

### Notificações
- [ ] Telegram configurado e testado
- [ ] Email configurado e testado
- [ ] WhatsApp testado (links wa.me)
- [ ] Logs de notificações funcionando

### Funcionalidades
- [ ] Cadastro de paciente (3 áreas) testado
- [ ] Agendamento testado
- [ ] Atendimento/consulta testado
- [ ] Prontuário testado
- [ ] Relatórios funcionando
- [ ] Newsletter funcionando

### Performance
- [ ] Bundle size < 500KB (gzipped)
- [ ] Lighthouse score > 90
- [ ] Tempo de resposta API < 200ms
- [ ] Cache configurado

### Monitoramento
- [ ] Logs configurados
- [ ] Sentry configurado (opcional)
- [ ] Health check funcionando
- [ ] Alertas configurados

---

## 🆘 PROBLEMAS COMUNS

### "Prisma Client não está disponível"
```bash
npm run db:generate
```

### "Erro de conexão com banco de dados"
```bash
# Verificar DATABASE_URL no .env
# Testar conexão:
npx prisma db pull
```

### "Notificação Telegram não chega"
```bash
# Verificar token:
curl https://api.telegram.org/bot<TOKEN>/getMe

# Verificar chat ID:
curl https://api.telegram.org/bot<TOKEN>/getUpdates
```

### "Build falha no Railway"
```bash
# Verificar variáveis de ambiente
# Verificar logs: railway logs
```

---

## 📞 PRÓXIMOS PASSOS

1. **Hoje:** Gerar chaves + configurar Telegram (30 min)
2. **Esta semana:** Decidir arquitetura + resolver duplicação (3-5h)
3. **Este mês:** Implementar melhorias + testes (10-15h)
4. **Próximo mês:** Deploy em produção

---

## 📚 DOCUMENTOS RELACIONADOS

- `RELATORIO_ERROS_CORRIGIDOS.md` - Análise completa de erros
- `CLAUDE.md` - Documentação do projeto para Claude
- `README.md` - Documentação geral
- `DEPLOY_CHECKLIST.md` - Checklist de deploy

---

**Última atualização:** 08/10/2025 por Claude Code
