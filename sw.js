const CACHE_NAME = 'election-calc-v2.0'; // 💡 未來如果有大更新，把這裡改成 v3.0, v4.0 就能強迫所有手機更新
const urlsToCache = [
  './',
  './index.html',
  './manifest.json',
  './PWA_icon(192x192).png',
  './PWA_icon(512x512).png'
];

// 1. 安裝階段：下載檔案並強制立刻接管 (Skip Waiting)
self.addEventListener('install', event => {
  self.skipWaiting(); // 強制跳過等待，立刻讓新版 Service Worker 生效
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

// 2. 啟動階段：清空舊版快取，確保不會被舊程式碼綁死
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('清空舊快取:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim(); // 立刻接管所有開啟的網頁
});

// 3. 攔截請求階段：改用「Network First (網路優先)」策略
self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // 如果網路連線成功，就把最新抓到的檔案存進快取裡備用
        if (response && response.status === 200) {
           const responseClone = response.clone();
           caches.open(CACHE_NAME).then(cache => cache.put(event.request, responseClone));
        }
        return response;
      })
      .catch(() => {
        // 如果網路連線失敗 (例如在地下室)，就從快取中拿出備用檔案
        return caches.match(event.request);
      })
  );
});
