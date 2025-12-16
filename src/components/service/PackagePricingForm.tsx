'use client';

import { useState } from 'react';
import {
  PackageType,
  PackageFormData,
  PACKAGE_TYPE_LABELS,
  PACKAGE_TYPE_ORDER,
  DEFAULT_PACKAGE_TEMPLATES,
  PACKAGE_TITLE_MAX_LENGTH,
  PACKAGE_DESCRIPTION_MAX_LENGTH,
} from '@/types/package';

interface Props {
  readonly packages: Record<PackageType, PackageFormData>;
  readonly onChange: (packages: Record<PackageType, PackageFormData>) => void;
  readonly errors?: Partial<Record<PackageType, string[]>>;
}

export default function PackagePricingForm({ packages, onChange, errors = {} }: Props) {
  // 현재 펼쳐진 패키지 (null이면 모두 접힘)
  const [expandedPackage, setExpandedPackage] = useState<PackageType | null>('standard');
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

  const toggleExpand = (type: PackageType) => {
    setExpandedPackage(expandedPackage === type ? null : type);
  };

  const getRevisionLabel = (value: string) => {
    if (value === '-1') return '무제한';
    if (value === '0') return '수정 불가';
    return `${value}회`;
  };

  const enabledCount = PACKAGE_TYPE_ORDER.filter((t) => packages[t].is_enabled).length;

  // 헤더 버튼 스타일 계산
  const getHeaderButtonClass = (isEnabled: boolean, isExp: boolean) => {
    if (!isEnabled) return 'bg-gray-50 text-gray-600 hover:bg-gray-100';
    if (isExp) return 'bg-brand-primary text-white';
    return 'bg-brand-primary/10 text-brand-primary hover:bg-brand-primary/20';
  };

  // 토글 스위치 스타일 계산
  const getToggleSwitchClass = (isEnabled: boolean, isExp: boolean) => {
    if (!isEnabled) return 'bg-gray-300';
    if (isExp) return 'bg-white/30';
    return 'bg-brand-primary';
  };

  return (
    <div className="space-y-4">
      {/* 안내 메시지 */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>패키지 설정:</strong> 각 패키지를 클릭하여 가격과 포함 기능을 설정하세요.
        </p>
        <p className="text-xs text-blue-600 mt-1">
          ※ 서비스 전체 설명은 다음 단계에서 별도로 작성합니다.
        </p>
      </div>

      {/* 패키지 상태 요약 */}
      <div className="flex gap-2 flex-wrap">
        {PACKAGE_TYPE_ORDER.map((type) => {
          const pkg = packages[type];
          return (
            <div
              key={type}
              className={`px-3 py-1.5 rounded-full text-xs font-medium ${
                pkg.is_enabled ? 'bg-brand-primary text-white' : 'bg-gray-100 text-gray-500'
              }`}
            >
              {PACKAGE_TYPE_LABELS[type]}
              {pkg.is_enabled && ` · ${formatPrice(pkg.price || '0')}원`}
            </div>
          );
        })}
        <div className="px-3 py-1.5 text-xs text-gray-500">({enabledCount}/3 활성화)</div>
      </div>

      {/* 아코디언 패키지 목록 */}
      <div className="space-y-3">
        {PACKAGE_TYPE_ORDER.map((type) => {
          const pkg = packages[type];
          const pkgErrors = errors[type] || [];
          const isExpanded = expandedPackage === type;

          return (
            <div
              key={type}
              className={`border rounded-xl overflow-hidden transition-all ${
                pkg.is_enabled ? 'border-brand-primary' : 'border-gray-200'
              } ${isExpanded ? 'shadow-lg' : ''}`}
            >
              {/* 패키지 헤더 (항상 보임) */}
              <button
                type="button"
                onClick={() => toggleExpand(type)}
                className={`w-full px-5 py-4 flex items-center justify-between transition-colors ${getHeaderButtonClass(pkg.is_enabled, isExpanded)}`}
              >
                <div className="flex items-center gap-3">
                  {/* 확장 아이콘 */}
                  <svg
                    className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                  <span className="font-semibold text-lg">{PACKAGE_TYPE_LABELS[type]}</span>
                  {pkg.is_enabled && (
                    <span
                      className={`text-sm ${
                        isExpanded ? 'text-white/80' : 'text-brand-primary/70'
                      }`}
                    >
                      {formatPrice(pkg.price || '0')}원 · {pkg.delivery_days || '-'}일 ·{' '}
                      {getRevisionLabel(pkg.revision_count)}
                    </span>
                  )}
                  {!pkg.is_enabled && <span className="text-sm text-gray-400">비활성화됨</span>}
                </div>
                {/* 활성화 토글 */}
                <div
                  role="button"
                  tabIndex={0}
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      e.stopPropagation();
                    }
                  }}
                  className="flex items-center"
                >
                  <label
                    aria-label={`${PACKAGE_TYPE_LABELS[type]} 활성화`}
                    className="relative inline-flex items-center cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={pkg.is_enabled}
                      onChange={(e) => {
                        handlePackageChange(type, 'is_enabled', e.target.checked);
                        if (e.target.checked && !isExpanded) {
                          setExpandedPackage(type);
                        }
                      }}
                      className="sr-only peer"
                    />
                    <div
                      className={`w-11 h-6 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all ${getToggleSwitchClass(pkg.is_enabled, isExpanded)}`}
                    />
                  </label>
                </div>
              </button>

              {/* 펼쳐진 내용 */}
              {isExpanded && (
                <div className="p-5 bg-white">
                  {!pkg.is_enabled ? (
                    /* 비활성화 상태 */
                    <div className="text-center py-8">
                      <p className="text-gray-500 mb-4">이 패키지는 비활성화되어 있습니다</p>
                      <button
                        type="button"
                        onClick={() => applyTemplate(type)}
                        className="px-6 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-primary/90 transition-colors"
                      >
                        {PACKAGE_TYPE_LABELS[type]} 템플릿으로 시작하기
                      </button>
                    </div>
                  ) : (
                    /* 활성화된 패키지 폼 - 전체 너비 */
                    <div className="space-y-6">
                      {/* 에러 메시지 */}
                      {pkgErrors.length > 0 && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                          <ul className="list-disc list-inside text-sm text-red-600 space-y-1">
                            {pkgErrors.map((err) => (
                              <li key={err}>{err}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* 패키지 제목 */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label
                            htmlFor={`${type}-title`}
                            className="text-sm font-medium text-gray-700"
                          >
                            패키지 제목 <span className="text-red-500">*</span>
                          </label>
                          <span
                            className={`text-xs ${
                              (pkg.title?.length || 0) > PACKAGE_TITLE_MAX_LENGTH
                                ? 'text-red-500 font-medium'
                                : 'text-gray-400'
                            }`}
                          >
                            {pkg.title?.length || 0}/{PACKAGE_TITLE_MAX_LENGTH}자
                          </span>
                        </div>
                        <input
                          id={`${type}-title`}
                          type="text"
                          value={pkg.title || ''}
                          onChange={(e) => {
                            const value = e.target.value;
                            if (value.length <= PACKAGE_TITLE_MAX_LENGTH) {
                              handlePackageChange(type, 'title', value);
                            }
                          }}
                          className={`w-full px-4 py-3 text-lg border rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent ${
                            (pkg.title?.length || 0) > PACKAGE_TITLE_MAX_LENGTH
                              ? 'border-red-300 bg-red-50'
                              : 'border-gray-300'
                          }`}
                          placeholder="예: 기본 패키지, 프리미엄 서비스"
                          maxLength={PACKAGE_TITLE_MAX_LENGTH}
                        />
                        <p className="mt-1 text-xs text-gray-500">
                          구매자에게 표시되는 패키지 이름입니다
                        </p>
                      </div>

                      {/* 2열 그리드: 가격 & 작업기간 */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* 가격 */}
                        <div>
                          <label
                            htmlFor={`${type}-price`}
                            className="block text-sm font-medium text-gray-700 mb-2"
                          >
                            가격 <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <input
                              id={`${type}-price`}
                              type="text"
                              value={formatPrice(pkg.price)}
                              onChange={(e) => handlePriceChange(type, e.target.value)}
                              className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                              placeholder="50,000"
                            />
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">
                              원
                            </span>
                          </div>
                          <p className="mt-1 text-xs text-gray-500">최소 5,000원</p>
                        </div>

                        {/* 작업 기간 */}
                        <div>
                          <label
                            htmlFor={`${type}-delivery-days`}
                            className="block text-sm font-medium text-gray-700 mb-2"
                          >
                            작업 기간 <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <input
                              id={`${type}-delivery-days`}
                              type="number"
                              value={pkg.delivery_days}
                              onChange={(e) =>
                                handlePackageChange(type, 'delivery_days', e.target.value)
                              }
                              className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                              min="1"
                              max="365"
                              placeholder="7"
                            />
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">
                              일
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* 수정 횟수 */}
                      <fieldset>
                        <legend className="block text-sm font-medium text-gray-700 mb-2">
                          수정 횟수
                        </legend>
                        <div className="flex flex-wrap gap-2">
                          {[
                            { value: '0', label: '수정 불가' },
                            { value: '1', label: '1회' },
                            { value: '2', label: '2회' },
                            { value: '3', label: '3회' },
                            { value: '5', label: '5회' },
                            { value: '-1', label: '무제한' },
                          ].map((option) => (
                            <button
                              key={option.value}
                              type="button"
                              onClick={() =>
                                handlePackageChange(type, 'revision_count', option.value)
                              }
                              className={`px-4 py-2 rounded-lg border transition-colors ${
                                pkg.revision_count === option.value
                                  ? 'bg-brand-primary text-white border-brand-primary'
                                  : 'bg-white text-gray-700 border-gray-300 hover:border-brand-primary'
                              }`}
                            >
                              {option.label}
                            </button>
                          ))}
                        </div>
                      </fieldset>

                      {/* 패키지 간단 설명 */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label
                            htmlFor={`${type}-description`}
                            className="text-sm font-medium text-gray-700"
                          >
                            패키지 한줄 설명 <span className="text-red-500">*</span>
                          </label>
                          <span
                            className={`text-xs ${
                              (pkg.description?.length || 0) > PACKAGE_DESCRIPTION_MAX_LENGTH
                                ? 'text-red-500 font-medium'
                                : 'text-gray-400'
                            }`}
                          >
                            {pkg.description?.length || 0}/{PACKAGE_DESCRIPTION_MAX_LENGTH}자
                          </span>
                        </div>
                        <input
                          id={`${type}-description`}
                          type="text"
                          value={pkg.description}
                          onChange={(e) => {
                            const value = e.target.value;
                            if (value.length <= PACKAGE_DESCRIPTION_MAX_LENGTH) {
                              handlePackageChange(type, 'description', value);
                            }
                          }}
                          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent ${
                            (pkg.description?.length || 0) > PACKAGE_DESCRIPTION_MAX_LENGTH
                              ? 'border-red-300 bg-red-50'
                              : 'border-gray-300'
                          }`}
                          placeholder="예: 기본 작업물 + 1회 수정 포함"
                          maxLength={PACKAGE_DESCRIPTION_MAX_LENGTH}
                        />
                        <p className="mt-1 text-xs text-gray-500">
                          💡 이 패키지만의 특징을 한줄로 요약하세요. 서비스 전체 설명은 다음
                          단계에서 작성합니다.
                        </p>
                      </div>

                      {/* 포함 기능 */}
                      <div>
                        <label
                          htmlFor={`${type}-features`}
                          className="block text-sm font-medium text-gray-700 mb-2"
                        >
                          포함 기능 <span className="text-red-500">*</span>
                        </label>

                        {/* 기존 기능 목록 */}
                        <div className="flex flex-wrap gap-2 mb-3">
                          {(pkg.features || []).map((feature, index) => (
                            <div
                              key={`${type}-${feature}-${index}`}
                              className="flex items-center gap-1 px-3 py-1.5 bg-green-50 text-green-700 rounded-full text-sm"
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
                                  d="M5 13l4 4L19 7"
                                />
                              </svg>
                              <span>{feature}</span>
                              <button
                                type="button"
                                onClick={() => removeFeature(type, index)}
                                className="ml-1 text-green-500 hover:text-red-500"
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

                        {/* 새 기능 추가 */}
                        <div className="flex gap-2">
                          <input
                            id={`${type}-features`}
                            type="text"
                            value={newFeatures[type]}
                            onChange={(e) =>
                              setNewFeatures({ ...newFeatures, [type]: e.target.value })
                            }
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                addFeature(type);
                              }
                            }}
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                            placeholder="포함 기능 입력 후 Enter 또는 추가 버튼 클릭"
                          />
                          <button
                            type="button"
                            onClick={() => addFeature(type)}
                            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors whitespace-nowrap"
                          >
                            + 추가
                          </button>
                        </div>
                        <p className="mt-2 text-xs text-gray-500">
                          예: 기본 디자인, 소스 파일 제공, 상업적 사용권, 고해상도 이미지 등
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 패키지 비교 요약 */}
      {enabledCount > 0 && (
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">
          <h3 className="font-semibold text-gray-900 mb-4">패키지 비교</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="py-2 px-3 text-left text-gray-500 font-medium">항목</th>
                  {PACKAGE_TYPE_ORDER.filter((t) => packages[t].is_enabled).map((type) => (
                    <th
                      key={type}
                      className="py-2 px-3 text-center font-semibold text-brand-primary"
                    >
                      <div>{packages[type].title || PACKAGE_TYPE_LABELS[type]}</div>
                      <div className="text-xs font-normal text-gray-400">
                        {PACKAGE_TYPE_LABELS[type]}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-100">
                  <td className="py-3 px-3 text-gray-600">가격</td>
                  {PACKAGE_TYPE_ORDER.filter((t) => packages[t].is_enabled).map((type) => (
                    <td key={type} className="py-3 px-3 text-center font-semibold">
                      {formatPrice(packages[type].price || '0')}원
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-3 px-3 text-gray-600">작업 기간</td>
                  {PACKAGE_TYPE_ORDER.filter((t) => packages[t].is_enabled).map((type) => (
                    <td key={type} className="py-3 px-3 text-center">
                      {packages[type].delivery_days || '-'}일
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-3 px-3 text-gray-600">수정 횟수</td>
                  {PACKAGE_TYPE_ORDER.filter((t) => packages[t].is_enabled).map((type) => (
                    <td key={type} className="py-3 px-3 text-center">
                      {getRevisionLabel(packages[type].revision_count)}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="py-3 px-3 text-gray-600">포함 기능</td>
                  {PACKAGE_TYPE_ORDER.filter((t) => packages[t].is_enabled).map((type) => (
                    <td key={type} className="py-3 px-3 text-center">
                      {(packages[type].features || []).length}개
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
