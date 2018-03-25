var deferredPrompt;

if(!window.Promise){
    window.Promise = Promise;
}

if('serviceWorker' in navigator){ // check if serviceWorker prop is present in navigator obj
    navigator.serviceWorker
        .register('/sw.js') // register this file as SW
        .then(function(){
            console.log('Service worker registered');
        });
}

window.addEventListener('beforeinstallprompt', function(event){
    console.log('beforeinstallprompt fired');
    event.preventDefault();
    deferredPrompt = event;
    return false;
});