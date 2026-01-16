import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { logServerError } from '@/lib/rollbar/server';

interface EarningsSummary {
  availableBalance: number;
  totalEarned: number;
  totalWithdrawn: number;
  pendingEarnings: number;
}

interface Transaction {
  id: string;
  type: 'earning' | 'withdrawal';
  amount: number;
  status: string;
  description: string;
  created_at: string;
  errand_title?: string;
}

// 헬퍼 수익 조회
export async function GET() {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: '로그인이 필요합니다' }, { status: 401 });
    }

    // 헬퍼 프로필 조회
    const { data: helperProfile, error: helperError } = await supabase
      .from('helper_profiles')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (helperError || !helperProfile) {
      return NextResponse.json({ error: '헬퍼 프로필이 없습니다' }, { status: 404 });
    }

    const helperId = helperProfile.id;

    // 병렬로 데이터 조회
    const [
      availableSettlements,
      pendingSettlements,
      completedWithdrawals,
      pendingWithdrawals,
      recentSettlements,
      recentWithdrawals,
    ] = await Promise.all([
      // 출금 가능 정산금
      supabase
        .from('errand_settlements')
        .select('total_amount')
        .eq('helper_id', helperId)
        .eq('status', 'available'),
      // 대기 중 정산금
      supabase
        .from('errand_settlements')
        .select('total_amount')
        .eq('helper_id', helperId)
        .eq('status', 'pending'),
      // 완료된 출금
      supabase
        .from('helper_withdrawals')
        .select('amount')
        .eq('helper_id', helperId)
        .eq('status', 'completed'),
      // 대기 중 출금
      supabase
        .from('helper_withdrawals')
        .select('amount')
        .eq('helper_id', helperId)
        .in('status', ['pending', 'approved']),
      // 최근 정산 내역 (심부름 정보 포함)
      supabase
        .from('errand_settlements')
        .select(
          `
          id,
          total_amount,
          status,
          created_at,
          errand:errands(title)
        `
        )
        .eq('helper_id', helperId)
        .order('created_at', { ascending: false })
        .limit(20),
      // 최근 출금 내역
      supabase
        .from('helper_withdrawals')
        .select('id, amount, status, requested_at, processed_at')
        .eq('helper_id', helperId)
        .order('requested_at', { ascending: false })
        .limit(20),
    ]);

    // 수익 요약 계산
    const availableBalance =
      availableSettlements.data?.reduce((sum, s) => sum + Number(s.total_amount), 0) || 0;
    const pendingEarnings =
      pendingSettlements.data?.reduce((sum, s) => sum + Number(s.total_amount), 0) || 0;
    const totalWithdrawn =
      completedWithdrawals.data?.reduce((sum, w) => sum + Number(w.amount), 0) || 0;
    const pendingWithdrawalAmount =
      pendingWithdrawals.data?.reduce((sum, w) => sum + Number(w.amount), 0) || 0;

    const summary: EarningsSummary = {
      availableBalance: availableBalance - pendingWithdrawalAmount,
      totalEarned: availableBalance + totalWithdrawn + pendingEarnings,
      totalWithdrawn,
      pendingEarnings: pendingEarnings + pendingWithdrawalAmount,
    };

    // 거래 내역 변환
    const transactions: Transaction[] = [];

    // 정산 내역 추가
    if (recentSettlements.data) {
      for (const settlement of recentSettlements.data) {
        // Supabase는 단일 관계도 배열로 반환할 수 있음
        const errandArray = settlement.errand as
          | Array<{ title: string }>
          | { title: string }
          | null;
        const errandData = Array.isArray(errandArray) ? errandArray[0] : errandArray;
        transactions.push({
          id: settlement.id,
          type: 'earning',
          amount: Number(settlement.total_amount),
          status: settlement.status,
          description: errandData?.title || '심부름 수익',
          created_at: settlement.created_at,
          errand_title: errandData?.title,
        });
      }
    }

    // 출금 내역 추가
    if (recentWithdrawals.data) {
      for (const withdrawal of recentWithdrawals.data) {
        transactions.push({
          id: withdrawal.id,
          type: 'withdrawal',
          amount: Number(withdrawal.amount),
          status: withdrawal.status,
          description: '출금 신청',
          created_at: withdrawal.requested_at,
        });
      }
    }

    // 시간순 정렬
    transactions.sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    return NextResponse.json({
      summary,
      transactions: transactions.slice(0, 30),
    });
  } catch (error) {
    logServerError(error instanceof Error ? error : new Error(String(error)), {
      context: 'helper_earnings_get_error',
    });
    return NextResponse.json({ error: '서버 오류가 발생했습니다' }, { status: 500 });
  }
}

