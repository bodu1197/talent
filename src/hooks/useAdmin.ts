'use client'

import { useEffect, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/providers/AuthProvider'
import { createClient } from '@/lib/supabase/client'

export function useAdmin() {
  const { user, loading: authLoading } = useAuth()
  const [isAdmin, setIsAdmin] = useState(false)
  const [adminData, setAdminData] = useState<any>(null)
  const [checking, setChecking] = useState(true)
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])

  useEffect(() => {
    let mounted = true

    async function checkAdmin() {
      // 인증 로딩 중이면 대기
      if (authLoading) {
        return
      }

      // 로그인하지 않은 경우
      if (!user) {
        if (mounted) {
          setIsAdmin(false)
          setAdminData(null)
          setChecking(false)
          router.replace('/auth/login')
        }
        return
      }

      try {
        const { data, error } = await supabase
          .from('admins')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle()

        if (!mounted) return

        if (error || !data) {
          // 관리자가 아닌 경우
          setIsAdmin(false)
          setAdminData(null)
          setChecking(false)
          router.replace('/')
          return
        }

        // 관리자인 경우
        setIsAdmin(true)
        setAdminData(data)
        setChecking(false)
      } catch (error) {
        console.error('Admin check error:', error)
        if (mounted) {
          setIsAdmin(false)
          setAdminData(null)
          setChecking(false)
          router.replace('/')
        }
      }
    }

    checkAdmin()

    return () => {
      mounted = false
    }
  }, [user, authLoading, router, supabase])

  return {
    isAdmin,
    adminData,
    loading: authLoading || checking,
    user,
  }
}

export function useAdminAuth() {
  const { isAdmin, adminData, loading, user } = useAdmin()

  if (loading) {
    return { isAdmin: false, adminData: null, loading: true, user: null }
  }

  if (!isAdmin) {
    return { isAdmin: false, adminData: null, loading: false, user: null }
  }

  return { isAdmin: true, adminData, loading: false, user }
}
