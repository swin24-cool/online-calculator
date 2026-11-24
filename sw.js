const CACHE_NAME = 'election-portal-v3.0';
// 💡 未來如果有大更新，把這裡改成 v3.0, v4.0 就能強迫所有手機更新
const urlsToCache = [
  './',
  './index.html',
  './calculator.html',
  './manifest.json',
  './PWA_icon(192x192).png',
  './PWA_icon(512x512).png'
];

// 1. 安裝階段：下載核心檔案並立刻接管
self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
});

// 2. 啟動階段：清空舊版快取（如 v2.0）
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// 3. 攔截請求：API 永遠直連雲端，站內靜態檔案採 Network First
self.addEventListener('fetch', event => {
  const url = event.request.url;

  // 不攔截 POST 請求，也不快取 GAS / 外部 API 查詢結果
  if (
    event.request.method !== 'GET' ||
    url.includes('script.google.com') ||
    url.includes('googleusercontent.com') ||
    url.includes('ipify.org')
  ) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then(response => {
        if (response && response.status === 200 && response.type === 'basic') {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, responseClone));
        }
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});