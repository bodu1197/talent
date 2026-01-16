# 웹 푸시 알림 설정 가이드

이 문서는 웹앱에서 Firebase Cloud Messaging (FCM)을 사용한 푸시 알림 설정 방법을 설명합니다.

## 1. Firebase 프로젝트 설정

### 1.1 Firebase 프로젝트 생성

1. [Firebase Console](https://console.firebase.google.com) 접속
2. 새 프로젝트 생성 또는 기존 프로젝트 선택
3. 프로젝트 설정 → 일반 → 웹 앱 추가

### 1.2 웹 앱 등록

1. 앱 닉네임 입력 (예: "Talent Web")
2. Firebase Hosting 설정은 선택사항
3. 앱 등록 후 Firebase 설정 정보 복사

### 1.3 Cloud Messaging 설정

1. 프로젝트 설정 → Cloud Messaging
2. **웹 푸시 인증서** 섹션에서 "키 쌍 생성" 클릭
3. 생성된 VAPID 키 복사

## 2. 환경 변수 설정

### 2.1 클라이언트 환경 변수 (.env.local)

```env
# Firebase 클라이언트 설정
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123
NEXT_PUBLIC_FIREBASE_VAPID_KEY=BKagOny0KF_...
```

### 2.2 서버 환경 변수 (Vercel)

```env
# FCM 서버 키 (Legacy API)
FCM_SERVER_KEY=AAAA...

# Cron 작업 인증
CRON_SECRET=your-random-secret-string
```

**FCM 서버 키 가져오기:**

1. Firebase Console → 프로젝트 설정 → Cloud Messaging
2. Cloud Messaging API (Legacy) 활성화
3. 서버 키 복사

## 3. Service Worker 설정

### 3.1 firebase-messaging-sw.js 수정

`public/firebase-messaging-sw.js` 파일에서 Firebase 설정을 실제 값으로 변경:

```javascript
firebase.initializeApp({
  apiKey: 'YOUR_API_KEY',
  authDomain: 'YOUR_PROJECT_ID.firebaseapp.com',
  projectId: 'YOUR_PROJECT_ID',
  storageBucket: 'YOUR_PROJECT_ID.appspot.com',
  messagingSenderId: 'YOUR_SENDER_ID',
  appId: 'YOUR_APP_ID',
});
```

> **참고:** Service Worker는 환경 변수에 접근할 수 없으므로 직접 값을 입력해야 합니다.

## 4. Vercel Cron 설정

### 4.1 vercel.json

```json
{
  "crons": [
    {
      "path": "/api/cron/push-notifications",
      "schedule": "* * * * *"
    }
  ]
}
```

### 4.2 Cron 인증

Vercel Dashboard → Settings → Environment Variables:

- `CRON_SECRET`: 랜덤 문자열 생성
  ```bash
  openssl rand -hex 32
  ```

## 5. 푸시 알림 사용하기

### 5.1 Provider에 초기화 추가

```tsx
// app/layout.tsx 또는 providers.tsx
'use client';

import { useEffect } from 'react';
import { usePushNotifications } from '@/hooks/usePushNotifications';

function PushNotificationInitializer() {
  const { initialize, isSupported } = usePushNotifications();

  useEffect(() => {
    if (isSupported) {
      initialize();
    }
  }, [initialize, isSupported]);

  return null;
}
```

### 5.2 수동으로 권한 요청

```tsx
import { usePushNotifications } from '@/hooks/usePushNotifications';

function NotificationSettings() {
  const { isSupported, permission, requestPermission, registerToken } = usePushNotifications();

  const handleEnableNotifications = async () => {
    const granted = await requestPermission();
    if (granted) {
      await registerToken();
    }
  };

  if (!isSupported) {
    return <p>이 브라우저는 푸시 알림을 지원하지 않습니다.</p>;
  }

  return (
    <div>
      <p>알림 권한: {permission}</p>
      {permission !== 'granted' && <button onClick={handleEnableNotifications}>알림 활성화</button>}
    </div>
  );
}
```

## 6. 브라우저 지원

| 브라우저                      | 지원 여부 |
| ----------------------------- | --------- |
| Chrome (Desktop/Android)      | ✅        |
| Firefox                       | ✅        |
| Edge                          | ✅        |
| Safari (macOS 13+, iOS 16.4+) | ✅        |
| Samsung Internet              | ✅        |

> **iOS Safari 참고:** iOS 16.4 이상에서 PWA로 설치된 경우에만 푸시 알림 지원

## 7. 테스트

### 7.1 브라우저에서 테스트

1. 개발 서버 실행: `npm run dev`
2. 브라우저에서 알림 권한 허용
3. 개발자 도구 → Application → Service Workers 확인

### 7.2 FCM 테스트 발송

```bash
curl -X POST "https://fcm.googleapis.com/fcm/send" \
  -H "Authorization: key=YOUR_FCM_SERVER_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "to": "DEVICE_FCM_TOKEN",
    "notification": {
      "title": "테스트 알림",
      "body": "푸시 알림이 정상 작동합니다!"
    }
  }'
```

## 8. 문제 해결

### 푸시 알림이 오지 않을 때

1. **권한 확인**: 브라우저 설정에서 알림 권한 확인
2. **토큰 확인**: `user_device_tokens` 테이블에서 토큰 등록 여부 확인
3. **Service Worker 확인**: 개발자 도구에서 SW 상태 확인
4. **HTTPS 확인**: 푸시 알림은 HTTPS에서만 작동 (localhost 제외)

### iOS에서 작동하지 않을 때

1. iOS 16.4 이상인지 확인
2. Safari에서 "홈 화면에 추가"로 PWA 설치
3. 설정 → Safari → 고급 → 웹 푸시 활성화

### Service Worker 업데이트 안 될 때

```javascript
// 개발자 도구 Console에서 실행
navigator.serviceWorker.getRegistrations().then((registrations) => {
  registrations.forEach((registration) => registration.unregister());
});
```

## 9. 아키텍처

```
사용자 브라우저
    │
    ├── Service Worker (firebase-messaging-sw.js)
    │   └── 백그라운드 메시지 수신
    │
    └── usePushNotifications Hook
        ├── FCM 토큰 발급
        ├── 서버에 토큰 등록
        └── 포그라운드 메시지 수신

서버 (Next.js API)
    │
    ├── /api/push/register - 토큰 등록/해제
    ├── /api/push/settings - 설정 관리
    └── /api/cron/push-notifications - 발송 처리

Supabase (DB)
    │
    ├── user_device_tokens - FCM 토큰 저장
    ├── push_notification_queue - 발송 대기열
    └── push_notification_logs - 발송 로그
```

## 10. WebView 앱에서 사용

웹앱을 WebView로 감싸서 앱스토어에 배포할 경우:

### Android WebView

Android WebView에서는 웹 푸시가 제한적으로 지원됩니다.
Chrome Custom Tabs 또는 Trusted Web Activity (TWA) 사용을 권장합니다.

### iOS WKWebView

iOS WKWebView는 웹 푸시를 직접 지원하지 않습니다.
PWA로 "홈 화면에 추가"하여 사용하거나, 네이티브 푸시를 구현해야 합니다.

### 권장: PWA 설치 유도

웹앱을 PWA로 설치하도록 유도하면 네이티브 앱처럼 푸시 알림을 받을 수 있습니다.

```tsx
// PWA 설치 프롬프트
function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  useEffect(() => {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    });
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log('설치 결과:', outcome);
    }
  };

  return deferredPrompt ? <button onClick={handleInstall}>앱 설치하기</button> : null;
}
```
