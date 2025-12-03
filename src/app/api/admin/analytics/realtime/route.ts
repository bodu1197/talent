import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { checkAdminAuth } from '@/lib/admin/auth';
import { logger } from '@/lib/logger';

// KST (한국 표준시) 기준으로 오늘 시작 시간 계산
function getKSTTodayStart(): Date {
  const now = new Date();
  // UTC 시간에서 KST(+9) 기준 오늘 00:00:00 계산
  const kstOffset = 9 * 60 * 60 * 1000; // 9시간을 밀리초로
  const kstNow = new Date(now.getTime() + kstOffset);

  // KST 기준 오늘 00:00:00
  const kstTodayStart = new Date(
    Date.UTC(kstNow.getUTCFullYear(), kstNow.getUTCMonth(), kstNow.getUTCDate(), 0, 0, 0, 0)
  );

  // 다시 UTC로 변환 (DB는 UTC 저장)
  return new Date(kstTodayStart.getTime() - kstOffset);
}

export async function GET() {
  try {
    const adminCheck = await checkAdminAuth();
    if (!adminCheck.isAdmin) {
      return NextResponse.json(
        { error: adminCheck.error },
        { status: adminCheck.error === 'Unauthorized' ? 401 : 403 }
      );
    }

    const supabase = await createClient();

    // KST 기준 오늘 시작 시간
    const todayStart = getKSTTodayStart();
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    const thirtyMinutesAgo = new Date(now.getTime() - 30 * 60 * 1000);

    // Run all queries in parallel
    const [todayViewsResult, todayUniqueResult, lastHourResult, activeSessionsResult] =
      await Promise.all([
        // Today's total views (KST 기준)
        supabase
          .from('page_views')
          .select('id', { count: 'exact', head: true })
          .gte('created_at', todayStart.toISOString()),

        // Today's unique visitors (user_id 우선, 없으면 session_id)
        supabase
          .from('page_views')
          .select('user_id, session_id')
          .gte('created_at', todayStart.toISOString()),

        // Last hour views
        supabase
          .from('page_views')
          .select('id', { count: 'exact', head: true })
          .gte('created_at', oneHourAgo.toISOString()),

        // Active sessions (last 30 minutes)
        supabase
          .from('page_views')
          .select('user_id, session_id')
          .gte('created_at', thirtyMinutesAgo.toISOString()),
      ]);

    // Calculate unique visitors (user_id 우선, 없으면 session_id 사용)
    const getUniqueIdentifier = (row: { user_id: string | null; session_id: string | null }) =>
      row.user_id || row.session_id || 'unknown';

    const uniqueVisitors = new Set(todayUniqueResult.data?.map(getUniqueIdentifier) || []);
    const activeSessions = new Set(activeSessionsResult.data?.map(getUniqueIdentifier) || []);

    return NextResponse.json({
      today_views: todayViewsResult.count || 0,
      today_unique: uniqueVisitors.size,
      last_hour_views: lastHourResult.count || 0,
      active_sessions: activeSessions.size,
    });
  } catch (error) {
    logger.error('Realtime analytics error:', error);
    return NextResponse.json({ error: 'Failed to fetch realtime stats' }, { status: 500 });
  }
}
