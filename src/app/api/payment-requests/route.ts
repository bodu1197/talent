import { NextRequest, NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase/server';
import { logger } from '@/lib/logger';
import { requireAuth } from '@/lib/api/auth';

export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth();
    if (!authResult.success) {
      return authResult.error!;
    }

    const { user, supabase } = authResult;
    if (!user || !supabase) {
      return NextResponse.json({ error: 'Authentication failed' }, { status: 401 });
    }

    const body = await request.json();
    const { room_id, service_id, title, amount, description, delivery_days, revision_count } = body;

    // 필수 필드 검증
    if (!room_id || !title || !amount) {
      return NextResponse.json({ error: '필수 필드가 누락되었습니다' }, { status: 400 });
    }

    if (amount < 1000) {
      return NextResponse.json({ error: '최소 결제 금액은 1,000원입니다' }, { status: 400 });
    }

    // 채팅방 정보 조회
    const { data: room, error: roomError } = await supabase
      .from('chat_rooms')
      .select('user1_id, user2_id, service_id')
      .eq('id', room_id)
      .single();

    if (roomError || !room) {
      return NextResponse.json({ error: '채팅방을 찾을 수 없습니다' }, { status: 404 });
    }

    // 현재 사용자가 이 채팅방의 참여자인지 확인
    if (room.user1_id !== user.id && room.user2_id !== user.id) {
      return NextResponse.json({ error: '채팅방 참여자가 아닙니다' }, { status: 403 });
    }

    // 현재 사용자가 전문가인지 확인
    const { data: seller } = await supabase
      .from('sellers')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle();

    if (!seller) {
      return NextResponse.json({ error: '전문가만 결제 요청을 할 수 있습니다' }, { status: 403 });
    }

    // 상대방(구매자) 확인
    const buyerId = room.user1_id === user.id ? room.user2_id : room.user1_id;

    // Service Role 클라이언트 사용 (RLS 우회)
    const serviceClient = createServiceRoleClient();

    // 결제 요청 생성
    const { data: paymentRequest, error: insertError } = await serviceClient
      .from('payment_requests')
      .insert({
        room_id,
        seller_id: seller.id,
        buyer_id: buyerId,
        service_id: service_id || room.service_id || null,
        title,
        amount,
        description: description || null,
        delivery_days: delivery_days || 7,
        revision_count: revision_count || 0,
        status: 'pending',
        expires_at: new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString(), // 72시간 후
      })
      .select()
      .single();

    if (insertError) {
      logger.error('결제 요청 생성 실패:', insertError);
      return NextResponse.json({ error: '결제 요청 생성에 실패했습니다' }, { status: 500 });
    }

    return NextResponse.json({ success: true, payment_request: paymentRequest });
  } catch (error) {
    logger.error('Payment request API error:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다' }, { status: 500 });
  }
}

// GET: 결제 요청 목록 조회
export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth();
    if (!authResult.success) {
      return authResult.error!;
    }

    const { user, supabase } = authResult;
    if (!user || !supabase) {
      return NextResponse.json({ error: 'Authentication failed' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const roomId = searchParams.get('room_id');

    if (!roomId) {
      return NextResponse.json({ error: 'room_id가 필요합니다' }, { status: 400 });
    }

    // Service Role 클라이언트 사용 (RLS 우회)
    const serviceClient = createServiceRoleClient();

    // 먼저 사용자가 이 채팅방의 참여자인지 확인
    const { data: room, error: roomError } = await serviceClient
      .from('chat_rooms')
      .select('user1_id, user2_id')
      .eq('id', roomId)
      .single();

    if (roomError || !room) {
      return NextResponse.json({ error: '채팅방을 찾을 수 없습니다' }, { status: 404 });
    }

    // 참여자 확인
    if (room.user1_id !== user.id && room.user2_id !== user.id) {
      return NextResponse.json({ error: '채팅방 참여자가 아닙니다' }, { status: 403 });
    }

    // 채팅방의 결제 요청 목록 조회
    const { data: paymentRequests, error } = await serviceClient
      .from('payment_requests')
      .select('*')
      .eq('room_id', roomId)
      .order('created_at', { ascending: false });

    if (error) {
      logger.error('결제 요청 조회 실패:', error);
      return NextResponse.json({ error: '결제 요청 조회에 실패했습니다' }, { status: 500 });
    }

    return NextResponse.json({ payment_requests: paymentRequests || [] });
  } catch (error) {
    logger.error('Get payment requests error:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다' }, { status: 500 });
  }
}
