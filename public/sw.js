// Bump whenever public/data changes so clients drop the cached dataset.
const CACHE_NAME = 'mm-pcode-cache-v5';
// '/' is here so the app opens offline after a single visit; without it the
// shell is only cached once the worker has controlled a navigation, i.e. from
// the second visit on.
const STATIC_ASSETS = [
  '/',
  '/favicon.ico',
  '/manifest.json',
  '/assets/logo.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // The offline dataset is stored in IndexedDB by the sync in lib/offlineDb.
  // Caching it here too would double the storage and, worse, make the
  // stale-while-revalidate branch below hand "Re-download / Update" the old
  // dataset. Leave these requests to the browser so a re-download is a real one.
  if (url.pathname.startsWith('/data/')) {
    return;
  }

  // For HTML navigation requests, always do NETWORK FIRST so users immediately see updates!
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          if (networkResponse.status === 200) {
            const clone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return networkResponse;
        })
        .catch(async () => {
          // respondWith(undefined) throws, so never return a bare cache miss.
          const cached = await caches.match(request);
          return cached || new Response('You are offline and this page is not cached.', {
            status: 503,
            headers: { 'Content-Type': 'text/plain; charset=utf-8' }
          });
        })
    );
    return;
  }

  // Network-first for API GET requests with cache fallback
  if (url.pathname.startsWith('/api/') && request.method === 'GET') {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          if (networkResponse.status === 200) {
            const clone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return networkResponse;
        })
        .catch(async () => {
          const cached = await caches.match(request);
          // A 200 with an empty result list is indistinguishable from a real
          // "no matches" answer, so callers reported offline failures as
          // success. Answer 503 and let them fall back to the offline data.
          return cached || new Response(JSON.stringify({ error: 'Offline: no cached response for this request.' }), {
            status: 503,
            headers: { 'Content-Type': 'application/json' }
          });
        })
    );
    return;
  }

  // Stale-while-revalidate for static assets
  if (request.method === 'GET') {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        const fetchPromise = fetch(request).then((networkResponse) => {
          if (networkResponse.status === 200 && networkResponse.type === 'basic') {
            const clone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return networkResponse;
        }).catch(() => cachedResponse);

        return cachedResponse || fetchPromise;
      })
    );
  }
});
