import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { checkAdminAuth } from '@/lib/admin/auth';
import { logger } from '@/lib/logger';

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

    // Get today's date range (Korean timezone)
    const now = new Date();
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);

    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    const thirtyMinutesAgo = new Date(now.getTime() - 30 * 60 * 1000);

    // Run all queries in parallel
    const [todayViewsResult, todayUniqueResult, lastHourResult, activeSessionsResult] =
      await Promise.all([
        // Today's total views
        supabase
          .from('page_views')
          .select('id', { count: 'exact', head: true })
          .gte('created_at', todayStart.toISOString()),

        // Today's unique visitors
        supabase
          .from('page_views')
          .select('session_id')
          .gte('created_at', todayStart.toISOString()),

        // Last hour views
        supabase
          .from('page_views')
          .select('id', { count: 'exact', head: true })
          .gte('created_at', oneHourAgo.toISOString()),

        // Active sessions (last 30 minutes)
        supabase
          .from('page_views')
          .select('session_id')
          .gte('created_at', thirtyMinutesAgo.toISOString()),
      ]);

    // Calculate unique visitors
    const uniqueSessions = new Set(todayUniqueResult.data?.map((r) => r.session_id) || []);
    const activeSessions = new Set(activeSessionsResult.data?.map((r) => r.session_id) || []);

    return NextResponse.json({
      today_views: todayViewsResult.count || 0,
      today_unique: uniqueSessions.size,
      last_hour_views: lastHourResult.count || 0,
      active_sessions: activeSessions.size,
    });
  } catch (error) {
    logger.error('Realtime analytics error:', error);
    return NextResponse.json({ error: 'Failed to fetch realtime stats' }, { status: 500 });
  }
}
