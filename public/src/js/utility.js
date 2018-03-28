
var dbPromise = idb.open('posts-store', 1, function (db) {
    if (!db.objectStoreNames.contains('posts')) {
      db.createObjectStore('posts', {keyPath: 'id'});
    }
  });
  
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