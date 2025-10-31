'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Sidebar from '@/components/mypage/Sidebar'
import { useAuth } from '@/components/providers/AuthProvider'

export default function SettingsPage() {
  const router = useRouter()
  const { profile } = useAuth()
  const [activeTab, setActiveTab] = useState('profile')

  return (
    <>
      <Sidebar mode={profile?.is_seller ? 'seller' : 'buyer'} />
      <main className="flex-1 overflow-y-auto p-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">설정</h1>
            <p className="text-gray-600">계정 및 알림 설정을 확인하세요</p>
          </div>
          <button
            onClick={() => router.push('/mypage/settings/edit')}
            className="px-6 py-3 bg-brand-primary text-white rounded-lg hover:bg-brand-light transition-colors font-medium"
          >
            <i className="fas fa-edit mr-2"></i>
            수정
          </button>
        </div>

        <div className="flex gap-6">
          {/* 탭 메뉴 */}
          <div className="w-64 bg-white rounded-lg border border-gray-200 p-4">
            <button
              onClick={() => setActiveTab('profile')}
              className={`w-full px-4 py-2 rounded-lg text-left transition-colors ${
                activeTab === 'profile' ? 'bg-brand-primary text-white' : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <i className="fas fa-user mr-2"></i>
              프로필
            </button>
            <button
              onClick={() => setActiveTab('account')}
              className={`w-full px-4 py-2 rounded-lg text-left transition-colors mt-2 ${
                activeTab === 'account' ? 'bg-brand-primary text-white' : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <i className="fas fa-key mr-2"></i>
              계정 보안
            </button>
            <button
              onClick={() => setActiveTab('notifications')}
              className={`w-full px-4 py-2 rounded-lg text-left transition-colors mt-2 ${
                activeTab === 'notifications' ? 'bg-brand-primary text-white' : 'text-gray-700 hover:bg-gray-100'
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
                <h2 className="text-xl font-bold text-gray-900 mb-6">프로필 정보</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">프로필 이미지</label>
                    <div className="flex items-center gap-4">
                      <div className="w-20 h-20 bg-brand-primary rounded-full flex items-center justify-center text-white text-2xl font-bold">
                        {profile?.name?.[0] || 'U'}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">이름</label>
                    <p className="text-gray-900">{profile?.name || '-'}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">이메일</label>
                    <p className="text-gray-900">{profile?.email || '-'}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">자기소개</label>
                    <p className="text-gray-900 whitespace-pre-wrap">{profile?.bio || '자기소개가 없습니다'}</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'account' && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">계정 보안</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">비밀번호</label>
                    <p className="text-gray-900">••••••••</p>
                    <p className="text-sm text-gray-500 mt-1">비밀번호를 변경하려면 수정 버튼을 클릭하세요</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">2단계 인증</label>
                    <p className="text-gray-900">설정되지 않음</p>
                    <p className="text-sm text-gray-500 mt-1">추가 보안을 위해 2단계 인증을 설정하세요</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">알림 설정</h2>
                <div className="space-y-4">
                  <div className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-900">주문 알림</div>
                        <div className="text-sm text-gray-600">새 주문이 들어오면 알림을 받습니다</div>
                      </div>
                      <span className="text-green-600 font-medium">켜짐</span>
                    </div>
                  </div>

                  <div className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-900">메시지 알림</div>
                        <div className="text-sm text-gray-600">새 메시지가 오면 알림을 받습니다</div>
                      </div>
                      <span className="text-green-600 font-medium">켜짐</span>
                    </div>
                  </div>

                  <div className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-900">리뷰 알림</div>
                        <div className="text-sm text-gray-600">새 리뷰가 등록되면 알림을 받습니다</div>
                      </div>
                      <span className="text-green-600 font-medium">켜짐</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  )
}
