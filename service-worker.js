
const CACHE_NAME = 'alfa-kompass-v1';

self.addEventListener('install', event => {
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', event => {
  // Foreløpig gjør vi ingenting risikabelt.
  // Dette er bare grunnmuren for PWA.
});
