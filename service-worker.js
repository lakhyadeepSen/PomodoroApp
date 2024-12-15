const CACHE_NAME = 'pomodoro-app-cache-v3';
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
            // Check if the request is for the alarm sound
            if (!response && event.request.url.endsWith('alarm.mp3')) {
                console.error('Alarm sound is not cached!');
            }
            return response || fetch(event.request);
        }).catch((error) => {
            console.error('Error fetching resource:', event.request.url, error);
            // Optionally provide a fallback here
        })
    );
});