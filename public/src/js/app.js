if('serviceWorker' in navigator){ // check if serviceWorker prop is present in navigator obj
    navigator.serviceWorker
        .register('/sw.js') // register this file as SW
        .then(function(){
            console.log('Service worker registered');
        });
}