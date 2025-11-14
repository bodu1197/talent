import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { withAuth } from '@/lib/api/auth-middleware'
import { ApiError, handleApiError } from '@/lib/api/error-handler'

// GET /api/orders/seller - 판매자 주문 목록 조회
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
        buyer:users!buyer_id(id, name, profile_image)
      `)
      .eq('seller_id', user.id)
      .order('created_at', { ascending: false })

    if (status && status !== 'all') {
      query = query.eq('status', status)
    }

    const { data, error } = await query

    if (error) {
      throw new ApiError('주문 목록을 불러올 수 없습니다', 500)
    }

    // N+1 쿼리 문제 해결: 모든 주문의 revision stats를 한 번에 조회
    if (data && data.length > 0) {
      const orderIds = data.map(order => order.id)
      const { data: revisionStats } = await supabase
        .from('order_revision_stats')
        .select('order_id, total_revisions, pending_revisions')
        .in('order_id', orderIds)

      // revision stats를 맵으로 변환
      const statsMap = new Map()
      revisionStats?.forEach(stat => {
        statsMap.set(stat.order_id, stat)
      })

      // 주문 데이터에 revision 정보 병합
      const ordersWithRevisionCount = data.map(order => {
        const stats = statsMap.get(order.id)
        return {
          ...order,
          revision_count: stats?.total_revisions || 0,
          pending_revision_count: stats?.pending_revisions || 0
        }
      })

      return NextResponse.json({ orders: ordersWithRevisionCount })
    }

    return NextResponse.json({ orders: [] })
  } catch (error) {
    return handleApiError(error)
  }
})
