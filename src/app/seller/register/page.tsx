'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/providers/AuthProvider'
import { createClient } from '@/lib/supabase/client'

export default function SellerRegisterPage() {
  const { user, profile, refreshProfile } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const [formData, setFormData] = useState({
    businessName: '',
    introduction: '',
    skills: '',
    bankName: '',
    bankAccount: '',
    accountHolder: '',
  })

  // 로그인 체크 및 권한 체크
  useEffect(() => {
    if (!user) {
      router.push('/auth/login')
      return
    }

    // 이미 판매자인 경우
    if (profile?.user_type === 'seller' || profile?.user_type === 'both') {
      // seller_profiles 정보 로드
      loadSellerProfile()
    } else {
      // 구매자인 경우 마이페이지로 이동
      router.push('/profile')
    }
  }, [user, profile, router])

  // 판매자 프로필 로드
  const loadSellerProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('seller_profiles')
        .select('*')
        .eq('user_id', user?.id)
        .single()

      if (error) throw error

      if (data) {
        setFormData({
          businessName: data.business_name || '',
          introduction: data.introduction || '',
          skills: data.skills?.join(', ') || '',
          bankName: data.bank_name || '',
          bankAccount: data.bank_account || '',
          accountHolder: data.account_holder || '',
        })
      }
    } catch (error) {
      console.error('판매자 프로필 로드 실패:', error)
    }
  }

  // 판매자 정보 저장
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage(null)

    try {
      // skills를 배열로 변환
      const skillsArray = formData.skills
        .split(',')
        .map(s => s.trim())
        .filter(s => s.length > 0)

      const { error } = await supabase
        .from('seller_profiles')
        .update({
          business_name: formData.businessName,
          introduction: formData.introduction,
          skills: skillsArray,
          bank_name: formData.bankName,
          bank_account: formData.bankAccount,
          account_holder: formData.accountHolder,
        })
        .eq('user_id', user?.id)

      if (error) throw error

      await refreshProfile()
      setMessage({ type: 'success', text: '판매자 정보가 저장되었습니다!' })

      // 2초 후 판매자 대시보드로 이동
      setTimeout(() => {
        router.push('/seller/dashboard')
      }, 2000)
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || '정보 저장 중 오류가 발생했습니다.' })
    } finally {
      setIsLoading(false)
    }
  }

  if (!user || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner-lg"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container-1200">
        <div className="max-w-3xl mx-auto">
          {/* 헤더 */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <i className="fas fa-store text-green-600 text-xl"></i>
              </div>
              <div>
                <h1 className="text-2xl font-bold">판매자 정보 등록</h1>
                <p className="text-gray-600">서비스를 판매하기 위한 정보를 입력해주세요.</p>
              </div>
            </div>

            {/* 진행 상태 */}
            <div className="flex items-center gap-2 text-sm">
              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full font-medium">
                ✓ 판매자 전환 완료
              </span>
              <i className="fas fa-arrow-right text-gray-400"></i>
              <span className="px-3 py-1 bg-blue-100 text-[#0f3460] rounded-full font-medium">
                정보 입력 중
              </span>
              <i className="fas fa-arrow-right text-gray-400"></i>
              <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full">
                서비스 등록
              </span>
            </div>
          </div>

          {/* 메시지 */}
          {message && (
            <div className={`mb-6 p-4 rounded-lg ${
              message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
            }`}>
              {message.text}
            </div>
          )}

          {/* 입력 폼 */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* 활동명 (상호명) */}
              <div>
                <label htmlFor="businessName" className="block text-sm font-medium text-gray-700 mb-2">
                  활동명 / 상호명 *
                </label>
                <input
                  id="businessName"
                  type="text"
                  value={formData.businessName}
                  onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                  className="input"
                  placeholder="예: 홍길동 디자인 스튜디오"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  서비스 구매자에게 표시될 이름입니다.
                </p>
              </div>

              {/* 소개 */}
              <div>
                <label htmlFor="introduction" className="block text-sm font-medium text-gray-700 mb-2">
                  자기소개 *
                </label>
                <textarea
                  id="introduction"
                  value={formData.introduction}
                  onChange={(e) => setFormData({ ...formData, introduction: e.target.value })}
                  className="textarea"
                  rows={6}
                  placeholder="판매자로서의 경력, 전문 분야, 제공 가능한 서비스 등을 자유롭게 작성해주세요."
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  최소 50자 이상 작성하시면 구매자에게 더 신뢰를 줄 수 있습니다.
                </p>
              </div>

              {/* 전문 기술 */}
              <div>
                <label htmlFor="skills" className="block text-sm font-medium text-gray-700 mb-2">
                  전문 기술/도구 *
                </label>
                <input
                  id="skills"
                  type="text"
                  value={formData.skills}
                  onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                  className="input"
                  placeholder="Midjourney, ChatGPT, Photoshop, Illustrator (쉼표로 구분)"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  사용 가능한 AI 도구나 프로그램을 쉼표(,)로 구분하여 입력해주세요.
                </p>
              </div>

              {/* 구분선 */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-semibold mb-4">
                  <i className="fas fa-university text-gray-600 mr-2"></i>
                  정산 계좌 정보
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  판매 수익금을 받을 계좌 정보를 입력해주세요. (나중에 입력 가능)
                </p>
              </div>

              {/* 은행명 */}
              <div>
                <label htmlFor="bankName" className="block text-sm font-medium text-gray-700 mb-2">
                  은행명
                </label>
                <select
                  id="bankName"
                  value={formData.bankName}
                  onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                  className="input"
                >
                  <option value="">선택해주세요</option>
                  <option value="KB국민은행">KB국민은행</option>
                  <option value="신한은행">신한은행</option>
                  <option value="우리은행">우리은행</option>
                  <option value="하나은행">하나은행</option>
                  <option value="NH농협은행">NH농협은행</option>
                  <option value="IBK기업은행">IBK기업은행</option>
                  <option value="카카오뱅크">카카오뱅크</option>
                  <option value="토스뱅크">토스뱅크</option>
                  <option value="케이뱅크">케이뱅크</option>
                </select>
              </div>

              {/* 계좌번호 */}
              <div>
                <label htmlFor="bankAccount" className="block text-sm font-medium text-gray-700 mb-2">
                  계좌번호
                </label>
                <input
                  id="bankAccount"
                  type="text"
                  value={formData.bankAccount}
                  onChange={(e) => setFormData({ ...formData, bankAccount: e.target.value })}
                  className="input"
                  placeholder="'-' 없이 숫자만 입력"
                />
              </div>

              {/* 예금주 */}
              <div>
                <label htmlFor="accountHolder" className="block text-sm font-medium text-gray-700 mb-2">
                  예금주명
                </label>
                <input
                  id="accountHolder"
                  type="text"
                  value={formData.accountHolder}
                  onChange={(e) => setFormData({ ...formData, accountHolder: e.target.value })}
                  className="input"
                  placeholder="계좌의 예금주명"
                />
              </div>

              {/* 안내 */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex gap-3">
                  <i className="fas fa-info-circle text-[#0f3460] mt-1"></i>
                  <div className="text-sm text-gray-700">
                    <p className="font-medium mb-1">안내사항</p>
                    <ul className="list-disc list-inside space-y-1 text-gray-600">
                      <li>정산 계좌는 나중에 마이페이지에서 수정 가능합니다.</li>
                      <li>계좌 정보는 암호화되어 안전하게 보관됩니다.</li>
                      <li>판매 수익금은 매월 15일에 일괄 정산됩니다.</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* 버튼 */}
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 btn-primary py-3 disabled:opacity-50"
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center">
                      <span className="spinner mr-2" />
                      저장 중...
                    </span>
                  ) : (
                    <>
                      <i className="fas fa-check mr-2"></i>
                      저장하고 계속
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => router.push('/profile')}
                  className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  나중에 입력
                </button>
              </div>
            </form>
          </div>

          {/* 다음 단계 안내 */}
          <div className="mt-6 bg-white rounded-xl shadow-sm p-6">
            <h3 className="font-semibold mb-3">
              <i className="fas fa-lightbulb text-yellow-500 mr-2"></i>
              다음 단계
            </h3>
            <p className="text-gray-600 mb-4">
              정보 저장 후 첫 번째 서비스를 등록해보세요!
            </p>
            <button
              onClick={() => router.push('/services/new')}
              className="btn-ai px-6 py-2"
            >
              <i className="fas fa-plus mr-2"></i>
              서비스 등록하기
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
