'use client'

import { useRouter, useSearchParams } from 'next/navigation'

interface CategorySortProps {
  currentSort?: string
  currentPrice?: string
}

export default function CategorySort({ currentSort: _currentSort, currentPrice: _currentPrice }: CategorySortProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const currentSort = searchParams.get('sort') || 'popular'

  const handleSortChange = (newSort: string) => {
    const params = new URLSearchParams(searchParams)
    params.set('sort', newSort)
    router.push(`?${params.toString()}`)
  }

  return (
    <div className="flex items-center gap-2 flex-shrink-0">
      <span className="font-medium text-sm">정렬:</span>
      <select
        name="sort"
        value={currentSort}
        onChange={(e) => handleSortChange(e.target.value)}
        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent text-sm"
        aria-label="서비스 정렬 방식 선택"
      >
        <option value="popular">인기순</option>
        <option value="latest">최신순</option>
        <option value="price_low">가격 낮은순</option>
        <option value="price_high">가격 높은순</option>
        <option value="rating">평점순</option>
      </select>
    </div>
  )
}
