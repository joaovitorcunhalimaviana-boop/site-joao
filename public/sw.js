// Service Worker avançado para PWA e cache offline
const CACHE_NAME = 'medical-app-v2.0.0'
const STATIC_CACHE = 'static-v2.0.0'
const DYNAMIC_CACHE = 'dynamic-v2.0.0'
const API_CACHE = 'api-v2.0.0'

// Recursos estáticos para cache
const STATIC_ASSETS = [
  '/',
  '/area-medica',
  '/area-secretaria',
  '/agendamento',
  '/pacientes',
  '/manifest.json',
  '/favicon.ico',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/offline.html',
]

// URLs da API para cache
const API_URLS = [
  '/api/unified-system/patients',
  '/api/appointments',
  '/api/unified-appointments',
  '/api/doctors',
  '/api/dashboard',
]

// Estratégias de cache
const CACHE_STRATEGIES = {
  CACHE_FIRST: 'cache-first',
  NETWORK_FIRST: 'network-first',
  STALE_WHILE_REVALIDATE: 'stale-while-revalidate',
  NETWORK_ONLY: 'network-only',
  CACHE_ONLY: 'cache-only',
}

// Configuração de cache por tipo de recurso
const CACHE_CONFIG = {
  static: {
    strategy: CACHE_STRATEGIES.CACHE_FIRST,
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 dias
    maxEntries: 100,
  },
  api: {
    strategy: CACHE_STRATEGIES.NETWORK_FIRST,
    maxAge: 5 * 60 * 1000, // 5 minutos
    maxEntries: 50,
  },
  images: {
    strategy: CACHE_STRATEGIES.CACHE_FIRST,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 dias
    maxEntries: 200,
  },
  documents: {
    strategy: CACHE_STRATEGIES.STALE_WHILE_REVALIDATE,
    maxAge: 24 * 60 * 60 * 1000, // 1 dia
    maxEntries: 30,
  },
}

// Instalar Service Worker
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...')
  
  event.waitUntil(
    Promise.all([
      // Cache recursos estáticos
      caches.open(STATIC_CACHE).then((cache) => {
        console.log('Service Worker: Caching static assets')
        return cache.addAll(STATIC_ASSETS)
      }),
      
      // Pular waiting para ativar imediatamente
      self.skipWaiting(),
    ])
  )
})

// Ativar Service Worker
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...')
  
  event.waitUntil(
    Promise.all([
      // Limpar caches antigos
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (
              cacheName !== CACHE_NAME &&
              cacheName !== STATIC_CACHE &&
              cacheName !== DYNAMIC_CACHE &&
              cacheName !== API_CACHE
            ) {
              console.log('Service Worker: Deleting old cache:', cacheName)
              return caches.delete(cacheName)
            }
          })
        )
      }),
      
      // Tomar controle de todas as abas
      self.clients.claim(),
    ])
  )
})

// Interceptar requisições
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)
  
  // Ignorar requisições não-HTTP
  if (!request.url.startsWith('http')) {
    return
  }
  
  // Determinar estratégia de cache
  const cacheStrategy = getCacheStrategy(request)
  
  event.respondWith(
    handleRequest(request, cacheStrategy)
  )
})

// Determinar estratégia de cache baseada no tipo de recurso
function getCacheStrategy(request) {
  const url = new URL(request.url)
  const pathname = url.pathname
  
  // API requests
  if (pathname.startsWith('/api/')) {
    return {
      strategy: CACHE_CONFIG.api.strategy,
      cacheName: API_CACHE,
      config: CACHE_CONFIG.api,
    }
  }
  
  // Imagens
  if (pathname.match(/\.(jpg|jpeg|png|gif|webp|svg|ico)$/i)) {
    return {
      strategy: CACHE_CONFIG.images.strategy,
      cacheName: DYNAMIC_CACHE,
      config: CACHE_CONFIG.images,
    }
  }
  
  // Recursos estáticos
  if (
    pathname.match(/\.(js|css|woff|woff2|ttf|eot)$/i) ||
    STATIC_ASSETS.includes(pathname)
  ) {
    return {
      strategy: CACHE_CONFIG.static.strategy,
      cacheName: STATIC_CACHE,
      config: CACHE_CONFIG.static,
    }
  }
  
  // Documentos HTML
  if (
    request.headers.get('accept')?.includes('text/html') ||
    pathname === '/' ||
    !pathname.includes('.')
  ) {
    return {
      strategy: CACHE_CONFIG.documents.strategy,
      cacheName: DYNAMIC_CACHE,
      config: CACHE_CONFIG.documents,
    }
  }
  
  // Default: Network First
  return {
    strategy: CACHE_STRATEGIES.NETWORK_FIRST,
    cacheName: DYNAMIC_CACHE,
    config: CACHE_CONFIG.documents,
  }
}

