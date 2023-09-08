export {};

// Define the cache name and the files to cache
const CACHE_NAME = 'thilo-cache';
const urlsToCache = ['/', '/index.html', '/manifest.json', '/static' /* Add other assets you want to cache */];

// Install event - cache the app's static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    })
  );
});

// Fetch event - intercept network requests
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // Return cached response or fetch from the network
      return response || fetch(event.request);
    })
  );
});
