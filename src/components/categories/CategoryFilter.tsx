'use client'

interface CategoryFilterProps {
  categoryId: string
  isAI: boolean
}

export default function CategoryFilter({ categoryId, isAI }: CategoryFilterProps) {
  return (
    <div className="flex items-center gap-6 flex-wrap">
      {/* 가격 범위 */}
      <div className="flex items-center gap-3">
        <span className="font-medium text-sm">가격:</span>
        <div className="flex items-center gap-2 flex-wrap">
          <label className="flex items-center cursor-pointer">
            <input type="radio" name="price" className="mr-1.5" defaultChecked />
            <span className="text-sm">전체</span>
          </label>
          <label className="flex items-center cursor-pointer">
            <input type="radio" name="price" className="mr-1.5" />
            <span className="text-sm">~5만원</span>
          </label>
          <label className="flex items-center cursor-pointer">
            <input type="radio" name="price" className="mr-1.5" />
            <span className="text-sm">5~10만원</span>
          </label>
          <label className="flex items-center cursor-pointer">
            <input type="radio" name="price" className="mr-1.5" />
            <span className="text-sm">10~30만원</span>
          </label>
          <label className="flex items-center cursor-pointer">
            <input type="radio" name="price" className="mr-1.5" />
            <span className="text-sm">30~50만원</span>
          </label>
          <label className="flex items-center cursor-pointer">
            <input type="radio" name="price" className="mr-1.5" />
            <span className="text-sm">50만원~</span>
          </label>
        </div>
      </div>

      {/* 정렬 */}
      <div className="flex items-center gap-3">
        <span className="font-medium text-sm">정렬:</span>
        <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0f3460] focus:border-transparent text-sm">
          <option value="popular">인기순</option>
          <option value="latest">최신순</option>
          <option value="price_low">가격 낮은순</option>
          <option value="price_high">가격 높은순</option>
          <option value="rating">평점순</option>
        </select>
      </div>

      {/* 초기화 버튼 */}
      <button className="ml-auto px-4 py-2 text-sm text-[#0f3460] border border-[#0f3460] rounded-lg hover:bg-gray-50 transition-colors">
        초기화
      </button>
    </div>
  )
}
