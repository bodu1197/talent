import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { logger } from '@/lib/logger';

// GET /api/notifications/count - 안 읽은 알림 개수 조회
export async function GET(_request: NextRequest) {
  try {
    const supabase = await createClient();

    // 사용자 인증 확인
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 });
    }

    // 안 읽은 알림 개수 조회
    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('is_read', false);

    if (error) {
      logger.error('Unread notifications count error:', error);
      return NextResponse.json({ error: '알림 개수를 불러올 수 없습니다' }, { status: 500 });
    }

    return NextResponse.json({ count: count || 0 });
  } catch (error) {
    logger.error('Unread notifications count API error:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다' }, { status: 500 });
  }
}
