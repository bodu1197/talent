'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'

type UserProfile = {
  id: string
  email: string
  name: string
  phone?: string
  profile_image?: string
  bio?: string
  email_verified: boolean
  is_active: boolean
  created_at: string
  updated_at: string
  // 역할 확인
  is_buyer: boolean
  is_seller: boolean
}

interface AuthContextType {
  user: User | null
  profile: UserProfile | null
  loading: boolean
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  signOut: async () => {},
  refreshProfile: async () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  // 프로필 정보 가져오기 (users, buyers, sellers 테이블에서 조회)
  const fetchProfile = async (userId: string) => {
    try {
      console.log('🔍 [AuthProvider] Fetching profile for userId:', userId)

      // users 테이블에서 기본 정보 조회
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()

      if (userError) {
        console.error('❌ [AuthProvider] User fetch error:', userError)
        console.error('❌ Error details:', {
          code: userError.code,
          message: userError.message,
          details: userError.details,
          hint: userError.hint
        })
        return
      }

      // buyers 테이블 확인
      const { data: buyerData } = await supabase
        .from('buyers')
        .select('id')
        .eq('user_id', userId)
        .single()

      // sellers 테이블 확인
      const { data: sellerData } = await supabase
        .from('sellers')
        .select('id')
        .eq('user_id', userId)
        .single()

      const profileData = {
        ...userData,
        is_buyer: !!buyerData,
        is_seller: !!sellerData
      }

      console.log('✅ [AuthProvider] Profile loaded:', {
        id: profileData.id,
        is_buyer: profileData.is_buyer,
        is_seller: profileData.is_seller,
        email: profileData.email
      })
      setProfile(profileData)
    } catch (error) {
      // 네트워크 에러 등 - 기존 profile 유지하고 로그만 남김
      console.error('❌ [AuthProvider] 프로필 조회 실패:', error)
    }
  }

  // 프로필 새로고침
  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id)
    }
  }

  // 로그아웃
  const signOut = async () => {
    try {
      await supabase.auth.signOut()
      setUser(null)
      setProfile(null)
    } catch (error) {
      console.error('로그아웃 실패:', error)
    }
  }

  useEffect(() => {
    let mounted = true

    // 초기 세션 체크
    const checkSession = async () => {
      try {
        console.log('🔍 [AuthProvider] Checking session...')
        const { data: { session }, error } = await supabase.auth.getSession()

        // LockManager 오류는 무시하고 계속 진행
        if (error && !error.message?.includes('LockManager')) {
          console.error('❌ [AuthProvider] 세션 체크 실패:', error)
        }

        if (!mounted) return

        console.log('📝 [AuthProvider] Session status:', {
          hasSession: !!session,
          userId: session?.user?.id,
          email: session?.user?.email
        })

        setUser(session?.user ?? null)
        if (session?.user) {
          await fetchProfile(session.user.id)
        } else {
          console.log('⚠️ [AuthProvider] No session found - user not logged in')
        }
      } catch (error: any) {
        // LockManager 타임아웃 오류는 무시
        if (!error?.message?.includes('LockManager') && !error?.isAcquireTimeout) {
          console.error('❌ [AuthProvider] 세션 체크 실패:', error)
        }
      } finally {
        if (mounted) {
          console.log('✅ [AuthProvider] Loading complete. User:', !!session?.user)
          setLoading(false)
        }
      }
    }

    checkSession()

    // 인증 상태 변화 구독
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return

        console.log('🔄 [AuthProvider] Auth state changed:', {
          event,
          userId: session?.user?.id,
          email: session?.user?.email
        })

        setUser(session?.user ?? null)

        if (session?.user) {
          await fetchProfile(session.user.id)
        } else if (event === 'SIGNED_OUT') {
          // 명시적인 로그아웃일 때만 profile null 설정
          console.log('👋 [AuthProvider] User signed out - clearing profile')
          setProfile(null)
        }
      }
    )

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  return (
    <AuthContext.Provider value={{ user, profile, loading, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}