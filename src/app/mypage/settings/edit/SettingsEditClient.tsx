'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Sidebar from '@/components/mypage/Sidebar'
import { createClient } from '@/lib/supabase/client'

interface Props {
  profile: any
  isSeller: boolean
}

export default function SettingsEditClient({ profile, isSeller }: Props) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('profile')
  const [isLoading, setIsLoading] = useState(false)

  // 프로필 정보
  const [name, setName] = useState(profile?.name || '')
  const [bio, setBio] = useState('')

  // 비밀번호 변경
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  // 알림 설정
  const [orderNotification, setOrderNotification] = useState(true)
  const [messageNotification, setMessageNotification] = useState(true)
  const [reviewNotification, setReviewNotification] = useState(true)

  const supabase = createClient()

  // 프로필 저장
  const handleSaveProfile = async () => {
    try {
      setIsLoading(true)

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        alert('로그인이 필요합니다.')
        return
      }

      const { error } = await supabase
        .from('users')
        .update({
          name,
          bio
        })
        .eq('id', user.id)

      if (error) throw error

      alert('프로필이 저장되었습니다.')
      router.push('/mypage/settings')
    } catch (error) {
      console.error('Profile save error:', error)
      alert('프로필 저장 중 오류가 발생했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  // 비밀번호 변경
  const handleChangePassword = async () => {
    try {
      if (!currentPassword || !newPassword || !confirmPassword) {
        alert('모든 필드를 입력해주세요.')
        return
      }

      if (newPassword !== confirmPassword) {
        alert('새 비밀번호가 일치하지 않습니다.')
        return
      }

      if (newPassword.length < 6) {
        alert('비밀번호는 최소 6자 이상이어야 합니다.')
        return
      }

      setIsLoading(true)

      const { error } = await supabase.auth.updateUser({
        password: newPassword
      })

      if (error) throw error

      alert('비밀번호가 변경되었습니다.')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      router.push('/mypage/settings')
    } catch (error) {
      console.error('Password change error:', error)
      alert('비밀번호 변경 중 오류가 발생했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  // 알림 설정 저장
  const handleSaveNotifications = async () => {
    try {
      setIsLoading(true)

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        alert('로그인이 필요합니다.')
        return
      }

      // 알림 설정을 users 테이블이나 별도 notification_settings 테이블에 저장
      const { error } = await supabase
        .from('users')
        .update({
          notification_settings: {
            order: orderNotification,
            message: messageNotification,
            review: reviewNotification
          }
        })
        .eq('id', user.id)

      if (error) throw error

      alert('알림 설정이 저장되었습니다.')
      router.push('/mypage/settings')
    } catch (error) {
      console.error('Notification settings save error:', error)
      alert('알림 설정 저장 중 오류가 발생했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <Sidebar mode={isSeller ? 'seller' : 'buyer'} />
      <main className="flex-1 overflow-y-auto p-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">설정 수정</h1>
            <p className="text-gray-600">계정 및 알림 설정을 수정하세요</p>
          </div>
          <button
            onClick={() => router.push('/mypage/settings')}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <i className="fas fa-times mr-2"></i>
            취소
          </button>
        </div>

        <div className="flex gap-6">
          {/* 탭 메뉴 */}
          <div className="w-64 bg-white rounded-lg border border-gray-200 p-4">
            <button
              onClick={() => setActiveTab('profile')}
              className={`w-full px-4 py-2 rounded-lg text-left transition-colors ${
                activeTab === 'profile' ? 'bg-[#0f3460] text-white' : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <i className="fas fa-user mr-2"></i>
              프로필
            </button>
            <button
              onClick={() => setActiveTab('account')}
              className={`w-full px-4 py-2 rounded-lg text-left transition-colors mt-2 ${
                activeTab === 'account' ? 'bg-[#0f3460] text-white' : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <i className="fas fa-key mr-2"></i>
              계정 보안
            </button>
            <button
              onClick={() => setActiveTab('notifications')}
              className={`w-full px-4 py-2 rounded-lg text-left transition-colors mt-2 ${
                activeTab === 'notifications' ? 'bg-[#0f3460] text-white' : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <i className="fas fa-bell mr-2"></i>
              알림 설정
            </button>
          </div>

          {/* 설정 내용 */}
          <div className="flex-1">
            {activeTab === 'profile' && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">프로필 설정</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">프로필 이미지</label>
                    <div className="flex items-center gap-4">
                      <div className="w-20 h-20 bg-[#0f3460] rounded-full flex items-center justify-center text-white text-2xl font-bold">
                        {profile?.name?.[0] || 'U'}
                      </div>
                      <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm">
                        변경
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">이름</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0f3460] focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">이메일</label>
                    <input
                      type="email"
                      defaultValue={profile?.email || ''}
                      disabled
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">자기소개</label>
                    <textarea
                      rows={4}
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0f3460] focus:border-transparent"
                      placeholder="자기소개를 입력하세요"
                    ></textarea>
                  </div>

                  <button
                    onClick={handleSaveProfile}
                    disabled={isLoading}
                    className="px-6 py-2 bg-[#0f3460] text-white rounded-lg hover:bg-[#1a4d8f] transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? '저장 중...' : '저장'}
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'account' && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">계정 보안</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">현재 비밀번호</label>
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0f3460] focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">새 비밀번호</label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0f3460] focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">비밀번호 확인</label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0f3460] focus:border-transparent"
                    />
                  </div>

                  <button
                    onClick={handleChangePassword}
                    disabled={isLoading}
                    className="px-6 py-2 bg-[#0f3460] text-white rounded-lg hover:bg-[#1a4d8f] transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? '변경 중...' : '비밀번호 변경'}
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">알림 설정</h2>
                <div className="space-y-4">
                  <label className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <div className="font-medium text-gray-900">주문 알림</div>
                      <div className="text-sm text-gray-600">새 주문이 들어오면 알림을 받습니다</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={orderNotification}
                      onChange={(e) => setOrderNotification(e.target.checked)}
                      className="w-5 h-5 text-[#0f3460]"
                    />
                  </label>

                  <label className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <div className="font-medium text-gray-900">메시지 알림</div>
                      <div className="text-sm text-gray-600">새 메시지가 오면 알림을 받습니다</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={messageNotification}
                      onChange={(e) => setMessageNotification(e.target.checked)}
                      className="w-5 h-5 text-[#0f3460]"
                    />
                  </label>

                  <label className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <div className="font-medium text-gray-900">리뷰 알림</div>
                      <div className="text-sm text-gray-600">새 리뷰가 등록되면 알림을 받습니다</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={reviewNotification}
                      onChange={(e) => setReviewNotification(e.target.checked)}
                      className="w-5 h-5 text-[#0f3460]"
                    />
                  </label>

                  <button
                    onClick={handleSaveNotifications}
                    disabled={isLoading}
                    className="px-6 py-2 bg-[#0f3460] text-white rounded-lg hover:bg-[#1a4d8f] transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? '저장 중...' : '저장'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  )
}
