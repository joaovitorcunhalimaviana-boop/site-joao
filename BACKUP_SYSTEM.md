# Sistema de Backup Automatizado

## Visão Geral

Sistema completo de backup automatizado para o prontuário eletrônico médico, com:

- ✅ Backups diários automáticos às 02:00
- ✅ Limpeza automática semanal (domingos às 03:00)
- ✅ Retenção de 30 dias
- ✅ Auditoria completa de todas as operações
- ✅ Suporte para backup local e em nuvem
- ✅ Verificação de integridade dos backups
- ✅ APIs REST para controle manual

## Estrutura do Sistema

```
backups/
├── local/           # Backups locais
├── temp/            # Arquivos temporários
scripts/
├── backup-scheduler.js      # Agendador de tarefas
├── init-backup-system.js    # Inicializador do sistema
lib/
├── backup-service.ts        # Serviço principal de backup
app/api/backup/
├── route.ts                 # API de backup
├── restore/
│   └── route.ts            # API de restauração
```

## Comandos NPM

### Inicialização

```bash
# Inicializar sistema completo (recomendado na primeira vez)
npm run backup:init

# Iniciar apenas o agendador
npm run backup:start
```

### Operações Manuais

```bash
# Criar backup manual
npm run backup:manual

# Limpar backups antigos manualmente
npm run backup:cleanup

# Verificar status do sistema
npm run backup:status
```

## APIs REST

### Backup

#### POST /api/backup

Cria um novo backup

**Headers:**

```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Response:**

```json
{
  "success": true,
  "backupId": "backup_20241201_140530",
  "size": "2.5MB",
  "timestamp": "2024-12-01T14:05:30.123Z"
}
```

#### GET /api/backup

Lista todos os backups disponíveis

**Response:**

```json
{
  "success": true,
  "backups": [
    {
      "id": "backup_20241201_140530",
      "timestamp": "2024-12-01T14:05:30.123Z",
      "size": "2.5MB",
      "type": "manual",
      "integrity": "verified"
    }
  ]
}
```

#### DELETE /api/backup

Limpa backups antigos (>30 dias)

**Response:**

```json
{
  "success": true,
  "deletedCount": 5,
  "message": "5 backups antigos removidos"
}
```

### Restauração

#### POST /api/backup/restore

Restaura um backup específico

**Body:**

```json
{
  "backupId": "backup_20241201_140530",
  "confirmRestore": true
}
```

**Response:**

```json
{
  "success": true,
  "message": "Backup restaurado com sucesso",
  "restoredTables": ["User", "Patient", "Consultation", "MedicalRecord"]
}
```

## Configuração

### Variáveis de Ambiente

```env
# Obrigatórias
DATABASE_URL="postgresql://..."
JWT_SECRET="seu-jwt-secret"

# Opcionais para backup em nuvem
AWS_ACCESS_KEY_ID="sua-chave"
AWS_SECRET_ACCESS_KEY="sua-chave-secreta"
AWS_REGION="us-east-1"
AWS_S3_BUCKET="meu-bucket-backup"
```

### Personalização

Para alterar horários ou configurações, edite:

**scripts/backup-scheduler.js:**

```javascript
// Backup diário às 2:00 AM
this.backupTask = cron.schedule('0 2 * * *', async () => {
  // Altere '0 2 * * *' para o horário desejado
})

// Limpeza semanal aos domingos às 3:00 AM
this.cleanupTask = cron.schedule('0 3 * * 0', async () => {
  // Altere '0 3 * * 0' para o horário desejado
})
```

**lib/backup-service.ts:**

```typescript
// Alterar retenção (padrão: 30 dias)
static RETENTION_DAYS = 30

// Alterar diretório de backup
static BACKUP_DIR = path.join(process.cwd(), 'backups', 'local')
```

## Monitoramento

### Logs de Auditoria

Todas as operações são registradas na tabela `AuditLog`:

```sql
SELECT * FROM "AuditLog"
WHERE resource = 'Backup'
ORDER BY "createdAt" DESC;
```

### Status do Sistema

```bash
# Via NPM
npm run backup:status

# Via API
curl -H "Authorization: Bearer <token>" \
     http://localhost:3000/api/backup
```

### Verificação de Integridade

O sistema automaticamente:

- ✅ Verifica checksums MD5 dos backups
- ✅ Testa conectividade do banco antes de backup
- ✅ Valida estrutura dos arquivos de backup
- ✅ Registra falhas na auditoria

## Segurança

### Autenticação

- Todas as APIs requerem JWT válido
- Operações são auditadas com IP do cliente
- Rate limiting aplicado (100 req/15min por IP)

### Dados Sensíveis

- Backups incluem dados médicos criptografados
- Arquivos temporários são limpos automaticamente
- Logs não expõem informações sensíveis

### Permissões

- Apenas usuários autenticados podem criar/restaurar backups
- Operações críticas geram logs de auditoria
- Backups são armazenados com permissões restritas

## Troubleshooting

### Problemas Comuns

**Erro: "Variáveis de ambiente não encontradas"**

```bash
# Verifique se DATABASE_URL e JWT_SECRET estão definidas
echo $DATABASE_URL
echo $JWT_SECRET
```

**Erro: "Falha na conexão com banco"**

```bash
# Teste a conexão manualmente
npx prisma db push
```

**Erro: "Diretório de backup não encontrado"**

```bash
# O sistema cria automaticamente, mas você pode criar manualmente:
mkdir -p backups/local backups/temp
```

**Backup não executando automaticamente**

```bash
# Verifique se o agendador está rodando
npm run backup:status

# Reinicie o sistema
npm run backup:init
```

### Logs Detalhados

Para debug, consulte:

- Console do agendador: `npm run backup:start`
- Logs de auditoria no banco: tabela `AuditLog`
- Logs do sistema: diretório `logs/`

## Manutenção

### Limpeza Manual

```bash
# Limpar backups antigos
npm run backup:cleanup

# Limpar arquivos temporários
rm -rf backups/temp/*
```

### Backup dos Backups

Para máxima segurança, configure backup externo:

```bash
# Exemplo com rsync
rsync -av backups/ usuario@servidor-remoto:/backup/prontuario/

# Exemplo com AWS CLI
aws s3 sync backups/ s3://meu-bucket/backups/
```

### Teste de Restauração

Recomenda-se testar restauração mensalmente:

1. Criar backup de teste
2. Restaurar em ambiente de desenvolvimento
3. Verificar integridade dos dados
4. Documentar resultado

## Suporte

Para problemas ou dúvidas:

1. Consulte logs de auditoria
2. Verifique configurações de ambiente
3. Teste conectividade do banco
4. Consulte documentação da API

---

**Versão:** 1.0.0  
**Última atualização:** Dezembro 2024  
**Compatibilidade:** Node.js 18+, PostgreSQL 12+
