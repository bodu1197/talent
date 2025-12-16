import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import { requireAuth } from '@/lib/api/auth';

// GET /api/notifications/count - 안 읽은 알림 개수 조회
export async function GET(_request: NextRequest) {
  try {
    // 사용자 인증 확인
    const authResult = await requireAuth();
    if (!authResult.success) {
      return authResult.error!;
    }

    const { user, supabase } = authResult;
    if (!user || !supabase) {
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
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
