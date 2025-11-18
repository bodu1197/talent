// Cron Job API endpoint
// Vercel Cron 또는 외부 Cron 서비스에서 호출

import { NextRequest, NextResponse } from 'next/server';
import {
  processMonthlyBilling,
  cancelExpiredBankTransfers,
  expireCredits
} from '@/lib/advertising-cron';

export async function GET(request: NextRequest) {
  // Cron 보안키 확인 (필수)
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret) {
    console.error('[SECURITY] CRON_SECRET environment variable is not set!');
    return NextResponse.json(
      { error: 'Server misconfiguration' },
      { status: 500 }
    );
  }

  const authHeader = request.headers.get('authorization');

  if (authHeader !== `Bearer ${cronSecret}`) {
    console.warn('[SECURITY] Unauthorized cron job attempt:', {
      ip: request.headers.get('x-forwarded-for') || 'unknown',
      timestamp: new Date().toISOString()
    });
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
    // 서버 로그에만 상세 정보 기록
    console.error('[ERROR] Cron job failed:', {
      job,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString()
    });

    // 클라이언트에는 일반 메시지만 반환
    return NextResponse.json(
      {
        error: 'Internal server error',
        job: job || 'unknown'
      },
      { status: 500 }
    );
  }
}
