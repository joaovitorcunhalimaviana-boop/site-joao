# 🚀 Guia de Deploy - joaovitorviana.com.br

## ✅ Status do Projeto

- ✅ Problemas de codificação UTF-8 corrigidos
- ✅ Servidor de desenvolvimento funcionando
- ✅ Build do Next.js compilando com sucesso
- ✅ Configuração do Vercel criada

## 🌐 Opções de Hospedagem Recomendadas

### 1. **Vercel (Recomendado)**

**Por que escolher:** <mcreference link="https://makerkit.dev/blog/tutorials/best-hosting-nextjs" index="3">3</mcreference>

- Plataforma construída especificamente para Next.js
- Deploy automático via GitHub
- Domínio personalizado gratuito
- SSL automático
- CDN global

**Passos:**

1. Acesse [vercel.com](https://vercel.com)
2. Conecte sua conta GitHub
3. Importe o repositório `my-shadcn-app`
4. Configure o domínio `joaovitorviana.com.br`

### 2. **Netlify (Alternativa)**

**Por que considerar:** <mcreference link="https://www.reddit.com/r/nextjs/comments/1b4kn04/best_hosting_provider_for_nextjs_with_a_custom/" index="1">1</mcreference>

- Hospedagem gratuita com domínio personalizado
- Interface amigável
- Deploy contínuo

**Passos:**

1. Acesse [netlify.com](https://netlify.com)
2. Conecte via GitHub
3. Configure build: `npm run build`
4. Configure domínio personalizado

### 3. **Railway (Para projetos maiores)**

**Características:** <mcreference link="https://www.reddit.com/r/nextjs/comments/1atzu1t/vercel_alternatives/" index="2">2</mcreference>

- Experiência similar ao Vercel
- Suporte a Docker
- Preços competitivos

## 🔧 Configuração do Domínio

### Registrar o Domínio

1. **Registro.br** (para .com.br)
   - Acesse [registro.br](https://registro.br)
   - Registre `joaovitorviana.com.br`
   - Custo: ~R$ 40/ano

2. **Namecheap/GoDaddy** (alternativas) <mcreference link="https://www.reddit.com/r/nextjs/comments/1b4kn04/best_hosting_provider_for_nextjs_with_a_custom/" index="1">1</mcreference>
   - Opções mais baratas para domínios .com

### Configurar DNS

**Para Vercel:**

```
Tipo: A
Nome: @
Valor: 76.76.19.61

Tipo: CNAME
Nome: www
Valor: cname.vercel-dns.com
```

**Para Netlify:**

```
Tipo: A
Nome: @
Valor: 75.2.60.5

Tipo: CNAME
Nome: www
Valor: [seu-site].netlify.app
```

## 📦 Preparação para Deploy

### 1. Variáveis de Ambiente

Certifique-se de configurar no painel da hospedagem:

```env
NODE_ENV=production
NEXTAUTH_SECRET=seu-secret-aqui
NEXTAUTH_URL=https://joaovitorviana.com.br
DATABASE_URL=sua-database-url
```

### 2. Build de Produção

```bash
npm run build
npm start
```

### 3. Otimizações Aplicadas

- ✅ Webpack configurado para evitar problemas de encoding
- ✅ Configuração do Vercel otimizada
- ✅ Rotas para sitemap e robots configuradas

## 🎯 Próximos Passos

1. **Escolher plataforma de hospedagem** (Recomendo Vercel)
2. **Registrar domínio joaovitorviana.com.br**
3. **Fazer deploy do projeto**
4. **Configurar DNS**
5. **Testar funcionamento completo**

## 📞 Suporte

Se encontrar problemas durante o deploy:

1. Verifique os logs da plataforma escolhida
2. Confirme se todas as variáveis de ambiente estão configuradas
3. Teste o build local antes do deploy

---

**Projeto pronto para deploy! 🚀**
