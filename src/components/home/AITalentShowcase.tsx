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
const showcaseItems: AIShowcaseItem[] = [
  {
    id: '1',
    title: 'AI 프로필 사진 생성',
    category: 'AI 이미지',
    thumbnail: '/api/placeholder/400/300',
    price: '50,000',
    rating: 4.9,
    reviews: 123,
    seller: '전문가A',
    slug: 'ai-profile-photo'
  },
  {
    id: '2',
    title: 'AI 숏폼 영상 제작',
    category: 'AI 영상',
    thumbnail: '/api/placeholder/400/300',
    price: '150,000',
    rating: 5.0,
    reviews: 89,
    seller: '전문가B',
    slug: 'ai-short-form-video'
  },
  {
    id: '3',
    title: 'AI 블로그 포스팅',
    category: 'AI 콘텐츠',
    thumbnail: '/api/placeholder/400/300',
    price: '30,000',
    rating: 4.8,
    reviews: 201,
    seller: '전문가C',
    slug: 'ai-blog-posting'
  },
  {
    id: '4',
    title: 'AI 로고 디자인',
    category: 'AI 이미지',
    thumbnail: '/api/placeholder/400/300',
    price: '80,000',
    rating: 4.9,
    reviews: 156,
    seller: '전문가D',
    slug: 'ai-logo-design'
  },
  {
    id: '5',
    title: 'AI 음성 더빙',
    category: 'AI 음향',
    thumbnail: '/api/placeholder/400/300',
    price: '70,000',
    rating: 4.7,
    reviews: 78,
    seller: '전문가E',
    slug: 'ai-voice-dubbing'
  },
  {
    id: '6',
    title: 'AI 마케팅 전략',
    category: 'AI 마케팅',
    thumbnail: '/api/placeholder/400/300',
    price: '200,000',
    rating: 5.0,
    reviews: 45,
    seller: '전문가F',
    slug: 'ai-marketing-strategy'
  }
]

export default function AITalentShowcase() {
  return (
    <section className="py-16 lg:py-7 bg-white">
      <div className="container-1200">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-xl font-bold mb-2">AI 재능 쇼케이스</h2>
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
        </div>
      </div>
    </section>
  )
}
