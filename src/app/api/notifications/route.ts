import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import { requireAuth } from '@/lib/api/auth';

// GET /api/notifications - 알림 목록 조회
export async function GET(request: NextRequest) {
  try {
    // 사용자 인증 확인
    const authResult = await requireAuth();
    if (!authResult.success) {
      return authResult.error!;
    }

    const { user, supabase } = authResult;

    // URL 파라미터
    const { searchParams } = new URL(request.url);
    const unreadOnly = searchParams.get('unread_only') === 'true';
    const limit = Number.parseInt(searchParams.get('limit') || '50');

    // 알림 조회
    let query = supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (unreadOnly) {
      query = query.eq('is_read', false);
    }

    const { data, error } = await query;

    if (error) {
      logger.error('Notifications fetch error:', error);
      return NextResponse.json({ error: '알림을 불러올 수 없습니다' }, { status: 500 });
    }

    return NextResponse.json({ notifications: data });
  } catch (error) {
    logger.error('Notifications API error:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다' }, { status: 500 });
  }
}
