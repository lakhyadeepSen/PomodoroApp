const CACHE_NAME = 'pomodoro-app-cache-v2'; // Increment the version
const CACHE_ASSETS = [
  './',
  './index.html',
  './style.css',
  './script.js',
  './alarm.mp3', // Add the alarm sound to the cache
  './favicon.png'
];

// Install Event: Cache resources
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

// Fetch Event: Serve cached resources or fallback to the network
self.addEventListener('fetch', (event) => {
    event.respondWith(
      caches.match(event.request).then((response) => {
        // Return the cached resource, or fetch it from the network
        return response || fetch(event.request);
      }).catch(() => {
        // Optionally, return a fallback for specific requests
        if (event.request.destination === 'document') {
          return caches.match('./index.html');
        }
      })
    );
  });
  
