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
  const [newFeatures, setNewFeatures] = useState<Record<PackageType, string>>({
    standard: '',
    deluxe: '',
    premium: '',
  });

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
    const feature = newFeatures[type].trim();
    if (feature) {
      const currentFeatures = packages[type].features || [];
      handlePackageChange(type, 'features', [...currentFeatures, feature]);
      setNewFeatures({ ...newFeatures, [type]: '' });
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

  const getRevisionLabel = (value: string) => {
    if (value === '-1') return '무제한';
    if (value === '0') return '수정 불가';
    return `${value}회`;
  };

  return (
    <div className="space-y-6">
      {/* 안내 메시지 */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>패키지 설정 안내:</strong> 최소 1개 이상의 패키지를 활성화해주세요. 각 패키지마다
          가격, 작업 기간, 포함 기능을 다르게 설정할 수 있습니다.
        </p>
      </div>

      {/* 3개 패키지 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {PACKAGE_TYPE_ORDER.map((type) => {
          const pkg = packages[type];
          const pkgErrors = errors[type] || [];

          return (
            <div
              key={type}
              className={`border rounded-xl overflow-hidden transition-all ${
                pkg.is_enabled ? 'border-brand-primary shadow-md' : 'border-gray-200 bg-gray-50'
              }`}
            >
              {/* 패키지 헤더 */}
              <div
                className={`px-4 py-3 flex items-center justify-between ${
                  pkg.is_enabled ? 'bg-brand-primary text-white' : 'bg-gray-100 text-gray-600'
                }`}
              >
                <span className="font-semibold">{PACKAGE_TYPE_LABELS[type]}</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={pkg.is_enabled}
                    onChange={(e) => handlePackageChange(type, 'is_enabled', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div
                    className={`w-10 h-5 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all ${
                      pkg.is_enabled ? 'bg-white/30' : 'bg-gray-300'
                    }`}
                  />
                </label>
              </div>

              {/* 비활성화 상태 */}
              {!pkg.is_enabled && (
                <div className="p-4 text-center">
                  <p className="text-sm text-gray-500 mb-3">패키지가 비활성화되어 있습니다</p>
                  <button
                    type="button"
                    onClick={() => applyTemplate(type)}
                    className="text-sm text-brand-primary hover:underline"
                  >
                    템플릿으로 시작하기
                  </button>
                </div>
              )}

              {/* 활성화된 패키지 입력 폼 */}
              {pkg.is_enabled && (
                <div className="p-4 space-y-4">
                  {/* 에러 메시지 */}
                  {pkgErrors.length > 0 && (
                    <div className="p-2 bg-red-50 border border-red-200 rounded text-xs text-red-600">
                      {pkgErrors.map((err, i) => (
                        <div key={i}>{err}</div>
                      ))}
                    </div>
                  )}

                  {/* 가격 */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      가격 <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={formatPrice(pkg.price)}
                        onChange={(e) => handlePriceChange(type, e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                        placeholder="50,000"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500">
                        원
                      </span>
                    </div>
                  </div>

                  {/* 작업 기간 */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      작업 기간 <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        value={pkg.delivery_days}
                        onChange={(e) => handlePackageChange(type, 'delivery_days', e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                        min="1"
                        max="365"
                        placeholder="7"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500">
                        일
                      </span>
                    </div>
                  </div>

                  {/* 수정 횟수 */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      수정 횟수
                    </label>
                    <select
                      value={pkg.revision_count}
                      onChange={(e) => handlePackageChange(type, 'revision_count', e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
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
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      설명 <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={pkg.description}
                      onChange={(e) => handlePackageChange(type, 'description', e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent resize-none"
                      rows={2}
                      placeholder="패키지 설명"
                    />
                  </div>

                  {/* 포함 기능 */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      포함 기능 <span className="text-red-500">*</span>
                    </label>
                    <div className="space-y-1 mb-2 max-h-24 overflow-y-auto">
                      {(pkg.features || []).map((feature, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-1.5 bg-gray-50 rounded text-xs"
                        >
                          <span className="text-gray-700 truncate">{feature}</span>
                          <button
                            type="button"
                            onClick={() => removeFeature(type, index)}
                            className="text-gray-400 hover:text-red-500 ml-1 flex-shrink-0"
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
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
                    <div className="flex gap-1">
                      <input
                        type="text"
                        value={newFeatures[type]}
                        onChange={(e) => setNewFeatures({ ...newFeatures, [type]: e.target.value })}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addFeature(type);
                          }
                        }}
                        className="flex-1 px-2 py-1.5 text-xs border border-gray-300 rounded focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                        placeholder="기능 입력 후 Enter"
                      />
                      <button
                        type="button"
                        onClick={() => addFeature(type)}
                        className="px-2 py-1.5 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                      >
                        추가
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 패키지 요약 */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h3 className="font-medium text-gray-900 mb-3">패키지 요약</h3>
        <div className="grid grid-cols-3 gap-3 text-center text-sm">
          {PACKAGE_TYPE_ORDER.map((type) => {
            const pkg = packages[type];
            return (
              <div
                key={type}
                className={`p-3 rounded-lg ${
                  pkg.is_enabled
                    ? 'bg-white border-2 border-brand-primary'
                    : 'bg-gray-100 opacity-50'
                }`}
              >
                <div className="text-xs font-medium text-gray-500 mb-1">
                  {PACKAGE_TYPE_LABELS[type]}
                </div>
                {pkg.is_enabled ? (
                  <>
                    <div className="font-bold text-brand-primary">
                      {formatPrice(pkg.price || '0')}원
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {pkg.delivery_days || '-'}일 / {getRevisionLabel(pkg.revision_count)}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      기능 {(pkg.features || []).length}개
                    </div>
                  </>
                ) : (
                  <div className="text-gray-400">비활성</div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
