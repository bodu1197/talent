/**
 * Swing2App 서버 사이드 푸시 API
 *
 * @see https://documentation.swing2app.co.kr/developer/server-side-api/push-api-notification
 */

// 환경 변수
const SWING2APP_APP_ID = process.env.SWING2APP_APP_ID;
const SWING2APP_API_KEY = process.env.SWING2APP_API_KEY;
const SWING2APP_API_URL = 'https://www.swing2app.com/swapi/push_api_send_message';

export interface Swing2AppPushPayload {
  /** 발송 대상 사용자 ID 목록 (최대 100명) */
  userIds: string[];
  /** 푸시 메시지 제목 */
  title: string;
  /** 푸시 메시지 내용 */
  content: string;
  /** 클릭 시 이동할 URL (선택) */
  linkUrl?: string;
  /** 이미지 URL (선택) */
  imageUrl?: string;
}

export interface Swing2AppPushResult {
  success: boolean;
  result?: boolean;
  userCount?: number;
  error?: string;
}

/**
 * Swing2App 푸시 알림 발송
 *
 * @param payload 푸시 메시지 정보
 * @returns 발송 결과
 *
 * @example
 * ```ts
 * const result = await sendSwing2AppPush({
 *   userIds: ['user-uuid-1', 'user-uuid-2'],
 *   title: '새 메시지',
 *   content: '새로운 메시지가 도착했습니다.',
 *   linkUrl: 'https://example.com/messages'
 * });
 * ```
 */
export async function sendSwing2AppPush(
  payload: Swing2AppPushPayload
): Promise<Swing2AppPushResult> {
  if (!SWING2APP_APP_ID || !SWING2APP_API_KEY) {
    return {
      success: false,
      error: 'Swing2App API 설정이 없습니다. SWING2APP_APP_ID와 SWING2APP_API_KEY를 설정하세요.',
    };
  }

  if (payload.userIds.length === 0) {
    return { success: false, error: '발송 대상이 없습니다.' };
  }

  if (payload.userIds.length > 100) {
    return { success: false, error: '한 번에 최대 100명까지 발송 가능합니다.' };
  }

  try {
    const formData = new FormData();
    formData.append('app_id', SWING2APP_APP_ID);
    formData.append('app_api_key', SWING2APP_API_KEY);
    formData.append('send_target_list', payload.userIds.join(','));
    formData.append('send_type', 'push');
    formData.append('message_title', payload.title);
    formData.append('message_content', payload.content);

    if (payload.linkUrl) {
      formData.append('message_link_url', payload.linkUrl);
    }

    if (payload.imageUrl) {
      formData.append('message_image_url', payload.imageUrl);
    }

    const response = await fetch(SWING2APP_API_URL, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      return {
        success: false,
        error: `Swing2App API 오류: ${response.status} - ${errorText}`,
      };
    }

    const result = await response.json();

    return {
      success: result.result === true,
      result: result.result,
      userCount: result.userCount,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Swing2App 푸시 발송 중 오류 발생',
    };
  }
}

/**
 * 전체 사용자에게 푸시 알림 발송
 *
 * @param payload 푸시 메시지 정보 (userIds 제외)
 */
export async function sendSwing2AppPushToAll(
  payload: Omit<Swing2AppPushPayload, 'userIds'>
): Promise<Swing2AppPushResult> {
  return sendSwing2AppPush({
    ...payload,
    userIds: ['-1'], // -1은 전체 발송
  });
}

/**
 * Swing2App API 설정 확인
 */
export function isSwing2AppConfigured(): boolean {
  return Boolean(SWING2APP_APP_ID && SWING2APP_API_KEY);
}
