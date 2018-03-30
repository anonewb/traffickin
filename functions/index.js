var functions = require('firebase-functions');
var admin = require('firebase-admin'); //access to firebase db
var cors = require('cors')({origin: true}); //gives cross origin access

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions

var serviceAccount = require("./insta-clone-fb-key.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://insta-clone-e3283.firebaseio.com"
});


exports.storePostData = functions.https.onRequest(function(request, response) {
    cors(request, response, function() { //accessing req n res from parent onRequest()
      admin.database().ref('posts').push({
        id: request.body.id,
        title: request.body.title,
        location: request.body.location,
        image: request.body.image
      })
        .then(function() {
          response.status(201).json({message: 'Data stored', id: request.body.id});
        })
        .catch(function(err) {
          response.status(500).json({error: err});
        });
    });
});