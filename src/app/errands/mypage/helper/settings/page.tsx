'use client';

import { logger } from '@/lib/logger';
import { useState, useEffect } from 'react';
import ErrandMypageLayout from '@/components/errands/ErrandMypageLayout';
import { useAuth } from '@/components/providers/AuthProvider';
import SettingsLoadingState from '@/components/errands/SettingsLoadingState';
import ProfileSection from '@/components/errands/ProfileSection';
import SaveButtonContent from '@/components/common/SaveButtonContent';
import { MapPin, Bell, CreditCard, Shield, Bike, ChevronRight, AlertCircle } from 'lucide-react';

interface HelperSettings {
  name: string;
  phone: string;
  vehicleType: string;
  serviceArea: string;
  bankAccount: {
    bank: string;
    accountNumber: string;
    accountHolder: string;
  };
  notifications: {
    newErrand: boolean;
    statusChange: boolean;
    earnings: boolean;
  };
  availability: {
    monday: boolean;
    tuesday: boolean;
    wednesday: boolean;
    thursday: boolean;
    friday: boolean;
    saturday: boolean;
    sunday: boolean;
  };
}

export default function HelperSettingsPage() {
  const { user, profile } = useAuth();
  const [settings, setSettings] = useState<HelperSettings>({
    name: '',
    phone: '',
    vehicleType: 'bike',
    serviceArea: '',
    bankAccount: {
      bank: '',
      accountNumber: '',
      accountHolder: '',
    },
    notifications: {
      newErrand: true,
      statusChange: true,
      earnings: true,
    },
    availability: {
      monday: true,
      tuesday: true,
      wednesday: true,
      thursday: true,
      friday: true,
      saturday: false,
      sunday: false,
    },
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (profile) {
      setSettings((prev) => ({
        ...prev,
        name: profile.name ?? '',
        phone: profile.phone ?? '',
      }));
      setLoading(false);
    }
  }, [profile]);

  async function handleSave() {
    try {
      setSaving(true);
      // API 호출로 설정 저장
      const response = await fetch('/api/helper/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });

      if (response.ok) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (error) {
      logger.error('설정 저장 실패:', error);
    } finally {
      setSaving(false);
    }
  }

  const dayLabels: Record<string, string> = {
    monday: '월',
    tuesday: '화',
    wednesday: '수',
    thursday: '목',
    friday: '금',
    saturday: '토',
    sunday: '일',
  };

  const bankOptions = [
    '국민은행',
    '신한은행',
    '우리은행',
    '하나은행',
    '농협은행',
    'IBK기업은행',
    '카카오뱅크',
    '토스뱅크',
    '새마을금고',
  ];

  const vehicleOptions = [
    { value: 'bike', label: '자전거', icon: Bike },
    { value: 'motorcycle', label: '오토바이', icon: Bike },
    { value: 'car', label: '자동차', icon: Bike },
    { value: 'walk', label: '도보', icon: Bike },
  ];

  return (
    <ErrandMypageLayout mode="helper">
      <div className="p-4 lg:p-0">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-gray-900">라이더 설정</h1>
          <p className="text-gray-600 mt-1">라이더 활동 설정을 관리하세요</p>
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
              idPrefix="helper"
            />

            {/* 활동 설정 */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="p-4 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <Bike className="w-5 h-5 text-gray-600" />
                  <h2 className="font-bold text-gray-900">활동 설정</h2>
                </div>
              </div>
              <div className="p-4 space-y-4">
                {/* 이동 수단 */}
                <fieldset>
                  <legend className="block text-sm font-medium text-gray-700 mb-2">
                    이동 수단
                  </legend>
                  <div className="grid grid-cols-4 gap-2">
                    {vehicleOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => setSettings({ ...settings, vehicleType: option.value })}
                        className={`p-3 rounded-lg border-2 text-center transition-colors ${
                          settings.vehicleType === option.value
                            ? 'border-blue-600 bg-blue-50 text-blue-700'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <option.icon className="w-5 h-5 mx-auto mb-1" />
                        <span className="text-xs">{option.label}</span>
                      </button>
                    ))}
                  </div>
                </fieldset>

                {/* 활동 지역 */}
                <div>
                  <label
                    htmlFor="helper-service-area"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    활동 지역
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      id="helper-service-area"
                      type="text"
                      value={settings.serviceArea}
                      onChange={(e) => setSettings({ ...settings, serviceArea: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="주로 활동하는 지역 (예: 강남구, 서초구)"
                    />
                  </div>
                </div>

                {/* 활동 요일 */}
                <fieldset>
                  <legend className="block text-sm font-medium text-gray-700 mb-2">
                    활동 가능 요일
                  </legend>
                  <div className="flex gap-2">
                    {Object.entries(settings.availability).map(([day, active]) => (
                      <button
                        key={day}
                        onClick={() =>
                          setSettings({
                            ...settings,
                            availability: {
                              ...settings.availability,
                              [day]: !active,
                            },
                          })
                        }
                        className={`w-10 h-10 rounded-full font-medium text-sm transition-colors ${
                          active ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-500'
                        }`}
                      >
                        {dayLabels[day]}
                      </button>
                    ))}
                  </div>
                </fieldset>
              </div>
            </div>

            {/* 정산 계좌 */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="p-4 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-gray-600" />
                  <h2 className="font-bold text-gray-900">정산 계좌</h2>
                </div>
              </div>
              <div className="p-4 space-y-4">
                {/* 은행 선택 */}
                <div>
                  <label
                    htmlFor="helper-bank"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    은행
                  </label>
                  <select
                    id="helper-bank"
                    value={settings.bankAccount.bank}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        bankAccount: { ...settings.bankAccount, bank: e.target.value },
                      })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">은행을 선택하세요</option>
                    {bankOptions.map((bank) => (
                      <option key={bank} value={bank}>
                        {bank}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 계좌번호 */}
                <div>
                  <label
                    htmlFor="helper-account-number"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    계좌번호
                  </label>
                  <input
                    id="helper-account-number"
                    type="text"
                    value={settings.bankAccount.accountNumber}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        bankAccount: { ...settings.bankAccount, accountNumber: e.target.value },
                      })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="'-' 없이 입력"
                  />
                </div>

                {/* 예금주 */}
                <div>
                  <label
                    htmlFor="helper-account-holder"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    예금주
                  </label>
                  <input
                    id="helper-account-holder"
                    type="text"
                    value={settings.bankAccount.accountHolder}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        bankAccount: { ...settings.bankAccount, accountHolder: e.target.value },
                      })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="실명으로 입력"
                  />
                </div>

                <div className="flex items-start gap-2 p-3 bg-yellow-50 rounded-lg">
                  <AlertCircle className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-yellow-700">
                    정산 계좌는 본인 명의 계좌만 등록 가능합니다. 수익금은 매주 월요일에 자동
                    정산됩니다.
                  </p>
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
                    <p className="font-medium text-gray-900">새 심부름 알림</p>
                    <p className="text-sm text-gray-500">내 주변 새 심부름 발생 시</p>
                  </div>
                  <button
                    onClick={() =>
                      setSettings({
                        ...settings,
                        notifications: {
                          ...settings.notifications,
                          newErrand: !settings.notifications.newErrand,
                        },
                      })
                    }
                    className={`w-12 h-6 rounded-full transition-colors ${
                      settings.notifications.newErrand ? 'bg-blue-600' : 'bg-gray-300'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform ${
                        settings.notifications.newErrand ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
                <div className="flex items-center justify-between p-4">
                  <div>
                    <p className="font-medium text-gray-900">상태 변경 알림</p>
                    <p className="text-sm text-gray-500">내 작업 상태 변경 시</p>
                  </div>
                  <button
                    onClick={() =>
                      setSettings({
                        ...settings,
                        notifications: {
                          ...settings.notifications,
                          statusChange: !settings.notifications.statusChange,
                        },
                      })
                    }
                    className={`w-12 h-6 rounded-full transition-colors ${
                      settings.notifications.statusChange ? 'bg-blue-600' : 'bg-gray-300'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform ${
                        settings.notifications.statusChange ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
                <div className="flex items-center justify-between p-4">
                  <div>
                    <p className="font-medium text-gray-900">수익 알림</p>
                    <p className="text-sm text-gray-500">정산 및 수익 관련 알림</p>
                  </div>
                  <button
                    onClick={() =>
                      setSettings({
                        ...settings,
                        notifications: {
                          ...settings.notifications,
                          earnings: !settings.notifications.earnings,
                        },
                      })
                    }
                    className={`w-12 h-6 rounded-full transition-colors ${
                      settings.notifications.earnings ? 'bg-blue-600' : 'bg-gray-300'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform ${
                        settings.notifications.earnings ? 'translate-x-6' : 'translate-x-1'
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
                  <span className="text-gray-900">라이더 인증 정보</span>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </button>
                <button className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
                  <span className="text-gray-900">구독 관리</span>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </button>
                <button className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
                  <span className="text-red-600">라이더 활동 중단</span>
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
