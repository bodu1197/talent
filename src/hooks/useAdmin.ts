'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/providers/AuthProvider'
import { createClient } from '@/lib/supabase/client'

export function useAdmin() {
  const { user, loading: authLoading } = useAuth()
  const [isAdmin, setIsAdmin] = useState(false)
  const [adminData, setAdminData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function checkAdmin() {
      // 로딩 시작은 바로
      if (!user && !authLoading) {
        setLoading(false)
        router.push('/auth/login')
        return
      }

      if (authLoading || !user) {
        return
      }

      try {
        const { data, error } = await supabase
          .from('admins')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle() // single() 대신 maybeSingle() 사용하여 에러 방지

        if (error || !data) {
          // Not an admin, redirect to home
          setLoading(false)
          router.push('/')
          return
        }

        setIsAdmin(true)
        setAdminData(data)
        setLoading(false)
      } catch (error) {
        console.error('Admin check error:', error)
        setLoading(false)
        router.push('/')
      }
    }

    checkAdmin()
  }, [user, authLoading, router, supabase])

  return {
    isAdmin,
    adminData,
    loading: authLoading || loading,
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
