// this file contents all the utility fn to manipulate indexedDB that can be reused


var dbPromise = idb.open('posts-store', 1, function (db) {
    if (!db.objectStoreNames.contains('posts')) { //this 'posts' obj store is for caching task
      db.createObjectStore('posts', {keyPath: 'id'}); //id uniquely identifies each task
    }
    if (!db.objectStoreNames.contains('sync-posts')) {
      db.createObjectStore('sync-posts', {keyPath: 'id'}); //this 'sync-posts' obj store is for synchronization task, ie store data in sync queue
    }
  });

// 
// takes 2 args: the 'store' we want to access and 'data' we want to write. eg: store = posts line5
function writeData(st, data) { //st = store
    return dbPromise
      .then(function(db) {
        var tx = db.transaction(st, 'readwrite');
        var store = tx.objectStore(st);
        store.put(data); //put() overwrites the old value with updated value
        return tx.complete;
      });
}

function readAllData(st) {
    return dbPromise
      .then(function(db) {
        var tx = db.transaction(st, 'readonly');
        var store = tx.objectStore(st);
        return store.getAll();
      });
}

// method 1 for clearing all the data stored in indexedDB after it has been del at firebase
function clearAllData(st) {
    return dbPromise
      .then(function(db) {
        var tx = db.transaction(st, 'readwrite');
        var store = tx.objectStore(st);
        store.clear();
        return tx.complete;
      });
  }


// method 2 for clearing specific data using id stored in indexedDB after it has been del at firebase
function deleteItemFromData(st, id) {
    dbPromise
      .then(function(db) {
        var tx = db.transaction(st, 'readwrite');
        var store = tx.objectStore(st);
        store.delete(id);
        return tx.complete;
      })
      .then(function() {
        console.log('Item deleted!');
      });
}


function urlBase64ToUint8Array(base64String) {
  var padding = '='.repeat((4 - base64String.length % 4) % 4);
  var base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  var rawData = window.atob(base64);
  var outputArray = new Uint8Array(rawData.length);

  for (var i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}