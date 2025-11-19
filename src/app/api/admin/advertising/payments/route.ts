import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createServiceRoleClient } from '@/lib/supabase/singleton'
import { checkAdminAuth } from '@/lib/admin/auth'

// GET - 무통장 입금 목록 조회 (필터, 검색, 통계 포함)
// Updated: FK constraint fix applied
export async function GET(request: NextRequest) {
  try {
    const adminCheck = await checkAdminAuth()
    if (!adminCheck.isAdmin) {
      return NextResponse.json(
        { error: adminCheck.error },
        { status: adminCheck.error === 'Unauthorized' ? 401 : 403 }
      )
    }

    const supabase = createServiceRoleClient()
    const { searchParams } = new URL(request.url)

    // 필터 파라미터
    const status = searchParams.get('status')
    const search = searchParams.get('search')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const minAmount = searchParams.get('minAmount')
    const maxAmount = searchParams.get('maxAmount')
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '20')

    // 기본 쿼리 - seller 정보는 별도로 조회
    let query = supabase
      .from('advertising_payments')
      .select(`
        *,
        subscription:advertising_subscriptions(
          id,
          service:services(title)
        )
      `, { count: 'exact' })
      .eq('payment_method', 'bank_transfer')

    // 필터 적용
    if (status && status !== 'all') {
      query = query.eq('status', status)
    }

    if (startDate) {
      query = query.gte('created_at', startDate)
    }

    if (endDate) {
      query = query.lte('created_at', endDate)
    }

    if (minAmount) {
      query = query.gte('amount', parseInt(minAmount))
    }

    if (maxAmount) {
      query = query.lte('amount', parseInt(maxAmount))
    }

    // 정렬 및 페이지네이션
    const from = (page - 1) * pageSize
    const to = from + pageSize - 1

    query = query
      .order('created_at', { ascending: false })
      .range(from, to)

    const { data: payments, error: paymentsError, count } = await query

    if (paymentsError) throw paymentsError

    // Seller 및 user 정보를 별도로 조회하여 추가
    const paymentsWithSellers = await Promise.all((payments || []).map(async (payment) => {
      const { data: seller } = await supabase
        .from('sellers')
        .select('id, user_id')
        .eq('id', payment.seller_id)
        .single();

      if (seller) {
        const { data: user } = await supabase
          .from('users')
          .select('email, name')
          .eq('id', seller.user_id)
          .single();

        return {
          ...payment,
          seller: {
            ...seller,
            user: user || null
          }
        };
      }

      return payment;
    }));

    // Admin 정보도 별도로 조회
    const paymentsWithAdmins = await Promise.all(paymentsWithSellers.map(async (payment) => {
      if (payment.confirmed_by) {
        const { data: admin } = await supabase
          .from('admins')
          .select('id, user_id')
          .eq('id', payment.confirmed_by)
          .single();

        if (admin) {
          const { data: user } = await supabase
            .from('users')
            .select('name')
            .eq('id', admin.user_id)
            .single();

          return {
            ...payment,
            confirmed_by_admin: {
              id: admin.id,
              user: user || null
            }
          };
        }
      }

      return payment;
    }));

    // 검색어 필터링 (클라이언트 사이드에서 처리)
    let filteredPayments = paymentsWithAdmins || []
    if (search) {
      const searchLower = search.toLowerCase()
      filteredPayments = filteredPayments.filter(p => {
        const sellerName = p.seller?.user?.name?.toLowerCase() || ''
        const sellerEmail = p.seller?.user?.email?.toLowerCase() || ''
        const depositorName = p.depositor_name?.toLowerCase() || ''
        const serviceTitle = p.subscription?.service?.title?.toLowerCase() || ''

        return sellerName.includes(searchLower) ||
               sellerEmail.includes(searchLower) ||
               depositorName.includes(searchLower) ||
               serviceTitle.includes(searchLower)
      })
    }

    // 통계 계산
    const { data: allPayments } = await supabase
      .from('advertising_payments')
      .select('status, amount')
      .eq('payment_method', 'bank_transfer')

    const stats = {
      pending: {
        count: allPayments?.filter(p => p.status === 'pending').length || 0,
        total: allPayments?.filter(p => p.status === 'pending').reduce((sum, p) => sum + p.amount, 0) || 0
      },
      confirmed: {
        count: allPayments?.filter(p => p.status === 'confirmed').length || 0,
        total: allPayments?.filter(p => p.status === 'confirmed').reduce((sum, p) => sum + p.amount, 0) || 0
      },
      completed: {
        count: allPayments?.filter(p => p.status === 'completed').length || 0,
        total: allPayments?.filter(p => p.status === 'completed').reduce((sum, p) => sum + p.amount, 0) || 0
      },
      cancelled: {
        count: allPayments?.filter(p => p.status === 'cancelled').length || 0,
        total: allPayments?.filter(p => p.status === 'cancelled').reduce((sum, p) => sum + p.amount, 0) || 0
      },
      all: {
        count: allPayments?.length || 0,
        total: allPayments?.reduce((sum, p) => sum + p.amount, 0) || 0
      }
    }

    return NextResponse.json({
      payments: filteredPayments,
      stats,
      pagination: {
        page,
        pageSize,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / pageSize)
      }
    })
  } catch (error) {
    console.error('Failed to fetch payments:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2))
    return NextResponse.json(
      { error: 'Failed to fetch payments' },
      { status: 500 }
    )
  }
}

