import { NextRequest, NextResponse } from 'next/server';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { logServerError } from '@/lib/rollbar/server';

// FCM 서버 키 (환경 변수에서 가져옴)
const FCM_SERVER_KEY = process.env.FCM_SERVER_KEY;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

interface PushPayload {
  notification_id?: string;
  user_id: string;
  title: string;
  body: string;
  data?: Record<string, string>;
  image_url?: string;
}

interface DeviceToken {
  id: string;
  device_token: string;
  platform: string;
}

interface FCMResult {
  success: number;
  failure: number;
  results: { error?: string }[];
}

// FCM으로 푸시 알림 발송
async function sendFCMNotification(
  tokens: string[],
  payload: {
    title: string;
    body: string;
    data?: Record<string, string>;
    image_url?: string;
  }
): Promise<FCMResult> {
  if (!FCM_SERVER_KEY) {
    throw new Error('FCM_SERVER_KEY가 설정되지 않았습니다');
  }

  const message = {
    registration_ids: tokens,
    notification: {
      title: payload.title,
      body: payload.body,
      image: payload.image_url,
      sound: 'default',
      badge: 1,
      click_action: 'FLUTTER_NOTIFICATION_CLICK',
    },
    data: {
      ...payload.data,
      title: payload.title,
      body: payload.body,
    },
    priority: 'high',
    content_available: true,
  };

  const response = await fetch('https://fcm.googleapis.com/fcm/send', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `key=${FCM_SERVER_KEY}`,
    },
    body: JSON.stringify(message),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`FCM 발송 실패: ${response.status} - ${errorText}`);
  }

  return response.json();
}

// 실패한 토큰 비활성화
async function deactivateFailedTokens(
  supabase: SupabaseClient,
  tokens: DeviceToken[],
  fcmTokens: string[],
  fcmResult: FCMResult
) {
  if (fcmResult.failure === 0 || !Array.isArray(fcmResult.results)) return;

  const failedTokenIds: string[] = [];

  fcmResult.results.forEach((result, index) => {
    if (result.error === 'NotRegistered' || result.error === 'InvalidRegistration') {
      const token = tokens.find((t) => t.device_token === fcmTokens[index]);
      if (token) {
        failedTokenIds.push(token.id);
      }
    }
  });

  if (failedTokenIds.length > 0) {
    await supabase
      .from('user_device_tokens')
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .in('id', failedTokenIds);
  }
}

// 발송 로그 저장
async function saveSendLogs(supabase: SupabaseClient, tokens: DeviceToken[], payload: PushPayload) {
  if (!payload.notification_id) return;

  await Promise.all(
    tokens.map((token) =>
      supabase.from('push_notification_logs').insert({
        notification_id: payload.notification_id,
        user_id: payload.user_id,
        device_token_id: token.id,
        title: payload.title,
        body: payload.body,
        data: payload.data,
        status: 'sent',
        sent_at: new Date().toISOString(),
      })
    )
  );
}

// POST /api/push/send - 푸시 알림 발송 (내부 API / Cron)
export async function POST(request: NextRequest) {
  try {
    // API 키 검증 (내부 호출만 허용)
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (!authHeader || authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: '권한이 없습니다' }, { status: 401 });
    }

    if (!FCM_SERVER_KEY) {
      return NextResponse.json({ error: 'FCM_SERVER_KEY가 설정되지 않았습니다' }, { status: 500 });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
    const body: PushPayload = await request.json();

    if (!body.user_id || !body.title || !body.body) {
      return NextResponse.json({ error: 'user_id, title, body는 필수입니다' }, { status: 400 });
    }

    // 사용자의 활성 디바이스 토큰 조회
    const { data: tokens, error: tokenError } = await supabase
      .from('user_device_tokens')
      .select('id, device_token, platform')
      .eq('user_id', body.user_id)
      .eq('is_active', true)
      .eq('push_enabled', true);

    if (tokenError) throw tokenError;

    if (!tokens || tokens.length === 0) {
      return NextResponse.json({ message: '발송할 디바이스 토큰이 없습니다', sent: 0 });
    }

    // 플랫폼별 토큰 분리
    const fcmTokens = (tokens as DeviceToken[])
      .filter((t) => t.platform === 'android' || t.platform === 'ios')
      .map((t) => t.device_token);

    let totalSuccess = 0;
    let totalFailure = 0;
    const results: unknown[] = [];

    // FCM 발송 (Android + iOS)
    if (fcmTokens.length > 0) {
      try {
        const fcmResult = await sendFCMNotification(fcmTokens, {
          title: body.title,
          body: body.body,
          data: body.data,
          image_url: body.image_url,
        });

        totalSuccess += fcmResult.success;
        totalFailure += fcmResult.failure;
        results.push(fcmResult);

        // 실패한 토큰 비활성화
        await deactivateFailedTokens(supabase, tokens as DeviceToken[], fcmTokens, fcmResult);
      } catch (fcmError) {
        logServerError(fcmError instanceof Error ? fcmError : new Error(String(fcmError)), {
          context: 'fcm_send_error',
          user_id: body.user_id,
        });
        totalFailure += fcmTokens.length;
      }
    }

    // 발송 로그 저장
    await saveSendLogs(supabase, tokens as DeviceToken[], body);

    return NextResponse.json({
      message: '푸시 알림이 발송되었습니다',
      sent: totalSuccess,
      failed: totalFailure,
      results,
    });
  } catch (error) {
    logServerError(error instanceof Error ? error : new Error(String(error)), {
      context: 'push_send_error',
    });
    return NextResponse.json({ error: '서버 오류가 발생했습니다' }, { status: 500 });
  }
}
