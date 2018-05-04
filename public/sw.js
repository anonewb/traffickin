
importScripts('/src/js/idb.js');
importScripts('/src/js/utility.js');

var CACHE_STATIC_NAME = 'static-v30';
var CACHE_DYNAMIC_NAME = 'dynamic-v3';
var STATIC_FILES = [ //App Shell
  '/', // imp to cache
  '/index.html', // think about this as requests not as paths
  '/offline.html', // you have urls here, caching urls i.e caching requests
  '/src/js/app.js',
  '/src/js/utility.js',
  '/src/js/feed.js',
  '/src/js/idb.js',
  '/src/js/promise.js',
  '/src/js/fetch.js',
  '/src/js/material.min.js',
  '/src/css/app.css',
  '/src/css/feed.css',
  '/src/images/main-image.jpg',
  'https://fonts.googleapis.com/css?family=Roboto:400,700',
  'https://fonts.googleapis.com/icon?family=Material+Icons',
  'https://cdnjs.cloudflare.com/ajax/libs/material-design-lite/1.3.0/material.indigo-pink.min.css'
];

// TO LIMIT THE NO OF CACHING ITEMS
// function trimCache(cacheName, maxItems) {
//   caches.open(cacheName)
//     .then(function (cache) {
//       return cache.keys()
//         .then(function (keys) {
//           if (keys.length > maxItems) {
//             cache.delete(keys[0])
//               .then(trimCache(cacheName, maxItems));
//           }
//         });
//     })
// }

//*** 'install' and 'activate' events are triggered by the browser
//*** while 'fetch' event is triggered for each of the fetch requests from index.html like images, scripts files, styles files, icon, font, etc 
// and also triggered by the fetch() used in app.js as its also making a GET request.

// Caching the App Shell(static content) on Install
self.addEventListener('install', function (event) { //***this install stage will be triggered when user visit's pg for first time
  console.log('[Service Worker] Installing Service Worker ...', event);
  event.waitUntil(
    caches.open(CACHE_STATIC_NAME) //CACHE_STATIC_NAME will be the name of the cache. GOTO Application>cache storage
      .then(function (cache) {
        console.log('[Service Worker] Precaching App Shell');
        // cache.add('/'); // think about this as requests not as paths
        // cache.add('/index.html'); // you have urls here, caching urls i.e caching requests
        // cache.add('/src/js/app.js');
        cache.addAll(STATIC_FILES);
      })
  )
});

// Updating the App Shell to remove old resources from the cache
// 'activate' event is triggered only when tabs are reopened
self.addEventListener('activate', function (event) {
  console.log('[Service Worker] Activating Service Worker ....', event);
  event.waitUntil( // activate event is waited until this fn is finished executing
    caches.keys() //keys returns with names of array of [cached files both static-v2 and dynamic-v1]
      .then(function (keyList) {
        return Promise.all(keyList.map(function (key) { // Promise.all takes all promises and waits untill they are finished 
                                                        // and 'keyList' contains array of strings, map() executes on each item of array tranforms it into array of objects
          if (key !== CACHE_STATIC_NAME && key !== CACHE_DYNAMIC_NAME) {
            console.log('[Service Worker] Removing old cache.', key);
            return caches.delete(key);
          }
        }));
      })
  );
  return self.clients.claim();
});

function isInArray(string, array) {
  var cachePath;
  if (string.indexOf(self.origin) === 0) { // request targets domain where we serve the page from (i.e. NOT a CDN)
    console.log('matched ', string);
    cachePath = string.substring(self.origin.length); // take the part of the URL AFTER the domain (e.g. after localhost:8080)
  } else {
    cachePath = string; // store the full request (for CDNs)
  }
  return array.indexOf(cachePath) > -1;
}
// install and active events are triggered by browser


// cache with network fallback strategy OR cache 1st, then network
self.addEventListener('fetch', function (event) {
  var url = 'https://insta-clone-e3283.firebaseio.com/posts';
  if (event.request.url.indexOf(url) > -1) { //STRATEGY: CACHE THEN NETWORK
    event.respondWith(fetch(event.request)
      .then(function (res) {
        var clonedRes = res.clone();
        clearAllData('posts')
          .then(function () {
            return clonedRes.json();
          })
          .then(function (data) {
            for (var key in data) {
              writeData('posts', data[key])
            }
          });
        return res;
      })
    );
  } else if (isInArray(event.request.url, STATIC_FILES)) { //STRATEGY: CACHE ONLY STRATEGY
    event.respondWith(
      caches.match(event.request)
    );
  } else { //STRATEGY: CACHE FIRST, THEN NETWORK
    event.respondWith(
      caches.match(event.request)  //caches refers to overall cache storage
        .then(function (response) { //getting from cache
          if (response) {
            return response;
          } else {
            return fetch(event.request) //reach out to network if we dont have it in cache
              .then(function (res) {
                return caches.open(CACHE_DYNAMIC_NAME) //then we store the res in 'CACHE_DYNAMIC_NAME'
                  .then(function (cache) { //then take the cache and 
                    // trimCache(CACHE_DYNAMIC_NAME, 3); //MAX NO OF DYNAMIC CACHES WILL BE 4
                    cache.put(event.request.url, res.clone()); // put(req,res) - takes 2 args
                    return res;
                  })
              })
              .catch(function (err) { //if network also fails, i.e: providing offline fallback pg
                return caches.open(CACHE_STATIC_NAME) //open means storing in cache
                  .then(function (cache) {
                    if (event.request.headers.get('accept').includes('text/html')) {
                      return cache.match('/offline.html'); //match means getting from cache
                    }
                  });
              });
          }
        })
    );
  }
});


