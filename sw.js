/* Service worker — caching per design spec §3.5
   - HTML/CSS/JS: network-first, cache fallback (fresh content)
   - Images: cache-first, network fallback (immutable placeholders/real)
   - Video: network-only, never cached (user-initiated, ~MBs)
*/

const CACHE_NAME = 'portfolio-v2';

const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/jarvis.html',
  '/research.html',
  '/about.html',
  '/contact.html',
  '/styles.css',
  '/script.js',
  '/assets/icons/bowtie.svg',
  '/manifest.json',
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => Promise.allSettled(
        STATIC_ASSETS.map((asset) => cache.add(asset))
      ))
      .then((results) => {
        results.forEach((r, i) => {
          if (r.status === 'rejected') console.warn('[sw] precache failed:', STATIC_ASSETS[i]);
        });
        return self.skipWaiting();
      })
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);

  // Same-origin only; let the browser handle everything else
  if (url.origin !== self.location.origin) return;

  // Videos: never cache (too large, user-initiated)
  if (url.pathname.endsWith('.mp4')) {
    e.respondWith(fetch(e.request));
    return;
  }

  // Images: cache-first, network fallback (+ backfill cache)
  if (url.pathname.match(/\.(webp|jpg|jpeg|png|svg)$/)) {
    e.respondWith(
      caches.match(e.request).then((cached) => {
        if (cached) return cached;
        return fetch(e.request).then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(e.request, clone));
          return response;
        });
      })
    );
    return;
  }

  // HTML/CSS/JS: network-first, cache fallback
  e.respondWith(
    fetch(e.request)
      .then((response) => {
        const clone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(e.request, clone));
        return response;
      })
      .catch(() => caches.match(e.request))
  );
});
