'use client';

/**
 * Swing2App 웹뷰 앱 통합 라이브러리
 *
 * 이 모듈은 Swing2App으로 만든 푸시앱에서 회원 연동 및 푸시 알림을 처리합니다.
 *
 * @see https://documentation.swing2app.co.kr/developer/webview/javascript-api
 */

// Swing2App SDK 전역 타입 정의
declare global {
  interface Window {
    swingWebViewPlugin?: {
      app: {
        login: {
          doAppLogin: (userId: string, userName: string) => void;
          doAppLogout: () => void;
        };
        methods: {
          getCurrentPlatform: () => 'android' | 'ios' | 'web browser';
          getAppVersion: () => Promise<{
            appVersion: string;
            deviceModel: string;
            osVersion: string;
          }>;
          isNotificationEnabled: () => Promise<'1' | 'off_on_system' | 'off_on_app'>;
        };
        storage: {
          setItem: (key: string, value: string) => void;
          getItem: (key: string) => Promise<string | null>;
          removeItem: (key: string) => void;
        };
      };
    };
  }
}

// SDK 스크립트 URL
const SWING2APP_SDK_URL =
  'https://pcdn2.swing2app.co.kr/swing_public_src/v3/2024_02_28_002/js/swing_app_on_web.js';

let sdkLoaded = false;
let sdkLoadPromise: Promise<void> | null = null;

/**
 * Swing2App SDK 로드
 */
export async function loadSwing2AppSDK(): Promise<void> {
  if (typeof window === 'undefined') return;

  if (sdkLoaded) return;

  if (sdkLoadPromise) return sdkLoadPromise;

  sdkLoadPromise = new Promise((resolve, reject) => {
    // 이미 로드되어 있는지 확인
    if (window.swingWebViewPlugin) {
      sdkLoaded = true;
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = SWING2APP_SDK_URL;
    script.async = true;

    script.onload = () => {
      sdkLoaded = true;
      resolve();
    };

    script.onerror = () => {
      reject(new Error('Swing2App SDK 로드 실패'));
    };

    document.head.appendChild(script);
  });

  return sdkLoadPromise;
}

/**
 * Swing2App 앱 내에서 실행 중인지 확인
 */
export function isSwing2App(): boolean {
  if (typeof window === 'undefined') return false;

  // swingWebViewPlugin이 있으면 Swing2App 앱 내부
  if (window.swingWebViewPlugin) return true;

  // User Agent로 추가 확인 (Swing2App 앱은 특별한 UA를 가질 수 있음)
  const ua = navigator.userAgent.toLowerCase();
  return ua.includes('swing2app') || ua.includes('swingwebview');
}

/**
 * 현재 플랫폼 확인
 */
export function getCurrentPlatform(): 'android' | 'ios' | 'web' {
  if (typeof window === 'undefined') return 'web';

  if (window.swingWebViewPlugin) {
    const platform = window.swingWebViewPlugin.app.methods.getCurrentPlatform();
    if (platform === 'web browser') return 'web';
    return platform;
  }

  return 'web';
}

/**
 * Swing2App 회원 로그인 연동
 *
 * 웹사이트에서 로그인 시 호출하여 Swing2App에 회원 정보 전달
 * 이렇게 연동하면 Swing2App 콘솔에서 해당 회원에게 개별 푸시 발송 가능
 *
 * @param userId 사용자 고유 ID (이메일 또는 UUID)
 * @param userName 사용자 이름 (표시용)
 */
export function syncLogin(userId: string, userName?: string): void {
  if (typeof window === 'undefined') return;

  if (window.swingWebViewPlugin) {
    window.swingWebViewPlugin.app.login.doAppLogin(userId, userName || userId);
  }
}

/**
 * Swing2App 회원 로그아웃 연동
 *
 * 웹사이트에서 로그아웃 시 호출
 */
export function syncLogout(): void {
  if (typeof window === 'undefined') return;

  if (window.swingWebViewPlugin) {
    window.swingWebViewPlugin.app.login.doAppLogout();
  }
}

/**
 * 푸시 알림 활성화 상태 확인
 *
 * @returns '1' = 활성화, 'off_on_system' = 시스템에서 비활성화, 'off_on_app' = 앱에서 비활성화
 */
export async function getPushNotificationStatus(): Promise<
  'enabled' | 'disabled_system' | 'disabled_app' | 'not_supported'
> {
  if (typeof window === 'undefined') return 'not_supported';

  if (!window.swingWebViewPlugin) return 'not_supported';

  try {
    const status = await window.swingWebViewPlugin.app.methods.isNotificationEnabled();

    switch (status) {
      case '1':
        return 'enabled';
      case 'off_on_system':
        return 'disabled_system';
      case 'off_on_app':
        return 'disabled_app';
      default:
        return 'not_supported';
    }
  } catch {
    return 'not_supported';
  }
}

/**
 * 앱 버전 정보 가져오기
 */
export async function getAppInfo(): Promise<{
  appVersion: string;
  deviceModel: string;
  osVersion: string;
} | null> {
  if (typeof window === 'undefined') return null;

  if (!window.swingWebViewPlugin) return null;

  try {
    return await window.swingWebViewPlugin.app.methods.getAppVersion();
  } catch {
    return null;
  }
}

/**
 * 앱 스토리지에 데이터 저장 (자동 로그인 등에 활용)
 */
export function setStorageItem(key: string, value: string): void {
  if (typeof window === 'undefined') return;

  if (window.swingWebViewPlugin) {
    window.swingWebViewPlugin.app.storage.setItem(key, value);
  } else {
    localStorage.setItem(key, value);
  }
}

/**
 * 앱 스토리지에서 데이터 가져오기
 */
export async function getStorageItem(key: string): Promise<string | null> {
  if (typeof window === 'undefined') return null;

  if (window.swingWebViewPlugin) {
    return await window.swingWebViewPlugin.app.storage.getItem(key);
  }

  return localStorage.getItem(key);
}

/**
 * 앱 스토리지에서 데이터 삭제
 */
export function removeStorageItem(key: string): void {
  if (typeof window === 'undefined') return;

  if (window.swingWebViewPlugin) {
    window.swingWebViewPlugin.app.storage.removeItem(key);
  } else {
    localStorage.removeItem(key);
  }
}

// 기본 내보내기
const swing2app = {
  loadSDK: loadSwing2AppSDK,
  isSwing2App,
  getCurrentPlatform,
  syncLogin,
  syncLogout,
  getPushNotificationStatus,
  getAppInfo,
  storage: {
    setItem: setStorageItem,
    getItem: getStorageItem,
    removeItem: removeStorageItem,
  },
};

export default swing2app;
