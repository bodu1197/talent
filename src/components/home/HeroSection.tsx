'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface Slide {
  id: number
  title: string
  subtitle: string
  gradient: string
  icon: string
  cardTitle: string
  cardSubtitle: string
  cardDescription: string
}

const slides: Slide[] = [
  {
    id: 1,
    title: '당신이 번 돈,<br><span style="color: #ec4899; background: #fff; padding: 4px 12px 4px 0; border-radius: 8px;">한 푼도 떼지 않습니다</span>',
    subtitle: '수수료 0%. 당신의 재능이 온전히 당신의 수익으로.',
    gradient: 'from-pink-500 to-pink-600',
    icon: 'fa-sack-dollar',
    cardTitle: '수수료 0% ✨',
    cardSubtitle: '판매자가 100% 가져갑니다',
    cardDescription: '당신이 번 돈, 한 푼도 떼지 않습니다. 다른 플랫폼의 15~20% 수수료는 이제 그만. 톨파구에서는 100% 당신의 것입니다.'
  },
  {
    id: 2,
    title: '첫날부터 공정하게,<br>모두에게 같은 기회를',
    subtitle: '신규 판매자와 베테랑, 시작이 평등한 곳입니다.',
    gradient: 'from-indigo-500 to-indigo-600',
    icon: 'fa-balance-scale',
    cardTitle: '판매 기회 균등',
    cardSubtitle: '모든 판매자에게 공평한 기회',
    cardDescription: '신규든 베테랑이든, 모두에게 같은 기회. 알고리즘도, 편애도 없습니다. 오직 실력으로 승부하세요.'
  },
  {
    id: 3,
    title: '표시된 가격이 전부입니다<br>숨은 비용 없습니다',
    subtitle: '구매 수수료 0원. 보이는 그대로 결제하세요.',
    gradient: 'from-purple-500 to-purple-600',
    icon: 'fa-shield-alt',
    cardTitle: '구매 수수료 0원',
    cardSubtitle: '표시된 가격이 전부입니다',
    cardDescription: '다른 곳처럼 결제 직전 수수료 추가? 없습니다. 보이는 가격이 최종 가격. 숨은 비용 없이 투명하게.'
  },
  {
    id: 4,
    title: '시작하는 당신에게,<br>1,500만원 드립니다',
    subtitle: '런칭 기념. 광고 크레딧으로 첫 고객을 만나세요.',
    gradient: 'from-blue-500 to-blue-600',
    icon: 'fa-bullhorn',
    cardTitle: '런칭 기념 1,500만원',
    cardSubtitle: '시작하는 당신에게 드립니다',
    cardDescription: '런칭 기념, 모든 전문가에게 최대 1,500만원 광고 크레딧 지원. 톨파구 내 광고로 첫 고객을 만나세요.'
  }
]

