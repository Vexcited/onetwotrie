const staticCacheName = 'site-static-v1';
const assets = [
    '/onetwotrie/',
    '/onetwotrie/index.html',
    '/onetwotrie/pages/assets/css/main.css',
    '/onetwotrie/pages/assets/css/noscript.css',
    '/onetwotrie/pages/assets/css/custom.css',
    '/onetwotrie/pages/assets/js/jquery.min.js',
    '/onetwotrie/pages/assets/js/browser.min.js',
    '/onetwotrie/pages/assets/js/breakpoints.min.js',
    '/onetwotrie/pages/assets/js/util.js',
    '/onetwotrie/pages/assets/js/adapter-latest.js',
    '/onetwotrie/pages/assets/js/quagga.min.js',
    '/onetwotrie/pages/assets/js/functions.js',
    '/onetwotrie/pages/assets/js/main.js',
    '/onetwotrie/pages/images/background.jpg',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.9.0/css/all.min.css',
    'https://fonts.googleapis.com/css?family=Source+Sans+Pro:300italic,600italic,300,600'
];

self.addEventListener('install', evt => {
  evt.waitUntil(
    caches.open(staticCacheName).then((cache) => {
      console.log('Caching shell assets...');
      cache.addAll(assets);
    })
  );
});

self.addEventListener('activate', evt => {
  evt.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(keys
        .filter(key => key !== staticCacheName)
        .map(key => caches.delete(key))
      );
    })
  );
});

self.addEventListener('fetch', evt => {
  evt.respondWith(
    caches.match(evt.request).then(cacheRes => {
      return cacheRes || fetch(evt.request);
    })
  );
});