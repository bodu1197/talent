import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { checkAdminAuth } from '@/lib/admin/auth';
import { logger } from '@/lib/logger';

interface ReferrerCount {
  referrer: string;
  count: number;
}

function extractDomain(url: string | null): string {
  if (!url) return '직접 접속';

  try {
    const urlObj = new URL(url);
    return urlObj.hostname || '직접 접속';
  } catch {
    return url || '직접 접속';
  }
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

    // Get referrers from last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data, error } = await supabase
      .from('page_views')
      .select('referrer')
      .gte('created_at', thirtyDaysAgo.toISOString());

    if (error) throw error;

    // Count referrers by domain
    const referrerCounts = new Map<string, number>();

    for (const row of data || []) {
      const domain = extractDomain(row.referrer);
      referrerCounts.set(domain, (referrerCounts.get(domain) || 0) + 1);
    }

    // Convert to sorted array
    const referrers: ReferrerCount[] = Array.from(referrerCounts.entries())
      .map(([referrer, count]) => ({ referrer, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 20);

    return NextResponse.json({ referrers });
  } catch (error) {
    logger.error('Referrers analytics error:', error);
    return NextResponse.json({ error: 'Failed to fetch referrers' }, { status: 500 });
  }
}
