'use client'

import Link from 'next/link'

interface AIShowcaseItem {
  id: string
  title: string
  category: string
  thumbnail: string
  price: string
  rating: number
  reviews: number
  seller: string
  slug: string
}

// 샘플 데이터 (나중에 실제 데이터로 교체)
const showcaseItems: AIShowcaseItem[] = []

export default function AITalentShowcase() {
  return (
    <section className="py-6 lg:py-7 bg-white -mt-5 lg:mt-0">
      <div className="container-1200">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-lg lg:text-xl font-bold mb-2">AI 재능 쇼케이스</h2>
            <p className="text-gray-600">AI 전문가들의 인기 서비스</p>
          </div>
          <button className="hidden md:block px-4 py-2 border border-[#0f3460] text-[#0f3460] rounded-lg hover:bg-gray-50 transition-colors">
            전체보기
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {showcaseItems.map((item) => (
            <Link
              key={item.id}
              href={`/categories/${item.slug}`}
              className="card group cursor-pointer"
            >
              {/* 썸네일 */}
              <div className="relative bg-gray-100 rounded-t-lg overflow-hidden h-48">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                  <span className="text-6xl opacity-20">
                    <i className="fas fa-robot"></i>
                  </span>
                </div>
                <div className="absolute top-3 left-3">
                  <span className="px-3 py-1 bg-[#0f3460] text-white text-xs font-medium rounded-full">
                    {item.category}
                  </span>
                </div>
              </div>

              {/* 정보 */}
              <div className="p-4">
                <h3 className="font-bold text-lg mb-2 line-clamp-1 group-hover:text-[#0f3460] transition-colors">
                  {item.title}
                </h3>

                <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                  <span className="flex items-center gap-1">
                    <i className="fas fa-star text-yellow-400"></i>
                    <span className="font-semibold">{item.rating}</span>
                  </span>
                  <span>({item.reviews})</span>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-2xl font-bold text-gray-900">
                      {item.price}
                    </span>
                    <span className="text-gray-600 ml-1">원~</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}

          {/* 플레이스홀더 카드들 (12개까지 채우기) */}
          {Array.from({ length: Math.max(0, 12 - showcaseItems.length) }, (_, i) => (
            <Link key={`placeholder-${i}`} href="/expert/register?category=ai-services">
              <div className="card group cursor-pointer group-hover:scale-105 transition-transform duration-200">
                <div className="relative bg-gradient-to-br from-[#0f3460] to-[#1a4b7d] rounded-t-lg overflow-hidden h-48 flex items-center justify-center">
                  {/* 배경 패턴 */}
                  <div className="absolute inset-0 opacity-10">
                    <div className="absolute inset-0" style={{
                      backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,.05) 10px, rgba(255,255,255,.05) 20px)'
                    }}></div>
                  </div>

                  {/* 컨텐츠 */}
                  <div className="relative z-10 text-center px-3 py-4 text-white">
                    <h3 className="font-bold text-lg mb-4">공평한 판매기회 !</h3>

                    <div className="space-y-1.5 text-xs text-white/90 mb-4">
                      <div>✓ 판매 수수료 0원</div>
                      <div>✓ 광고비 1,500만원 무료 지원</div>
                      <div>✓ 실력으로 승부하는 공평한 플랫폼</div>
                    </div>

                    <div className="inline-block px-4 py-2 bg-white/20 rounded-full text-xs font-medium group-hover:bg-white/30 transition-colors">
                      지금 시작하기 →
                    </div>
                  </div>
                </div>

                {/* 하단 정보 영역 */}
                <div className="p-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                    <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center">
                      <i className="fas fa-rocket text-xs text-gray-500"></i>
                    </div>
                    <span>여기가 당신의 자리입니다</span>
                  </div>
                  <p className="font-bold text-[#0f3460] text-lg">이 자리를 선점하세요!</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
