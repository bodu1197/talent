import { createClient } from '@/lib/supabase/server';

// 전문가 수익 현황 조회
export async function getSellerEarnings(sellerId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('seller_earnings')
    .select('*')
    .eq('seller_id', sellerId)
    .single();

  if (error) {
    // 수익 레코드가 없으면 생성
    if (error.code === 'PGRST116') {
      const { data: newEarnings, error: createError } = await supabase
        .from('seller_earnings')
        .insert({
          seller_id: sellerId,
          available_balance: 0,
          pending_balance: 0,
          total_withdrawn: 0,
          total_earned: 0,
        })
        .select()
        .single();

      if (createError) throw createError;
      return newEarnings;
    }
    throw error;
  }

  return data;
}

// 수익 거래 내역 조회
export async function getEarningsTransactions(sellerId: string, limit: number = 20) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('earnings_transactions')
    .select(
      `
      *,
      order:orders(id, order_number, title)
    `
    )
    .eq('seller_id', sellerId)
    .order('transaction_date', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data;
}

// 출금 요청 내역 조회
export async function getWithdrawalHistory(sellerId: string, limit: number = 20) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('withdrawal_requests')
    .select('*')
    .eq('seller_id', sellerId)
    .order('requested_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data;
}

// 출금 요청 생성
export async function createWithdrawalRequest(
  sellerId: string,
  amount: number,
  bankName: string,
  accountNumber: string,
  accountHolder: string
) {
  const supabase = await createClient();

  // 출금 가능 금액 확인
  const earnings = await getSellerEarnings(sellerId);
  if (earnings.available_balance < amount) {
    throw new Error('출금 가능 금액이 부족합니다');
  }

  // 출금 요청 생성
  const { data, error } = await supabase
    .from('withdrawal_requests')
    .insert({
      seller_id: sellerId,
      amount,
      bank_name: bankName,
      account_number: accountNumber,
      account_holder: accountHolder,
      status: 'pending',
    })
    .select()
    .single();

  if (error) throw error;

  // 출금 가능 금액에서 차감
  await supabase
    .from('seller_earnings')
    .update({
      available_balance: earnings.available_balance - amount,
    })
    .eq('seller_id', sellerId);

  return data;
}

// 전문가 포트폴리오 조회
export async function getSellerPortfolio(sellerId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('seller_portfolio')
    .select(
      `
      *,
      service:services(id, title, thumbnail_url)
    `
    )
    .eq('seller_id', sellerId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

// 포트폴리오 아이템 생성
export async function createPortfolioItem(
  sellerId: string,
  title: string,
  description: string,
  thumbnailUrl?: string,
  images?: string[]
) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('portfolio_items')
    .insert({
      seller_id: sellerId,
      title,
      description,
      thumbnail_url: thumbnailUrl,
      images,
      is_visible: true,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

// 포트폴리오 아이템 수정
export async function updatePortfolioItem(
  itemId: string,
  updates: {
    title?: string;
    description?: string;
    thumbnail_url?: string;
    images?: string[];
    is_visible?: boolean;
  }
) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('portfolio_items')
    .update(updates)
    .eq('id', itemId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// 포트폴리오 아이템 삭제
export async function deletePortfolioItem(itemId: string) {
  const supabase = await createClient();

  const { error } = await supabase.from('portfolio_items').delete().eq('id', itemId);

  if (error) throw error;
}

// 포트폴리오 조회수 증가
export async function incrementPortfolioViewCount(itemId: string) {
  const supabase = await createClient();

  const { error } = await supabase.rpc('increment_portfolio_views', {
    portfolio_id: itemId,
  });

  if (error) {
    // RPC 함수가 없으면 직접 업데이트
    const { data: item } = await supabase
      .from('portfolio_items')
      .select('view_count')
      .eq('id', itemId)
      .single();

    if (item) {
      await supabase
        .from('portfolio_items')
        .update({ view_count: (item.view_count || 0) + 1 })
        .eq('id', itemId);
    }
  }
}
