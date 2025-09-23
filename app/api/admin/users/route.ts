import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'

const JWT_SECRET = process.env['JWT_SECRET'] || 'your-secret-key'

// Simulação de banco de dados em memória
const users: Array<{
  id: string
  username: string
  password: string
  area: 'secretaria' | 'medica'
  createdAt: string
}> = []

// Função para verificar se o usuário é médico autenticado
async function verifyDoctorAuth() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('auth-token')?.value

    if (!token) {
      return false
    }

    const decoded = jwt.verify(token, JWT_SECRET) as any
    return decoded.type === 'doctor'
  } catch (error) {
    return false
  }
}

// GET - Listar todos os usuários
export async function GET() {
  try {
    const isAuthorized = await verifyDoctorAuth()

    if (!isAuthorized) {
      return NextResponse.json(
        { success: false, error: 'Acesso negado' },
        { status: 401 }
      )
    }

    // Retornar usuários sem as senhas
    const safeUsers = users.map(user => ({
      id: user.id,
      username: user.username,
      area: user.area,
      createdAt: user.createdAt,
    }))

    return NextResponse.json({
      success: true,
      users: safeUsers,
    })
  } catch (error) {
    console.error('Erro ao listar usuários:', error)
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// POST - Criar novo usuário
export async function POST(request: NextRequest) {
  try {
    const isAuthorized = await verifyDoctorAuth()

    if (!isAuthorized) {
      return NextResponse.json(
        { success: false, error: 'Acesso negado' },
        { status: 401 }
      )
    }

    const { username, password, area } = await request.json()

    // Validações
    if (!username || !password || !area) {
      return NextResponse.json(
        { success: false, error: 'Todos os campos são obrigatórios' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, error: 'A senha deve ter pelo menos 6 caracteres' },
        { status: 400 }
      )
    }

    if (!['secretaria', 'medica'].includes(area)) {
      return NextResponse.json(
        { success: false, error: 'Área inválida' },
        { status: 400 }
      )
    }

    // Verificar se o usuário já existe
    const existingUser = users.find(user => user.username === username)
    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'Nome de usuário já existe' },
        { status: 400 }
      )
    }

    // Criptografar senha
    const hashedPassword = await bcrypt.hash(password, 10)

    // Criar novo usuário
    const newUser = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      username,
      password: hashedPassword,
      area: area as 'secretaria' | 'medica',
      createdAt: new Date().toISOString(),
    }

    users.push(newUser)

    return NextResponse.json({
      success: true,
      message: 'Usuário criado com sucesso',
      user: {
        id: newUser.id,
        username: newUser.username,
        area: newUser.area,
        createdAt: newUser.createdAt,
      },
    })
  } catch (error) {
    console.error('Erro ao criar usuário:', error)
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// DELETE - Excluir usuário
export async function DELETE(request: NextRequest) {
  try {
    const isAuthorized = await verifyDoctorAuth()

    if (!isAuthorized) {
      return NextResponse.json(
        { success: false, error: 'Acesso negado' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('id')

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'ID do usuário é obrigatório' },
        { status: 400 }
      )
    }

    // Encontrar e remover usuário
    const userIndex = users.findIndex(user => user.id === userId)

    if (userIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Usuário não encontrado' },
        { status: 404 }
      )
    }

    users.splice(userIndex, 1)

    return NextResponse.json({
      success: true,
      message: 'Usuário excluído com sucesso',
    })
  } catch (error) {
    console.error('Erro ao excluir usuário:', error)
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