// 출금 신청
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: '로그인이 필요합니다' }, { status: 401 });
    }

    // 헬퍼 프로필 조회
    const { data: helperProfile, error: helperError } = await supabase
      .from('helper_profiles')
      .select('id, bank_name, bank_account, account_holder, verification_status')
      .eq('user_id', user.id)
      .single();

    if (helperError || !helperProfile) {
      return NextResponse.json({ error: '헬퍼 프로필이 없습니다' }, { status: 404 });
    }

    // 검증된 헬퍼만 출금 가능
    if (helperProfile.verification_status !== 'verified') {
      return NextResponse.json(
        { error: '서류 검증이 완료된 헬퍼만 출금할 수 있습니다' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { amount } = body;

    if (!amount || amount < 1000) {
      return NextResponse.json({ error: '출금 금액은 1,000원 이상이어야 합니다' }, { status: 400 });
    }

    // 출금 가능 잔액 확인
    const { data: availableSettlements } = await supabase
      .from('errand_settlements')
      .select('total_amount')
      .eq('helper_id', helperProfile.id)
      .eq('status', 'available');

    const { data: pendingWithdrawals } = await supabase
      .from('helper_withdrawals')
      .select('amount')
      .eq('helper_id', helperProfile.id)
      .in('status', ['pending', 'approved']);

    const availableBalance =
      (availableSettlements?.reduce((sum, s) => sum + Number(s.total_amount), 0) || 0) -
      (pendingWithdrawals?.reduce((sum, w) => sum + Number(w.amount), 0) || 0);

    if (amount > availableBalance) {
      return NextResponse.json(
        { error: `출금 가능 금액(${availableBalance.toLocaleString()}원)을 초과했습니다` },
        { status: 400 }
      );
    }

    // 계좌 정보 확인
    if (!helperProfile.bank_name || !helperProfile.bank_account || !helperProfile.account_holder) {
      return NextResponse.json({ error: '계좌 정보가 등록되지 않았습니다' }, { status: 400 });
    }

    // 출금 신청
    const { data: withdrawal, error: withdrawalError } = await supabase
      .from('helper_withdrawals')
      .insert({
        helper_id: helperProfile.id,
        amount,
        bank_name: helperProfile.bank_name,
        bank_account: helperProfile.bank_account,
        account_holder: helperProfile.account_holder,
        status: 'pending',
        requested_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (withdrawalError) {
      logServerError(withdrawalError, {
        context: 'helper_withdrawal_request',
        helper_id: helperProfile.id,
      });
      return NextResponse.json({ error: '출금 신청에 실패했습니다' }, { status: 500 });
    }

    return NextResponse.json(
      {
        withdrawal,
        message: `${amount.toLocaleString()}원 출금 신청이 완료되었습니다. 영업일 기준 1-3일 내에 처리됩니다.`,
      },
      { status: 201 }
    );
  } catch (error) {
    logServerError(error instanceof Error ? error : new Error(String(error)), {
      context: 'helper_withdrawal_error',
    });
    return NextResponse.json({ error: '서버 오류가 발생했습니다' }, { status: 500 });
  }
}
