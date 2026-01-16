# Swing2App 푸시 알림 설정 가이드

이 문서는 Swing2App으로 제작한 푸시앱에서 푸시 알림을 설정하는 방법을 설명합니다.

## 1. Swing2App 앱 타입 선택

Swing2App에서 앱을 만들 때 **반드시 "푸시앱"** 타입을 선택해야 합니다.

| 앱 타입    | 푸시 알림 |
| ---------- | --------- |
| 웹뷰앱     | ❌ 불가   |
| **푸시앱** | ✅ 가능   |

## 2. Swing2App API 키 발급

### 2.1 App ID 및 API Key 확인

1. [Swing2App 콘솔](https://www.swing2app.co.kr) 로그인
2. 앱운영 → 서비스관리 → 앱 운영관리 → 앱 고급관리 → **API KEY관리**
3. App ID와 API Key 복사

> 참고: API Key가 없는 경우 Swing2App 고객센터에 발급 요청 (유료앱 전용)

### 2.2 환경 변수 설정 (Vercel)

```env
# Swing2App API 설정
SWING2APP_APP_ID=your-app-id
SWING2APP_API_KEY=your-api-key

# Cron 작업 인증
CRON_SECRET=your-random-secret-string
```

## 3. 회원 연동 설정

Swing2App에서 개별 사용자에게 푸시를 보내려면 회원 연동이 필요합니다.

### 3.1 자동 연동 (권장)

`useSwing2App` 훅을 사용하면 로그인/로그아웃 시 자동으로 Swing2App에 회원이 연동됩니다.

```tsx
// app/layout.tsx 또는 providers.tsx
'use client';

import { useSwing2App } from '@/hooks/useSwing2App';

function Swing2AppInitializer() {
  // 이 훅이 자동으로 회원 연동을 처리합니다
  const { isInApp, pushStatus } = useSwing2App();

  // 디버그 로그 (선택)
  useEffect(() => {
    console.log('Swing2App 상태:', { isInApp, pushStatus });
  }, [isInApp, pushStatus]);

  return null;
}

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <AuthProvider>
          <Swing2AppInitializer />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
```

### 3.2 수동 연동

특정 시점에 수동으로 연동하려면:

```tsx
import { syncLogin, syncLogout } from '@/lib/swing2app';

// 로그인 시
function handleLogin(user) {
  syncLogin(user.id, user.name);
}

// 로그아웃 시
function handleLogout() {
  syncLogout();
}
```

## 4. 푸시 알림 발송

### 4.1 자동 발송 (Cron)

알림이 생성되면 `push_notification_queue` 테이블에 추가되고,
Cron 작업(`/api/cron/push-notifications`)이 매분 실행되어 자동 발송합니다.

### 4.2 즉시 발송 (API)

```typescript
// 서버에서 직접 발송
import { sendSwing2AppPush } from '@/lib/swing2app/server';

const result = await sendSwing2AppPush({
  userIds: ['user-id-1', 'user-id-2'],
  title: '새 메시지',
  content: '새로운 메시지가 도착했습니다.',
  linkUrl: 'https://your-domain.com/messages',
});
```

### 4.3 전체 발송

```typescript
import { sendSwing2AppPushToAll } from '@/lib/swing2app/server';

const result = await sendSwing2AppPushToAll({
  title: '공지사항',
  content: '새로운 공지가 등록되었습니다.',
});
```

## 5. 푸시 알림 상태 확인

앱 내에서 푸시 알림 활성화 여부를 확인할 수 있습니다:

```tsx
import { useSwing2App } from '@/hooks/useSwing2App';

function PushStatus() {
  const { pushStatus } = useSwing2App();

  switch (pushStatus) {
    case 'enabled':
      return <p>푸시 알림이 활성화되어 있습니다.</p>;
    case 'disabled_system':
      return <p>시스템 설정에서 알림이 비활성화되어 있습니다.</p>;
    case 'disabled_app':
      return <p>앱 설정에서 알림이 비활성화되어 있습니다.</p>;
    default:
      return <p>푸시 알림을 확인할 수 없습니다.</p>;
  }
}
```

## 6. 아키텍처

```
사용자 앱 (Swing2App 푸시앱)
    │
    ├── Swing2App SDK (swing_app_on_web.js)
    │   ├── 회원 연동 (doAppLogin/doAppLogout)
    │   └── 푸시 상태 확인 (isNotificationEnabled)
    │
    └── useSwing2App Hook
        └── 로그인/로그아웃 시 자동 연동

서버 (Next.js API)
    │
    ├── /api/push/send - 즉시 발송
    └── /api/cron/push-notifications - 대기열 처리
            │
            └── Swing2App Push API
                └── https://www.swing2app.com/swapi/push_api_send_message

Supabase (DB)
    │
    ├── push_notification_queue - 발송 대기열
    └── push_notification_logs - 발송 로그
```

## 7. 문제 해결

### 푸시 알림이 오지 않을 때

1. **앱 타입 확인**: 푸시앱으로 제작되었는지 확인
2. **회원 연동 확인**: Swing2App 콘솔 → 푸시&회원 → 회원조회에서 사용자 확인
3. **API 키 확인**: 환경 변수에 올바른 API 키가 설정되었는지 확인
4. **알림 권한 확인**: 기기 설정에서 앱 알림이 허용되었는지 확인

### 회원이 연동되지 않을 때

1. **SDK 로드 확인**: 개발자 도구에서 `window.swingWebViewPlugin` 존재 여부 확인
2. **로그인 순서 확인**: AuthProvider 내부에서 useSwing2App을 사용하는지 확인
3. **Swing2App 콘솔 확인**: 회원조회 메뉴에서 연동된 회원 목록 확인

### API 오류

| 오류 | 원인          | 해결                                    |
| ---- | ------------- | --------------------------------------- |
| 401  | API 키 불일치 | SWING2APP_API_KEY 확인                  |
| 403  | 권한 없음     | 유료앱인지, API 사용 권한이 있는지 확인 |
| 429  | 요청 제한     | 대량 발송 시 배치 처리 또는 딜레이 추가 |

## 8. 참고 링크

- [Swing2App 푸시 API 문서](https://documentation.swing2app.co.kr/developer/server-side-api/push-api-notification)
- [JavaScript 웹뷰 API 문서](https://documentation.swing2app.co.kr/developer/webview/javascript-api)
- [회원 연동 가이드](https://documentation.swing2app.co.kr/developer/webview/user-integration)
- [푸시앱 제작 방법](https://documentation.swing2app.co.kr/webapp/manual/push-webview)
