import { NextRequest, NextResponse } from 'next/server'

// 임시 메모리 저장소 (실제로는 DB 사용)
const categoryVisits: Record<string, any> = {}

// GET: 사용자의 카테고리 방문 기록 조회
export async function GET(request: NextRequest) {
  try {
    // TODO: 실제로는 세션/토큰에서 userId 추출
    const userId = request.headers.get('x-user-id') || 'guest'

    const userVisits = categoryVisits[userId] || {}

    // 최근 방문 순으로 정렬
    const sortedVisits = Object.values(userVisits)
      .sort((a: any, b: any) => new Date(b.lastVisitedAt).getTime() - new Date(a.lastVisitedAt).getTime())
      .slice(0, 10) // 최대 10개

    return NextResponse.json({
      success: true,
      data: sortedVisits
    })
  } catch (error) {
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

    // TODO: 실제로는 세션/토큰에서 userId 추출
    const userId = request.headers.get('x-user-id') || 'guest'

    if (!categoryVisits[userId]) {
      categoryVisits[userId] = {}
    }

    if (categoryVisits[userId][categoryId]) {
      // 기존 방문 기록 업데이트
      categoryVisits[userId][categoryId].visitCount++
      categoryVisits[userId][categoryId].lastVisitedAt = new Date().toISOString()
    } else {
      // 새로운 방문 기록 생성
      categoryVisits[userId][categoryId] = {
        categoryId,
        categoryName,
        categorySlug,
        visitCount: 1,
        lastVisitedAt: new Date().toISOString()
      }
    }

    return NextResponse.json({
      success: true,
      data: categoryVisits[userId][categoryId]
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to save category visit' },
      { status: 500 }
    )
  }
}
