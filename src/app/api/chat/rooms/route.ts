import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { logger } from '@/lib/logger';
import type { SupabaseClient } from '@supabase/supabase-js';

// Helper: 데이터 맵 생성
function createDataMaps(
  sellersData: {
    data: Array<{
      user_id: string;
      id: string;
      business_name: string | null;
      display_name: string | null;
      profile_image: string | null;
    }> | null;
  },
  usersData: {
    data: Array<{ user_id: string; name: string | null; profile_image: string | null }> | null;
  },
  servicesData: { data: Array<{ id: string; title: string; thumbnail_url: string | null }> | null },
  messagesData: {
    data: Array<{ room_id: string; message: string; created_at: string; sender_id: string }> | null;
  },
  unreadData: { data: Array<{ room_id: string; id: string }> | null },
  favoritesData: { data: Array<{ room_id: string }> | null },
  ordersData: { data: Array<{ service_id: string; buyer_id: string; seller_id: string }> | null }
) {
  const sellersMap = new Map((sellersData.data || []).map((s) => [s.user_id, s]));
  const usersMap = new Map((usersData.data || []).map((u) => [u.user_id, u]));
  const servicesMap = new Map((servicesData.data || []).map((s) => [s.id, s]));

  // 마지막 메시지 맵
  const lastMessageMap = new Map<
    string,
    { room_id: string; message: string; created_at: string; sender_id: string }
  >();
  if (messagesData.data) {
    for (const msg of messagesData.data) {
      if (!lastMessageMap.has(msg.room_id)) {
        lastMessageMap.set(msg.room_id, msg);
      }
    }
  }

  // 읽지 않은 메시지 수 맵
  const unreadCountMap = new Map<string, number>();
  if (unreadData.data) {
    logger.info(`[Chat Rooms API] Total unread messages: ${unreadData.data.length}`);
    for (const msg of unreadData.data) {
      unreadCountMap.set(msg.room_id, (unreadCountMap.get(msg.room_id) || 0) + 1);
    }
    logger.info('[Chat Rooms API] Unread count map:', Object.fromEntries(unreadCountMap));
  }

  // 즐겨찾기 맵
  const favoritesSet = new Set((favoritesData.data || []).map((f) => f.room_id));

  // 진행 중인 주문 맵
  const activeOrdersMap = new Map<string, boolean>();
  if (ordersData.data) {
    for (const order of ordersData.data) {
      const key = `${order.service_id}-${order.buyer_id}-${order.seller_id}`;
      activeOrdersMap.set(key, true);
    }
  }

  return {
    sellersMap,
    usersMap,
    servicesMap,
    lastMessageMap,
    unreadCountMap,
    favoritesSet,
    activeOrdersMap,
  };
}

// Helper: 상대 사용자 정보 조회
function getOtherUserInfo(
  otherUserId: string,
  sellersMap: Map<
    string,
    {
      id: string;
      display_name: string | null;
      business_name: string | null;
      profile_image: string | null;
    }
  >,
  usersMap: Map<string, { name: string | null; profile_image: string | null }>
) {
  const sellerInfo = sellersMap.get(otherUserId);
  const userInfo = usersMap.get(otherUserId);

  if (sellerInfo) {
    return {
      id: otherUserId,
      name: sellerInfo.display_name || sellerInfo.business_name || '판매자',
      profile_image: sellerInfo.profile_image,
      seller_id: sellerInfo.id,
    };
  }
  if (userInfo) {
    return {
      id: otherUserId,
      name: userInfo.name || '사용자',
      profile_image: userInfo.profile_image || null,
    };
  }
  return { id: otherUserId, name: '사용자', profile_image: null };
}

// Helper: 병렬 데이터 가져오기
async function fetchRoomData(
  supabase: SupabaseClient,
  userId: string,
  otherUserIds: string[],
  serviceIds: string[],
  roomIds: string[]
) {
  return Promise.all([
    supabase
      .from('seller_profiles')
      .select('id, user_id, business_name, display_name, profile_image')
      .in('user_id', otherUserIds),
    supabase.from('profiles').select('user_id, name, profile_image').in('user_id', otherUserIds),
    serviceIds.length > 0
      ? supabase.from('services').select('id, title, thumbnail_url').in('id', serviceIds)
      : Promise.resolve({ data: [] }),
    supabase
      .from('chat_messages')
      .select('room_id, message, created_at, sender_id')
      .in('room_id', roomIds)
      .order('created_at', { ascending: false }),
    supabase
      .from('chat_messages')
      .select('room_id, id')
      .in('room_id', roomIds)
      .eq('is_read', false)
      .neq('sender_id', userId),
    supabase.from('chat_favorites').select('room_id').eq('user_id', userId).in('room_id', roomIds),
    serviceIds.length > 0
      ? supabase
          .from('orders')
          .select('buyer_id, seller_id, service_id, status')
          .in('service_id', serviceIds)
          .not('status', 'in', '("completed","cancelled","refunded")')
      : Promise.resolve({ data: [] }),
  ]);
}

