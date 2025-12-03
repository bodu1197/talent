'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { RotateCcw } from 'lucide-react';

interface CategoryFilterProps {
  readonly categoryId: string;
  readonly isAI: boolean;
}

export default function CategoryFilter({
  categoryId: _categoryId,
  isAI: _isAI,
}: CategoryFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentPrice = searchParams.get('price') || '';
  const currentTaxInvoice = searchParams.get('tax') || '';

  const handleFilterChange = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`?${params.toString()}`);
  };

  const handleReset = () => {
    router.push('?');
  };

  // 현재 필터가 적용되어 있는지 확인
  const hasActiveFilters = currentPrice || currentTaxInvoice || searchParams.get('sort');

  return (
    <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
      {/* 가격 드롭다운 */}
      <select
        name="price"
        value={currentPrice}
        onChange={(e) => handleFilterChange('price', e.target.value)}
        className="px-2 py-1 sm:px-3 sm:py-1.5 border border-gray-300 rounded-md sm:rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent text-xs sm:text-sm bg-white min-w-0"
        aria-label="가격 범위 선택"
      >
        <option value="">가격</option>
        <option value="under-50000">~5만</option>
        <option value="50000-100000">5~10만</option>
        <option value="100000-300000">10~30만</option>
        <option value="300000-500000">30~50만</option>
        <option value="over-500000">50만~</option>
      </select>

      {/* 세금계산서 드롭다운 */}
      <select
        name="tax"
        value={currentTaxInvoice}
        onChange={(e) => handleFilterChange('tax', e.target.value)}
        className="px-2 py-1 sm:px-3 sm:py-1.5 border border-gray-300 rounded-md sm:rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent text-xs sm:text-sm bg-white min-w-0"
        aria-label="세금계산서 발행 여부"
      >
        <option value="">세금계산서</option>
        <option value="issued">발행가능</option>
        <option value="not-issued">미발행</option>
      </select>

      {/* 초기화 버튼 */}
      {hasActiveFilters && (
        <button
          onClick={handleReset}
          className="flex items-center justify-center p-1 sm:px-2 sm:py-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md sm:rounded-lg transition-colors"
          title="필터 초기화"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}
