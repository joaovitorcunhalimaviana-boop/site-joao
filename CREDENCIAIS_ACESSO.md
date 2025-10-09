# 🔑 Credenciais de Acesso - Sistema Médico

**Data da última atualização**: 09/10/2025

---

## ✅ Logins Válidos

### 📘 Área Médica

**Login**: `joao.viana`
**Senha**: `Logos1.1`
**URL de acesso**: http://localhost:3000/login-medico
**Redirecionamento**: /area-medica

---

### 📗 Área da Secretária

**Login**: `zeta.secretaria`
**Senha**: `zeta123`
**URL de acesso**: http://localhost:3000/login-secretaria
**Redirecionamento**: /area-secretaria

---

## 🚫 Usuários Removidos

Todos os seguintes usuários foram **EXCLUÍDOS** do sistema:

- ❌ admin@clinica.com
- ❌ medico@clinica.com
- ❌ secretaria@clinica.com
- ❌ joao.viana@clinica.com
- ❌ zeta.secretaria@clinica.com

**Apenas os logins simples (sem formato de email) são válidos agora.**

---

## 🧪 Como Testar

### Opção 1: Testar via Script
```bash
cd site-joao-master
node scripts/test-auth.js
```

### Opção 2: Testar no Navegador
1. Inicie o servidor:
   ```bash
   npm run dev
   ```

2. Acesse a área desejada:
   - Médica: http://localhost:3000/login-medico
   - Secretária: http://localhost:3000/login-secretaria

3. Digite as credenciais conforme descrito acima

4. Clique em "Entrar"

5. Você será redirecionado para a área correspondente

---

## 📊 Informações do Sistema

### Banco de Dados
- **Usuários cadastrados**: 2 (1 médico + 1 secretária)
- **Formato de login**: Username simples (sem email)
- **Autenticação**: JWT com cookies HTTP-only
- **2FA**: Desabilitado

### Status de Autenticação
✅ Sistema de login funcionando
✅ Redirecionamento baseado em role
✅ Cookies de sessão configurados
✅ Validação de senha bcrypt (12 rounds)

---

## 🛠️ Scripts Disponíveis

| Script | Descrição |
|--------|-----------|
| `scripts/test-auth.js` | Testa autenticação dos usuários |
| `scripts/verify-users.js` | Lista todos os usuários cadastrados |
| `scripts/cleanup-and-restore-users.js` | Limpa e restaura usuários padrão |

---

## ⚠️ Importante

1. **NÃO** use emails no campo de login - use apenas o username
2. As senhas são **case-sensitive** (Logos1.1 ≠ logos1.1)
3. Após 5 tentativas incorretas, a conta é bloqueada por 15 minutos
4. Os cookies expiram em 7 dias

---

## 🔄 Para Resetar Usuários

Se precisar resetar os usuários para o estado atual:

```bash
cd site-joao-master
node scripts/cleanup-and-restore-users.js
```

Este script irá:
1. Remover todos os usuários existentes
2. Criar apenas os 2 usuários válidos (médico e secretária)
3. Configurar as credenciais corretas

---

**✅ Sistema pronto para uso!**
