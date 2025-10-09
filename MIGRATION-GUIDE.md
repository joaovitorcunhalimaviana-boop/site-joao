# 🚀 GUIA DE MIGRAÇÃO: JSON → PostgreSQL

## ⚠️ TAREFA CRÍTICA CONCLUÍDA

Este documento descreve o processo completo de migração do sistema de prontuários médicos de arquivos JSON para PostgreSQL no Railway.

## 📋 RESUMO DA MIGRAÇÃO

### ✅ ETAPAS CONCLUÍDAS

1. **✅ Backup Completo dos Dados**
   - Backup criado em: `backups/migration-backup-2025-10-07-22-39-09/`
   - Todos os arquivos JSON preservados
   - Dados identificados: `medical-patients.json`, `appointments.json`

2. **✅ Instalação de Dependências**
   ```bash
   npm install prisma @prisma/client
   npm install -D tsx
   ```

3. **✅ Configuração do Schema Prisma**
   - Arquivo: `prisma/schema.prisma`
   - Provider alterado: `sqlite` → `postgresql`
   - Modelos médicos adicionados:
     - `Paciente` (com numeroProntuario autoincrement)
     - `Consulta` (relacionamento com Paciente)
     - `HorarioDisponivel` (gestão de agenda)
     - `Avaliacao` (sistema de reviews)
     - `NewsletterSubscriber` (marketing)
     - `Usuario` (sistema de login)
     - `AuditLog` (conformidade LGPD)

4. **✅ Configuração de Variáveis de Ambiente**
   - Arquivo: `.env` atualizado
   - `DATABASE_URL` configurado para PostgreSQL
   - Exemplo criado para Railway

5. **✅ Script de Migração Criado**
   - Arquivo: `scripts/migrate-json-to-postgres.ts`
   - Migração segura com validação
   - Logs detalhados de progresso
   - Preservação de integridade referencial

## 🔄 PRÓXIMAS ETAPAS (PENDENTES)

### 1. Configurar PostgreSQL no Railway

1. **Acesse o Railway Dashboard**
   - Vá para: https://railway.app/
   - Faça login na sua conta

2. **Criar Banco PostgreSQL**
   ```bash
   # No Railway Dashboard:
   # 1. Clique em "New Project"
   # 2. Selecione "Provision PostgreSQL"
   # 3. Copie a DATABASE_URL gerada
   ```

3. **Atualizar .env**
   ```bash
   # Substitua no arquivo .env:
   DATABASE_URL="postgresql://username:password@host:port/database?schema=public"
   ```

### 2. Executar Migração do Prisma

```bash
# Gerar cliente Prisma
npx prisma generate

# Executar migração inicial
npx prisma migrate dev --name init

# Verificar se as tabelas foram criadas
npx prisma studio
```

### 3. Executar Migração dos Dados

```bash
# Executar script de migração
npx tsx scripts/migrate-json-to-postgres.ts
```

### 4. Validar Migração

```bash
# Verificar dados no Prisma Studio
npx prisma studio

# Ou executar queries de validação
npx prisma db seed
```

## 📊 ESTRUTURA DOS DADOS

### Dados Identificados para Migração

1. **medical-patients.json** (1 paciente)
   - ID: Existente
   - Nome: "João Silva Teste" (encoding corrigido)
   - CPF, telefone, plano de saúde
   - Consentimentos LGPD

2. **appointments.json** (1 agendamento)
   - Relacionado ao paciente acima
   - Data e hora de agendamento
   - Status e tipo de consulta

## 🔒 SEGURANÇA E CONFORMIDADE

### ✅ Medidas de Segurança Implementadas

- **Backup Automático**: Dados originais preservados
- **Validação de Dados**: Verificação antes da inserção
- **Integridade Referencial**: Relacionamentos validados
- **Logs de Auditoria**: Rastreamento de todas as operações
- **Criptografia**: Dados sensíveis protegidos (LGPD)

### ⚠️ IMPORTANTE - LGPD

- Dados médicos têm retenção permanente (`DATA_RETENTION_DAYS=-1`)
- Chaves de criptografia configuradas
- Sistema de auditoria implementado
- Consentimentos preservados

## 🚨 TROUBLESHOOTING

### Problemas Comuns

1. **Erro de Conexão PostgreSQL**
   ```bash
   # Verificar se a DATABASE_URL está correta
   npx prisma db pull
   ```

2. **Erro de Migração**
   ```bash
   # Reset do banco (CUIDADO - só em desenvolvimento)
   npx prisma migrate reset
   ```

3. **Dados Duplicados**
   ```bash
   # O script verifica duplicatas automaticamente
   # Logs mostrarão conflitos
   ```

## 📞 SUPORTE

Em caso de problemas:

1. **Verificar Logs**: Console do script de migração
2. **Prisma Studio**: Visualizar dados migrados
3. **Railway Logs**: Verificar conexão do banco
4. **Backup**: Dados originais em `backups/`

## 🎯 CHECKLIST FINAL

- [ ] PostgreSQL configurado no Railway
- [ ] DATABASE_URL atualizada no .env
- [ ] `npx prisma migrate dev --name init` executado
- [ ] `npx tsx scripts/migrate-json-to-postgres.ts` executado
- [ ] Dados validados no Prisma Studio
- [ ] Aplicação testada com novos dados
- [ ] Backup dos JSONs preservado

---

**⚠️ LEMBRE-SE**: Nunca delete os arquivos JSON originais. Eles são seu backup de segurança!