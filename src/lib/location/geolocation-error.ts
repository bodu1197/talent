/**
 * Geolocation 오류 처리 유틸리티
 * GeolocationPositionError를 분석하여 사용자 친화적인 메시지와 해결 방법을 제공
 */

// ==================== 타입 정의 ====================

/**
 * 위치 오류 코드 (GeolocationPositionError.code)
 */
export enum GeolocationErrorCode {
  PERMISSION_DENIED = 1,
  POSITION_UNAVAILABLE = 2,
  TIMEOUT = 3,
}

/**
 * 위치 오류 상세 정보
 */
export interface GeolocationErrorDetails {
  code: GeolocationErrorCode | number;
  type: 'permission' | 'unavailable' | 'timeout' | 'unsupported' | 'unknown';
  title: string;
  message: string;
  userMessage: string;
  solutions: string[];
  isRetryable: boolean;
  severity: 'warning' | 'error' | 'info';
}

/**
 * 브라우저/디바이스 정보
 */
interface DeviceInfo {
  isMobile: boolean;
  isIOS: boolean;
  isAndroid: boolean;
  isChrome: boolean;
  isFirefox: boolean;
  isSafari: boolean;
  isEdge: boolean;
  isSecureContext: boolean;
}

// ==================== 디바이스 감지 ====================

/**
 * 현재 디바이스/브라우저 정보 감지
 */
function getDeviceInfo(): DeviceInfo {
  if (typeof globalThis.window === 'undefined' || typeof navigator === 'undefined') {
    return {
      isMobile: false,
      isIOS: false,
      isAndroid: false,
      isChrome: false,
      isFirefox: false,
      isSafari: false,
      isEdge: false,
      isSecureContext: false,
    };
  }

  const ua = navigator.userAgent.toLowerCase();

  return {
    isMobile: /mobile|android|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(ua),
    isIOS: /iphone|ipad|ipod/i.test(ua),
    isAndroid: /android/i.test(ua),
    isChrome: /chrome/i.test(ua) && !/edge|edg/i.test(ua),
    isFirefox: /firefox/i.test(ua),
    isSafari: /safari/i.test(ua) && !/chrome/i.test(ua),
    isEdge: /edge|edg/i.test(ua),
    isSecureContext: globalThis.window?.isSecureContext ?? location.protocol === 'https:',
  };
}

// ==================== 오류 메시지 생성 ====================

/**
 * 권한 거부 오류 상세 정보 생성
 */
function getPermissionDeniedDetails(device: DeviceInfo): GeolocationErrorDetails {
  const solutions: string[] = [];

  if (device.isIOS) {
    solutions.push('설정 → Safari → 위치 → 허용으로 변경');
    solutions.push('설정 → 개인 정보 보호 및 보안 → 위치 서비스 → Safari 웹사이트 → 허용');
  } else if (device.isAndroid) {
    solutions.push('설정 → 앱 → Chrome → 권한 → 위치 → 허용');
    solutions.push('주소창 왼쪽 🔒 아이콘 → 사이트 설정 → 위치 → 허용');
  } else if (device.isChrome) {
    solutions.push('주소창 왼쪽 🔒 아이콘 클릭 → 사이트 설정 → 위치 → 허용');
    solutions.push('chrome://settings/content/location 에서 차단 목록 확인');
    solutions.push('Windows 설정 → 개인 정보 → 위치 → 위치 서비스 켜기');
  } else if (device.isFirefox) {
    solutions.push('주소창 왼쪽 🔒 아이콘 → 연결 안전 → 추가 정보 → 권한 → 위치 허용');
  } else if (device.isSafari) {
    solutions.push('Safari → 환경설정 → 웹사이트 → 위치 → 해당 사이트 허용');
  } else if (device.isEdge) {
    solutions.push('주소창 왼쪽 🔒 아이콘 → 사이트 권한 → 위치 → 허용');
    solutions.push('edge://settings/content/location 에서 설정 확인');
  } else {
    solutions.push('브라우저 설정에서 위치 권한을 허용해주세요');
  }

  solutions.push('페이지 새로고침 후 위치 권한 팝업에서 "허용" 클릭');

  return {
    code: GeolocationErrorCode.PERMISSION_DENIED,
    type: 'permission',
    title: '위치 권한 거부됨',
    message: '사용자가 위치 공유를 거부했거나 브라우저 설정에서 차단됨',
    userMessage: '위치 권한이 거부되었습니다. 거리순 정렬을 사용하려면 위치 권한을 허용해주세요.',
    solutions,
    isRetryable: true,
    severity: 'warning',
  };
}

