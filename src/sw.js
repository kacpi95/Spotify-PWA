const CACHE_NAME = 'spotify-clone-cache';
const ASSETS_TO_CACHE = [
  './index.html',
  './manifest.json',
  '/pages/playlist.html',
  '/css/styles.css',
  '/js/helpers.js',
  '/js/script.js',
  '/js/playlist.js',
  '/images/spotiBlack-icon.png',
  '/images/play-icon.png',
  '/images/plus-icon.png',
  '/images/check-icon.png',
];
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    }),
  );
  self.skipWaiting();
});


self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== CACHE_NAME)
            .map((key) => caches.delete(key)),
        ),
      ),
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cacheRes) => {
      return (
        cacheRes ||
        fetch(event.request).catch(
          () => caches.match('./index.html'),
        )
      );
    }),
  );
});
