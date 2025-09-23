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
      isActive: true
    }
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
      crm: '12345-SP'
    }
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
      isActive: true
    }
  })

  console.log('✅ Secretária padrão criada:', secretary.email)

  // Criar alguns pacientes de exemplo (dados fictícios)
  const patients = [
    {
      name: 'Ana Silva',
      cpf: '123.456.789-01',
      email: 'ana.silva@email.com',
      phone: 'encrypted_phone_1',
      whatsapp: 'encrypted_whatsapp_1',
      birthDate: new Date('1985-03-15'),
      address: 'Rua das Flores, 123',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '01234-567',
      insuranceType: 'unimed',
      insurancePlan: 'Unimed Nacional'
    },
    {
      name: 'Carlos Santos',
      cpf: '987.654.321-09',
      email: 'carlos.santos@email.com',
      phone: 'encrypted_phone_2',
      whatsapp: 'encrypted_whatsapp_2',
      birthDate: new Date('1978-07-22'),
      address: 'Av. Paulista, 456',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '01310-100',
      insuranceType: 'outro',
      insurancePlan: 'Bradesco Saúde'
    }
  ]

  for (const patientData of patients) {
    const patient = await prisma.patient.upsert({
      where: { cpf: patientData.cpf },
      update: {},
      create: patientData
    })
    console.log('✅ Paciente criado:', patient.name)
  }

  // Criar alguns agendamentos de exemplo
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  tomorrow.setHours(9, 0, 0, 0)

  const nextWeek = new Date()
  nextWeek.setDate(nextWeek.getDate() + 7)
  nextWeek.setHours(14, 30, 0, 0)

  const appointments = [
    {
      patientId: (await prisma.patient.findFirst({ where: { name: 'Ana Silva' } }))?.id!,
      doctorId: doctor.id,
      date: tomorrow,
      time: '09:00',
      type: 'CONSULTATION' as const,
      status: 'SCHEDULED' as const,
      notes: 'Consulta de rotina'
    },
    {
      patientId: (await prisma.patient.findFirst({ where: { name: 'Carlos Santos' } }))?.id!,
      doctorId: doctor.id,
      date: nextWeek,
      time: '14:30',
      type: 'FOLLOW_UP' as const,
      status: 'SCHEDULED' as const,
      notes: 'Retorno pós-exame'
    }
  ]

  for (const appointmentData of appointments) {
    const appointment = await prisma.appointment.create({
      data: appointmentData
    })
    console.log('✅ Agendamento criado para:', appointment.date)
  }

  console.log('🎉 Seed concluído com sucesso!')
  console.log('\n📋 Credenciais de acesso:')
  console.log('Admin: admin@clinica.com / admin123')
  console.log('Médico: medico@clinica.com / doctor123')
  console.log('Secretária: secretaria@clinica.com / secretary123')
}

main()
  .catch((e) => {
    console.error('❌ Erro no seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })