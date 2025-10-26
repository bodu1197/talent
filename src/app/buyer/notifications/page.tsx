'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/components/providers/AuthProvider'
import { createClient } from '@/lib/supabase/client'

export default function BuyerNotificationsPage() {
  const { user } = useAuth()
  const supabase = createClient()

  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (user?.id) {
      supabase.from('users').update({ last_mode: 'buyer' }).eq('id', user.id)
      setIsLoading(false)
    }
  }, [user])

  return (
    <div className="py-8">
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">알림</h1>
          <p className="text-gray-600">주문 상태 변경 및 중요 알림을 확인하세요.</p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#0f3460]"></div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-bell text-gray-400 text-2xl"></i>
            </div>
            <h3 className="text-lg font-semibold mb-2">알림 기능 준비중</h3>
            <p className="text-gray-600">실시간 알림 기능이 곧 제공될 예정입니다.</p>
          </div>
        )}
      </div>
    </div>
  )
}
