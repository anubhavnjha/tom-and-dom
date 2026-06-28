/* =============================================
   tom' and dom' — sw.js
   Service Worker: caches site for offline use
   so poems are saved on every visitor's phone
   ============================================= */

const CACHE  = 'tom-dom-v7'; // Update version string here!
const ASSETS = [
  './',
  './index.html',
  './poems.html',
  './admin.html',
  './admin-script.js',
  './style.css',
  './script.js',
  './poems-script.js',
  './data/poems.json',
  './manifest.json',
  'https://fonts.googleapis.com/css2?family=IM+Fell+English:ital@0;1&family=Playfair+Display:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400;1,500&display=swap',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css'
];

// ── Install: cache all core assets ───────────
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE).then(cache => {
      return cache.addAll(ASSETS).catch(err => {
        console.warn('[SW] Some assets failed to cache:', err);
      });
    })
  );
  self.skipWaiting();
});

// ── Activate: remove old caches ───────────────
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== CACHE).map(k => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

// ── Fetch: network-first for poems.json (so new
//    poems always load), cache-first for everything
//    else (fast loads + offline support) ─────────
self.addEventListener('fetch', event => {
  const url = event.request.url;

  // Always try network first for poems data so updates arrive immediately
  if (url.includes('poems.json')) {
    event.respondWith(
      fetch(event.request)
        .then(res => {
          const clone = res.clone();
          caches.open(CACHE).then(cache => cache.put(event.request, clone));
          return res;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // Cache-first for everything else
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request).then(res => {
        if (!res || res.status !== 200 || res.type === 'opaque') return res;
        const clone = res.clone();
        caches.open(CACHE).then(cache => cache.put(event.request, clone));
        return res;
      });
    })
  );
});
