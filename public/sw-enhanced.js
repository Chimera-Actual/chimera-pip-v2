// Enhanced Service Worker with advanced caching strategies
const CACHE_VERSION = 'v2';
const CACHE_NAMES = {
  STATIC: `static-${CACHE_VERSION}`,
  DYNAMIC: `dynamic-${CACHE_VERSION}`,
  IMAGES: `images-${CACHE_VERSION}`,
  API: `api-${CACHE_VERSION}`,
};

// Cache expiration times (in seconds)
const CACHE_EXPIRATION = {
  STATIC: 7 * 24 * 60 * 60, // 7 days
  DYNAMIC: 24 * 60 * 60,    // 1 day
  IMAGES: 30 * 24 * 60 * 60, // 30 days
  API: 5 * 60,               // 5 minutes
};

// Essential files to cache immediately
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/chimera-tec-logo.png',
];

// Install event - precache essential assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAMES.STATIC)
      .then((cache) => {
        return cache.addAll(PRECACHE_ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (!Object.values(CACHE_NAMES).includes(cacheName)) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Advanced caching strategies
const cacheStrategies = {
  // Cache First - for static assets
  cacheFirst: async (request) => {
    const cache = await caches.open(CACHE_NAMES.STATIC);
    const cached = await cache.match(request);
    if (cached) {
      // Update cache in background
      fetch(request).then(response => {
        if (response && response.status === 200) {
          cache.put(request, response.clone());
        }
      });
      return cached;
    }
    const response = await fetch(request);
    if (response && response.status === 200) {
      cache.put(request, response.clone());
    }
    return response;
  },

  // Network First - for API calls
  networkFirst: async (request, cacheName = CACHE_NAMES.API) => {
    try {
      const response = await fetch(request);
      if (response && response.status === 200) {
        const cache = await caches.open(cacheName);
        cache.put(request, response.clone());
      }
      return response;
    } catch (error) {
      const cache = await caches.open(cacheName);
      const cached = await cache.match(request);
      if (cached) {
        return cached;
      }
      throw error;
    }
  },

  // Stale While Revalidate - for images and dynamic content
  staleWhileRevalidate: async (request, cacheName = CACHE_NAMES.DYNAMIC) => {
    const cache = await caches.open(cacheName);
    const cached = await cache.match(request);
    
    const fetchPromise = fetch(request).then(response => {
      if (response && response.status === 200) {
        cache.put(request, response.clone());
      }
      return response;
    });

    return cached || fetchPromise;
  },

  // Network Only - for non-cacheable requests
  networkOnly: async (request) => {
    return fetch(request);
  }
};

// Determine caching strategy based on request
function getCachingStrategy(request) {
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return 'networkOnly';
  }

  // API calls - network first with short cache
  if (url.pathname.startsWith('/api') || url.hostname.includes('supabase')) {
    return 'networkFirst';
  }

  // Images - stale while revalidate with long cache
  if (request.destination === 'image' || /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(url.pathname)) {
    return 'staleWhileRevalidate';
  }

  // Static assets (JS, CSS) - cache first
  if (/\.(js|css)$/i.test(url.pathname)) {
    return 'cacheFirst';
  }

  // HTML documents - network first
  if (request.destination === 'document') {
    return 'networkFirst';
  }

  // Default to stale while revalidate
  return 'staleWhileRevalidate';
}

// Fetch event handler with intelligent caching
self.addEventListener('fetch', (event) => {
  const strategy = getCachingStrategy(event.request);
  const startTime = performance.now();

  const responsePromise = (async () => {
    try {
      return await cacheStrategies[strategy](event.request);
    } catch (error) {
      // Fallback for offline
      if (event.request.destination === 'document') {
        const fallbackDocument = await caches.match('/index.html');
        if (fallbackDocument) {
          return fallbackDocument;
        }
      }
      // Return offline placeholder for images
      if (event.request.destination === 'image') {
        const fallbackImage = await caches.match('/offline-image.svg');
        if (fallbackImage) {
          return fallbackImage;
        }
      }
      throw error;
    }
  })();

  event.respondWith(responsePromise);

  event.waitUntil(
    responsePromise
      .then(() => {
        const duration = performance.now() - startTime;
        if (duration > 1000) {
          return self.clients.matchAll().then((clients) => {
            clients.forEach((client) => {
              client.postMessage({
                type: 'SLOW_REQUEST',
                url: event.request.url,
                duration,
              });
            });
          });
        }
      })
      .catch(() => {})
  );
});

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-offline-actions') {
    event.waitUntil(syncOfflineActions());
  }
});

async function syncOfflineActions() {
  const cache = await caches.open('offline-actions');
  const requests = await cache.keys();
  
  for (const request of requests) {
    try {
      const cachedResponse = await cache.match(request);
      if (cachedResponse) {
        const body = await cachedResponse.text();
        const response = await fetch(request.url, {
          method: request.method,
          headers: request.headers,
          body: body
        });
        
        if (response.ok) {
          await cache.delete(request);
        }
      }
    } catch (error) {
      // Keep in cache for next sync
    }
  }
}

// Periodic cache cleanup
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'CLEANUP_CACHES') {
    event.waitUntil(cleanupExpiredCaches());
  }
});

async function cleanupExpiredCaches() {
  const cacheNames = await caches.keys();
  
  for (const cacheName of cacheNames) {
    const cache = await caches.open(cacheName);
    const requests = await cache.keys();
    
    for (const request of requests) {
      const response = await cache.match(request);
      if (response) {
        const dateHeader = response.headers.get('date');
        if (dateHeader) {
          const cacheTime = new Date(dateHeader).getTime();
          const now = Date.now();
          const age = (now - cacheTime) / 1000;
          
          // Determine expiration based on cache type
          let maxAge = CACHE_EXPIRATION.DYNAMIC;
          if (cacheName === CACHE_NAMES.STATIC) maxAge = CACHE_EXPIRATION.STATIC;
          if (cacheName === CACHE_NAMES.IMAGES) maxAge = CACHE_EXPIRATION.IMAGES;
          if (cacheName === CACHE_NAMES.API) maxAge = CACHE_EXPIRATION.API;
          
          if (age > maxAge) {
            await cache.delete(request);
          }
        }
      }
    }
  }
}
