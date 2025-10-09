# 🔒 Sistema de Proteção de Dados Médicos

## ⚠️ ATENÇÃO: Dados Médicos são Sensíveis e Permanentes

Este documento explica como o sistema protege os dados dos pacientes e garante que **NUNCA** sejam perdidos.

---

## 🛡️ Camadas de Proteção Implementadas

### 1. **Banco de Dados Persistente**
- ✅ **PostgreSQL** em servidor dedicado (Railway/Supabase/Neon)
- ✅ Dados armazenados externamente (não no servidor da aplicação)
- ✅ Sobrevive a deploys e reinicializações
- ✅ Backups automáticos pelo provedor

### 2. **Backup Automático Diário**
- ✅ Backup completo todos os dias às **2h da manhã**
- ✅ Retenção de **30 dias**
- ✅ Armazenamento local + nuvem (opcional)
- ✅ Verificação de integridade (checksums MD5)

### 3. **Backup de Emergência**
- ✅ Sistema cria backups compactados em `backups/emergency/`
- ✅ Sincronização automática entre localStorage e servidor
- ✅ Recuperação automática em caso de falha

### 4. **Criptografia LGPD**
- ✅ Dados sensíveis criptografados (CPF, dados médicos)
- ✅ Rotação de chaves de criptografia
- ✅ Conformidade com LGPD

### 5. **Logs de Auditoria**
- ✅ Todas as operações críticas registradas
- ✅ Rastreamento de quem fez o quê e quando
- ✅ Retenção de 90 dias

---

## 📊 Política de Retenção de Dados

### Dados Médicos (PERMANENTES)
**NUNCA são excluídos automaticamente:**
- ✅ Prontuários médicos
- ✅ Histórico de consultas
- ✅ Prescrições
- ✅ Exames e anexos
- ✅ Diagnósticos

**Configuração no `.env`:**
```env
DATA_RETENTION_DAYS=-1  # -1 = permanente
MEDICAL_DATA_PERMANENT=true
```

### Dados de Comunicação
**Podem ser excluídos após consentimento:**
- Dados de newsletter (após cancelamento)
- Logs de auditoria (após 90 dias)
- Backups antigos (após 30 dias)

---

## 🔄 Sistema de Backup

### Automático

#### Configuração Atual
```javascript
// scripts/backup-scheduler.js
// Backup diário às 2:00 AM
this.backupTask = cron.schedule('0 2 * * *', async () => {
  await runBackup()
})

// Limpeza semanal aos domingos às 3:00 AM
this.cleanupTask = cron.schedule('0 3 * * 0', async () => {
  await cleanupOldBackups()
})
```

#### Comandos Disponíveis
```bash
# Inicializar sistema de backup
npm run backup:init

# Criar backup manual
npm run backup:manual

# Limpar backups antigos
npm run backup:cleanup

# Verificar status
npm run backup:status
```

### Manual

#### Via API
```bash
# Criar backup
curl -X POST http://localhost:3000/api/backup \
  -H "Authorization: Bearer SEU_TOKEN"

# Listar backups
curl http://localhost:3000/api/backup \
  -H "Authorization: Bearer SEU_TOKEN"

# Restaurar backup
curl -X POST http://localhost:3000/api/backup/restore \
  -H "Authorization: Bearer SEU_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"backupId": "backup_20241201_140530", "confirmRestore": true}'
```

---

## 🚨 Procedimento de Recuperação de Dados

### Cenário 1: Perda de Dados Recente

```bash
# 1. Parar a aplicação
pm2 stop all  # ou ctrl+c se rodando local

# 2. Listar backups disponíveis
npm run backup:status

# 3. Restaurar último backup
curl -X POST http://localhost:3000/api/backup/restore \
  -H "Authorization: Bearer SEU_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "backupId": "backup_20241201_140530",
    "confirmRestore": true
  }'

# 4. Verificar dados restaurados
npm run db:studio

# 5. Reiniciar aplicação
npm run dev
```

### Cenário 2: Migração de Servidor

```bash
# 1. No servidor antigo - Criar backup final
npm run backup:manual

# 2. Baixar arquivo de backup
# Copiar de backups/local/backup_XXXXXX.json

# 3. No servidor novo - Restaurar
npm run backup:init
# Copiar arquivo para backups/local/
npm run backup:restore
```

### Cenário 3: Disaster Recovery (Perda Total)

```bash
# 1. Verificar se há backup em nuvem (S3)
aws s3 ls s3://medical-system-backups/

# 2. Baixar último backup
aws s3 cp s3://medical-system-backups/backup_XXXXXX.json ./

# 3. Restaurar no novo servidor
# Seguir procedimento do Cenário 2
```

---

## 📁 Estrutura de Backups

