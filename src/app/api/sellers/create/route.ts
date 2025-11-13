import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // 인증 확인
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json(
        { error: '로그인이 필요합니다' },
        { status: 401 }
      )
    }

    // 요청 데이터
    const body = await request.json()
    const { businessName, description, category, verifiedName, verifiedPhone } = body

    if (!businessName) {
      return NextResponse.json(
        { error: '판매자명은 필수입니다' },
        { status: 400 }
      )
    }

    // 이미 판매자인지 확인
    const { data: existingSeller } = await supabase
      .from('sellers')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle()

    if (existingSeller) {
      return NextResponse.json(
        { error: '이미 판매자로 등록되어 있습니다' },
        { status: 400 }
      )
    }

    // sellers 레코드 생성
    const { data: seller, error: sellerError } = await supabase
      .from('sellers')
      .insert({
        user_id: user.id,
        business_name: businessName,
        description: description || null,
        category: category || null,
        verified: true,  // 본인인증 완료
        verified_at: new Date().toISOString(),
        verified_name: verifiedName || null,
        verified_phone: verifiedPhone || null,
      })
      .select('id')
      .single()

    if (sellerError) {
      throw sellerError
    }

    return NextResponse.json({
      success: true,
      seller,
    })
  } catch (error: unknown) {
    console.error('판매자 생성 오류:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '판매자 생성에 실패했습니다' },
      { status: 500 }
    )
  }
}
