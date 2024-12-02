const CACHE_NAME = 'stackture-cache-v1';
const ICON_CACHE = 'stackture-icons-v1';

self.addEventListener('install', (event) => {
    event.waitUntil(
        Promise.all([
            caches.open(CACHE_NAME),
            caches.open(ICON_CACHE)
        ])
    );
});

self.addEventListener('fetch', (event) => {
    if (event.request.url.includes('/icons/')) {
        event.respondWith(
            caches.open(ICON_CACHE).then(cache => 
                cache.match(event.request).then(response => {
                    if (response) {
                        return response;
                    }
                    return fetch(event.request).then(networkResponse => {
                        cache.put(event.request, networkResponse.clone());
                        return networkResponse;
                    });
                })
            )
        );
    }
}); 