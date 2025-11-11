import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { logger } from '@/lib/logger'

export async function POST(request: Request) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // users 테이블에서 이메일 확인
    const { data: userData, error: queryError, count } = await supabase
      .from('users')
      .select('id, email', { count: 'exact' })
      .eq('email', email)
      .limit(1)

    logger.debug('[Email Check API] Query result:', {
      email,
      hasData: !!userData,
      dataLength: userData?.length,
      count,
      error: queryError
    })

    // 에러가 있거나, 데이터가 존재하거나, count가 1 이상이면 이미 존재
    if (userData && userData.length > 0) {
      logger.debug('[Email Check API] Email taken:', email)
      return NextResponse.json({
        available: false,
        message: '이미 사용 중인 이메일입니다'
      })
    }

    logger.debug('[Email Check API] Email available:', email)
    return NextResponse.json({
      available: true,
      message: '사용 가능한 이메일입니다'
    })
  } catch (error) {
    logger.error('[Email Check API] Error:', error)
    return NextResponse.json(
      { error: 'Failed to check email' },
      { status: 500 }
    )
  }
}
