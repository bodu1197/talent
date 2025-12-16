import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import { requireAuth } from '@/lib/api/auth';

// PATCH /api/notifications/[id]/read - 알림 읽음 처리
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    // 사용자 인증 확인
    const authResult = await requireAuth();
    if (!authResult.success) {
      return authResult.error!;
    }

    const { user, supabase } = authResult;
    if (!user || !supabase) {
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }

    // 알림 읽음 처리
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', id)
      .eq('user_id', user.id); // 본인 알림만

    if (error) {
      logger.error('Mark notification as read error:', error);
      return NextResponse.json({ error: '알림 읽음 처리에 실패했습니다' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('Mark notification as read API error:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다' }, { status: 500 });
  }
}
