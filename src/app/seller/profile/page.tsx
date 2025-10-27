'use client'

import { useState, useEffect, useMemo } from 'react'
import { useAuth } from '@/components/providers/AuthProvider'
import { createClient } from '@/lib/supabase/client'

export default function SellerProfilePage() {
  const { user, profile, refreshProfile } = useAuth()
  const supabase = useMemo(() => createClient(), [])

  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [formData, setFormData] = useState({
    business_name: '',
    description: '',
    phone: '',
    bank_name: '',
    account_number: '',
    account_holder: '',
  })

  useEffect(() => {
    if (user?.id) {
      supabase.from('sellers').update({ last_mode: 'seller' }).eq('id', user.id)
      fetchSellerProfile()
    }
  }, [user])

  const fetchSellerProfile = async () => {
    if (!user?.id) return

    try {
      const { data, error } = await supabase
        .from('seller_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (data) {
        setFormData({
          business_name: data.business_name || '',
          description: data.description || '',
          phone: profile?.phone || '',
          bank_name: data.bank_name || '',
          account_number: data.account_number || '',
          account_holder: data.account_holder || '',
        })
      }
    } catch (error) {
      console.error('판매자 프로필 조회 실패:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage(null)

    try {
      const { error } = await supabase
        .from('seller_profiles')
        .update({
          business_name: formData.business_name,
          description: formData.description,
          bank_name: formData.bank_name,
          account_number: formData.account_number,
          account_holder: formData.account_holder,
        })
        .eq('user_id', user?.id)

      if (error) throw error

      // 전화번호는 users 테이블에 업데이트
      await supabase
        .from('users')
        .update({ phone: formData.phone })
        .eq('id', user?.id)

      await refreshProfile()
      setMessage({ type: 'success', text: '프로필이 업데이트되었습니다.' })
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || '프로필 업데이트 중 오류가 발생했습니다.' })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="py-8">
      <div className="max-w-4xl mx-auto px-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">판매자 프로필 설정</h1>
          <p className="text-gray-600">판매자 정보와 정산 계좌를 관리하세요.</p>
        </div>

        {message && (
          <div
            className={`mb-6 p-4 rounded-lg ${
              message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
            }`}
          >
            {message.text}
          </div>
        )}

        <div className="bg-white rounded-lg shadow-sm p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 판매자 정보 */}
            <div>
              <h3 className="text-lg font-semibold mb-4">판매자 정보</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    상호명/닉네임
                  </label>
                  <input
                    type="text"
                    value={formData.business_name}
                    onChange={(e) => setFormData({ ...formData, business_name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0f3460] focus:border-transparent"
                    placeholder="예: 디자인스튜디오"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">소개</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0f3460] focus:border-transparent"
                    rows={4}
                    placeholder="판매자 소개를 입력하세요"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">연락처</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0f3460] focus:border-transparent"
                    placeholder="010-1234-5678"
                  />
                </div>
              </div>
            </div>

            {/* 정산 계좌 */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-semibold mb-4">정산 계좌 정보</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">은행명</label>
                  <input
                    type="text"
                    value={formData.bank_name}
                    onChange={(e) => setFormData({ ...formData, bank_name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0f3460] focus:border-transparent"
                    placeholder="예: 국민은행"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">계좌번호</label>
                  <input
                    type="text"
                    value={formData.account_number}
                    onChange={(e) => setFormData({ ...formData, account_number: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0f3460] focus:border-transparent"
                    placeholder="123456-78-901234"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">예금주</label>
                  <input
                    type="text"
                    value={formData.account_holder}
                    onChange={(e) => setFormData({ ...formData, account_holder: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0f3460] focus:border-transparent"
                    placeholder="홍길동"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-6">
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 px-6 py-3 bg-[#0f3460] text-white rounded-lg hover:bg-[#1a4b7d] transition-colors disabled:opacity-50 font-semibold"
              >
                {isLoading ? '저장 중...' : '변경사항 저장'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
