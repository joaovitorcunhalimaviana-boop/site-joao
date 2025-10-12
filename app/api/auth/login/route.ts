import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const prisma = new PrismaClient()

const JWT_SECRET = process.env['JWT_SECRET'] || 'your-super-secret-jwt-key-change-in-production'

export async function POST(request: NextRequest) {
  try {
    console.log('🔐 [Login API] Iniciando processo de login...')

    // Tentar diferentes formas de obter os dados
    let credentials: any = {}
    let email: string = ''
    let password: string = ''

    try {
      // Primeiro, tentar JSON
      credentials = await request.json()
      console.log('📝 [Login API] Dados JSON recebidos:', credentials)
      
      email = credentials.email || credentials.username || ''
      password = credentials.password || ''
    } catch (jsonError) {
      console.log('⚠️ [Login API] Erro ao parsear JSON, tentando FormData...')
      
      try {
        // Se JSON falhar, tentar FormData
        const formData = await request.formData()
        email = formData.get('email')?.toString() || formData.get('username')?.toString() || ''
        password = formData.get('password')?.toString() || ''
        console.log('📝 [Login API] Dados FormData recebidos:', { email: email ? 'presente' : 'ausente' })
      } catch (formError) {
        console.error('❌ [Login API] Erro ao parsear FormData:', formError)
      }
    }

    console.log('📝 [Login API] Credenciais finais:', { 
      email: email ? 'presente' : 'ausente',
      password: password ? 'presente' : 'ausente',
      emailValue: email
    })

    // Validar dados
    if (!email || !password) {
      console.log('❌ [Login API] Dados incompletos')
      return NextResponse.json(
        { error: 'Email e senha são obrigatórios' },
        { status: 400 }
      )
    }

    // Buscar usuário
    console.log('🔍 [Login API] Buscando usuário...')
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: email },
          { username: email }
        ]
      }
    })

    if (!user) {
      console.log('❌ [Login API] Usuário não encontrado')
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 401 }
      )
    }

    console.log('✅ [Login API] Usuário encontrado:', user.username)

    // Verificar se está ativo
    if (!user.isActive) {
      console.log('❌ [Login API] Usuário inativo')
      return NextResponse.json(
        { error: 'Usuário inativo' },
        { status: 401 }
      )
    }

    // Verificar senha
    console.log('🔒 [Login API] Verificando senha...')
    const isPasswordValid = await bcrypt.compare(password, user.password)

    if (!isPasswordValid) {
      console.log('❌ [Login API] Senha incorreta')
      return NextResponse.json(
        { error: 'Senha incorreta' },
        { status: 401 }
      )
    }

    console.log('✅ [Login API] Senha correta!')

    // Resetar tentativas de login
    await prisma.user.update({
      where: { id: user.id },
      data: {
        loginAttempts: 0,
        lockedUntil: null,
        lastLogin: new Date()
      }
    })

    // Gerar tokens
    console.log('🎫 [Login API] Gerando tokens...')
    console.log('Gerando token com dados:', {
      userId: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      name: user.name
    })

    const accessToken = jwt.sign(
      {
        userId: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        name: user.name,
        type: 'access'
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    )

    const refreshToken = jwt.sign(
      {
        userId: user.id,
        type: 'refresh'
      },
      JWT_SECRET,
      { expiresIn: '30d' }
    )

    console.log('✅ [Login API] Tokens gerados!')

    // Preparar resposta
    const userData = {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      name: user.name,
      isActive: user.isActive
    }

    console.log('📋 [Login API] Dados do usuário:', userData)

    console.log('✅ [Login API] Login bem-sucedido!')

    // Criar resposta
    const response = NextResponse.json({
      success: true,
      user: userData,
      message: 'Login realizado com sucesso'
    })

    // Definir cookies
    response.cookies.set('auth-token', accessToken, {
      httpOnly: true,
      secure: process.env['NODE_ENV'] === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 // 7 dias
    })

    response.cookies.set('refresh-token', refreshToken, {
      httpOnly: true,
      secure: process.env['NODE_ENV'] === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60 // 30 dias
    })

    console.log('🍪 [Login API] Cookies definidos')

    return response

  } catch (error) {
    console.error('💥 [Login API] ERRO FATAL:')
    console.error(error)
    console.error('Stack:', error instanceof Error ? error.stack : 'No stack')

    return NextResponse.json(
      {
        error: 'Erro interno do servidor',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
