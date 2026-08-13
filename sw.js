/* ==========================================
   SERVICE WORKER - STUDYHUB (PWA)
   ========================================== */

const CACHE_NAME = 'studyhub-v1';

// Recursos locales estáticos a guardar en caché para uso sin conexión
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './styles.css',
  './script.js',
  './manifest.json',
  './hinata-shoyo.gif',
  './snowfall.mp3',
  './green to blue - slowed + reverbed.mp3',
  './Get Lucky (feat. Pharrell Williams and Nile Rodgers).mp3',
  './Something Just Like This.mp3'
];

// Evento Install: Se activa al instalar la PWA y precarga los archivos esenciales
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Instalando y precargando recursos...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        // Usamos addAll de forma segura (ignorando posibles errores de canciones faltantes)
        return Promise.allSettled(
          ASSETS_TO_CACHE.map(url => cache.add(url))
        );
      })
      .then(() => self.skipWaiting())
  );
});

// Evento Activate: Limpia cachés obsoletas si cambias la versión en CACHE_NAME
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activando versión actual...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('[Service Worker] Eliminando caché antigua:', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Evento Fetch: Intercepta las solicitudes y sirve desde caché o red
self.addEventListener('fetch', (event) => {
  // Solo interceptamos peticiones GET
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        // 1. Si el recurso está en la caché, lo devolvemos inmediatamente
        if (cachedResponse) {
          return cachedResponse;
        }

        // 2. Si no está en caché, lo pedimos a la red
        return fetch(event.request).then((networkResponse) => {
          // Si la respuesta de red es válida, la clonamos y guardamos dinámicamente
          if (
            networkResponse &&
            networkResponse.status === 200 &&
            (networkResponse.type === 'basic' || networkResponse.type === 'cors')
          ) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
          return networkResponse;
        });
      })
      .catch(() => {
        // Fallback offline en caso de fallo de red al navegar
        if (event.request.mode === 'navigate') {
          return caches.match('./index.html');
        }
      })
  );
});