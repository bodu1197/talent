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
      if (authLoading) return

      if (!user) {
        router.push('/auth/login')
        return
      }

      try {
        const { data, error } = await supabase
          .from('admins')
          .select('*')
          .eq('user_id', user.id)
          .single()

        if (error || !data) {
          // Not an admin, redirect to home
          router.push('/')
          return
        }

        setIsAdmin(true)
        setAdminData(data)
      } catch (error) {
        console.error('Admin check error:', error)
        router.push('/')
      } finally {
        setLoading(false)
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
