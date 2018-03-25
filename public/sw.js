self.addEventListener('install', function(event){
  console.log('[Service Worker] Installing SW...', event);
});

self.addEventListener('activate', function(event){ 
  console.log('[Service Worker] Activating SW...', event);
  return self.clients.claim();
});
// install and active events are triggered by browser

self.addEventListener('fetch', function(event){ //fetch event is triggered by webApp
  event.respondWith(fetch(event.request));
}); 