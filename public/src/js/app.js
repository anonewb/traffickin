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

function displayConfirmNotification() {
  if ('serviceWorker' in navigator) {
    var options = {
      body: 'You successfully subscribed to our Notification service!',
      icon: '/src/images/icons/app-icon-96x96.png',
      image: '/src/images/sf-boat.jpg',
      dir: 'ltr',
      lang: 'en-US', // BCP 47,
      vibrate: [100, 50, 200],
      badge: '/src/images/icons/app-icon-96x96.png',
      tag: 'confirm-notification',
      renotify: true,
      actions: [
        { action: 'confirm', title: 'Okay', icon: '/src/images/icons/app-icon-96x96.png' },
        { action: 'cancel', title: 'Cancel', icon: '/src/images/icons/app-icon-96x96.png' }
      ]
    };

    navigator.serviceWorker.ready
      .then(function(swreg) {
        swreg.showNotification('Successfully subscribed! (from SW)', options);
      });
  }
}


function askForNotificationPermission() {
    Notification.requestPermission(function(result) {
      console.log('User Choice', result);
      if (result !== 'granted') {
        console.log('No notification permission granted!');
      } else {
        displayConfirmNotification();
      }
    });
  }

if ('Notification' in window) {
    for (var i = 0; i < enableNotificationsButtons.length; i++) {
      enableNotificationsButtons[i].style.display = 'inline-block';
      enableNotificationsButtons[i].addEventListener('click', askForNotificationPermission);
    }
  }