import { NextRequest, NextResponse } from 'next/server'

// Usuários simples hardcoded
const users = {
  'joao.viana': {
    password: 'Logos1.1',
    name: 'Dr. João Vítor da Cunha Lima Viana',
    role: 'admin', // Pode acessar tudo
    areas: ['medica', 'secretaria'],
  },
  'zeta.secretaria': {
    password: 'zeta123',
    name: 'Zeta Secretária',
    role: 'secretary', // Só área da secretária
    areas: ['secretaria'],
  },
}

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json()

    // Verificar se o usuário existe
    const user = users[username as keyof typeof users]

    if (!user || user.password !== password) {
      return NextResponse.json(
        { error: 'Usuário ou senha inválidos' },
        { status: 401 }
      )
    }

    // Login bem-sucedido - retornar dados do usuário
    return NextResponse.json({
      success: true,
      user: {
        username,
        name: user.name,
        role: user.role,
        areas: user.areas,
      },
    })
  } catch (error) {
    console.error('Erro no login:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
