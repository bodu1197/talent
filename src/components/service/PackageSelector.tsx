'use client';

import { useState } from 'react';
import {
  PackageType,
  ServicePackage,
  PACKAGE_TYPE_LABELS,
  PACKAGE_TYPE_ORDER,
} from '@/types/package';

interface Props {
  packages: ServicePackage[];
  serviceId: string;
  sellerId: string;
  serviceTitle: string;
  onPurchase: (pkg: ServicePackage) => void;
  disabled?: boolean;
  children?: React.ReactNode;
  isBusiness?: boolean; // 사업자 여부 (VAT 계산용)
}

// VAT 포함 가격 계산 함수 (사업자용)
const calculateBusinessPrice = (price: number): number => Math.floor(price * 1.1);

// VAT 미포함 가격 계산 함수 (일반 소비자용)
const calculateConsumerPrice = (price: number): number => price;

export default function PackageSelector({
  packages,
  serviceId: _serviceId,
  sellerId: _sellerId,
  serviceTitle: _serviceTitle,
  onPurchase,
  disabled = false,
  children,
  isBusiness = false,
}: Props) {
  // 활성화된 패키지만 필터링하고 정렬
  const activePackages = PACKAGE_TYPE_ORDER.map((type) =>
    packages.find((pkg) => pkg.package_type === type)
  ).filter((pkg): pkg is ServicePackage => pkg?.is_active === true);

  const [selectedType, setSelectedType] = useState<PackageType>(
    activePackages[0]?.package_type || 'standard'
  );

  const selectedPackage = activePackages.find((pkg) => pkg.package_type === selectedType);

  if (activePackages.length === 0) {
    return null;
  }

  const formatPrice = (price: number) => {
    return price.toLocaleString('ko-KR');
  };

  const getRevisionText = (count: number) => {
    if (count === -1) return '무제한';
    if (count === 0) return '수정 불가';
    return `${count}회`;
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
      {/* 패키지 탭 */}
      <div className="flex border-b border-gray-200">
        {activePackages.map((pkg) => (
          <button
            key={pkg.package_type}
            type="button"
            onClick={() => setSelectedType(pkg.package_type)}
            className={`flex-1 py-3 px-2 text-center font-medium transition-colors ${
              selectedType === pkg.package_type
                ? 'bg-brand-primary text-white'
                : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
            }`}
          >
            <div className="text-sm">{PACKAGE_TYPE_LABELS[pkg.package_type]}</div>
          </button>
        ))}
      </div>

      {/* 선택된 패키지 상세 */}
      {selectedPackage && (
        <div className="p-5">
          {/* 가격 */}
          <div className="mb-4">
            <span className="text-base font-semibold text-gray-900">
              {formatPrice(
                isBusiness
                  ? calculateBusinessPrice(selectedPackage.price)
                  : calculateConsumerPrice(selectedPackage.price)
              )}
            </span>
            <span className="text-gray-600 ml-1">원</span>
            {isBusiness && (
              <div className="text-xs text-gray-500 mt-1">
                (공급가액 {formatPrice(selectedPackage.price)}원 + VAT 10%)
              </div>
            )}
          </div>

          {/* 기본 정보 */}
          <div className="space-y-3 mb-5">
            <div className="flex items-center gap-3 text-sm">
              <div className="flex items-center gap-2 text-gray-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span>작업 기간</span>
              </div>
              <span className="font-medium text-gray-900">{selectedPackage.delivery_days}일</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <div className="flex items-center gap-2 text-gray-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                <span>수정 횟수</span>
              </div>
              <span className="font-medium text-gray-900">
                {getRevisionText(selectedPackage.revision_count)}
              </span>
            </div>
          </div>

          {/* 포함 기능 */}
          <div className="border-t border-gray-100 pt-4 mb-5">
            <h4 className="text-sm font-medium text-gray-700 mb-3">포함 기능</h4>
            <ul className="space-y-2">
              {selectedPackage.features.map((feature, index) => (
                <li key={index} className="flex items-center gap-2 text-sm">
                  <svg
                    className="w-4 h-4 text-green-500 flex-shrink-0"
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
                  <span className="text-gray-700">{feature}</span>
                </li>
              ))}
              {/* 다른 패키지의 기능 표시 (비활성) */}
              {activePackages
                .filter((pkg) => pkg.package_type !== selectedType)
                .flatMap((pkg) => pkg.features)
                .filter(
                  (feature, index, self) =>
                    self.indexOf(feature) === index && !selectedPackage.features.includes(feature)
                )
                .slice(0, 3)
                .map((feature, index) => (
                  <li
                    key={`inactive-${index}`}
                    className="flex items-center gap-2 text-sm opacity-50"
                  >
                    <svg
                      className="w-4 h-4 text-gray-400 flex-shrink-0"
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
                    <span className="text-gray-400 line-through">{feature}</span>
                  </li>
                ))}
            </ul>
          </div>

          {/* 패키지 설명 */}
          {selectedPackage.description && (
            <div className="border-t border-gray-100 pt-4 mb-5">
              <p className="text-sm text-gray-600">{selectedPackage.description}</p>
            </div>
          )}

          {/* 버튼 영역 - 모든 버튼 동일한 간격 */}
          <div className="flex flex-col gap-3">
            <button
              type="button"
              onClick={() => onPurchase(selectedPackage)}
              disabled={disabled}
              className="w-full h-12 bg-brand-primary text-white font-medium rounded-lg hover:bg-[#1a4d8f] transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {PACKAGE_TYPE_LABELS[selectedPackage.package_type]} 패키지 구매하기
            </button>
            {children}
          </div>
        </div>
      )}

      {/* 패키지 비교 (선택사항) */}
      {activePackages.length > 1 && (
        <div className="border-t border-gray-200 px-5 py-3 bg-gray-50">
          <button
            type="button"
            onClick={() => {
              // 패키지 비교 모달 열기 (추후 구현)
            }}
            className="w-full text-sm text-brand-primary hover:underline"
          >
            패키지 비교하기
          </button>
        </div>
      )}
    </div>
  );
}
