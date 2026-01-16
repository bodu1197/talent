'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import {
  loadSwing2AppSDK,
  isSwing2App,
  getCurrentPlatform,
  syncLogin,
  syncLogout,
  getPushNotificationStatus,
} from '@/lib/swing2app';
import { logger } from '@/lib/logger';

export interface Swing2AppState {
  /** SDK 로드 완료 여부 */
  isLoaded: boolean;
  /** Swing2App 앱 내에서 실행 중인지 */
  isInApp: boolean;
  /** 현재 플랫폼 (android, ios, web) */
  platform: 'android' | 'ios' | 'web';
  /** 푸시 알림 상태 */
  pushStatus: 'enabled' | 'disabled_system' | 'disabled_app' | 'not_supported' | 'loading';
  /** 회원 연동 완료 여부 */
  isMemberSynced: boolean;
}

/**
 * Swing2App 통합 훅
 *
 * 이 훅은 다음을 자동으로 처리합니다:
 * 1. Swing2App SDK 로드
 * 2. 로그인/로그아웃 시 Swing2App 회원 연동
 * 3. 푸시 알림 상태 확인
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { isInApp, pushStatus } = useSwing2App();
 *
 *   if (isInApp && pushStatus === 'enabled') {
 *     return <p>푸시 알림이 활성화되어 있습니다!</p>;
 *   }
 * }
 * ```
 */
export function useSwing2App(): Swing2AppState & {
  refreshPushStatus: () => Promise<void>;
} {
  const { user } = useAuth();

  const [state, setState] = useState<Swing2AppState>({
    isLoaded: false,
    isInApp: false,
    platform: 'web',
    pushStatus: 'loading',
    isMemberSynced: false,
  });

  // SDK 로드 및 초기화
  useEffect(() => {
    async function initSDK() {
      try {
        await loadSwing2AppSDK();

        const inApp = isSwing2App();
        const platform = getCurrentPlatform();

        setState((prev) => ({
          ...prev,
          isLoaded: true,
          isInApp: inApp,
          platform,
        }));

        logger.info('[Swing2App] SDK 초기화 완료', { inApp, platform });
      } catch (error) {
        logger.error('[Swing2App] SDK 로드 실패:', error);
        setState((prev) => ({
          ...prev,
          isLoaded: true,
          pushStatus: 'not_supported',
        }));
      }
    }

    initSDK();
  }, []);

  // 푸시 상태 확인
  const refreshPushStatus = useCallback(async () => {
    if (!state.isLoaded || !state.isInApp) {
      setState((prev) => ({ ...prev, pushStatus: 'not_supported' }));
      return;
    }

    try {
      const status = await getPushNotificationStatus();
      setState((prev) => ({ ...prev, pushStatus: status }));
    } catch (error) {
      logger.error('[Swing2App] 푸시 상태 확인 실패:', error);
      setState((prev) => ({ ...prev, pushStatus: 'not_supported' }));
    }
  }, [state.isLoaded, state.isInApp]);

  // SDK 로드 후 푸시 상태 확인
  useEffect(() => {
    if (state.isLoaded && state.isInApp) {
      refreshPushStatus();
    }
  }, [state.isLoaded, state.isInApp, refreshPushStatus]);

  // 로그인/로그아웃 시 Swing2App 회원 연동
  useEffect(() => {
    if (!state.isLoaded || !state.isInApp) return;

    if (user) {
      // 로그인 연동
      const userId = user.id;
      const userName = user.user_metadata?.name || user.email || userId;

      syncLogin(userId, userName);
      setState((prev) => ({ ...prev, isMemberSynced: true }));

      logger.info('[Swing2App] 회원 로그인 연동 완료', { userId });
    } else if (state.isMemberSynced) {
      // 로그아웃 연동
      syncLogout();
      setState((prev) => ({ ...prev, isMemberSynced: false }));

      logger.info('[Swing2App] 회원 로그아웃 연동 완료');
    }
  }, [user, state.isLoaded, state.isInApp, state.isMemberSynced]);

  return {
    ...state,
    refreshPushStatus,
  };
}

// swing2app 유틸리티도 함께 내보내기
export { default as swing2app } from '@/lib/swing2app';

export default useSwing2App;
