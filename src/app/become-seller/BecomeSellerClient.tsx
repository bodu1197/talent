'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { logger } from '@/lib/logger'

interface BecomeSellerClientProps {
  userId: string
}

export default function BecomeSellerClient({ userId }: BecomeSellerClientProps) {
  const router = useRouter()
  const [step, setStep] = useState<'intro' | 'verify' | 'profile'>('intro')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [verificationData, setVerificationData] = useState({
    name: '',
    phone: '',
    birthdate: ''
  })

  const [profileData, setProfileData] = useState({
    businessName: '',
    description: '',
    category: '',
  })

  // 1단계: 소개 화면
  const IntroStep = () => (
    <div className="max-w-2xl mx-auto p-8">
      <div className="text-center mb-8">
        <div className="w-20 h-20 bg-brand-primary rounded-full flex items-center justify-center mx-auto mb-4">
          <i className="fas fa-store text-white text-3xl"></i>
        </div>
        <h1 className="text-3xl font-bold mb-2">판매자가 되어보세요!</h1>
        <p className="text-gray-600">
          돌파구에서 여러분의 재능을 판매하고 수익을 창출하세요
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-bold mb-4">판매자 혜택</h2>
        <ul className="space-y-3">
          <li className="flex items-start gap-3">
            <i className="fas fa-check-circle text-green-600 mt-1"></i>
            <div>
              <strong>수수료 0원</strong>
              <p className="text-sm text-gray-600">판매 수수료 없이 100% 수익 가져가세요</p>
            </div>
          </li>
          <li className="flex items-start gap-3">
            <i className="fas fa-check-circle text-green-600 mt-1"></i>
            <div>
              <strong>간편한 등록</strong>
              <p className="text-sm text-gray-600">본인인증만으로 바로 시작 가능</p>
            </div>
          </li>
          <li className="flex items-start gap-3">
            <i className="fas fa-check-circle text-green-600 mt-1"></i>
            <div>
              <strong>안전한 거래</strong>
              <p className="text-sm text-gray-600">에스크로 결제로 안전하게 거래</p>
            </div>
          </li>
        </ul>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <h3 className="font-bold text-blue-900 mb-2">📋 준비 사항</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• 본인인증 (휴대폰 인증)</li>
          <li>• 판매자 프로필 정보</li>
        </ul>
      </div>

      <button
        onClick={() => setStep('verify')}
        className="w-full bg-brand-primary text-white py-4 rounded-lg font-bold text-lg hover:bg-[#1a4d8f] transition-colors"
      >
        판매자 시작하기
      </button>
    </div>
  )

  // 2단계: 본인인증
  const handleVerification = async () => {
    // TODO: 실제 본인인증 API 연동
    // 현재는 임시로 다음 단계로 진행
    if (!verificationData.name || !verificationData.phone) {
      setError('모든 정보를 입력해주세요')
      return
    }

    setStep('profile')
  }

  const VerifyStep = () => {

    return (
      <div className="max-w-2xl mx-auto p-8">
        <div className="mb-6">
          <button
            onClick={() => setStep('intro')}
            className="text-gray-600 hover:text-gray-900 flex items-center gap-2"
          >
            <i className="fas fa-arrow-left"></i>
            뒤로가기
          </button>
        </div>

        <h1 className="text-2xl font-bold mb-2">본인인증</h1>
        <p className="text-gray-600 mb-8">
          판매자 활동을 위해 본인인증이 필요합니다
        </p>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              이름 *
            </label>
            <input
              type="text"
              value={verificationData.name}
              onChange={(e) => setVerificationData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
              placeholder="실명을 입력하세요"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              휴대폰 번호 *
            </label>
            <input
              type="tel"
              value={verificationData.phone}
              onChange={(e) => setVerificationData(prev => ({ ...prev, phone: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
              placeholder="010-0000-0000"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              생년월일
            </label>
            <input
              type="date"
              value={verificationData.birthdate}
              onChange={(e) => setVerificationData(prev => ({ ...prev, birthdate: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
            />
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-6">
            <p className="text-sm text-yellow-800">
              <i className="fas fa-info-circle mr-2"></i>
              실제 본인인증 API는 추후 연동 예정입니다. 현재는 테스트 모드입니다.
            </p>
          </div>

          <button
            onClick={handleVerification}
            disabled={loading}
            className="w-full bg-brand-primary text-white py-3 rounded-lg font-bold hover:bg-[#1a4d8f] transition-colors disabled:opacity-50 mt-6"
          >
            {loading ? '인증 중...' : '본인인증 완료 (테스트)'}
          </button>
        </div>
      </div>
    )
  }

  // 3단계: 프로필 등록 제출
  const handleSubmit = async () => {
    if (!profileData.businessName) {
      setError('판매자명을 입력해주세요')
      return
    }

    setLoading(true)
    setError(null)

    try {
      // sellers 레코드 생성 + 본인인증 정보 저장
      const response = await fetch('/api/sellers/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          businessName: profileData.businessName,
          description: profileData.description,
          category: profileData.category,
          verifiedName: verificationData.name,
          verifiedPhone: verificationData.phone,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || '판매자 등록에 실패했습니다')
      }

      // 성공 - 판매자 대시보드로 이동
      router.push('/mypage/seller/dashboard')
    } catch (err: unknown) {
      logger.error('판매자 등록 실패:', err)
      setError(err instanceof Error ? err.message : '판매자 등록 중 오류가 발생했습니다')
    } finally {
      setLoading(false)
    }
  }

  const ProfileStep = () => {
    return (
      <div className="max-w-2xl mx-auto p-8">
        <div className="mb-6">
          <button
            onClick={() => setStep('verify')}
            className="text-gray-600 hover:text-gray-900 flex items-center gap-2"
          >
            <i className="fas fa-arrow-left"></i>
            뒤로가기
          </button>
        </div>

        <h1 className="text-2xl font-bold mb-2">판매자 프로필</h1>
        <p className="text-gray-600 mb-8">
          구매자에게 보여질 판매자 정보를 입력하세요
        </p>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              판매자명 *
            </label>
            <input
              type="text"
              value={profileData.businessName}
              onChange={(e) => setProfileData(prev => ({ ...prev, businessName: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
              placeholder="판매자로 활동할 이름"
            />
            <p className="text-xs text-gray-500 mt-1">
              개인 이름 또는 비즈니스 이름을 입력하세요
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              카테고리
            </label>
            <select
              value={profileData.category}
              onChange={(e) => setProfileData(prev => ({ ...prev, category: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
            >
              <option value="">선택하세요</option>
              <option value="design">디자인</option>
              <option value="development">개발</option>
              <option value="marketing">마케팅</option>
              <option value="video">영상/사진</option>
              <option value="writing">글쓰기</option>
              <option value="other">기타</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              소개
            </label>
            <textarea
              value={profileData.description}
              onChange={(e) => setProfileData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
              rows={4}
              placeholder="자신을 소개하고 어떤 서비스를 제공하는지 설명해주세요"
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-brand-primary text-white py-3 rounded-lg font-bold hover:bg-[#1a4d8f] transition-colors disabled:opacity-50 mt-6"
          >
            {loading ? '등록 중...' : '판매자 등록 완료'}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      {step === 'intro' && <IntroStep />}
      {step === 'verify' && <VerifyStep />}
      {step === 'profile' && <ProfileStep />}
    </div>
  )
}
