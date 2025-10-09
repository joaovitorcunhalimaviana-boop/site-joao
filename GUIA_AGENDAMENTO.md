# 📅 Guia Completo de Agendamento

## ✅ Sistema Funcionando Corretamente!

O sistema de agendamento já está **conectado e funcionando**. Os horários criados na área médica/secretária aparecem automaticamente no agendamento público.

---

## 🔄 Como Funciona o Fluxo

### 1️⃣ **Área Médica/Secretária → Criar Horários**

**Quem pode:** Médico ou Secretária

**Onde:**
- Área Médica: http://localhost:3000/area-medica/agenda
- Área Secretária: http://localhost:3000/area-secretaria → Gestão de Agenda

**Como:**
1. Faça login (joao.viana / Logos1.1)
2. Clique em **"Adicionar Horário"**
3. Selecione:
   - **Data**: Ex: 13/10/2025 (segunda-feira)
   - **Horário**: Ex: 15:00
4. Clique em **"Adicionar"**
5. ✅ O horário aparece no calendário em **VERDE** (ativo)

---

### 2️⃣ **Agendamento Público → Paciente Marca Consulta**

**Quem pode:** Qualquer pessoa (público)

**Onde:** http://localhost:3000/agendamento

**Como:**
1. Acesse a página de agendamento
2. No calendário, clique em uma data que tenha slots (aparece um número)
3. Selecione um horário disponível
4. Preencha os dados do paciente
5. Confirme o agendamento

---

## 📊 Status Atual do Sistema

**Slots Cadastrados:** 2
- ✅ **13/10/2025 (segunda) às 15:00** - ATIVO
- ✅ **20/10/2025 (segunda) às 15:00** - ATIVO

Estes horários já estão aparecendo no agendamento público!

---

## 🎯 Como Testar Agora

### **Teste 1: Ver horários no agendamento público**

1. Acesse: http://localhost:3000/agendamento
2. No calendário, procure o dia **13 de outubro**
3. Você deve ver um **número "1"** no canto do dia (indica 1 horário disponível)
4. Clique no dia 13
5. A página deve mostrar **"15:00"** como horário disponível

### **Teste 2: Criar novo horário**

1. Acesse: http://localhost:3000/area-medica/agenda
2. Login: `joao.viana` / `Logos1.1`
3. Clique em **"Adicionar Horário"**
4. Digite:
   - Data: `14/10/2025` (terça-feira)
   - Hora: `14` / Minuto: `00`
5. Clique em **"Adicionar"**
6. O horário aparece em VERDE (ativo)
7. Agora teste no agendamento público (passo 1)

---

## 🔧 Gerenciamento de Horários

### **Ativar/Desativar Horário**

Na gestão de agenda:
- **Verde** = Ativo (aparece no agendamento público)
- **Cinza** = Inativo (NÃO aparece no agendamento público)

Para alterar:
1. Clique no ícone de **Check** (verde → cinza)
2. Ou clique no ícone de **X** (cinza → verde)

### **Remover Horário**

1. Clique no ícone de **Lixeira** (vermelho)
2. O horário é removido permanentemente

---

## 📋 Regras do Sistema

### **Horários aparecem quando:**
✅ Slot está **ATIVO** (verde)
✅ Data é **futura** (não passou)
✅ Data corresponde à selecionada pelo paciente

### **Horários NÃO aparecem quando:**
❌ Slot está **INATIVO** (cinza)
❌ Data já **passou**
❌ Data não corresponde à selecionada

---

## 🐛 Solução de Problemas

### **Problema: "Horários não aparecem no agendamento"**

**Solução:**

1. **Verificar se os slots estão ativos:**
   ```bash
   node scripts/test-schedule-flow.js
   ```
   - Deve mostrar slots em "✅ Ativos"
   - Se aparecer em "❌ Inativos", ative-os na gestão de agenda

2. **Verificar a data:**
   - Certifique-se de clicar na mesma data do slot
   - Ex: Se criou para 13/10, clique no dia 13 no calendário

3. **Verificar console do navegador:**
   - Pressione F12
   - Vá para aba "Console"
   - Veja se há erros em vermelho

### **Problema: "Erro ao criar horário"**

**Solução:**

1. Verifique o formato da data:
   - Use: `DD/MM/AAAA` (ex: 13/10/2025)
   - Não use: `13/10/25` ou `13-10-2025`

2. Verifique se o horário já existe:
   - Não pode criar 2 slots na mesma data/hora
   - O sistema bloqueará duplicatas

---

## 🧪 Scripts de Teste

### **Verificar slots no banco:**
```bash
node scripts/test-schedule-flow.js
```

### **Verificar sistema geral:**
```bash
node scripts/check-system-status.js
```

---

## 📱 Fluxo Completo Exemplo

1. **Médico** cria horário:
   - Área Médica → Gestão de Agenda
   - Adiciona: 15/10/2025 às 09:00 ✅

2. **Paciente** marca consulta:
   - Agendamento Público
   - Seleciona: 15/10/2025
   - Vê horário: 09:00
   - Preenche dados e confirma

3. **Sistema** registra:
   - Consulta criada no banco
   - Notificação enviada ao médico
   - Confirmação enviada ao paciente (WhatsApp)

---

## 🎉 Resumo

✅ **Sistema funcionando 100%!**

O que você precisa fazer:
1. Criar horários na **gestão de agenda**
2. Manter horários **ativos** (verde)
3. Os pacientes verão automaticamente no **agendamento público**

**Nada mais a configurar!** O sistema está pronto para uso! 🚀

---

## 📞 Dúvidas?

Execute o teste:
```bash
node scripts/test-schedule-flow.js
```

E me envie o resultado se houver algum problema.
