// Firebase Messaging Service Worker
// FCM 웹 푸시 알림을 백그라운드에서 수신하기 위한 서비스 워커

importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-messaging-compat.js');

// Firebase 설정 (환경변수 대신 직접 설정 - 서비스 워커에서는 환경변수 접근 불가)
// 이 값들은 Firebase Console에서 가져와야 합니다
firebase.initializeApp({
  apiKey: 'FIREBASE_API_KEY',
  authDomain: 'PROJECT_ID.firebaseapp.com',
  projectId: 'PROJECT_ID',
  storageBucket: 'PROJECT_ID.appspot.com',
  messagingSenderId: 'SENDER_ID',
  appId: 'APP_ID',
});

const messaging = firebase.messaging();

// 백그라운드 메시지 수신 처리
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] 백그라운드 메시지 수신:', payload);

  const notificationTitle = payload.notification?.title || '새 알림';
  const notificationOptions = {
    body: payload.notification?.body || '',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    tag: payload.data?.notification_id || 'default',
    data: payload.data,
    actions: [
      {
        action: 'open',
        title: '열기',
      },
      {
        action: 'close',
        title: '닫기',
      },
    ],
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// 알림 클릭 처리
self.addEventListener('notificationclick', (event) => {
  console.log('[firebase-messaging-sw.js] 알림 클릭:', event);

  event.notification.close();

  if (event.action === 'close') {
    return;
  }

  // 링크가 있으면 해당 페이지로 이동
  const link = event.notification.data?.link || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // 이미 열린 창이 있으면 포커스
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.focus();
          client.navigate(link);
          return;
        }
      }
      // 열린 창이 없으면 새 창 열기
      if (clients.openWindow) {
        return clients.openWindow(link);
      }
    })
  );
});

// 푸시 이벤트 직접 처리 (FCM이 아닌 일반 웹 푸시용)
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json();
    console.log('[firebase-messaging-sw.js] Push 이벤트:', data);
  }
});
