import { NextRequest, NextResponse } from 'next/server'
import { consultations } from '../data'

function verifyAuth(request: NextRequest): boolean {
  try {
    const token = request.cookies.get('auth-token')?.value
    if (!token) {
      console.log('No auth token found')
      return false
    }

    const decoded = Buffer.from(token, 'base64').toString('utf-8')
    if (!decoded) {
      console.log('Failed to decode token')
      return false
    }

    const tokenData = JSON.parse(decoded)
    if (!tokenData || typeof tokenData !== 'object') {
      console.log('Invalid token data')
      return false
    }

    if (tokenData.expires && new Date(tokenData.expires) < new Date()) {
      console.log('Token expired')
      return false
    }

    return true
  } catch (error) {
    console.error('Auth verification error:', error)
    return false
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!verifyAuth(request)) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const { id } = await params
  const consultation = consultations.find(c => c.id === id)
  if (!consultation) {
    return NextResponse.json(
      { error: 'Consulta não encontrada' },
      { status: 404 }
    )
  }

  return NextResponse.json(consultation)
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!verifyAuth(request)) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { id } = await params
    const consultationIndex = consultations.findIndex(c => c.id === id)

    if (consultationIndex === -1) {
      return NextResponse.json(
        { error: 'Consulta não encontrada' },
        { status: 404 }
      )
    }

    consultations[consultationIndex] = {
      ...consultations[consultationIndex],
      ...body,
      updatedAt: new Date().toISOString(),
    }

    return NextResponse.json(consultations[consultationIndex])
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro ao atualizar consulta' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!verifyAuth(request)) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const { id } = await params
  const consultationIndex = consultations.findIndex(c => c.id === id)

  if (consultationIndex === -1) {
    return NextResponse.json(
      { error: 'Consulta não encontrada' },
      { status: 404 }
    )
  }

  consultations.splice(consultationIndex, 1)
  return NextResponse.json({ message: 'Consulta removida com sucesso' })
}
