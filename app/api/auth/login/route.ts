import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env['JWT_SECRET'] || 'your-secret-key'

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

    // Criar token JWT
    const token = jwt.sign(
      {
        username,
        name: user.name,
        role: user.role,
        areas: user.areas,
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    )

    // Criar resposta com cookie
    const response = NextResponse.json({
      success: true,
      user: {
        username,
        name: user.name,
        role: user.role,
        areas: user.areas,
      },
    })

    // Definir cookie de autenticação
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60, // 24 horas
    })

    console.log('✅ Login realizado com sucesso para:', username)
    console.log('✅ Token criado e cookie definido')

    return response
  } catch (error) {
    console.error('Erro no login:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
