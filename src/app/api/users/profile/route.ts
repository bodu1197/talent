import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// 프로필 업데이트 API
export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, profile_image } = body

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    }

    // 서버 측에서 업데이트 (Service Role 사용으로 RLS 우회)
    const { data, error } = await supabase
      .from('users')
      .update({
        name,
        profile_image: profile_image || null,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id)
      .select()
      .single()

    if (error) {
      console.error('Profile update error:', error)
      return NextResponse.json({
        error: error.message,
        code: error.code,
        details: error.details
      }, { status: 500 })
    }

    return NextResponse.json({ user: data })
  } catch (error: any) {
    console.error('Profile update API error:', error)
    return NextResponse.json({
      error: 'Internal server error',
      message: error.message
    }, { status: 500 })
  }
}
