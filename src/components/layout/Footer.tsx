'use client'

import Link from 'next/link'
import { useState } from 'react'

export default function Footer() {
  const [isBusinessInfoOpen, setIsBusinessInfoOpen] = useState(false)

  return (
    <footer className="bg-white text-gray-600 border-t border-gray-200">
      {/* 데스크톱: 기존 그리드 레이아웃 */}
      <div className="hidden md:block">
        <div className="container-1200 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h4 className="text-gray-900 font-semibold mb-4">회사 소개</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/about" className="hover:text-[#0f3460] transition-colors">회사 소개</Link></li>
                <li><Link href="/terms" className="hover:text-[#0f3460] transition-colors">이용약관</Link></li>
                <li><Link href="/privacy" className="hover:text-[#0f3460] transition-colors">개인정보처리방침</Link></li>
                <li><Link href="/contact" className="hover:text-[#0f3460] transition-colors">제휴 문의</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-gray-900 font-semibold mb-4">의뢰인 안내</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/buyer/guide" className="hover:text-[#0f3460] transition-colors">이용 가이드</Link></li>
                <li><Link href="/buyer/how-to-order" className="hover:text-[#0f3460] transition-colors">서비스 구매 방법</Link></li>
                <li><Link href="/buyer/payment" className="hover:text-[#0f3460] transition-colors">결제 안내</Link></li>
                <li><Link href="/buyer/refund" className="hover:text-[#0f3460] transition-colors">환불 정책</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-gray-900 font-semibold mb-4">전문가 안내</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/expert/register" className="hover:text-[#0f3460] transition-colors">전문가 등록</Link></li>
                <li><Link href="/seller/guide" className="hover:text-[#0f3460] transition-colors">판매자 가이드</Link></li>
                <li><Link href="/seller/commission" className="hover:text-[#0f3460] transition-colors">수수료 안내</Link></li>
                <li><Link href="/seller/settlement" className="hover:text-[#0f3460] transition-colors">정산 안내</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-gray-900 font-semibold mb-4">고객센터</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/help" className="hover:text-[#0f3460] transition-colors">고객센터</Link></li>
                <li><Link href="/help/faq" className="hover:text-[#0f3460] transition-colors">자주 묻는 질문</Link></li>
                <li><Link href="/help/notice" className="hover:text-[#0f3460] transition-colors">공지사항</Link></li>
                <li><Link href="/help/contact" className="hover:text-[#0f3460] transition-colors">1:1 문의</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-200 mt-8 pt-8 text-sm text-center">
            <p className="mb-2 text-gray-600">사업자등록번호: 123-45-67890 | 대표: 홍길동 | 통신판매업신고: 2025-서울강남-00000</p>
            <p className="mb-4 text-gray-600">주소: 서울특별시 강남구 테헤란로 123 AI빌딩 5층 | 대표전화: 1234-5678</p>
            <p className="text-gray-500">© 2025 돌파구. All rights reserved.</p>
          </div>
        </div>
      </div>

      {/* 모바일: 새로운 디자인 */}
      <div className="md:hidden">
        {/* 1. 탭 메뉴 */}
        <nav className="border-b border-gray-200">
          <div className="flex justify-around py-4">
            <Link
              href="/recruit"
              className="text-mobile-md font-medium text-gray-800 hover:text-[#0f3460] transition-colors"
              aria-label="인재영입"
            >
              인재영입
            </Link>
            <Link
              href="/service"
              className="text-mobile-md font-medium text-gray-800 hover:text-[#0f3460] transition-colors"
              aria-label="서비스소개"
            >
              서비스소개
            </Link>
            <Link
              href="/faq"
              className="text-mobile-md font-medium text-gray-800 hover:text-[#0f3460] transition-colors"
              aria-label="FAQ"
            >
              FAQ
            </Link>
            <Link
              href="/support"
              className="text-mobile-md font-medium text-gray-800 hover:text-[#0f3460] transition-colors"
              aria-label="고객센터"
            >
              고객센터
            </Link>
          </div>
        </nav>

        {/* 2. 회사 정보 텍스트 */}
        <div className="px-5 pt-6">
          <p className="text-mobile-sm text-gray-500 text-center leading-relaxed">
            (주)돌파구는 통신판매중개자이며, 통신판매의 당사자가 아닙니다.<br />
            상품, 상품정보, 거래에 관한 의무와 책임은 판매회원에게 있습니다.
          </p>
        </div>

        {/* 3. 회사 사업자정보 드롭다운 */}
        <div className="px-5 pt-4">
          <button
            onClick={() => setIsBusinessInfoOpen(!isBusinessInfoOpen)}
            className="w-full flex items-center justify-between py-3 text-mobile-md font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#0f3460] focus:ring-offset-2 rounded"
            aria-expanded={isBusinessInfoOpen}
            aria-label="사업자정보 토글"
          >
            <span>(주) 돌파구 사업자정보</span>
            <i className={`fas fa-chevron-${isBusinessInfoOpen ? 'up' : 'down'} text-mobile-sm text-gray-600 transition-transform`}></i>
          </button>

          {/* 드롭다운 내용 */}
          <div
            className={`overflow-hidden transition-all duration-300 ease-in-out ${
              isBusinessInfoOpen ? 'max-h-96 opacity-100 mt-3' : 'max-h-0 opacity-0'
            }`}
          >
            <div className="text-mobile-sm text-gray-600 space-y-1.5 pb-3">
              <p>대표이사: 홍길동</p>
              <p>사업자등록번호: 123-45-67890</p>
              <p>통신판매업신고번호: 2025-서울강남-00000</p>
              <p>주소: 서울특별시 강남구 테헤란로 123 AI빌딩 5층</p>
              <p>고객센터: 1234-5678</p>
              <p>이메일: contact@dolpagu.com</p>
            </div>
          </div>
        </div>

        {/* 4. 약관 링크 */}
        <div className="px-5 pt-4 pb-6">
          <div className="flex items-center justify-center gap-3">
            <Link
              href="/terms"
              className="text-mobile-sm text-gray-700 underline hover:text-[#0f3460] transition-colors focus:outline-none focus:ring-2 focus:ring-[#0f3460] focus:ring-offset-2 rounded"
              aria-label="이용약관"
            >
              이용약관
            </Link>
            <span className="text-gray-300">|</span>
            <Link
              href="/privacy"
              className="text-mobile-sm text-gray-700 underline hover:text-[#0f3460] transition-colors focus:outline-none focus:ring-2 focus:ring-[#0f3460] focus:ring-offset-2 rounded font-semibold"
              aria-label="개인정보처리방침"
            >
              개인정보처리방침
            </Link>
          </div>

          {/* 저작권 */}
          <p className="text-mobile-sm text-gray-500 text-center mt-4">
            © 2025 돌파구. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}