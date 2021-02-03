self.addEventListener("install", e => {
  e.waitUntil(
    caches.open("static").then(cache => {
      return cache.addAll([
        "./",
        "./pages/assets/css/custom.css",
        "./pages/assets/css/main.css",
        "./pages/assets/css/noscript.css",
        "./pages/assets/js/adapter-latest.js",
        "./pages/assets/js/breakpoints.min.js",
        "./pages/assets/js/browser.min.js",
        "./pages/assets/js/functions.js",
        "./pages/assets/js/jquery.min.js",
        "./pages/assets/js/main.js",
        "./pages/assets/js/quagga.min.js",
        "./pages/assets/js/util.js",
        "./pages/images/background.jpg"
      ]);
    })
  )
});

self.addEventListener("fetch", e => {
  e.respondWith(
    caches.match(e.request).then(response => {
      return response || fetch(e.request);
    })
  );
});