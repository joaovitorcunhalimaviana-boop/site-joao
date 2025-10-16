import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...')

  // Criar usuário administrador padrão
  const adminPassword = await hash('admin123', 12)

  const admin = await prisma.user.upsert({
    where: { email: 'admin@clinica.com' },
    update: {},
    create: {
      username: 'admin',
      email: 'admin@clinica.com',
      name: 'Administrador',
      password: adminPassword,
      role: 'ADMIN',
      isActive: true,
    },
  })

  console.log('✅ Usuário administrador criado:', admin.email)

  // Criar médico padrão
  const doctorPassword = await hash('doctor123', 12)

  const doctor = await prisma.user.upsert({
    where: { email: 'medico@clinica.com' },
    update: {},
    create: {
      username: 'medico',
      email: 'medico@clinica.com',
      name: 'Dr. João Silva',
      password: doctorPassword,
      role: 'DOCTOR',
      isActive: true,
      crm: '12345-SP',
    },
  })

  console.log('✅ Médico padrão criado:', doctor.email)

  // Criar secretária padrão
  const secretaryPassword = await hash('secretary123', 12)

  const secretary = await prisma.user.upsert({
    where: { email: 'secretaria@clinica.com' },
    update: {},
    create: {
      username: 'secretaria',
      email: 'secretaria@clinica.com',
      name: 'Maria Santos',
      password: secretaryPassword,
      role: 'SECRETARY',
      isActive: true,
    },
  })

  console.log('✅ Secretária padrão criada:', secretary.email)

  // Criar alguns contatos de comunicação de exemplo (dados fictícios)
  const communicationContacts = [
    {
      name: 'Ana Silva',
      email: 'ana.silva@email.com',
      whatsapp: '11987654321',
      birthDate: '1985-03-15',
    },
    {
      name: 'Carlos Santos',
      email: 'carlos.santos@email.com',
      whatsapp: '11987654322',
      birthDate: '1978-07-22',
    },
  ]

  const createdContacts = []
  for (const contactData of communicationContacts) {
    // Primeiro, verificar se já existe um contato com este email
    const existingContact = await prisma.communicationContact.findFirst({
      where: { email: contactData.email }
    })
    
    let contact
    if (existingContact) {
      contact = existingContact
    } else {
      contact = await prisma.communicationContact.create({
        data: contactData
      })
    }
    
    createdContacts.push(contact)
    console.log('✅ Contato de comunicação criado:', contact.name)
  }

  // Criar alguns pacientes médicos de exemplo
  const medicalPatients = [
    {
      communicationContactId: createdContacts[0].id,
      cpf: '12345678901',
      medicalRecordNumber: 1001,
      fullName: 'Ana Silva',
      rg: '123456789',
      address: 'Rua das Flores, 123',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '01234567',
      insuranceType: 'UNIMED',
      insurancePlan: 'Unimed Nacional',
      createdBy: doctor.id,
    },
    {
      communicationContactId: createdContacts[1].id,
      cpf: '98765432109',
      medicalRecordNumber: 1002,
      fullName: 'Carlos Santos',
      rg: '987654321',
      address: 'Av. Paulista, 456',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '01310100',
      insuranceType: 'OUTRO',
      insurancePlan: 'Bradesco Saúde',
      createdBy: doctor.id,
    },
  ]

  const createdMedicalPatients = []
  for (const patientData of medicalPatients) {
    const patient = await prisma.medicalPatient.upsert({
      where: { cpf: patientData.cpf },
      update: {},
      create: patientData,
    })
    createdMedicalPatients.push(patient)
    console.log('✅ Paciente médico criado:', patient.fullName)
  }

  // Criar alguns agendamentos de exemplo
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  tomorrow.setHours(9, 0, 0, 0)

  const nextWeek = new Date()
  nextWeek.setDate(nextWeek.getDate() + 7)
  nextWeek.setHours(14, 30, 0, 0)

  // Criar appointment para Ana Silva
  await prisma.appointment.create({
    data: {
      communicationContactId: createdContacts[0].id,
      medicalPatientId: createdMedicalPatients[0].id,
      appointmentDate: nextWeek.toISOString().split('T')[0],
      appointmentTime: '09:00',
      type: 'CONSULTATION',
      status: 'SCHEDULED',
      notes: 'Consulta de rotina',
    },
  })
  console.log('✅ Agendamento criado para Ana Silva')

  // Criar appointment para Carlos Santos
  await prisma.appointment.create({
    data: {
      communicationContactId: createdContacts[1].id,
      medicalPatientId: createdMedicalPatients[1].id,
      appointmentDate: nextWeek.toISOString().split('T')[0],
      appointmentTime: '14:30',
      type: 'FOLLOW_UP',
      status: 'SCHEDULED',
      notes: 'Retorno pós-exame',
    },
  })
  console.log('✅ Agendamento criado para Carlos Santos')

  // Criar procedimentos TUSS de exemplo
  const tussProcedures = [
    {
      tussCode: '31101015',
      cbhpmCode: '31101015',
      description: 'Hemorroidectomia',
      category: 'ORIFICIAL',
      value: 1200.00,
      isActive: true
    },
    {
      tussCode: '31101023',
      cbhpmCode: '31101023', 
      description: 'Fistulotomia anal',
      category: 'ORIFICIAL',
      value: 800.00,
      isActive: true
    },
    {
      tussCode: '31101031',
      cbhpmCode: '31101031',
      description: 'Ressecção de cisto pilonidal',
      category: 'PILONIDAL',
      value: 1500.00,
      isActive: true
    },
    {
      tussCode: '31301010',
      cbhpmCode: '31301010',
      description: 'Colectomia parcial',
      category: 'COLECTOMY',
      value: 3500.00,
      isActive: true
    },
    {
      tussCode: '31301028',
      cbhpmCode: '31301028',
      description: 'Colectomia total',
      category: 'COLECTOMY',
      value: 5000.00,
      isActive: true
    }
  ]

  for (const procedure of tussProcedures) {
    const createdProcedure = await prisma.tussProcedure.upsert({
      where: { tussCode: procedure.tussCode },
      update: {},
      create: procedure
    })
    console.log('✅ Procedimento TUSS criado:', createdProcedure.description)
  }

  console.log('🎉 Seed concluído com sucesso!')
  console.log('\n📋 Credenciais de acesso:')
  console.log('Admin: admin@clinica.com / admin123')
  console.log('Médico: medico@clinica.com / doctor123')
  console.log('Secretária: secretaria@clinica.com / secretary123')
}

main()
  .catch(e => {
    console.error('❌ Erro no seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
