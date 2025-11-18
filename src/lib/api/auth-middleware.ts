import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { User } from '@supabase/supabase-js'

/**
 * API 라우트 인증 미들웨어
 *
 * 사용 예시:
 * ```typescript
 * export const GET = withAuth(async (req, user) => {
 *   // user는 이미 인증된 상태
 *   const supabase = await createClient()
 *   // 비즈니스 로직...
 *   return NextResponse.json({ data })
 * })
 * ```
 */
export function withAuth(
  handler: (req: NextRequest, user: User) => Promise<NextResponse>
) {
  return async (req: NextRequest): Promise<NextResponse> => {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: '인증이 필요합니다' },
        { status: 401 }
      )
    }

    return handler(req, user)
  }
}

/**
 * 선택적 인증 미들웨어 (인증되지 않아도 계속 진행)
 *
 * 사용 예시:
 * ```typescript
 * export const GET = withOptionalAuth(async (req, user) => {
 *   // user는 null일 수 있음
 *   if (user) {
 *     // 인증된 사용자용 로직
 *   } else {
 *     // 게스트용 로직
 *   }
 * })
 * ```
 */
export function withOptionalAuth(
  handler: (req: NextRequest, user: User | null) => Promise<NextResponse>
) {
  return async (req: NextRequest): Promise<NextResponse> => {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    return handler(req, user)
  }
}
