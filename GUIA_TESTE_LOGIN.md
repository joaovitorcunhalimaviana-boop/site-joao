# 🧪 Guia de Teste de Login

## Passo 1: Iniciar o Servidor

Abra um terminal e execute:

```bash
cd site-joao-master
npm run dev
```

Aguarde até ver a mensagem:
```
▲ Next.js 15.5.4
- Local: http://localhost:3000
```

**⚠️ IMPORTANTE: Deixe este terminal aberto!**

---

## Passo 2: Testar via Script (Terminal Separado)

Abra um **NOVO terminal** (deixe o servidor rodando no anterior) e execute:

```bash
cd site-joao-master
node scripts/test-login-request.js
```

### Resultado Esperado:

```
✅ LOGIN BEM-SUCEDIDO!
Usuário: Dr. João Vitor Viana
Role: doctor
Áreas: [ 'medica' ]
```

### Se der ERRO:

1. Verifique se o servidor está rodando (terminal anterior)
2. Veja os logs no terminal do servidor
3. Copie e envie os logs de erro

---

## Passo 3: Testar no Navegador

1. Abra o navegador
2. Acesse: **http://localhost:3000/login-medico**
3. Digite:
   - **Usuário**: `joao.viana`
   - **Senha**: `Logos1.1`
4. Clique em **"Entrar na Área Médica"**

### Resultado Esperado:

- ✅ Redirecionamento para `/area-medica`
- ✅ Nome do médico aparece na tela

### Se der ERRO:

1. Abra o **Console do Navegador** (F12 → Console)
2. Veja se há erros em vermelho
3. No terminal do servidor, veja os logs detalhados
4. Procure por mensagens com:
   - `🔐 [Login API] Tentativa de login`
   - `📊 [Login API] Resultado da autenticação`
   - `❌ [Login API] Erro fatal`

---

## Passo 4: Verificar Logs do Servidor

No terminal onde o servidor está rodando, você deve ver:

```
🔐 [Login API] Tentativa de login: {
  email: 'joao.viana',
  timestamp: '2025-10-09T...'
}
📊 [Login API] Resultado da autenticação: {
  success: true,
  user: { username: 'joao.viana', role: 'doctor' },
  message: 'Login realizado com sucesso'
}
✅ [Login API] Login realizado com sucesso!
📤 [Login API] Enviando resposta: {
  username: 'joao.viana',
  areas: [ 'medica' ],
  hasCookies: true
}
```

---

## ⚠️ Problemas Comuns

### Erro: "Erro interno do servidor"

**O que fazer:**
1. Veja o log completo no terminal do servidor
2. Procure por `❌ [Login API] Erro fatal:`
3. Copie toda a mensagem de erro (incluindo stack trace)

### Erro: "Usuário não encontrado"

**O que fazer:**
```bash
# Verificar usuários
node scripts/verify-users.js

# Se não aparecer joao.viana, recrie:
node scripts/cleanup-and-restore-users.js
```

### Erro: "Senha incorreta"

**Certifique-se de digitar exatamente:**
- Username: `joao.viana` (tudo minúsculo, com ponto)
- Senha: `Logos1.1` (L maiúsculo, resto minúsculo, números no final)

---

## 📋 Checklist de Depuração

- [ ] Servidor está rodando (npm run dev)
- [ ] Usuário existe no banco (scripts/verify-users.js)
- [ ] Senha está correta (Logos1.1)
- [ ] Console do navegador não mostra erros
- [ ] Terminal do servidor mostra logs de login
- [ ] Banco de dados está conectado

---

## 🆘 Se Nada Funcionar

Execute este comando para obter informações de debug:

```bash
node scripts/test-login-api.js
```

E envie o resultado completo.
