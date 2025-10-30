'use client'

import Link from 'next/link'
import { useState } from 'react'

const footerCategories = [
  {
    title: '회사 소개',
    items: [
      { label: '회사 소개', href: '/about' },
      { label: '이용약관', href: '/terms' },
      { label: '개인정보처리방침', href: '/privacy' },
      { label: '제휴 문의', href: '/contact' },
    ],
  },
  {
    title: '의뢰인 안내',
    items: [
      { label: '이용 가이드', href: '/buyer/guide' },
      { label: '서비스 구매 방법', href: '/buyer/how-to-order' },
      { label: '결제 안내', href: '/buyer/payment' },
      { label: '환불 정책', href: '/buyer/refund' },
    ],
  },
  {
    title: '전문가 안내',
    items: [
      { label: '전문가 등록', href: '/expert/register' },
      { label: '판매자 가이드', href: '/seller/guide' },
      { label: '수수료 안내', href: '/seller/commission' },
      { label: '정산 안내', href: '/seller/settlement' },
    ],
  },
  {
    title: '고객센터',
    items: [
      { label: '고객센터', href: '/help' },
      { label: '자주 묻는 질문', href: '/help/faq' },
      { label: '공지사항', href: '/help/notice' },
      { label: '1:1 문의', href: '/help/contact' },
    ],
  },
]

export default function Footer() {
  const [activeCategory, setActiveCategory] = useState<string | null>(null)

  const toggleCategory = (title: string) => {
    setActiveCategory(activeCategory === title ? null : title)
  }

  return (
    <footer className="bg-white text-gray-600 border-t border-gray-200">
      <div className="container-1200 py-6 lg:py-12">
        {/* 데스크톱: 기존 그리드 레이아웃 */}
        <div className="hidden md:grid md:grid-cols-4 gap-8">
          {footerCategories.map((category) => (
            <div key={category.title}>
              <h4 className="text-gray-900 font-semibold mb-4">{category.title}</h4>
              <ul className="space-y-2 text-sm">
                {category.items.map((item) => (
                  <li key={item.href}>
                    <Link href={item.href} className="hover:text-[#0f3460] transition-colors">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* 모바일: 1줄 카테고리 + 드롭다운 */}
        <div className="md:hidden">
          {/* 1차 카테고리 1줄 배치 */}
          <div className="pb-2">
            <div className="flex gap-2 justify-between">
              {footerCategories.map((category) => (
                <button
                  key={category.title}
                  onClick={() => toggleCategory(category.title)}
                  className={`flex-1 px-2 py-2 whitespace-nowrap text-xs font-medium transition-colors ${
                    activeCategory === category.title
                      ? 'text-[#0f3460] font-semibold'
                      : 'text-gray-700'
                  }`}
                >
                  {category.title}
                </button>
              ))}
            </div>
          </div>

          {/* 2차 메뉴 드롭다운 */}
          <div className="mt-2">
            {footerCategories.map((category) => (
              <div
                key={category.title}
                className={`overflow-hidden transition-all duration-300 ease-in-out ${
                  activeCategory === category.title ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                }`}
              >
                <ul className="space-y-3 text-sm bg-gray-50 rounded-lg p-4">
                  {category.items.map((item) => (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className="block hover:text-[#0f3460] transition-colors py-1"
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* 하단 정보 */}
        <div className="border-t border-gray-200 mt-4 pt-4 lg:mt-8 lg:pt-8 text-mobile-sm lg:text-sm text-center">
          <p className="mb-2 text-gray-600">
            사업자등록번호: 123-45-67890 | 대표: 홍길동 | 통신판매업신고: 2025-서울강남-00000
          </p>
          <p className="mb-2 lg:mb-4 text-gray-600">
            주소: 서울특별시 강남구 테헤란로 123 AI빌딩 5층 | 대표전화: 1234-5678
          </p>
          <p className="text-gray-500">
            © 2025 돌파구. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}