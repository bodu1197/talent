// Cron Job API endpoint
// Vercel Cron 또는 외부 Cron 서비스에서 호출

import { NextRequest, NextResponse } from 'next/server';
import {
  processMonthlyBilling,
  cancelExpiredBankTransfers,
  expireCredits
} from '@/lib/advertising-cron';

export async function GET(request: NextRequest) {
  // Cron 보안키 확인
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET || 'default-secret';

  if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const searchParams = request.nextUrl.searchParams;
  const job = searchParams.get('job');

  try {
    switch (job) {
      case 'monthly-billing':
        await processMonthlyBilling();
        return NextResponse.json({ success: true, job: 'monthly-billing' });

      case 'expire-bank-transfers':
        await cancelExpiredBankTransfers();
        return NextResponse.json({ success: true, job: 'expire-bank-transfers' });

      case 'expire-credits':
        await expireCredits();
        return NextResponse.json({ success: true, job: 'expire-credits' });

      case 'all':
        await processMonthlyBilling();
        await cancelExpiredBankTransfers();
        await expireCredits();
        return NextResponse.json({ success: true, job: 'all' });

      default:
        return NextResponse.json(
          { error: 'Invalid job parameter' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Cron job 실행 실패:', error);
    return NextResponse.json(
      { error: 'Cron job failed', details: error },
      { status: 500 }
    );
  }
}