// Manipular requisições baseado na estratégia
async function handleRequest(request, cacheStrategy) {
  const { strategy, cacheName, config } = cacheStrategy
  
  switch (strategy) {
    case CACHE_STRATEGIES.CACHE_FIRST:
      return cacheFirst(request, cacheName, config)
      
    case CACHE_STRATEGIES.NETWORK_FIRST:
      return networkFirst(request, cacheName, config)
      
    case CACHE_STRATEGIES.STALE_WHILE_REVALIDATE:
      return staleWhileRevalidate(request, cacheName, config)
      
    case CACHE_STRATEGIES.NETWORK_ONLY:
      return fetch(request)
      
    case CACHE_STRATEGIES.CACHE_ONLY:
      return caches.match(request)
      
    default:
      return networkFirst(request, cacheName, config)
  }
}

// Estratégia Cache First
async function cacheFirst(request, cacheName, config) {
  try {
    const cache = await caches.open(cacheName)
    const cachedResponse = await cache.match(request)
    
    if (cachedResponse) {
      // Verificar se o cache não expirou
      const cacheTime = await getCacheTime(request, cacheName)
      if (cacheTime && Date.now() - cacheTime < config.maxAge) {
        return cachedResponse
      }
    }
    
    // Buscar da rede
    const networkResponse = await fetch(request)
    
    if (networkResponse.ok) {
      await cacheResponse(request, networkResponse.clone(), cacheName, config)
    }
    
    return networkResponse
  } catch (error) {
    // Retornar do cache mesmo se expirado
    const cache = await caches.open(cacheName)
    const cachedResponse = await cache.match(request)
    
    if (cachedResponse) {
      return cachedResponse
    }
    
    // Retornar página offline para navegação
    if (request.headers.get('accept')?.includes('text/html')) {
      return caches.match('/offline.html')
    }
    
    throw error
  }
}

// Estratégia Network First
async function networkFirst(request, cacheName, config) {
  try {
    const networkResponse = await fetch(request)
    
    if (networkResponse.ok) {
      await cacheResponse(request, networkResponse.clone(), cacheName, config)
    }
    
    return networkResponse
  } catch (error) {
    const cache = await caches.open(cacheName)
    const cachedResponse = await cache.match(request)
    
    if (cachedResponse) {
      return cachedResponse
    }
    
    // Retornar página offline para navegação
    if (request.headers.get('accept')?.includes('text/html')) {
      return caches.match('/offline.html')
    }
    
    throw error
  }
}

// Estratégia Stale While Revalidate
async function staleWhileRevalidate(request, cacheName, config) {
  const cache = await caches.open(cacheName)
  const cachedResponse = await cache.match(request)
  
  // Buscar da rede em background
  const networkPromise = fetch(request).then(async (networkResponse) => {
    if (networkResponse.ok) {
      await cacheResponse(request, networkResponse.clone(), cacheName, config)
    }
    return networkResponse
  }).catch(() => {
    // Ignorar erros de rede em background
  })
  
  // Retornar cache imediatamente se disponível
  if (cachedResponse) {
    return cachedResponse
  }
  
  // Aguardar rede se não há cache
  try {
    return await networkPromise
  } catch (error) {
    if (request.headers.get('accept')?.includes('text/html')) {
      return caches.match('/offline.html')
    }
    throw error
  }
}

// Cachear resposta com controle de tamanho
async function cacheResponse(request, response, cacheName, config) {
  try {
    const cache = await caches.open(cacheName)
    
    // Adicionar timestamp para controle de expiração
    const responseWithTimestamp = new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: {
        ...response.headers,
        'sw-cache-time': Date.now().toString(),
      },
    })
    
    await cache.put(request, responseWithTimestamp)
    
    // Limpar cache se exceder limite
    await cleanupCache(cacheName, config.maxEntries)
  } catch (error) {
    console.warn('Failed to cache response:', error)
  }
}

