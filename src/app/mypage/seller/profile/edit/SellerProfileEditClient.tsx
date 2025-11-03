'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Sidebar from '@/components/mypage/Sidebar'
import MobileSidebar from '@/components/mypage/MobileSidebar'
import { logger } from '@/lib/logger'

interface Props {
  profile: any
}

export default function SellerProfileEditClient({ profile: initialProfile }: Props) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [profile, setProfile] = useState(initialProfile)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      setSaving(true)
      const supabase = createClient()

      const { error } = await supabase
        .from('sellers')
        .update(profile)
        .eq('id', profile.id)

      if (error) throw error

      alert('프로필이 저장되었습니다')
      router.push('/mypage/seller/profile')
      router.refresh()
    } catch (error) {
      logger.error('Failed to save profile:', error)
      alert('프로필 저장에 실패했습니다')
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <MobileSidebar mode="seller" />
      <Sidebar mode="seller" />
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
        <div className="mb-6 lg:mb-8 pt-12 lg:pt-0">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">판매자 정보 수정</h1>
          <p className="text-sm sm:text-base text-gray-600">판매자 프로필 및 정산 정보를 수정하세요</p>
        </div>

        <form onSubmit={handleSubmit} className="max-w-4xl space-y-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">프로필 정보</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  판매자명 (활동명) *
                </label>
                <input
                  type="text"
                  value={profile.display_name || ''}
                  onChange={(e) => setProfile({ ...profile, display_name: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0f3460] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  자기소개 *
                </label>
                <textarea
                  rows={6}
                  value={profile.bio || ''}
                  onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0f3460] focus:border-transparent"
                  placeholder="자신의 전문성과 경력을 소개해주세요"
                ></textarea>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">연락처 정보</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  전화번호 *
                </label>
                <input
                  type="tel"
                  value={profile.phone || ''}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0f3460] focus:border-transparent"
                />
                <div className="mt-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={profile.show_phone || false}
                      onChange={(e) => setProfile({ ...profile, show_phone: e.target.checked })}
                      className="w-4 h-4 text-[#0f3460] rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">프로필에 전화번호 공개</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  카카오톡 ID
                </label>
                <input
                  type="text"
                  value={profile.kakao_id || ''}
                  onChange={(e) => setProfile({ ...profile, kakao_id: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0f3460] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  WhatsApp
                </label>
                <input
                  type="text"
                  value={profile.whatsapp || ''}
                  onChange={(e) => setProfile({ ...profile, whatsapp: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0f3460] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  웹사이트
                </label>
                <input
                  type="url"
                  value={profile.website || ''}
                  onChange={(e) => setProfile({ ...profile, website: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0f3460] focus:border-transparent"
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">정산 정보</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  은행명 *
                </label>
                <input
                  type="text"
                  value={profile.bank_name || ''}
                  onChange={(e) => setProfile({ ...profile, bank_name: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0f3460] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  예금주명 *
                </label>
                <input
                  type="text"
                  value={profile.account_holder || ''}
                  onChange={(e) => setProfile({ ...profile, account_holder: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0f3460] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  계좌번호 *
                </label>
                <input
                  type="text"
                  value={profile.account_number || ''}
                  onChange={(e) => setProfile({ ...profile, account_number: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0f3460] focus:border-transparent"
                />
              </div>

              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={profile.is_business || false}
                    onChange={(e) => setProfile({ ...profile, is_business: e.target.checked })}
                    className="w-4 h-4 text-[#0f3460] rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">사업자입니다</span>
                </label>
              </div>

              {profile.is_business && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    사업자 번호
                  </label>
                  <input
                    type="text"
                    value={profile.business_number || ''}
                    onChange={(e) => setProfile({ ...profile, business_number: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0f3460] focus:border-transparent"
                  />
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => router.back()}
              disabled={saving}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium disabled:opacity-50"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 px-6 py-3 bg-[#0f3460] text-white rounded-lg hover:bg-[#1a4d8f] transition-colors font-medium disabled:opacity-50"
            >
              {saving ? '저장중...' : '저장하기'}
            </button>
          </div>
        </form>
      </main>
    </>
  )
}
