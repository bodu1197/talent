'use client';

import { useState } from 'react';
import {
  PackageType,
  PackageFormData,
  PACKAGE_TYPE_LABELS,
  PACKAGE_TYPE_ORDER,
  DEFAULT_PACKAGE_TEMPLATES,
} from '@/types/package';

interface Props {
  packages: Record<PackageType, PackageFormData>;
  onChange: (packages: Record<PackageType, PackageFormData>) => void;
  errors?: Partial<Record<PackageType, string[]>>;
}

export default function PackagePricingForm({ packages, onChange, errors = {} }: Props) {
  const [activeTab, setActiveTab] = useState<PackageType>('standard');
  const [newFeature, setNewFeature] = useState('');

  const formatPrice = (value: string) => {
    const number = value.replaceAll(/[^\d]/g, '');
    const numValue = Number.parseInt(number, 10);
    return Number.isNaN(numValue) ? '0' : numValue.toLocaleString('ko-KR');
  };

  const handlePackageChange = (
    type: PackageType,
    field: keyof PackageFormData,
    value: string | boolean | string[]
  ) => {
    onChange({
      ...packages,
      [type]: {
        ...packages[type],
        [field]: value,
      },
    });
  };

  const handlePriceChange = (type: PackageType, value: string) => {
    const numericValue = value.replaceAll(/[^\d]/g, '');
    handlePackageChange(type, 'price', numericValue);
  };

  const addFeature = (type: PackageType) => {
    if (newFeature.trim()) {
      const currentFeatures = packages[type].features || [];
      handlePackageChange(type, 'features', [...currentFeatures, newFeature.trim()]);
      setNewFeature('');
    }
  };

  const removeFeature = (type: PackageType, index: number) => {
    const currentFeatures = [...(packages[type].features || [])];
    currentFeatures.splice(index, 1);
    handlePackageChange(type, 'features', currentFeatures);
  };

  const applyTemplate = (type: PackageType) => {
    const template = DEFAULT_PACKAGE_TEMPLATES[type];
    onChange({
      ...packages,
      [type]: {
        ...packages[type],
        ...template,
        is_enabled: true,
      },
    });
  };

  const currentPackage = packages[activeTab];
  const currentErrors = errors[activeTab] || [];

  return (
    <div className="space-y-6">
      {/* 패키지 탭 */}
      <div className="flex border-b border-gray-200">
        {PACKAGE_TYPE_ORDER.map((type) => (
          <button
            key={type}
            type="button"
            onClick={() => setActiveTab(type)}
            className={`flex-1 py-3 px-4 text-sm font-medium border-b-2 transition-colors ${
              activeTab === type
                ? 'border-brand-primary text-brand-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            } ${packages[type].is_enabled ? '' : 'opacity-50'}`}
          >
            <div className="flex items-center justify-center gap-2">
              <span>{PACKAGE_TYPE_LABELS[type]}</span>
              {packages[type].is_enabled && <span className="w-2 h-2 bg-green-500 rounded-full" />}
            </div>
          </button>
        ))}
      </div>

      {/* 활성화 토글 */}
      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
        <div>
          <h3 className="font-medium text-gray-900">{PACKAGE_TYPE_LABELS[activeTab]} 패키지</h3>
          <p className="text-sm text-gray-500">이 패키지를 판매 목록에 표시합니다</p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={currentPackage.is_enabled}
            onChange={(e) => handlePackageChange(activeTab, 'is_enabled', e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-brand-primary/20 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-primary" />
        </label>
      </div>

      {/* 템플릿 적용 버튼 */}
      {!currentPackage.is_enabled && (
        <button
          type="button"
          onClick={() => applyTemplate(activeTab)}
          className="w-full py-2 px-4 text-sm text-brand-primary border border-brand-primary rounded-lg hover:bg-brand-primary/5 transition-colors"
        >
          {PACKAGE_TYPE_LABELS[activeTab]} 템플릿으로 시작하기
        </button>
      )}

      {/* 에러 메시지 */}
      {currentErrors.length > 0 && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <ul className="list-disc list-inside text-sm text-red-600 space-y-1">
            {currentErrors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      {/* 패키지 입력 폼 */}
      {currentPackage.is_enabled && (
        <div className="space-y-6 pt-4">
          {/* 가격 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              가격 <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={formatPrice(currentPackage.price)}
                onChange={(e) => handlePriceChange(activeTab, e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                placeholder="50,000"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">원</span>
            </div>
            <p className="mt-1 text-sm text-gray-500">최소 5,000원</p>
          </div>

          {/* 작업 기간 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              작업 기간 <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="number"
                value={currentPackage.delivery_days}
                onChange={(e) => handlePackageChange(activeTab, 'delivery_days', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                min="1"
                max="365"
                placeholder="3"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">일</span>
            </div>
          </div>

          {/* 수정 횟수 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">수정 횟수</label>
            <select
              value={currentPackage.revision_count}
              onChange={(e) => handlePackageChange(activeTab, 'revision_count', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
            >
              <option value="0">수정 불가</option>
              <option value="1">1회</option>
              <option value="2">2회</option>
              <option value="3">3회</option>
              <option value="5">5회</option>
              <option value="-1">무제한</option>
            </select>
          </div>

          {/* 패키지 설명 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              패키지 설명 <span className="text-red-500">*</span>
            </label>
            <textarea
              value={currentPackage.description}
              onChange={(e) => handlePackageChange(activeTab, 'description', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent resize-none"
              rows={3}
              placeholder="이 패키지에서 제공하는 서비스를 설명해주세요"
            />
          </div>

          {/* 포함 기능 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              포함 기능 <span className="text-red-500">*</span>
            </label>

            {/* 기존 기능 목록 */}
            <div className="space-y-2 mb-3">
              {(currentPackage.features || []).map((feature, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-2">
                    <svg
                      className="w-5 h-5 text-green-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span className="text-sm text-gray-700">{feature}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeFeature(activeTab, index)}
                    className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              ))}
            </div>

            {/* 새 기능 추가 */}
            <div className="flex gap-2">
              <input
                type="text"
                value={newFeature}
                onChange={(e) => setNewFeature(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addFeature(activeTab);
                  }
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                placeholder="포함 기능 입력 후 Enter"
              />
              <button
                type="button"
                onClick={() => addFeature(activeTab)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                추가
              </button>
            </div>
            <p className="mt-1 text-sm text-gray-500">
              예: 기본 디자인, 소스 파일 제공, 상업적 사용권 등
            </p>
          </div>
        </div>
      )}

      {/* 패키지 요약 */}
      <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="font-medium text-gray-900 mb-3">활성화된 패키지</h3>
        <div className="grid grid-cols-3 gap-4">
          {PACKAGE_TYPE_ORDER.map((type) => (
            <div
              key={type}
              className={`p-3 rounded-lg text-center ${
                packages[type].is_enabled
                  ? 'bg-white border-2 border-brand-primary'
                  : 'bg-gray-100 border border-gray-200 opacity-50'
              }`}
            >
              <div className="text-xs font-medium text-gray-500 mb-1">
                {PACKAGE_TYPE_LABELS[type]}
              </div>
              {packages[type].is_enabled ? (
                <>
                  <div className="font-bold text-brand-primary">
                    {formatPrice(packages[type].price || '0')}원
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {packages[type].delivery_days}일 /
                    {packages[type].revision_count === '-1'
                      ? '무제한'
                      : `${packages[type].revision_count}회`}
                  </div>
                </>
              ) : (
                <div className="text-sm text-gray-400">비활성</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
