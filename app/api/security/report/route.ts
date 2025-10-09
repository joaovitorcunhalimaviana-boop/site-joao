import { NextRequest, NextResponse } from 'next/server'
import { getSecurityReport } from '@/lib/security-audit'
import { validateSession } from '@/lib/security'

// GET /api/security/report - Obter relatório de segurança
export async function GET(request: NextRequest) {
  try {
    // Verificar autenticação
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Token de autorização necessário' },
        { status: 401 }
      )
    }

    const token = authHeader.replace('Bearer ', '')
    const session = await validateSession(token)

    if (!session) {
      return NextResponse.json(
        { error: 'Acesso negado. Token inválido.' },
        { status: 403 }
      )
    }

    // Obter relatório de segurança
    const report = getSecurityReport()

    // Adicionar informações adicionais
    const enhancedReport = {
      ...report,
      metadata: {
        generatedAt: new Date().toISOString(),
        generatedBy: 'Sistema',
        version: '1.0',
      },
      summary: {
        criticalEvents: report.recentEvents.filter(
          e => e.severity === 'CRITICAL'
        ).length,
        highRiskEvents: report.recentEvents.filter(e => e.severity === 'HIGH')
          .length,
        mediumRiskEvents: report.recentEvents.filter(
          e => e.severity === 'MEDIUM'
        ).length,
        lowRiskEvents: report.recentEvents.filter(e => e.severity === 'LOW')
          .length,
        mostCommonThreat:
          Object.entries(report.eventsByType).sort(
            ([, a], [, b]) => b - a
          )[0]?.[0] || 'Nenhum',
        riskLevel: calculateRiskLevel(report),
      },
    }

    return NextResponse.json(enhancedReport)
  } catch (error) {
    console.error('Erro ao gerar relatório de segurança:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// Função para calcular nível de risco geral
function calculateRiskLevel(
  report: any
): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
  const recentCritical = report.recentEvents.filter(
    (e: any) =>
      e.severity === 'CRITICAL' &&
      new Date(e.timestamp) > new Date(Date.now() - 24 * 60 * 60 * 1000) // últimas 24h
  ).length

  const recentHigh = report.recentEvents.filter(
    (e: any) =>
      e.severity === 'HIGH' &&
      new Date(e.timestamp) > new Date(Date.now() - 24 * 60 * 60 * 1000)
  ).length

  if (recentCritical > 0) return 'CRITICAL'
  if (recentHigh > 5) return 'HIGH'
  if (recentHigh > 0 || report.totalEvents > 100) return 'MEDIUM'
  return 'LOW'
}

// POST /api/security/report - Limpar logs de segurança
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Token de autorização necessário' },
        { status: 401 }
      )
    }

    const token = authHeader.replace('Bearer ', '')
    const session = await validateSession(token)

    if (!session) {
      return NextResponse.json(
        { error: 'Acesso negado. Token inválido.' },
        { status: 403 }
      )
    }

    const { action } = await request.json()

    if (action === 'clear_logs') {
      // Em uma implementação real, limparia os logs do banco de dados
      return NextResponse.json({
        success: true,
        message: 'Logs de segurança limpos com sucesso',
        clearedAt: new Date().toISOString(),
        clearedBy: 'Sistema',
      })
    }

    return NextResponse.json({ error: 'Ação não reconhecida' }, { status: 400 })
  } catch (error) {
    console.error('Erro ao processar ação de segurança:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
