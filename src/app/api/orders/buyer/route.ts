import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET /api/orders/buyer - 구매자 주문 목록 조회
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    // 사용자 인증 확인
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 })
    }

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
      console.error('Orders fetch error:', error instanceof Error ? error.message : String(error))
      return NextResponse.json({ error: '주문 목록을 불러올 수 없습니다' }, { status: 500 })
    }

    return NextResponse.json({ orders: data })
  } catch (error) {
    console.error('Buyer orders API error:', error instanceof Error ? error.message : String(error))
    return NextResponse.json({ error: '서버 오류가 발생했습니다' }, { status: 500 })
  }
}