// Helper functions for PATCH handler
function buildPaymentUpdateData(status: string | undefined, adminMemo: string | undefined, adminId: string) {
  const updateData: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  if (status) {
    updateData.status = status;

    if (status === 'confirmed' || status === 'completed') {
      updateData.confirmed_at = new Date().toISOString();
      updateData.confirmed_by = adminId;
    }
  }

  if (adminMemo !== undefined) {
    updateData.admin_memo = adminMemo;
  }

  return updateData;
}

function buildSubscriptionUpdateData(status: string) {
  const subscriptionUpdateData: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  if (status === 'confirmed' || status === 'completed') {
    subscriptionUpdateData.status = 'active';
  } else if (status === 'cancelled') {
    subscriptionUpdateData.status = 'cancelled';
    subscriptionUpdateData.cancelled_at = new Date().toISOString();
  }

  return subscriptionUpdateData;
}

async function updateRelatedSubscriptions(
  supabase: ReturnType<typeof createServiceRoleClient>,
  updatedPayments: Array<{ subscription_id: string }>,
  status: string
) {
  const subscriptionIds = updatedPayments
    .map(p => p.subscription_id)
    .filter(Boolean);

  if (subscriptionIds.length === 0) {
    return;
  }

  const subscriptionUpdateData = buildSubscriptionUpdateData(status);

  const { error: subError } = await supabase
    .from('advertising_subscriptions')
    .update(subscriptionUpdateData)
    .in('id', subscriptionIds);

  if (subError) {
    console.error('Failed to update subscription status:', subError);
    // 구독 업데이트 실패해도 결제 업데이트는 성공했으므로 에러를 던지지 않음
  }
}

async function getAdminId(supabase: ReturnType<typeof createServiceRoleClient>) {
  const sessionSupabase = await createClient();
  const { data: { user } } = await sessionSupabase.auth.getUser();

  if (!user) {
    throw new Error('Unauthorized');
  }

  const { data: admin } = await supabase
    .from('admins')
    .select('id')
    .eq('user_id', user.id)
    .single();

  if (!admin) {
    throw new Error('Admin not found');
  }

  return admin.id;
}

// PATCH - 무통장 입금 상태 업데이트 (단일 또는 일괄)
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
    const { paymentIds, status, adminMemo } = body;

    if (!paymentIds || !Array.isArray(paymentIds) || paymentIds.length === 0) {
      return NextResponse.json(
        { error: 'Payment IDs are required' },
        { status: 400 }
      );
    }

    const adminId = await getAdminId(supabase);
    const updateData = buildPaymentUpdateData(status, adminMemo, adminId);

    const { data: updatedPayments, error } = await supabase
      .from('advertising_payments')
      .update(updateData)
      .in('id', paymentIds)
      .select('*, subscription_id');

    if (error) throw error;

    // 결제 상태 변경 시 연결된 구독 상태도 업데이트
    if (status && updatedPayments && updatedPayments.length > 0) {
      await updateRelatedSubscriptions(supabase, updatedPayments, status);
    }

    return NextResponse.json({
      success: true,
      updatedCount: updatedPayments?.length || 0
    });
  } catch (error) {
    console.error('Failed to update payments:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2));

    const errorMessage = error instanceof Error ? error.message : 'Failed to update payments';
    const statusCode = errorMessage === 'Unauthorized' ? 401 : errorMessage === 'Admin not found' ? 403 : 500;

    return NextResponse.json(
      { error: errorMessage },
      { status: statusCode }
    );
  }
}
