/* Service Worker: hält die App nach dem ersten Laden offline verfügbar.
 * Navigationen: Netzwerk zuerst, sonst die zwischengespeicherte Startseite.
 * Hashed Assets (/assets/): Cache zuerst. Alles andere: aus dem Cache, im Hintergrund aktualisiert. */
const CACHE = 'rya-academy-v1'
const SHELL = ['./', 'favicon.svg', 'manifest.webmanifest']

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()))
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  )
})

const store = (request, response) => {
  if (response.ok && response.type === 'basic') caches.open(CACHE).then((c) => c.put(request, response.clone()))
  return response
}

self.addEventListener('fetch', (event) => {
  const { request } = event
  if (request.method !== 'GET') return
  const url = new URL(request.url)
  if (url.origin !== self.location.origin) return

  if (request.mode === 'navigate') {
    event.respondWith(fetch(request).then((r) => store(new Request('./'), r)).catch(() => caches.match('./')))
    return
  }
  if (url.pathname.includes('/assets/')) {
    event.respondWith(caches.match(request).then((hit) => hit || fetch(request).then((r) => store(request, r))))
    return
  }
  event.respondWith(
    caches.match(request).then((hit) => {
      const fresh = fetch(request).then((r) => store(request, r)).catch(() => hit)
      return hit || fresh
    }),
  )
})
