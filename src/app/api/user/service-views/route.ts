import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { logger } from '@/lib/logger'

// POST: 서비스 조회 기록 저장
export async function POST(request: NextRequest) {
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

    const body = await request.json()
    const { serviceId } = body

    if (!serviceId) {
      return NextResponse.json(
        { error: 'Missing serviceId' },
        { status: 400 }
      )
    }

    // UPSERT: 이미 있으면 viewed_at 업데이트, 없으면 새로 삽입
    const { error } = await supabase
      .from('service_views')
      .upsert({
        user_id: user.id,
        service_id: serviceId,
        viewed_at: new Date().toISOString()
      }, {
        onConflict: 'user_id,service_id'
      })

    if (error) {
      logger.error('Service view insert error:', error)
      return NextResponse.json(
        { error: 'Failed to track service view' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { message: 'Service view tracked successfully' },
      { status: 200 }
    )

  } catch (error) {
    logger.error('Service view API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET: 최근 본 서비스 조회
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '20')

    const { data, error } = await supabase
      .from('service_views')
      .select(`
        service_id,
        viewed_at,
        service:services(
          *,
          seller:sellers(
            id,
            business_name,
            display_name,
            is_verified
          ),
          service_categories(
            category:categories(id, name, slug)
          )
        )
      `)
      .eq('user_id', user.id)
      .order('viewed_at', { ascending: false })
      .limit(limit)

    if (error) {
      logger.error('Service views fetch error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch service views' },
        { status: 500 }
      )
    }

    return NextResponse.json({ data }, { status: 200 })

  } catch (error) {
    logger.error('Service views GET error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
