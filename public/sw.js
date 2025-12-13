// Service Worker for push notifications
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing...');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activated');
  event.waitUntil(clients.claim());
});

// 푸시 알림 수신
self.addEventListener('push', (event) => {
  console.log('[Service Worker] Push received');

  const options = {
    body: event.data ? event.data.text() : '새로운 메시지가 도착했습니다',
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    vibrate: [200, 100, 200],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1,
    },
  };

  event.waitUntil(self.registration.showNotification('새 메시지', options));
});

// 알림 클릭 처리
self.addEventListener('notificationclick', (event) => {
  console.log('[Service Worker] Notification click');
  event.notification.close();

  event.waitUntil(clients.openWindow('/chat'));
});

// 백그라운드 동기화
self.addEventListener('sync', (event) => {
  if (event.tag === 'refresh-unread-count') {
    console.log('[Service Worker] Syncing unread count');
  }
});
