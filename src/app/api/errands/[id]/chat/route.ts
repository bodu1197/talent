import { NextRequest, NextResponse } from 'next/server';
import { createClient, createServiceRoleClient } from '@/lib/supabase/server';
import { logServerError } from '@/lib/rollbar/server';
import { SupabaseClient } from '@supabase/supabase-js';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// 사용자 프로필 조회 헬퍼 함수
async function getUserProfile(supabase: SupabaseClient, userId: string) {
  const { data } = await supabase
    .from('profiles')
    .select('id, name')
    .eq('user_id', userId)
    .single();
  return data;
}

// 심부름 참여 권한 확인 헬퍼 함수
function checkParticipant(
  errand: { requester_id: string; helper_id: string | null },
  profileId: string
) {
  return {
    isRequester: errand.requester_id === profileId,
    isHelper: errand.helper_id === profileId,
  };
}

// 상대방에게 알림 전송 헬퍼 함수
async function sendChatNotification(
  supabase: SupabaseClient,
  serviceClient: SupabaseClient,
  recipientId: string,
  senderName: string,
  message: string,
  errandId: string
) {
  const { data: recipientProfile } = await supabase
    .from('profiles')
    .select('user_id')
    .eq('id', recipientId)
    .single();

  if (recipientProfile?.user_id) {
    const truncatedMsg = message.substring(0, 50);
    const displayMsg = message.length > 50 ? `${truncatedMsg}...` : truncatedMsg;

    await serviceClient.from('notifications').insert({
      user_id: recipientProfile.user_id,
      type: 'errand_chat',
      title: '새 메시지가 도착했습니다',
      message: `${senderName}님: ${displayMsg}`,
      link: `/errands/${errandId}/chat`,
      is_read: false,
    });
  }
}

// 메시지 조회
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: '로그인이 필요합니다' }, { status: 401 });
    }

    // 현재 사용자의 profile.id 조회
    const { data: userProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (!userProfile) {
      return NextResponse.json({ error: '프로필을 찾을 수 없습니다' }, { status: 404 });
    }

    // 심부름 참여자인지 확인
    const { data: errand } = await supabase
      .from('errands')
      .select('requester_id, helper_id, status, title')
      .eq('id', id)
      .single();

    if (!errand) {
      return NextResponse.json({ error: '심부름을 찾을 수 없습니다' }, { status: 404 });
    }

    const isRequester = errand.requester_id === userProfile.id;
    const isHelper = errand.helper_id === userProfile.id;

    if (!isRequester && !isHelper) {
      return NextResponse.json({ error: '채팅 권한이 없습니다' }, { status: 403 });
    }

    // 메시지 조회 (발신자 정보 포함)
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const before = searchParams.get('before'); // cursor pagination

    let query = supabase
      .from('errand_chat_messages')
      .select(
        `
        *,
        sender:profiles!sender_id(id, name, profile_image)
      `
      )
      .eq('errand_id', id)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (before) {
      query = query.lt('created_at', before);
    }

    const { data: messages, error } = await query;

    if (error) {
      logServerError(error, { context: 'errand_chat_get', errand_id: id });
      return NextResponse.json({ error: '메시지를 불러올 수 없습니다' }, { status: 500 });
    }

    // 읽음 처리 (상대방이 보낸 메시지)
    const serviceClient = createServiceRoleClient();
    await serviceClient
      .from('errand_chat_messages')
      .update({ is_read: true })
      .eq('errand_id', id)
      .neq('sender_id', userProfile.id)
      .eq('is_read', false);

    return NextResponse.json({
      messages: messages?.reverse() || [],
      errand: {
        id,
        title: errand.title,
        status: errand.status,
        isRequester,
        isHelper,
      },
    });
  } catch (error) {
    logServerError(error instanceof Error ? error : new Error(String(error)), {
      context: 'errand_chat_get_error',
    });
    return NextResponse.json({ error: '서버 오류가 발생했습니다' }, { status: 500 });
  }
}

// 메시지 전송
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: '로그인이 필요합니다' }, { status: 401 });
    }

    const userProfile = await getUserProfile(supabase, user.id);
    if (!userProfile) {
      return NextResponse.json({ error: '프로필을 찾을 수 없습니다' }, { status: 404 });
    }

    const { data: errand } = await supabase
      .from('errands')
      .select('requester_id, helper_id, status, title')
      .eq('id', id)
      .single();

    if (!errand) {
      return NextResponse.json({ error: '심부름을 찾을 수 없습니다' }, { status: 404 });
    }

    const { isRequester, isHelper } = checkParticipant(errand, userProfile.id);

    if (!isRequester && !isHelper) {
      return NextResponse.json({ error: '채팅 권한이 없습니다' }, { status: 403 });
    }

    const isChatDisabled = errand.status === 'COMPLETED' || errand.status === 'CANCELLED';
    if (isChatDisabled) {
      return NextResponse.json(
        { error: '완료되거나 취소된 심부름은 채팅할 수 없습니다' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { message, message_type = 'text' } = body;

    if (!message?.trim()) {
      return NextResponse.json({ error: '메시지를 입력해주세요' }, { status: 400 });
    }

    const serviceClient = createServiceRoleClient();
    const trimmedMessage = message.trim();

    const { data: newMessage, error } = await serviceClient
      .from('errand_chat_messages')
      .insert({
        errand_id: id,
        sender_id: userProfile.id,
        message: trimmedMessage,
        message_type,
      })
      .select(
        `
        *,
        sender:profiles!sender_id(id, name, profile_image)
      `
      )
      .single();

    if (error) {
      logServerError(error, { context: 'errand_chat_send', errand_id: id });
      return NextResponse.json({ error: '메시지 전송에 실패했습니다' }, { status: 500 });
    }

    const recipientId = isRequester ? errand.helper_id : errand.requester_id;
    if (recipientId) {
      await sendChatNotification(
        supabase,
        serviceClient,
        recipientId,
        userProfile.name,
        trimmedMessage,
        id
      );
    }

    return NextResponse.json({ message: newMessage }, { status: 201 });
  } catch (error) {
    logServerError(error instanceof Error ? error : new Error(String(error)), {
      context: 'errand_chat_send_error',
    });
    return NextResponse.json({ error: '서버 오류가 발생했습니다' }, { status: 500 });
  }
}
