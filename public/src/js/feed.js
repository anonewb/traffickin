var shareImageButton = document.querySelector('#share-image-button');
var createPostArea = document.querySelector('#create-post');
var closeCreatePostModalButton = document.querySelector(
	'#close-create-post-modal-btn'
);
var sharedMomentsArea = document.querySelector('#shared-moments');
var form = document.querySelector('form'); //selecting form element
var titleInput = document.querySelector('#title'); //selecting titleInput element
var locationInput = document.querySelector('#location'); //selecting locationInput element
var videoPlayer = document.querySelector('#player');
var canvasElement = document.querySelector('#canvas');
var captureButton = document.querySelector('#capture-btn');
var imagePicker = document.querySelector('#image-picker');
var imagePickerArea = document.querySelector('#pick-image');
var picture;
var locationBtn = document.querySelector('#location-btn');
var locationLoader = document.querySelector('#location-loader');
var fetchedLocation = { lat: 0, lng: 0 };

locationBtn.addEventListener('click', function(event) {
	if (!('geolocation' in navigator)) {
		return;
	}
	var sawAlert = false;

	locationBtn.style.display = 'none';
	locationLoader.style.display = 'block';

	navigator.geolocation.getCurrentPosition(
		function(position) {
			locationBtn.style.display = 'inline';
			locationLoader.style.display = 'none';
			fetchedLocation = { lat: position.coords.latitude, lng: 0 };
			locationInput.value = 'In Munich';
			document.querySelector('#manual-location').classList.add('is-focused');
		},
		function(err) {
			console.log(err);
			locationBtn.style.display = 'inline';
			locationLoader.style.display = 'none';
			if (!sawAlert) {
				alert("Couldn't fetch location, please enter manually!");
				sawAlert = true;
			}
			fetchedLocation = { lat: 0, lng: 0 };
		},
		{ timeout: 7000 }
	);
});

function initializeLocation() {
	if (!('geolocation' in navigator)) {
		locationBtn.style.display = 'none';
	}
}

function initializeMedia() {
	if (!('mediaDevices' in navigator)) {
		navigator.mediaDevices = {};
	}

	// Creating our own polyfills
	if (!('getUserMedia' in navigator.mediaDevices)) {
		navigator.mediaDevices.getUserMedia = function(constraints) {
			// 'constraints' can be audio or video
			var getUserMedia =
				navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

			if (!getUserMedia) {
				return Promise.reject(new Error('getUserMedia is not implemented!'));
			}

			return new Promise(function(resolve, reject) {
				getUserMedia.call(navigator, constraints, resolve, reject);
			});
		};
	}

	// now navigator.mediaDevices.getUserMedia() is present always
	navigator.mediaDevices
		.getUserMedia({ video: { facingMode: 'environment' } }) //has video access, can have audio too
		.then(function(stream) {
			videoPlayer.srcObject = stream;
			videoPlayer.style.display = 'block';
		})
		.catch(function(err) {
			//eg for desktop and also if user blocks the access, show img picker
			imagePickerArea.style.display = 'block';
		});
}

//Hooking Up the Capture Button
captureButton.addEventListener('click', function(event) {
	canvasElement.style.display = 'block';
	videoPlayer.style.display = 'none';
	captureButton.style.display = 'none';
	var context = canvasElement.getContext('2d');
	context.drawImage(
		videoPlayer,
		0,
		0,
		canvas.width,
		videoPlayer.videoHeight / (videoPlayer.videoWidth / canvas.width)
	);
	videoPlayer.srcObject.getVideoTracks().forEach(function(track) {
		track.stop();
	});
	picture = dataURItoBlob(canvasElement.toDataURL()); // dataURItoBlob() stored in utility.js converts base64img to blob(file) to transfer it to server
});

imagePicker.addEventListener('change', function(event) {
	picture = event.target.files[0];
});

function openCreatePostModal() {
	// createPostArea.style.display = 'block';
	setTimeout(function() {
		createPostArea.style.transform = 'translateY(0)';
	}, 1);
	initializeMedia();
	initializeLocation();

	if (deferredPrompt) {
		deferredPrompt.prompt();

		deferredPrompt.userChoice.then(function(choiceResult) {
			console.log(choiceResult.outcome);

			if (choiceResult.outcome === 'dismissed') {
				console.log('User cancelled installation');
			} else {
				console.log('User added to home screen');
			}
		});

		deferredPrompt = null;
	}

	// TO UNREGISTER A SW,
	// if ('serviceWorker' in navigator) {
	//   navigator.serviceWorker.getRegistrations()
	//     .then(function(registrations) {
	//       for (var i = 0; i < registrations.length; i++) {
	//         registrations[i].unregister();
	//       }
	//     })
	// }
}

function closeCreatePostModal() {
	imagePickerArea.style.display = 'none';
	videoPlayer.style.display = 'none';
	canvasElement.style.display = 'none';
	locationBtn.style.display = 'inline';
	locationLoader.style.display = 'none';
	captureButton.style.display = 'inline';
	if (videoPlayer.srcObject) {
		videoPlayer.srcObject.getVideoTracks().forEach(function(track) {
			track.stop();
		});
	}
	setTimeout(function() {
		createPostArea.style.transform = 'translateY(100vh)';
	}, 1);
	// createPostArea.style.display = 'none';
}

