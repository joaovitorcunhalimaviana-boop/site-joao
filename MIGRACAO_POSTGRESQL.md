# 🔄 Guia de Migração para PostgreSQL

## ⚠️ URGENTE: Proteção de Dados em Produção

Atualmente o sistema usa **SQLite** (arquivo local `prisma/database.db`). Em ambientes de produção como Vercel e Railway, esse arquivo é **efêmero** e será **perdido a cada deploy**.

**DADOS MÉDICOS NÃO PODEM SER PERDIDOS!** Esta migração é **OBRIGATÓRIA** antes de colocar em produção.

---

## 📋 Por que Migrar?

### SQLite (Atual) ❌
- ✅ Bom para desenvolvimento local
- ❌ Arquivo local perdido em deploys
- ❌ Não suporta múltiplos acessos simultâneos
- ❌ Não adequado para produção
- ❌ **RISCO DE PERDA DE DADOS MÉDICOS**

### PostgreSQL (Recomendado) ✅
- ✅ Banco de dados persistente
- ✅ Dados salvos externamente (não perdem em deploys)
- ✅ Suporta múltiplos usuários simultâneos
- ✅ Backup automatizado
- ✅ Padrão da indústria para sistemas médicos
- ✅ **DADOS SEMPRE PROTEGIDOS**

---

## 🚀 Passo a Passo da Migração

### Opção 1: Railway (RECOMENDADO - Mais Fácil)

#### 1. Criar Conta no Railway
```bash
# Acesse: https://railway.app
# Crie uma conta gratuita (US$ 5/mês de crédito grátis)
```

#### 2. Criar Banco PostgreSQL no Railway

1. No dashboard do Railway, clique em **"New Project"**
2. Selecione **"Provision PostgreSQL"**
3. Aguarde a criação (1-2 minutos)
4. Clique no banco criado
5. Vá na aba **"Variables"**
6. Copie a URL completa que começa com `postgresql://`

Exemplo da URL:
```
postgresql://postgres:senha123@containers-us-west-xxx.railway.app:5432/railway
```

#### 3. Configurar Variáveis de Ambiente

Crie ou edite o arquivo `.env` na raiz do projeto:

```env
# IMPORTANTE: Use a URL do PostgreSQL do Railway
DATABASE_URL="postgresql://postgres:senha@containers-us-west-xxx.railway.app:5432/railway"

# Resto das variáveis (copie do .env.example)
JWT_SECRET="seu-jwt-secret-aqui"
TELEGRAM_BOT_TOKEN="seu-telegram-bot-token"
TELEGRAM_CHAT_ID="seu-telegram-chat-id"
```

#### 4. Executar Migração

```bash
# 1. Gerar novo cliente Prisma
npm run db:generate

# 2. Aplicar schema no PostgreSQL
npm run db:push

# 3. (Opcional) Popular com dados iniciais
npm run db:seed
```

#### 5. Verificar Migração

```bash
# Abrir Prisma Studio para ver os dados
npm run db:studio
```

---

### Opção 2: Supabase (GRATUITO)

#### 1. Criar Projeto no Supabase
```bash
# Acesse: https://supabase.com
# Crie conta gratuita
# Crie um novo projeto
```

#### 2. Obter Credenciais
1. No dashboard do Supabase
2. Vá em **Settings** → **Database**
3. Role até **Connection String**
4. Copie a string **"URI"** (modo Transaction)

#### 3. Configurar .env
```env
DATABASE_URL="postgresql://postgres.[seu-projeto]:[senha]@aws-0-us-east-1.pooler.supabase.com:6543/postgres"
```

#### 4. Executar Migração
```bash
npm run db:generate
npm run db:push
npm run db:seed
```

---

### Opção 3: Neon (GRATUITO)

#### 1. Criar Conta
```bash
# Acesse: https://neon.tech
# Crie conta gratuita (sem cartão de crédito)
```

#### 2. Criar Banco
1. Clique em **"Create Project"**
2. Escolha região (preferencialmente perto do Brasil)
3. Copie a **Connection String**

#### 3. Configurar .env
```env
DATABASE_URL="postgresql://usuario:senha@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require"
```

#### 4. Executar Migração
```bash
npm run db:generate
npm run db:push
npm run db:seed
```

---

## 📦 Migrar Dados Existentes (Se já tem pacientes cadastrados)

### Se você JÁ TEM dados em SQLite:

#### 1. Exportar Dados Atuais
```bash
# Fazer backup manual dos dados antes de migrar
npm run backup:manual
```

#### 2. Salvar Arquivo SQLite
```bash
# Copiar o banco SQLite para backup
cp prisma/database.db prisma/database.db.backup
```

#### 3. Usar Script de Migração

Crie um arquivo `scripts/migrate-to-postgresql.js`:

