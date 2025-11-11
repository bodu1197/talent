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

    // RPC 함수를 사용하여 auth.users에서 직접 확인
    // SECURITY DEFINER로 RLS 우회
    const { data: emailExists, error: rpcError } = await supabase
      .rpc('check_email_exists', { check_email: email })

    logger.debug('[Email Check API] RPC result:', {
      email,
      exists: emailExists,
      error: rpcError
    })

    if (rpcError) {
      logger.error('[Email Check API] RPC Error:', rpcError)
      return NextResponse.json(
        { error: 'Failed to check email' },
        { status: 500 }
      )
    }

    if (emailExists) {
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
