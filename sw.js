// sw.js - Service Worker cho PWA

const CACHE_NAME = 'email-generator-v1';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './style.css',
  './script.js',
  './manifest.json'
];

// Cài đặt: cache các tài nguyên cần thiết
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(ASSETS_TO_CACHE)
          .then(() => self.skipWaiting()); // Kích hoạt ngay
      })
      .catch(err => console.error('Lỗi khi cache tài nguyên:', err))
  );
});

// Kích hoạt: dọn dẹp cache cũ nếu có
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  // Claim các trang đang mở để áp dụng SW ngay
  self.clients.claim();
});

// Lắng nghe yêu cầu mạng
self.addEventListener('fetch', (event) => {
  // Chỉ xử lý yêu cầu từ origin chính
  if (event.request.mode === 'navigate' || event.request.destination === 'document') {
    // Ưu tiên mạng, nếu lỗi thì dùng cache
    event.respondWith(
      fetch(event.request).catch(() => {
        return caches.match('./');
      })
    );
  } else {
    // Tài nguyên tĩnh: dùng cache trước, cập nhật sau
    event.respondWith(
      caches.match(event.request).then((cached) => {
        return cached || fetch(event.request)
          .then(response => {
            // Lưu bản sao vào cache
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseClone);
            });
            return response;
          });
      })
    );
  }
});

// Thông báo khi có phiên bản mới (tùy chọn)
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
