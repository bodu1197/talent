import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { withAuth } from '@/lib/api/auth-middleware'
import { ApiError, handleApiError } from '@/lib/api/error-handler'

// GET /api/orders/buyer - 구매자 주문 목록 조회
export const GET = withAuth(async (request: NextRequest, user) => {
  try {
    const supabase = await createClient()

    // URL 파라미터에서 status 가져오기
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')

    // 주문 목록 조회
    let query = supabase
      .from('orders')
      .select(`
        *,
        service:services(id, title, thumbnail_url),
        seller:users!seller_id(id, name, profile_image)
      `)
      .eq('buyer_id', user.id)
      .order('created_at', { ascending: false })

    if (status && status !== 'all') {
      query = query.eq('status', status)
    }

    const { data, error } = await query

    if (error) {
      throw new ApiError('주문 목록을 불러올 수 없습니다', 500)
    }

    return NextResponse.json({ orders: data })
  } catch (error) {
    return handleApiError(error)
  }
})
