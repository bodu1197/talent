import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* 회사 정보 */}
          <div>
            <h3 className="text-white font-bold text-lg mb-4">AI Talent Hub</h3>
            <p className="text-sm mb-4">
              AI 기술을 활용한 재능 거래 플랫폼
            </p>
            <div className="flex space-x-4">
              <button className="w-8 h-8 bg-gray-800 rounded-full hover:bg-gray-700 transition-colors">
                <span className="sr-only">Facebook</span>
              </button>
              <button className="w-8 h-8 bg-gray-800 rounded-full hover:bg-gray-700 transition-colors">
                <span className="sr-only">Twitter</span>
              </button>
              <button className="w-8 h-8 bg-gray-800 rounded-full hover:bg-gray-700 transition-colors">
                <span className="sr-only">Instagram</span>
              </button>
            </div>
          </div>

          {/* 서비스 */}
          <div>
            <h4 className="text-white font-semibold mb-4">서비스</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/categories/ai-image-design" className="hover:text-white transition-colors">
                  AI 이미지/디자인
                </Link>
              </li>
              <li>
                <Link href="/categories/ai-video-motion" className="hover:text-white transition-colors">
                  AI 영상/모션
                </Link>
              </li>
              <li>
                <Link href="/categories/ai-writing-content" className="hover:text-white transition-colors">
                  AI 글쓰기/콘텐츠
                </Link>
              </li>
              <li>
                <Link href="/categories/ai-programming" className="hover:text-white transition-colors">
                  AI 프로그래밍
                </Link>
              </li>
            </ul>
          </div>

          {/* 고객지원 */}
          <div>
            <h4 className="text-white font-semibold mb-4">고객지원</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/help" className="hover:text-white transition-colors">
                  고객센터
                </Link>
              </li>
              <li>
                <Link href="/help/faq" className="hover:text-white transition-colors">
                  자주 묻는 질문
                </Link>
              </li>
              <li>
                <Link href="/help/guide" className="hover:text-white transition-colors">
                  이용 가이드
                </Link>
              </li>
              <li>
                <Link href="/help/safety" className="hover:text-white transition-colors">
                  안전거래 가이드
                </Link>
              </li>
            </ul>
          </div>

          {/* 회사 */}
          <div>
            <h4 className="text-white font-semibold mb-4">회사</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/about" className="hover:text-white transition-colors">
                  회사 소개
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-white transition-colors">
                  이용약관
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-white transition-colors">
                  개인정보처리방침
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white transition-colors">
                  제휴 문의
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* 하단 정보 */}
        <div className="border-t border-gray-800 mt-8 pt-8 text-sm text-center">
          <p className="mb-2">
            사업자등록번호: 123-45-67890 | 대표: 홍길동 | 통신판매업신고: 2025-서울강남-00000
          </p>
          <p className="mb-4">
            주소: 서울특별시 강남구 테헤란로 123 AI빌딩 5층 | 대표전화: 1234-5678
          </p>
          <p className="text-gray-500">
            © 2025 AI Talent Hub. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}