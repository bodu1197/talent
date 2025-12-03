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

  const handlePriceChange = (priceRange: string) => {
    const params = new URLSearchParams(searchParams);
    if (priceRange) {
      params.set('price', priceRange);
    } else {
      params.delete('price');
    }
    router.push(`?${params.toString()}`);
  };

  const handleReset = () => {
    router.push('?');
  };

  // 현재 필터가 적용되어 있는지 확인
  const hasActiveFilters = currentPrice || searchParams.get('sort');

  return (
    <div className="flex items-center gap-2 flex-shrink-0">
      {/* 가격 드롭다운 */}
      <div className="flex items-center gap-2">
        <span className="font-medium text-sm text-gray-600">가격:</span>
        <select
          name="price"
          value={currentPrice}
          onChange={(e) => handlePriceChange(e.target.value)}
          className="px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent text-sm bg-white"
          aria-label="가격 범위 선택"
        >
          <option value="">전체</option>
          <option value="under-50000">~5만원</option>
          <option value="50000-100000">5~10만원</option>
          <option value="100000-300000">10~30만원</option>
          <option value="300000-500000">30~50만원</option>
          <option value="over-500000">50만원~</option>
        </select>
      </div>

      {/* 초기화 버튼 */}
      {hasActiveFilters && (
        <button
          onClick={handleReset}
          className="flex items-center gap-1 px-2 py-1.5 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          title="필터 초기화"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">초기화</span>
        </button>
      )}
    </div>
  );
}
