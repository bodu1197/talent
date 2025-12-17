import { NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import { withAuthenticatedPATCH } from '@/lib/api/route-helpers';

// PATCH /api/notifications/[id]/read - 알림 읽음 처리
export const PATCH = withAuthenticatedPATCH(async (_request, { user, supabase, id }) => {
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
});
