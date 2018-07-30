/**
 * Welcome to your Workbox-powered service worker!
 *
 * You'll need to register this file in your web app and you should
 * disable HTTP caching for this file too.
 * See https://goo.gl/nhQhGp
 *
 * The rest of the code is auto-generated. Please don't update this file
 * directly; instead, make changes to your Workbox build configuration
 * and re-run your build process.
 * See https://goo.gl/2aRDsh
 */

importScripts(
	'https://storage.googleapis.com/workbox-cdn/releases/3.4.1/workbox-sw.js'
);

/**
 * The workboxSW.precacheAndRoute() method efficiently caches and responds to
 * requests for URLs in the manifest.
 * See https://goo.gl/S9QRab
 */
self.__precacheManifest = [
	{
		url: 'favicon.ico',
		revision: '2cab47d9e04d664d93c8d91aec59e812'
	},
	{
		url: 'index.html',
		revision: '76b96c99db1ed60e54f5fa4a3b330fe4'
	},
	{
		url: 'manifest.json',
		revision: 'abf65306ec53f15cf792712fa52a00dc'
	},
	{
		url: 'offline.html',
		revision: '3343f87f0e5a61f220fbc8522cb7e937'
	},
	{
		url: 'src/css/app.css',
		revision: 'ffed0d57e450481d115a3e1eaccfe002'
	},
	{
		url: 'src/css/feed.css',
		revision: '65754f2fbf58456a87da0cc0952b0d8e'
	},
	{
		url: 'src/css/help.css',
		revision: '81922f16d60bd845fd801a889e6acbd7'
	},
	{
		url: 'src/images/main-image-lg.jpg',
		revision: '31b19bffae4ea13ca0f2178ddb639403'
	},
	{
		url: 'src/images/main-image-sm.jpg',
		revision: 'c6bb733c2f39c60e3c139f814d2d14bb'
	},
	{
		url: 'src/images/main-image.jpg',
		revision: '5c66d091b0dc200e8e89e56c589821fb'
	},
	{
		url: 'src/images/sf-boat.jpg',
		revision: '0f282d64b0fb306daf12050e812d6a19'
	},
	{
		url: 'src/js/material.min.js',
		revision: '65e87d3cac36b9eb91d124071e7277a7'
	}
].concat(self.__precacheManifest || []);
workbox.precaching.suppressWarnings();
workbox.precaching.precacheAndRoute(self.__precacheManifest, {});
