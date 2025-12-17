'use client';

import { useState, useEffect } from 'react';
import ErrandMypageLayout from '@/components/errands/ErrandMypageLayout';
import { useAuth } from '@/components/providers/AuthProvider';
import SettingsLoadingState from '@/components/errands/SettingsLoadingState';
import ProfileSection from '@/components/errands/ProfileSection';
import SaveButtonContent from '@/components/common/SaveButtonContent';
import { MapPin, Bell, Shield, ChevronRight } from 'lucide-react';

interface UserSettings {
  name: string;
  phone: string;
  defaultAddress: string;
  notifications: {
    push: boolean;
    email: boolean;
    sms: boolean;
  };
}

export default function RequesterSettingsPage() {
  const { user, profile } = useAuth();
  const [settings, setSettings] = useState<UserSettings>({
    name: '',
    phone: '',
    defaultAddress: '',
    notifications: {
      push: true,
      email: true,
      sms: false,
    },
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (profile) {
      setSettings({
        name: profile.name ?? '',
        phone: profile.phone ?? '',
        defaultAddress: '',
        notifications: {
          push: true,
          email: true,
          sms: false,
        },
      });
      setLoading(false);
    }
  }, [profile]);

  async function handleSave() {
    try {
      setSaving(true);
      // API 호출로 설정 저장
      const response = await fetch('/api/user/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });

      if (response.ok) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (error) {
      console.error('설정 저장 실패:', error);
    } finally {
      setSaving(false);
    }
  }

  const updateNotification = (key: keyof typeof settings.notifications, value: boolean) => {
    setSettings((prev) => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [key]: value,
      },
    }));
  };

  return (
    <ErrandMypageLayout mode="requester">
      <div className="p-4 lg:p-0">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-gray-900">설정</h1>
          <p className="text-gray-600 mt-1">심부름 서비스 이용 설정을 관리하세요</p>
        </div>

        {loading ? (
          <SettingsLoadingState />
        ) : (
          <div className="space-y-6">
            {/* 프로필 정보 */}
            <ProfileSection
              profile={profile}
              userEmail={user?.email}
              name={settings.name}
              phone={settings.phone}
              onNameChange={(value) => setSettings({ ...settings, name: value })}
              onPhoneChange={(value) => setSettings({ ...settings, phone: value })}
              idPrefix="user"
            />

            {/* 기본 배달 주소 */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="p-4 border-b border-gray-100">
                <h2 className="font-bold text-gray-900">배달 설정</h2>
              </div>
              <div className="p-4">
                <div>
                  <label
                    htmlFor="user-default-address"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    기본 배달 주소
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      id="user-default-address"
                      type="text"
                      value={settings.defaultAddress}
                      onChange={(e) => setSettings({ ...settings, defaultAddress: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="자주 사용하는 배달 주소"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 알림 설정 */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="p-4 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <Bell className="w-5 h-5 text-gray-600" />
                  <h2 className="font-bold text-gray-900">알림 설정</h2>
                </div>
              </div>
              <div className="divide-y divide-gray-100">
                <div className="flex items-center justify-between p-4">
                  <div>
                    <p className="font-medium text-gray-900">푸시 알림</p>
                    <p className="text-sm text-gray-500">심부름 상태 변경 시 알림</p>
                  </div>
                  <button
                    onClick={() => updateNotification('push', !settings.notifications.push)}
                    className={`w-12 h-6 rounded-full transition-colors ${
                      settings.notifications.push ? 'bg-blue-600' : 'bg-gray-300'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform ${
                        settings.notifications.push ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
                <div className="flex items-center justify-between p-4">
                  <div>
                    <p className="font-medium text-gray-900">이메일 알림</p>
                    <p className="text-sm text-gray-500">이메일로 알림 받기</p>
                  </div>
                  <button
                    onClick={() => updateNotification('email', !settings.notifications.email)}
                    className={`w-12 h-6 rounded-full transition-colors ${
                      settings.notifications.email ? 'bg-blue-600' : 'bg-gray-300'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform ${
                        settings.notifications.email ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
                <div className="flex items-center justify-between p-4">
                  <div>
                    <p className="font-medium text-gray-900">SMS 알림</p>
                    <p className="text-sm text-gray-500">문자로 알림 받기</p>
                  </div>
                  <button
                    onClick={() => updateNotification('sms', !settings.notifications.sms)}
                    className={`w-12 h-6 rounded-full transition-colors ${
                      settings.notifications.sms ? 'bg-blue-600' : 'bg-gray-300'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform ${
                        settings.notifications.sms ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* 계정 관리 */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="p-4 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-gray-600" />
                  <h2 className="font-bold text-gray-900">계정 관리</h2>
                </div>
              </div>
              <div className="divide-y divide-gray-100">
                <button className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
                  <span className="text-gray-900">비밀번호 변경</span>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </button>
                <button className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
                  <span className="text-gray-900">결제 수단 관리</span>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </button>
                <button className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
                  <span className="text-red-600">계정 삭제</span>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </button>
              </div>
            </div>

            {/* 저장 버튼 */}
            <button
              onClick={handleSave}
              disabled={saving}
              className={`w-full py-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors ${
                saveSuccess ? 'bg-green-600 text-white' : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              <SaveButtonContent isSaving={saving} isSuccess={saveSuccess} />
            </button>
          </div>
        )}
      </div>
    </ErrandMypageLayout>
  );
}
