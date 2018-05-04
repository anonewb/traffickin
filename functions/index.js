var functions = require("firebase-functions");
var admin = require("firebase-admin");
var cors = require("cors")({ origin: true });
var webpush = require("web-push");
var formidable = require("formidable");
var fs = require("fs");
var UUID = require("uuid-v4");
var os = require("os");
var Busboy = require("busboy");
var path = require('path');

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//

var serviceAccount = require("./insta-clone-fb-key.json");

var gcconfig = {
  projectId: "insta-clone-e3283",
  keyFilename: "insta-clone-fb-key.json"
};

var gcs = require("@google-cloud/storage")(gcconfig);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://insta-clone-e3283.firebaseio.com/"
});

exports.storePostData = functions.https.onRequest(function(request, response) {
  cors(request, response, function() { //accessing req n res from parent onRequest()
    var uuid = UUID();

    const busboy = new Busboy({ headers: request.headers });
    // These objects will store the values (file + fields) extracted from busboy
    let upload;
    const fields = {};

    // This callback will be invoked for each file uploaded
    busboy.on("file", (fieldname, file, filename, encoding, mimetype) => {
      console.log(
        `File [${fieldname}] filename: ${filename}, encoding: ${encoding}, mimetype: ${mimetype}`
      );
      const filepath = path.join(os.tmpdir(), filename);
      upload = { file: filepath, type: mimetype };
      file.pipe(fs.createWriteStream(filepath));
    });

    // This will invoked on every field detected
    busboy.on('field', function(fieldname, val, fieldnameTruncated, valTruncated, encoding, mimetype) {
      fields[fieldname] = val;
    });

    // This callback will be invoked after all uploaded files are saved.
    busboy.on("finish", () => {
      var bucket = gcs.bucket("insta-clone-e3283.appspot.com");
      bucket.upload(
        upload.file,
        {
          uploadType: "media",
          metadata: {
            metadata: {
              contentType: upload.type,
              firebaseStorageDownloadTokens: uuid
            }
          }
        },
        function(err, uploadedFile) {
          if (!err) {
            admin
              .database() //core part of server where db is stored
              .ref("posts")
              .push({
                title: fields.title,
                location: fields.location,
                rawLocation: {
                  lat: fields.rawLocationLat,
                  lng: fields.rawLocationLng
                },
                image:
                  "https://firebasestorage.googleapis.com/v0/b/" +
                  bucket.name +
                  "/o/" +
                  encodeURIComponent(uploadedFile.name) +
                  "?alt=media&token=" +
                  uuid
              }) 
              .then(function() { //this will run only if data is stored successfully
                webpush.setVapidDetails(
                  "mailto:business@ano.com",
                  "BKbNXqUJ0PuBQdkdinhIw1r7kalw3Lfc_hpng72lMxvcFbAmUNFNsTbadyCyxcmCh3XStur7Sd26OgMJapvpdYc",
                  "KI-RuBsrAcQPlqfcPwfLUPMI_hCrOUckhjNQVdaTFak"
                );
                return admin
                  .database()
                  .ref("subscriptions")
                  .once("value");
              })
              .then(function(subscriptions) {
                subscriptions.forEach(function(sub) { //sub holds endpoint and keys
                  var pushConfig = {
                    endpoint: sub.val().endpoint,
                    keys: {
                      auth: sub.val().keys.auth,
                      p256dh: sub.val().keys.p256dh
                    }
                  };

                  webpush
                    .sendNotification(
                      pushConfig,
                      JSON.stringify({
                        title: "New Post",
                        content: "New Post added!",
                        openUrl: "/help"
                      })
                    )
                    .catch(function(err) {
                      console.log(err);
                    });
                });
                response
                  .status(201)
                  .json({ message: "Data stored", id: fields.id });
              })
              .catch(function(err) {
                response.status(500).json({ error: err });
              });
          } else {
            console.log(err);
          }
        }
      );
    });

    // The raw bytes of the upload will be in request.rawBody.  Send it to busboy, and get
    // a callback when it's finished.
    busboy.end(request.rawBody);
    // formData.parse(request, function(err, fields, files) {
    //   fs.rename(files.file.path, "/tmp/" + files.file.name);
    //   var bucket = gcs.bucket("YOUR_PROJECT_ID.appspot.com");
    // });
  });
});


/*

MUST READ: Required Changes to Cloud Function Code
Section 11, Lecture 166
What do you need to do?

Replace the content of your functions/index.js  file with the content of the file attached to this and the last lecture (pick either of the two, they contain the same content).

Replace YOUR_PROJECT_ID  with, well, your Firebase project id.

Run npm install --save busboy  inside the functions/  folder (i.e. cd functions  first).

That's it!

Why?

Firebase cloud functions received a breaking change that impacts how we parse request data. Therefore, Formidable doesn't work anymore.

See the following thread for more infos: https://stackoverflow.com/questions/47242340/how-to-upload-a-file-using-express-on-firebase-cloud-functions

We'll use the workaround explained there. Attached to the last and this lecture, you find the updated function code - no changes to other files (e.g. service worker etc.) are required!

What changed in the cloud function code?

Firebase parses the request body for us and turns it into a Buffer (that's what changed - previously, it didn't parse it for us).

Hence we now use a different library - busboy  - to read the data from that Buffer. All the other code (e.g. upload file to bucket, store data in database) still is the same as shown in the video.

*/