const CACHE_NAME = 'pomodoro-app-cache-v1';
const CACHE_ASSETS = [
  './',           // Cache index.html
  './index.html', 
  './style.css',
  './script.js',
  './alarm.mp3'
];

// Install Event: Caching Resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Caching assets...');
      return cache.addAll(CACHE_ASSETS);
    })
  );
});

// Activate Event: Cleanup old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('Removing old cache:', cache);
            return caches.delete(cache);
          }
        })
      );
    })
  );
});

// Fetch Event: Serve cached resources or fetch from network
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
