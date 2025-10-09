import { NextResponse } from 'next/server'
import { prisma } from '@/lib/database'

// DELETE - Limpar todos os schedule slots
export async function DELETE() {
  try {
    // Deletar todos os schedule slots
    const result = await prisma.scheduleSlot.deleteMany({})

    console.log(` ${result.count} schedule slots removidos`)

    return NextResponse.json({
      success: true,
      message: `${result.count} horários removidos com sucesso`,
      deletedCount: result.count,
    })
  } catch (error) {
    console.error(' Erro ao limpar schedule slots:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Erro interno do servidor ao limpar horários',
      },
      { status: 500 }
    )
  }
}
