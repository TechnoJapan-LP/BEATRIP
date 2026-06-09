/* BEATRIP Service Worker
 * Strategies:
 *  - CacheFirst:  /_next/static/, /_next/image, images, fonts, /opengraph-image
 *  - NetworkFirst: HTML navigations (fallback: /offline.html)
 *  - NetworkOnly:  /api/*  (never cached)
 */

const VERSION = "beatrip-v2";
const STATIC_CACHE = `${VERSION}-static`;
const RUNTIME_CACHE = `${VERSION}-runtime`;
const HTML_CACHE = `${VERSION}-html`;

const OFFLINE_URL = "/offline.html";
const PRECACHE = [OFFLINE_URL, "/icon.svg", "/manifest.json"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter(
              (k) =>
                k !== STATIC_CACHE && k !== RUNTIME_CACHE && k !== HTML_CACHE
            )
            .map((k) => caches.delete(k))
        )
      )
      .then(() => self.clients.claim())
  );
});

function isStaticAsset(url) {
  return (
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.startsWith("/_next/image") ||
    url.pathname.startsWith("/opengraph-image") ||
    url.pathname.startsWith("/airlines/") ||
    url.pathname.startsWith("/icons/") ||
    /\.(?:js|css|woff2?|ttf|otf|png|jpg|jpeg|webp|avif|svg|gif|ico)$/i.test(
      url.pathname
    )
  );
}

function isApi(url) {
  return url.pathname.startsWith("/api/");
}

function isHtmlNavigation(request) {
  return (
    request.mode === "navigate" ||
    (request.method === "GET" &&
      request.headers.get("accept")?.includes("text/html"))
  );
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);

  // Same-origin only
  if (url.origin !== self.location.origin) return;

  // NetworkOnly for API — let browser handle it
  if (isApi(url)) return;

  // NetworkFirst for HTML pages with offline fallback
  if (isHtmlNavigation(request)) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const clone = response.clone();
          caches.open(HTML_CACHE).then((cache) => cache.put(request, clone));
          return response;
        })
        .catch(() =>
          caches
            .match(request)
            .then((cached) => cached || caches.match(OFFLINE_URL))
        )
    );
    return;
  }

  // CacheFirst for static assets
  if (isStaticAsset(url)) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request)
          .then((response) => {
            if (response.ok) {
              const clone = response.clone();
              caches
                .open(RUNTIME_CACHE)
                .then((cache) => cache.put(request, clone));
            }
            return response;
          })
          .catch(() => cached);
      })
    );
    return;
  }

  // Default: pass-through (browser handles)
});

// Allow page to trigger immediate SW update
self.addEventListener("message", (event) => {
  if (event.data === "SKIP_WAITING") self.skipWaiting();
});
