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
    title: '재능 거래, 이제 <span style="color: #ec4899; background: #fff; padding: 4px 12px; border-radius: 8px;">수수료 없이!</span><br>순수익 100%를 경험하세요',
    subtitle: '톨파구는 판매자에게 어떠한 수수료도 부과하지 않습니다.',
    gradient: 'from-pink-500 to-pink-600',
    icon: 'fa-sack-dollar',
    cardTitle: '수수료 0% ✨',
    cardSubtitle: '판매자가 100% 가져갑니다',
    cardDescription: '⭐ 플랫폼 수수료가 전혀 없습니다! 구매 수수료도 판매 수수료도 없습니다. 당신이 번 모든 수익을 100% 그대로 가져가세요.'
  },
  {
    id: 2,
    title: '판매 기회가 균등하다,<br>누구나 공정하게 시작하세요',
    subtitle: '모든 판매자에게 동등한 기회를 제공하는 플랫폼입니다.',
    gradient: 'from-indigo-500 to-indigo-600',
    icon: 'fa-balance-scale',
    cardTitle: '판매 기회 균등',
    cardSubtitle: '모든 판매자에게 공평한 기회',
    cardDescription: '톨파구는 모든 판매자에게 동등한 노출 기회를 제공합니다. 신규 판매자도 공정하게 경쟁할 수 있습니다.'
  },
  {
    id: 3,
    title: '구매 수수료 없음,<br>상품 가격만 지불하세요',
    subtitle: '타 플랫폼과 달리 구매 시 추가 수수료가 전혀 없습니다.',
    gradient: 'from-purple-500 to-purple-600',
    icon: 'fa-shield-alt',
    cardTitle: '구매 수수료 0원',
    cardSubtitle: '상품 가격만 지불하세요',
    cardDescription: '타 업체는 구매자에게도 수수료를 부과합니다. 톨파구는 구매 시 추가 수수료가 전혀 없습니다. 표시된 가격 그대로 결제하세요.'
  },
  {
    id: 4,
    title: '광고비 지원 1,500만원,<br>판매 등록자의 성공을 응원합니다',
    subtitle: '톨파구와 함께 더 빠르게 성장하세요.',
    gradient: 'from-blue-500 to-blue-600',
    icon: 'fa-bullhorn',
    cardTitle: '광고비 지원',
    cardSubtitle: '연 1,500만원 지원',
    cardDescription: '판매 등록자에게 연간 최대 1,500만원의 광고비를 지원하여 더 많은 고객을 만날 수 있도록 돕습니다.'
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
    <section className="bg-white py-16">
      <div className="container-1200">
        <div className="flex items-center gap-12">
          {/* 왼쪽: 타이틀 + 검색 + 카테고리 */}
          <div className="flex-1">
            <div className="mb-8">
              <h1
                className={`text-4xl font-bold text-gray-900 mb-4 transition-opacity duration-500 min-h-[120px] ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}
                dangerouslySetInnerHTML={{ __html: slide.title }}
              />
              <p className={`text-base text-gray-600 min-h-[48px] transition-opacity duration-500 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
                {slide.subtitle}
              </p>
            </div>

            {/* 검색창 */}
            <div className="mb-6">
              <div className="relative">
                <input
                  type="text"
                  placeholder="어떤 재능이 필요하신가요?"
                  className="w-full px-6 py-4 pr-12 border-2 border-gray-300 rounded-full focus:outline-none focus:border-[#0f3460] transition-colors text-gray-900"
                />
                <button className="absolute right-2 top-1/2 -translate-y-1/2 bg-[#0f3460] text-white w-10 h-10 rounded-full flex items-center justify-center hover:bg-[#1a4b7d] transition-colors">
                  <i className="fas fa-search"></i>
                </button>
              </div>
            </div>

            {/* 인기 카테고리 */}
            <div className="flex flex-wrap gap-3">
              <Link href="/categories/ai-services" className="px-4 py-2 bg-blue-50 text-[#0f3460] rounded-full font-medium hover:bg-blue-100 transition-colors flex items-center gap-2">
                <i className="fas fa-robot"></i> AI 서비스
              </Link>
              <Link href="/categories/it-programming" className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full font-medium hover:bg-gray-200 transition-colors">
                IT/프로그래밍
              </Link>
              <Link href="/categories/design" className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full font-medium hover:bg-gray-200 transition-colors">
                디자인
              </Link>
              <Link href="/categories/marketing" className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full font-medium hover:bg-gray-200 transition-colors">
                마케팅
              </Link>
              <Link href="/categories/writing" className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full font-medium hover:bg-gray-200 transition-colors">
                글쓰기
              </Link>
            </div>
          </div>

          {/* 오른쪽: 그라데이션 카드 + 페이지네이션 */}
          <div className="w-[347px] flex-shrink-0">
            <div className={`relative bg-gradient-to-br ${slide.gradient} rounded-2xl p-6 text-white shadow-2xl transition-all duration-500 h-[298px] flex flex-col`}>
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
