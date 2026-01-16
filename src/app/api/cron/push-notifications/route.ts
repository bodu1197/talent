import { NextRequest, NextResponse } from 'next/server';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { logServerError } from '@/lib/rollbar/server';

const FCM_SERVER_KEY = process.env.FCM_SERVER_KEY;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

interface QueueItem {
  id: string;
  notification_id: string;
  user_id: string;
  retry_count: number;
  notifications: NotificationData | null;
}

interface NotificationData {
  type: string;
  title: string;
  message: string;
  metadata?: { link?: string };
}

interface DeviceToken {
  id: string;
  device_token: string;
  platform: string;
}

interface FCMResult {
  success: number;
  failure: number;
}

// FCM 발송 함수
async function sendFCM(
  tokens: string[],
  title: string,
  body: string,
  data?: Record<string, unknown>
): Promise<FCMResult> {
  if (!FCM_SERVER_KEY || tokens.length === 0) return { success: 0, failure: 0 };

  const response = await fetch('https://fcm.googleapis.com/fcm/send', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `key=${FCM_SERVER_KEY}`,
    },
    body: JSON.stringify({
      registration_ids: tokens,
      notification: { title, body, sound: 'default' },
      data: { ...data, title, body },
      priority: 'high',
    }),
  });

  if (!response.ok) {
    throw new Error(`FCM error: ${response.status}`);
  }

  return response.json();
}

// 큐 항목 완료 처리
async function markQueueCompleted(supabase: SupabaseClient, itemId: string) {
  await supabase
    .from('push_notification_queue')
    .update({ status: 'completed', processed_at: new Date().toISOString() })
    .eq('id', itemId);
}

// 푸시 로그 저장
async function savePushLogs(
  supabase: SupabaseClient,
  tokens: DeviceToken[],
  item: QueueItem,
  notification: NotificationData
) {
  await Promise.all(
    tokens.map((token) =>
      supabase.from('push_notification_logs').insert({
        notification_id: item.notification_id,
        user_id: item.user_id,
        device_token_id: token.id,
        title: notification.title,
        body: notification.message,
        data: { type: notification.type, link: notification.metadata?.link },
        status: 'sent',
        sent_at: new Date().toISOString(),
      })
    )
  );
}

// 단일 푸시 알림 처리
async function processQueueItem(supabase: SupabaseClient, item: QueueItem): Promise<FCMResult> {
  // 처리 중 상태로 변경
  await supabase.from('push_notification_queue').update({ status: 'processing' }).eq('id', item.id);

  const notification = item.notifications;

  // 알림이 삭제된 경우 큐에서 제거
  if (!notification) {
    await markQueueCompleted(supabase, item.id);
    return { success: 0, failure: 0 };
  }

  // 사용자의 활성 디바이스 토큰 조회
  const { data: tokens } = await supabase
    .from('user_device_tokens')
    .select('id, device_token, platform')
    .eq('user_id', item.user_id)
    .eq('is_active', true)
    .eq('push_enabled', true);

  if (!tokens || tokens.length === 0) {
    await markQueueCompleted(supabase, item.id);
    return { success: 0, failure: 0 };
  }

  const deviceTokens = (tokens as DeviceToken[]).map((t) => t.device_token);

  // FCM 발송
  const fcmResult = await sendFCM(deviceTokens, notification.title, notification.message, {
    notification_id: item.notification_id,
    type: notification.type,
    link: notification.metadata?.link,
  });

  // 로그 저장
  await savePushLogs(supabase, tokens as DeviceToken[], item, notification);

  // 완료 처리
  await markQueueCompleted(supabase, item.id);

  return fcmResult;
}

// 실패한 큐 항목 재시도 마크
async function markQueueRetry(supabase: SupabaseClient, item: QueueItem, error: unknown) {
  await supabase
    .from('push_notification_queue')
    .update({
      status: 'pending',
      retry_count: item.retry_count + 1,
      last_error: error instanceof Error ? error.message : String(error),
    })
    .eq('id', item.id);
}

// GET /api/cron/push-notifications - 푸시 알림 대기열 처리
export async function GET(request: NextRequest) {
  try {
    // Vercel Cron 인증
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!FCM_SERVER_KEY) {
      return NextResponse.json({
        message: 'FCM_SERVER_KEY not configured, skipping push notifications',
        processed: 0,
      });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    // 대기 중인 푸시 알림 조회 (최대 100개씩)
    const { data: queueItems, error: queueError } = await supabase
      .from('push_notification_queue')
      .select(
        `id, notification_id, user_id, retry_count, notifications (type, title, message, metadata)`
      )
      .eq('status', 'pending')
      .lt('retry_count', 3)
      .order('created_at', { ascending: true })
      .limit(100);

    if (queueError) throw queueError;

    if (!queueItems || queueItems.length === 0) {
      return NextResponse.json({ message: '처리할 푸시 알림이 없습니다', processed: 0 });
    }

    let processed = 0;
    let success = 0;
    let failed = 0;

    for (const item of queueItems as QueueItem[]) {
      try {
        const result = await processQueueItem(supabase, item);
        processed++;
        success += result.success;
        failed += result.failure;
      } catch (itemError) {
        logServerError(itemError instanceof Error ? itemError : new Error(String(itemError)), {
          context: 'push_queue_item_error',
          queue_id: item.id,
        });
        await markQueueRetry(supabase, item, itemError);
      }
    }

    return NextResponse.json({ message: '푸시 알림 처리 완료', processed, success, failed });
  } catch (error) {
    logServerError(error instanceof Error ? error : new Error(String(error)), {
      context: 'push_cron_error',
    });
    return NextResponse.json({ error: '서버 오류가 발생했습니다' }, { status: 500 });
  }
}