/**
 * 위치 정보 없음 오류 상세 정보 생성
 */
function getPositionUnavailableDetails(device: DeviceInfo): GeolocationErrorDetails {
  const solutions: string[] = [];

  if (device.isMobile) {
    solutions.push('GPS를 켜주세요 (설정 → 위치 → 켜기)');
    solutions.push('실외로 이동하면 GPS 수신이 개선됩니다');
    solutions.push('Wi-Fi를 켜면 실내에서도 위치 정확도가 향상됩니다');
  } else {
    solutions.push('Windows 설정 → 개인 정보 → 위치 → 위치 서비스 켜기');
    solutions.push('Wi-Fi가 연결되어 있으면 위치 정확도가 향상됩니다');
    solutions.push('VPN을 사용 중이라면 위치 정보에 영향을 줄 수 있습니다');
  }

  solutions.push('잠시 후 다시 시도해주세요');

  return {
    code: GeolocationErrorCode.POSITION_UNAVAILABLE,
    type: 'unavailable',
    title: '위치 정보 없음',
    message: '디바이스에서 위치 정보를 가져올 수 없음 (GPS 꺼짐, 실내, 네트워크 문제 등)',
    userMessage: '현재 위치를 확인할 수 없습니다. GPS나 Wi-Fi 연결을 확인해주세요.',
    solutions,
    isRetryable: true,
    severity: 'error',
  };
}

/**
 * 시간 초과 오류 상세 정보 생성
 */
function getTimeoutDetails(device: DeviceInfo): GeolocationErrorDetails {
  const solutions: string[] = [];

  if (device.isMobile) {
    solutions.push('GPS 신호가 약할 수 있습니다. 실외로 이동해보세요');
    solutions.push('설정에서 "고정밀 위치" 또는 "높은 정확도"를 활성화해보세요');
  } else {
    solutions.push('네트워크 연결을 확인해주세요');
    solutions.push('방화벽이나 보안 프로그램이 위치 서비스를 차단할 수 있습니다');
  }

  solutions.push('페이지를 새로고침하고 다시 시도해주세요');
  solutions.push('잠시 후 다시 시도해주세요');

  return {
    code: GeolocationErrorCode.TIMEOUT,
    type: 'timeout',
    title: '위치 요청 시간 초과',
    message: '위치 정보를 가져오는 데 시간이 너무 오래 걸림',
    userMessage: '위치 확인에 시간이 오래 걸리고 있습니다. 잠시 후 다시 시도해주세요.',
    solutions,
    isRetryable: true,
    severity: 'warning',
  };
}

/**
 * 지원하지 않는 브라우저 오류 상세 정보 생성
 */
function getUnsupportedDetails(): GeolocationErrorDetails {
  return {
    code: 0,
    type: 'unsupported',
    title: '위치 기능 미지원',
    message: '이 브라우저는 Geolocation API를 지원하지 않음',
    userMessage: '이 브라우저에서는 위치 기능을 사용할 수 없습니다. 최신 브라우저를 사용해주세요.',
    solutions: [
      'Chrome, Firefox, Safari, Edge 등 최신 브라우저를 사용해주세요',
      '브라우저를 최신 버전으로 업데이트해주세요',
    ],
    isRetryable: false,
    severity: 'error',
  };
}

/**
 * HTTPS 필요 오류 상세 정보 생성
 */
function getInsecureContextDetails(): GeolocationErrorDetails {
  return {
    code: 0,
    type: 'unavailable',
    title: 'HTTPS 필요',
    message: 'Geolocation API는 보안 컨텍스트(HTTPS)에서만 사용 가능',
    userMessage: '위치 기능은 보안 연결(HTTPS)에서만 사용할 수 있습니다.',
    solutions: [
      'https:// 로 시작하는 주소로 접속해주세요',
      '사이트 관리자에게 HTTPS 설정을 요청해주세요',
    ],
    isRetryable: false,
    severity: 'error',
  };
}

/**
 * 알 수 없는 오류 상세 정보 생성
 */
