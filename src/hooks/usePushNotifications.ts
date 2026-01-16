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
  if (typeof globalThis.window === 'undefined') {
    return { device_name: 'Unknown', os_version: 'Unknown' };
  }

  const userAgent = navigator.userAgent;
  let browserName = 'Unknown Browser';
  let osName = 'Unknown OS';

  if (userAgent.includes('Chrome')) browserName = 'Chrome';
  else if (userAgent.includes('Safari')) browserName = 'Safari';
  else if (userAgent.includes('Firefox')) browserName = 'Firefox';
  else if (userAgent.includes('Edge')) browserName = 'Edge';

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
    const registration = await navigator.serviceWorker.register('/sw.js');
    await navigator.serviceWorker.ready;
    logger.info('Service Worker 등록 성공');
    return registration;
  } catch (error) {
    logger.error('Service Worker 등록 실패:', error);
    return null;
  }
}

// Base64 URL을 Uint8Array로 변환
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replaceAll('-', '+').replaceAll('_', '/');
  const rawData = globalThis.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.codePointAt(i) ?? 0;
  }
  return outputArray;
}

// 푸시 구독 정보를 서버에 전송
async function subscribeToPush(
  registration: ServiceWorkerRegistration
): Promise<PushSubscription | null> {
  try {
    // VAPID 공개키 가져오기
    const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    if (!vapidPublicKey) {
      logger.error('VAPID 공개키가 설정되지 않았습니다');
      return null;
    }

    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidPublicKey) as BufferSource,
    });

    return subscription;
  } catch (error) {
    logger.error('푸시 구독 실패:', error);
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
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);

  // 푸시 알림 지원 여부 확인
  useEffect(() => {
    const checkSupport = () => {
      const supported =
        typeof globalThis.window !== 'undefined' &&
        'Notification' in globalThis.window &&
        'serviceWorker' in navigator &&
        'PushManager' in globalThis.window;

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
      // 서비스 워커 등록
      const registration = await registerServiceWorker();
      if (!registration) return false;

      // 푸시 구독
      const pushSubscription = await subscribeToPush(registration);
      if (!pushSubscription) return false;

      setSubscription(pushSubscription);

      // 브라우저 정보
      const browserInfo = getBrowserInfo();

      // 서버에 구독 정보 등록
      const response = await fetch('/api/push/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subscription: pushSubscription.toJSON(),
          platform: 'web',
          device_name: browserInfo.device_name,
          os_version: browserInfo.os_version,
        }),
      });

      if (response.ok) {
        setIsRegistered(true);
        logger.info('웹 푸시 구독 완료');
        return true;
      }

      return false;
    } catch (error) {
      logger.error('푸시 등록 실패:', error);
      return false;
    }
  }, [user, isSupported]);

  // 토큰 해제 (로그아웃 시)
  const unregisterToken = useCallback(async (): Promise<void> => {
    try {
      if (subscription) {
        await subscription.unsubscribe();

        await fetch('/api/push/register', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            endpoint: subscription.endpoint,
          }),
        });
      }
      setIsRegistered(false);
      setSubscription(null);
    } catch (error) {
      logger.error('푸시 해제 실패:', error);
    }
  }, [subscription]);

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

  return {
    isSupported,
    isRegistered,
    permission,
    settings,
    loading,
    subscription,
    initialize,
    requestPermission,
    registerToken,
    unregisterToken,
    updateSettings,
    fetchSettings,
  };
}

export default usePushNotifications;
