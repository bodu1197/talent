'use client';

import { useRouter, useSearchParams } from 'next/navigation';

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
  const currentPrice = searchParams.get('price');

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

  return (
    <div className="flex items-center gap-6 flex-wrap">
      {/* 가격 범위 */}
      <div className="flex items-center gap-3">
        <span className="font-medium text-sm">가격:</span>
        <div className="flex items-center gap-2 flex-wrap">
          <label className="flex items-center cursor-pointer">
            <input
              type="radio"
              name="price"
              className="mr-1.5"
              checked={!currentPrice}
              onChange={() => handlePriceChange('')}
            />
            <span className="text-sm">전체</span>
          </label>
          <label className="flex items-center cursor-pointer">
            <input
              type="radio"
              name="price"
              className="mr-1.5"
              checked={currentPrice === 'under-50000'}
              onChange={() => handlePriceChange('under-50000')}
            />
            <span className="text-sm">~5만원</span>
          </label>
          <label className="flex items-center cursor-pointer">
            <input
              type="radio"
              name="price"
              className="mr-1.5"
              checked={currentPrice === '50000-100000'}
              onChange={() => handlePriceChange('50000-100000')}
            />
            <span className="text-sm">5~10만원</span>
          </label>
          <label className="flex items-center cursor-pointer">
            <input
              type="radio"
              name="price"
              className="mr-1.5"
              checked={currentPrice === '100000-300000'}
              onChange={() => handlePriceChange('100000-300000')}
            />
            <span className="text-sm">10~30만원</span>
          </label>
          <label className="flex items-center cursor-pointer">
            <input
              type="radio"
              name="price"
              className="mr-1.5"
              checked={currentPrice === '300000-500000'}
              onChange={() => handlePriceChange('300000-500000')}
            />
            <span className="text-sm">30~50만원</span>
          </label>
          <label className="flex items-center cursor-pointer">
            <input
              type="radio"
              name="price"
              className="mr-1.5"
              checked={currentPrice === 'over-500000'}
              onChange={() => handlePriceChange('over-500000')}
            />
            <span className="text-sm">50만원~</span>
          </label>
        </div>
      </div>

      {/* 초기화 버튼 */}
      <button
        onClick={handleReset}
        className="ml-auto px-4 py-2 text-sm text-brand-primary border border-brand-primary rounded-lg hover:bg-gray-50 transition-colors"
      >
        초기화
      </button>
    </div>
  );
}
