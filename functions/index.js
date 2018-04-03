// this is the nodejs code running in firebase server

var functions = require('firebase-functions');
var admin = require('firebase-admin');//access to firebase db
var cors = require('cors')({origin: true});//gives cross origin access
var webpush = require('web-push');
var formidable = require('formidable');
var fs = require('fs');
var UUID = require('uuid-v4');

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//

var serviceAccount = require("./insta-clone-fb-key.json");

var gcconfig = {
  projectId: 'insta-clone-e3283',
  keyFilename: 'insta-clone-fb-key.json'
};

var gcs = require('@google-cloud/storage')(gcconfig);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://insta-clone-e3283.firebaseio.com/'
});

exports.storePostData = functions.https.onRequest(function (request, response) {
  cors(request, response, function () {//accessing req n res from parent onRequest()
    var uuid = UUID();
    var formData = new formidable.IncomingForm();
    formData.parse(request, function(err, fields, files) {
      fs.rename(files.file.path, '/tmp/' + files.file.name);
      var bucket = gcs.bucket('insta-clone-e3283.appspot.com');

      bucket.upload('/tmp/' + files.file.name, {
        uploadType: 'media',
        metadata: {
          metadata: {
            contentType: files.file.type,
            firebaseStorageDownloadTokens: uuid
          }
        }
      }, function(err, file) {
        if (!err) {
          admin.database().ref('posts').push({ //core part of server where db is stored
            id: fields.id,
            title: fields.title,
            location: fields.location,
            rawLocation: {
              lat: fields.rawLocationLat,
              lng: fields.rawLocationLng
            },
            image: 'https://firebasestorage.googleapis.com/v0/b/' + bucket.name + '/o/' + encodeURIComponent(file.name) + '?alt=media&token=' + uuid
          })
            .then(function() { //this will run only if data is stored successfully
              webpush.setVapidDetails('mailto:business@ano.com', 'BKbNXqUJ0PuBQdkdinhIw1r7kalw3Lfc_hpng72lMxvcFbAmUNFNsTbadyCyxcmCh3XStur7Sd26OgMJapvpdYc', 'KI-RuBsrAcQPlqfcPwfLUPMI_hCrOUckhjNQVdaTFak');
              return admin.database().ref('subscriptions').once('value');
            })
            .then(function (subscriptions) {
              subscriptions.forEach(function (sub) {//sub holds endpoint and keys
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
                  .catch(function (err) {
                    console.log(err);
                  })
              });
              response.status(201).json({message: 'Data stored', id: fields.id});
            })
            .catch(function (err) {
              response.status(500).json({error: err});
            });
        } else {
          console.log(err);
        }
      });
    });
  });
});
