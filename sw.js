// ponytail: network-first, cache fallback. Genug für offline auf GitHub Pages.
const C = 'sportapp-v1';
self.addEventListener('install', e => e.waitUntil(caches.open(C).then(c => c.addAll(['./', './index.html', './manifest.json', './icon.svg']))));
self.addEventListener('fetch', e => e.respondWith(
  fetch(e.request).then(r => { const c = r.clone(); caches.open(C).then(x => x.put(e.request, c)); return r; })
    .catch(() => caches.match(e.request))
));
