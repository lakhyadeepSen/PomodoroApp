const CACHE_NAME = 'pomodoro-app-cache-v4';
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
    console.log('Handling fetch event for:', event.request.url);
    event.respondWith(
        caches.match(event.request).then((response) => {
            if (response) {
                console.log('Serving from cache:', event.request.url);
                return response;
            }
            console.log('Fetching from network:', event.request.url);
            return fetch(event.request);
        }).catch((error) => {
            console.error('Fetch failed for:', event.request.url, error);
        })
    );
});