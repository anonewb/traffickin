var deferredPrompt;
var enableNotificationsButtons = document.querySelectorAll('.enable-notifications');


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

function askForNotificationPermission() {
    Notification.requestPermission(function(result) {
      console.log('User Choice', result);
      if (result !== 'granted') {
        console.log('No notification permission granted!');
      } else {
        // hide button
      }
    });
  }

if ('Notification' in window) {
    for (var i = 0; i < enableNotificationsButtons.length; i++) {
      enableNotificationsButtons[i].style.display = 'inline-block';
      enableNotificationsButtons[i].addEventListener('click', askForNotificationPermission);
    }
  }