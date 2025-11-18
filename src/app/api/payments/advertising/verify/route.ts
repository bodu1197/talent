import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 })
    }

    const body = await request.json()
    const { imp_uid, merchant_uid, amount, bonus } = body

    // 입력 검증
    if (!imp_uid || !merchant_uid || !amount) {
      return NextResponse.json({ error: '필수 정보가 누락되었습니다' }, { status: 400 })
    }

    // TODO: 실제 PortOne API로 결제 검증
    // const portOneResponse = await fetch(`https://api.portone.io/payments/${imp_uid}`, {
    //   headers: { 'Authorization': `PortOne ${process.env.PORTONE_API_SECRET}` }
    // })

    // 크레딧 조회 또는 생성
    const { data: existingCredit } = await supabase
      .from('advertising_credits')
      .select('*')
      .eq('seller_id', user.id)
      .single()

    if (existingCredit) {
      // 기존 크레딧에 추가
      const { error: updateError } = await supabase
        .from('advertising_credits')
        .update({
          amount: existingCredit.amount + amount + (bonus || 0),
          updated_at: new Date().toISOString()
        })
        .eq('seller_id', user.id)

      if (updateError) {
        console.error('Credit update error:', updateError)
        return NextResponse.json({ error: '크레딧 업데이트 실패' }, { status: 500 })
      }
    } else {
      // 새 크레딧 레코드 생성
      const { error: insertError } = await supabase
        .from('advertising_credits')
        .insert({
          seller_id: user.id,
          amount: amount + (bonus || 0),
          used_amount: 0
        })

      if (insertError) {
        console.error('Credit insert error:', insertError)
        return NextResponse.json({ error: '크레딧 생성 실패' }, { status: 500 })
      }
    }

    // 결제 내역 기록
    await supabase
      .from('advertising_payments')
      .insert({
        seller_id: user.id,
        amount: amount,
        bonus_amount: bonus || 0,
        payment_method: 'card',
        imp_uid: imp_uid,
        merchant_uid: merchant_uid,
        status: 'completed'
      })

    return NextResponse.json({
      success: true,
      total_credited: amount + (bonus || 0)
    })
  } catch (error) {
    console.error('Advertising payment verify error:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2))
    return NextResponse.json({ error: '서버 오류가 발생했습니다' }, { status: 500 })
  }
}
