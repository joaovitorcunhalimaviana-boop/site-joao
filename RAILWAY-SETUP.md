# 🚂 PASSO 3: CONECTAR AO RAILWAY

## 📋 CONFIGURAÇÃO POSTGRESQL NO RAILWAY

### 1. 🌐 Acessar Railway Dashboard

1. Acesse: https://railway.app/
2. Faça login na sua conta
3. Vá para o seu projeto existente

### 2. 🗄️ Adicionar PostgreSQL ao Projeto

**No Railway Dashboard:**

1. Clique no botão **"+ New"** ou **"Add Service"**
2. Selecione **"Database"**
3. Escolha **"PostgreSQL"**
4. Aguarde a criação do banco (1-2 minutos)

### 3. 📋 Copiar DATABASE_URL

**Após criação do PostgreSQL:**

1. Clique no serviço **PostgreSQL** criado
2. Vá para a aba **"Variables"**
3. Copie o valor da variável **`DATABASE_URL`**
   - Formato: `postgresql://postgres:senha@containers-us-west-xxx.railway.app:5432/railway`

### 4. ⚙️ Configurar Variáveis de Ambiente

#### 4.1 No Arquivo .env Local

```bash
# Substitua pela URL copiada do Railway
DATABASE_URL="postgresql://postgres:senha@containers-us-west-xxx.railway.app:5432/railway"
```

#### 4.2 No Railway (Variáveis do Projeto Principal)

**Para o serviço da aplicação (não o PostgreSQL):**

1. Clique no serviço da sua **aplicação Next.js**
2. Vá para **"Variables"**
3. Adicione nova variável:
   - **Nome:** `DATABASE_URL`
   - **Valor:** `${{Postgres.DATABASE_URL}}`

> ⚠️ **IMPORTANTE**: Use `${{Postgres.DATABASE_URL}}` para referência interna entre serviços

### 5. 🔄 Executar Migração

**Após configurar as variáveis:**

```bash
# 1. Gerar cliente Prisma
npx prisma generate

# 2. Executar migração inicial
npx prisma migrate dev --name init

# 3. Verificar se funcionou
npx prisma studio
```

### 6. 📊 Migrar Dados JSON

```bash
# Executar script de migração
npx tsx scripts/migrate-json-to-postgres.ts
```

## 🔍 VERIFICAÇÃO

### Checklist de Configuração

- [ ] PostgreSQL criado no Railway
- [ ] DATABASE_URL copiada
- [ ] .env local atualizado
- [ ] Variável no Railway configurada (`${{Postgres.DATABASE_URL}}`)
- [ ] `npx prisma generate` executado
- [ ] `npx prisma migrate dev --name init` executado
- [ ] Prisma Studio funcionando
- [ ] Script de migração executado

### 🚨 Troubleshooting

**Erro de Conexão:**
```bash
# Testar conexão
npx prisma db pull
```

**Erro de Migração:**
```bash
# Verificar status
npx prisma migrate status
```

**Verificar Dados:**
```bash
# Abrir Prisma Studio
npx prisma studio
```

## 📞 Próximos Passos

Após configurar o Railway:

1. ✅ Testar conexão local
2. ✅ Executar migração dos dados
3. ✅ Validar dados no Prisma Studio
4. ✅ Fazer deploy da aplicação
5. ✅ Testar em produção

---

**🎯 OBJETIVO**: Migração segura de JSON → PostgreSQL no Railway