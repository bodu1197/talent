import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createClient as createServerClient } from '@/lib/supabase/server';
import { logger } from '@/lib/logger';

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

    // 판매자 확인
    const { data: seller } = await supabase
      .from('sellers')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (!seller) {
      return NextResponse.json({ error: '판매자 권한이 필요합니다.' }, { status: 403 });
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
    const { data: activeOrders } = await supabaseAdmin
      .from('orders')
      .select('id, status')
      .eq('service_id', serviceId)
      .in('status', ['pending_payment', 'paid', 'in_progress', 'delivered']);

    if (activeOrders && activeOrders.length > 0) {
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
      const summaryText = Object.entries(summary)
        .map(([s, c]) => `${s}: ${c}건`)
        .join(', ');

      return NextResponse.json(
        { error: `진행 중인 주문이 있어 삭제할 수 없습니다. (${summaryText})` },
        { status: 400 }
      );
    }

    // 관련 데이터 삭제 (외래 키 제약 조건 순서대로)

    // 1. 광고 관련 데이터 삭제
    const { data: subscriptions } = await supabaseAdmin
      .from('advertising_subscriptions')
      .select('id')
      .eq('service_id', serviceId);

    if (subscriptions && subscriptions.length > 0) {
      const subscriptionIds = subscriptions.map((s) => s.id);
      await supabaseAdmin.from('tax_invoices').delete().in('subscription_id', subscriptionIds);
      await supabaseAdmin
        .from('advertising_payments')
        .delete()
        .in('subscription_id', subscriptionIds);
      await supabaseAdmin
        .from('advertising_impressions')
        .delete()
        .in('subscription_id', subscriptionIds);
    }
    await supabaseAdmin.from('advertising_subscriptions').delete().eq('service_id', serviceId);

    // 2. 나머지 관련 데이터 삭제
    await supabaseAdmin.from('service_categories').delete().eq('service_id', serviceId);
    await supabaseAdmin.from('service_tags').delete().eq('service_id', serviceId);
    await supabaseAdmin.from('service_packages').delete().eq('service_id', serviceId);
    await supabaseAdmin.from('favorites').delete().eq('service_id', serviceId);
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

    // 3. 서비스 삭제
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
