import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import { requireAuth } from '@/lib/api/auth';

// PATCH /api/notifications/read-all - 모든 알림 읽음 처리
export async function PATCH(_request: NextRequest) {
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

    // 모든 안 읽은 알림 읽음 처리
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', user.id)
      .eq('is_read', false);

    if (error) {
      logger.error('Mark all notifications as read error:', error);
      return NextResponse.json({ error: '알림 읽음 처리에 실패했습니다' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('Mark all notifications as read API error:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다' }, { status: 500 });
  }
}
