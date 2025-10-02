// Service Worker para cache e otimização de performance
const CACHE_NAME = 'medical-site-v1'
const STATIC_CACHE = 'static-v1'
const DYNAMIC_CACHE = 'dynamic-v1'

// Recursos para cache estático
const STATIC_ASSETS = [
  '/',
  '/area-medica',
  '/agendamento',
  '/pacientes',
  '/manifest.json',
  // Adicionar outros recursos críticos aqui
]

// Recursos para cache dinâmico
const DYNAMIC_ASSETS = [
  '/api/unified-system/patients',
  '/api/appointments',
  '/api/unified-appointments'
]

// Instalar Service Worker
self.addEventListener('install', (event) => {
  console.log('Service Worker: Instalando...')
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => {
        console.log('Service Worker: Cache estático criado')
        return cache.addAll(STATIC_ASSETS)
      })
      .catch(error => {
        console.error('Erro ao criar cache estático:', error)
      })
  )
})

// Ativar Service Worker
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Ativando...')
  
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          // Remover caches antigos
          if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
            console.log('Service Worker: Removendo cache antigo:', cacheName)
            return caches.delete(cacheName)
          }
        })
      )
    })
  )
})

// Interceptar requisições
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Estratégia Cache First para recursos estáticos
  if (STATIC_ASSETS.includes(url.pathname)) {
    event.respondWith(
      caches.match(request)
        .then(response => {
          return response || fetch(request)
        })
    )
    return
  }

  // Estratégia Network First para APIs
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request)
        .then(response => {
          // Cachear apenas respostas bem-sucedidas
          if (response.status === 200) {
            const responseClone = response.clone()
            caches.open(DYNAMIC_CACHE)
              .then(cache => {
                cache.put(request, responseClone)
              })
          }
          return response
        })
        .catch(() => {
          // Fallback para cache se a rede falhar
          return caches.match(request)
        })
    )
    return
  }

  // Estratégia Stale While Revalidate para outros recursos
  event.respondWith(
    caches.match(request)
      .then(response => {
        const fetchPromise = fetch(request)
          .then(networkResponse => {
            // Atualizar cache em background
            if (networkResponse.status === 200) {
              const responseClone = networkResponse.clone()
              caches.open(DYNAMIC_CACHE)
                .then(cache => {
                  cache.put(request, responseClone)
                })
            }
            return networkResponse
          })

        // Retornar cache imediatamente se disponível, senão aguardar rede
        return response || fetchPromise
      })
  )
})

// Limpeza periódica do cache
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'CLEAN_CACHE') {
    cleanOldCache()
  }
})

function cleanOldCache() {
  const now = Date.now()
  const maxAge = 7 * 24 * 60 * 60 * 1000 // 7 dias

  caches.open(DYNAMIC_CACHE)
    .then(cache => {
      cache.keys().then(requests => {
        requests.forEach(request => {
          cache.match(request).then(response => {
            if (response) {
              const dateHeader = response.headers.get('date')
              if (dateHeader) {
                const responseDate = new Date(dateHeader).getTime()
                if (now - responseDate > maxAge) {
                  cache.delete(request)
                }
              }
            }
          })
        })
      })
    })
}

// Executar limpeza a cada 24 horas
setInterval(cleanOldCache, 24 * 60 * 60 * 1000)