```
backups/
├── local/                    # Backups locais (30 dias)
│   ├── backup_20241201_020000.json
│   ├── backup_20241202_020000.json
│   └── ...
├── emergency/                # Backups de emergência
│   ├── compressed-emergency-backup-2025-10-01T01-21-43-841Z.json
│   └── ...
└── temp/                     # Arquivos temporários (limpos automaticamente)
```

### Formato do Backup

```json
{
  "timestamp": "2024-12-01T02:00:00.000Z",
  "version": "1.0",
  "checksum": "md5-hash-aqui",
  "data": {
    "users": [...],
    "communicationContacts": [...],
    "medicalPatients": [...],
    "appointments": [...],
    "consultations": [...],
    "medicalRecords": [...],
    "auditLogs": [...]
  }
}
```

---

## 🔐 Segurança dos Backups

### Criptografia
- ✅ Backups contêm dados já criptografados pela LGPD
- ✅ Arquivos armazenados com permissões restritas
- ✅ Acesso apenas via autenticação JWT

### Controle de Acesso
```typescript
// Apenas usuários autenticados podem criar/restaurar backups
const token = req.headers.authorization
if (!token || !verifyJWT(token)) {
  return res.status(401).json({ error: 'Não autorizado' })
}
```

### Logs de Auditoria
```typescript
// Todas as operações de backup são registradas
await prisma.auditLog.create({
  data: {
    action: 'BACKUP_CREATED',
    resource: 'Backup',
    resourceId: backupId,
    details: `Backup criado: ${filename}`,
    severity: 'LOW'
  }
})
```

---

## 📊 Monitoramento

### Verificar Saúde do Sistema

```bash
# Status do backup
npm run backup:status

# Últimos logs de auditoria
npx prisma studio
# Navegar para AuditLog > Filtrar por action: BACKUP_*

# Espaço em disco
du -sh backups/
```

### Alertas Automáticos

O sistema envia notificações via Telegram quando:
- ✅ Backup diário concluído com sucesso
- ❌ Falha no backup automático
- ⚠️ Espaço em disco baixo
- ⚠️ Backup não executado nas últimas 24h

Configure no `.env`:
```env
TELEGRAM_BOT_TOKEN="seu-token"
TELEGRAM_CHAT_ID="seu-chat-id"
```

---

## ✅ Checklist de Segurança Diária

### Desenvolvedor
- [ ] Verificar se backup automático rodou hoje
- [ ] Conferir logs de erro no console
- [ ] Testar acesso ao banco de dados
- [ ] Verificar espaço em disco

### Semanal
- [ ] Testar restauração de um backup
- [ ] Revisar logs de auditoria
- [ ] Verificar backups em nuvem (se configurado)
- [ ] Atualizar documentação se necessário

### Mensal
- [ ] Fazer backup manual e armazenar externamente
- [ ] Testar procedimento completo de disaster recovery
- [ ] Revisar e atualizar políticas de retenção
- [ ] Auditar acessos ao sistema

---

## 🆘 Em Caso de Emergência

### ⚠️ DADOS PERDIDOS - AÇÃO IMEDIATA

1. **NÃO ENTRAR EM PÂNICO**
2. **NÃO FAZER NENHUMA OPERAÇÃO NO BANCO**
3. **PARAR A APLICAÇÃO IMEDIATAMENTE**

```bash
# Parar aplicação
pm2 stop all
# ou
kill <PID_DO_PROCESSO>
```

4. **CONTATAR RESPONSÁVEL TÉCNICO**
5. **SEGUIR PROCEDIMENTO DE RECUPERAÇÃO** (ver acima)

---

## 📞 Contatos de Emergência

### Suporte Técnico
- **Sistema**: João Vitor Viana
- **Backup**: Verificar logs em `backups/logs/`
- **Banco de Dados**: Suporte do provedor (Railway/Supabase/Neon)

### Procedimentos Críticos
1. **Perda de Dados**: Seguir "Procedimento de Recuperação de Dados"
2. **Falha no Backup**: Verificar cron job e permissões
3. **Banco Indisponível**: Verificar status do provedor
4. **Erro de Criptografia**: NÃO alterar chaves sem backup

---

## 📚 Documentação Adicional

- [Sistema de Backup](BACKUP_SYSTEM.md)
- [Migração PostgreSQL](MIGRACAO_POSTGRESQL.md)
- [Deploy](DEPLOY_INSTRUCTIONS.md)
- [LGPD e Criptografia](lib/lgpd-encryption.ts)

---

**🔒 LEMBRE-SE**: Dados médicos são **PERMANENTES** e **PROTEGIDOS POR LEI**. Nunca delete dados sem autorização expressa e documentada do paciente.

**✅ BOA PRÁTICA**: Sempre que fizer alterações no banco de dados em produção, crie um backup manual ANTES.

```bash
npm run backup:manual
```
