﻿import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Verificações básicas de saúde da aplicação
    const healthCheck = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env['NODE_ENV'] || 'development',
      version: process.env['npm_package_version'] || '1.0.0',
      services: {
        database: 'connected', // Será atualizado quando conectar o banco
        api: 'operational',
      },
    }

    return NextResponse.json(healthCheck, { status: 200 })
  } catch (error) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        error: 'Health check failed',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    )
  }
}
