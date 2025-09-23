# 🚀 DEPLOY PARA JOAOVITORVIANA.COM.BR

## 📋 CHECKLIST DE DEPLOY

### 🔐 1. PREPARAÇÃO DAS VARIÁVEIS DE AMBIENTE

#### ✅ Gerar Chaves Seguras
Execute estes comandos para gerar chaves seguras:

```bash
# Gerar JWT_SECRET (32 caracteres)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Gerar JWT_REFRESH_SECRET (32 caracteres)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Gerar NEXTAUTH_SECRET (32 caracteres)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Gerar LGPD_ENCRYPTION_KEY (32 caracteres)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Gerar LGPD_ENCRYPTION_IV (16 caracteres)
node -e "console.log(require('crypto').randomBytes(16).toString('hex'))"
```

#### ✅ Configurar Arquivo .env
1. Copie o arquivo `.env.joaovitorviana`
2. Substitua todas as chaves pelos valores gerados acima
3. Configure as credenciais do banco de dados
4. Configure as credenciais de email

### 🌐 2. OPÇÕES DE HOSPEDAGEM

## OPÇÃO A: VERCEL (RECOMENDADO)

### Vantagens:
- ✅ Deploy automático
- ✅ SSL gratuito
- ✅ CDN global
- ✅ Integração perfeita com Next.js
- ✅ Domínio personalizado gratuito

### Passos:
1. **Criar conta na Vercel:**
   ```
   https://vercel.com
   ```

2. **Conectar repositório:**
   - Faça push do código para GitHub
   - Conecte o repositório na Vercel

3. **Configurar variáveis de ambiente:**
   - Vá em Settings → Environment Variables
   - Adicione todas as variáveis do arquivo `.env.joaovitorviana`

4. **Configurar domínio:**
   - Vá em Settings → Domains
   - Adicione `joaovitorviana.com.br` e `www.joaovitorviana.com.br`
   - Configure os DNS conforme instruções da Vercel

5. **Configurar banco de dados:**
   - Use Neon, PlanetScale ou Supabase (PostgreSQL gratuito)
   - Configure a DATABASE_URL

## OPÇÃO B: VPS/SERVIDOR DEDICADO

### Vantagens:
- ✅ Controle total
- ✅ Pode hospedar banco próprio
- ✅ Mais barato para alto tráfego

### Requisitos do Servidor:
- Ubuntu 20.04+ ou CentOS 8+
- Node.js 18+
- PostgreSQL 14+
- Nginx
- SSL (Let's Encrypt)

### Passos:
1. **Configurar servidor:**
   ```bash
   # Atualizar sistema
   sudo apt update && sudo apt upgrade -y
   
   # Instalar Node.js
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   
   # Instalar PostgreSQL
   sudo apt install postgresql postgresql-contrib -y
   
   # Instalar Nginx
   sudo apt install nginx -y
   
   # Instalar PM2
   sudo npm install -g pm2
   ```

2. **Configurar banco de dados:**
   ```bash
   sudo -u postgres createuser --interactive
   sudo -u postgres createdb medical_system_prod
   ```

3. **Deploy da aplicação:**
   ```bash
   # Clonar repositório
   git clone seu-repositorio.git
   cd seu-projeto
   
   # Instalar dependências
   npm ci
   
   # Configurar variáveis de ambiente
   cp .env.joaovitorviana .env
   
   # Executar migrations
   npx prisma migrate deploy
   
   # Build da aplicação
   npm run build
   
   # Iniciar com PM2
   pm2 start npm --name "medical-system" -- start
   pm2 save
   pm2 startup
   ```

4. **Configurar Nginx:**
   ```nginx
   server {
       listen 80;
       server_name joaovitorviana.com.br www.joaovitorviana.com.br;
       
       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

5. **Configurar SSL:**
   ```bash
   sudo apt install certbot python3-certbot-nginx -y
   sudo certbot --nginx -d joaovitorviana.com.br -d www.joaovitorviana.com.br
   ```

### 🗄️ 3. CONFIGURAÇÃO DO BANCO DE DADOS

#### Opções de Banco:
1. **Neon (Recomendado para Vercel):** https://neon.tech
2. **Supabase:** https://supabase.com
3. **PlanetScale:** https://planetscale.com
4. **AWS RDS**
5. **Banco próprio no VPS**

### 📧 4. CONFIGURAÇÃO DE EMAIL

#### Opções de SMTP:
1. **Gmail SMTP** (mais simples)
2. **SendGrid** (profissional)
3. **AWS SES** (escalável)
4. **Servidor próprio**

### 🔍 5. CONFIGURAÇÃO DNS

Configure estes registros no seu provedor de domínio:

```
Tipo: A
Nome: @
Valor: IP-DO-SEU-SERVIDOR (ou conforme Vercel)

Tipo: CNAME
Nome: www
Valor: joaovitorviana.com.br

Tipo: MX (se usar email próprio)
Nome: @
Valor: mail.joaovitorviana.com.br
```

### ✅ 6. CHECKLIST FINAL

- [ ] Variáveis de ambiente configuradas
- [ ] Banco de dados funcionando
- [ ] Build de produção testado
- [ ] SSL configurado
- [ ] DNS apontando corretamente
- [ ] Email funcionando
- [ ] Backup configurado
- [ ] Monitoramento ativo

### 🚨 7. SEGURANÇA

- [ ] Firewall configurado
- [ ] Atualizações automáticas
- [ ] Backup regular
- [ ] Monitoramento de logs
- [ ] Rate limiting ativo
- [ ] Headers de segurança

## 📞 SUPORTE

Se precisar de ajuda, você pode:
1. Verificar os logs: `pm2 logs` (VPS) ou Vercel Dashboard
2. Testar localmente: `npm run build && npm start`
3. Verificar banco: `npx prisma studio`