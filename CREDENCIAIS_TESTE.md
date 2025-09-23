# Credenciais de Teste - Sistema Médico

## 🔐 Usuários Cadastrados

### Médico (Área Médica)
- **Email:** `joao.viana@clinica.com`
- **Senha:** `123456` ✅ **ATUALIZADA E TESTADA**
- **Função:** Doutor/Administrador
- **Especialidade:** Gastroenterologia
- **CRM:** CRM/SP 123456

### Secretária (Área Administrativa)
- **Email:** `secretaria@clinica.com`
- **Senha:** `123456` ✅ **ATUALIZADA E TESTADA**
- **Função:** Secretária

## 🌐 URLs de Acesso

- **Login Médico:** http://localhost:3000/login-medico
- **Área Médica:** http://localhost:3000/area-medica
- **Prisma Studio:** http://localhost:5555
- **Aplicação Principal:** http://localhost:3000

## 📝 Notas Importantes

1. As senhas estão hasheadas no banco de dados usando bcrypt
2. O sistema usa autenticação JWT com sessões estendidas (6 horas)
3. Todos os dados são armazenados no SQLite local (`dev.db`)
4. O sistema inclui detecção de duplicatas e bloqueio de horários

## 🔧 Comandos Úteis

```bash
# Visualizar banco de dados
npx prisma studio

# Resetar banco (se necessário)
npx prisma db push --force-reset

# Recriar usuários
node scripts/seed-users.js
```

---
*Documento gerado automaticamente - Sistema Médico v1.0*