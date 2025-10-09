import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'

const JWT_SECRET = process.env['JWT_SECRET'] || 'your-secret-key'

// Simulação de dados do médico (em produção, isso viria de um banco de dados)
const doctorData = {
  id: 'doctor_1',
  name: 'Dr. João Vitor',
  email: 'joao@clinica.com',
  specialty: 'Gastroenterologia',
  crm: '12345-PB',
  password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
}

// Função para verificar se o usuário é médico autenticado
async function verifyDoctorAuth() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('auth-token')?.value

    if (!token) {
      return null
    }

    const decoded = jwt.verify(token, JWT_SECRET) as any

    if (decoded.type === 'doctor') {
      return decoded
    }

    return null
  } catch (error) {
    return null
  }
}

// POST - Alterar senha do médico
export async function POST(request: NextRequest) {
  try {
    const doctorAuth = await verifyDoctorAuth()

    if (!doctorAuth) {
      return NextResponse.json(
        { success: false, error: 'Acesso negado' },
        { status: 401 }
      )
    }

    const { currentPassword, newPassword } = await request.json()

    // Validações
    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { success: false, error: 'Senha atual e nova senha são obrigatórias' },
        { status: 400 }
      )
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        {
          success: false,
          error: 'A nova senha deve ter pelo menos 6 caracteres',
        },
        { status: 400 }
      )
    }

    // Verificar senha atual
    const isCurrentPasswordValid = await bcrypt.compare(
      currentPassword,
      doctorData.password
    )

    if (!isCurrentPasswordValid) {
      return NextResponse.json(
        { success: false, error: 'Senha atual incorreta' },
        { status: 400 }
      )
    }

    // Criptografar nova senha
    const hashedNewPassword = await bcrypt.hash(newPassword, 10)

    // Atualizar senha do médico
    doctorData.password = hashedNewPassword

    return NextResponse.json({
      success: true,
      message: 'Senha alterada com sucesso',
    })
  } catch (error) {
    console.error('Erro ao alterar senha:', error)
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
