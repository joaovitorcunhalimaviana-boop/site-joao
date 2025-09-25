# 🚀 CHECKLIST DE DEPLOY - SISTEMA MÉDICO

## ⚠️ VERIFICAÇÕES CRÍTICAS ANTES DO DEPLOY

### 🔐 1. SEGURANÇA E AUTENTICAÇÃO

#### ✅ Variáveis de Ambiente

- [ ] Copiar `.env.production` e renomear para `.env`
- [ ] Alterar `JWT_SECRET` (mínimo 32 caracteres aleatórios)
- [ ] Alterar `JWT_REFRESH_SECRET` (mínimo 32 caracteres aleatórios)
- [ ] Alterar `NEXTAUTH_SECRET` (mínimo 32 caracteres aleatórios)
- [ ] Alterar `LGPD_ENCRYPTION_KEY` (exatamente 32 caracteres)
- [ ] Alterar `LGPD_ENCRYPTION_IV` (exatamente 16 caracteres)
- [ ] Configurar `DATABASE_URL` com credenciais reais
- [ ] Configurar `NEXTAUTH_URL` com domínio real
- [ ] Definir `NODE_ENV=production`

#### ✅ Middleware de Segurança

- [ ] Middleware de autenticação ativo (`middleware.ts`)
- [ ] Rate limiting configurado
- [ ] Validação de entrada implementada
- [ ] Sanitização de dados médicos ativa
- [ ] Headers de segurança configurados

#### ✅ LGPD e Privacidade

- [ ] Criptografia de dados sensíveis ativa
- [ ] Auditoria de acesso implementada
- [ ] Política de retenção de dados configurada
- [ ] Consentimento de dados implementado

### 🗄️ 2. BANCO DE DADOS

#### ✅ Configuração

- [ ] Banco PostgreSQL configurado
- [ ] Conexão SSL habilitada
- [ ] Backup automático configurado
- [ ] Migrations executadas

#### ✅ Comandos de Setup

```bash
# Gerar cliente Prisma
npx prisma generate

# Executar migrations
npx prisma migrate deploy

# Seed inicial (se necessário)
npx prisma db seed
```

### 🌐 3. CONFIGURAÇÕES DE PRODUÇÃO

#### ✅ Next.js

- [ ] `next.config.js` otimizado para produção
- [ ] Compressão habilitada
- [ ] Headers de segurança configurados
- [ ] Otimização de imagens ativa
- [ ] Bundle analyzer verificado

#### ✅ Build e Deploy

```bash
# Instalar dependências
npm ci

# Build de produção
npm run build

# Verificar se build passou sem erros
npm start
```

### 📧 4. SISTEMA DE NOTIFICAÇÕES

#### ✅ Email

- [ ] SMTP configurado (`.env`)
- [ ] Templates de email testados
- [ ] Envio de confirmação funcionando
- [ ] Lembretes automáticos ativos

#### ✅ Telegram (Opcional)

- [ ] Bot token configurado
- [ ] Chat ID definido
- [ ] Notificações de agendamento testadas

### 🔍 5. SEO E PERFORMANCE

#### ✅ SEO

- [ ] Sitemap.xml gerado
- [ ] Robots.txt configurado
- [ ] Meta tags otimizadas
- [ ] Schema markup implementado
- [ ] Open Graph configurado

#### ✅ Performance

- [ ] Lighthouse score > 90
- [ ] Core Web Vitals otimizados
- [ ] Imagens otimizadas (WebP/AVIF)
- [ ] Lazy loading implementado

### 📱 6. RESPONSIVIDADE

#### ✅ Dispositivos Testados

- [ ] Desktop (1920x1080)
- [ ] Tablet (768x1024)
- [ ] Mobile (375x667)
- [ ] Mobile Large (414x896)

#### ✅ Funcionalidades Mobile

- [ ] Touch targets adequados (44px mínimo)
- [ ] Navegação por toque funcional
- [ ] Formulários otimizados para mobile
- [ ] Teclado virtual não quebra layout

### 🧪 7. TESTES FUNCIONAIS

#### ✅ Fluxos Críticos

- [ ] Agendamento público funcional
- [ ] Login médico/secretária funcional
- [ ] Área médica acessível
- [ ] Calculadoras médicas funcionais
- [ ] Sistema de backup ativo

#### ✅ APIs Testadas

- [ ] `/api/appointments` - CRUD completo
- [ ] `/api/patients` - Gestão de pacientes
- [ ] `/api/auth/*` - Autenticação
- [ ] `/api/notifications/*` - Notificações

### 🔧 8. MONITORAMENTO

#### ✅ Logs e Erros

- [ ] Sistema de logs configurado
- [ ] Monitoramento de erros (Sentry opcional)
- [ ] Alertas de sistema configurados
- [ ] Backup de logs implementado

#### ✅ Analytics (Opcional)

- [ ] Google Analytics configurado
- [ ] Métricas de uso implementadas
- [ ] Relatórios de performance ativos

## 🚀 COMANDOS DE DEPLOY

### Deploy Local para Teste

```bash
# 1. Configurar ambiente
cp .env.production .env
# Editar .env com valores reais

# 2. Instalar e buildar
npm ci
npm run build

# 3. Executar migrations
npx prisma generate
npx prisma migrate deploy

# 4. Iniciar em produção
npm start
```

### Deploy em Servidor (PM2)

```bash
# 1. Instalar PM2 globalmente
npm install -g pm2

# 2. Criar arquivo ecosystem
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'medical-system',
    script: 'npm',
    args: 'start',
    cwd: '/caminho/para/projeto',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G'
  }]
}
EOF

# 3. Iniciar com PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### Deploy com Docker

```bash
# 1. Build da imagem
docker build -t medical-system .

# 2. Executar container
docker run -d \
  --name medical-system \
  -p 3000:3000 \
  --env-file .env \
  medical-system
```

## ⚡ VERIFICAÇÕES PÓS-DEPLOY

### ✅ Testes de Produção

- [ ] Site carrega em < 3 segundos
- [ ] Todas as páginas acessíveis
- [ ] Formulários funcionais
- [ ] Emails sendo enviados
- [ ] Banco de dados conectado
- [ ] Backups funcionando

### ✅ Monitoramento Inicial

- [ ] Logs sem erros críticos
- [ ] Memória e CPU estáveis
- [ ] Conexões de banco normais
- [ ] SSL/HTTPS funcionando

### ✅ Testes de Usuário

- [ ] Agendamento público testado
- [ ] Login de médico testado
- [ ] Login de secretária testado
- [ ] Área médica acessível
- [ ] Calculadoras funcionais

## 🆘 ROLLBACK DE EMERGÊNCIA

Se algo der errado:

```bash
# 1. Parar aplicação
pm2 stop medical-system

# 2. Restaurar backup do banco
# (comando específico do seu provedor)

# 3. Reverter para versão anterior
git checkout versao-anterior
npm ci
npm run build

# 4. Reiniciar
pm2 restart medical-system
```

## 📞 CONTATOS DE EMERGÊNCIA

- **Desenvolvedor**: [Seu contato]
- **Servidor**: [Contato do provedor]
- **Banco de Dados**: [Contato do DBA]
- **DNS/Domínio**: [Contato do registrar]

---

## ✅ ASSINATURA DE DEPLOY

**Data**: ******\_\_\_******
**Responsável**: ******\_\_\_******
**Versão**: ******\_\_\_******
**Ambiente**: Produção

**Checklist Completo**: [ ] Sim [ ] Não
**Testes Realizados**: [ ] Sim [ ] Não
**Backup Criado**: [ ] Sim [ ] Não

**Observações**:

---

---

---
