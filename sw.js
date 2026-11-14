// Service worker — Kindle Learning Tool
// index.html: RANGKAIAN DULU (supaya kemaskini terus sampai), cache hanya sandaran bila offline.
// Ikon & manifest: cache dulu. Firebase / Google / CDN lain: TIDAK disentuh langsung.
var CACHE = 'klt-v1';
var ASAS = ['./', './index.html', './manifest.json', './icon-192.png', './icon-512.png'];

self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(ASAS); }).then(function () { return self.skipWaiting(); }));
});

self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (k) {
    return Promise.all(k.filter(function (n) { return n !== CACHE; }).map(function (n) { return caches.delete(n); }));
  }).then(function () { return self.clients.claim(); }));
});

self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET') return;
  var url = new URL(req.url);
  if (url.origin !== self.location.origin) return; // Firebase, gstatic, googleapis → terus ke rangkaian

  if (req.mode === 'navigate' || url.pathname.slice(-5) === '.html' || url.pathname.slice(-1) === '/') {
    e.respondWith(fetch(req).then(function (res) {
      var salin = res.clone();
      caches.open(CACHE).then(function (c) { c.put('./index.html', salin); });
      return res;
    }).catch(function () { return caches.match('./index.html'); }));
    return;
  }
  e.respondWith(caches.match(req).then(function (ada) { return ada || fetch(req); }));
});