function getUnknownErrorDetails(error: unknown): GeolocationErrorDetails {
  const errorMessage = error instanceof Error ? error.message : String(error);

  return {
    code: -1,
    type: 'unknown',
    title: '알 수 없는 오류',
    message: errorMessage,
    userMessage: '위치를 가져오는 중 오류가 발생했습니다. 다시 시도해주세요.',
    solutions: [
      '페이지를 새로고침해주세요',
      '브라우저를 재시작해주세요',
      '다른 브라우저에서 시도해주세요',
    ],
    isRetryable: true,
    severity: 'error',
  };
}

// ==================== 메인 함수 ====================

/**
 * GeolocationPositionError를 분석하여 상세 정보 반환
 *
 * @param error - GeolocationPositionError 또는 일반 Error
 * @returns GeolocationErrorDetails - 오류 상세 정보
 *
 * @example
 * ```typescript
 * navigator.geolocation.getCurrentPosition(
 *   (position) => console.log(position),
 *   (error) => {
 *     const details = parseGeolocationError(error);
 *     console.log(details.userMessage);
 *     console.log('해결 방법:', details.solutions);
 *   }
 * );
 * ```
 */
export function parseGeolocationError(error: unknown): GeolocationErrorDetails {
  const device = getDeviceInfo();

  // HTTPS 체크
  if (!device.isSecureContext) {
    return getInsecureContextDetails();
  }

  // Geolocation 지원 체크
  if (typeof navigator === 'undefined' || !navigator.geolocation) {
    return getUnsupportedDetails();
  }

  // GeolocationPositionError 처리
  if (error && typeof error === 'object' && 'code' in error) {
    const geoError = error as GeolocationPositionError;

    switch (geoError.code) {
      case GeolocationErrorCode.PERMISSION_DENIED:
        return getPermissionDeniedDetails(device);
      case GeolocationErrorCode.POSITION_UNAVAILABLE:
        return getPositionUnavailableDetails(device);
      case GeolocationErrorCode.TIMEOUT:
        return getTimeoutDetails(device);
      default:
        return getUnknownErrorDetails(error);
    }
  }

  return getUnknownErrorDetails(error);
}

/**
 * Geolocation 사용 가능 여부 체크
 *
 * @returns { available: boolean, reason?: string }
 */
export function checkGeolocationAvailability(): {
  available: boolean;
  reason?: string;
  canRetry: boolean;
} {
  if (typeof globalThis.window === 'undefined') {
    return {
      available: false,
      reason: '서버 환경에서는 위치 기능을 사용할 수 없습니다',
      canRetry: false,
    };
  }

  if (!globalThis.window?.isSecureContext && location.protocol !== 'https:') {
    return { available: false, reason: 'HTTPS 연결이 필요합니다', canRetry: false };
  }

  if (!navigator.geolocation) {
    return {
      available: false,
      reason: '이 브라우저는 위치 기능을 지원하지 않습니다',
      canRetry: false,
    };
  }

  return { available: true, canRetry: true };
}

/**
 * 위치 권한 상태 확인 (Permissions API 사용)
 *
 * @returns Promise<'granted' | 'denied' | 'prompt' | 'unknown'>
 */
export async function checkLocationPermission(): Promise<
  'granted' | 'denied' | 'prompt' | 'unknown'
> {
  try {
    if (!navigator.permissions) {
      return 'unknown';
    }

    // eslint-disable-next-line sonarjs/no-intrusive-permissions -- 위치 권한 상태 확인에 필요
    const result = await navigator.permissions.query({ name: 'geolocation' });
    return result.state;
  } catch {
    return 'unknown';
  }
}

/**
 * 사용자 친화적인 오류 메시지 반환 (간단한 버전)
 *
 * @param error - GeolocationPositionError
 * @returns 사용자에게 표시할 메시지
 */
export function getGeolocationErrorMessage(error: unknown): string {
  const details = parseGeolocationError(error);
  return details.userMessage;
}

/**
 * 오류가 재시도 가능한지 확인
 */
export function isRetryableError(error: unknown): boolean {
  const details = parseGeolocationError(error);
  return details.isRetryable;
}

// ==================== 로깅 유틸리티 ====================

/**
 * 위치 오류 로깅 (디버깅용)
 */
export function logGeolocationError(error: unknown, context?: string): void {
  const details = parseGeolocationError(error);
  const device = getDeviceInfo();

  const contextSuffix = context ? ` (${context})` : '';
  console.warn(`🌍 Geolocation Error${contextSuffix}`, {
    type: details.type,
    code: details.code,
    title: details.title,
    message: details.message,
    userMessage: details.userMessage,
    solutions: details.solutions,
    isRetryable: details.isRetryable,
    device,
  });
}