// Obter tempo de cache
async function getCacheTime(request, cacheName) {
  try {
    const cache = await caches.open(cacheName)
    const response = await cache.match(request)
    
    if (response) {
      const cacheTime = response.headers.get('sw-cache-time')
      return cacheTime ? parseInt(cacheTime) : null
    }
  } catch (error) {
    console.warn('Failed to get cache time:', error)
  }
  
  return null
}

// Limpar cache antigo
async function cleanupCache(cacheName, maxEntries) {
  try {
    const cache = await caches.open(cacheName)
    const keys = await cache.keys()
    
    if (keys.length > maxEntries) {
      // Remover entradas mais antigas
      const entriesToDelete = keys.slice(0, keys.length - maxEntries)
      
      await Promise.all(
        entriesToDelete.map((key) => cache.delete(key))
      )
    }
  } catch (error) {
    console.warn('Failed to cleanup cache:', error)
  }
}

// Sincronização em background
self.addEventListener('sync', (event) => {
  console.log('Service Worker: Background sync triggered')
  
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync())
  }
})

// Executar sincronização em background
async function doBackgroundSync() {
  try {
    // Sincronizar dados pendentes
    const pendingData = await getStoredData('pending-sync')
    
    if (pendingData && pendingData.length > 0) {
      for (const item of pendingData) {
        try {
          await fetch(item.url, {
            method: item.method,
            headers: item.headers,
            body: item.body,
          })
          
          // Remover item sincronizado
          await removeStoredData('pending-sync', item.id)
        } catch (error) {
          console.warn('Failed to sync item:', item.id, error)
        }
      }
    }
  } catch (error) {
    console.warn('Background sync failed:', error)
  }
}

// Notificações push
self.addEventListener('push', (event) => {
  console.log('Service Worker: Push notification received')
  
  const options = {
    body: 'Você tem uma nova notificação',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-192x192.png',
    vibrate: [200, 100, 200],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1,
    },
    actions: [
      {
        action: 'explore',
        title: 'Ver detalhes',
        icon: '/icons/checkmark.png',
      },
      {
        action: 'close',
        title: 'Fechar',
        icon: '/icons/xmark.png',
      },
    ],
  }
  
  if (event.data) {
    const data = event.data.json()
    options.body = data.body || options.body
    options.data = { ...options.data, ...data }
  }
  
  event.waitUntil(
    self.registration.showNotification('Sistema Médico', options)
  )
})

// Clique em notificação
self.addEventListener('notificationclick', (event) => {
  console.log('Service Worker: Notification clicked')
  
  event.notification.close()
  
  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    )
  } else if (event.action === 'close') {
    // Apenas fechar a notificação
  } else {
    // Clique na notificação (não em ação)
    event.waitUntil(
      clients.openWindow('/')
    )
  }
})

// Utilitários para armazenamento local
async function getStoredData(key) {
  try {
    const cache = await caches.open('app-data')
    const response = await cache.match(`/data/${key}`)
    
    if (response) {
      return await response.json()
    }
  } catch (error) {
    console.warn('Failed to get stored data:', error)
  }
  
  return null
}

async function setStoredData(key, data) {
  try {
    const cache = await caches.open('app-data')
    const response = new Response(JSON.stringify(data))
    
    await cache.put(`/data/${key}`, response)
  } catch (error) {
    console.warn('Failed to set stored data:', error)
  }
}

async function removeStoredData(key, itemId) {
  try {
    const data = await getStoredData(key)
    
    if (data && Array.isArray(data)) {
      const filteredData = data.filter(item => item.id !== itemId)
      await setStoredData(key, filteredData)
    }
  } catch (error) {
    console.warn('Failed to remove stored data:', error)
  }
}

// Mensagens do cliente
self.addEventListener('message', (event) => {
  console.log('Service Worker: Message received', event.data)
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_NAME })
  }
  
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(clearAllCaches())
  }
})

// Limpar todos os caches
async function clearAllCaches() {
  try {
    const cacheNames = await caches.keys()
    
    await Promise.all(
      cacheNames.map(cacheName => caches.delete(cacheName))
    )
    
    console.log('Service Worker: All caches cleared')
  } catch (error) {
    console.warn('Failed to clear caches:', error)
  }
}

console.log('Service Worker: Loaded successfully')

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