import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { logger } from '@/lib/logger'

// DELETE: 포트폴리오 삭제
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const portfolioId = params.id

    // 포트폴리오 조회 및 소유권 확인
    const { data: portfolio } = await supabase
      .from('seller_portfolio')
      .select('seller_id')
      .eq('id', portfolioId)
      .single()

    if (!portfolio) {
      return NextResponse.json({ error: 'Portfolio not found' }, { status: 404 })
    }

    // seller 소유권 확인
    const { data: seller } = await supabase
      .from('sellers')
      .select('id')
      .eq('id', portfolio.seller_id)
      .eq('user_id', user.id)
      .single()

    if (!seller) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // 포트폴리오 삭제
    const { error } = await supabase
      .from('seller_portfolio')
      .delete()
      .eq('id', portfolioId)

    if (error) {
      logger.error('Portfolio delete error:', error)
      return NextResponse.json({ error: 'Failed to delete portfolio' }, { status: 500 })
    }

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    logger.error('Portfolio DELETE error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// GET: 포트폴리오 상세 조회
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const portfolioId = params.id

    const { data: portfolio, error } = await supabase
      .from('seller_portfolio')
      .select('*')
      .eq('id', portfolioId)
      .single()

    if (error || !portfolio) {
      return NextResponse.json({ error: 'Portfolio not found' }, { status: 404 })
    }

    return NextResponse.json({ data: portfolio }, { status: 200 })
  } catch (error) {
    logger.error('Portfolio GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
