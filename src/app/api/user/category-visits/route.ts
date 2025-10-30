import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// GET: 사용자의 카테고리 방문 기록 조회
export async function GET(request: NextRequest) {
  try {
    // TODO: 실제 인증 구현 시 세션에서 userId 추출
    const userId = request.headers.get('x-user-id') || '00000000-0000-0000-0000-000000000000'

    const { data, error } = await supabase
      .from('category_visits')
      .select('*')
      .eq('user_id', userId)
      .order('last_visited_at', { ascending: false })
      .limit(10)

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      )
    }

    // 응답 형식 변환
    const formattedData = data.map(item => ({
      categoryId: item.category_id,
      categoryName: item.category_name,
      categorySlug: item.category_slug,
      visitCount: item.visit_count,
      lastVisitedAt: item.last_visited_at
    }))

    return NextResponse.json({
      success: true,
      data: formattedData
    })
  } catch (error) {
    console.error('Failed to fetch category visits:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch category visits' },
      { status: 500 }
    )
  }
}

// POST: 카테고리 방문 기록 저장
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { categoryId, categoryName, categorySlug } = body

    if (!categoryId || !categoryName) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // TODO: 실제 인증 구현 시 세션에서 userId 추출
    const userId = request.headers.get('x-user-id') || '00000000-0000-0000-0000-000000000000'

    // 기존 기록 확인
    const { data: existingVisit } = await supabase
      .from('category_visits')
      .select('*')
      .eq('user_id', userId)
      .eq('category_id', categoryId)
      .single()

    let result

    if (existingVisit) {
      // 기존 방문 기록 업데이트
      const { data, error } = await supabase
        .from('category_visits')
        .update({
          visit_count: existingVisit.visit_count + 1,
          last_visited_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .eq('category_id', categoryId)
        .select()
        .single()

      if (error) throw error
      result = data
    } else {
      // 새로운 방문 기록 생성
      const { data, error } = await supabase
        .from('category_visits')
        .insert({
          user_id: userId,
          category_id: categoryId,
          category_name: categoryName,
          category_slug: categorySlug,
          visit_count: 1,
          last_visited_at: new Date().toISOString()
        })
        .select()
        .single()

      if (error) throw error
      result = data
    }

    return NextResponse.json({
      success: true,
      data: {
        categoryId: result.category_id,
        categoryName: result.category_name,
        categorySlug: result.category_slug,
        visitCount: result.visit_count,
        lastVisitedAt: result.last_visited_at
      }
    })
  } catch (error: any) {
    console.error('Failed to save category visit:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to save category visit' },
      { status: 500 }
    )
  }
}
