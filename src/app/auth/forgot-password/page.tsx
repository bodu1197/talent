'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      })

      if (error) throw error

      setSuccess(true)
    } catch (error: any) {
      console.error('비밀번호 재설정 요청 실패:', error)
      setError(error.message || '비밀번호 재설정 요청 중 오류가 발생했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* 헤더 */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">
              <span className="text-[#0f3460]">비밀번호 찾기</span>
            </h1>
            <p className="text-gray-600">가입하신 이메일 주소를 입력해주세요</p>
          </div>

          {success ? (
            <div className="text-center">
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <i className="fas fa-check-circle text-green-600 text-4xl mb-3"></i>
                <p className="text-green-800 font-medium mb-2">이메일 전송 완료</p>
                <p className="text-sm text-green-700">
                  입력하신 이메일로 비밀번호 재설정 링크를 보내드렸습니다.
                  이메일을 확인해주세요.
                </p>
              </div>
              <Link
                href="/auth/login"
                className="inline-block w-full py-3 px-4 bg-[#0f3460] text-white rounded-lg hover:bg-[#1a4b7d] transition-colors"
              >
                로그인으로 돌아가기
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  이메일
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0f3460] focus:border-transparent"
                  placeholder="email@example.com"
                  required
                  disabled={isLoading}
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 bg-[#0f3460] text-white rounded-lg hover:bg-[#1a4b7d] transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <i className="fas fa-spinner fa-spin mr-2"></i>
                    전송 중...
                  </span>
                ) : (
                  '비밀번호 재설정 링크 받기'
                )}
              </button>

              <div className="text-center pt-4">
                <Link
                  href="/auth/login"
                  className="text-sm text-[#0f3460] hover:underline"
                >
                  로그인으로 돌아가기
                </Link>
              </div>
            </form>
          )}
        </div>

        {/* 하단 링크 */}
        <div className="text-center mt-6">
          <p className="text-gray-600">
            계정이 없으신가요?{' '}
            <Link href="/auth/register" className="text-[#0f3460] hover:underline font-medium">
              회원가입
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
