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
  const [profileImage, setProfileImage] = useState(profile?.profile_image || '')
  const [uploading, setUploading] = useState(false)

  // 비밀번호 변경
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  // 알림 설정
  const [orderNotification, setOrderNotification] = useState(true)
  const [messageNotification, setMessageNotification] = useState(true)
  const [reviewNotification, setReviewNotification] = useState(true)

  const supabase = createClient()

  // 프로필 이미지 업로드
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // 파일 크기 체크 (5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('파일 크기는 5MB 이하만 가능합니다.')
      return
    }

    // 이미지 파일 체크
    if (!file.type.startsWith('image/')) {
      alert('이미지 파일만 업로드 가능합니다.')
      return
    }

    try {
      setUploading(true)

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        alert('로그인이 필요합니다.')
        return
      }

      // 파일 확장자 추출
      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}_${Date.now()}.${fileExt}`
      const filePath = `profiles/${fileName}`

      // Supabase Storage에 업로드
      const { data, error: uploadError } = await supabase.storage
        .from('profiles')
        .upload(filePath, file, {
          upsert: true
        })

      if (uploadError) {
        console.error('Upload error:', uploadError)
        throw uploadError
      }

      // Public URL 가져오기
      const { data: { publicUrl } } = supabase.storage
        .from('profiles')
        .getPublicUrl(filePath)

      console.log('Image uploaded successfully:', publicUrl)
      setProfileImage(publicUrl)
      alert('프로필 이미지가 업로드되었습니다.')
    } catch (error) {
      console.error('Image upload error:', error)
      alert('이미지 업로드 중 오류가 발생했습니다.')
    } finally {
      setUploading(false)
    }
  }

  // 프로필 저장
  const handleSaveProfile = async () => {
    try {
      setIsLoading(true)

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        alert('로그인이 필요합니다.')
        return
      }

      console.log('Saving profile for user:', user.id)
      console.log('Name:', name)
      console.log('Bio:', bio)

      // 업데이트할 데이터 (필요한 필드만)
      const updateData: any = {
        name,
        profile_image: profileImage || null,
        updated_at: new Date().toISOString()
      }

      console.log('Update data:', updateData)

      const { data, error } = await supabase
        .from('users')
        .update(updateData)
        .eq('id', user.id)
        .select()

      if (error) {
        console.error('Supabase error FULL:', error)
        console.error('Error as JSON:', JSON.stringify(error, null, 2))
        console.error('Error keys:', Object.keys(error))
        console.error('Error values:', Object.values(error))
        alert(`프로필 저장 중 오류가 발생했습니다.\nError: ${error.message || 'Unknown error'}\nCode: ${error.code || 'N/A'}`)
        throw error
      }

      console.log('Profile updated successfully:', data)
      alert('프로필이 저장되었습니다.')
      router.push('/mypage/settings')
    } catch (error: any) {
      console.error('Profile save error:', error)
      if (!error.message) {
        alert('프로필 저장 중 알 수 없는 오류가 발생했습니다.')
      }
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
                      {profileImage ? (
                        <img
                          src={profileImage}
                          alt="프로필 이미지"
                          className="w-20 h-20 rounded-full object-cover border-2 border-gray-200"
                        />
                      ) : (
                        <div className="w-20 h-20 bg-[#0f3460] rounded-full flex items-center justify-center text-white text-2xl font-bold">
                          {name?.[0] || profile?.name?.[0] || 'U'}
                        </div>
                      )}
                      <div>
                        <input
                          type="file"
                          id="profile-image-upload"
                          accept="image/*"
                          onChange={handleImageUpload}
                          disabled={uploading}
                          className="hidden"
                        />
                        <label
                          htmlFor="profile-image-upload"
                          className={`inline-block px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm cursor-pointer ${
                            uploading ? 'opacity-50 cursor-not-allowed' : ''
                          }`}
                        >
                          {uploading ? '업로드 중...' : '변경'}
                        </label>
                        <p className="text-xs text-gray-500 mt-1">JPG, PNG (최대 5MB)</p>
                      </div>
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
