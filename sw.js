/* ==========================================
   SERVICE WORKER (sw.js) - PWA Y OFFLINE
   ========================================== */

const CACHE_NAME = 'planner-app-v1';

// Recursos críticos a guardar en el caché inicial
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './styles.css',
  './script.js',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png',
  // Fuentes externas y dependencias CDN (si usas FullCalendar o Google Fonts)
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&family=Poppins:wght@700;800;900&display=swap',
  'https://cdn.jsdelivr.net/npm/fullcalendar@6.1.8/index.global.min.css'
];

/* ------------------------------------------
   1. INSTALACIÓN
   ------------------------------------------ */
self.addEventListener('install', (event) => {
  // Fuerza al Service Worker a activarse inmediatamente sin esperar a que el usuario recargue
  self.skipWaiting();

  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Guardando recursos críticos en caché...');
      // Usamos addAll de forma segura (ignorando errores de assets externos opcionales si fallan)
      return Promise.allSettled(
        ASSETS_TO_CACHE.map((url) => cache.add(url))
      );
    })
  );
});

/* ------------------------------------------
   2. ACTIVACIÓN Y LIMPIEZA
   ------------------------------------------ */
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('[SW] Eliminando caché antiguo:', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim()) // Toma control de la app inmediatamente
  );
});

/* ------------------------------------------
   3. ESTRATEGIA DE INTERCEPTACIÓN (FETCH)
   ------------------------------------------ */
self.addEventListener('fetch', (event) => {
  // Ignorar peticiones no GET o de extensiones
  if (event.request.method !== 'GET' || !event.request.url.startsWith('http')) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // Si el recurso está en el caché, lo entrega rápido
      if (cachedResponse) {
        // Opcional: Actualizar el caché en segundo plano (Stale-While-Revalidate)
        fetch(event.request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              caches.open(CACHE_NAME).then((cache) => cache.put(event.request, networkResponse));
            }
          })
          .catch(() => {/* Red no disponible, continua usando el caché */});

        return cachedResponse;
      }

      // Si no está en caché, lo busca en la red
      return fetch(event.request)
        .then((networkResponse) => {
          // Si la respuesta es válida, guardamos una copia en el caché dinámico
          if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          // Si falla la red y es una página navegable, sirve el index.html
          if (event.request.mode === 'navigate') {
            return caches.match('./index.html');
          }
        });
    })
  );
});

/* ------------------------------------------
   4. MANEJO DE NOTIFICACIONES PUSH (OPCIONAL)
   ------------------------------------------ */
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.text() : '¡Tiempo terminado!';
  const options = {
    body: data,
    icon: './icons/icon-192.png',
    badge: './icons/icon-192.png',
    vibrate: [200, 100, 200]
  };

  event.waitUntil(
    self.registration.showNotification('Pomodoro Planner', options)
  );
});