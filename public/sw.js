self.addEventListener('install', function(event){
  console.log('[Service Worker] Installing SW...', event);
  event.waitUntil(
    caches.open('static') //static will be the name of the cache
      .then(function(cache){
        console.log('[Service Worker] Precaching App Shell');
        cache.add('/'); // think about this as requests not as paths
        cache.add('/index.html'); // you have urls here, caching urls i.e caching requests
        cache.add('/src/js/app.js');
      })
  )
});

self.addEventListener('activate', function(event){ 
  console.log('[Service Worker] Activating SW...', event);
  return self.clients.claim();
});
// install and active events are triggered by browser

self.addEventListener('fetch', function(event){ //fetch event is triggered by webApp
  event.respondWith(
    caches.match(event.request) //caches refers to overall cache storage
      .then(function(response){
        if(response)
        return response;
        else 
        return fetch(event.request);
      })
  );
}); 