shareImageButton.addEventListener('click', openCreatePostModal);

closeCreatePostModalButton.addEventListener('click', closeCreatePostModal);

// Currently not in use, allows to save assets in cache on demand otherwise
function onSaveButtonClicked(event) {
	console.log('clicked');
	if ('caches' in window) {
		caches.open('user-requested').then(function(cache) {
			cache.add('https://httpbin.org/get');
			cache.add('/src/images/sf-boat.jpg');
		});
	}
}

function clearCards() {
	while (sharedMomentsArea.hasChildNodes()) {
		sharedMomentsArea.removeChild(sharedMomentsArea.lastChild);
	}
}

function createCard(data) {
	var cardWrapper = document.createElement('div');
	cardWrapper.className = 'shared-moment-card mdl-card mdl-shadow--2dp';
	var cardTitle = document.createElement('div');
	cardTitle.className = 'mdl-card__title';
	cardTitle.style.backgroundImage = 'url(' + data.image + ')';
	cardTitle.style.backgroundSize = 'cover';
	cardWrapper.appendChild(cardTitle);
	var cardTitleTextElement = document.createElement('h2');
	cardTitleTextElement.style.color = 'white';
	cardTitleTextElement.className = 'mdl-card__title-text';
	cardTitleTextElement.textContent = data.title;
	cardTitle.appendChild(cardTitleTextElement);
	var cardSupportingText = document.createElement('div');
	cardSupportingText.className = 'mdl-card__supporting-text';
	cardSupportingText.textContent = data.location;
	cardSupportingText.style.textAlign = 'center';
	// var cardSaveButton = document.createElement('button');
	// cardSaveButton.textContent = 'Save';
	// cardSaveButton.addEventListener('click', onSaveButtonClicked);
	// cardSupportingText.appendChild(cardSaveButton);
	cardWrapper.appendChild(cardSupportingText);
	componentHandler.upgradeElement(cardWrapper);
	sharedMomentsArea.appendChild(cardWrapper);
}

// reload
function updateUI(data) {
	clearCards();
	for (var i = 0; i < data.length; i++) {
		createCard(data[i]);
	}
}

var url = 'https://insta-clone-e3283.firebaseio.com/posts.json';
var networkDataReceived = false;

fetch(url)
	.then(function(res) {
		return res.json();
	})
	.then(function(data) {
		networkDataReceived = true;
		console.log('From web', data);
		var dataArray = [];
		for (var key in data) {
			dataArray.push(data[key]);
		}
		updateUI(dataArray);
	});

if ('indexedDB' in window) {
	readAllData('posts').then(function(data) {
		if (!networkDataReceived) {
			console.log('From cache', data);
			updateUI(data);
		}
	});
}

function sendData() {
	var id = new Date().toISOString();
	var postData = new FormData();
	postData.append('id', id);
	postData.append('title', titleInput.value);
	postData.append('location', locationInput.value);
	postData.append('rawLocationLat', fetchedLocation.lat);
	postData.append('rawLocationLng', fetchedLocation.lng);
	postData.append('file', picture, id + '.png');

	fetch(
		'https://us-central1-insta-clone-e3283.cloudfunctions.net/storePostData',
		{
			method: 'POST',
			body: postData
		}
	).then(function(res) {
		console.log('Sent data', res);
		updateUI();
	});
}

// we are listening/writing for "submit" event from this feed.js file coz sw.js cant listen to DOM events
form.addEventListener('submit', function(event) {
	event.preventDefault(); //submit event sends data directly to the server which we dont want to do

	if (titleInput.value.trim() === '' || locationInput.value.trim() === '') {
		alert('Please enter valid data!');
		return;
	}

	closeCreatePostModal(); // close the post model if data is valid

	// registering a sync task
	if ('serviceWorker' in navigator && 'SyncManager' in window) {
		//checking if SW is present in the browser and also the SyncManager API
		navigator.serviceWorker.ready //if SW is in activ state, then returns a promise..
			.then(function(sw) {
				var post = {
					id: new Date().toISOString(), //just for purpose of unique identifier
					title: titleInput.value,
					location: locationInput.value,
					picture: picture,
					rawLocation: fetchedLocation
				};
				writeData('sync-posts', post) //above 'post' obj is stored in 'sync-posts' store
					.then(function() {
						return sw.sync.register('sync-new-posts'); // sync is SyncManager. **Register sync task with SW as we cant listen to form event in sw.js
					})
					.then(function() {
						var snackbarContainer = document.querySelector(
							'#confirmation-toast'
						); //snackbarContainer is black notification feature at bottom to display some msg
						var data = { message: 'Your Post was saved for syncing!' };
						snackbarContainer.MaterialSnackbar.showSnackbar(data);
					})
					.catch(function(err) {
						console.log(err);
					});
			});
	} else {
		// adding a fallback if browser doesnt support SW
		sendData(); // sends data directly to backend
	}
});
// after this goto sw.js 'sync' event listener
