# 웹 푸시 알림 설정 가이드

이 문서는 웹앱에서 Web Push API를 사용한 푸시 알림 설정 방법을 설명합니다.

## 1. VAPID 키 생성

### 1.1 web-push 패키지로 VAPID 키 생성

```bash
npx web-push generate-vapid-keys
```

결과 예시:

```
=======================================

Public Key:
BNxRWaVp...생략...

Private Key:
3HCy7a9Q...생략...

=======================================
```

### 1.2 생성된 키 저장

생성된 키를 환경 변수에 저장합니다.

## 2. 환경 변수 설정

### 2.1 클라이언트 환경 변수 (.env.local)

```env
# VAPID 공개키 (클라이언트에서 사용)
NEXT_PUBLIC_VAPID_PUBLIC_KEY=BNxRWaVp...생략...
```

### 2.2 서버 환경 변수 (Vercel)

```env
# VAPID 공개키
NEXT_PUBLIC_VAPID_PUBLIC_KEY=BNxRWaVp...생략...

# VAPID 비밀키 (서버에서만 사용)
VAPID_PRIVATE_KEY=3HCy7a9Q...생략...

# VAPID Subject (mailto: 또는 https:// URL)
VAPID_SUBJECT=mailto:support@your-domain.com

# Cron 작업 인증
CRON_SECRET=your-random-secret-string
```

**CRON_SECRET 생성:**

```bash
openssl rand -hex 32
```

## 3. Service Worker

`public/sw.js` 파일이 웹 푸시 알림을 처리합니다:

- 푸시 이벤트 수신 및 알림 표시
- 알림 클릭 시 앱으로 이동
- 백그라운드 메시지 처리

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

### 7.2 Web Push 테스트 발송 (Node.js)

```javascript
const webpush = require('web-push');

webpush.setVapidDetails(
  'mailto:support@your-domain.com',
  'YOUR_VAPID_PUBLIC_KEY',
  'YOUR_VAPID_PRIVATE_KEY'
);

const subscription = {
  endpoint: 'https://fcm.googleapis.com/fcm/send/...',
  keys: {
    p256dh: '...',
    auth: '...',
  },
};

webpush.sendNotification(
  subscription,
  JSON.stringify({
    title: '테스트 알림',
    body: '푸시 알림이 정상 작동합니다!',
  })
);
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
    ├── Service Worker (sw.js)
    │   └── 백그라운드 메시지 수신
    │
    └── usePushNotifications Hook
        ├── Web Push 구독 (VAPID 키 사용)
        ├── 서버에 구독 정보 등록
        └── 포그라운드 메시지 수신

서버 (Next.js API)
    │
    ├── /api/push/register - 구독 등록/해제
    ├── /api/push/settings - 설정 관리
    ├── /api/push/send - 직접 발송
    └── /api/cron/push-notifications - 대기열 처리

Supabase (DB)
    │
    ├── user_device_tokens - 구독 정보 저장
    │   ├── device_token: 구독 endpoint
    │   └── device_id: 전체 subscription JSON
    ├── push_notification_queue - 발송 대기열
    └── push_notification_logs - 발송 로그
```

## 10. PWA 설치 유도

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
