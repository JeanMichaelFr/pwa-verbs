self.addEventListener("install", e => {
  e.waitUntil(
    caches.open("verbs-cache").then(cache =>
      cache.addAll([
        "index.html",
        "app.js",
        "verben.json",
        "style.css"
      ])
    )
  );
});

self.addEventListener("fetch", e => {
  e.respondWith(
    caches.match(e.request).then(res => res || fetch(e.request))
  );
});
