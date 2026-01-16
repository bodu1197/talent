'use client';

import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import { logger } from '@/lib/logger';

export interface PushNotificationSettings {
  push_enabled: boolean;
  notify_orders: boolean;
  notify_messages: boolean;
  notify_errands: boolean;
  notify_marketing: boolean;
  devices: {
    id: string;
    platform: string;
    device_name: string;
    push_enabled: boolean;
    last_used_at: string;
  }[];
}

// 브라우저 정보 가져오기
function getBrowserInfo(): { device_name: string; os_version: string } {
  if (typeof window === 'undefined') {
    return { device_name: 'Unknown', os_version: 'Unknown' };
  }

  const userAgent = navigator.userAgent;
  let browserName = 'Unknown Browser';
  let osName = 'Unknown OS';

  // 브라우저 감지
  if (userAgent.includes('Chrome')) browserName = 'Chrome';
  else if (userAgent.includes('Safari')) browserName = 'Safari';
  else if (userAgent.includes('Firefox')) browserName = 'Firefox';
  else if (userAgent.includes('Edge')) browserName = 'Edge';

  // OS 감지
  if (userAgent.includes('Windows')) osName = 'Windows';
  else if (userAgent.includes('Mac')) osName = 'macOS';
  else if (userAgent.includes('Linux')) osName = 'Linux';
  else if (userAgent.includes('Android')) osName = 'Android';
  else if (userAgent.includes('iOS') || userAgent.includes('iPhone')) osName = 'iOS';

  return {
    device_name: `${browserName} on ${osName}`,
    os_version: osName,
  };
}

// 서비스 워커 등록
async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!('serviceWorker' in navigator)) {
    logger.warn('Service Worker를 지원하지 않는 브라우저입니다');
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
    logger.info('Service Worker 등록 성공');
    return registration;
  } catch (error) {
    logger.error('Service Worker 등록 실패:', error);
    return null;
  }
}

// FCM 토큰 가져오기
async function getFCMToken(): Promise<string | null> {
  try {
    // Firebase SDK 동적 임포트
    const { initializeApp, getApps } = await import('firebase/app');
    const { getMessaging, getToken } = await import('firebase/messaging');

    // Firebase 설정
    const firebaseConfig = {
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    };

    // Firebase 앱 초기화 (이미 초기화되지 않은 경우에만)
    const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

    // 메시징 인스턴스 가져오기
    const messaging = getMessaging(app);

    // Service Worker 등록
    const registration = await registerServiceWorker();
    if (!registration) return null;

    // FCM 토큰 가져오기
    const token = await getToken(messaging, {
      vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
      serviceWorkerRegistration: registration,
    });

    return token;
  } catch (error) {
    logger.error('FCM 토큰 가져오기 실패:', error);
    return null;
  }
}

