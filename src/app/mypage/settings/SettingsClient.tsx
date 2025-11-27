'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import MypageLayoutWrapper from '@/components/mypage/MypageLayoutWrapper';
import { Edit, User, Key, Bell } from 'lucide-react';

interface ProfileData {
  name: string;
  email?: string;
  profile_image?: string | null;
  phone?: string | null;
  bio?: string | null;
}

interface Props {
  readonly profile: ProfileData;
  readonly userEmail: string;
  readonly isSeller: boolean;
}

export default function SettingsClient({ profile, userEmail, isSeller }: Props) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('profile');

  return (
    <MypageLayoutWrapper mode={isSeller ? 'seller' : 'buyer'}>
      <div className="py-4 px-4 lg:py-8 lg:px-6">
        <div className="mb-4 lg:mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-base lg:text-lg font-semibold text-gray-900">설정</h1>
            <p className="text-gray-600 mt-1 text-sm">계정 및 알림 설정을 확인하세요</p>
          </div>
          <button
            onClick={() => router.push('/mypage/settings/edit')}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-[#1a4d8f] transition-colors text-sm font-medium"
          >
            <Edit className="w-4 h-4" />
            수정
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
          {/* 탭 메뉴 */}
          <div className="w-full lg:w-56 bg-white rounded-lg border border-gray-200 p-3 lg:p-4">
            <div className="flex lg:flex-col gap-2">
              <button
                onClick={() => setActiveTab('profile')}
                className={`flex-1 lg:w-full px-3 py-2 rounded-lg text-left transition-colors text-sm ${
                  activeTab === 'profile'
                    ? 'bg-brand-primary text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <User className="mr-1.5 inline w-4 h-4" />
                프로필
              </button>
              <button
                onClick={() => setActiveTab('account')}
                className={`flex-1 lg:w-full px-3 py-2 rounded-lg text-left transition-colors text-sm ${
                  activeTab === 'account'
                    ? 'bg-brand-primary text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Key className="mr-1.5 inline w-4 h-4" />
                계정 보안
              </button>
              <button
                onClick={() => setActiveTab('notifications')}
                className={`flex-1 lg:w-full px-3 py-2 rounded-lg text-left transition-colors text-sm ${
                  activeTab === 'notifications'
                    ? 'bg-brand-primary text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Bell className="mr-1.5 inline w-4 h-4" />
                알림
              </button>
            </div>
          </div>

          {/* 설정 내용 */}
          <div className="flex-1">
            {activeTab === 'profile' && (
              <div className="bg-white rounded-lg border border-gray-200 p-4 lg:p-6">
                <h2 className="text-sm lg:text-base font-semibold text-gray-900 mb-4">
                  프로필 정보
                </h2>
                <div className="space-y-4">
                  <div>
                    <span className="block text-xs font-medium text-gray-700 mb-2">
                      프로필 이미지
                    </span>
                    <div className="flex items-center gap-4">
                      {profile?.profile_image ? (
                        <img
                          src={profile.profile_image}
                          alt={profile.name || '프로필'}
                          className="w-20 h-20 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-20 h-20 bg-brand-primary rounded-full flex items-center justify-center text-white text-2xl font-semibold">
                          {profile?.name?.[0] || 'U'}
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <span className="block text-xs font-medium text-gray-700 mb-1">이름</span>
                    <p className="text-sm text-gray-900">{profile?.name || '-'}</p>
                  </div>

                  <div>
                    <span className="block text-xs font-medium text-gray-700 mb-1">이메일</span>
                    <p className="text-sm text-gray-900">{userEmail || '-'}</p>
                  </div>

                  <div>
                    <span className="block text-xs font-medium text-gray-700 mb-1">자기소개</span>
                    <p className="text-sm text-gray-900 whitespace-pre-wrap">
                      {profile?.bio || '자기소개가 없습니다'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'account' && (
              <div className="bg-white rounded-lg border border-gray-200 p-4 lg:p-6">
                <h2 className="text-sm lg:text-base font-semibold text-gray-900 mb-4">계정 보안</h2>
                <div className="space-y-4">
                  <div>
                    <span className="block text-xs font-medium text-gray-700 mb-1">비밀번호</span>
                    <p className="text-sm text-gray-900">••••••••</p>
                    <p className="text-xs text-gray-500 mt-1">
                      비밀번호를 변경하려면 수정 버튼을 클릭하세요
                    </p>
                  </div>

                  <div>
                    <span className="block text-xs font-medium text-gray-700 mb-1">2단계 인증</span>
                    <p className="text-sm text-gray-900">설정되지 않음</p>
                    <p className="text-xs text-gray-500 mt-1">
                      추가 보안을 위해 2단계 인증을 설정하세요
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="bg-white rounded-lg border border-gray-200 p-4 lg:p-6">
                <h2 className="text-sm lg:text-base font-semibold text-gray-900 mb-4">알림 설정</h2>
                <div className="space-y-3">
                  <div className="p-3 border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-medium text-gray-900">주문 알림</div>
                        <div className="text-xs text-gray-600">
                          새 주문이 들어오면 알림을 받습니다
                        </div>
                      </div>
                      <span className="text-xs text-green-600 font-medium">켜짐</span>
                    </div>
                  </div>

                  <div className="p-3 border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-medium text-gray-900">메시지 알림</div>
                        <div className="text-xs text-gray-600">
                          새 메시지가 오면 알림을 받습니다
                        </div>
                      </div>
                      <span className="text-xs text-green-600 font-medium">켜짐</span>
                    </div>
                  </div>

                  <div className="p-3 border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-medium text-gray-900">리뷰 알림</div>
                        <div className="text-xs text-gray-600">
                          새 리뷰가 등록되면 알림을 받습니다
                        </div>
                      </div>
                      <span className="text-xs text-green-600 font-medium">켜짐</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </MypageLayoutWrapper>
  );
}
