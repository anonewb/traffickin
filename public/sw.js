self.addEventListener('install', function(event){
    console.log('[Service Worker] Installing SW...', event);
});

self.addEventListener('activate', function(event){
    console.log('[Service Worker] Activating SW...', event);
    return self.clients.claim();
});