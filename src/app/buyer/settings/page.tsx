'use client'

import { useState, useEffect, useMemo } from 'react'
import { useAuth } from '@/components/providers/AuthProvider'
import { createClient } from '@/lib/supabase/client'

export default function BuyerSettingsPage() {
  const { user, profile, refreshProfile } = useAuth()
  const supabase = useMemo(() => createClient(), [])

  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    bio: '',
  })

  useEffect(() => {
    if (user?.id) {
      supabase.from('buyers').update({ last_mode: 'buyer' }).eq('id', user.id)
    }

    if (profile?.buyer) {
      setFormData({
        name: profile.buyer.name || '',
        phone: profile.buyer.phone || '',
        bio: profile.buyer.bio || '',
      })
    }
  }, [user, profile, supabase])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage(null)

    try {
      const { error } = await supabase
        .from('buyers')
        .update({
          name: formData.name,
          phone: formData.phone,
          bio: formData.bio,
        })
        .eq('id', user?.id)

      if (error) throw error

      await refreshProfile()
      setMessage({ type: 'success', text: '프로필이 업데이트되었습니다.' })
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || '프로필 업데이트 중 오류가 발생했습니다.' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleBecomeSeller = async () => {
    if (!confirm('판매자로 전환하시겠습니까?\n서비스 등록 및 판매가 가능해집니다.')) {
      return
    }

    setIsLoading(true)
    setMessage(null)

    try {
      // sellers 테이블에 레코드 생성
      const { error: sellerError } = await supabase
        .from('sellers')
        .insert({
          id: user?.id,
          name: profile?.buyer?.name || '',
          email: user?.email || '',
        })

      // 이미 존재하는 경우 무시
      if (sellerError && !sellerError.message.includes('duplicate')) {
        throw sellerError
      }

      await refreshProfile()
      setMessage({ type: 'success', text: '판매자 전환이 완료되었습니다!' })

      // 페이지 새로고침하여 사이드바 업데이트
      setTimeout(() => {
        window.location.reload()
      }, 1500)
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || '판매자 전환 중 오류가 발생했습니다.' })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="py-8">
      <div className="max-w-4xl mx-auto px-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">설정</h1>
          <p className="text-gray-600">프로필 정보를 관리하고 계정 설정을 변경하세요.</p>
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

        {/* 프로필 정보 */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-bold mb-6">프로필 정보</h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 이메일 (읽기 전용) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">이메일</label>
              <input
                type="email"
                value={user?.email || ''}
                disabled
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
              />
              <p className="text-xs text-gray-500 mt-1">이메일은 변경할 수 없습니다.</p>
            </div>

            {/* 이름 */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                이름 *
              </label>
              <input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0f3460] focus:border-transparent"
                placeholder="홍길동"
                required
              />
            </div>

            {/* 전화번호 */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                전화번호
              </label>
              <input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0f3460] focus:border-transparent"
                placeholder="010-1234-5678"
              />
            </div>

            {/* 소개 */}
            <div>
              <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-2">
                자기소개
              </label>
              <textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0f3460] focus:border-transparent"
                rows={4}
                placeholder="자기소개를 입력하세요"
              />
            </div>

            {/* 저장 버튼 */}
            <div className="flex gap-3">
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

        {/* 판매자 전환 (buyer인 경우만) */}
        {profile?.isBuyer && !profile?.isSeller && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-bold mb-4">판매자 전환</h2>
            <p className="text-gray-600 mb-4">
              판매자로 전환하면 서비스를 등록하고 판매할 수 있습니다.
            </p>
            <button
              onClick={handleBecomeSeller}
              disabled={isLoading}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 font-semibold"
            >
              <i className="fas fa-store mr-2"></i>
              판매자 되기
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
