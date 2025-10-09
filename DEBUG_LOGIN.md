# 🔍 Guia Completo de Debug do Login

## ✅ O que foi corrigido:

1. **API reescrita** - Sem dependências problemáticas
2. **Logs completos** - Cliente E servidor
3. **Tratamento de erros robusto** - Mensagens claras
4. **Validação de resposta** - Verifica se é JSON antes de parsear

---

## 🧪 Como Testar Agora:

### Passo 1: Limpar cache do navegador

**IMPORTANTE:** Antes de testar, limpe o cache:

1. Abra o DevTools (F12)
2. Clique com botão direito no botão de recarregar
3. Selecione **"Limpar cache e recarregar forçado"**

OU

1. Pressione `Ctrl+Shift+Delete`
2. Marque "Imagens e arquivos em cache"
3. Clique em "Limpar dados"

### Passo 2: Reiniciar o servidor

```bash
# Pare o servidor (Ctrl+C)
cd site-joao-master
npm run dev
```

### Passo 3: Abrir Console do Navegador

1. Acesse: http://localhost:3000/login-medico
2. Pressione **F12** (DevTools)
3. Vá para aba **"Console"**
4. Deixe o console aberto

### Passo 4: Fazer Login

1. Digite:
   - **Usuário**: `joao.viana`
   - **Senha**: `Logos1.1`
2. Clique em **"Entrar na Área Médica"**

---

## 📊 Logs Esperados (SUCESSO):

### No Console do Navegador (F12):

```
🔐 [Cliente] Iniciando login... {username: 'joao.viana'}
📤 [Cliente] Enviando requisição...
📥 [Cliente] Resposta recebida: {status: 200, ok: true, contentType: 'application/json'}
✅ [Cliente] JSON parseado: {success: true, user: {...}, message: 'Login realizado...'}
🎉 [Cliente] Login bem-sucedido!
✅ [Cliente] Acesso à área médica permitido
🚀 [Cliente] Redirecionando para /area-medica
🏁 [Cliente] Processo de login finalizado
```

### No Terminal do Servidor:

```
🔐 [Login API] Iniciando processo de login...
📝 [Login API] Credenciais recebidas: { email: 'joao.viana' }
🔍 [Login API] Buscando usuário...
✅ [Login API] Usuário encontrado: joao.viana
🔒 [Login API] Verificando senha...
✅ [Login API] Senha correta!
🎫 [Login API] Gerando tokens...
✅ [Login API] Tokens gerados!
📋 [Login API] Mapeamento: { role: 'doctor', areas: [ 'medica' ] }
✅ [Login API] Login bem-sucedido!
🍪 [Login API] Cookies definidos
```

---

## ❌ Se der erro, procure por:

### No Console do Navegador:

1. **Erro de JSON:**
   ```
   ❌ [Cliente] Resposta não é JSON!
   Resposta recebida: <!DOCTYPE...
   ```
   **Solução:** O servidor está retornando HTML. Veja os logs do servidor.

2. **Erro de conexão:**
   ```
   💥 [Cliente] Erro capturado: Failed to fetch
   ```
   **Solução:** Servidor não está rodando. Execute `npm run dev`

3. **Erro de autenticação:**
   ```
   ❌ [Cliente] Login falhou: {error: 'Senha incorreta'}
   ```
   **Solução:** Verifique se a senha é `Logos1.1` (case-sensitive)

### No Terminal do Servidor:

1. **Erro ao buscar usuário:**
   ```
   ❌ [Login API] Usuário não encontrado
   ```
   **Solução:** Execute `node scripts/verify-users.js` para verificar

2. **Erro fatal:**
   ```
   💥 [Login API] ERRO FATAL:
   [erro detalhado aqui]
   ```
   **Solução:** Copie TODO o erro e me envie

---

## 🆘 Checklist de Debug:

Execute estes comandos em ordem:

### 1. Verificar usuários:
```bash
node scripts/verify-users.js
```
**Deve mostrar:** `joao.viana` com role `DOCTOR`

### 2. Testar autenticação:
```bash
node scripts/test-auth.js
```
**Deve mostrar:** ✅ Todos os testes passaram

### 3. Testar API diretamente:
```bash
node scripts/test-login-api.js
```
**Deve mostrar:** ✅ TODOS OS PASSOS PASSARAM

---

## 📋 Informações para Debug:

Se ainda der erro, colete estas informações:

### 1. Terminal do Servidor:
- Copie TODOS os logs a partir de `🔐 [Login API]`
- Principalmente se tiver `💥 [Login API] ERRO FATAL:`

### 2. Console do Navegador (F12):
- Copie TODOS os logs a partir de `🔐 [Cliente]`
- Principalmente se tiver `💥 [Cliente] Erro capturado:`
- Vá para aba **"Network"** → `/api/auth/login` → **"Response"**

### 3. Estado do Sistema:
```bash
# Verificar se servidor está rodando
# Você deve ver: "Local: http://localhost:3000"

# Verificar usuários
node scripts/verify-users.js

# Verificar banco de dados
node scripts/check-system-status.js
```

---

## 💡 Dicas:

1. **Sempre limpe o cache** antes de testar
2. **Mantenha o console aberto** (F12) ao fazer login
3. **Veja AMBOS** os logs (navegador E servidor)
4. **Username é case-sensitive:** `joao.viana` (não `Joao.Viana`)
5. **Senha é case-sensitive:** `Logos1.1` (L maiúsculo)

---

## 🎯 Próximo Passo:

**Faça login agora e me envie:**

1. ✅ Se funcionou! (e vai aparecer a área médica)
2. ❌ Se deu erro:
   - Print do erro no navegador (F12 Console)
   - Logs do terminal do servidor
   - Qual mensagem de erro apareceu na tela

Estou aguardando seu retorno! 🚀
