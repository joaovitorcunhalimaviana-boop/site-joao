import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const maintenanceKeyHeader = request.headers.get('x-maintenance-key') || ''
    const maintenanceKeyEnv = process.env['MAINTENANCE_KEY'] || ''

    if (!maintenanceKeyEnv) {
      return NextResponse.json({ success: false, error: 'MAINTENANCE_KEY não configurada no ambiente' }, { status: 500 })
    }

    if (maintenanceKeyHeader !== maintenanceKeyEnv) {
      return NextResponse.json({ success: false, error: 'Não autorizado' }, { status: 401 })
    }

    // Verificar se a coluna communication_contacts.phone existe
    const existsResult = await prisma.$queryRaw<{ exists: boolean }[]>`
      SELECT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'communication_contacts'
          AND column_name = 'phone'
      ) AS exists;
    `

    const exists = Array.isArray(existsResult) && existsResult[0]?.exists === true

    const actions: string[] = []

    if (!exists) {
      // Adicionar coluna e índice conforme a migração planejada
      await prisma.$executeRawUnsafe(`ALTER TABLE "communication_contacts" ADD COLUMN "phone" TEXT;`)
      actions.push('ADD COLUMN communication_contacts.phone')

      await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "communication_contacts_phone_idx" ON "communication_contacts"("phone");`)
      actions.push('CREATE INDEX communication_contacts_phone_idx')
    } else {
      actions.push('COLUMN EXISTS - no change')
    }

    return NextResponse.json({ success: true, actions })
  } catch (error: any) {
    console.error('Erro ao aplicar DB fixes:', error)
    return NextResponse.json({ success: false, error: error?.message || 'Erro interno' }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({ ok: true, message: 'Use POST com x-maintenance-key para aplicar correções' })
}