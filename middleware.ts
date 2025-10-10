import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Rotas públicas que não precisam de autenticação
const publicRoutes = [
  '/',
  '/agendamento-publico',
  '/agendamento',
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
  '/login',
  '/login-medico',
  '/login-secretaria',
  '/api/auth/login',
  '/api/public-appointment',
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
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
    '/api/auth/check'
  ],
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // Permitir rotas públicas
  if (isPublicRoute(pathname)) {
    return NextResponse.next()
  }

  // Verificar token nos cookies
  console.log('🔍 [Middleware] Verificando token para:', pathname)
  const token = request.cookies.get('auth-token')?.value

  if (!token) {
    console.warn('⚠️ [Middleware] Token não encontrado, redirecionando para login')
    // Redirecionar para login apropriado baseado na rota
    if (pathname.startsWith('/area-medica')) {
      console.log('🔄 [Middleware] Redirecionando para /login-medico')
      return NextResponse.redirect(new URL('/login-medico', request.url))
    } else if (pathname.startsWith('/area-secretaria')) {
      console.log('🔄 [Middleware] Redirecionando para /login-secretaria')
      return NextResponse.redirect(new URL('/login-secretaria', request.url))
    } else {
      console.log('🔄 [Middleware] Redirecionando para /login')
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  // Verificar permissões da área
  const requiredRoles = getAreaRequiredRoles(pathname)
  if (requiredRoles) {
    try {
      console.log('🔐 [Middleware] Verificando autenticação com token:', token)
      const checkUrl = new URL('/api/auth/check', request.url)
      console.log('📡 [Middleware] Chamando API:', checkUrl.toString())
      
      const response = await fetch(checkUrl, {
        headers: {
          Cookie: `auth-token=${token}`,
        }
      })

      console.log('📥 [Middleware] Status da resposta:', response.status)
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ [Middleware] Falha na autenticação - Status:', response.status, errorText)
        // Redirecionar para login apropriado baseado na rota
        if (pathname.startsWith('/area-medica')) {
          return NextResponse.redirect(new URL('/login-medico', request.url))
        } else if (pathname.startsWith('/area-secretaria')) {
          return NextResponse.redirect(new URL('/login-secretaria', request.url))
        } else {
          return NextResponse.redirect(new URL('/login', request.url))
        }
      }

      const data = await response.json()
      console.log('👤 [Middleware] Dados do usuário:', data)

      // Verificar role do usuário - normalizar para minúsculas para comparação
      const userRole = data.user?.role?.toLowerCase()
      console.log('👮 [Middleware] Role do usuário:', userRole)
      console.log('🔒 [Middleware] Roles necessárias:', requiredRoles)

      if (!userRole) {
        console.error('❌ [Middleware] Usuário sem role definida')
        return NextResponse.redirect(new URL('/unauthorized', request.url))
      }

      // Normalizar roles necessárias para minúsculas também
      const normalizedRequiredRoles = requiredRoles.map(r => r.toLowerCase())

      if (!normalizedRequiredRoles.includes(userRole)) {
        console.error(`❌ [Middleware] Acesso negado: role ${userRole} não tem permissão. Necessário: ${requiredRoles.join(', ')}`)
        return NextResponse.redirect(new URL('/unauthorized', request.url))
      }

      console.log('✅ [Middleware] Verificação de permissões bem-sucedida')
    } catch (error) {
      console.error('Erro na verificação de autenticação:', error)
      // Redirecionar para login apropriado baseado na rota
      if (pathname.startsWith('/area-medica')) {
        return NextResponse.redirect(new URL('/login-medico', request.url))
      } else if (pathname.startsWith('/area-secretaria')) {
        return NextResponse.redirect(new URL('/login-secretaria', request.url))
      } else {
        return NextResponse.redirect(new URL('/login', request.url))
      }
    }
  }

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
