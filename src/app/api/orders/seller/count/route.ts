import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET /api/orders/seller/count - 판매자 주문 상태별 카운트
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    // 사용자 인증 확인
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 })
    }

    // 각 상태별 카운트 조회
    const [paidResult, inProgressResult, deliveredResult, completedResult, cancelledResult] = await Promise.all([
      supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('seller_id', user.id)
        .eq('status', 'paid'),
      supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('seller_id', user.id)
        .eq('status', 'in_progress'),
      supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('seller_id', user.id)
        .eq('status', 'delivered'),
      supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('seller_id', user.id)
        .eq('status', 'completed'),
      supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('seller_id', user.id)
        .eq('status', 'cancelled')
    ])

    const counts = {
      paid: paidResult.count || 0,
      in_progress: inProgressResult.count || 0,
      delivered: deliveredResult.count || 0,
      completed: completedResult.count || 0,
      cancelled: cancelledResult.count || 0,
      all: (paidResult.count || 0) + (inProgressResult.count || 0) + (deliveredResult.count || 0) + (completedResult.count || 0) + (cancelledResult.count || 0)
    }

    return NextResponse.json({ counts })
  } catch (error) {
    console.error('Seller orders count API error:', error)
    return NextResponse.json({ error: '서버 오류가 발생했습니다' }, { status: 500 })
  }
}
