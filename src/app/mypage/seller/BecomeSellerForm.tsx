'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface Props {
  readonly userId: string
}

export default function BecomeSellerForm({ userId }: Props) {
  const router = useRouter()
  const [displayName, setDisplayName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!displayName.trim()) {
      setError('판매자명을 입력해주세요')
      return
    }

    setLoading(true)
    setError('')

    try {
      const supabase = createClient()

      // 1. Update profiles table with display name
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          name: displayName.trim(),
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)

      if (profileError) {
        setError('프로필 업데이트에 실패했습니다: ' + profileError.message)
        setLoading(false)
        return
      }

      // 2. Insert into sellers table (without display_name)
      const { error: insertError } = await supabase
        .from('sellers')
        .insert({
          user_id: userId,
          status: 'active'
        })

      if (insertError) {
        setError('판매자 등록에 실패했습니다: ' + insertError.message)
        setLoading(false)
        return
      }

      router.push('/mypage/seller/dashboard')
      router.refresh()
    } catch {
      setError('오류가 발생했습니다')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-base md:text-lg font-bold text-gray-900 mb-2">판매자 되기</h1>
          <p className="text-sm md:text-base text-gray-600 mb-6">판매자명을 입력하세요</p>

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label htmlFor="seller-name" className="block text-sm font-medium text-gray-700 mb-2">
                판매자명 *
              </label>
              <input
                id="seller-name"
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="판매자로 활동할 이름"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                required
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              disabled={loading || !displayName.trim()}
              className="w-full bg-brand-primary text-white py-3 rounded-lg font-medium hover:bg-[#1a4d8f] transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? '등록 중...' : '판매자 등록'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
