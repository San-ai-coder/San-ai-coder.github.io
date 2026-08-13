/* ==========================================
   SERVICE WORKER - PWA ACADÉMICA (DEFINITIVO)
   ========================================== */

const NOMBRE_CACHE = 'app-academica-v1';

// Archivos y librerías clave guardadas localmente
const ARCHIVOS_CACHE = [
  './',
  './index.html',
  './style.css',
  './script.js',
  './manifest.json',
  './hinata-shoyo.gif',
  './Get Lucky (feat. Pharrell Williams and Nile Rodgers).mp3',
  'https://cdn.jsdelivr.net/npm/fullcalendar@6.1.10/index.global.min.min.css',
  'https://cdn.jsdelivr.net/npm/fullcalendar@6.1.10/index.global.min.js',
  'https://cdn.jsdelivr.net/npm/chart.js',
  'https://cdn.jsdelivr.net/npm/canvas-confetti@1.6.0/dist/confetti.browser.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css'
];

// 1. Instalación e inoculación de caché
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(NOMBRE_CACHE).then((cache) => {
      console.log('[Service Worker] Almacenando recursos estáticos...');
      return cache.addAll(ARCHIVOS_CACHE);
    }).then(() => self.skipWaiting())
  );
});

// 2. Activación y limpieza de caché obsoleta
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== NOMBRE_CACHE) {
            console.log('[Service Worker] Removiendo caché antigua:', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// 3. Estrategia Network First con respaldo Offline
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request)
      .then((respuestaRed) => {
        const clonRespuesta = respuestaRed.clone();
        caches.open(NOMBRE_CACHE).then((cache) => {
          cache.put(event.request, clonRespuesta);
        });
        return respuestaRed;
      })
      .catch(() => {
        return caches.match(event.request).then((respuestaCache) => {
          if (respuestaCache) {
            return respuestaCache;
          }
          if (event.request.headers.get('accept')?.includes('text/html')) {
            return caches.match('./index.html');
          }
        });
      })
  );
});