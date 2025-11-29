import { NextRequest, NextResponse } from 'next/server';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { createClient as createServerClient } from '@/lib/supabase/server';
import { logger } from '@/lib/logger';

// 관리자 권한 확인
async function checkAdminAuth() {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  // admins 테이블에서 관리자 확인
  const { data: admin } = await supabase
    .from('admins')
    .select('role')
    .eq('user_id', user.id)
    .single();

  if (!admin || admin.role !== 'super_admin') {
    return null;
  }

  return user;
}

// 주문 관련 데이터 삭제
async function deleteOrderRelatedData(supabase: SupabaseClient, orderIds: string[]) {
  await supabase.from('order_requirements').delete().in('order_id', orderIds);
  await supabase.from('order_deliveries').delete().in('order_id', orderIds);
  await supabase.from('order_revisions').delete().in('order_id', orderIds);
}

// 서비스 관련 데이터 삭제
async function deleteServiceRelatedData(supabase: SupabaseClient, serviceIds: string[]) {
  await supabase.from('service_categories').delete().in('service_id', serviceIds);
  await supabase.from('service_images').delete().in('service_id', serviceIds);
  await supabase.from('service_options').delete().in('service_id', serviceIds);
  await supabase.from('service_faqs').delete().in('service_id', serviceIds);

  const { data: revisions } = await supabase
    .from('service_revisions')
    .select('id')
    .in('service_id', serviceIds);

  if (revisions && revisions.length > 0) {
    const revisionIds = revisions.map((r) => r.id);
    await supabase.from('service_revision_categories').delete().in('revision_id', revisionIds);
  }

  await supabase.from('service_revisions').delete().in('service_id', serviceIds);
  await supabase.from('favorites').delete().in('service_id', serviceIds);
}

// 판매자 관련 데이터 삭제
async function deleteSellerData(supabase: SupabaseClient, userId: string, sellerId: string) {
  // 판매자의 주문 관련 데이터 삭제
  const { data: sellerOrders } = await supabase.from('orders').select('id').eq('seller_id', userId);

  if (sellerOrders && sellerOrders.length > 0) {
    await deleteOrderRelatedData(
      supabase,
      sellerOrders.map((o) => o.id)
    );
  }

  await supabase.from('orders').delete().eq('seller_id', userId);
  await supabase.from('reviews').delete().eq('seller_id', userId);

  // 서비스 관련 데이터 삭제
  const { data: services } = await supabase.from('services').select('id').eq('seller_id', sellerId);

  if (services && services.length > 0) {
    await deleteServiceRelatedData(
      supabase,
      services.map((s) => s.id)
    );
  }

  await supabase.from('services').delete().eq('seller_id', sellerId);
  await supabase.from('settlements').delete().eq('seller_id', sellerId);
  await supabase.from('withdrawal_requests').delete().eq('seller_id', sellerId);
  await supabase.from('advertising_payments').delete().eq('seller_id', sellerId);
  await supabase.from('advertising_credits').delete().eq('seller_id', sellerId);
  await supabase.from('sellers').delete().eq('user_id', userId);
}

// 사용자 기본 데이터 삭제
async function deleteUserBasicData(supabase: SupabaseClient, userId: string) {
  await supabase.from('notifications').delete().eq('user_id', userId);
  await supabase.from('inquiries').delete().eq('user_id', userId);
  await supabase.from('reviews').delete().eq('buyer_id', userId);
  await supabase.from('chat_messages').delete().eq('sender_id', userId);
  await supabase.from('chat_rooms').delete().eq('buyer_id', userId);
  await supabase.from('chat_rooms').delete().eq('seller_id', userId);

  const { data: buyerOrders } = await supabase.from('orders').select('id').eq('buyer_id', userId);

  if (buyerOrders && buyerOrders.length > 0) {
    await deleteOrderRelatedData(
      supabase,
      buyerOrders.map((o) => o.id)
    );
  }

  await supabase.from('orders').delete().eq('buyer_id', userId);
}

// DELETE: 회원 및 관련 데이터 전체 삭제
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;

    const admin = await checkAdminAuth();
    if (!admin) {
      return NextResponse.json({ error: '관리자 권한이 필요합니다.' }, { status: 403 });
    }

    if (admin.id === userId) {
      return NextResponse.json({ error: '자기 자신은 삭제할 수 없습니다.' }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({ error: '서버 설정 오류' }, { status: 500 });
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // 사용자 기본 데이터 삭제
    await deleteUserBasicData(supabaseAdmin, userId);

    // 판매자인 경우 관련 데이터 삭제
    const { data: seller } = await supabaseAdmin
      .from('sellers')
      .select('id')
      .eq('user_id', userId)
      .single();

    if (seller) {
      await deleteSellerData(supabaseAdmin, userId, seller.id);
    }

    // 나머지 데이터 삭제
    await supabaseAdmin.from('favorites').delete().eq('user_id', userId);
    await supabaseAdmin.from('reports').delete().eq('reporter_id', userId);
    await supabaseAdmin.from('admins').delete().eq('user_id', userId);
    await supabaseAdmin.from('profiles').delete().eq('user_id', userId);

    // auth.users에서 사용자 삭제
    const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(userId);

    if (authError) {
      logger.error('사용자 인증 삭제 실패:', { error: authError.message });
      return NextResponse.json(
        { error: '사용자 삭제에 실패했습니다: ' + authError.message },
        { status: 500 }
      );
    }

    logger.warn('사용자 삭제 완료:', { userId, deletedBy: admin.id });

    return NextResponse.json({ success: true, message: '사용자가 삭제되었습니다.' });
  } catch (error) {
    logger.error('사용자 삭제 오류:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}
