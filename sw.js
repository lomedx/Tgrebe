const CACHE_NAME = 'matjari-v9';
const FILES_TO_CACHE = [
    './',
    './متجري.html',
    './manifest.json',
    './icon-192.png',
    './icon-512.png'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => cache.addAll(FILES_TO_CACHE))
    );
    self.skipWaiting();
});

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys => {
            return Promise.all(
                keys.filter(key => key !== CACHE_NAME)
                    .map(key => caches.delete(key))
            );
        })
    );
    self.clients.claim();
});

self.addEventListener('fetch', event => {
    if(event.request.method !== 'GET') return;
    if(!event.request.url.startsWith(self.location.origin)) {
        return event.respondWith(fetch(event.request).catch(() => caches.match(event.request)));
    }
    event.respondWith(
        caches.match(event.request).then(cached => {
            if(cached) {
                fetch(event.request).then(response => {
                    if(response && response.status === 200) {
                        caches.open(CACHE_NAME).then(cache => cache.put(event.request, response.clone()));
                    }
                }).catch(() => {});
                return cached;
            }
            return fetch(event.request).then(response => {
                if(!response || response.status !== 200) return response;
                const responseClone = response.clone();
                caches.open(CACHE_NAME).then(cache => cache.put(event.request, responseClone));
                return response;
            }).catch(() => caches.match('./متجري.html'));
        })
    );
});
