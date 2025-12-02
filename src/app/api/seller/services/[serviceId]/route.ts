import { NextRequest, NextResponse } from 'next/server';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { createClient as createServerClient } from '@/lib/supabase/server';
import { logger } from '@/lib/logger';

// 광고 관련 데이터 삭제
async function deleteAdvertisingData(supabaseAdmin: SupabaseClient, serviceId: string) {
  const { data: subscriptions } = await supabaseAdmin
    .from('advertising_subscriptions')
    .select('id')
    .eq('service_id', serviceId);

  if (!subscriptions || subscriptions.length === 0) {
    return { success: true };
  }

  const subscriptionIds = subscriptions.map((s) => s.id);
  logger.info('삭제할 subscription IDs:', { subscriptionIds });

  // payment IDs 조회
  const { data: payments } = await supabaseAdmin
    .from('advertising_payments')
    .select('id')
    .in('subscription_id', subscriptionIds);

  const paymentIds = payments?.map((p) => p.id) || [];

  // tax_invoices 삭제 (payment_id로)
  if (paymentIds.length > 0) {
    await supabaseAdmin.from('tax_invoices').delete().in('payment_id', paymentIds);
  }

  // tax_invoices 삭제 (subscription_id로)
  const { error: taxError } = await supabaseAdmin
    .from('tax_invoices')
    .delete()
    .in('subscription_id', subscriptionIds);
  if (taxError) {
    return { success: false, error: 'tax_invoices 삭제 실패: ' + taxError.message };
  }

  // advertising_payments 삭제
  const { error: payError } = await supabaseAdmin
    .from('advertising_payments')
    .delete()
    .in('subscription_id', subscriptionIds);
  if (payError) {
    return { success: false, error: 'advertising_payments 삭제 실패: ' + payError.message };
  }

  // advertising_impressions 삭제
  await supabaseAdmin
    .from('advertising_impressions')
    .delete()
    .in('subscription_id', subscriptionIds);

  // advertising_subscriptions 삭제
  const { error: subError } = await supabaseAdmin
    .from('advertising_subscriptions')
    .delete()
    .eq('service_id', serviceId);
  if (subError) {
    return { success: false, error: 'advertising_subscriptions 삭제 실패: ' + subError.message };
  }

  return { success: true };
}

// 기타 관련 데이터 삭제
async function deleteRelatedData(supabaseAdmin: SupabaseClient, serviceId: string) {
  await supabaseAdmin.from('service_categories').delete().eq('service_id', serviceId);
  await supabaseAdmin.from('service_tags').delete().eq('service_id', serviceId);
  await supabaseAdmin.from('service_packages').delete().eq('service_id', serviceId);
  await supabaseAdmin.from('service_favorites').delete().eq('service_id', serviceId);
  await supabaseAdmin.from('reviews').delete().eq('service_id', serviceId);
  await supabaseAdmin.from('premium_placements').delete().eq('service_id', serviceId);

  // NULL로 설정
  await supabaseAdmin
    .from('search_logs')
    .update({ converted_service_id: null })
    .eq('converted_service_id', serviceId);
  await supabaseAdmin
    .from('reports')
    .update({ reported_service_id: null })
    .eq('reported_service_id', serviceId);
}

// 진행 중인 주문 확인
async function checkActiveOrders(supabaseAdmin: SupabaseClient, serviceId: string) {
  const { data: activeOrders } = await supabaseAdmin
    .from('orders')
    .select('id, status')
    .eq('service_id', serviceId)
    .in('status', ['pending_payment', 'paid', 'in_progress', 'delivered']);

  if (!activeOrders || activeOrders.length === 0) {
    return null;
  }

  const statusLabels: Record<string, string> = {
    pending_payment: '결제 대기',
    paid: '결제 완료',
    in_progress: '진행 중',
    delivered: '납품 완료(검수 중)',
  };

  const summary = activeOrders.reduce(
    (acc, o) => {
      const label = statusLabels[o.status] || o.status;
      acc[label] = (acc[label] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  return Object.entries(summary)
    .map(([s, c]) => `${s}: ${c}건`)
    .join(', ');
}

// DELETE: 서비스 및 관련 데이터 전체 삭제
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ serviceId: string }> }
) {
  try {
    const { serviceId } = await params;

    // 로그인한 사용자 확인
    const supabase = await createServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
    }

    // 전문가 확인
    const { data: seller } = await supabase
      .from('sellers')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (!seller) {
      return NextResponse.json({ error: '전문가 권한이 필요합니다.' }, { status: 403 });
    }

    // 서비스 소유자 확인
    const { data: service } = await supabase
      .from('services')
      .select('id, title, seller_id')
      .eq('id', serviceId)
      .single();

    if (!service || service.seller_id !== seller.id) {
      return NextResponse.json(
        { error: '서비스를 찾을 수 없거나 권한이 없습니다.' },
        { status: 404 }
      );
    }

    // Service Role 키로 Admin 클라이언트 생성
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({ error: '서버 설정 오류' }, { status: 500 });
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // 진행 중인 주문 확인
    const activeOrdersSummary = await checkActiveOrders(supabaseAdmin, serviceId);
    if (activeOrdersSummary) {
      return NextResponse.json(
        { error: `진행 중인 주문이 있어 삭제할 수 없습니다. (${activeOrdersSummary})` },
        { status: 400 }
      );
    }

    // 광고 관련 데이터 삭제
    const adResult = await deleteAdvertisingData(supabaseAdmin, serviceId);
    if (!adResult.success) {
      logger.error('광고 데이터 삭제 실패:', adResult.error);
      return NextResponse.json({ error: adResult.error }, { status: 500 });
    }

    // 기타 관련 데이터 삭제
    await deleteRelatedData(supabaseAdmin, serviceId);

    // 서비스 삭제
    const { error: deleteError } = await supabaseAdmin
      .from('services')
      .delete()
      .eq('id', serviceId);

    if (deleteError) {
      logger.error('서비스 삭제 실패:', deleteError);
      return NextResponse.json(
        { error: '서비스 삭제에 실패했습니다: ' + deleteError.message },
        { status: 500 }
      );
    }

    logger.info('서비스 삭제 완료:', { serviceId, title: service.title, deletedBy: user.id });

    return NextResponse.json({ success: true, message: '서비스가 삭제되었습니다.' });
  } catch (error) {
    logger.error('서비스 삭제 오류:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}