```javascript
const { PrismaClient: SQLiteClient } = require('@prisma/client')
const { PrismaClient: PostgresClient } = require('@prisma/client')

async function migrate() {
  // Cliente SQLite (fonte)
  const sqlite = new SQLiteClient({
    datasource: {
      url: 'file:./prisma/database.db'
    }
  })

  // Cliente PostgreSQL (destino)
  const postgres = new PostgresClient()

  console.log('🔄 Iniciando migração...')

  try {
    // 1. Migrar Usuários
    const users = await sqlite.user.findMany()
    console.log(`📋 Migrando ${users.length} usuários...`)
    for (const user of users) {
      await postgres.user.upsert({
        where: { id: user.id },
        update: user,
        create: user
      })
    }

    // 2. Migrar Contatos de Comunicação
    const contacts = await sqlite.communicationContact.findMany()
    console.log(`📋 Migrando ${contacts.length} contatos...`)
    for (const contact of contacts) {
      await postgres.communicationContact.upsert({
        where: { id: contact.id },
        update: contact,
        create: contact
      })
    }

    // 3. Migrar Pacientes Médicos
    const patients = await sqlite.medicalPatient.findMany()
    console.log(`📋 Migrando ${patients.length} pacientes médicos...`)
    for (const patient of patients) {
      await postgres.medicalPatient.upsert({
        where: { id: patient.id },
        update: patient,
        create: patient
      })
    }

    // 4. Migrar Agendamentos
    const appointments = await sqlite.appointment.findMany()
    console.log(`📋 Migrando ${appointments.length} agendamentos...`)
    for (const appointment of appointments) {
      await postgres.appointment.upsert({
        where: { id: appointment.id },
        update: appointment,
        create: appointment
      })
    }

    // 5. Migrar Consultas
    const consultations = await sqlite.consultation.findMany()
    console.log(`📋 Migrando ${consultations.length} consultas...`)
    for (const consultation of consultations) {
      await postgres.consultation.upsert({
        where: { id: consultation.id },
        update: consultation,
        create: consultation
      })
    }

    // 6. Migrar Prontuários Médicos
    const records = await sqlite.medicalRecord.findMany()
    console.log(`📋 Migrando ${records.length} prontuários...`)
    for (const record of records) {
      await postgres.medicalRecord.upsert({
        where: { id: record.id },
        update: record,
        create: record
      })
    }

    console.log('✅ Migração concluída com sucesso!')
  } catch (error) {
    console.error('❌ Erro na migração:', error)
  } finally {
    await sqlite.$disconnect()
    await postgres.$disconnect()
  }
}

migrate()
```

#### 4. Executar Migração de Dados
```bash
node scripts/migrate-to-postgresql.js
```

---

## 🔐 Configurar Backup Automático

Após migrar para PostgreSQL, configure backup automático:

### 1. Atualizar .env com Credenciais S3 (Opcional)
```env
# AWS S3 para backups em nuvem
AWS_ACCESS_KEY_ID="sua-chave"
AWS_SECRET_ACCESS_KEY="sua-chave-secreta"
AWS_REGION="us-east-1"
AWS_S3_BUCKET="medical-system-backups"
```

### 2. Inicializar Sistema de Backup
```bash
npm run backup:init
```

### 3. Verificar Status
```bash
npm run backup:status
```

---

## 🚀 Deploy em Produção

### Railway

#### 1. Configurar Variáveis no Railway
```bash
# No dashboard do Railway:
# Settings → Variables → Add Variable

DATABASE_URL=postgresql://postgres:senha@...
JWT_SECRET=seu-secret
TELEGRAM_BOT_TOKEN=seu-token
TELEGRAM_CHAT_ID=seu-chat-id
```

#### 2. Deploy
```bash
# Conectar repositório GitHub ao Railway
# Deploy automático acontece a cada push
```

### Vercel

#### 1. Configurar Variáveis
```bash
# No dashboard da Vercel:
# Settings → Environment Variables

DATABASE_URL=postgresql://postgres:senha@...
JWT_SECRET=seu-secret
TELEGRAM_BOT_TOKEN=seu-token
```

#### 2. Deploy
```bash
vercel --prod
```

---

## ✅ Checklist Pós-Migração

- [ ] Banco PostgreSQL criado e acessível
- [ ] Variável DATABASE_URL configurada
- [ ] Migrations executadas (`npm run db:push`)
- [ ] Dados migrados (se havia dados anteriores)
- [ ] Backup automático configurado
- [ ] Sistema testado localmente
- [ ] Deploy em produção realizado
- [ ] Backup manual criado após deploy

---

## 🆘 Troubleshooting

### Erro: "Can't reach database server"
```bash
# Verifique se a URL está correta
# Teste conexão:
npx prisma db push
```

### Erro: "SSL connection required"
```bash
# Adicione ?sslmode=require na URL:
DATABASE_URL="postgresql://user:pass@host:5432/db?sslmode=require"
```

### Erro: "Too many connections"
```bash
# Use connection pooling:
# Supabase: use porta 6543 (pooler)
# Ou configure pgBouncer
```

---

## 📞 Suporte

Se tiver problemas:

1. Verifique logs: `npm run dev` (procure erros de conexão)
2. Teste conexão: `npx prisma db push`
3. Verifique variáveis: `echo $DATABASE_URL`
4. Consulte documentação do Prisma: https://www.prisma.io/docs

---

**⚠️ IMPORTANTE**: Após migrar para PostgreSQL, **NÃO DELETE** o arquivo `database.db` original até ter certeza absoluta que todos os dados foram migrados corretamente!

**✅ RECOMENDAÇÃO**: Use **Railway** para hospedagem completa (banco + aplicação) - é a opção mais simples e tudo fica em um só lugar.
