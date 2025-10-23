'use client'

import { useState } from 'react'
import { AI_TOOLS } from '@/lib/constants'

interface CategoryFilterProps {
  categoryId: string
  isAI: boolean
}

export default function CategoryFilter({ categoryId, isAI }: CategoryFilterProps) {
  const [priceRange, setPriceRange] = useState([0, 1000000])
  const [deliveryDays, setDeliveryDays] = useState<number | null>(null)
  const [rating, setRating] = useState<number | null>(null)
  const [selectedTools, setSelectedTools] = useState<string[]>([])

  // AI 툴 목록 가져오기
  const getAITools = () => {
    if (categoryId.includes('image')) return AI_TOOLS.IMAGE
    if (categoryId.includes('video')) return AI_TOOLS.VIDEO
    if (categoryId.includes('writing')) return AI_TOOLS.WRITING
    if (categoryId.includes('programming')) return AI_TOOLS.CODING
    if (categoryId.includes('audio') || categoryId.includes('music')) return [...AI_TOOLS.AUDIO, ...AI_TOOLS.MUSIC]
    return []
  }

  const aiTools = isAI ? getAITools() : []

  return (
    <div className="space-y-6">
      <h2 className="font-semibold text-lg">필터</h2>

      {/* 가격 범위 */}
      <div>
        <h3 className="font-medium mb-3">가격 범위</h3>
        <div className="space-y-2">
          <label className="flex items-center">
            <input type="radio" name="price" className="mr-2" />
            <span className="text-sm">전체</span>
          </label>
          <label className="flex items-center">
            <input type="radio" name="price" className="mr-2" />
            <span className="text-sm">~5만원</span>
          </label>
          <label className="flex items-center">
            <input type="radio" name="price" className="mr-2" />
            <span className="text-sm">5만원~10만원</span>
          </label>
          <label className="flex items-center">
            <input type="radio" name="price" className="mr-2" />
            <span className="text-sm">10만원~30만원</span>
          </label>
          <label className="flex items-center">
            <input type="radio" name="price" className="mr-2" />
            <span className="text-sm">30만원~50만원</span>
          </label>
          <label className="flex items-center">
            <input type="radio" name="price" className="mr-2" />
            <span className="text-sm">50만원~</span>
          </label>
        </div>
      </div>

      {/* 작업 기간 */}
      <div>
        <h3 className="font-medium mb-3">작업 기간</h3>
        <div className="space-y-2">
          <label className="flex items-center">
            <input type="checkbox" className="mr-2" />
            <span className="text-sm">24시간 이내</span>
          </label>
          <label className="flex items-center">
            <input type="checkbox" className="mr-2" />
            <span className="text-sm">3일 이내</span>
          </label>
          <label className="flex items-center">
            <input type="checkbox" className="mr-2" />
            <span className="text-sm">7일 이내</span>
          </label>
          <label className="flex items-center">
            <input type="checkbox" className="mr-2" />
            <span className="text-sm">14일 이내</span>
          </label>
        </div>
      </div>

      {/* AI 툴 필터 (AI 카테고리만) */}
      {isAI && aiTools.length > 0 && (
        <div>
          <h3 className="font-medium mb-3">AI 툴</h3>
          <div className="space-y-2">
            {aiTools.map(tool => (
              <label key={tool} className="flex items-center">
                <input
                  type="checkbox"
                  className="mr-2"
                  checked={selectedTools.includes(tool)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedTools([...selectedTools, tool])
                    } else {
                      setSelectedTools(selectedTools.filter(t => t !== tool))
                    }
                  }}
                />
                <span className="text-sm">{tool}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* 판매자 레벨 */}
      <div>
        <h3 className="font-medium mb-3">판매자 레벨</h3>
        <div className="space-y-2">
          <label className="flex items-center">
            <input type="checkbox" className="mr-2" />
            <span className="text-sm flex items-center">
              Master
              <span className="ml-1 text-xs text-purple-600">⭐</span>
            </span>
          </label>
          <label className="flex items-center">
            <input type="checkbox" className="mr-2" />
            <span className="text-sm">Expert</span>
          </label>
          <label className="flex items-center">
            <input type="checkbox" className="mr-2" />
            <span className="text-sm">Professional</span>
          </label>
          <label className="flex items-center">
            <input type="checkbox" className="mr-2" />
            <span className="text-sm">Rising Talent</span>
          </label>
        </div>
      </div>

      {/* 평점 */}
      <div>
        <h3 className="font-medium mb-3">평점</h3>
        <div className="space-y-2">
          <label className="flex items-center">
            <input type="radio" name="rating" className="mr-2" />
            <span className="text-sm flex items-center">
              4.5 이상 ⭐⭐⭐⭐⭐
            </span>
          </label>
          <label className="flex items-center">
            <input type="radio" name="rating" className="mr-2" />
            <span className="text-sm flex items-center">
              4.0 이상 ⭐⭐⭐⭐
            </span>
          </label>
          <label className="flex items-center">
            <input type="radio" name="rating" className="mr-2" />
            <span className="text-sm flex items-center">
              3.5 이상 ⭐⭐⭐
            </span>
          </label>
        </div>
      </div>

      {/* 특별 옵션 */}
      <div>
        <h3 className="font-medium mb-3">특별 옵션</h3>
        <div className="space-y-2">
          <label className="flex items-center">
            <input type="checkbox" className="mr-2" />
            <span className="text-sm">익스프레스 가능</span>
          </label>
          <label className="flex items-center">
            <input type="checkbox" className="mr-2" />
            <span className="text-sm">무제한 수정</span>
          </label>
          <label className="flex items-center">
            <input type="checkbox" className="mr-2" />
            <span className="text-sm">소스파일 제공</span>
          </label>
        </div>
      </div>

      {/* 초기화 버튼 */}
      <button className="w-full py-2 text-purple-600 border border-purple-600 rounded-lg hover:bg-purple-50 transition-colors">
        필터 초기화
      </button>
    </div>
  )
}