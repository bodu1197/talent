import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { logger } from '@/lib/logger'

// POST: 포트폴리오 등록
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { seller_id, title, description, category_id, thumbnail_url, image_urls, project_url, tags } = body

    if (!seller_id || !title || !description) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // seller 소유권 확인
    const { data: seller } = await supabase
      .from('sellers')
      .select('id')
      .eq('id', seller_id)
      .eq('user_id', user.id)
      .single()

    if (!seller) {
      return NextResponse.json({ error: 'Unauthorized seller' }, { status: 403 })
    }

    // 포트폴리오 생성
    const { data, error } = await supabase
      .from('seller_portfolio')
      .insert({
        seller_id,
        title,
        description,
        category_id,
        thumbnail_url,
        image_urls: image_urls || [],
        project_url,
        tags: tags || []
      })
      .select()
      .single()

    if (error) {
      logger.error('Portfolio creation error:', error)
      return NextResponse.json({ error: 'Failed to create portfolio' }, { status: 500 })
    }

    return NextResponse.json({ data }, { status: 201 })
  } catch (error) {
    logger.error('Portfolio POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
