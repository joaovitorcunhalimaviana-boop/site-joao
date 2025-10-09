import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Rotas públicas que não precisam de autenticação
const publicRoutes = [
  '/',
  '/agendamento-publico',
  '/sobre',
  '/especialidades',
  '/contato',
  '/faq',
  '/hemorroidas',
  '/fissura-anal',
  '/fistula-anal',
  '/cisto-pilonidal',
  '/plicoma',
  '/constipacao-intestinal',
  '/cancer-colorretal',
  '/urgencias',
  '/teleconsulta',
  '/visitas-domiciliares',
  '/calculadoras-acessiveis',
  '/avaliacoes',
  '/newsletter',
  '/api/*',
  '/_next/*',
  '/favicon.ico',
]

// Rotas protegidas por área
const areaProtectedRoutes: Record<string, string[]> = {
  '/area-medica': ['doctor', 'admin'],
  '/area-secretaria': ['secretary', 'admin'],
  '/admin': ['admin'],
}

// Configurar runtime para Node.js
export const config = {
  runtime: 'nodejs',
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}

// Sistema simplificado - sem autenticação complexa

export function middleware(request: NextRequest) {
  // Sistema simplificado - apenas passa todas as requisições
  return NextResponse.next()
}

// Funções auxiliares
function isPublicRoute(pathname: string): boolean {
  return publicRoutes.some(route => {
    if (route.endsWith('*')) {
      return pathname.startsWith(route.slice(0, -1))
    }
    return pathname === route || pathname.startsWith(route + '/')
  })
}

function getAreaRequiredRoles(pathname: string): string[] | null {
  for (const [route, roles] of Object.entries(areaProtectedRoutes)) {
    if (pathname.startsWith(route)) {
      return roles
    }
  }
  return null
}

// Middleware simplificado - sem funções auxiliares complexas
