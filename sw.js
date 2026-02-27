// SensoryPeak Service Worker
const VERSION = 'V1.1';
const CACHE_NAME = 'sensorywave-' + VERSION;

self.addEventListener('install', function(event) {
  console.log('[SW] Installing version:', VERSION);
  // Take control immediately — no waiting for old tabs to close
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(['/', '/index.html']);
    })
  );
});

self.addEventListener('activate', function(event) {
  console.log('[SW] Activating version:', VERSION);
  event.waitUntil(
    // Wipe all old caches from previous versions
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.filter(function(name) {
          return name !== CACHE_NAME;
        }).map(function(name) {
          console.log('[SW] Deleting old cache:', name);
          return caches.delete(name);
        })
      );
    }).then(function() {
      // Claim all open tabs immediately
      return self.clients.claim();
    })
  );
});

self.addEventListener('fetch', function(event) {
  // Network-first: always try to get fresh content
  // Falls back to cache only if offline
  event.respondWith(
    fetch(event.request, {cache: 'no-store'}).then(function(response) {
      // Cache the fresh response for offline use
      var clone = response.clone();
      caches.open(CACHE_NAME).then(function(cache) {
        cache.put(event.request, clone);
      });
      return response;
    }).catch(function() {
      return caches.match(event.request);
    })
  );
});
