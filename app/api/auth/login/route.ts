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

    // Função para normalizar o identificador de login (username/email)
    const normalizeLogin = (s: string) =>
      s
        .trim()
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')

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

    // Padronizar o identificador de login
    email = normalizeLogin(email)

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

    // Utilitário: usuários de desenvolvimento (fallback quando DB indisponível)
    const isDev = process.env['NODE_ENV'] !== 'production'
    const getDevUser = (loginEmail: string, loginPassword: string) => {
      const devUsers = [
        {
          id: 'dev-zeta',
          username: 'zeta.secretaria',
          email: 'zeta.secretaria',
          role: 'SECRETARY',
          name: 'Zeta Secretária',
          isActive: true,
          password: 'zeta123',
        },
        {
          id: 'dev-joao',
          username: 'joao.viana',
          email: 'joao.viana',
          role: 'DOCTOR',
          name: 'João Viana',
          isActive: true,
          password: 'Logos1.1',
        },
      ]
      const found = devUsers.find(
        u => (u.email === loginEmail || u.username === loginEmail) && u.password === loginPassword
      )
      return found
    }

    // Buscar usuário (tentar DB primeiro)
    console.log('🔍 [Login API] Buscando usuário...')
    let user: any = null
    try {
      user = await prisma.user.findFirst({
        where: {
          OR: [
            { email: email },
            { username: email }
          ]
        }
      })
    } catch (dbError) {
      console.warn('⚠️ [Login API] Erro ao acessar o banco, avaliando fallback de desenvolvimento:', dbError)
      if (isDev) {
        const devUser = getDevUser(email, password)
        if (devUser) {
          console.log('🛟 [Login API] Usando usuário de desenvolvimento (fallback):', devUser.username)
          // Gerar tokens e responder sem acessar DB
          const accessToken = jwt.sign(
            {
              userId: devUser.id,
              username: devUser.username,
              email: devUser.email,
              role: devUser.role,
              name: devUser.name,
              type: 'access'
            },
            JWT_SECRET,
            { expiresIn: '7d' }
          )

          const refreshToken = jwt.sign(
            {
              userId: devUser.id,
              type: 'refresh'
            },
            JWT_SECRET,
            { expiresIn: '30d' }
          )

          const response = NextResponse.json({
            success: true,
            user: {
              id: devUser.id,
              username: devUser.username,
              email: devUser.email,
              role: devUser.role,
              name: devUser.name,
              isActive: devUser.isActive,
            },
            message: 'Login (dev) realizado com sucesso'
          })

          response.cookies.set('auth-token', accessToken, {
            httpOnly: true,
            secure: process.env['NODE_ENV'] === 'production',
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60
          })

          response.cookies.set('refresh-token', refreshToken, {
            httpOnly: true,
            secure: process.env['NODE_ENV'] === 'production',
            sameSite: 'lax',
            maxAge: 30 * 24 * 60 * 60
          })

          return response
        }
      }

      // Sem fallback aplicável
      console.error('❌ [Login API] Banco indisponível e nenhum fallback aplicável')
      return NextResponse.json(
        { error: 'Serviço de autenticação indisponível no momento' },
        { status: 503 }
      )
    }

    if (!user) {
      // Tentar fallback em desenvolvimento mesmo que o DB esteja acessível
      if (isDev) {
        const devUser = getDevUser(email, password)
        if (devUser) {
          console.log('🛟 [Login API] Usando usuário de desenvolvimento (fallback - usuário não encontrado):', devUser.username)

          const accessToken = jwt.sign(
            {
              userId: devUser.id,
              username: devUser.username,
              email: devUser.email,
              role: devUser.role,
              name: devUser.name,
              type: 'access'
            },
            JWT_SECRET,
            { expiresIn: '7d' }
          )

          const refreshToken = jwt.sign(
            {
              userId: devUser.id,
              type: 'refresh'
            },
            JWT_SECRET,
            { expiresIn: '30d' }
          )

          const response = NextResponse.json({
            success: true,
            user: {
              id: devUser.id,
              username: devUser.username,
              email: devUser.email,
              role: devUser.role,
              name: devUser.name,
              isActive: devUser.isActive,
            },
            message: 'Login (dev) realizado com sucesso'
          })

          response.cookies.set('auth-token', accessToken, {
            httpOnly: true,
            secure: process.env['NODE_ENV'] === 'production',
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60
          })

          response.cookies.set('refresh-token', refreshToken, {
            httpOnly: true,
            secure: process.env['NODE_ENV'] === 'production',
            sameSite: 'lax',
            maxAge: 30 * 24 * 60 * 60
          })

          return response
        }
      }

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

    // Definir cookies com path explícito e domínio opcional
    const cookieDomain = process.env['COOKIE_DOMAIN'] || undefined
    const baseCookieOptions = {
      httpOnly: true,
      secure: process.env['NODE_ENV'] === 'production',
      sameSite: 'lax' as const,
      path: '/',
      domain: cookieDomain,
    }

    response.cookies.set('auth-token', accessToken, {
      ...baseCookieOptions,
      maxAge: 7 * 24 * 60 * 60, // 7 dias
    })

    response.cookies.set('refresh-token', refreshToken, {
      ...baseCookieOptions,
      maxAge: 30 * 24 * 60 * 60, // 30 dias
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