// 채팅방 목록 조회
export async function GET(_request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 현재 사용자가 판매자인지 확인
    const { data: seller } = await supabase
      .from('sellers')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle();

    // 채팅방 목록 조회 (user1_id 또는 user2_id로 참여한 채팅방)
    const { data: rooms, error } = await supabase
      .from('chat_rooms')
      .select(
        `
        id,
        user1_id,
        user2_id,
        service_id,
        last_message_at,
        created_at
      `
      )
      .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
      .order('last_message_at', { ascending: false });

    if (error) {
      logger.error('Chat rooms fetch error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!rooms || rooms.length === 0) {
      return NextResponse.json({ rooms: [] });
    }

    // 모든 필요한 ID 수집
    const otherUserIds = rooms.map((room) =>
      room.user1_id === user.id ? room.user2_id : room.user1_id
    );
    const serviceIds = rooms.map((r) => r.service_id).filter(Boolean);
    const roomIds = rooms.map((r) => r.id);

    // 병렬로 모든 데이터 가져오기
    const [
      sellersData,
      usersData,
      servicesData,
      messagesData,
      unreadData,
      favoritesData,
      ordersData,
    ] = await fetchRoomData(supabase, user.id, otherUserIds, serviceIds, roomIds);

    // 데이터 맵 생성
    const {
      sellersMap,
      usersMap,
      servicesMap,
      lastMessageMap,
      unreadCountMap,
      favoritesSet,
      activeOrdersMap,
    } = createDataMaps(
      sellersData,
      usersData,
      servicesData,
      messagesData,
      unreadData,
      favoritesData,
      ordersData
    );

    // 데이터 조합
    const roomsWithMessages = rooms.map((room) => {
      const otherUserId = room.user1_id === user.id ? room.user2_id : room.user1_id;
      const otherUser = getOtherUserInfo(otherUserId, sellersMap, usersMap);

      // 진행 중인 주문 확인
      const key1 = `${room.service_id}-${user.id}-${otherUserId}`;
      const key2 = `${room.service_id}-${otherUserId}-${user.id}`;
      const hasActiveOrder = room.service_id
        ? activeOrdersMap.has(key1) || activeOrdersMap.has(key2)
        : false;

      return {
        ...room,
        otherUser,
        seller_id: seller?.id || null,
        service: room.service_id ? servicesMap.get(room.service_id) || null : null,
        lastMessage: lastMessageMap.get(room.id) || null,
        unreadCount: unreadCountMap.get(room.id) || 0,
        is_favorite: favoritesSet.has(room.id),
        has_active_order: hasActiveOrder,
      };
    });

    return NextResponse.json({ rooms: roomsWithMessages });
  } catch (error) {
    logger.error('Chat rooms API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// 채팅방 생성 또는 기존 채팅방 반환
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { seller_id, service_id, other_user_id } = body;

    // seller_id 또는 other_user_id 중 하나는 필수
    const targetUserId = other_user_id || seller_id;

    if (!targetUserId) {
      return NextResponse.json(
        { error: 'seller_id or other_user_id is required' },
        { status: 400 }
      );
    }

    // seller_id가 제공된 경우, seller의 user_id로 변환
    let otherUserId = targetUserId;
    if (seller_id && !other_user_id) {
      const { data: seller } = await supabase
        .from('sellers')
        .select('user_id')
        .eq('id', seller_id)
        .single();

      if (!seller) {
        return NextResponse.json({ error: 'Seller not found' }, { status: 404 });
      }
      otherUserId = seller.user_id;
    }

    // user1_id와 user2_id 정렬 (user1_id <= user2_id)
    const [user1_id, user2_id] = [user.id, otherUserId].sort((a, b) => a.localeCompare(b));

    // 기존 채팅방 확인 (user1_id, user2_id, service_id로 확인)
    let query = supabase
      .from('chat_rooms')
      .select('id')
      .eq('user1_id', user1_id)
      .eq('user2_id', user2_id);

    // service_id가 있으면 일치하는 채팅방, 없으면 service_id가 null인 채팅방 찾기
    if (service_id) {
      query = query.eq('service_id', service_id);
    } else {
      query = query.is('service_id', null);
    }

    const { data: existingRoom } = await query.maybeSingle();

    if (existingRoom) {
      return NextResponse.json({ room_id: existingRoom.id });
    }

    // 새 채팅방 생성
    const { data: newRoom, error } = await supabase
      .from('chat_rooms')
      .insert({
        user1_id,
        user2_id,
        service_id: service_id || null,
      })
      .select('id')
      .single();

    if (error) {
      logger.error('Chat room creation error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ room_id: newRoom.id });
  } catch (error) {
    logger.error('Chat room creation API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
