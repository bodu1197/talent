'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { generateRandomNickname, generateProfileImage } from '@/lib/utils/nickname-generator'
import { getSecureRedirectUrl, createOAuthState, RATE_LIMIT_CONFIG } from '@/lib/auth/config'
import { logger } from '@/lib/logger'

export default function RegisterPage() {
  const [randomNickname, setRandomNickname] = useState('')
  const [profileImage, setProfileImage] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false)
  const [registerAttempts, setRegisterAttempts] = useState(0)
  const [lockoutUntil, setLockoutUntil] = useState<number | null>(null)
  const [emailCheckStatus, setEmailCheckStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle')
  const [emailCheckMessage, setEmailCheckMessage] = useState<string>('')

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

  // 비밀번호 조건 검사
  const passwordValidation = {
    minLength: formData.password.length >= 8,
    hasLetter: /[a-zA-Z]/.test(formData.password),
    hasNumber: /\d/.test(formData.password),
    hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(formData.password),
  }

  const isPasswordValid = passwordValidation.minLength &&
                          passwordValidation.hasLetter &&
                          passwordValidation.hasNumber &&
                          passwordValidation.hasSpecial

  // 컴포넌트 마운트 시 랜덤 닉네임 생성
  useEffect(() => {
    generateNewNickname()
  }, [])

  // 이메일 중복 체크 (debounce 적용)
  useEffect(() => {
    const checkEmailAvailability = async () => {
      const email = formData.email.trim()

      // 이메일이 비어있거나 유효하지 않으면 체크하지 않음
      if (!email || !email.includes('@')) {
        setEmailCheckStatus('idle')
        setEmailCheckMessage('')
        return
      }

      setEmailCheckStatus('checking')
      setEmailCheckMessage('이메일 확인 중...')

      try {
        // API를 통해 서버에서 이메일 중복 체크
        const response = await fetch('/api/auth/check-email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email }),
        })

        const data = await response.json()

        if (!response.ok) {
          logger.error('이메일 중복 체크 오류:', data.error)
          setEmailCheckStatus('idle')
          setEmailCheckMessage('')
          return
        }

        if (data.available) {
          setEmailCheckStatus('available')
          setEmailCheckMessage(data.message)
        } else {
          setEmailCheckStatus('taken')
          setEmailCheckMessage(data.message)
        }
      } catch (err) {
        logger.error('이메일 중복 체크 오류:', err)
        setEmailCheckStatus('idle')
        setEmailCheckMessage('')
      }
    }

    // Debounce: 500ms 후에 체크
    const timeoutId = setTimeout(() => {
      checkEmailAvailability()
    }, 500)

    return () => clearTimeout(timeoutId)
  }, [formData.email])

  const generateNewNickname = () => {
    const nickname = generateRandomNickname()
    setRandomNickname(nickname)
    setProfileImage(generateProfileImage(nickname))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Rate Limiting 체크
    if (lockoutUntil && Date.now() < lockoutUntil) {
      const remainingSeconds = Math.ceil((lockoutUntil - Date.now()) / 1000)
      setError(`너무 많은 시도가 있었습니다. ${remainingSeconds}초 후 다시 시도해주세요.`)
      return
    }

    setError(null)

    // 이메일 중복 체크
    if (emailCheckStatus === 'taken') {
      setError('이미 사용 중인 이메일입니다. 다른 이메일을 사용해주세요.')
      return
    }

    if (emailCheckStatus === 'checking') {
      setError('이메일 확인 중입니다. 잠시만 기다려주세요.')
      return
    }

    // 유효성 검사
    if (!isPasswordValid) {
      setError('비밀번호 조건을 모두 충족해주세요.')
      return
    }

    if (formData.password !== formData.passwordConfirm) {
      setError('비밀번호가 일치하지 않습니다.')
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
        // 회원가입 성공 - 시도 횟수 초기화
        setRegisterAttempts(0)
        setLockoutUntil(null)

        // 이메일 인증 없이 즉시 로그인 처리
        // authData.session이 있으면 이미 로그인된 상태
        if (authData.session) {
          // 즉시 홈으로 리다이렉트
          router.push('/')
        } else {
          // 세션이 없으면 (이메일 인증 필요한 경우) 로그인 페이지로
          router.push('/auth/login?registered=true')
        }
      }
    } catch (error: unknown) {
      logger.error('회원가입 실패:', error)

      const newAttempts = registerAttempts + 1
      setRegisterAttempts(newAttempts)

      // Rate Limiting 적용
      if (newAttempts >= RATE_LIMIT_CONFIG.REGISTER.MAX_ATTEMPTS) {
        setLockoutUntil(Date.now() + RATE_LIMIT_CONFIG.REGISTER.LOCKOUT_DURATION)
        setError('너무 많은 시도가 있었습니다. 10분 후 다시 시도해주세요.')
      } else {
        const message = error instanceof Error ? error.message : '회원가입 중 오류가 발생했습니다.'
        setError(message)
      }
    } finally {
      setIsLoading(false)
    }
  }

  // SNS 로그인 핸들러
  const handleSocialLogin = async (provider: 'kakao' | 'google' | 'apple') => {
    try {
      setIsLoading(true)
      setError(null)

      // OAuth 리다이렉트 URL 검증 (CRITICAL 보안)
      const redirectUrl = getSecureRedirectUrl(window.location.origin, '/auth/callback')

      // state 파라미터로 안전하게 전달 (localStorage 대신)
      const state = createOAuthState({
        nickname: randomNickname,
        profileImage: profileImage,
      })

      const { error } = await supabase.auth.signInWithOAuth({
        provider: provider,
        options: {
          redirectTo: `${redirectUrl}?state=${encodeURIComponent(state)}`,
        }
      })

      if (error) throw error
    } catch (error: unknown) {
      logger.error('SNS 로그인 실패:', error)
      const message = error instanceof Error ? error.message : 'SNS 로그인 중 오류가 발생했습니다.'
      setError(message)
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

          {/* SNS 간편 회원가입 */}
          <div className="space-y-3 mb-6">
            <button
              type="button"
              onClick={() => handleSocialLogin('kakao')}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-3 bg-[#FEE500] hover:bg-[#F5DC00] text-[#000000] font-semibold py-3 px-4 rounded-lg transition-colors disabled:opacity-50"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 3C6.48 3 2 6.58 2 11c0 2.78 1.83 5.23 4.58 6.76-.2.74-.77 2.84-.89 3.29-.14.52.19.51.4.37.16-.11 2.56-1.76 2.97-2.04.62.08 1.27.12 1.94.12 5.52 0 10-3.58 10-8S17.52 3 12 3z"/>
              </svg>
              카카오로 시작하기
            </button>

            <button
              type="button"
              onClick={() => handleSocialLogin('google')}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-50 text-gray-700 font-semibold py-3 px-4 rounded-lg border border-gray-300 transition-colors disabled:opacity-50"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              구글로 시작하기
            </button>

            <button
              type="button"
              onClick={() => handleSocialLogin('apple')}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-3 bg-black hover:bg-gray-900 text-white font-semibold py-3 px-4 rounded-lg transition-colors disabled:opacity-50"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
              </svg>
              Apple로 시작하기
            </button>
          </div>

          {/* 구분선 */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500">또는 이메일로 가입</span>
            </div>
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
              <div className="relative">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className={`input pr-10 ${
                    emailCheckStatus === 'taken' ? 'border-red-500 focus:ring-red-500' :
                    emailCheckStatus === 'available' ? 'border-green-500 focus:ring-green-500' : ''
                  }`}
                  placeholder="your@email.com"
                  required
                />
                {emailCheckStatus === 'checking' && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <svg className="animate-spin h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </div>
                )}
                {emailCheckStatus === 'available' && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-green-600">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
                {emailCheckStatus === 'taken' && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-red-600">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                )}
              </div>
              {emailCheckMessage && (
                <p className={`mt-1 text-xs ${
                  emailCheckStatus === 'taken' ? 'text-red-600' :
                  emailCheckStatus === 'available' ? 'text-green-600' :
                  'text-gray-500'
                }`}>
                  {emailCheckMessage}
                </p>
              )}
            </div>

            {/* 비밀번호 */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                비밀번호 *
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="input pr-10"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
              {/* 비밀번호 조건 표시 */}
              {formData.password && (
                <div className="mt-2 space-y-1">
                  <div className={`flex items-center gap-2 text-xs ${passwordValidation.minLength ? 'text-green-600' : 'text-gray-500'}`}>
                    <span>{passwordValidation.minLength ? '✓' : '○'}</span>
                    <span>8자 이상</span>
                  </div>
                  <div className={`flex items-center gap-2 text-xs ${passwordValidation.hasLetter ? 'text-green-600' : 'text-gray-500'}`}>
                    <span>{passwordValidation.hasLetter ? '✓' : '○'}</span>
                    <span>영문 포함</span>
                  </div>
                  <div className={`flex items-center gap-2 text-xs ${passwordValidation.hasNumber ? 'text-green-600' : 'text-gray-500'}`}>
                    <span>{passwordValidation.hasNumber ? '✓' : '○'}</span>
                    <span>숫자 포함</span>
                  </div>
                  <div className={`flex items-center gap-2 text-xs ${passwordValidation.hasSpecial ? 'text-green-600' : 'text-gray-500'}`}>
                    <span>{passwordValidation.hasSpecial ? '✓' : '○'}</span>
                    <span>특수문자 포함 (!@#$%^&* 등)</span>
                  </div>
                </div>
              )}
            </div>

            {/* 비밀번호 확인 */}
            <div>
              <label htmlFor="passwordConfirm" className="block text-sm font-medium text-gray-700 mb-1">
                비밀번호 확인 *
              </label>
              <div className="relative">
                <input
                  id="passwordConfirm"
                  name="passwordConfirm"
                  type={showPasswordConfirm ? "text" : "password"}
                  autoComplete="new-password"
                  value={formData.passwordConfirm}
                  onChange={(e) => setFormData({ ...formData, passwordConfirm: e.target.value })}
                  className="input pr-10"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPasswordConfirm ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.542 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
              {/* 비밀번호 일치 여부 표시 */}
              {formData.passwordConfirm && (
                <div className={`mt-2 flex items-center gap-2 text-xs ${formData.password === formData.passwordConfirm ? 'text-green-600' : 'text-red-600'}`}>
                  <span>{formData.password === formData.passwordConfirm ? '✓' : '✗'}</span>
                  <span>{formData.password === formData.passwordConfirm ? '비밀번호가 일치합니다' : '비밀번호가 일치하지 않습니다'}</span>
                </div>
              )}
            </div>

            {/* 랜덤 닉네임 및 프로필 이미지 */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                프로필 정보 (자동 생성)
              </label>
              <div className="flex items-center gap-4">
                {profileImage && (
                  <img
                    src={profileImage}
                    alt="프로필 이미지"
                    className="w-16 h-16 rounded-full bg-white border-2 border-gray-200"
                  />
                )}
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