import Link from 'next/link';
import FooterMobileBusinessInfo from './FooterMobileBusinessInfo';

export default function Footer() {
  return (
    <footer className="bg-white text-gray-600 border-t border-gray-200">
      {/* 데스크톱: 기존 그리드 레이아웃 */}
      <div className="hidden md:block">
        <div className="container-1200 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <p className="text-gray-900 font-semibold mb-4">회사 소개</p>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/about" className="hover:text-brand-primary transition-colors">
                    회사 소개
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="hover:text-brand-primary transition-colors">
                    이용약관
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="hover:text-brand-primary transition-colors">
                    개인정보처리방침
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <p className="text-gray-900 font-semibold mb-4">의뢰인 안내</p>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/buyer/guide" className="hover:text-brand-primary transition-colors">
                    이용 가이드
                  </Link>
                </li>
                <li>
                  <Link
                    href="/buyer/how-to-order"
                    className="hover:text-brand-primary transition-colors"
                  >
                    서비스 구매 방법
                  </Link>
                </li>
                <li>
                  <Link
                    href="/buyer/payment"
                    className="hover:text-brand-primary transition-colors"
                  >
                    결제 안내
                  </Link>
                </li>
                <li>
                  <Link href="/buyer/refund" className="hover:text-brand-primary transition-colors">
                    환불 정책
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <p className="text-gray-900 font-semibold mb-4">전문가 안내</p>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link
                    href="/mypage/seller/register"
                    className="hover:text-brand-primary transition-colors"
                  >
                    전문가 등록
                  </Link>
                </li>
                <li>
                  <Link href="/seller/guide" className="hover:text-brand-primary transition-colors">
                    전문가 가이드
                  </Link>
                </li>
                <li>
                  <Link
                    href="/seller/commission"
                    className="hover:text-brand-primary transition-colors"
                  >
                    수수료 안내
                  </Link>
                </li>
                <li>
                  <Link
                    href="/mypage/seller/earnings"
                    className="hover:text-brand-primary transition-colors"
                  >
                    정산 안내
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <p className="text-gray-900 font-semibold mb-4">고객센터</p>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/help" className="hover:text-brand-primary transition-colors">
                    고객센터
                  </Link>
                </li>
                <li>
                  <Link href="/help/faq" className="hover:text-brand-primary transition-colors">
                    자주 묻는 질문
                  </Link>
                </li>
                <li>
                  <Link href="/help/notice" className="hover:text-brand-primary transition-colors">
                    공지사항
                  </Link>
                </li>
                <li>
                  <Link href="/help/contact" className="hover:text-brand-primary transition-colors">
                    1:1 문의
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-200 mt-8 pt-8 text-sm text-center">
            <p className="mb-4 text-gray-500 text-xs">
              돌파구는 통신판매중개자이며, 통신판매의 당사자가 아닙니다.
              <br />
              상품, 상품정보, 거래에 관한 의무와 책임은 판매회원에게 있습니다.
            </p>
            <p className="mb-2 text-gray-600">
              사업자등록번호: 363-06-01936 | 대표: 배미미 | 통신판매업신고: 제 2022-경기광명-1283호
            </p>
            <p className="mb-2 text-gray-600">주소: 서울시 마포구 월드컵로 81 3층</p>
            <p className="mb-2 text-gray-600">
              고객센터: 070-8019-6077 | dolpagu@dolpagu.com (주말 및 공휴일 휴무 / 오전 10시 ~ 오후
              7시)
            </p>
            <p className="mb-4 text-gray-500 text-xs">
              (주)플랫폼몬스터에서 결제된 예약금 환불 관련한 의무 및 책임은 저희 플랫폼몬스터에
              있습니다.
            </p>
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
              href="/about"
              className="text-mobile-md font-medium text-gray-800 hover:text-brand-primary transition-colors"
              aria-label="회사소개"
            >
              회사소개
            </Link>
            <Link
              href="/buyer/guide"
              className="text-mobile-md font-medium text-gray-800 hover:text-brand-primary transition-colors"
              aria-label="이용가이드"
            >
              이용가이드
            </Link>
            <Link
              href="/help/faq"
              className="text-mobile-md font-medium text-gray-800 hover:text-brand-primary transition-colors"
              aria-label="FAQ"
            >
              FAQ
            </Link>
            <Link
              href="/help"
              className="text-mobile-md font-medium text-gray-800 hover:text-brand-primary transition-colors"
              aria-label="고객센터"
            >
              고객센터
            </Link>
          </div>
        </nav>

        {/* 2. 회사 정보 텍스트 */}
        <div className="px-5 pt-6">
          <p className="text-[12px] text-gray-500 text-center leading-relaxed">
            돌파구는 통신판매중개자이며, 통신판매의 당사자가 아닙니다.
            <br />
            상품, 상품정보, 거래에 관한 의무와 책임은
            <br />
            판매회원에게 있습니다.
          </p>
        </div>

        {/* 3. 회사 사업자정보 드롭다운 */}
        <FooterMobileBusinessInfo />

        {/* 4. 약관 링크 */}
        <div className="px-5 pt-4 pb-[44px]">
          <div className="flex items-center justify-center gap-3">
            <Link
              href="/terms"
              className="text-mobile-sm text-gray-700 hover:text-brand-primary transition-colors focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2 rounded"
              aria-label="이용약관"
            >
              이용약관
            </Link>
            <span className="text-gray-300">|</span>
            <Link
              href="/privacy"
              className="text-mobile-sm text-gray-700 hover:text-brand-primary transition-colors focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2 rounded font-semibold"
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
  );
}
