import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      fullName,
      email,
      whatsapp,
      insuranceType,
      selectedDate,
      selectedTime,
    } = body

    // Validar dados obrigatórios
    if (!fullName || !selectedDate || !selectedTime) {
      return NextResponse.json(
        { error: 'Nome, data e horário são obrigatórios' },
        { status: 400 }
      )
    }

    // Criar mensagem formatada
    const message =
      `🏥 NOVO AGENDAMENTO\n\n` +
      `👤 Paciente: ${fullName}\n` +
      `📧 Email: ${email || 'Não informado'}\n` +
      `📱 WhatsApp: ${whatsapp || 'Não informado'}\n` +
      `🏥 Convênio: ${insuranceType || 'Particular'}\n` +
      `📅 Data: ${selectedDate}\n` +
      `⏰ Horário: ${selectedTime}\n\n` +
      `💬 Link WhatsApp: https://wa.me/5583991221599?text=${encodeURIComponent(
        `Olá Dr. João! Gostaria de confirmar meu agendamento:\n\n` +
          `👤 Nome: ${fullName}\n` +
          `📅 Data: ${selectedDate}\n` +
          `⏰ Horário: ${selectedTime}\n` +
          `🏥 Convênio: ${insuranceType || 'Particular'}`
      )}`

    console.log('\n' + '='.repeat(60))
    console.log('📱 NOTIFICAÇÃO DE AGENDAMENTO')
    console.log('='.repeat(60))
    console.log(message)
    console.log('='.repeat(60) + '\n')

    // Retornar dados para notificação do navegador
    return NextResponse.json({
      success: true,
      message: 'Notificação enviada com sucesso!',
      notification: {
        title: '🏥 Novo Agendamento!',
        body: `${fullName} - ${selectedDate} às ${selectedTime}`,
        data: {
          fullName,
          email,
          whatsapp,
          insuranceType,
          selectedDate,
          selectedTime,
          whatsappLink: `https://wa.me/5583991221599?text=${encodeURIComponent(
            `Olá Dr. João! Gostaria de confirmar meu agendamento:\n\n` +
              `👤 Nome: ${fullName}\n` +
              `📅 Data: ${selectedDate}\n` +
              `⏰ Horário: ${selectedTime}\n` +
              `🏥 Convênio: ${insuranceType || 'Particular'}`
          )}`,
        },
      },
    })
  } catch (error) {
    console.error('❌ Erro na API de notificação:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
