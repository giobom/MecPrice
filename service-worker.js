const CACHE_NAME = "mecprice-v1.1.0";

const URLS_TO_CACHE = [
  "./",
  "./index.html",
  "./style.css",
  "./app.js",
  "./manifest.json",

  "./icon-192.png",
  "./icon-512.png",

  // libs
  "./libs/core.js",
  "./libs/dom.js",
  "./libs/storage.js",
  "./libs/tabs.js",
  "./libs/estoque.js",
  "./libs/orcamento.js",
  "./libs/pdf.js",
  "./libs/validators.js",
  "./libs/pro-modal.js",

  // pdf libs
  "./libs/jspdf.umd.min.js",
  "./libs/jspdf.plugin.autotable.min.js"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(URLS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((cached) => {
      return cached || fetch(event.request);
    })
  );
});
