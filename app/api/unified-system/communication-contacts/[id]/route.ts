import { NextRequest, NextResponse } from 'next/server'
import { getCommunicationContactById } from '@/lib/unified-patient-system-prisma'
import { AuthMiddleware } from '@/lib/auth-middleware'

// GET - Buscar contato de comunicação por ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  // Autenticar requisição
  const auth = await AuthMiddleware.authenticate(request)
  if (!auth.success || !auth.user) {
    return auth.response || NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  }

  // Verificar permissões (apenas médicos, secretárias e admins)
  if (!['DOCTOR', 'SECRETARY', 'ADMIN'].includes(auth.user.role)) {
    return NextResponse.json({ error: 'Sem permissão para acessar contatos' }, { status: 403 })
  }

  try {
    const { id } = await params

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message: 'ID do contato é obrigatório',
        },
        { status: 400 }
      )
    }

    const contact = await getCommunicationContactById(id)

    if (!contact) {
      return NextResponse.json(
        {
          success: false,
          message: 'Contato não encontrado',
        },
        { status: 404 }
      )
    }

    return NextResponse.json(
      {
        success: true,
        contact,
        message: 'Contato encontrado com sucesso',
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('❌ Erro ao buscar contato de comunicação:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Erro interno do servidor',
      },
      { status: 500 }
    )
  }
}