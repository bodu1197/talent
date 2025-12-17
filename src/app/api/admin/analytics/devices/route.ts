import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { checkAdminAuth } from '@/lib/admin/auth';
import { logger } from '@/lib/logger';
import { type Period, getStartDate } from '@/lib/admin/analytics-helpers';

export async function GET(request: NextRequest) {
  try {
    const adminCheck = await checkAdminAuth();
    if (!adminCheck.isAdmin) {
      return NextResponse.json(
        { error: adminCheck.error },
        { status: adminCheck.error === 'Unauthorized' ? 401 : 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const period = (searchParams.get('period') || 'day') as Period;

    const supabase = await createClient();
    const startDate = getStartDate(period);

    const { data, error } = await supabase
      .from('page_views')
      .select('device_type')
      .gte('created_at', startDate.toISOString());

    if (error) throw error;

    // Count by device type
    const deviceCounts = {
      desktop: 0,
      mobile: 0,
      tablet: 0,
      bot: 0,
    };

    for (const row of data || []) {
      const deviceType = row.device_type?.toLowerCase() || 'desktop';
      if (deviceType in deviceCounts) {
        deviceCounts[deviceType as keyof typeof deviceCounts]++;
      } else {
        deviceCounts.desktop++;
      }
    }

    const total = deviceCounts.desktop + deviceCounts.mobile + deviceCounts.tablet;

    return NextResponse.json({
      period,
      desktop: deviceCounts.desktop,
      mobile: deviceCounts.mobile,
      tablet: deviceCounts.tablet,
      bot: deviceCounts.bot,
      total,
    });
  } catch (error) {
    logger.error('Device analytics error:', error);
    return NextResponse.json({ error: 'Failed to fetch device stats' }, { status: 500 });
  }
}
