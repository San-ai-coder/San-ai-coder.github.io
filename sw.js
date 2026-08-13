/* ==========================================
   SERVICE WORKER FINAL - APP ACADÉMICA (PWA)
   ========================================== */

// Se incrementa la versión para forzar la actualización en celulares
const NOMBRE_CACHE = 'app-academica-v2';

// Recursos locales y CDNs a precargar
const ARCHIVOS_CACHE = [
  './',
  './index.html',
  './style.css',
  './script.js',
  './manifest.json',
  './hinata-shoyo.gif',
  './Get Lucky (feat. Pharrell Williams and Nile Rodgers).mp3',
  'https://cdn.jsdelivr.net/npm/fullcalendar@6.1.10/index.global.min.css',
  'https://cdn.jsdelivr.net/npm/fullcalendar@6.1.10/index.global.min.js',
  'https://cdn.jsdelivr.net/npm/chart.js',
  'https://cdn.jsdelivr.net/npm/canvas-confetti@1.6.0/dist/confetti.browser.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css'
];

// 1. INSTALACIÓN: Guarda los recursos iniciales en la memoria caché
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(NOMBRE_CACHE)
      .then((cache) => {
        console.log('[Service Worker] Precargando recursos actualizados...');
        return cache.addAll(ARCHIVOS_CACHE);
      })
      .then(() => self.skipWaiting())
  );
});

// 2. ACTIVACIÓN: Borra automáticamente las versiones antiguas (v1, etc.)
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== NOMBRE_CACHE) {
            console.log('[Service Worker] Eliminando caché obsoleta:', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// 3. INTERCEPCIÓN DE PETICIONES (Network-First con fallback a Caché)
self.addEventListener('fetch', (event) => {
  // Solo procesar peticiones GET
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request)
      .then((respuestaRed) => {
        // Si hay red, actualiza la caché dinámicamente con los nuevos estilos/scripts
        const clonRespuesta = respuestaRed.clone();
        caches.open(NOMBRE_CACHE).then((cache) => {
          cache.put(event.request, clonRespuesta);
        });
        return respuestaRed;
      })
      .catch(() => {
        // Si no hay conexión, sirve desde la caché
        return caches.match(event.request).then((respuestaCache) => {
          if (respuestaCache) {
            return respuestaCache;
          }
          // Fallback para la navegación si se solicita un HTML offline
          if (event.request.headers.get('accept')?.includes('text/html')) {
            return caches.match('./index.html');
          }
        });
      })
  );
});