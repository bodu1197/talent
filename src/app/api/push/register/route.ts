import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { logServerError } from '@/lib/rollbar/server';

interface RegisterTokenRequest {
  device_token: string;
  platform: 'android' | 'ios' | 'web';
  device_id?: string;
  device_name?: string;
  app_version?: string;
  os_version?: string;
}

// POST /api/push/register - 디바이스 토큰 등록
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: '로그인이 필요합니다' }, { status: 401 });
    }

    const body: RegisterTokenRequest = await request.json();

    if (!body.device_token || !body.platform) {
      return NextResponse.json({ error: 'device_token과 platform은 필수입니다' }, { status: 400 });
    }

    if (!['android', 'ios', 'web'].includes(body.platform)) {
      return NextResponse.json(
        { error: 'platform은 android, ios, web 중 하나여야 합니다' },
        { status: 400 }
      );
    }

    // 기존 토큰 확인 및 업데이트 또는 생성
    const { data: existingToken } = await supabase
      .from('user_device_tokens')
      .select('id')
      .eq('user_id', user.id)
      .eq('device_token', body.device_token)
      .single();

    if (existingToken) {
      // 기존 토큰 업데이트
      const { data: updatedToken, error } = await supabase
        .from('user_device_tokens')
        .update({
          is_active: true,
          push_enabled: true,
          device_name: body.device_name,
          app_version: body.app_version,
          os_version: body.os_version,
          last_used_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingToken.id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return NextResponse.json({
        token: updatedToken,
        message: '디바이스 토큰이 업데이트되었습니다',
      });
    }

    // 같은 device_id로 등록된 다른 토큰 비활성화 (토큰 갱신 시)
    if (body.device_id) {
      await supabase
        .from('user_device_tokens')
        .update({ is_active: false, updated_at: new Date().toISOString() })
        .eq('user_id', user.id)
        .eq('device_id', body.device_id)
        .neq('device_token', body.device_token);
    }

    // 새 토큰 등록
    const { data: newToken, error } = await supabase
      .from('user_device_tokens')
      .insert({
        user_id: user.id,
        device_token: body.device_token,
        platform: body.platform,
        device_id: body.device_id,
        device_name: body.device_name,
        app_version: body.app_version,
        os_version: body.os_version,
        is_active: true,
        push_enabled: true,
      })
      .select()
      .single();

    if (error) {
      // 중복 토큰 에러 처리
      if (error.code === '23505') {
        return NextResponse.json({ error: '이미 등록된 토큰입니다' }, { status: 409 });
      }
      throw error;
    }

    return NextResponse.json(
      {
        token: newToken,
        message: '디바이스 토큰이 등록되었습니다',
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

// DELETE /api/push/register - 디바이스 토큰 삭제 (로그아웃 시)
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: '로그인이 필요합니다' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const deviceToken = searchParams.get('device_token');

    if (!deviceToken) {
      return NextResponse.json({ error: 'device_token 파라미터가 필요합니다' }, { status: 400 });
    }

    // 토큰 비활성화 (완전 삭제 대신)
    const { error } = await supabase
      .from('user_device_tokens')
      .update({
        is_active: false,
        push_enabled: false,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', user.id)
      .eq('device_token', deviceToken);

    if (error) {
      throw error;
    }

    return NextResponse.json({ message: '디바이스 토큰이 해제되었습니다' });
  } catch (error) {
    logServerError(error instanceof Error ? error : new Error(String(error)), {
      context: 'push_unregister_error',
    });
    return NextResponse.json({ error: '서버 오류가 발생했습니다' }, { status: 500 });
  }
}
