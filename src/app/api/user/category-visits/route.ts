import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { logger } from '@/lib/logger'

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

    // 4. UPSERT: 같은 날 같은 카테고리 방문 시 visited_at만 업데이트
    // 복합 유니크 인덱스 (user_id, category_id, visited_date)를 활용
    const { data, error } = await supabase
      .from('category_visits')
      .upsert({
        user_id: user.id,
        category_id: categoryId,
        category_name: categoryName,
        category_slug: categorySlug,
        visited_at: new Date().toISOString()
      }, {
        onConflict: 'user_id,category_id,visited_date',
        ignoreDuplicates: false
      })
      .select()
      .single()

    if (error) {
      logger.error('Category visit upsert error:', error)
      return NextResponse.json(
        { error: 'Failed to track category visit' },
        { status: 500 }
      )
    }

    // 5. 성공
    return NextResponse.json(
      { message: 'Category visit tracked successfully', data },
      { status: 200 }
    )

  } catch (error) {
    logger.error('Category visit API error:', error)
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
      logger.error('Category visits fetch error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch category visits' },
        { status: 500 }
      )
    }

    return NextResponse.json({ data }, { status: 200 })

  } catch (error) {
    logger.error('Category visits GET error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