export default function HeroSection() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)

  const changeSlide = (index: number) => {
    setIsTransitioning(true)
    setTimeout(() => {
      setCurrentSlide(index)
      setIsTransitioning(false)
    }, 300)
  }

  useEffect(() => {
    const timer = setInterval(() => {
      setIsTransitioning(true)
      setTimeout(() => {
        setCurrentSlide((prev) => (prev + 1) % slides.length)
        setIsTransitioning(false)
      }, 300)
    }, 8000)

    return () => clearInterval(timer)
  }, [])

  const slide = slides[currentSlide]

  return (
    <section className="bg-white py-8 sm:py-12 lg:py-16 hidden lg:block">
      <div className="container-1200 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
          {/* 왼쪽: 타이틀 + 검색 + 카테고리 */}
          <div className="flex-1 w-full">
            <div className="mb-6 lg:mb-8">
              <h1
                className={`text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 lg:mb-4 transition-opacity duration-500 lg:min-h-[120px] leading-[1.4] ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}
                dangerouslySetInnerHTML={{ __html: slide.title }}
              />
              <p className={`text-sm sm:text-base text-gray-600 lg:min-h-[48px] leading-[1.5] transition-opacity duration-500 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
                {slide.subtitle}
              </p>
            </div>

            {/* 검색창 - PC에서만 표시 */}
            <div className="mb-4 lg:mb-6 hidden lg:block">
              <div className="relative w-full lg:max-w-[490px]">
                <input
                  type="text"
                  placeholder="어떤 재능이 필요하신가요?"
                  className="w-full px-4 sm:px-6 py-3 sm:py-4 pr-12 border-2 border-gray-300 rounded-full focus:outline-none focus:border-[#0f3460] transition-colors text-gray-900 text-sm sm:text-base"
                />
                <button
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-[#0f3460] text-white w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center hover:bg-[#1a4b7d] transition-colors"
                  aria-label="검색"
                >
                  <i className="fas fa-search text-sm sm:text-base"></i>
                </button>
              </div>
            </div>

            {/* 인기 카테고리 - PC에서만 표시 */}
            <div className="flex-wrap gap-2 sm:gap-3 hidden lg:flex">
              <Link href="/categories/ai-services" className="px-3 sm:px-4 py-1.5 sm:py-2 text-sm sm:text-base bg-blue-50 text-[#0f3460] rounded-full font-medium hover:bg-blue-100 transition-colors flex items-center gap-2">
                <i className="fas fa-robot text-sm sm:text-base"></i> <span className="hidden sm:inline">AI 서비스</span><span className="sm:hidden">AI</span>
              </Link>
              <Link href="/categories/it-programming" className="px-3 sm:px-4 py-1.5 sm:py-2 text-sm sm:text-base bg-gray-100 text-gray-700 rounded-full font-medium hover:bg-gray-200 transition-colors">
                <span className="hidden sm:inline">IT/프로그래밍</span><span className="sm:hidden">IT</span>
              </Link>
              <Link href="/categories/design" className="px-3 sm:px-4 py-1.5 sm:py-2 text-sm sm:text-base bg-gray-100 text-gray-700 rounded-full font-medium hover:bg-gray-200 transition-colors">
                디자인
              </Link>
              <Link href="/categories/marketing" className="px-3 sm:px-4 py-1.5 sm:py-2 text-sm sm:text-base bg-gray-100 text-gray-700 rounded-full font-medium hover:bg-gray-200 transition-colors">
                마케팅
              </Link>
              <Link href="/categories/writing" className="px-3 sm:px-4 py-1.5 sm:py-2 text-sm sm:text-base bg-gray-100 text-gray-700 rounded-full font-medium hover:bg-gray-200 transition-colors hidden sm:inline-flex">
                글쓰기
              </Link>
            </div>
          </div>

          {/* 오른쪽: 그라데이션 카드 + 페이지네이션 */}
          <div className="w-full lg:w-[382px] flex-shrink-0">
            <div className={`relative bg-gradient-to-br ${slide.gradient} rounded-2xl p-5 sm:p-6 text-white shadow-2xl transition-all duration-500 h-[250px] sm:h-[298px] flex flex-col`}>
              {/* 장식 요소 */}
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/10 rounded-lg rotate-12"></div>

              {/* 아이콘 */}
              <div className={`mb-4 transition-opacity duration-500 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
                <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center">
                  <i className={`fas ${slide.icon} text-2xl`}></i>
                </div>
              </div>

              {/* 내용 */}
              <h3 className={`text-2xl font-bold mb-2 transition-opacity duration-500 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
                {slide.cardTitle}
              </h3>
              <p className={`text-lg mb-3 text-white/90 transition-opacity duration-500 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
                {slide.cardSubtitle}
              </p>
              <p className={`text-sm text-white/80 leading-relaxed line-clamp-3 mb-6 transition-opacity duration-500 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
                {slide.cardDescription}
              </p>

              {/* 페이지네이션 도트 */}
              <div className="flex gap-2 mt-auto">
                {slides.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => changeSlide(index)}
                    className={`h-2 rounded-full bg-white/30 transition-all duration-300 hover:bg-white/50 ${
                      index === currentSlide ? 'w-8 bg-white' : 'w-2'
                    }`}
                    aria-label={`슬라이드 ${index + 1}로 이동`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
