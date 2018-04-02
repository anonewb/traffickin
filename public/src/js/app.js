var deferredPrompt;
// selecting enableNotificationsButtons
var enableNotificationsButtons = document.querySelectorAll('.enable-notifications');


if(!window.Promise){
    window.Promise = Promise;
}

// check if serviceWorker prop is present in navigator obj
if('serviceWorker' in navigator){ 
    navigator.serviceWorker
        .register('/sw.js') // register this file as SW
        .then(function(){
            console.log('Service worker registered');
        })
        .catch(function(err) {
          console.log(err);
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
        swreg.showNotification('Successfully subscribed!', options);
      });
  }
}

function configurePushSub() {
  if (!('serviceWorker' in navigator)) {
    return;
  }

  var reg;
  navigator.serviceWorker.ready
    .then(function(swreg) {
      reg = swreg;
      return swreg.pushManager.getSubscription();
    })
    .then(function(sub) {
      if (sub === null) { //if yes, then this fn creates new sub in firebase console where we can see endpoints and keys
        // Create a new subscription
        var vapidPublicKey = 'BHLvvcMO51rXpnxR81qAyPgu6CXSjlf4IpK9H9lM1mwqolPWFYrEmoh6nd9oagLabmHDkna4a6QcjUZBbD4zZzE'; //generated using web-push pkg
        var convertedVapidPublicKey = urlBase64ToUint8Array(vapidPublicKey);
        return reg.pushManager.subscribe({ //returnning to backend
          userVisibleOnly: true,
          applicationServerKey: convertedVapidPublicKey //server is allowed to send push msg
        })
      } else {
        // We have a subscription
      }
    })  
    .then(function(newSub) {
      return fetch('https://insta-clone-e3283.firebaseio.com/subscriptions.json', { // 400 ERROR!!
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(newSub)
      })
      // .then(function(){
      //   console.log("yy");
      // })
      // .catch(function(err){
      //   console.log(err);
      // })
    })
    .then(function(res) {
      if (res.ok) {
        displayConfirmNotification();
      }
    })
    .catch(function(err) {
      console.log(err);
    });
}

function askForNotificationPermission() {
    Notification.requestPermission(function(result) {
      console.log('User Choice', result);
      if (result !== 'granted') {
        console.log('No notification permission granted!');
      } else {
        configurePushSub();
        // displayConfirmNotification();
      }
    });
  }

if ('Notification' in window && 'serviceWorker' in navigator) {
    for (var i = 0; i < enableNotificationsButtons.length; i++) {
      enableNotificationsButtons[i].style.display = 'inline-block';
      enableNotificationsButtons[i].addEventListener('click', askForNotificationPermission);
    }
  }