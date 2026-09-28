const CACHE_NAME = 'pmb-cache-v1.0';
const STATIC_ASSETS = [
    './',
    './index.html',
    './manifest.json',
    'https://iili.io/nuUTLcN.md.png'
];

self.addEventListener('install', (event) => {
    event.waitUntil( caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS)) );
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all( cacheNames.filter((name) => name !== CACHE_NAME).map((name) => caches.delete(name)) );
        })
    );
    self.clients.claim();
});

self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);
    // BYPASS MUTLAK: Biarkan koneksi Supabase realtime, JANGAN DI-CACHE!
    if (url.hostname.includes('supabase.co')) {
        event.respondWith(fetch(event.request));
        return;
    }
    event.respondWith(
        fetch(event.request).catch(() => {
            return caches.match(event.request).then((response) => {
                if (response) return response;
                if (event.request.mode === 'navigate') return caches.match('./index.html');
            });
        })
    );
});
