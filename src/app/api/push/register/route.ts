import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { logServerError } from '@/lib/rollbar/server';

interface PushSubscriptionJSON {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

interface RegisterRequest {
  subscription: PushSubscriptionJSON;
  platform: 'web';
  device_name?: string;
  os_version?: string;
}

// POST /api/push/register - 웹 푸시 구독 등록
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: '로그인이 필요합니다' }, { status: 401 });
    }

    const body: RegisterRequest = await request.json();

    if (!body.subscription || !body.subscription.endpoint || !body.subscription.keys) {
      return NextResponse.json({ error: '유효한 구독 정보가 필요합니다' }, { status: 400 });
    }

    const { endpoint } = body.subscription;

    // 기존 구독 확인 (endpoint로 식별)
    const { data: existingToken } = await supabase
      .from('user_device_tokens')
      .select('id')
      .eq('user_id', user.id)
      .eq('device_token', endpoint)
      .single();

    if (existingToken) {
      // 기존 구독 업데이트
      const { data: updatedToken, error } = await supabase
        .from('user_device_tokens')
        .update({
          is_active: true,
          push_enabled: true,
          device_name: body.device_name,
          os_version: body.os_version,
          // subscription 정보를 device_id에 JSON으로 저장
          device_id: JSON.stringify(body.subscription),
          last_used_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingToken.id)
        .select()
        .single();

      if (error) throw error;

      return NextResponse.json({
        token: updatedToken,
        message: '푸시 구독이 업데이트되었습니다',
      });
    }

    // 새 구독 등록
    const { data: newToken, error } = await supabase
      .from('user_device_tokens')
      .insert({
        user_id: user.id,
        device_token: endpoint, // endpoint를 토큰으로 사용
        platform: 'web',
        device_id: JSON.stringify(body.subscription), // 전체 subscription을 저장
        device_name: body.device_name,
        os_version: body.os_version,
        is_active: true,
        push_enabled: true,
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json({ error: '이미 등록된 구독입니다' }, { status: 409 });
      }
      throw error;
    }

    return NextResponse.json(
      {
        token: newToken,
        message: '푸시 구독이 등록되었습니다',
      },
      { status: 201 }
    );
  } catch (error) {
    logServerError(error instanceof Error ? error : new Error(String(error)), {
      context: 'push_register_error',
    });
    return NextResponse.json({ error: '서버 오류가 발생했습니다' }, { status: 500 });
  }
}

// DELETE /api/push/register - 푸시 구독 해제
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: '로그인이 필요합니다' }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const endpoint = body.endpoint;

    if (!endpoint) {
      return NextResponse.json({ error: 'endpoint가 필요합니다' }, { status: 400 });
    }

    // 구독 비활성화
    const { error } = await supabase
      .from('user_device_tokens')
      .update({
        is_active: false,
        push_enabled: false,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', user.id)
      .eq('device_token', endpoint);

    if (error) throw error;

    return NextResponse.json({ message: '푸시 구독이 해제되었습니다' });
  } catch (error) {
    logServerError(error instanceof Error ? error : new Error(String(error)), {
      context: 'push_unregister_error',
    });
    return NextResponse.json({ error: '서버 오류가 발생했습니다' }, { status: 500 });
  }
}
