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

    // Service Role Key 확인
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Missing environment variables:', {
        hasUrl: !!supabaseUrl,
        hasServiceKey: !!supabaseServiceKey
      })
      return NextResponse.json({
        error: 'Server configuration error',
        details: 'Missing required environment variables'
      }, { status: 500 })
    }

    // Service Role 클라이언트 직접 생성 (서버리스 환경 대응)
    const serviceClient = createServiceClient(supabaseUrl, supabaseServiceKey)

    // 서버 측에서 업데이트 (Service Role 사용으로 RLS 우회)
    const { data, error } = await serviceClient
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
