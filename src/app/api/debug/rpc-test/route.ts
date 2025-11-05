import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()

    // 1. 인증 확인
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({
        success: false,
        error: 'Not authenticated',
        authError: authError?.message
      }, { status: 401 })
    }

    // 2. RPC 함수 직접 호출
    const { data: rpcData, error: rpcError } = await supabase
      .rpc('get_recent_category_visits', {
        p_user_id: user.id,
        p_days: 30,
        p_limit: 10
      })

    // 3. category_visits 테이블 직접 조회
    const { data: directData, error: directError } = await supabase
      .from('category_visits')
      .select('*')
      .eq('user_id', user.id)
      .order('visited_at', { ascending: false })
      .limit(10)

    return NextResponse.json({
      success: true,
      userId: user.id,
      rpc: {
        data: rpcData,
        error: rpcError,
        count: rpcData?.length || 0
      },
      direct: {
        data: directData,
        error: directError,
        count: directData?.length || 0
      }
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}
