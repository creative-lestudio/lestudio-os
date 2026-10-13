// LE STUDIO Social OS — service worker v2.7.0
// Estrategia: red primero para todo lo del propio sitio (así cada despliegue llega al instante)
// y caché solo como respaldo sin conexión. Nunca se cachea Supabase ni nada de otro origen.
const CACHE = 'ls-social-os-v2.7.0';
const SHELL = ['/', '/index.html', '/styles.css?v=270', '/app.js?v=270', '/manifest.webmanifest', '/icon-192.png', '/icon-512.png', '/logo-le-studio.png', '/logo-le-studio-white.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => Promise.all(SHELL.map(u => c.add(u).catch(() => { })))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request, url = new URL(req.url);
  if (req.method !== 'GET' || url.origin !== self.location.origin) return;
  e.respondWith((async () => {
    try {
      const res = await fetch(req);
      if (res.ok && res.type === 'basic') { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); }
      return res;
    } catch {
      const hit = await caches.match(req);
      if (hit) return hit;
      if (req.mode === 'navigate') return (await caches.match('/index.html')) || (await caches.match('/'));
      return new Response('Sin conexión', { status: 503, statusText: 'Offline' });
    }
  })());
});
