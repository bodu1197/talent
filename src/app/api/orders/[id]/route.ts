import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET /api/orders/[id] - 주문 상세 조회
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()

    // 사용자 인증 확인
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 })
    }

    // 주문 조회
    const { data: order, error } = await supabase
      .from('orders')
      .select(`
        *,
        service:services(id, title, thumbnail_url, seller_id),
        buyer:users!buyer_id(id, name, email, profile_image),
        seller:users!seller_id(id, name, email, profile_image)
      `)
      .eq('id', id)
      .single()

    if (error) {
      console.error('Order fetch error:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2))
      return NextResponse.json({ error: '주문을 찾을 수 없습니다' }, { status: 404 })
    }

    // 권한 확인 (구매자 또는 판매자만 조회 가능)
    if (order.buyer_id !== user.id && order.seller_id !== user.id) {
      return NextResponse.json({ error: '권한이 없습니다' }, { status: 403 })
    }

    // Supabase 관계 조회가 배열로 반환되는 경우 처리
    if (Array.isArray(order.seller) && order.seller.length > 0) {
      order.seller = order.seller[0]
    }
    if (Array.isArray(order.buyer) && order.buyer.length > 0) {
      order.buyer = order.buyer[0]
    }
    if (Array.isArray(order.service) && order.service.length > 0) {
      order.service = order.service[0]
    }


    return NextResponse.json({ order })
  } catch (error) {
    console.error('Order API error:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2))
    return NextResponse.json({ error: '서버 오류가 발생했습니다' }, { status: 500 })
  }
}
