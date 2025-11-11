import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

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

    // auth.users에서 이메일 확인
    // signInWithPassword를 시도하되, 실제로 로그인하지는 않음
    const { data: userData } = await supabase
      .from('users')
      .select('id, email')
      .eq('email', email)
      .maybeSingle()

    if (userData) {
      return NextResponse.json({
        available: false,
        message: '이미 사용 중인 이메일입니다'
      })
    }

    return NextResponse.json({
      available: true,
      message: '사용 가능한 이메일입니다'
    })
  } catch (error) {
    console.error('Email check error:', error)
    return NextResponse.json(
      { error: 'Failed to check email' },
      { status: 500 }
    )
  }
}
