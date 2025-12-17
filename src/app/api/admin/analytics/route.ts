import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { checkAdminAuth } from '@/lib/admin/auth';
import { logger } from '@/lib/logger';
import {
  type Period,
  getDateRange,
  toKST,
  formatKSTDate,
  formatKSTHour,
} from '@/lib/admin/analytics-helpers';

interface PageViewRow {
  created_at: string;
  device_type: string | null;
  session_id: string | null;
  user_id: string | null;
}

interface AggregatedStats {
  date?: string;
  hour?: string;
  month?: number;
  year?: number;
  total_views: number;
  unique_visitors: number;
  desktop_views: number;
  mobile_views: number;
  tablet_views: number;
  bot_views: number;
}

interface InternalStats extends AggregatedStats {
  _sessions: Set<string>;
}

// Aggregate page views by period (KST 기준)
function aggregateByPeriod(data: PageViewRow[], period: Period): AggregatedStats[] {
  const statsMap = new Map<string, InternalStats>();

  for (const row of data) {
    const createdAt = new Date(row.created_at);
    const kstDate = toKST(createdAt); // KST로 변환
    let key: string;
    let statsEntry: Partial<AggregatedStats>;

    switch (period) {
      case 'hour':
        // Group by hour (KST)
        key = formatKSTHour(createdAt);
        statsEntry = { hour: key };
        break;
      case 'day':
        // Group by date (KST)
        key = formatKSTDate(createdAt);
        statsEntry = { date: key };
        break;
      case 'month':
        // Group by year-month (KST)
        key = `${kstDate.getUTCFullYear()}-${String(kstDate.getUTCMonth() + 1).padStart(2, '0')}`;
        statsEntry = { year: kstDate.getUTCFullYear(), month: kstDate.getUTCMonth() + 1 };
        break;
      case 'year':
        // Group by year (KST)
        key = String(kstDate.getUTCFullYear());
        statsEntry = { year: kstDate.getUTCFullYear() };
        break;
    }

    const existing: InternalStats = statsMap.get(key) || {
      ...statsEntry,
      total_views: 0,
      unique_visitors: 0,
      desktop_views: 0,
      mobile_views: 0,
      tablet_views: 0,
      bot_views: 0,
      _sessions: new Set<string>(),
    };

    // Count views
    existing.total_views++;

    // Count unique visitors (user_id 우선, 없으면 session_id 사용)
    const uniqueId = row.user_id || row.session_id;
    if (uniqueId) {
      existing._sessions.add(uniqueId);
      existing.unique_visitors = existing._sessions.size;
    }

    // Count by device type
    const deviceType = row.device_type?.toLowerCase() || 'desktop';
    switch (deviceType) {
      case 'mobile':
        existing.mobile_views++;
        break;
      case 'tablet':
        existing.tablet_views++;
        break;
      case 'bot':
        existing.bot_views++;
        break;
      default:
        existing.desktop_views++;
    }

    statsMap.set(key, existing);
  }

  // Convert to array and remove internal _sessions set
  const result = Array.from(statsMap.values()).map((stats): AggregatedStats => {
    const { _sessions, ...cleanStats } = stats;
    return cleanStats;
  });

  // Sort by date/time descending
  return result.sort((a, b) => {
    const aKey = a.hour || a.date || `${a.year}-${String(a.month || 1).padStart(2, '0')}`;
    const bKey = b.hour || b.date || `${b.year}-${String(b.month || 1).padStart(2, '0')}`;
    return bKey.localeCompare(aKey);
  });
}

// Calculate summary statistics
function calculateSummary(stats: AggregatedStats[]) {
  const totalViews = stats.reduce((sum, item) => sum + item.total_views, 0);
  const totalUniqueVisitors = stats.reduce((sum, item) => sum + item.unique_visitors, 0);

  return {
    totalViews,
    totalUniqueVisitors,
    avgViewsPerDay: stats.length > 0 ? Math.round(totalViews / stats.length) : 0,
  };
}

export async function GET(request: NextRequest) {
  try {
    // Require admin authentication
    const adminCheck = await checkAdminAuth();
    if (!adminCheck.isAdmin) {
      return NextResponse.json(
        { error: adminCheck.error },
        { status: adminCheck.error === 'Unauthorized' ? 401 : 403 }
      );
    }

    const supabase = await createClient();
    const { searchParams } = new URL(request.url);

    const period = (searchParams.get('period') || 'day') as Period;
    const path = searchParams.get('path');

    // Validate period
    if (!['hour', 'day', 'month', 'year'].includes(period)) {
      return NextResponse.json(
        { error: 'Invalid period. Must be: hour, day, month, or year' },
        { status: 400 }
      );
    }

    const { startDate } = getDateRange(period);

    // Query page_views directly
    let query = supabase
      .from('page_views')
      .select('created_at, device_type, session_id, user_id')
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: false });

    // Apply path filter if specified
    if (path) {
      query = query.eq('path', path);
    }

    const { data, error } = await query;
    if (error) throw error;

    // Aggregate data by period
    const stats = aggregateByPeriod(data || [], period);

    // Calculate summary
    const summary = calculateSummary(stats);

    return NextResponse.json({
      period,
      path,
      summary,
      data: stats,
    });
  } catch (error) {
    logger.error('Admin analytics error:', error);
    return NextResponse.json({ error: 'Failed to fetch analytics data' }, { status: 500 });
  }
}

// Get top pages
export async function POST(request: NextRequest) {
  try {
    const adminCheck = await checkAdminAuth();
    if (!adminCheck.isAdmin) {
      return NextResponse.json(
        { error: adminCheck.error },
        { status: adminCheck.error === 'Unauthorized' ? 401 : 403 }
      );
    }

    const supabase = await createClient();
    const body = await request.json();
    const { limit = 10 } = body;

    // Query page_views directly and count by path
    const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const { data, error } = await supabase
      .from('page_views')
      .select('path')
      .gte('created_at', startDate.toISOString());

    if (error) throw error;

    // Count views per path
    const pathCounts = new Map<string, number>();
    for (const row of data || []) {
      if (row.path) {
        pathCounts.set(row.path, (pathCounts.get(row.path) || 0) + 1);
      }
    }

    // Convert to sorted array
    const topPages = Array.from(pathCounts.entries())
      .map(([path, views]) => ({ path, views }))
      .sort((a, b) => b.views - a.views)
      .slice(0, limit);

    return NextResponse.json({ topPages });
  } catch (error) {
    logger.error('Top pages error:', error);
    return NextResponse.json({ error: 'Failed to fetch top pages' }, { status: 500 });
  }
}
