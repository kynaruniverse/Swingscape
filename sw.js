const CACHE_NAME = 'swingscape-v3';
const FILES_TO_CACHE = [
  './index.html',
  './css/style.css',
  './js/main.js',
  './js/physics.js',
  './js/player.js',
  './js/world.js',
  './js/city.js',
  './manifest.json'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(FILES_TO_CACHE))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((res) => res || fetch(e.request))
  );
});