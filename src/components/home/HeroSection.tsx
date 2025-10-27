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
    title: '재능 거래, 이제',
    subtitle: '수수료 0%로 시작하세요',
    gradient: 'from-pink-500 to-pink-600',
    icon: 'fa-hand-holding-heart',
    cardTitle: '수수료 0%',
    cardSubtitle: '판매자의 이익을 100% 보장',
    cardDescription: '타 플랫폼과 달리 수수료 걱정 없이 재능을 판매하세요'
  },
  {
    id: 2,
    title: '모든 판매자에게',
    subtitle: '동등한 판매 기회를',
    gradient: 'from-indigo-500 to-indigo-600',
    icon: 'fa-balance-scale',
    cardTitle: '판매 기회 균등',
    cardSubtitle: '모두에게 공정한 기회',
    cardDescription: '신규 판매자도 베테랑과 동등한 노출 기회를 제공합니다'
  },
  {
    id: 3,
    title: '구매자도 이득',
    subtitle: '구매 수수료 0원',
    gradient: 'from-purple-500 to-purple-600',
    icon: 'fa-gift',
    cardTitle: '구매 수수료 0원',
    cardSubtitle: '합리적인 가격으로 구매',
    cardDescription: '추가 수수료 없이 표시된 가격 그대로 이용하세요'
  },
  {
    id: 4,
    title: '성장을 함께',
    subtitle: '광고비 전액 지원',
    gradient: 'from-blue-500 to-blue-600',
    icon: 'fa-rocket',
    cardTitle: '광고비 지원',
    cardSubtitle: '마케팅 걱정 없이',
    cardDescription: '플랫폼에서 적극적으로 당신의 재능을 알려드립니다'
  }
]

export default function HeroSection() {
  const [currentSlide, setCurrentSlide] = useState(0)

  const changeSlide = (index: number) => {
    setCurrentSlide(index)
  }

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length)
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
              <h1 className="text-5xl font-bold text-gray-900 mb-4 transition-all duration-500">
                {slide.title} <span className="text-[#0f3460]">{slide.subtitle}</span>
              </h1>
              <p className="text-xl text-gray-600">
                돌파구에서 당신의 재능을 100% 수익으로 전환하세요
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
          <div className="w-[480px] flex-shrink-0">
            <div className={`relative bg-gradient-to-br ${slide.gradient} rounded-2xl p-8 text-white shadow-2xl transition-all duration-500`}>
              {/* 장식 요소 */}
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/10 rounded-lg rotate-12"></div>

              {/* 아이콘 */}
              <div className="mb-6">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                  <i className={`fas ${slide.icon} text-3xl`}></i>
                </div>
              </div>

              {/* 내용 */}
              <h3 className="text-3xl font-bold mb-2 transition-all duration-500">
                {slide.cardTitle}
              </h3>
              <p className="text-xl mb-4 text-white/90 transition-all duration-500">
                {slide.cardSubtitle}
              </p>
              <p className="text-white/80 leading-relaxed transition-all duration-500">
                {slide.cardDescription}
              </p>

              {/* 페이지네이션 도트 */}
              <div className="flex gap-2 mt-8">
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
