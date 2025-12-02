import { NextRequest, NextResponse } from 'next/server';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { logger } from '@/lib/logger';
import { notifyOrderConfirmed } from '@/lib/notifications';

// Vercel Cron에서 호출되는 자동 구매확정 API
// 서비스 배송 후 3일이 지난 주문을 자동으로 구매확정 처리

interface Order {
  id: string;
  seller_id: string;
  amount: number;
  title: string;
}

interface ProcessResult {
  orderId: string;
  success: boolean;
  error?: string;
}

// 단일 주문 자동 구매확정 처리
async function processAutoConfirm(
  supabase: SupabaseClient,
  order: Order,
  now: string
): Promise<ProcessResult> {
  // 주문 상태 업데이트
  const { error: updateError } = await supabase
    .from('orders')
    .update({ status: 'completed', completed_at: now, updated_at: now })
    .eq('id', order.id)
    .eq('status', 'delivered');

  if (updateError) {
    return { orderId: order.id, success: false, error: updateError.message };
  }

  // 정산 상태 업데이트 (pending → confirmed)
  const { error: settlementError } = await supabase
    .from('order_settlements')
    .update({ status: 'confirmed', confirmed_at: now })
    .eq('order_id', order.id)
    .eq('status', 'pending');

  if (settlementError) {
    logger.error(`Settlement update error for order ${order.id}:`, settlementError);
  }

  // 전문가에게 자동 구매확정 알림
  await notifyOrderConfirmed(order.seller_id, order.id, order.amount, true);

  return { orderId: order.id, success: true };
}

export async function GET(request: NextRequest) {
  // Cron 시크릿 검증
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    logger.error('Supabase credentials not configured');
    return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  const now = new Date().toISOString();

  // 자동 구매확정 대상 조회 (delivered 상태 + 3일 경과)
  const { data: orders, error: fetchError } = await supabase
    .from('orders')
    .select('id, seller_id, amount, title')
    .eq('status', 'delivered')
    .not('auto_confirm_at', 'is', null)
    .lte('auto_confirm_at', now)
    .limit(100);

  if (fetchError) {
    logger.error('Auto-confirm fetch error:', fetchError);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }

  if (!orders || orders.length === 0) {
    return NextResponse.json({
      success: true,
      message: '자동 구매확정 대상이 없습니다',
      processed: 0,
    });
  }

  // 각 주문 처리
  const results = await Promise.all(
    orders.map((order) => processAutoConfirm(supabase, order, now))
  );

  const successCount = results.filter((r) => r.success).length;
  const failCount = results.filter((r) => !r.success).length;

  logger.info(`Auto-confirm completed: ${successCount} success, ${failCount} failed`);

  return NextResponse.json({
    success: true,
    message: `자동 구매확정: 성공 ${successCount}건, 실패 ${failCount}건`,
    processed: successCount,
    failed: failCount,
  });
}

export const dynamic = 'force-dynamic';
export const maxDuration = 60;
