import { createClient } from '@/lib/supabase/client'

// 사용자 보유 쿠폰 조회
export async function getUserCoupons(userId: string) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('user_coupons')
    .select(`
      *,
      coupon:coupons(
        id,
        code,
        name,
        description,
        discount_type,
        discount_value,
        max_discount,
        min_amount
      )
    `)
    .eq('user_id', userId)
    .eq('is_used', false)
    .gte('expires_at', new Date().toISOString())
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

// 사용자 캐시 잔액 조회
export async function getUserWallet(userId: string) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('user_wallets')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (error) {
    // 지갑이 없으면 생성
    if (error.code === 'PGRST116') {
      const { data: newWallet, error: createError } = await supabase
        .from('user_wallets')
        .insert({ user_id: userId, balance: 0 })
        .select()
        .single()

      if (createError) throw createError
      return newWallet
    }
    throw error
  }
  return data
}

// 쿠폰 사용 내역 조회
export async function getCouponUsageHistory(userId: string) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('user_coupons')
    .select(`
      *,
      coupon:coupons(
        id,
        code,
        name,
        discount_type,
        discount_value
      ),
      order:orders(
        id,
        order_number,
        total_amount,
        service:services(id, title)
      )
    `)
    .eq('user_id', userId)
    .eq('is_used', true)
    .order('used_at', { ascending: false })

  if (error) throw error
  return data
}

// 캐시 거래 내역 조회
export async function getWalletTransactions(userId: string, limit: number = 20) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('wallet_transactions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) throw error
  return data
}
