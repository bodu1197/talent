import { createClient } from '@/lib/supabase/client'

// 구매자 견적 요청 목록 조회
export async function getBuyerQuotes(userId: string) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('quotes')
    .select(`
      *,
      category:categories(id, name),
      quote_responses(count)
    `)
    .eq('buyer_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error

  // response_count 추가
  return data.map(quote => ({
    ...quote,
    responseCount: quote.quote_responses[0]?.count || 0
  }))
}

// 판매자가 볼 수 있는 견적 요청 목록
export async function getSellerQuotes(limit: number = 20) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('quotes')
    .select(`
      *,
      buyer:users!buyer_id(id, name),
      category:categories(id, name)
    `)
    .eq('status', 'pending')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) throw error
  return data
}

// 견적 답변 조회
export async function getQuoteResponses(quoteId: string) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('quote_responses')
    .select(`
      *,
      seller:users!seller_id(id, name, profile_image)
    `)
    .eq('quote_id', quoteId)
    .order('created_at', { ascending: false})

  if (error) throw error
  return data
}
