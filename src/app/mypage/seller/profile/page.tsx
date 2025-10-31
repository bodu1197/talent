'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/components/providers/AuthProvider'
import Sidebar from '@/components/mypage/Sidebar'
import MobileSidebar from '@/components/mypage/MobileSidebar'
import LoadingSpinner from '@/components/common/LoadingSpinner'

interface SellerProfile {
  id: string
  real_name: string | null
  display_name: string
  profile_image: string | null
  bio: string
  phone: string
  show_phone: boolean
  kakao_id: string | null
  kakao_openchat: string | null
  whatsapp: string | null
  website: string | null
  preferred_contact: string[]
  account_number: string
  account_holder: string
  bank_name: string
  business_number: string | null
  is_business: boolean
  status: string
}

export default function SellerProfilePage() {
  const router = useRouter()
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<SellerProfile | null>(null)

  useEffect(() => {
    if (user) {
      loadProfile()
    }
  }, [user])

  const loadProfile = async () => {
    try {
      const supabase = createClient()

      const { data: seller, error } = await supabase
        .from('sellers')
        .select('*')
        .eq('user_id', user!.id)
        .single()

      if (error) throw error

      setProfile(seller)
    } catch (error) {
      console.error('Failed to load profile:', error)
      alert('프로필을 불러오는데 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <>
        <MobileSidebar mode="seller" />
        <Sidebar mode="seller" />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <LoadingSpinner message="프로필 불러오는 중..." />
        </main>
      </>
    )
  }

  if (!profile) {
    return (
      <>
        <MobileSidebar mode="seller" />
        <Sidebar mode="seller" />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="text-center py-8">
            <p className="text-gray-500">판매자 정보를 찾을 수 없습니다.</p>
          </div>
        </main>
      </>
    )
  }

  return (
    <>
      <MobileSidebar mode="seller" />
      <Sidebar mode="seller" />
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
        {/* 페이지 헤더 */}
        <div className="mb-6 lg:mb-8 pt-12 lg:pt-0 flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">판매자 정보</h1>
            <p className="text-sm sm:text-base text-gray-600">판매자 프로필 및 정산 정보를 확인하세요</p>
          </div>
          <button
            onClick={() => router.push('/mypage/seller/profile/edit')}
            className="px-6 py-3 bg-brand-primary text-white rounded-lg hover:bg-brand-light transition-colors font-medium"
          >
            <i className="fas fa-edit mr-2"></i>
            수정
          </button>
        </div>

        {/* 상태 배지 */}
        <div className="mb-6">
          <span className={`inline-block px-4 py-2 rounded-full text-sm font-medium ${
            profile.status === 'active' ? 'bg-green-100 text-green-800' :
            profile.status === 'pending_review' ? 'bg-yellow-100 text-yellow-800' :
            profile.status === 'suspended' ? 'bg-red-100 text-red-800' :
            'bg-gray-100 text-gray-800'
          }`}>
            {profile.status === 'active' ? '✓ 활동중' :
             profile.status === 'pending_review' ? '⏳ 검토중' :
             profile.status === 'suspended' ? '⚠ 정지됨' :
             profile.status}
          </span>
        </div>

        <div className="max-w-4xl space-y-6">
          {/* 프로필 정보 */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">프로필 정보</h2>

            <div className="space-y-4">
              {profile.profile_image && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    프로필 사진
                  </label>
                  <img
                    src={profile.profile_image}
                    alt="프로필"
                    className="w-32 h-32 object-cover rounded-full border border-gray-300"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  판매자명 (활동명)
                </label>
                <p className="text-gray-900">{profile.display_name}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  자기소개
                </label>
                <p className="text-gray-900 whitespace-pre-wrap">{profile.bio}</p>
              </div>
            </div>
          </div>

          {/* 연락처 정보 */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">연락처 정보</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  실명 (본인인증)
                </label>
                <p className="text-gray-900">{profile.real_name || '-'}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  전화번호
                </label>
                <p className="text-gray-900">
                  {profile.phone}
                  {profile.show_phone ? (
                    <span className="ml-2 text-sm text-green-600">(공개)</span>
                  ) : (
                    <span className="ml-2 text-sm text-gray-500">(비공개)</span>
                  )}
                </p>
              </div>

              {profile.kakao_id && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    카카오톡 ID
                  </label>
                  <p className="text-gray-900">{profile.kakao_id}</p>
                </div>
              )}

              {profile.kakao_openchat && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    카카오톡 오픈채팅
                  </label>
                  <a href={profile.kakao_openchat} target="_blank" rel="noopener noreferrer" className="text-brand-primary hover:underline">
                    {profile.kakao_openchat}
                  </a>
                </div>
              )}

              {profile.whatsapp && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    WhatsApp
                  </label>
                  <p className="text-gray-900">{profile.whatsapp}</p>
                </div>
              )}

              {profile.website && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    웹사이트
                  </label>
                  <a href={profile.website} target="_blank" rel="noopener noreferrer" className="text-brand-primary hover:underline">
                    {profile.website}
                  </a>
                </div>
              )}

              {profile.preferred_contact && profile.preferred_contact.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    선호 연락 수단
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {profile.preferred_contact.map((contact) => (
                      <span key={contact} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm">
                        {contact}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 정산 정보 */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">정산 정보</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  은행명
                </label>
                <p className="text-gray-900">{profile.bank_name}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  예금주명
                </label>
                <p className="text-gray-900">{profile.account_holder}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  계좌번호
                </label>
                <p className="text-gray-900">{profile.account_number}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  사업자 여부
                </label>
                <p className="text-gray-900">
                  {profile.is_business ? '사업자' : '개인'}
                  {profile.is_business && profile.business_number && (
                    <span className="ml-2 text-sm text-gray-600">
                      ({profile.business_number})
                    </span>
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
