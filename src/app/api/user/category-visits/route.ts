import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // 1. 인증 확인 (로그인 사용자만)
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized - 로그인이 필요합니다' },
        { status: 401 }
      )
    }

    // 2. 요청 바디 파싱
    const body = await request.json()
    const { categoryId, categoryName, categorySlug } = body

    // 3. 필수 필드 검증
    if (!categoryId || !categoryName || !categorySlug) {
      return NextResponse.json(
        { error: 'Missing required fields: categoryId, categoryName, categorySlug' },
        { status: 400 }
      )
    }

    // 4. 중복 체크: 오늘 이미 방문했는지 확인
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const { data: existingVisit } = await supabase
      .from('category_visits')
      .select('id')
      .eq('user_id', user.id)
      .eq('category_id', categoryId)
      .gte('visited_at', today.toISOString())
      .lt('visited_at', tomorrow.toISOString())
      .maybeSingle()

    // 5. 이미 오늘 방문한 경우 성공 응답 (중복 방지)
    if (existingVisit) {
      return NextResponse.json(
        { message: 'Already visited today', success: true },
        { status: 200 }
      )
    }

    // 6. 카테고리 방문 기록 삽입
    const { data, error } = await supabase
      .from('category_visits')
      .insert({
        user_id: user.id,
        category_id: categoryId,
        category_name: categoryName,
        category_slug: categorySlug
      })
      .select()
      .single()

    if (error) {
      console.error('Category visit insert error:', error)
      return NextResponse.json(
        { error: 'Failed to track category visit' },
        { status: 500 }
      )
    }

    // 7. 성공
    return NextResponse.json(
      { message: 'Category visit tracked successfully', data },
      { status: 201 }
    )

  } catch (error) {
    console.error('Category visit API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET: 사용자의 카테고리 방문 기록 조회 (선택 사항)
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    // 인증 확인
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // 최근 방문 기록 조회 (최근 30일)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const { data, error } = await supabase
      .from('category_visits')
      .select('*')
      .eq('user_id', user.id)
      .gte('visited_at', thirtyDaysAgo.toISOString())
      .order('visited_at', { ascending: false })
      .limit(50)

    if (error) {
      console.error('Category visits fetch error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch category visits' },
        { status: 500 }
      )
    }

    return NextResponse.json({ data }, { status: 200 })

  } catch (error) {
    console.error('Category visits GET error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
