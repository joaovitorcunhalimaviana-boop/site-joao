# Sistema de Dados Unificado - Especificação

## Problema Identificado

O usuário relatou múltiplos bancos de dados de pacientes causando:
- Erros nas funções por importar dados de bancos diferentes
- Inconsistências entre sistemas médico, secretarial e comunicação
- Confusão entre contatos de newsletter e pacientes médicos

## Solução: Arquitetura Unificada

### 1. Estrutura de Dados Clara

#### A) Contatos de Newsletter (SEM CPF)
- **Tabela**: `CommunicationContact`
- **Características**:
  - Apenas nome, email, WhatsApp, data nascimento
  - `emailNewsletter = true`
  - `emailSubscribed = true`
  - **NÃO aparecem** nos dashboards médico/secretarial
  - **NÃO podem** agendar consultas
  - Usados apenas para comunicação (newsletter, WhatsApp)

#### B) Pacientes Médicos (COM CPF)
- **Tabelas**: `CommunicationContact` + `MedicalPatient`
- **Características**:
  - CPF único gera número de prontuário automático
  - Aparecem em TODOS os dashboards (médico, secretarial, comunicação)
  - Podem agendar consultas
  - Dados completos: nome, CPF, telefone, celular, email, convênio

### 2. Fluxos de Cadastro

#### Newsletter (Página Inicial)
```
Usuário preenche: nome, email, WhatsApp, data nascimento
                    ↓
            Cria CommunicationContact
                    ↓
        emailNewsletter = true, emailSubscribed = true
                    ↓
        Pessoa recebe newsletter MAS não é paciente
```

#### Agendamento Público (COM CPF)
```
Usuário preenche: nome, CPF, telefone, celular, email, data nascimento
                    ↓
            Valida CPF único
                    ↓
        Cria/Atualiza CommunicationContact
                    ↓
        Cria MedicalPatient (com número prontuário)
                    ↓
        Pessoa vira paciente completo
```

#### Área Médica/Secretarial
```
Médico/Secretária cadastra paciente com CPF
                    ↓
        Cria/Atualiza CommunicationContact
                    ↓
        Cria MedicalPatient (com número prontuário)
                    ↓
        Paciente aparece em todos os sistemas
```

### 3. Regras de Negócio

#### Para Newsletter (sem CPF):
- ✅ Recebe comunicações
- ✅ Aparece na lista de WhatsApp
- ❌ NÃO aparece no dashboard médico
- ❌ NÃO aparece no dashboard secretarial
- ❌ NÃO pode agendar consultas
- ❌ NÃO tem prontuário

#### Para Pacientes Médicos (com CPF):
- ✅ Recebe comunicações
- ✅ Aparece na lista de WhatsApp
- ✅ Aparece no dashboard médico
- ✅ Aparece no dashboard secretarial
- ✅ Pode agendar consultas
- ✅ Tem número de prontuário único

### 4. Conversão Newsletter → Paciente

```
Pessoa cadastrada na newsletter decide agendar consulta
                    ↓
        Fornece CPF no formulário de agendamento
                    ↓
        Sistema encontra CommunicationContact existente por email
                    ↓
        Cria MedicalPatient linkado ao CommunicationContact
                    ↓
        Pessoa agora é paciente completo
```

### 5. Banco de Dados Único

#### Prisma Schema (PostgreSQL)
```prisma
model CommunicationContact {
  id                String   @id @default(cuid())
  name              String
  email             String?  @unique
  phone             String?
  whatsapp          String?
  birthDate         String?
  
  // Preferências de comunicação
  emailNewsletter   Boolean  @default(false)
  emailSubscribed   Boolean  @default(false)
  emailHealthTips   Boolean  @default(false)
  emailAppointments Boolean  @default(false)
  
  // Relacionamentos
  medicalPatient    MedicalPatient? // 1:1 opcional
  appointments      Appointment[]
  registrationSources RegistrationSource[]
}

model MedicalPatient {
  id                      String   @id @default(cuid())
  cpf                     String   @unique
  medicalRecordNumber     Int      @unique @default(autoincrement())
  fullName                String
  
  // Dados médicos
  insuranceType           InsuranceType
  insurancePlan           String?
  
  // Relacionamento obrigatório
  communicationContactId  String   @unique
  communicationContact    CommunicationContact @relation(fields: [communicationContactId], references: [id])
  
  appointments            Appointment[]
}
```

### 6. Queries Unificadas

#### Buscar Todos os Pacientes (para dashboards)
```typescript
const patients = await prisma.medicalPatient.findMany({
  include: {
    communicationContact: true,
    appointments: true
  }
})
```

#### Buscar Contatos Newsletter (para comunicação)
```typescript
const newsletterContacts = await prisma.communicationContact.findMany({
  where: {
    emailNewsletter: true,
    emailSubscribed: true
  }
})
```

#### Buscar Todos os Contatos WhatsApp
```typescript
const whatsappContacts = await prisma.communicationContact.findMany({
  where: {
    whatsapp: { not: null }
  },
  include: {
    medicalPatient: true // Para saber se é paciente ou só newsletter
  }
})
```

### 7. Implementação das Correções

#### A) Remover Dependências JSON
- ✅ Sistema já usa Prisma como principal
- 🔄 Manter JSONs apenas como backup
- ❌ Remover imports de funções JSON no código ativo

#### B) Validações de Agendamento
- ✅ Apenas pacientes com CPF podem agendar
- ✅ Uma consulta ativa por vez
- ✅ Nova consulta só após conclusão da anterior
- ✅ Não permitir agendamento no mesmo dia

#### C) Dashboards Corretos
- ✅ Dashboard médico: apenas MedicalPatient
- ✅ Dashboard secretarial: apenas MedicalPatient
- ✅ Lista newsletter: todos CommunicationContact com emailNewsletter=true
- ✅ Lista WhatsApp: todos CommunicationContact com whatsapp preenchido

## Benefícios da Solução

1. **Banco Único**: PostgreSQL com Prisma
2. **Sem Duplicação**: Cada pessoa tem um registro único
3. **Separação Clara**: Newsletter ≠ Paciente
4. **Integração Total**: Pacientes aparecem em todos os sistemas
5. **Performance**: Queries indexadas, sem loops em JSON
6. **Consistência**: Transações ACID garantem integridade
7. **Escalabilidade**: Suporta milhares de registros

## Status da Implementação

- ✅ Schema Prisma já existe e está correto
- ✅ Funções básicas já implementadas
- 🔄 Necessário ajustar validações de agendamento
- 🔄 Necessário limpar dependências JSON
- 🔄 Necessário testar fluxos completos

O sistema já está 80% implementado corretamente. As correções restantes são ajustes nas regras de negócio e limpeza de código legado.