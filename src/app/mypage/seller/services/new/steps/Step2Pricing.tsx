'use client';

import { useState, useEffect } from 'react';
import PackagePricingForm from '@/components/service/PackagePricingForm';
import {
  PackageType,
  PackageFormData,
  PACKAGE_TYPE_ORDER,
  DEFAULT_PACKAGE_FORM_DATA,
  validateAllPackages,
} from '@/types/package';
import { ServiceFormProps } from '@/types/service-form';

// 패키지 초기값
const getInitialPackages = (): Record<PackageType, PackageFormData> => ({
  standard: { ...DEFAULT_PACKAGE_FORM_DATA, is_enabled: true },
  deluxe: { ...DEFAULT_PACKAGE_FORM_DATA },
  premium: { ...DEFAULT_PACKAGE_FORM_DATA },
});

export default function Step2Pricing({ formData, setFormData }: ServiceFormProps) {
  const [usePackages, setUsePackages] = useState(formData.use_packages || false);
  const [packages, setPackages] = useState<Record<PackageType, PackageFormData>>(
    formData.packages || getInitialPackages()
  );
  const [packageErrors, setPackageErrors] = useState<Record<PackageType, string[]>>(
    {} as Record<PackageType, string[]>
  );

  // 패키지 변경 시 formData 업데이트
  useEffect(() => {
    setFormData({
      ...formData,
      use_packages: usePackages,
      packages: packages,
    });
  }, [usePackages, packages]);

  // 패키지 모드 변경 시 검증
  useEffect(() => {
    if (usePackages) {
      const validation = validateAllPackages(packages);
      const errorsRecord: Record<PackageType, string[]> = {} as Record<PackageType, string[]>;
      for (const type of PACKAGE_TYPE_ORDER) {
        if (validation.errors[type]) {
          errorsRecord[type] = validation.errors[type]!;
        }
      }
      setPackageErrors(errorsRecord);
    }
  }, [packages, usePackages]);

  const formatPrice = (value: string) => {
    const number = value.replaceAll(/[^\d]/g, '');
    const numValue = Number.parseInt(number, 10);
    return Number.isNaN(numValue) ? '0' : numValue.toLocaleString('ko-KR');
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replaceAll(/[^\d]/g, '');
    setFormData({ ...formData, price: value });
  };

  const handlePackageToggle = (enabled: boolean) => {
    setUsePackages(enabled);
    if (enabled && !formData.packages) {
      setPackages(getInitialPackages());
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-base md:text-lg font-semibold text-gray-900 mb-6">가격 설정</h2>

      {/* 가격 모드 선택 */}
      <div className="p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center gap-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="pricing-mode"
              checked={!usePackages}
              onChange={() => handlePackageToggle(false)}
              className="w-4 h-4 text-brand-primary focus:ring-brand-primary"
            />
            <span className="text-sm font-medium text-gray-700">단일 가격</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="pricing-mode"
              checked={usePackages}
              onChange={() => handlePackageToggle(true)}
              className="w-4 h-4 text-brand-primary focus:ring-brand-primary"
            />
            <span className="text-sm font-medium text-gray-700">
              패키지별 가격
              <span className="ml-1 text-xs text-brand-primary">(STANDARD / DELUXE / PREMIUM)</span>
            </span>
          </label>
        </div>
      </div>

      {/* 단일 가격 모드 */}
      {!usePackages && (
        <>
          {/* 서비스 가격 */}
          <div>
            <label htmlFor="service-price" className="block text-sm font-medium text-gray-700 mb-2">
              서비스 가격 <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                id="service-price"
                type="text"
                value={formatPrice(formData.price)}
                onChange={handlePriceChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                placeholder="0"
                required
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">원</span>
            </div>
            <p className="mt-2 text-sm text-gray-500">최소 금액: 5,000원</p>
          </div>

          {/* 작업 기간 */}
          <div>
            <label
              htmlFor="service-delivery-days"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              작업 기간 <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                id="service-delivery-days"
                type="number"
                value={formData.delivery_days}
                onChange={(e) => setFormData({ ...formData, delivery_days: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                placeholder="7"
                min="1"
                max="365"
                required
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">일</span>
            </div>
            <p className="mt-2 text-sm text-gray-500">
              작업을 완료하는 데 필요한 평균 기간을 입력하세요 (1~365일)
            </p>
          </div>

          {/* 수정 횟수 */}
          <div>
            <label htmlFor="revisionCount" className="block text-sm font-medium text-gray-700 mb-2">
              수정 횟수
            </label>
            <select
              id="revisionCount"
              value={formData.revision_count}
              onChange={(e) => setFormData({ ...formData, revision_count: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
            >
              <option value="0">수정 불가</option>
              <option value="1">1회</option>
              <option value="2">2회</option>
              <option value="3">3회</option>
              <option value="5">5회</option>
              <option value="-1">무제한</option>
            </select>
            <p className="mt-2 text-sm text-gray-500">
              고객이 작업물을 받은 후 수정 요청할 수 있는 횟수
            </p>
          </div>

          {/* 가격 미리보기 */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-8">
            <h3 className="text-sm md:text-base font-semibold text-gray-900 mb-4">가격 요약</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-700">서비스 금액</span>
                <span className="font-semibold text-gray-900">
                  {formatPrice(formData.price || '0')}원
                </span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>운영자 커피값</span>
                <span>-1,000원</span>
              </div>
              <div className="border-t border-blue-300 pt-3 flex justify-between">
                <span className="font-semibold text-gray-900">예상 수익</span>
                <span className="font-semibold text-brand-primary text-lg">
                  {formatPrice(
                    Math.max(0, Number.parseInt(formData.price || '0') - 1000).toString()
                  )}
                  원
                </span>
              </div>
            </div>
          </div>
        </>
      )}

      {/* 패키지 모드 */}
      {usePackages && (
        <PackagePricingForm packages={packages} onChange={setPackages} errors={packageErrors} />
      )}
    </div>
  );
}
