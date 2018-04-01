// this is the nodejs code running in firebase server

var functions = require('firebase-functions');
var admin = require('firebase-admin'); //access to firebase db
var cors = require('cors')({origin: true}); //gives cross origin access
var webpush = require('web-push');

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions

var serviceAccount = require("./insta-clone-fb-key.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://insta-clone-e3283.firebaseio.com"
});


exports.storePostData = functions.https.onRequest(function(request, response) {
    cors(request, response, function() { //accessing req n res from parent onRequest()
      admin.database().ref('posts').push({ //core part of server where db is stored
        id: request.body.id,
        title: request.body.title,
        location: request.body.location,
        image: request.body.image
      })
        .then(function() { //this will run only if data is stored successfully
          webpush.setVapidDetails('mailto:business@ano.com', 'BKbNXqUJ0PuBQdkdinhIw1r7kalw3Lfc_hpng72lMxvcFbAmUNFNsTbadyCyxcmCh3XStur7Sd26OgMJapvpdYc', 'KI-RuBsrAcQPlqfcPwfLUPMI_hCrOUckhjNQVdaTFak');
          return admin.database().ref('subscriptions').once('value');
        })
        .then(function (subscriptions) {
          subscriptions.forEach(function (sub) { //sub holds endpoint and keys
            var pushConfig = {
              endpoint: sub.val().endpoint,
              keys: {
                auth: sub.val().keys.auth,
                p256dh: sub.val().keys.p256dh
              }
            };
  
            webpush.sendNotification(pushConfig, JSON.stringify({
              title: 'New Post', 
              content: 'New Post added!',
              openUrl: '/help'
            })) //2nd arg of sendNotification() is paypload
              .catch(function(err) {
                console.log(err);
              })
          });
          response.status(201).json({message: 'Data stored', id: request.body.id});
        })
        .catch(function(err) {
          response.status(500).json({error: err});
        });
    });
});