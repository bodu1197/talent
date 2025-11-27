import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { checkAdminAuth } from '@/lib/admin/auth';
import { logger } from '@/lib/logger';

type Period = 'hour' | 'day' | 'month' | 'year';

function getStartDate(period: Period): Date {
  const now = new Date();

  switch (period) {
    case 'hour':
      // Last 7 days for hourly view
      return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    case 'day':
      // Last 30 days for daily view
      return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    case 'month': {
      // Last 12 months for monthly view
      const monthlyStart = new Date(now);
      monthlyStart.setMonth(monthlyStart.getMonth() - 12);
      return monthlyStart;
    }
    case 'year': {
      // Last 5 years for yearly view
      const yearlyStart = new Date(now);
      yearlyStart.setFullYear(yearlyStart.getFullYear() - 5);
      return yearlyStart;
    }
  }
}

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
