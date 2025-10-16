import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyJWT } from '@/lib/auth'

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

    // Buscar cirurgia com follow-ups
    const surgery = await prisma.surgery.findUnique({
      where: {
        id: surgeryId
      },
      include: {
        patient: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true
          }
        },
        postOpFollowUps: {
          orderBy: {
            followUpDay: 'asc'
          }
        }
      }
    })

    if (!surgery) {
      return NextResponse.json(
        { error: 'Cirurgia não encontrada' },
        { status: 404 }
      )
    }

    // Formatar resposta
    const response = {
      id: surgery.id,
      patientId: surgery.patientId,
      patientName: surgery.patient.name,
      patientEmail: surgery.patient.email,
      patientPhone: surgery.patient.phone,
      date: surgery.date.toISOString(),
      time: surgery.time,
      type: surgery.type,
      status: surgery.status,
      notes: surgery.notes,
      postOpFollowUps: surgery.postOpFollowUps.map(followUp => ({
        id: followUp.id,
        followUpDay: followUp.followUpDay,
        scheduledDate: followUp.scheduledDate.toISOString(),
        completed: followUp.completed,
        completedAt: followUp.completedAt?.toISOString(),
        data: followUp.data ? JSON.parse(followUp.data as string) : null
      }))
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('Erro ao buscar cirurgia:', error)
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
    const body = await request.json()

    // Verificar se a cirurgia existe
    const existingSurgery = await prisma.surgery.findUnique({
      where: { id: surgeryId }
    })

    if (!existingSurgery) {
      return NextResponse.json(
        { error: 'Cirurgia não encontrada' },
        { status: 404 }
      )
    }

    // Atualizar cirurgia
    const updatedSurgery = await prisma.surgery.update({
      where: { id: surgeryId },
      data: {
        date: body.date ? new Date(body.date) : undefined,
        time: body.time,
        type: body.type,
        status: body.status,
        notes: body.notes,
        updatedAt: new Date()
      },
      include: {
        patient: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true
          }
        },
        postOpFollowUps: {
          orderBy: {
            followUpDay: 'asc'
          }
        }
      }
    })

    // Formatar resposta
    const response = {
      id: updatedSurgery.id,
      patientId: updatedSurgery.patientId,
      patientName: updatedSurgery.patient.name,
      patientEmail: updatedSurgery.patient.email,
      patientPhone: updatedSurgery.patient.phone,
      date: updatedSurgery.date.toISOString(),
      time: updatedSurgery.time,
      type: updatedSurgery.type,
      status: updatedSurgery.status,
      notes: updatedSurgery.notes,
      postOpFollowUps: updatedSurgery.postOpFollowUps.map(followUp => ({
        id: followUp.id,
        followUpDay: followUp.followUpDay,
        scheduledDate: followUp.scheduledDate.toISOString(),
        completed: followUp.completed,
        completedAt: followUp.completedAt?.toISOString(),
        data: followUp.data ? JSON.parse(followUp.data as string) : null
      }))
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('Erro ao atualizar cirurgia:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function DELETE(
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

    // Verificar se a cirurgia existe
    const existingSurgery = await prisma.surgery.findUnique({
      where: { id: surgeryId }
    })

    if (!existingSurgery) {
      return NextResponse.json(
        { error: 'Cirurgia não encontrada' },
        { status: 404 }
      )
    }

    // Deletar follow-ups primeiro (devido à foreign key)
    await prisma.postOpFollowUp.deleteMany({
      where: { surgeryId }
    })

    // Deletar cirurgia
    await prisma.surgery.delete({
      where: { id: surgeryId }
    })

    return NextResponse.json(
      { message: 'Cirurgia deletada com sucesso' },
      { status: 200 }
    )

  } catch (error) {
    console.error('Erro ao deletar cirurgia:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}