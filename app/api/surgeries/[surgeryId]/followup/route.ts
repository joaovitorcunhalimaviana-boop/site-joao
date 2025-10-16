import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyJWT } from '@/lib/auth'

export async function POST(
  request: NextRequest,
  { params }: { params: { surgeryId: string } }
) {
  try {
    // Verificar autenticação
    const token = request.headers.get('authorization')?.replace('Bearer ', '') ||
                  request.cookies.get('auth-token')?.value

    if (!token) {
      return NextResponse.json(
        { error: 'Token de autenticação necessário' },
        { status: 401 }
      )
    }

    const decoded = verifyJWT(token)
    if (!decoded) {
      return NextResponse.json(
        { error: 'Token inválido' },
        { status: 401 }
      )
    }

    const { surgeryId } = params
    const followUpData = await request.json()

    // Verificar se a cirurgia existe
    const surgery = await prisma.surgery.findUnique({
      where: { id: surgeryId }
    })

    if (!surgery) {
      return NextResponse.json(
        { error: 'Cirurgia não encontrada' },
        { status: 404 }
      )
    }

    // Buscar o follow-up existente
    const existingFollowUp = await prisma.postOpFollowUp.findFirst({
      where: {
        surgeryId,
        followUpDay: followUpData.followUpDay
      }
    })

    if (!existingFollowUp) {
      return NextResponse.json(
        { error: 'Follow-up não encontrado' },
        { status: 404 }
      )
    }

    // Atualizar o follow-up com os dados coletados
    const updatedFollowUp = await prisma.postOpFollowUp.update({
      where: { id: existingFollowUp.id },
      data: {
        completed: true,
        completedAt: new Date(),
        data: JSON.stringify(followUpData)
      }
    })

    // Retornar o follow-up atualizado
    const response = {
      id: updatedFollowUp.id,
      surgeryId: updatedFollowUp.surgeryId,
      followUpDay: updatedFollowUp.followUpDay,
      scheduledDate: updatedFollowUp.scheduledDate.toISOString(),
      completed: updatedFollowUp.completed,
      completedAt: updatedFollowUp.completedAt?.toISOString(),
      data: JSON.parse(updatedFollowUp.data as string)
    }

    return NextResponse.json(response, { status: 200 })

  } catch (error) {
    console.error('Erro ao salvar follow-up:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { surgeryId: string } }
) {
  try {
    // Verificar autenticação
    const token = request.headers.get('authorization')?.replace('Bearer ', '') ||
                  request.cookies.get('auth-token')?.value

    if (!token) {
      return NextResponse.json(
        { error: 'Token de autenticação necessário' },
        { status: 401 }
      )
    }

    const decoded = verifyJWT(token)
    if (!decoded) {
      return NextResponse.json(
        { error: 'Token inválido' },
        { status: 401 }
      )
    }

    const { surgeryId } = params
    const { searchParams } = new URL(request.url)
    const followUpDay = searchParams.get('followUpDay')

    // Verificar se a cirurgia existe
    const surgery = await prisma.surgery.findUnique({
      where: { id: surgeryId }
    })

    if (!surgery) {
      return NextResponse.json(
        { error: 'Cirurgia não encontrada' },
        { status: 404 }
      )
    }

    // Buscar follow-ups
    const whereClause: any = { surgeryId }
    if (followUpDay) {
      whereClause.followUpDay = parseInt(followUpDay)
    }

    const followUps = await prisma.postOpFollowUp.findMany({
      where: whereClause,
      orderBy: { followUpDay: 'asc' }
    })

    // Formatar resposta
    const response = followUps.map(followUp => ({
      id: followUp.id,
      surgeryId: followUp.surgeryId,
      followUpDay: followUp.followUpDay,
      scheduledDate: followUp.scheduledDate.toISOString(),
      completed: followUp.completed,
      completedAt: followUp.completedAt?.toISOString(),
      data: followUp.data ? JSON.parse(followUp.data as string) : null
    }))

    return NextResponse.json(response)

  } catch (error) {
    console.error('Erro ao buscar follow-ups:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { surgeryId: string } }
) {
  try {
    // Verificar autenticação
    const token = request.headers.get('authorization')?.replace('Bearer ', '') ||
                  request.cookies.get('auth-token')?.value

    if (!token) {
      return NextResponse.json(
        { error: 'Token de autenticação necessário' },
        { status: 401 }
      )
    }

    const decoded = verifyJWT(token)
    if (!decoded) {
      return NextResponse.json(
        { error: 'Token inválido' },
        { status: 401 }
      )
    }

    const { surgeryId } = params
    const { followUpId, ...updateData } = await request.json()

    // Verificar se a cirurgia existe
    const surgery = await prisma.surgery.findUnique({
      where: { id: surgeryId }
    })

    if (!surgery) {
      return NextResponse.json(
        { error: 'Cirurgia não encontrada' },
        { status: 404 }
      )
    }

    // Verificar se o follow-up existe
    const existingFollowUp = await prisma.postOpFollowUp.findUnique({
      where: { id: followUpId }
    })

    if (!existingFollowUp || existingFollowUp.surgeryId !== surgeryId) {
      return NextResponse.json(
        { error: 'Follow-up não encontrado' },
        { status: 404 }
      )
    }

    // Atualizar o follow-up
    const updatedFollowUp = await prisma.postOpFollowUp.update({
      where: { id: followUpId },
      data: {
        completed: updateData.completed ?? existingFollowUp.completed,
        completedAt: updateData.completed ? new Date() : existingFollowUp.completedAt,
        data: updateData.data ? JSON.stringify(updateData.data) : existingFollowUp.data,
        scheduledDate: updateData.scheduledDate ? new Date(updateData.scheduledDate) : existingFollowUp.scheduledDate
      }
    })

    // Formatar resposta
    const response = {
      id: updatedFollowUp.id,
      surgeryId: updatedFollowUp.surgeryId,
      followUpDay: updatedFollowUp.followUpDay,
      scheduledDate: updatedFollowUp.scheduledDate.toISOString(),
      completed: updatedFollowUp.completed,
      completedAt: updatedFollowUp.completedAt?.toISOString(),
      data: updatedFollowUp.data ? JSON.parse(updatedFollowUp.data as string) : null
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('Erro ao atualizar follow-up:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}