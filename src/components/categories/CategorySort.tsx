'use client';

import { useRouter, useSearchParams } from 'next/navigation';

interface CategorySortProps {
  readonly currentSort?: string;
  readonly currentPrice?: string;
}

export default function CategorySort({
  currentSort: _currentSort,
  currentPrice: _currentPrice,
}: CategorySortProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentSort = searchParams.get('sort') || 'popular';

  const handleSortChange = (newSort: string) => {
    const params = new URLSearchParams(searchParams);
    params.set('sort', newSort);
    router.push(`?${params.toString()}`);
  };

  return (
    <select
      name="sort"
      value={currentSort}
      onChange={(e) => handleSortChange(e.target.value)}
      className="px-2 py-1 sm:px-3 sm:py-1.5 border border-gray-300 rounded-md sm:rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent text-xs sm:text-sm bg-white"
      aria-label="서비스 정렬 방식 선택"
    >
      <option value="popular">인기순</option>
      <option value="latest">최신순</option>
      <option value="price_low">낮은가격</option>
      <option value="price_high">높은가격</option>
      <option value="rating">평점순</option>
    </select>
  );
}
