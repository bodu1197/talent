'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/components/providers/AuthProvider'
import Sidebar from '@/components/mypage/Sidebar'
import Link from 'next/link'

type Step = 1 | 2 | 3 | 4 | 5

interface SellerFormData {
  // 1단계: 신원 인증
  realName: string
  phone: string
  accountNumber: string
  accountHolder: string
  bankName: string
  businessNumber: string
  isBusiness: boolean

  // 2단계: 판매자 프로필
  displayName: string
  profileImage: File | null
  bio: string

  // 3단계: 연락처 정보
  publicPhone: string
  showPhone: boolean
  kakaoId: string
  kakaoOpenChat: string
  whatsapp: string
  website: string
  preferredContact: string[]

  // 4단계: 포트폴리오
  portfolioImages: File[]
  portfolioTitles: string[]
  portfolioDescriptions: string[]
  certificates: string
  experience: string

  // 5단계: 약관 동의
  termsAgree: boolean
  commissionAgree: boolean
  refundAgree: boolean
}

export default function SellerRegisterPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [currentStep, setCurrentStep] = useState<Step>(1)
  const [loading, setLoading] = useState(false)
  const [profilePreview, setProfilePreview] = useState<string | null>(null)

  const [formData, setFormData] = useState<SellerFormData>({
    realName: '',
    phone: '',
    accountNumber: '',
    accountHolder: '',
    bankName: '',
    businessNumber: '',
    isBusiness: false,
    displayName: '',
    profileImage: null,
    bio: '',
    publicPhone: '',
    showPhone: false,
    kakaoId: '',
    kakaoOpenChat: '',
    whatsapp: '',
    website: '',
    preferredContact: [],
    portfolioImages: [],
    portfolioTitles: [],
    portfolioDescriptions: [],
    certificates: '',
    experience: '',
    termsAgree: false,
    commissionAgree: false,
    refundAgree: false,
  })

  const handleProfileImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('파일 크기는 5MB를 초과할 수 없습니다.')
        return
      }
      if (!file.type.startsWith('image/')) {
        alert('이미지 파일만 업로드 가능합니다.')
        return
      }
      setFormData({ ...formData, profileImage: file })
      const reader = new FileReader()
      reader.onloadend = () => {
        setProfilePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handlePreferredContactToggle = (contact: string) => {
    const current = formData.preferredContact
    if (current.includes(contact)) {
      setFormData({
        ...formData,
        preferredContact: current.filter(c => c !== contact)
      })
    } else {
      setFormData({
        ...formData,
        preferredContact: [...current, contact]
      })
    }
  }

  const handleSubmit = async () => {
    if (!user) {
      alert('로그인이 필요합니다.')
      return
    }

    setLoading(true)

    try {
      const supabase = createClient()

      // 1. 프로필 이미지 업로드
      let profileImageUrl = ''
      if (formData.profileImage) {
        const fileExt = formData.profileImage.name.split('.').pop()
        const fileName = `${user.id}-profile.${fileExt}`
        const filePath = `seller-profiles/${fileName}`

        const { error: uploadError } = await supabase.storage
          .from('profiles')
          .upload(filePath, formData.profileImage, { upsert: true })

        if (uploadError) {
          console.error('Profile upload error:', uploadError)
          alert('프로필 이미지 업로드에 실패했습니다.')
          return
        }

        const { data: { publicUrl } } = supabase.storage
          .from('profiles')
          .getPublicUrl(filePath)

        profileImageUrl = publicUrl
      }

      // 2. sellers 테이블에 판매자 정보 등록
      const { data: seller, error: sellerError } = await supabase
        .from('sellers')
        .insert({
          user_id: user.id,
          display_name: formData.displayName,
          profile_image: profileImageUrl,
          bio: formData.bio,
          phone: formData.publicPhone,
          show_phone: formData.showPhone,
          kakao_id: formData.kakaoId,
          kakao_openchat: formData.kakaoOpenChat,
          whatsapp: formData.whatsapp,
          website: formData.website,
          preferred_contact: formData.preferredContact,
          account_number: formData.accountNumber,
          account_holder: formData.accountHolder,
          bank_name: formData.bankName,
          business_number: formData.isBusiness ? formData.businessNumber : null,
          is_business: formData.isBusiness,
          certificates: formData.certificates,
          experience: formData.experience,
          status: 'pending_review' // 승인 대기 상태
        })
        .select()
        .single()

      if (sellerError) {
        console.error('Seller insert error:', sellerError)
        alert('판매자 등록에 실패했습니다: ' + sellerError.message)
        return
      }

      alert('판매자 등록이 완료되었습니다! 승인 후 판매를 시작할 수 있습니다.')
      router.push('/mypage/seller')

    } catch (error) {
      console.error('Seller registration error:', error)
      alert('판매자 등록 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const nextStep = () => {
    if (currentStep < 5) {
      setCurrentStep((currentStep + 1) as Step)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep((currentStep - 1) as Step)
    }
  }

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return formData.realName && formData.phone && formData.accountNumber &&
               formData.accountHolder && formData.bankName
      case 2:
        return formData.displayName && formData.bio.length >= 150
      case 3:
        return true // 연락처는 선택사항
      case 4:
        return true // 포트폴리오는 선택사항
      case 5:
        return formData.termsAgree && formData.commissionAgree && formData.refundAgree
      default:
        return false
    }
  }

  return (
    <>
      <Sidebar mode="buyer" />
      <main className="flex-1 overflow-y-auto p-8">
        {/* 상단 네비게이션 */}
        <div className="mb-6">
          <Link
            href="/mypage"
            className="text-gray-600 hover:text-gray-900 flex items-center gap-2"
          >
            <i className="fas fa-arrow-left"></i>
            <span>마이페이지로</span>
          </Link>
        </div>

        {/* 페이지 헤더 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">판매자 등록</h1>
          <p className="text-gray-600">재능을 판매하기 위해 판매자 정보를 입력해주세요</p>
        </div>

        {/* 진행 단계 표시 */}
        <div className="max-w-4xl mb-8">
          <div className="flex items-center justify-between">
            {[1, 2, 3, 4, 5].map((step) => (
              <div key={step} className="flex items-center flex-1">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full font-bold ${
                  currentStep >= step ? 'bg-[#0f3460] text-white' : 'bg-gray-200 text-gray-500'
                }`}>
                  {step}
                </div>
                {step < 5 && (
                  <div className={`flex-1 h-1 mx-2 ${
                    currentStep > step ? 'bg-[#0f3460]' : 'bg-gray-200'
                  }`}></div>
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-sm">
            <span className={currentStep === 1 ? 'text-[#0f3460] font-medium' : 'text-gray-500'}>신원인증</span>
            <span className={currentStep === 2 ? 'text-[#0f3460] font-medium' : 'text-gray-500'}>프로필</span>
            <span className={currentStep === 3 ? 'text-[#0f3460] font-medium' : 'text-gray-500'}>연락처</span>
            <span className={currentStep === 4 ? 'text-[#0f3460] font-medium' : 'text-gray-500'}>포트폴리오</span>
            <span className={currentStep === 5 ? 'text-[#0f3460] font-medium' : 'text-gray-500'}>약관동의</span>
          </div>
        </div>

        <div className="max-w-4xl">
          {/* 1단계: 신원 인증 */}
          {currentStep === 1 && (
            <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">1단계: 신원 인증</h2>
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <div className="flex items-start gap-3">
                    <i className="fas fa-info-circle text-blue-500 mt-1"></i>
                    <div>
                      <p className="text-sm font-medium text-blue-900">본인 인증 안내</p>
                      <p className="text-sm text-blue-700 mt-1">
                        실명 인증 시 휴대폰 본인인증이 함께 진행됩니다.
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    실명 *
                  </label>
                  <input
                    type="text"
                    value={formData.realName}
                    onChange={(e) => setFormData({ ...formData, realName: e.target.value })}
                    placeholder="홍길동"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0f3460] focus:border-transparent"
                    required
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    정산 및 세금 신고를 위해 실명이 필요합니다
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    휴대폰 번호 *
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="010-1234-5678"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0f3460] focus:border-transparent"
                    required
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    주문 알림 및 고객 문의를 위해 필요합니다
                  </p>
                </div>

                <div className="border-t pt-4 mt-6">
                  <h3 className="font-medium text-gray-900 mb-4">정산 계좌 정보</h3>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        은행명 *
                      </label>
                      <select
                        value={formData.bankName}
                        onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0f3460] focus:border-transparent"
                        required
                      >
                        <option value="">선택하세요</option>
                        <option value="KB국민은행">KB국민은행</option>
                        <option value="신한은행">신한은행</option>
                        <option value="우리은행">우리은행</option>
                        <option value="하나은행">하나은행</option>
                        <option value="NH농협은행">NH농협은행</option>
                        <option value="IBK기업은행">IBK기업은행</option>
                        <option value="카카오뱅크">카카오뱅크</option>
                        <option value="토스뱅크">토스뱅크</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        예금주명 *
                      </label>
                      <input
                        type="text"
                        value={formData.accountHolder}
                        onChange={(e) => setFormData({ ...formData, accountHolder: e.target.value })}
                        placeholder="홍길동"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0f3460] focus:border-transparent"
                        required
                      />
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      계좌번호 *
                    </label>
                    <input
                      type="text"
                      value={formData.accountNumber}
                      onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                      placeholder="123-456-789012"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0f3460] focus:border-transparent"
                      required
                    />
                  </div>
                </div>

                <div className="border-t pt-4 mt-6">
                  <label className="flex items-center gap-2 mb-4">
                    <input
                      type="checkbox"
                      checked={formData.isBusiness}
                      onChange={(e) => setFormData({ ...formData, isBusiness: e.target.checked })}
                      className="w-4 h-4 text-[#0f3460] border-gray-300 rounded focus:ring-[#0f3460]"
                    />
                    <span className="text-sm font-medium text-gray-700">사업자입니다</span>
                  </label>

                  {formData.isBusiness && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        사업자 등록번호
                      </label>
                      <input
                        type="text"
                        value={formData.businessNumber}
                        onChange={(e) => setFormData({ ...formData, businessNumber: e.target.value })}
                        placeholder="123-45-67890"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0f3460] focus:border-transparent"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* 2단계: 판매자 프로필 */}
          {currentStep === 2 && (
            <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">2단계: 판매자 프로필</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    프로필 사진
                  </label>
                  <div className="space-y-3">
                    {profilePreview ? (
                      <div className="flex items-center gap-4">
                        <img
                          src={profilePreview}
                          alt="프로필 미리보기"
                          className="w-32 h-32 object-cover rounded-full border border-gray-300"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setFormData({ ...formData, profileImage: null })
                            setProfilePreview(null)
                          }}
                          className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm"
                        >
                          <i className="fas fa-times mr-1"></i>
                          삭제
                        </button>
                      </div>
                    ) : (
                      <label className="inline-block px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleProfileImageChange}
                          className="hidden"
                        />
                        <i className="fas fa-camera mr-2"></i>
                        프로필 사진 선택
                      </label>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    판매자명 (활동명) *
                  </label>
                  <input
                    type="text"
                    value={formData.displayName}
                    onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                    placeholder="예: 디자이너 홍길동"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0f3460] focus:border-transparent"
                    required
                  />
                  <p className="text-sm text-gray-500 mt-1">구매자에게 보여질 이름입니다</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    자기소개 * (150-300자)
                  </label>
                  <textarea
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    rows={6}
                    placeholder="자신의 전문 분야, 경력, 강점 등을 소개해주세요"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0f3460] focus:border-transparent"
                    required
                  ></textarea>
                  <p className="text-sm text-gray-500 mt-1">
                    {formData.bio.length}/300자 {formData.bio.length < 150 && '(최소 150자)'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* 3단계: 연락처 정보 */}
          {currentStep === 3 && (
            <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">3단계: 연락처 정보 (선택)</h2>
              <div className="space-y-4">
                <div>
                  <label className="flex items-center gap-2 mb-2">
                    <input
                      type="checkbox"
                      checked={formData.showPhone}
                      onChange={(e) => setFormData({ ...formData, showPhone: e.target.checked })}
                      className="w-4 h-4 text-[#0f3460] border-gray-300 rounded focus:ring-[#0f3460]"
                    />
                    <span className="text-sm font-medium text-gray-700">전화번호 공개</span>
                  </label>
                  {formData.showPhone && (
                    <input
                      type="tel"
                      value={formData.publicPhone}
                      onChange={(e) => setFormData({ ...formData, publicPhone: e.target.value })}
                      placeholder="010-1234-5678"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0f3460] focus:border-transparent"
                    />
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    카카오톡 ID
                  </label>
                  <input
                    type="text"
                    value={formData.kakaoId}
                    onChange={(e) => setFormData({ ...formData, kakaoId: e.target.value })}
                    placeholder="kakaotalk_id"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0f3460] focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    카카오톡 오픈채팅 링크
                  </label>
                  <input
                    type="url"
                    value={formData.kakaoOpenChat}
                    onChange={(e) => setFormData({ ...formData, kakaoOpenChat: e.target.value })}
                    placeholder="https://open.kakao.com/..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0f3460] focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    WhatsApp
                  </label>
                  <input
                    type="tel"
                    value={formData.whatsapp}
                    onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                    placeholder="821012345678 (국가번호 포함, 하이픈 없이)"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0f3460] focus:border-transparent"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    클릭 시 바로 WhatsApp 채팅 연결됩니다 (예: 821012345678)
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    개인 웹사이트/블로그
                  </label>
                  <input
                    type="url"
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    placeholder="https://..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0f3460] focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    선호하는 연락 수단 (복수 선택 가능)
                  </label>
                  <div className="space-y-2">
                    {['플랫폼 메시지', '카카오톡', 'WhatsApp', '이메일', '전화'].map((contact) => (
                      <label key={contact} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={formData.preferredContact.includes(contact)}
                          onChange={() => handlePreferredContactToggle(contact)}
                          className="w-4 h-4 text-[#0f3460] border-gray-300 rounded focus:ring-[#0f3460]"
                        />
                        <span className="text-sm text-gray-700">{contact}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 4단계: 포트폴리오 */}
          {currentStep === 4 && (
            <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">4단계: 포트폴리오 (선택)</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    자격증/수료증
                  </label>
                  <textarea
                    value={formData.certificates}
                    onChange={(e) => setFormData({ ...formData, certificates: e.target.value })}
                    rows={4}
                    placeholder="보유하신 자격증이나 수료증을 입력해주세요"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0f3460] focus:border-transparent"
                  ></textarea>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    경력 사항
                  </label>
                  <textarea
                    value={formData.experience}
                    onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                    rows={6}
                    placeholder="관련 경력 사항을 입력해주세요"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0f3460] focus:border-transparent"
                  ></textarea>
                </div>
              </div>
            </div>
          )}

          {/* 5단계: 약관 동의 */}
          {currentStep === 5 && (
            <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">5단계: 운영 정책 동의</h2>
              <div className="space-y-4">
                <div className="border rounded-lg p-4">
                  <label className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={formData.termsAgree}
                      onChange={(e) => setFormData({ ...formData, termsAgree: e.target.checked })}
                      className="w-5 h-5 text-[#0f3460] border-gray-300 rounded focus:ring-[#0f3460] mt-0.5"
                      required
                    />
                    <div className="flex-1">
                      <span className="font-medium text-gray-900">판매자 이용약관 동의 (필수)</span>
                      <p className="text-sm text-gray-600 mt-1">
                        판매자로서 준수해야 할 규정과 책임사항에 동의합니다.
                      </p>
                    </div>
                  </label>
                </div>

                <div className="border rounded-lg p-4">
                  <label className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={formData.commissionAgree}
                      onChange={(e) => setFormData({ ...formData, commissionAgree: e.target.checked })}
                      className="w-5 h-5 text-[#0f3460] border-gray-300 rounded focus:ring-[#0f3460] mt-0.5"
                      required
                    />
                    <div className="flex-1">
                      <span className="font-medium text-gray-900">수수료 정책 확인 (필수)</span>
                      <p className="text-sm text-gray-600 mt-1">
                        거래 금액의 20% 플랫폼 수수료가 부과됩니다.
                      </p>
                    </div>
                  </label>
                </div>

                <div className="border rounded-lg p-4">
                  <label className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={formData.refundAgree}
                      onChange={(e) => setFormData({ ...formData, refundAgree: e.target.checked })}
                      className="w-5 h-5 text-[#0f3460] border-gray-300 rounded focus:ring-[#0f3460] mt-0.5"
                      required
                    />
                    <div className="flex-1">
                      <span className="font-medium text-gray-900">환불 정책 동의 (필수)</span>
                      <p className="text-sm text-gray-600 mt-1">
                        작업 시작 전 취소 시 전액 환불, 진행 중 환불은 협의를 통해 결정됩니다.
                      </p>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* 네비게이션 버튼 */}
          <div className="flex gap-3">
            {currentStep > 1 && (
              <button
                type="button"
                onClick={prevStep}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                <i className="fas fa-arrow-left mr-2"></i>
                이전
              </button>
            )}

            {currentStep < 5 ? (
              <button
                type="button"
                onClick={nextStep}
                disabled={!canProceed()}
                className="flex-1 px-6 py-3 bg-[#0f3460] text-white rounded-lg hover:bg-[#1a4b7d] transition-colors font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                다음
                <i className="fas fa-arrow-right ml-2"></i>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={!canProceed() || loading}
                className="flex-1 px-6 py-3 bg-[#0f3460] text-white rounded-lg hover:bg-[#1a4b7d] transition-colors font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <i className="fas fa-spinner fa-spin mr-2"></i>
                    등록 중...
                  </>
                ) : (
                  <>
                    <i className="fas fa-check mr-2"></i>
                    판매자 등록 완료
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </main>
    </>
  )
}
