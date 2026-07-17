const CACHE_VERSION = "cgv10-pwa-v11";
const SHELL_CACHE = `${CACHE_VERSION}-shell`;
const STATIC_CACHE = `${CACHE_VERSION}-static`;

const SHELL_URLS = [
  "/",
  "/portal/",
  "/layanan/",
  "/kabar-warga/",
  "/pengurus/",
  "/keuangan/",
  "/palugada/",
  "/kontak/",
  "/manifest.webmanifest",
  "/assets/brand/favicon.svg",
  "/assets/pwa/cgv10-pwa-icon-192.png",
  "/assets/pwa/cgv10-pwa-icon-512.png",
  "/assets/pwa/cgv10-maskable-icon-512.png",
  "/assets/pwa/cgv10-screenshot-wide.png",
  "/assets/pwa/cgv10-screenshot-mobile.png"
];

function isAdminRoute(url) {
  return url.pathname.startsWith("/admin");
}

function isStaticAsset(url) {
  return (
    url.pathname === "/assets/brand/favicon.svg" ||
    url.pathname.startsWith("/assets/pwa/")
  );
}

function isNextStaticAsset(url) {
  return url.pathname.startsWith("/_next/static/");
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(SHELL_CACHE).then((cache) => cache.addAll(SHELL_URLS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key.startsWith("cgv10-pwa-") && !key.startsWith(CACHE_VERSION))
            .map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;

  if (request.method !== "GET") {
    return;
  }

  const url = new URL(request.url);

  if (url.origin !== self.location.origin || isAdminRoute(url)) {
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(SHELL_CACHE).then((cache) => cache.put(request, copy));
          return response;
        })
        .catch(() => caches.match(request).then((cached) => cached || caches.match("/")))
    );
    return;
  }

  if (isNextStaticAsset(url)) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(STATIC_CACHE).then((cache) => cache.put(request, copy));
          return response;
        })
        .catch(() => caches.match(request))
    );
    return;
  }

  if (isStaticAsset(url)) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) {
          return cached;
        }

        return fetch(request).then((response) => {
          const copy = response.clone();
          caches.open(STATIC_CACHE).then((cache) => cache.put(request, copy));
          return response;
        });
      })
    );
  }
});
