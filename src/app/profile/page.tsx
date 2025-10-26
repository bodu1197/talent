'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/providers/AuthProvider'
import { createClient } from '@/lib/supabase/client'

export default function ProfilePage() {
  const { user, profile, refreshProfile } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    bio: '',
  })

  // 프로필 데이터 로드
  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || '',
        phone: profile.phone || '',
        bio: profile.bio || '',
      })
    }
  }, [profile])

  // 로그인 체크
  useEffect(() => {
    if (!user) {
      router.push('/auth/login')
    }
  }, [user, router])

  // 프로필 업데이트
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage(null)

    if (!user?.id) {
      setMessage({ type: 'error', text: '사용자 정보를 찾을 수 없습니다.' })
      setIsLoading(false)
      return
    }

    try {
      const updateData: {
        name: string
        phone?: string
        bio?: string
      } = {
        name: formData.name,
        phone: formData.phone,
        bio: formData.bio,
      }

      const { error } = await supabase
        .from('users')
        .update(updateData as any)
        .eq('id', user.id)

      if (error) throw error

      await refreshProfile()
      setMessage({ type: 'success', text: '프로필이 업데이트되었습니다.' })
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || '프로필 업데이트 중 오류가 발생했습니다.' })
    } finally {
      setIsLoading(false)
    }
  }

  // 판매자 되기
  const handleBecomeSeller = async () => {
    if (!confirm('판매자로 전환하시겠습니까?\n서비스 등록 및 판매가 가능해집니다.')) {
      return
    }

    if (!user?.id) {
      setMessage({ type: 'error', text: '사용자 정보를 찾을 수 없습니다.' })
      return
    }

    setIsLoading(true)
    setMessage(null)

    try {
      // seller_profiles 생성
      const { error: sellerProfileError } = await supabase
        .from('seller_profiles')
        .insert({
          user_id: user.id,
        })

      // 이미 존재하는 경우 무시
      if (sellerProfileError && !sellerProfileError.message.includes('duplicate')) {
        throw sellerProfileError
      }

      // user_type을 'both'로 업데이트
      const { error: updateError } = await supabase
        .from('users')
        .update({ user_type: 'both' })
        .eq('id', user.id)

      if (updateError) throw updateError

      await refreshProfile()
      setMessage({ type: 'success', text: '판매자 전환이 완료되었습니다! 이제 서비스를 등록할 수 있습니다.' })

      // 2초 후 판매자 등록 페이지로 이동
      setTimeout(() => {
        router.push('/seller/register')
      }, 2000)
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || '판매자 전환 중 오류가 발생했습니다.' })
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
        <div className="max-w-4xl mx-auto">
          {/* 헤더 */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <h1 className="text-2xl font-bold mb-2">마이페이지</h1>
            <p className="text-gray-600">프로필 정보를 관리하고 계정 설정을 변경할 수 있습니다.</p>
          </div>

          {/* 메시지 */}
          {message && (
            <div className={`mb-6 p-4 rounded-lg ${
              message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
            }`}>
              {message.text}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* 왼쪽: 프로필 요약 */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="text-center">
                  <div className="w-24 h-24 bg-[#0f3460] rounded-full flex items-center justify-center text-white text-3xl font-bold mx-auto mb-4">
                    {profile.name?.[0] || 'U'}
                  </div>
                  <h2 className="text-xl font-bold mb-1">{profile.name}</h2>
                  <p className="text-gray-600 text-sm mb-4">{user.email}</p>

                  {/* 회원 타입 배지 */}
                  <div className="flex justify-center gap-2 mb-6">
                    {profile.user_type === 'buyer' && (
                      <span className="px-3 py-1 bg-blue-100 text-[#0f3460] rounded-full text-sm font-medium">
                        구매자
                      </span>
                    )}
                    {profile.user_type === 'seller' && (
                      <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                        판매자
                      </span>
                    )}
                    {profile.user_type === 'both' && (
                      <>
                        <span className="px-3 py-1 bg-blue-100 text-[#0f3460] rounded-full text-sm font-medium">
                          구매자
                        </span>
                        <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                          판매자
                        </span>
                      </>
                    )}
                  </div>

                  {/* 판매자 되기 버튼 (buyer인 경우만) */}
                  {profile.user_type === 'buyer' && (
                    <button
                      onClick={handleBecomeSeller}
                      disabled={isLoading}
                      className="w-full px-4 py-3 bg-[#0f3460] text-white rounded-lg hover:bg-[#1a4b7d] transition-colors disabled:opacity-50 font-semibold"
                    >
                      {isLoading ? (
                        <span className="flex items-center justify-center">
                          <span className="spinner mr-2" />
                          처리 중...
                        </span>
                      ) : (
                        <>
                          <i className="fas fa-store mr-2"></i>
                          판매자 되기
                        </>
                      )}
                    </button>
                  )}

                  {/* 관리 페이지 바로가기 (both/seller인 경우) */}
                  {(profile.user_type === 'seller' || profile.user_type === 'both') && (
                    <div className="space-y-3">
                      <div className="text-sm font-medium text-gray-700 mb-2">관리 페이지</div>

                      <button
                        onClick={() => router.push('/buyer/orders')}
                        className="w-full px-4 py-2.5 border-2 border-blue-500 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-medium"
                      >
                        <i className="fas fa-shopping-bag mr-2"></i>
                        구매 관리
                      </button>

                      <button
                        onClick={() => router.push('/seller/dashboard')}
                        className="w-full px-4 py-2.5 border-2 border-green-600 text-green-600 rounded-lg hover:bg-green-50 transition-colors font-medium"
                      >
                        <i className="fas fa-chart-line mr-2"></i>
                        판매 관리
                      </button>
                    </div>
                  )}
                </div>

                <div className="border-t border-gray-200 mt-6 pt-6">
                  <h3 className="font-semibold mb-3">빠른 링크</h3>
                  <div className="space-y-2">
                    <button
                      onClick={() => router.push('/buyer/orders')}
                      className="w-full text-left px-3 py-2 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      <i className="fas fa-shopping-bag w-5 mr-2 text-gray-600"></i>
                      구매 내역
                    </button>
                    <button
                      onClick={() => router.push('/buyer/favorites')}
                      className="w-full text-left px-3 py-2 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      <i className="far fa-heart w-5 mr-2 text-gray-600"></i>
                      찜한 서비스
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* 오른쪽: 프로필 수정 폼 */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-bold mb-6">프로필 정보 수정</h2>

                <form onSubmit={handleUpdateProfile} className="space-y-6">
                  {/* 이메일 (읽기 전용) */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      이메일
                    </label>
                    <input
                      type="email"
                      value={user.email || ''}
                      disabled
                      className="input bg-gray-100 cursor-not-allowed"
                    />
                    <p className="text-xs text-gray-500 mt-1">이메일은 변경할 수 없습니다.</p>
                  </div>

                  {/* 이름 */}
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                      이름 *
                    </label>
                    <input
                      id="name"
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="input"
                      placeholder="홍길동"
                      required
                    />
                  </div>

                  {/* 전화번호 */}
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                      전화번호
                    </label>
                    <input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="input"
                      placeholder="010-1234-5678"
                    />
                  </div>

                  {/* 소개 */}
                  <div>
                    <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-2">
                      자기소개
                    </label>
                    <textarea
                      id="bio"
                      value={formData.bio}
                      onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                      className="textarea"
                      rows={4}
                      placeholder="자기소개를 입력해주세요."
                    />
                  </div>

                  {/* 저장 버튼 */}
                  <div className="flex gap-3">
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
                        '변경사항 저장'
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => router.push('/')}
                      className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      취소
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
