'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { generateRandomNickname, generateProfileImage } from '@/lib/utils/nickname-generator'

export default function RegisterPage() {
  const [randomNickname, setRandomNickname] = useState('')
  const [profileImage, setProfileImage] = useState('')

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    passwordConfirm: '',
    agreeTerms: false,
    agreePrivacy: false,
    agreeMarketing: false,
  })
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  // 컴포넌트 마운트 시 랜덤 닉네임 생성
  useEffect(() => {
    generateNewNickname()
  }, [])

  const generateNewNickname = () => {
    const nickname = generateRandomNickname()
    setRandomNickname(nickname)
    setProfileImage(generateProfileImage(nickname))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // 유효성 검사
    if (formData.password !== formData.passwordConfirm) {
      setError('비밀번호가 일치하지 않습니다.')
      return
    }

    if (formData.password.length < 8) {
      setError('비밀번호는 8자 이상이어야 합니다.')
      return
    }

    if (!formData.agreeTerms || !formData.agreePrivacy) {
      setError('필수 약관에 동의해주세요.')
      return
    }

    setIsLoading(true)

    try {
      // Supabase Auth 회원가입
      // 트리거가 자동으로 users 테이블에 프로필 생성
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            name: randomNickname,
            profile_image: profileImage,
          },
        },
      })

      if (authError) throw authError

      if (authData.user) {
        // 회원가입 성공 - 트리거가 자동으로 users 테이블 프로필 생성
        router.push('/auth/login?registered=true')
      }
    } catch (error: any) {
      setError(error.message || '회원가입 중 오류가 발생했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* 헤더 */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">
              <span className="gradient-text">AI Talent Hub</span>
            </h1>
            <p className="text-gray-600">AI 재능 거래 플랫폼에 오신 것을 환영합니다</p>
          </div>

          {/* 회원가입 폼 */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* 이메일 */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                이메일 *
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="input"
                placeholder="your@email.com"
                required
              />
            </div>

            {/* 비밀번호 */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                비밀번호 * <span className="text-xs text-gray-500">(8자 이상)</span>
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="input"
                placeholder="••••••••"
                required
              />
            </div>

            {/* 비밀번호 확인 */}
            <div>
              <label htmlFor="passwordConfirm" className="block text-sm font-medium text-gray-700 mb-1">
                비밀번호 확인 *
              </label>
              <input
                id="passwordConfirm"
                name="passwordConfirm"
                type="password"
                autoComplete="new-password"
                value={formData.passwordConfirm}
                onChange={(e) => setFormData({ ...formData, passwordConfirm: e.target.value })}
                className="input"
                placeholder="••••••••"
                required
              />
            </div>

            {/* 랜덤 닉네임 및 프로필 이미지 */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                프로필 정보 (자동 생성)
              </label>
              <div className="flex items-center gap-4">
                <img
                  src={profileImage}
                  alt="프로필 이미지"
                  className="w-16 h-16 rounded-full bg-white border-2 border-gray-200"
                />
                <div className="flex-1">
                  <p className="text-lg font-semibold text-gray-900">{randomNickname}</p>
                  <p className="text-xs text-gray-500">회원가입 후 마이페이지에서 변경 가능합니다</p>
                </div>
                <button
                  type="button"
                  onClick={generateNewNickname}
                  className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  🔄 새로고침
                </button>
              </div>
            </div>

            {/* 회원 유형 선택 제거 - 기본값: 구매자 */}
            {/* 마이페이지에서 판매자로 전환 가능 */}

            {/* 약관 동의 */}
            <div className="space-y-2 pt-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.agreeTerms}
                  onChange={(e) => setFormData({ ...formData, agreeTerms: e.target.checked })}
                  className="mr-2"
                />
                <span className="text-sm text-gray-600">
                  <Link href="/terms" className="text-primary-600 hover:underline">이용약관</Link>에 동의합니다 *
                </span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.agreePrivacy}
                  onChange={(e) => setFormData({ ...formData, agreePrivacy: e.target.checked })}
                  className="mr-2"
                />
                <span className="text-sm text-gray-600">
                  <Link href="/privacy" className="text-primary-600 hover:underline">개인정보처리방침</Link>에 동의합니다 *
                </span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.agreeMarketing}
                  onChange={(e) => setFormData({ ...formData, agreeMarketing: e.target.checked })}
                  className="mr-2"
                />
                <span className="text-sm text-gray-600">
                  마케팅 정보 수신에 동의합니다 (선택)
                </span>
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn-ai py-3 text-center font-semibold disabled:opacity-50"
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <span className="spinner mr-2" />
                  가입 중...
                </span>
              ) : (
                '회원가입'
              )}
            </button>
          </form>

          {/* 로그인 링크 */}
          <div className="mt-6 text-center">
            <span className="text-gray-600">이미 계정이 있으신가요?</span>
            <Link href="/auth/login" className="ml-2 text-primary-600 hover:text-primary-700 font-semibold">
              로그인
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}