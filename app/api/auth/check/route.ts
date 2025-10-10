import { NextRequest, NextResponse } from 'next/server'
import { verify } from 'jsonwebtoken'

const JWT_SECRET = process.env['JWT_SECRET'] || 'your-super-secret-jwt-key-change-in-production'

export async function GET(request: NextRequest) {
  try {
    // Ler token do cookie diretamente
    const token = request.cookies.get('auth-token')?.value

    console.log('🔍 [Check] Token do cookie:', token ? 'presente' : 'ausente')

    if (!token) {
      console.log('❌ [Check] Token não encontrado')
      return NextResponse.json(
        { error: 'Não autenticado', authenticated: false },
        { status: 401 }
      )
    }

    // Verificar e decodificar token
    const decoded = verify(token, JWT_SECRET) as {
      userId: string
      username: string
      email: string
      role: string
      name: string
      type: string
    }

    console.log('✅ [Check] Token válido:', decoded.username, decoded.role)

    if (decoded.type !== 'access') {
      console.log('❌ [Check] Tipo de token inválido')
      return NextResponse.json(
        { error: 'Token inválido', authenticated: false },
        { status: 401 }
      )
    }

    // Adicionar campo 'areas' baseado na role do usuário
    const userRole = decoded.role?.toUpperCase()
    let areas: string[] = []

    if (userRole === 'DOCTOR' || userRole === 'ADMIN') {
      areas.push('medica')
    }

    if (userRole === 'SECRETARY' || userRole === 'ADMIN') {
      areas.push('secretaria')
    }

    if (userRole === 'ADMIN') {
      areas.push('admin')
    }

    console.log('📦 [Check] Áreas do usuário:', areas)

    return NextResponse.json({
      authenticated: true,
      user: {
        id: decoded.userId,
        username: decoded.username,
        email: decoded.email,
        role: userRole,
        name: decoded.name,
        areas
      }
    })
  } catch (error) {
    console.error('❌ [Check] Erro na verificação:', error)
    return NextResponse.json(
      { error: 'Token inválido', authenticated: false },
      { status: 401 }
    )
  }
}