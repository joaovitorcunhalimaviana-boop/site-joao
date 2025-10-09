import { NextResponse } from 'next/server'

export async function POST() {
  try {
    // Criar resposta de logout
    const response = NextResponse.json({
      success: true,
      message: 'Logout realizado com sucesso',
    })

    // Remover cookie de autenticação
    response.cookies.set('auth-token', '', {
      httpOnly: true,
      secure: process.env['NODE_ENV'] === 'production',
      sameSite: 'strict',
      maxAge: 0, // Remove o cookie
    })

    return response
  } catch (error) {
    console.error('Erro no logout:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
