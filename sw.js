const CACHE_NAME = 'election-calc-v1.0';
const urlsToCache = [
  './',
  './index.html',
  './manifest.json',
  './PWA_icon(192x192).png',
  './PWA_icon(512x512).png'
];

// 安裝 Service Worker 並快取檔案
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(urlsToCache);
      })
  );
});

// 攔截網路請求，若無網路則提供快取版本
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // 如果有快取就回傳快取，否則透過網路抓取
        if (response) {
          return response;
        }
        return fetch(event.request);
      })
  );
});
