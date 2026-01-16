// Service Worker for Web Push Notifications

self.addEventListener('install', (event) => {
  console.log('[SW] Service Worker 설치됨');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('[SW] Service Worker 활성화됨');
  event.waitUntil(clients.claim());
});

// 푸시 이벤트 수신
self.addEventListener('push', (event) => {
  console.log('[SW] Push 이벤트 수신:', event);

  let data = {
    title: '새 알림',
    body: '',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    data: {},
  };

  if (event.data) {
    try {
      const payload = event.data.json();
      data = {
        title: payload.title || data.title,
        body: payload.body || payload.message || data.body,
        icon: payload.icon || data.icon,
        badge: payload.badge || data.badge,
        data: payload.data || payload,
      };
    } catch (e) {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body,
    icon: data.icon,
    badge: data.badge,
    tag: data.data?.notification_id || 'default',
    data: data.data,
    vibrate: [200, 100, 200],
    actions: [
      { action: 'open', title: '열기' },
      { action: 'close', title: '닫기' },
    ],
  };

  event.waitUntil(self.registration.showNotification(data.title, options));
});

// 알림 클릭 처리
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] 알림 클릭:', event);
  event.notification.close();

  if (event.action === 'close') {
    return;
  }

  const link = event.notification.data?.link || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.focus();
          if (link !== '/') {
            client.navigate(link);
          }
          return;
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(link);
      }
    })
  );
});

self.addEventListener('notificationclose', (event) => {
  console.log('[SW] 알림 닫힘:', event);
});