export function usePushNotifications() {
  const { user } = useAuth();
  const [isSupported, setIsSupported] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [permission, setPermission] = useState<'granted' | 'denied' | 'default'>('default');
  const [settings, setSettings] = useState<PushNotificationSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [fcmToken, setFcmToken] = useState<string | null>(null);

  // 푸시 알림 지원 여부 확인
  useEffect(() => {
    const checkSupport = () => {
      const supported =
        typeof window !== 'undefined' &&
        'Notification' in window &&
        'serviceWorker' in navigator &&
        'PushManager' in window;

      setIsSupported(supported);

      if (supported) {
        setPermission(Notification.permission);
      }

      setLoading(false);
    };

    checkSupport();
  }, []);

  // 설정 조회
  const fetchSettings = useCallback(async () => {
    if (!user) return;

    try {
      const response = await fetch('/api/push/settings');
      if (response.ok) {
        const { settings: data } = await response.json();
        setSettings(data);
      }
    } catch (error) {
      logger.error('푸시 설정 조회 실패:', error);
    }
  }, [user]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  // 권한 요청
  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!isSupported) return false;

    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      return result === 'granted';
    } catch (error) {
      logger.error('푸시 권한 요청 실패:', error);
      return false;
    }
  }, [isSupported]);

  // 토큰 등록
  const registerToken = useCallback(async (): Promise<boolean> => {
    if (!user || !isSupported) return false;

    try {
      // FCM 토큰 가져오기
      const token = await getFCMToken();
      if (!token) {
        logger.warn('FCM 토큰을 가져올 수 없습니다');
        return false;
      }

      setFcmToken(token);

      // 브라우저 정보
      const browserInfo = getBrowserInfo();

      // 서버에 토큰 등록
      const response = await fetch('/api/push/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          device_token: token,
          platform: 'web',
          device_name: browserInfo.device_name,
          os_version: browserInfo.os_version,
        }),
      });

      if (response.ok) {
        setIsRegistered(true);
        logger.info('웹 푸시 토큰 등록 완료');
        return true;
      }

      return false;
    } catch (error) {
      logger.error('푸시 토큰 등록 실패:', error);
      return false;
    }
  }, [user, isSupported]);

  // 토큰 해제 (로그아웃 시)
  const unregisterToken = useCallback(
    async (deviceToken?: string): Promise<void> => {
      const tokenToDelete = deviceToken || fcmToken;
      if (!tokenToDelete) return;

      try {
        await fetch(`/api/push/register?device_token=${encodeURIComponent(tokenToDelete)}`, {
          method: 'DELETE',
        });
        setIsRegistered(false);
        setFcmToken(null);
      } catch (error) {
        logger.error('푸시 토큰 해제 실패:', error);
      }
    },
    [fcmToken]
  );

  // 설정 업데이트
  const updateSettings = useCallback(
    async (newSettings: Partial<PushNotificationSettings>): Promise<boolean> => {
      try {
        const response = await fetch('/api/push/settings', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newSettings),
        });

        if (response.ok) {
          await fetchSettings();
          return true;
        }
        return false;
      } catch (error) {
        logger.error('푸시 설정 업데이트 실패:', error);
        return false;
      }
    },
    [fetchSettings]
  );

  // 초기화 (앱 시작 시 호출)
  const initialize = useCallback(async (): Promise<void> => {
    if (!isSupported || !user) return;

    // 이미 권한이 있으면 바로 등록
    if (permission === 'granted') {
      await registerToken();
      return;
    }

    // 권한 요청 후 등록
    const granted = await requestPermission();
    if (granted) {
      await registerToken();
    }
  }, [isSupported, user, permission, requestPermission, registerToken]);

  // 포그라운드 메시지 리스너 설정
  useEffect(() => {
    if (!isSupported || !isRegistered) return;

    let unsubscribe: (() => void) | undefined;

    const setupMessageListener = async () => {
      try {
        const { initializeApp, getApps } = await import('firebase/app');
        const { getMessaging, onMessage } = await import('firebase/messaging');

        const firebaseConfig = {
          apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
          authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
          projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
          storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
          messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
          appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
        };

        const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
        const messaging = getMessaging(app);

        // 포그라운드에서 메시지 수신
        unsubscribe = onMessage(messaging, (payload) => {
          logger.info('포그라운드 메시지 수신:', payload);

          // 브라우저 알림 표시 (포그라운드에서는 자동 표시되지 않음)
          if (Notification.permission === 'granted' && payload.notification) {
            new Notification(payload.notification.title || '새 알림', {
              body: payload.notification.body,
              icon: '/icons/icon-192x192.png',
              data: payload.data,
            });
          }
        });
      } catch (error) {
        logger.error('메시지 리스너 설정 실패:', error);
      }
    };

    setupMessageListener();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [isSupported, isRegistered]);

  return {
    isSupported,
    isRegistered,
    permission,
    settings,
    loading,
    fcmToken,
    initialize,
    requestPermission,
    registerToken,
    unregisterToken,
    updateSettings,
    fetchSettings,
  };
}

export default usePushNotifications;
