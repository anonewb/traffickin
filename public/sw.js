self.addEventListener('install', function(event){
  console.log('[Service Worker] Installing SW...', event);
  event.waitUntil(
    caches.open('static') //static will be the name of the cache
      .then(function(cache){
        console.log('[Service Worker] Precaching App Shell');
        // cache.add('/'); // think about this as requests not as paths
        // cache.add('/index.html'); // you have urls here, caching urls i.e caching requests
        // cache.add('/src/js/app.js');
        cache.addAll([
          '/',
          '/index.html',
          '/src/js/app.js',
          '/src/js/feed.js',
          '/src/js/promise.js',
          '/src/js/fetch.js',
          '/src/js/material.min.js',
          '/src/css/app.css',
          '/src/css/feed.css',
          '/src/images/main-image.jpg',
          'https://fonts.googleapis.com/css?family=Roboto:400,700',
          'https://fonts.googleapis.com/icon?family=Material+Icons',
          'https://cdnjs.cloudflare.com/ajax/libs/material-design-lite/1.3.0/material.indigo-pink.min.css'
        ]);
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
        if(response) {
          return response;
        }
        else {
          return fetch(event.request)
            .then(function(res){
              return caches.open('dynamic')
                .then(function(cache){
                  cache.put(event.request.url, res.clone());
                  return res;
                })
            });      
        }
      })
  );
}); 