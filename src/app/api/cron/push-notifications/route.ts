import { NextRequest, NextResponse } from 'next/server';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { logServerError } from '@/lib/rollbar/server';
import { sendSwing2AppPush, isSwing2AppConfigured } from '@/lib/swing2app/server';

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

interface PushResult {
  success: number;
  failure: number;
  processed: number;
}

// 큐 항목 완료 처리
async function markQueueCompleted(supabase: SupabaseClient, itemId: string) {
  await supabase
    .from('push_notification_queue')
    .update({ status: 'completed', processed_at: new Date().toISOString() })
    .eq('id', itemId);
}

// 큐 항목들을 처리 중 상태로 변경
async function markItemsProcessing(supabase: SupabaseClient, items: QueueItem[]) {
  for (const item of items) {
    await supabase
      .from('push_notification_queue')
      .update({ status: 'processing' })
      .eq('id', item.id);
  }
}

// 푸시 로그 저장 (Swing2App용)
async function savePushLog(
  supabase: SupabaseClient,
  item: QueueItem,
  notification: NotificationData,
  success: boolean
) {
  await supabase.from('push_notification_logs').insert({
    notification_id: item.notification_id,
    user_id: item.user_id,
    device_token_id: null,
    title: notification.title,
    body: notification.message,
    data: { type: notification.type, link: notification.metadata?.link },
    status: success ? 'sent' : 'failed',
    sent_at: new Date().toISOString(),
  });
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

// 단일 푸시 알림 처리
async function processQueueItem(supabase: SupabaseClient, item: QueueItem): Promise<PushResult> {
  await supabase.from('push_notification_queue').update({ status: 'processing' }).eq('id', item.id);

  const notification = item.notifications;

  if (!notification) {
    await markQueueCompleted(supabase, item.id);
    return { success: 0, failure: 0, processed: 1 };
  }

  const result = await sendSwing2AppPush({
    userIds: [item.user_id],
    title: notification.title,
    content: notification.message,
    linkUrl: notification.metadata?.link,
  });

  await savePushLog(supabase, item, notification, result.success);
  await markQueueCompleted(supabase, item.id);

  return {
    success: result.success ? result.userCount || 1 : 0,
    failure: result.success ? 0 : 1,
    processed: 1,
  };
}

// 알림 없는 항목들 완료 처리
async function processEmptyNotifications(
  supabase: SupabaseClient,
  items: QueueItem[]
): Promise<PushResult> {
  for (const item of items) {
    await markQueueCompleted(supabase, item.id);
  }
  return { success: 0, failure: 0, processed: items.length };
}

// 배치 발송 결과 처리
async function processBatchResult(
  supabase: SupabaseClient,
  items: QueueItem[],
  notification: NotificationData,
  sendResult: { success: boolean; userCount?: number }
): Promise<PushResult> {
  for (const item of items) {
    await savePushLog(supabase, item, notification, sendResult.success);
    await markQueueCompleted(supabase, item.id);
  }

  const userCount = items.length;
  return {
    success: sendResult.success ? sendResult.userCount || userCount : 0,
    failure: sendResult.success ? 0 : userCount,
    processed: userCount,
  };
}

// 배치 실패 시 개별 처리
async function processBatchFallback(
  supabase: SupabaseClient,
  items: QueueItem[]
): Promise<PushResult> {
  let success = 0;
  let failure = 0;
  let processed = 0;

  for (const item of items) {
    try {
      const result = await processQueueItem(supabase, item);
      processed += result.processed;
      success += result.success;
      failure += result.failure;
    } catch (itemError) {
      logServerError(itemError instanceof Error ? itemError : new Error(String(itemError)), {
        context: 'push_queue_item_error',
        queue_id: item.id,
      });
      await markQueueRetry(supabase, item, itemError);
    }
  }

  return { success, failure, processed };
}

// 알림 그룹 처리
async function processNotificationGroup(
  supabase: SupabaseClient,
  items: QueueItem[]
): Promise<PushResult> {
  const notification = items[0].notifications;

  if (!notification) {
    return processEmptyNotifications(supabase, items);
  }

  await markItemsProcessing(supabase, items);

  const userIds = items.map((item) => item.user_id);

  try {
    const result = await sendSwing2AppPush({
      userIds,
      title: notification.title,
      content: notification.message,
      linkUrl: notification.metadata?.link,
    });

    return processBatchResult(supabase, items, notification, result);
  } catch (error) {
    logServerError(error instanceof Error ? error : new Error(String(error)), {
      context: 'push_batch_error',
    });
    return processBatchFallback(supabase, items);
  }
}

// 큐 항목들을 알림 ID별로 그룹화
function groupByNotification(queueItems: QueueItem[]): Map<string, QueueItem[]> {
  const itemsByNotification = new Map<string, QueueItem[]>();

  for (const item of queueItems) {
    const key = item.notification_id;
    if (!itemsByNotification.has(key)) {
      itemsByNotification.set(key, []);
    }
    itemsByNotification.get(key)!.push(item);
  }

  return itemsByNotification;
}

// GET /api/cron/push-notifications - 푸시 알림 대기열 처리
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!isSwing2AppConfigured()) {
      return NextResponse.json({
        message: 'Swing2App API not configured, skipping push notifications',
        processed: 0,
      });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

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

    const itemsByNotification = groupByNotification(queueItems as unknown as QueueItem[]);

    let totalProcessed = 0;
    let totalSuccess = 0;
    let totalFailed = 0;

    for (const [, items] of itemsByNotification) {
      const result = await processNotificationGroup(supabase, items);
      totalProcessed += result.processed;
      totalSuccess += result.success;
      totalFailed += result.failure;
    }

    return NextResponse.json({
      message: '푸시 알림 처리 완료',
      processed: totalProcessed,
      success: totalSuccess,
      failed: totalFailed,
    });
  } catch (error) {
    logServerError(error instanceof Error ? error : new Error(String(error)), {
      context: 'push_cron_error',
    });
    return NextResponse.json({ error: '서버 오류가 발생했습니다' }, { status: 500 });
  }
}
