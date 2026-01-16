# 모바일 앱 (WebView) 배포 가이드

이 문서는 웹앱을 Android/iOS 앱으로 배포하는 방법을 설명합니다.

## 1. Capacitor 설치 및 설정

### 1.1 Capacitor 설치

```bash
# Capacitor 코어 설치
npm install @capacitor/core @capacitor/cli

# 초기화
npx cap init "Talent" "com.talent.app" --web-dir=out

# 플랫폼 추가
npm install @capacitor/android @capacitor/ios
npx cap add android
npx cap add ios
```

### 1.2 capacitor.config.ts 설정

```typescript
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.talent.app',
  appName: 'Talent',
  webDir: 'out',
  server: {
    // 개발 중에는 로컬 서버 사용
    // url: 'http://localhost:3000',
    // 배포 시에는 실제 URL
    url: 'https://talent.vercel.app',
    cleartext: true,
  },
  plugins: {
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#ffffff',
    },
  },
};

export default config;
```

## 2. 푸시 알림 설정

### 2.1 필요한 패키지 설치

```bash
npm install @capacitor/push-notifications @capacitor/device
```

### 2.2 Android 설정 (Firebase)

1. **Firebase 프로젝트 생성**
   - https://console.firebase.google.com 접속
   - 새 프로젝트 생성 또는 기존 프로젝트 선택

2. **Android 앱 추가**
   - 패키지명: `com.talent.app`
   - `google-services.json` 다운로드

3. **파일 배치**

   ```
   android/app/google-services.json
   ```

4. **android/build.gradle 수정**

   ```gradle
   buildscript {
     dependencies {
       classpath 'com.google.gms:google-services:4.3.15'
     }
   }
   ```

5. **android/app/build.gradle 수정**

   ```gradle
   apply plugin: 'com.google.gms.google-services'

   dependencies {
     implementation platform('com.google.firebase:firebase-bom:32.0.0')
     implementation 'com.google.firebase:firebase-messaging'
   }
   ```

### 2.3 iOS 설정 (APNs)

1. **Apple Developer Console 설정**
   - https://developer.apple.com 접속
   - Certificates, Identifiers & Profiles → Keys
   - APNs Key 생성 및 다운로드

2. **Firebase에 APNs 키 등록**
   - Firebase Console → Project Settings → Cloud Messaging
   - iOS app configuration → APNs authentication key 업로드

3. **Xcode 설정**

   ```
   ios/App/App.entitlements:
   - aps-environment: development (or production)

   Capabilities:
   - Push Notifications: ON
   - Background Modes: Remote notifications ON
   ```

### 2.4 서버 환경 변수 설정

```env
# .env.local 또는 Vercel 환경변수
FCM_SERVER_KEY=your_fcm_server_key_here
CRON_SECRET=your_cron_secret_here
```

FCM 서버 키 가져오기:

1. Firebase Console → Project Settings → Cloud Messaging
2. Cloud Messaging API (Legacy) → Server key

## 3. Vercel Cron 설정

### 3.1 vercel.json 수정

```json
{
  "crons": [
    {
      "path": "/api/cron/push-notifications",
      "schedule": "* * * * *"
    },
    {
      "path": "/api/cron/auto-confirm",
      "schedule": "0 * * * *"
    }
  ]
}
```

### 3.2 Cron 인증 설정

Vercel Dashboard → Settings → Environment Variables:

- `CRON_SECRET`: 랜덤 문자열 (예: `openssl rand -hex 32`)

## 4. 앱 빌드 및 배포

### 4.1 웹 빌드

```bash
# Next.js 정적 빌드
npm run build
# 또는 export
npx next build && npx next export
```

### 4.2 Android 빌드

```bash
# Capacitor 동기화
npx cap sync android

# Android Studio에서 열기
npx cap open android

# 또는 CLI로 빌드
cd android && ./gradlew assembleRelease
```

### 4.3 iOS 빌드

```bash
# Capacitor 동기화
npx cap sync ios

# Xcode에서 열기
npx cap open ios

# Archive → Distribute App
```

## 5. 테스트

### 5.1 푸시 알림 테스트

```bash
# FCM 테스트 발송 (curl)
curl -X POST "https://fcm.googleapis.com/fcm/send" \
  -H "Authorization: key=YOUR_FCM_SERVER_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "to": "DEVICE_TOKEN",
    "notification": {
      "title": "테스트 알림",
      "body": "푸시 알림이 정상 작동합니다!"
    }
  }'
```

### 5.2 로컬 테스트

```bash
# Android 에뮬레이터
npx cap run android

# iOS 시뮬레이터
npx cap run ios
```

## 6. 앱 초기화 코드

### 6.1 App.tsx 또는 layout.tsx에 추가

```tsx
'use client';

import { useEffect } from 'react';
import { usePushNotifications } from '@/hooks/usePushNotifications';

export function PushNotificationInitializer() {
  const { initialize, isSupported } = usePushNotifications();

  useEffect(() => {
    if (isSupported) {
      initialize();
    }
  }, [initialize, isSupported]);

  return null;
}
```

### 6.2 Provider에 추가

```tsx
// layout.tsx
import { PushNotificationInitializer } from '@/components/PushNotificationInitializer';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <AuthProvider>
          <NotificationProvider>
            <PushNotificationInitializer />
            {children}
          </NotificationProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
```

## 7. 스토어 배포 체크리스트

### Android (Google Play)

- [ ] 앱 아이콘 (512x512)
- [ ] 스플래시 스크린
- [ ] 릴리즈 키스토어 생성
- [ ] 개인정보처리방침 URL
- [ ] 앱 설명 및 스크린샷
- [ ] 콘텐츠 등급 질문서 작성

### iOS (App Store)

- [ ] 앱 아이콘 (1024x1024)
- [ ] 스플래시 스크린
- [ ] Apple Developer 계정 (연 $99)
- [ ] 개인정보처리방침 URL
- [ ] 앱 스크린샷 (다양한 디바이스)
- [ ] 앱 심사 정보 제출

## 8. 문제 해결

### 푸시 알림이 오지 않을 때

1. FCM 서버 키 확인
2. 디바이스 토큰 등록 확인 (`user_device_tokens` 테이블)
3. 푸시 대기열 확인 (`push_notification_queue` 테이블)
4. 로그 확인 (`push_notification_logs` 테이블)

### 앱이 백그라운드에서 종료될 때

- Android: 배터리 최적화 예외 설정
- iOS: Background App Refresh 활성화

### WebView 관련 이슈

- CORS 설정 확인
- CSP (Content Security Policy) 확인
- SSL 인증서 확인
