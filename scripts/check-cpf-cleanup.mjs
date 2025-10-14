#!/usr/bin/env node
// Verifica registros remanescentes relacionados a um CPF e (opcionalmente) limpa fontes de registro
// Uso:
//   node scripts/check-cpf-cleanup.mjs --cpf "05166083474" [--contactId "<id>"] [--fix]

import { PrismaClient } from '@prisma/client';

// Helper para parse de args simples
function parseArgs(argv) {
  const args = {};
  for (let i = 2; i < argv.length; i++) {
    const token = argv[i];
    if (token.startsWith('--')) {
      const key = token.slice(2);
      const next = argv[i + 1];
      if (!next || next.startsWith('--')) {
        args[key] = true;
      } else {
        args[key] = next;
        i++;
      }
    }
  }
  return args;
}

const prisma = new PrismaClient();

async function main() {
  const { cpf, contactId, fix } = parseArgs(process.argv);
  if (!cpf) {
    console.error('Erro: parâmetro --cpf é obrigatório');
    process.exit(1);
  }

  console.log('=== Verificação por CPF ===');
  console.log('CPF alvo:', cpf);
  if (contactId) console.log('ContactId alvo:', contactId);
  console.log('Aplicar limpeza (fix):', Boolean(fix));

  // 1) Localiza pacientes pelo CPF
  const patients = await prisma.medicalPatient.findMany({
    where: { cpf },
    select: { id: true, fullName: true, isActive: true, communicationContactId: true },
  });

  console.log(`Pacientes encontrados: ${patients.length}`);
  for (const p of patients) {
    console.log(`- ${p.id} | ${p.fullName} | ativo=${p.isActive} | contactId=${p.communicationContactId}`);
  }

  const patientIds = patients.map((p) => p.id);

  // 2) Verifica contato informado (se existir)
  let contact = null;
  if (contactId) {
    contact = await prisma.communicationContact.findUnique({ where: { id: contactId } });
    console.log('Contato existe?', contact ? 'SIM' : 'NÃO');
  }

  // 3) Agendamentos vinculados ao paciente ou contato
  const appointments = await prisma.appointment.findMany({
    where: {
      OR: [
        patientIds.length ? { medicalPatientId: { in: patientIds } } : undefined,
        contactId ? { communicationContactId: contactId } : undefined,
      ].filter(Boolean),
    },
    select: { id: true },
  });
  console.log('Agendamentos remanescentes:', appointments.length);

  // 4) Consultas vinculadas aos pacientes
  const consultations = await prisma.consultation.findMany({
    where: patientIds.length ? { medicalPatientId: { in: patientIds } } : { id: '' },
    select: { id: true },
  });
  console.log('Consultas remanescentes:', consultations.length);

  // 5) Prontuários/Registros médicos vinculados aos pacientes
  const records = await prisma.medicalRecord.findMany({
    where: patientIds.length ? { medicalPatientId: { in: patientIds } } : { id: '' },
    select: { id: true },
  });
  console.log('Registros médicos remanescentes:', records.length);

  // 6) Fontes de registro vinculadas ao contato
  let regSources = [];
  if (contactId) {
    // Algumas bases usam nome RegistrationSource; ajuste conforme seu schema
    try {
      regSources = await prisma.registrationSource.findMany({
        where: { communicationContactId: contactId },
        select: { id: true },
      });
      console.log('Fontes de registro remanescentes:', regSources.length);
    } catch (e) {
      console.log('Tabela registrationSource não encontrada ou nome divergente; ignorando verificação específica.');
    }
  }

  // Se fix estiver habilitado, remover fontes de registro e quaisquer agendamentos órfãos do contato
  if (fix) {
    // Remove fontes de registro vinculadas ao contato
    if (contactId && regSources.length) {
      try {
        const del = await prisma.registrationSource.deleteMany({ where: { communicationContactId: contactId } });
        console.log('Fontes de registro removidas:', del.count);
      } catch (e) {
        console.log('Falha ao remover registrationSource; possivelmente tabela não existe.');
      }
    }

    // Remove agendamentos vinculados ao contato (se ainda existirem, improvável após cascade)
    if (contactId && appointments.length) {
      const delApp = await prisma.appointment.deleteMany({ where: { communicationContactId: contactId } });
      console.log('Agendamentos removidos pelo contactId:', delApp.count);
    }
  }

  console.log('=== Conclusão ===');
  if (!patients.length && !contact && !appointments.length && !consultations.length && !records.length && (!regSources.length || !contactId)) {
    console.log('Nenhum resíduo encontrado para o CPF informado. Ambiente limpo para novo cadastro.');
  } else {
    console.log('Verificação concluída. Veja os totais acima.');
  }
}

main()
  .catch((err) => {
    console.error('Erro na verificação:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });