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
    console.log('[AuthProvider] fetchProfile called for user:', userId)
    try {
      // users 테이블에서 기본 정보 조회
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()

      if (userError) {
        console.error('[AuthProvider] User fetch error:', userError)
        // 에러 발생 시 기본 프로필 설정
        setProfile({
          id: userId,
          email: '',
          name: 'User',
          email_verified: false,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          is_buyer: true,
          is_seller: false
        })
        console.log('[AuthProvider] Set fallback profile due to error')
        return
      }

      // buyers 테이블 확인
      let isBuyer = false
      const { data: buyerData } = await supabase
        .from('buyers')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle()
      isBuyer = !!buyerData

      // sellers 테이블 확인
      let isSeller = false
      const { data: sellerData } = await supabase
        .from('sellers')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle()
      isSeller = !!sellerData

      const profileData = {
        ...userData,
        is_buyer: isBuyer,
        is_seller: isSeller
      }

      console.log('[AuthProvider] Profile loaded successfully:', { isBuyer, isSeller })
      setProfile(profileData)
    } catch (error: any) {
      console.error('[AuthProvider] Profile fetch error:', error)

      // 에러 시 fallback 프로필 설정
      setProfile({
        id: userId,
        email: '',
        name: 'User',
        email_verified: false,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        is_buyer: true,
        is_seller: false
      })
      console.log('[AuthProvider] Set fallback profile due to exception')
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

    // 초기 세션 체크 - 단순화
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()

        if (!mounted) return

        setUser(session?.user ?? null)
        setLoading(false)

        // 프로필은 필요할 때만 백그라운드에서 로드 (에러 무시)
        if (session?.user) {
          fetchProfile(session.user.id).catch(() => {
            // 프로필 로딩 실패해도 무시 (user만 있으면 됨)
          })
        } else {
          setProfile(null)
        }
      } catch (error) {
        // 에러 무시하고 loading만 false로
        if (mounted) {
          setLoading(false)
        }
      }
    }

    checkSession()

    // 인증 상태 변화 구독
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return
        if (event === 'INITIAL_SESSION') return

        setUser(session?.user ?? null)

        if (session?.user) {
          fetchProfile(session.user.id).catch(() => {})
        } else {
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