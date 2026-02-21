const CACHE_VERSION = 'v1';
const CACHE_NAME = `LF-cache-${CACHE_VERSION}`;

const APP_ASSETS = [
    './',
    './index.html',
    './learn.html',
    './stats.html',
    './style.css',
    './app.js',
    './icons/icon-192.png',
    './icons/icon-512.png'
]
// cachowanie podstawowych/krytycznych zasobów do odpalenia strony offline
self.addEventListener('install', event => {

    event.waitUntil(
        caches.open(CACHE_NAME)
        .then(cache => {
            return cache.addAll(APP_ASSETS);
        })
        .then(()=> {
            return self.skipWaiting();
        })
        .catch(error =>{
            console.error('Błąd podczas cacheowania: ', error);
        })
    );
    //
    
})
// czyszczenia starych cachy
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys()
            .then(keys => {
                oldCaches = keys.filter(k => k.startsWith('LF-cache-') && k !== CACHE_NAME)
                return  Promise.all(
                oldCaches.map(k => {
                    return caches.delete(k);
                })
            )
            })
            .then(()=> {
                return self.clients.claim();
            })
            .catch(error => {
                console.error('Błąd podczas usuwania starych cache', error);
            })
    );
    //przejęcie kontroli przes SW nad wszystkimi otawrtymi kartami 
    
})
// strategia cachowania Stale-while-revalidate
self.addEventListener('fetch', event =>{
    const {request} = event;
    if(request.method !== 'GET') return;

    event.respondWith(
        caches.match(request).then(cached => {
            const networkFetch = fetch(request)
                .then(response => {
                    const clone = response.clone();
                    if( response.ok && request.url.startsWith(self.location.origin)) {
                        caches.open(CACHE_NAME).then(cache => cache.put(request, clone))
                    }
                    return response; 
                })
            return cached || networkFetch
        })
    )

})