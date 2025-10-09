import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    message: 'Sistema médico funcionando!',
    timestamp: new Date().toISOString(),
    status: 'ok',
  })
}
