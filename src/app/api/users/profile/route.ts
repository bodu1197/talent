import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'

// 프로필 업데이트 API
export async function PATCH(request: NextRequest) {
  try {
    // 먼저 일반 클라이언트로 사용자 인증 확인
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

    // Service Role 클라이언트 생성 (RLS 우회)
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
    const serviceClient = createServiceClient(supabaseUrl, supabaseServiceKey)

    // Update profiles table (unified source)
    const { data, error } = await serviceClient
      .from('profiles')
      .update({
        name,
        profile_image: profile_image || null,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      console.error('Profile update error:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2))
      return NextResponse.json({
        error: error.message,
        code: error.code,
        details: error.details
      }, { status: 500 })
    }

    return NextResponse.json({ user: data })
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error('Profile update API error:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2))
    return NextResponse.json({
      error: 'Internal server error',
      message: errorMessage
    }, { status: 500 })
  }
}
