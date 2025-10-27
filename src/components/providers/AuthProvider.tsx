'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'

type BuyerProfile = {
  id: string
  email: string
  name: string
  phone?: string
  profile_image?: string
  bio?: string
  last_mode: 'buyer' | 'seller'
  created_at: string
  updated_at: string
}

type SellerProfile = {
  id: string
  email: string
  name: string
  phone?: string
  profile_image?: string
  bio?: string
  business_name?: string
  business_number?: string
  is_verified: boolean
  verification_status: string
  last_mode: 'buyer' | 'seller'
  created_at: string
  updated_at: string
}

type UserProfile = {
  buyer: BuyerProfile | null
  seller: SellerProfile | null
  isBuyer: boolean
  isSeller: boolean
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

  // 프로필 정보 가져오기 (buyers와 sellers 테이블 모두 확인)
  const fetchProfile = async (userId: string) => {
    try {
      // 구매자 프로필 조회
      const { data: buyerData, error: buyerError } = await supabase
        .from('buyers')
        .select('*')
        .eq('id', userId)
        .single()

      // 판매자 프로필 조회
      const { data: sellerData, error: sellerError } = await supabase
        .from('sellers')
        .select('*')
        .eq('id', userId)
        .single()

      // 둘 다 없으면 에러
      if (buyerError && sellerError) {
        console.error('Profile fetch error:', buyerError, sellerError)
        throw new Error('프로필을 찾을 수 없습니다')
      }

      // UserProfile 객체 생성
      const userProfile: UserProfile = {
        buyer: buyerData || null,
        seller: sellerData || null,
        isBuyer: !!buyerData,
        isSeller: !!sellerData,
      }

      setProfile(userProfile)
    } catch (error) {
      console.error('프로필 조회 실패:', error)
      setProfile(null)
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
    // 초기 세션 체크
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        setUser(session?.user ?? null)
        if (session?.user) {
          await fetchProfile(session.user.id)
        }
      } catch (error) {
        console.error('세션 체크 실패:', error)
      } finally {
        setLoading(false)
      }
    }

    checkSession()

    // 인증 상태 변화 구독
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null)

        if (session?.user) {
          await fetchProfile(session.user.id)
        } else {
          setProfile(null)
        }

        setLoading(false)
      }
    )

    return () => {
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