// old method

// self.addEventListener('fetch', function(event) {
//   event.respondWith(
//     caches.match(event.request)
//       .then(function(response) {
//         if (response) {
//           return response;
//         } else {
//           return fetch(event.request)
//             .then(function(res) {
//               return caches.open(CACHE_DYNAMIC_NAME)
//                 .then(function(cache) {
//                   cache.put(event.request.url, res.clone());
//                   return res;
//                 })
//             })
//             .catch(function(err) {
//               return caches.open(CACHE_STATIC_NAME)
//                 .then(function(cache) {
//                   return cache.match('/offline.html');
//                 });
//             });
//         }
//       })
//   );
// });

// old method



// Cache-only
// self.addEventListener('fetch', function (event) {
//   event.respondWith(
//     caches.match(event.request)
//   );
// });

// Network-only
// self.addEventListener('fetch', function (event) {
//   event.respondWith(
//     fetch(event.request)
//   );
// });

// network with cache fallback strategy OR network 1st, then cache
// self.addEventListener('fetch', function(event) {
//   event.respondWith(
//     fetch(event.request)
//       .then(function(res) {
//         return caches.open(CACHE_DYNAMIC_NAME)
//                 .then(function(cache) {
//                   cache.put(event.request.url, res.clone());
//                   return res;
//                 })
//       })
//       .catch(function(err) {
//         return caches.match(event.request);
//       })
//   );
// });


//whenever connectivity is re-established, SW will trigger this sync event. means now internet is on
self.addEventListener('sync', function(event) { 
  console.log('[Service Worker] Background syncing', event);
  if (event.tag === 'sync-new-posts') { //checking if tasks is 'sync-new-posts'
    console.log('[Service Worker] Syncing new Posts');
    event.waitUntil(
      readAllData('sync-posts') //reading/getting data from 'sync-post' store present in indexedDB
        .then(function(data) {
          for (var dt of data) { //looping coz user can post multiple posts
          // now this fn is similar to sendData() in feed.js
            var postData = new FormData();
            postData.append('id', dt.id);
            postData.append('title', dt.title);
            postData.append('location', dt.location);
            postData.append('rawLocationLat', dt.rawLocation.lat);
            postData.append('rawLocationLng', dt.rawLocation.lng);
            postData.append('file', dt.picture, dt.id + '.png');

            fetch('https://us-central1-insta-clone-e3283.cloudfunctions.net/storePostData', { // posting/sending data that we want to store in server
              method: 'POST',
              body: postData
            })
              .then(function(res) {
                console.log('Sent data', res);
                if (res.ok) { //checks if response is 200
                  res.json()
                    .then(function(resData) {
                      deleteItemFromData('sync-posts', resData.id); // then del that data.id from indexedDB if res was successful
                    });
                }
              })
              .catch(function(err) {
                console.log('Error while sending data', err);
              });
          }

        })
    );
  }
});

self.addEventListener('notificationclick', function(event) {
  var notification = event.notification;
  var action = event.action;

  console.log(notification);

  if (action === 'confirm') {
    console.log('Confirm was chosen');
    notification.close();
  } else {
    console.log(action);
    event.waitUntil( // if user clicks notif
      clients.matchAll()
        .then(function(clis) {
          var client = clis.find(function(c) {
            return c.visibilityState === 'visible';
          });

          if (client !== undefined) {
            client.navigate(notification.data.url); // BUG!!!!!!!!!!!!!!
            client.focus();
          } else {
            clients.openWindow(notification.data.url);
          }
          notification.close();
        })
    );
  }
});

self.addEventListener('notificationclose', function(event) {
  console.log('Notification was closed', event);
});


// Listening to Push Messages.
self.addEventListener('push', function(event) {
  console.log('Push Notification received', event);

  // if data fails to come from server
  var data = {title: 'New!', content: 'Something new happened!', openUrl: '/'};

  if (event.data) {
    data = JSON.parse(event.data.text());
  } else {
    data = 'Push message no payload';
  }

  var options = {
    body: data.content,
    icon: '/src/images/icons/app-icon-96x96.png',
    badge: '/src/images/icons/app-icon-96x96.png',
    data: {
      url: data.openUrl
    }
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});