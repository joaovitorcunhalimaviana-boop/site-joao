# 🚀 Guia de Deploy no Vercel - joaovitorviana.com.br

## 📋 Pré-requisitos

1. ✅ Projeto funcionando localmente
2. ✅ Código no GitHub (repositório público ou privado)
3. ✅ Conta no Vercel (gratuita)
4. ✅ Domínio registrado (joaovitorviana.com.br)

## 🔧 Passo 1: Preparar Variáveis de Ambiente

### Variáveis Obrigatórias para o Vercel:

```bash
# Database (use um serviço como Neon, PlanetScale ou Supabase)
DATABASE_URL="postgresql://usuario:senha@host:5432/database_name"

# JWT Secrets (gere novos com: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
JWT_SECRET="seu-jwt-secret-32-caracteres-minimo"
JWT_REFRESH_SECRET="seu-refresh-secret-32-caracteres-minimo"

# NextAuth
NEXTAUTH_URL="https://joaovitorviana.com.br"
NEXTAUTH_SECRET="seu-nextauth-secret-32-caracteres"

# LGPD Encryption
LGPD_ENCRYPTION_KEY="sua-chave-lgpd-exatamente-32-chars"
LGPD_ENCRYPTION_IV="seu-iv-16-chars"

# Email (use um serviço como SendGrid, Mailgun ou Gmail)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_SECURE="false"
SMTP_USER="seu-email@gmail.com"
SMTP_PASS="sua-senha-de-app"
EMAIL_FROM="Dr. João Vitor Viana <seu-email@gmail.com>"

# Site URL
NEXT_PUBLIC_SITE_URL="https://joaovitorviana.com.br"

# Opcional - Analytics
GOOGLE_ANALYTICS_ID="G-XXXXXXXXXX"
```

## 🌐 Passo 2: Deploy no Vercel

### Opção A: Via Dashboard Web

1. **Acesse**: https://vercel.com
2. **Faça login** com GitHub
3. **Clique em "New Project"**
4. **Selecione** seu repositório `my-shadcn-app`
5. **Configure**:
   - Framework Preset: `Next.js`
   - Root Directory: `./` (raiz)
   - Build Command: `npm run build`
   - Output Directory: `.next`
   - Install Command: `npm install`

### Opção B: Via CLI (Recomendado)

```bash
# Instalar Vercel CLI
npm i -g vercel

# Fazer login
vercel login

# Deploy (na pasta do projeto)
cd my-shadcn-app
vercel

# Seguir as instruções:
# - Set up and deploy? Y
# - Which scope? (sua conta)
# - Link to existing project? N
# - Project name: joaovitorviana
# - Directory: ./
```

## ⚙️ Passo 3: Configurar Variáveis de Ambiente no Vercel

### Via Dashboard:

1. Vá para seu projeto no Vercel
2. **Settings** → **Environment Variables**
3. Adicione cada variável:
   - Name: `DATABASE_URL`
   - Value: `sua-database-url`
   - Environment: `Production`, `Preview`, `Development`

### Via CLI:

```bash
# Adicionar variáveis uma por uma
vercel env add DATABASE_URL
vercel env add JWT_SECRET
vercel env add NEXTAUTH_SECRET
# ... continue para todas as variáveis
```

## 🏗️ Passo 4: Configurar Build Settings

Certifique-se que o `vercel.json` está configurado:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/next"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  },
  "functions": {
    "app/api/**/*.ts": {
      "maxDuration": 30
    }
  }
}
```

## 🌍 Passo 5: Configurar Domínio Personalizado

### No Vercel Dashboard:

1. **Settings** → **Domains**
2. **Add Domain**: `joaovitorviana.com.br`
3. **Add**: `www.joaovitorviana.com.br`

### Configurar DNS (no seu provedor de domínio):

```
Tipo: CNAME
Nome: www
Valor: cname.vercel-dns.com

Tipo: A
Nome: @
Valor: 76.76.19.61
```

## 🗄️ Passo 6: Configurar Database

### Opções Recomendadas:

#### Neon (PostgreSQL - Gratuito):

1. Acesse: https://neon.tech
2. Crie uma conta
3. Crie um novo projeto
4. Copie a `DATABASE_URL`
5. Adicione no Vercel

#### Supabase (PostgreSQL - Gratuito):

1. Acesse: https://supabase.com
2. Crie um projeto
3. Vá em Settings → Database
4. Copie a Connection String
5. Adicione no Vercel

## 📧 Passo 7: Configurar Email

### Gmail (Recomendado):

1. Ative a verificação em 2 etapas
2. Gere uma "Senha de App"
3. Use as configurações:
   ```
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=seu-email@gmail.com
   SMTP_PASS=sua-senha-de-app
   ```

## 🚀 Passo 8: Deploy Final

```bash
# Na pasta do projeto
vercel --prod

# Ou via dashboard: Settings → Deployments → Redeploy
```

## ✅ Passo 9: Verificações Pós-Deploy

1. **Teste o site**: https://joaovitorviana.com.br
2. **Verifique funcionalidades**:
   - ✅ Login/Cadastro
   - ✅ Agendamento
   - ✅ Envio de emails
   - ✅ Calculadoras
   - ✅ Área médica/secretaria

3. **Monitore logs**: Vercel Dashboard → Functions → View Logs

## 🔧 Comandos Úteis

```bash
# Ver logs em tempo real
vercel logs

# Listar deployments
vercel ls

# Promover preview para produção
vercel --prod

# Ver variáveis de ambiente
vercel env ls

# Remover deployment
vercel rm [deployment-url]
```

## 🆘 Troubleshooting

### Erro de Build:

- Verifique se todas as dependências estão no `package.json`
- Confirme que não há erros de TypeScript
- Verifique os logs de build no Vercel

### Erro de Database:

- Confirme se a `DATABASE_URL` está correta
- Teste a conexão localmente primeiro
- Verifique se o banco permite conexões externas

### Erro de Email:

- Confirme as credenciais SMTP
- Teste com um serviço como Mailtrap primeiro
- Verifique se a porta está correta (587 ou 465)

## 📊 Monitoramento

### Analytics:

- Configure Google Analytics
- Use Vercel Analytics (built-in)
- Monitore Core Web Vitals

### Logs:

- Vercel Dashboard → Functions
- Configure Sentry para error tracking
- Use `console.log` para debug (visível nos logs)

## 🔒 Segurança Final

1. ✅ Todas as variáveis de ambiente configuradas
2. ✅ Secrets gerados com crypto.randomBytes()
3. ✅ HTTPS habilitado (automático no Vercel)
4. ✅ Headers de segurança configurados
5. ✅ Rate limiting ativo
6. ✅ LGPD compliance ativo

---

## 🎉 Pronto!

Seu site estará disponível em:

- **Produção**: https://joaovitorviana.com.br
- **Preview**: URLs geradas automaticamente para cada commit

**Próximos passos**:

1. Configure backup automático
2. Monitore performance
3. Configure alertas de uptime
4. Otimize SEO
