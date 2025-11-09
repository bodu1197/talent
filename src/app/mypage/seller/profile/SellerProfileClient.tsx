'use client'

import { useRouter } from 'next/navigation'
import Sidebar from '@/components/mypage/Sidebar'
import MobileSidebar from '@/components/mypage/MobileSidebar'

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
  contact_hours: string | null
  tax_invoice_available: boolean
  account_number: string
  account_holder: string
  bank_name: string
  business_number: string | null
  is_business: boolean
  status: string
}

interface Props {
  profile: SellerProfile
}

export default function SellerProfileClient({ profile }: Props) {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center items-start pt-16 lg:pt-[86px] absolute inset-0 top-[86px]">
      <div className="flex w-full max-w-[1200px]">
        <MobileSidebar mode="seller" />
        <Sidebar mode="seller" />
        <main className="flex-1 overflow-y-auto">
          <div className="py-8 px-4">
        {/* 페이지 헤더 */}
        <div className="mb-6 lg:mb-8 pt-12 lg:pt-0 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">판매자 정보</h1>
            <p className="text-gray-600 mt-1 text-sm">판매자 프로필 및 정산 정보를 확인하세요</p>
          </div>
          <button
            onClick={() => router.push('/mypage/seller/profile/edit')}
            className="px-6 py-3 bg-[#0f3460] text-white rounded-lg hover:bg-[#1a4d8f] transition-colors font-medium"
          >
            <i className="fas fa-edit mr-2"></i>
            수정
          </button>
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
                  <a href={profile.kakao_openchat} target="_blank" rel="noopener noreferrer" className="text-[#0f3460] hover:underline">
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
                  <a href={profile.website} target="_blank" rel="noopener noreferrer" className="text-[#0f3460] hover:underline">
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

              {profile.contact_hours && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    연락 가능 시간
                  </label>
                  <p className="text-gray-900">{profile.contact_hours}</p>
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  세금계산서 발행
                </label>
                <p className="text-gray-900">
                  {profile.tax_invoice_available ? (
                    <span className="text-green-600">
                      <i className="fas fa-check-circle mr-1"></i>
                      발행 가능
                    </span>
                  ) : (
                    <span className="text-gray-500">
                      <i className="fas fa-times-circle mr-1"></i>
                      발행 불가
                    </span>
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>
          </div>
        </main>
      </div>
    </div>
  )
}
