import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// POST /api/orders/[id]/revision - 수정 요청
export async function POST(
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

    const { reason } = await request.json()

    if (!reason || reason.trim() === '') {
      return NextResponse.json({ error: '수정 요청 사유가 필요합니다' }, { status: 400 })
    }

    // 주문 조회 및 권한 확인
    const { data: order, error: fetchError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', id)
      .single()

    if (fetchError || !order) {
      return NextResponse.json({ error: '주문을 찾을 수 없습니다' }, { status: 404 })
    }

    // 구매자만 수정 요청 가능
    if (order.buyer_id !== user.id) {
      return NextResponse.json({ error: '권한이 없습니다' }, { status: 403 })
    }

    // 상태를 다시 'in_progress'로 변경
    const { error: updateError } = await supabase
      .from('orders')
      .update({
        status: 'in_progress',
        revision_reason: reason,
        revision_requested_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', id)

    if (updateError) {
      console.error('Revision request error:', updateError)
      return NextResponse.json({ error: '수정 요청에 실패했습니다' }, { status: 500 })
    }

    // TODO: 판매자에게 알림 전송

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Revision request API error:', error)
    return NextResponse.json({ error: '서버 오류가 발생했습니다' }, { status: 500 })
  }
}
