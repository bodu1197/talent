import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { checkAdminAuth } from '@/lib/admin/auth';
import { logger } from '@/lib/logger';

// GET - 크레딧 목록 조회
export async function GET(request: NextRequest) {
  try {
    const adminCheck = await checkAdminAuth();
    if (!adminCheck.isAdmin) {
      return NextResponse.json(
        { error: adminCheck.error },
        { status: adminCheck.error === 'Unauthorized' ? 401 : 403 }
      );
    }

    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const sellerId = searchParams.get('sellerId');

    if (sellerId) {
      // 특정 전문가의 크레딧 상세 정보
      const { data: credit, error: creditError } = await supabase
        .from('advertising_credits')
        .select(
          `
          *,
          seller:users!advertising_credits_seller_id_fkey(email, full_name)
        `
        )
        .eq('seller_id', sellerId)
        .single();

      if (creditError && creditError.code !== 'PGRST116') throw creditError;

      // 거래 내역
      const { data: transactions, error: txError } = await supabase
        .from('credit_transactions')
        .select('*')
        .eq('seller_id', sellerId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (txError) throw txError;

      return NextResponse.json({
        credit,
        transactions,
      });
    }

    // 전체 크레딧 목록
    const { data: credits, error: creditsError } = await supabase
      .from('advertising_credits')
      .select(
        `
        *,
        seller:users!advertising_credits_seller_id_fkey(email, full_name)
      `
      )
      .order('created_at', { ascending: false });

    if (creditsError) throw creditsError;

    // 통계
    const totalIssued = credits?.reduce((sum, c) => sum + (c.initial_amount || 0), 0) || 0;
    const totalUsed = credits?.reduce((sum, c) => sum + (c.used_amount || 0), 0) || 0;
    const totalRemaining = credits?.reduce((sum, c) => sum + (c.amount || 0), 0) || 0;

    return NextResponse.json({
      credits,
      summary: {
        totalIssued,
        totalUsed,
        totalRemaining,
        totalHolders: credits?.length || 0,
      },
    });
  } catch (error) {
    logger.error('Failed to fetch credits:', error);
    return NextResponse.json({ error: 'Failed to fetch credits' }, { status: 500 });
  }
}

// POST - 크레딧 수동 지급
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
    const { sellerId, amount, description, promotionType } = body;

    if (!sellerId || !amount) {
      return NextResponse.json({ error: 'Seller ID and amount are required' }, { status: 400 });
    }

    // 기존 크레딧 조회
    const { data: existingCredit } = await supabase
      .from('advertising_credits')
      .select('*')
      .eq('seller_id', sellerId)
      .single();

    let creditId: string;

    if (existingCredit) {
      // 기존 크레딧 업데이트
      const newAmount = existingCredit.amount + amount;
      const { data: updatedCredit, error: updateError } = await supabase
        .from('advertising_credits')
        .update({
          amount: newAmount,
          initial_amount: existingCredit.initial_amount + amount,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingCredit.id)
        .select()
        .single();

      if (updateError) throw updateError;
      creditId = updatedCredit.id;
    } else {
      // 새 크레딧 생성
      const { data: newCredit, error: insertError } = await supabase
        .from('advertising_credits')
        .insert({
          seller_id: sellerId,
          amount,
          initial_amount: amount,
          used_amount: 0,
          promotion_type: promotionType || null,
          expires_at:
            promotionType === 'launch_promo'
              ? new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString()
              : null,
        })
        .select()
        .single();

      if (insertError) throw insertError;
      creditId = newCredit.id;
    }

    // 거래 내역 기록
    const { error: txError } = await supabase.from('credit_transactions').insert({
      credit_id: creditId,
      seller_id: sellerId,
      transaction_type: 'earned',
      amount,
      balance_after: (existingCredit?.amount || 0) + amount,
      description: description || '관리자 수동 지급',
      reference_type: 'promotion',
    });

    if (txError) throw txError;

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('Failed to grant credit:', error);
    return NextResponse.json({ error: 'Failed to grant credit' }, { status: 500 });
  }
}

// PATCH - 크레딧 수동 차감
export async function PATCH(request: NextRequest) {
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
    const { sellerId, amount, description } = body;

    if (!sellerId || !amount) {
      return NextResponse.json({ error: 'Seller ID and amount are required' }, { status: 400 });
    }

    // 기존 크레딧 조회
    const { data: credit, error: creditError } = await supabase
      .from('advertising_credits')
      .select('*')
      .eq('seller_id', sellerId)
      .single();

    if (creditError || !credit) {
      return NextResponse.json({ error: 'Credit not found' }, { status: 404 });
    }

    if (credit.amount < amount) {
      return NextResponse.json({ error: 'Insufficient credit balance' }, { status: 400 });
    }

    // 크레딧 차감
    const newAmount = credit.amount - amount;
    const { error: updateError } = await supabase
      .from('advertising_credits')
      .update({
        amount: newAmount,
        used_amount: credit.used_amount + amount,
        updated_at: new Date().toISOString(),
      })
      .eq('id', credit.id);

    if (updateError) throw updateError;

    // 거래 내역 기록
    const { error: txError } = await supabase.from('credit_transactions').insert({
      credit_id: credit.id,
      seller_id: sellerId,
      transaction_type: 'spent',
      amount: -amount,
      balance_after: newAmount,
      description: description || '관리자 수동 차감',
    });

    if (txError) throw txError;

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('Failed to deduct credit:', error);
    return NextResponse.json({ error: 'Failed to deduct credit' }, { status: 500 });
  }
}
