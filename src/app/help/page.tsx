import Link from "next/link";
import {
  FaSearch,
  FaQuestionCircle,
  FaBullhorn,
  FaComments,
  FaPhone,
  FaShoppingBag,
  FaStore,
} from "react-icons/fa";

export default function HelpPage() {
  return (
    <div className="container-1200 py-16">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold mb-4">고객센터</h1>
        <p className="text-gray-600">무엇을 도와드릴까요?</p>
      </div>

      {/* 검색 */}
      <div className="max-w-2xl mx-auto mb-12">
        <div className="relative">
          <input
            id="help-search"
            name="help-search"
            type="text"
            placeholder="궁금하신 내용을 검색해보세요"
            className="w-full px-6 py-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary"
            autoComplete="off"
          />
          <button
            aria-label="검색"
            className="absolute right-4 top-1/2 -translate-y-1/2 text-brand-primary"
          >
            <FaSearch className="text-xl" />
          </button>
        </div>
      </div>

      {/* 주요 메뉴 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
        <Link
          href="/help/faq"
          className="bg-white rounded-lg border border-gray-200 p-8 text-center hover:border-brand-primary hover:shadow-lg transition-all group"
        >
          <div className="w-16 h-16 bg-brand-primary bg-opacity-10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-opacity-20 transition-colors">
            <FaQuestionCircle className="text-brand-primary text-3xl" />
          </div>
          <h3 className="font-bold text-lg mb-2">자주 묻는 질문</h3>
          <p className="text-sm text-gray-600">FAQ를 확인해보세요</p>
        </Link>

        <Link
          href="/help/notice"
          className="bg-white rounded-lg border border-gray-200 p-8 text-center hover:border-brand-primary hover:shadow-lg transition-all group"
        >
          <div className="w-16 h-16 bg-brand-primary bg-opacity-10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-opacity-20 transition-colors">
            <FaBullhorn className="text-brand-primary text-3xl" />
          </div>
          <h3 className="font-bold text-lg mb-2">공지사항</h3>
          <p className="text-sm text-gray-600">최신 소식을 확인하세요</p>
        </Link>

        <Link
          href="/help/contact"
          className="bg-white rounded-lg border border-gray-200 p-8 text-center hover:border-brand-primary hover:shadow-lg transition-all group"
        >
          <div className="w-16 h-16 bg-brand-primary bg-opacity-10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-opacity-20 transition-colors">
            <FaComments className="text-brand-primary text-3xl" />
          </div>
          <h3 className="font-bold text-lg mb-2">1:1 문의</h3>
          <p className="text-sm text-gray-600">직접 문의하기</p>
        </Link>

        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
          <div className="w-16 h-16 bg-brand-primary bg-opacity-10 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaPhone className="text-brand-primary text-3xl" />
          </div>
          <h3 className="font-bold text-lg mb-2">전화 상담</h3>
          <p className="text-sm text-gray-600 mb-2">1234-5678</p>
          <p className="text-xs text-gray-500">평일 09:00 - 18:00</p>
        </div>
      </div>

      {/* 카테고리별 도움말 */}
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold mb-6">카테고리별 도움말</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <FaShoppingBag className="text-brand-primary" />
              구매자 가이드
            </h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>
                <Link href="/buyer/guide" className="hover:text-brand-primary">
                  • 서비스 구매 방법
                </Link>
              </li>
              <li>
                <Link
                  href="/buyer/payment"
                  className="hover:text-brand-primary"
                >
                  • 결제 안내
                </Link>
              </li>
              <li>
                <Link href="/buyer/refund" className="hover:text-brand-primary">
                  • 환불 정책
                </Link>
              </li>
            </ul>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <FaStore className="text-brand-primary" />
              판매자 가이드
            </h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>
                <Link href="/seller/guide" className="hover:text-brand-primary">
                  • 판매자 가이드
                </Link>
              </li>
              <li>
                <Link
                  href="/seller/commission"
                  className="hover:text-brand-primary"
                >
                  • 수수료 안내
                </Link>
              </li>
              <li>
                <Link
                  href="/seller/settlement"
                  className="hover:text-brand-primary"
                >
                  • 정산 안내
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
