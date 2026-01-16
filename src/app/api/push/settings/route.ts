import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { logServerError } from '@/lib/rollbar/server';

// GET /api/push/settings - 푸시 알림 설정 조회
export async function GET() {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: '로그인이 필요합니다' }, { status: 401 });
    }

    // 사용자의 모든 활성 디바이스 토큰 조회
    const { data: tokens, error } = await supabase
      .from('user_device_tokens')
      .select(
        'id, platform, device_name, push_enabled, notify_orders, notify_messages, notify_errands, notify_marketing, last_used_at'
      )
      .eq('user_id', user.id)
      .eq('is_active', true)
      .order('last_used_at', { ascending: false });

    if (error) {
      throw error;
    }

    // 통합 설정 (모든 디바이스의 공통 설정)
    const settings = {
      push_enabled: tokens?.some((t) => t.push_enabled) ?? false,
      notify_orders: tokens?.[0]?.notify_orders ?? true,
      notify_messages: tokens?.[0]?.notify_messages ?? true,
      notify_errands: tokens?.[0]?.notify_errands ?? true,
      notify_marketing: tokens?.[0]?.notify_marketing ?? false,
      devices:
        tokens?.map((t) => ({
          id: t.id,
          platform: t.platform,
          device_name: t.device_name,
          push_enabled: t.push_enabled,
          last_used_at: t.last_used_at,
        })) ?? [],
    };

    return NextResponse.json({ settings });
  } catch (error) {
    logServerError(error instanceof Error ? error : new Error(String(error)), {
      context: 'push_settings_get_error',
    });
    return NextResponse.json({ error: '서버 오류가 발생했습니다' }, { status: 500 });
  }
}

// PATCH /api/push/settings - 푸시 알림 설정 업데이트
export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: '로그인이 필요합니다' }, { status: 401 });
    }

    const body = await request.json();

    // 업데이트할 필드만 추출
    const updateData: Record<string, boolean | string> = {
      updated_at: new Date().toISOString(),
    };

    if (typeof body.push_enabled === 'boolean') {
      updateData.push_enabled = body.push_enabled;
    }
    if (typeof body.notify_orders === 'boolean') {
      updateData.notify_orders = body.notify_orders;
    }
    if (typeof body.notify_messages === 'boolean') {
      updateData.notify_messages = body.notify_messages;
    }
    if (typeof body.notify_errands === 'boolean') {
      updateData.notify_errands = body.notify_errands;
    }
    if (typeof body.notify_marketing === 'boolean') {
      updateData.notify_marketing = body.notify_marketing;
    }

    // 특정 디바이스만 업데이트하거나 전체 업데이트
    let query = supabase
      .from('user_device_tokens')
      .update(updateData)
      .eq('user_id', user.id)
      .eq('is_active', true);

    if (body.device_id) {
      query = query.eq('id', body.device_id);
    }

    const { error } = await query;

    if (error) {
      throw error;
    }

    return NextResponse.json({ message: '푸시 알림 설정이 업데이트되었습니다' });
  } catch (error) {
    logServerError(error instanceof Error ? error : new Error(String(error)), {
      context: 'push_settings_update_error',
    });
    return NextResponse.json({ error: '서버 오류가 발생했습니다' }, { status: 500 });
  }
}
