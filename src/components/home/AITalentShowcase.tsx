import Link from 'next/link'

interface Service {
  id: string
  title: string
  description?: string
  price: number
  thumbnail_url?: string
  rating?: number
  order_count?: number
  seller?: {
    id: string
    display_name?: string
    business_name?: string
    is_verified: boolean
  }
}

interface Props {
  services: Service[]
}

export default function AITalentShowcase({ services = [] }: Props) {
  return (
    <section className="py-8 bg-white">
      <div className="container-1200">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-mobile-lg lg:text-xl font-bold mb-2">AI 재능 쇼케이스</h2>
            <p className="text-mobile-md text-gray-600">AI 전문가들의 인기 서비스</p>
          </div>
          <Link
            href="/categories/ai-services"
            className="hidden md:block px-4 py-2 border border-brand-primary text-brand-primary rounded-lg hover:bg-gray-50 transition-colors text-mobile-md lg:text-base"
          >
            전체보기
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {/* 실제 AI 서비스 카드 */}
          {services.map((service) => (
            <Link key={service.id} href={`/services/${service.id}`} className="group relative">
              <div className="bg-gray-100 rounded-lg overflow-hidden w-full relative" style={{ aspectRatio: '210/160' }}>
                {service.thumbnail_url ? (
                  <img
                    src={service.thumbnail_url}
                    alt={service.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-100">
                    <i className="fas fa-robot text-4xl text-gray-400"></i>
                  </div>
                )}

                {/* AI 배지 */}
                <div className="absolute top-2 left-2">
                  <div className="px-2 py-1 bg-purple-500 text-white text-xs rounded shadow-lg flex items-center gap-1">
                    <i className="fas fa-robot"></i>
                    AI
                  </div>
                </div>
              </div>

              {/* 서비스 정보 */}
              <div className="mt-2">
                {/* 판매자 */}
                <div className="flex items-center gap-1 mb-1">
                  <div className="w-4 h-4 rounded-full bg-[#0f3460] flex items-center justify-center text-white text-[8px] font-bold">
                    {service.seller?.display_name?.[0] || 'S'}
                  </div>
                  <span className="text-xs text-gray-600 truncate">
                    {service.seller?.display_name}
                  </span>
                  {service.seller?.is_verified && (
                    <i className="fas fa-check-circle text-[10px] text-blue-500"></i>
                  )}
                </div>

                {/* 제목 */}
                <h3 className="font-medium text-sm line-clamp-2 group-hover:text-[#0f3460] transition-colors mb-1">
                  {service.title}
                </h3>

                {/* 평점 */}
                <div className="flex items-center gap-2 text-xs text-gray-600 mb-1">
                  <span className="flex items-center gap-1">
                    <i className="fas fa-star text-yellow-400"></i>
                    {(service.rating || 0).toFixed(1)}
                  </span>
                </div>

                {/* 가격 */}
                <p className="text-[#0f3460] font-bold text-sm">
                  {(service.price || 0).toLocaleString()}원
                </p>
              </div>
            </Link>
          ))}

          {/* 플레이스홀더 카드들 (15개까지 채우기) */}
          {Array.from({ length: Math.max(0, 15 - services.length) }, (_, i) => (
            <Link key={`placeholder-${i}`} href="/expert/register?category=ai-services" className="group relative">
              <div className="bg-gradient-to-br from-[#0f3460] to-[#1a5490] rounded-lg overflow-hidden w-full relative" style={{ aspectRatio: '210/160' }}>
                {/* 배경 패턴 */}
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute inset-0 pattern-diagonal-stripes"></div>
                </div>

                {/* 컨텐츠 */}
                <div className="relative z-10 h-full flex flex-col items-center justify-center px-2 py-3 text-white text-center">
                  <h3 className="font-bold text-xs mb-2">공평한 판매기회!</h3>

                  <div className="space-y-0.5 text-[10px] text-white/90 mb-2">
                    <div>✓ 판매 수수료 0원</div>
                    <div>✓ 광고비 1,500만원 무료</div>
                    <div>✓ 공평한 플랫폼</div>
                  </div>

                  <div className="inline-block px-2 py-1 bg-white/20 rounded-full text-[10px] font-medium group-hover:bg-white/30 transition-colors">
                    지금 시작 →
                  </div>
                </div>
              </div>

              {/* 하단 정보 */}
              <div className="mt-2">
                <div className="flex items-center gap-1 mb-1">
                  <div className="w-4 h-4 rounded-full bg-gray-200 flex items-center justify-center">
                    <i className="fas fa-rocket text-[8px] text-gray-500"></i>
                  </div>
                  <span className="text-xs text-gray-600 truncate">여기가 당신의 자리</span>
                </div>

                <h3 className="font-medium text-sm line-clamp-2 group-hover:text-[#0f3460] transition-colors mb-1">
                  이 자리를 선점하세요!
                </h3>

                <div className="flex items-center gap-2 text-xs text-gray-600 mb-1">
                  <span className="flex items-center gap-1">
                    <i className="fas fa-star text-yellow-400"></i>
                    5.0
                  </span>
                  <span>(0)</span>
                </div>

                <p className="text-[#0f3460] font-bold text-sm">
                  무료
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
