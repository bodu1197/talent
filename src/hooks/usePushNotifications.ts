'use client';

import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import { logger } from '@/lib/logger';

// Capacitor Push Notifications 인터페이스
interface PushNotificationsPlugin {
  requestPermissions: () => Promise<{ receive: string }>;
  register: () => Promise<void>;
  addListener: (
    event: string,
    callback: (data: unknown) => void
  ) => Promise<{ remove: () => void }>;
  getDeliveredNotifications: () => Promise<{ notifications: unknown[] }>;
  removeAllDeliveredNotifications: () => Promise<void>;
}

interface PushNotificationToken {
  value: string;
}

interface PushNotificationData {
  id: string;
  data: Record<string, string>;
  title?: string;
  body?: string;
}

// 네이티브 앱 환경 감지
function isNativeApp(): boolean {
  return (
    typeof window !== 'undefined' && !!(window as unknown as { Capacitor?: unknown }).Capacitor
  );
}

// Capacitor 플러그인 가져오기
async function getPushPlugin(): Promise<PushNotificationsPlugin | null> {
  if (!isNativeApp()) return null;

  try {
    // @capacitor/push-notifications 동적 임포트
    const { PushNotifications } = await import('@capacitor/push-notifications');
    return PushNotifications as unknown as PushNotificationsPlugin;
  } catch {
    logger.warn('Push notifications plugin not available');
    return null;
  }
}

// 플랫폼 감지
function getPlatform(): 'android' | 'ios' | 'web' {
  if (typeof window === 'undefined') return 'web';

  const userAgent = navigator.userAgent.toLowerCase();
  if (/android/.test(userAgent)) return 'android';
  if (/iphone|ipad|ipod/.test(userAgent)) return 'ios';
  return 'web';
}

// 디바이스 정보 가져오기
async function getDeviceInfo(): Promise<{
  device_id?: string;
  device_name?: string;
  os_version?: string;
}> {
  if (!isNativeApp()) return {};

  try {
    const { Device } = await import('@capacitor/device');
    const info = await Device.getInfo();
    const id = await Device.getId();

    return {
      device_id: id.identifier,
      device_name: `${info.manufacturer} ${info.model}`,
      os_version: info.osVersion,
    };
  } catch {
    return {};
  }
}

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

export function usePushNotifications() {
  const { user } = useAuth();
  const [isSupported, setIsSupported] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [permission, setPermission] = useState<'granted' | 'denied' | 'default'>('default');
  const [settings, setSettings] = useState<PushNotificationSettings | null>(null);
  const [loading, setLoading] = useState(true);

  // 푸시 알림 지원 여부 확인
  useEffect(() => {
    const checkSupport = async () => {
      const plugin = await getPushPlugin();
      setIsSupported(!!plugin || 'Notification' in window);
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
    try {
      const plugin = await getPushPlugin();

      if (plugin) {
        // Capacitor 네이티브 앱
        const result = await plugin.requestPermissions();
        const granted = result.receive === 'granted';
        setPermission(granted ? 'granted' : 'denied');
        return granted;
      } else if ('Notification' in window) {
        // 웹 브라우저
        const result = await Notification.requestPermission();
        setPermission(result);
        return result === 'granted';
      }

      return false;
    } catch (error) {
      logger.error('푸시 권한 요청 실패:', error);
      return false;
    }
  }, []);

  // 토큰 등록
  const registerToken = useCallback(async (): Promise<boolean> => {
    if (!user) return false;

    try {
      const plugin = await getPushPlugin();

      if (plugin) {
        // Capacitor 네이티브 앱
        await plugin.register();

        // 토큰 수신 리스너
        await plugin.addListener('registration', async (token: PushNotificationToken) => {
          const deviceInfo = await getDeviceInfo();

          const response = await fetch('/api/push/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              device_token: token.value,
              platform: getPlatform(),
              ...deviceInfo,
            }),
          });

          if (response.ok) {
            setIsRegistered(true);
            logger.info('푸시 토큰 등록 완료');
          }
        });

        // 알림 수신 리스너 (포그라운드)
        await plugin.addListener(
          'pushNotificationReceived',
          (notification: PushNotificationData) => {
            logger.info('푸시 알림 수신 (포그라운드):', notification);
            // 포그라운드에서는 인앱 알림으로 처리 (NotificationProvider가 처리)
          }
        );

        // 알림 클릭 리스너
        await plugin.addListener(
          'pushNotificationActionPerformed',
          (action: { notification: PushNotificationData }) => {
            logger.info('푸시 알림 클릭:', action);

            // 링크가 있으면 해당 페이지로 이동
            const link = action.notification.data?.link;
            if (link && typeof window !== 'undefined') {
              window.location.href = link;
            }
          }
        );

        return true;
      }

      return false;
    } catch (error) {
      logger.error('푸시 토큰 등록 실패:', error);
      return false;
    }
  }, [user]);

  // 토큰 해제 (로그아웃 시)
  const unregisterToken = useCallback(async (deviceToken: string): Promise<void> => {
    try {
      await fetch(`/api/push/register?device_token=${encodeURIComponent(deviceToken)}`, {
        method: 'DELETE',
      });
      setIsRegistered(false);
    } catch (error) {
      logger.error('푸시 토큰 해제 실패:', error);
    }
  }, []);

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

    const granted = await requestPermission();
    if (granted) {
      await registerToken();
    }
  }, [isSupported, user, requestPermission, registerToken]);

  return {
    isSupported,
    isRegistered,
    permission,
    settings,
    loading,
    initialize,
    requestPermission,
    registerToken,
    unregisterToken,
    updateSettings,
    fetchSettings,
  };
}

export default usePushNotifications;
