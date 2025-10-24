import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-white text-gray-600 border-t border-gray-200">
      <div className="container-1200 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* 회사 소개 */}
          <div>
            <h4 className="text-gray-900 font-semibold mb-4">회사 소개</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/about" className="hover:text-[#0f3460] transition-colors">
                  회사 소개
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-[#0f3460] transition-colors">
                  이용약관
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-[#0f3460] transition-colors">
                  개인정보처리방침
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-[#0f3460] transition-colors">
                  제휴 문의
                </Link>
              </li>
            </ul>
          </div>

          {/* 의뢰인 안내 */}
          <div>
            <h4 className="text-gray-900 font-semibold mb-4">의뢰인 안내</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/buyer/guide" className="hover:text-[#0f3460] transition-colors">
                  이용 가이드
                </Link>
              </li>
              <li>
                <Link href="/buyer/how-to-order" className="hover:text-[#0f3460] transition-colors">
                  서비스 구매 방법
                </Link>
              </li>
              <li>
                <Link href="/buyer/payment" className="hover:text-[#0f3460] transition-colors">
                  결제 안내
                </Link>
              </li>
              <li>
                <Link href="/buyer/refund" className="hover:text-[#0f3460] transition-colors">
                  환불 정책
                </Link>
              </li>
            </ul>
          </div>

          {/* 전문가 안내 */}
          <div>
            <h4 className="text-gray-900 font-semibold mb-4">전문가 안내</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/expert/register" className="hover:text-[#0f3460] transition-colors">
                  전문가 등록
                </Link>
              </li>
              <li>
                <Link href="/seller/guide" className="hover:text-[#0f3460] transition-colors">
                  판매자 가이드
                </Link>
              </li>
              <li>
                <Link href="/seller/commission" className="hover:text-[#0f3460] transition-colors">
                  수수료 안내
                </Link>
              </li>
              <li>
                <Link href="/seller/settlement" className="hover:text-[#0f3460] transition-colors">
                  정산 안내
                </Link>
              </li>
            </ul>
          </div>

          {/* 고객센터 */}
          <div>
            <h4 className="text-gray-900 font-semibold mb-4">고객센터</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/help" className="hover:text-[#0f3460] transition-colors">
                  고객센터
                </Link>
              </li>
              <li>
                <Link href="/help/faq" className="hover:text-[#0f3460] transition-colors">
                  자주 묻는 질문
                </Link>
              </li>
              <li>
                <Link href="/help/notice" className="hover:text-[#0f3460] transition-colors">
                  공지사항
                </Link>
              </li>
              <li>
                <Link href="/help/contact" className="hover:text-[#0f3460] transition-colors">
                  1:1 문의
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* 하단 정보 */}
        <div className="border-t border-gray-200 mt-8 pt-8 text-sm text-center">
          <p className="mb-2 text-gray-600">
            사업자등록번호: 123-45-67890 | 대표: 홍길동 | 통신판매업신고: 2025-서울강남-00000
          </p>
          <p className="mb-4 text-gray-600">
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