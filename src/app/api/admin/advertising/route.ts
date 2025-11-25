import { NextRequest, NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase/singleton';
import { checkAdminAuth } from '@/lib/admin/auth';
import { logger } from '@/lib/logger';

// GET - 광고 구독 목록 조회
export async function GET(request: NextRequest) {
  try {
    const adminCheck = await checkAdminAuth();
    if (!adminCheck.isAdmin) {
      return NextResponse.json(
        { error: adminCheck.error },
        { status: adminCheck.error === 'Unauthorized' ? 401 : 403 }
      );
    }

    const supabase = createServiceRoleClient();
    const { searchParams } = new URL(request.url);

    const status = searchParams.get('status');
    const paymentMethod = searchParams.get('paymentMethod');
    const sortBy = searchParams.get('sortBy') || 'created_at';
    const sortOrder = searchParams.get('sortOrder') === 'asc';

    // 광고 구독 목록 조회 - seller 정보는 별도로 조회
    let query = supabase.from('advertising_subscriptions').select(`
        *,
        service:services!advertising_subscriptions_service_id_fkey(title)
      `);

    // 필터 적용
    if (status) {
      query = query.eq('status', status);
    }
    if (paymentMethod) {
      query = query.eq('payment_method', paymentMethod);
    }

    // 정렬
    query = query.order(sortBy, { ascending: sortOrder });

    const { data: subscriptions, error: subsError } = await query;

    if (subsError) throw subsError;

    if (!subscriptions || subscriptions.length === 0) {
      return NextResponse.json({
        subscriptions: [],
        summary: {
          totalSubscriptions: 0,
          activeSubscriptions: 0,
          pendingPayments: 0,
          cancelledSubscriptions: 0,
          totalRevenue: 0,
          monthlyRevenue: 0,
        },
      });
    }

    // Seller 및 user 정보를 효율적으로 조회
    const sellerIds = [...new Set(subscriptions.map((sub) => sub.seller_id))];

    // seller 정보 조회 (seller_profiles 뷰)
    const { data: sellers } = await supabase
      .from('seller_profiles')
      .select('id, user_id, display_name, business_name, profile_image')
      .in('id', sellerIds);

    // seller의 email과 name 정보 조회 (users 테이블)
    const sellerUserIds = sellers?.map((s) => s.user_id) || [];
    const { data: sellerUsers } = await supabase
      .from('users')
      .select('id, email')
      .in('id', sellerUserIds);

    // seller의 name 정보 조회 (profiles 테이블)
    const { data: sellerProfiles } = await supabase
      .from('profiles')
      .select('user_id, name')
      .in('user_id', sellerUserIds);

    // seller 맵 생성
    const sellerMap = new Map(
      sellers?.map((s) => {
        const user = sellerUsers?.find((u) => u.id === s.user_id);
        const profile = sellerProfiles?.find((p) => p.user_id === s.user_id);
        return [
          s.id,
          {
            id: s.id,
            user_id: s.user_id,
            user:
              user || profile
                ? {
                    email: user?.email || '이메일 없음',
                    name: profile?.name || '이름 없음',
                  }
                : null,
          },
        ];
      }) || []
    );

    // Seller 정보를 subscription에 추가
    const subscriptionsWithSellers = subscriptions.map((sub) => ({
      ...sub,
      seller: sellerMap.get(sub.seller_id) || null,
    }));

    // 통계 계산
    const { data: stats } = await supabase
      .from('advertising_subscriptions')
      .select('status, payment_method, monthly_price, total_paid');

    const summary = {
      totalSubscriptions: stats?.length || 0,
      activeSubscriptions: stats?.filter((s) => s.status === 'active').length || 0,
      pendingPayments: stats?.filter((s) => s.status === 'pending_payment').length || 0,
      cancelledSubscriptions: stats?.filter((s) => s.status === 'cancelled').length || 0,
      totalRevenue: stats?.reduce((sum, s) => sum + (s.total_paid || 0), 0) || 0,
      monthlyRevenue:
        stats?.filter((s) => s.status === 'active').reduce((sum, s) => sum + s.monthly_price, 0) ||
        0,
    };

    return NextResponse.json({
      subscriptions: subscriptionsWithSellers,
      summary,
    });
  } catch (error) {
    logger.error('Failed to fetch advertising subscriptions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch advertising subscriptions' },
      { status: 500 }
    );
  }
}

// PATCH - 광고 상태 업데이트
export async function PATCH(request: NextRequest) {
  try {
    const adminCheck = await checkAdminAuth();
    if (!adminCheck.isAdmin) {
      return NextResponse.json(
        { error: adminCheck.error },
        { status: adminCheck.error === 'Unauthorized' ? 401 : 403 }
      );
    }

    const supabase = createServiceRoleClient();
    const body = await request.json();
    const { subscriptionId, status } = body;

    if (!subscriptionId) {
      return NextResponse.json({ error: 'Subscription ID is required' }, { status: 400 });
    }

    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (status) {
      updateData.status = status;

      if (status === 'cancelled') {
        updateData.cancelled_at = new Date().toISOString();
      } else if (status === 'active') {
        updateData.cancelled_at = null;
      }
    }

    const { data: subscription, error } = await supabase
      .from('advertising_subscriptions')
      .update(updateData)
      .eq('id', subscriptionId)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ subscription });
  } catch (error) {
    logger.error('Failed to update subscription:', error);
    return NextResponse.json({ error: 'Failed to update subscription' }, { status: 500 });
  }
}

// DELETE - 광고 구독 삭제
export async function DELETE(request: NextRequest) {
  try {
    const adminCheck = await checkAdminAuth();
    if (!adminCheck.isAdmin) {
      return NextResponse.json(
        { error: adminCheck.error },
        { status: adminCheck.error === 'Unauthorized' ? 401 : 403 }
      );
    }

    const supabase = createServiceRoleClient();
    const { searchParams } = new URL(request.url);
    const subscriptionId = searchParams.get('id');

    if (!subscriptionId) {
      return NextResponse.json({ error: 'Subscription ID is required' }, { status: 400 });
    }

    // 취소 상태로 변경 (실제 삭제하지 않음)
    const { error } = await supabase
      .from('advertising_subscriptions')
      .update({
        status: 'cancelled',
        cancelled_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', subscriptionId);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('Failed to cancel subscription:', error);
    return NextResponse.json({ error: 'Failed to cancel subscription' }, { status: 500 });
  }
}
