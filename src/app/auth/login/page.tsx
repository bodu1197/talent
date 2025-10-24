'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      // 로그인 성공 - 홈으로 이동
      router.push('/')
      router.refresh()
    } catch (error: any) {
      setError(error.message || '로그인 중 오류가 발생했습니다.')
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
              <span className="gradient-text-ai">AI Talent Hub</span>
            </h1>
            <p className="text-gray-600">AI 재능 거래의 시작</p>
          </div>

          {/* 로그인 폼 */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                이메일
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input"
                placeholder="your@email.com"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                비밀번호
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input"
                placeholder="••••••••"
                required
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input type="checkbox" className="mr-2" />
                <span className="text-sm text-gray-600">로그인 상태 유지</span>
              </label>
              <Link href="/auth/forgot-password" className="text-sm text-primary-600 hover:text-primary-700">
                비밀번호 찾기
              </Link>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn-ai py-3 text-center font-semibold disabled:opacity-50"
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <span className="spinner mr-2" />
                  로그인 중...
                </span>
              ) : (
                '로그인'
              )}
            </button>
          </form>

          {/* 구분선 */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white px-4 text-gray-500">또는</span>
            </div>
          </div>

          {/* 소셜 로그인 */}
          <div className="space-y-3">
            <button className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <svg className="w-5 h-5" viewBox="0 0 20 20">
                <path
                  fill="#4285F4"
                  d="M19.5 10.2c0-.7-.1-1.3-.2-1.9H10v3.7h5.3c-.2 1.2-.9 2.2-1.9 2.9v2.4h3.1c1.8-1.7 2.9-4.1 2.9-7.1z"
                />
                <path
                  fill="#34A853"
                  d="M10 20c2.6 0 4.8-.9 6.4-2.3l-3.1-2.4c-.9.6-2 .9-3.3.9-2.5 0-4.7-1.7-5.4-4H1.3v2.5C2.9 17.9 6.2 20 10 20z"
                />
                <path
                  fill="#FBBC04"
                  d="M4.6 12.2c-.2-.6-.3-1.2-.3-1.9s.1-1.3.3-1.9V5.9H1.3C.5 7.4 0 9.1 0 10.9s.5 3.5 1.3 5l3.3-2.5z"
                />
                <path
                  fill="#EA4335"
                  d="M10 3.8c1.4 0 2.7.5 3.7 1.5l2.8-2.8C14.8.9 12.5 0 10 0 6.2 0 2.9 2.1 1.3 5.3l3.3 2.5c.7-2.3 2.9-4 5.4-4z"
                />
              </svg>
              <span className="text-gray-700 font-medium">Google로 로그인</span>
            </button>

            <button className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <svg className="w-5 h-5" fill="#000000" viewBox="0 0 20 20">
                <path d="M10 0C4.477 0 0 4.477 0 10c0 4.411 2.865 8.138 6.839 9.465.5.092.682-.217.682-.483 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.342-3.369-1.342-.454-1.155-1.11-1.463-1.11-1.463-.908-.62.069-.607.069-.607 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0110 4.836c.85.004 1.705.114 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .268.18.579.688.481C17.137 18.138 20 14.411 20 10c0-5.523-4.477-10-10-10z" />
              </svg>
              <span className="text-gray-700 font-medium">GitHub로 로그인</span>
            </button>
          </div>

          {/* 회원가입 링크 */}
          <div className="mt-6 text-center">
            <span className="text-gray-600">아직 계정이 없으신가요?</span>
            <Link href="/auth/register" className="ml-2 text-primary-600 hover:text-primary-700 font-semibold">
              회원가입
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}