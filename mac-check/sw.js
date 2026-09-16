/**
 * MacPreCheck Offline Service Worker
 * Ensures full functionality offline in shops without Wi-Fi
 */

// Bump this on every deploy that changes a precached asset.
const CACHE_NAME = "macprecheck-v3";

const ASSETS = [
  "./",
  "./index.html",
  "./manifest.json",
  "./css/style.css",
  "./css/keyboard.css",
  "./css/display_test.css",
  "./js/app.js",
  "./js/wizard.js",
  "./js/analyzer.js",
  "./js/benchmarks.js",
  "./js/calculator.js",
  "./js/keyboard.js",
  "./js/screen_test.js",
  "./js/media_test.js",
  "./assets/icons/icon-192.svg",
  "./assets/icons/icon-512.svg",
  "./assets/icons/icon-192.png",
  "./assets/icons/icon-512.png",
  "./assets/icons/apple-touch-icon.png"
];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // Individually, so one 404 can't abort the whole install and leave the
      // app permanently uncached.
      return Promise.all(
        ASSETS.map((url) =>
          cache.add(url).catch((err) => {
            console.warn("[sw] skipped precache:", url, err);
          })
        )
      );
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

/**
 * Network-first, falling back to cache.
 *
 * A pure cache-first worker served this app's own HTML/JS/CSS from the very
 * first visit forever, so every later deploy was invisible to returning
 * visitors until the cache name happened to change. Going to the network first
 * means the shop-floor user always gets the current checklist and verdict
 * logic, while the cache still makes the app fully usable with no Wi-Fi.
 */
async function networkFirst(request) {
  const cache = await caches.open(CACHE_NAME);
  try {
    const fresh = await fetch(request);
    if (fresh && fresh.ok) {
      cache.put(request, fresh.clone());
    }
    return fresh;
  } catch (err) {
    const cached = await cache.match(request);
    if (cached) return cached;

    // Offline with nothing cached for this exact URL: for a page navigation,
    // the shell is still a useful answer.
    if (request.mode === "navigate") {
      const shell = await cache.match("./index.html");
      if (shell) return shell;
    }
    throw err;
  }
}

/** Icons and other static media change rarely — serve them instantly. */
async function cacheFirst(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);
  if (cached) return cached;

  const fresh = await fetch(request);
  if (fresh && fresh.ok) {
    cache.put(request, fresh.clone());
  }
  return fresh;
}

self.addEventListener("fetch", (e) => {
  const request = e.request;

  // Never intercept uploads/analytics beacons or anything we don't own.
  // Returning undefined from respondWith() hard-fails the request, so these
  // must fall through to the browser untouched.
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (/\.(?:svg|png|ico|jpg|jpeg|webp|woff2?)$/i.test(url.pathname)) {
    e.respondWith(cacheFirst(request));
    return;
  }

  e.respondWith(networkFirst(request));
});
