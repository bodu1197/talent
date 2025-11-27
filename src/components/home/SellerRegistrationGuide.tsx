import Link from 'next/link';

export default function SellerRegistrationGuide() {
  return (
    <section className="py-4 md:py-16 bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="container-1200">
        <div className="max-w-6xl mx-auto">
          {/* 제목 */}
          <div className="text-center mb-6 md:mb-12">
            <h2 className="text-xl md:text-3xl lg:text-4xl font-semibold text-gray-900 mb-2 md:mb-4">
              돌파구 판매자가 되어보세요
            </h2>
            <p className="text-sm md:text-lg text-gray-600">
              당신의 재능을 공유하고 수익을 창출하세요
            </p>
          </div>

          {/* 혜택 카드들 - 모바일: 가로 스크롤, PC: 그리드 */}
          <div className="md:hidden flex gap-3 overflow-x-auto pb-4 scrollbar-hide -mx-3 px-3 snap-x snap-mandatory">
            {/* 모바일 카드 - 수수료 0원 */}
            <div className="bg-white rounded-xl p-4 shadow-sm flex-shrink-0 w-[200px] snap-start">
              <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center mb-3">
                <svg
                  className="w-5 h-5 text-pink-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                  />
                </svg>
              </div>
              <h3 className="text-base font-semibold text-gray-900 mb-1">수수료 0원</h3>
              <p className="text-xs text-gray-600">판매 수수료 없이 100% 수익을 가져가세요</p>
            </div>

            {/* 모바일 카드 - 판매기회균등 */}
            <div className="bg-white rounded-xl p-4 shadow-sm flex-shrink-0 w-[200px] snap-start">
              <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center mb-3">
                <svg
                  className="w-5 h-5 text-indigo-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3"
                  />
                </svg>
              </div>
              <h3 className="text-base font-semibold text-gray-900 mb-1">판매기회균등</h3>
              <p className="text-xs text-gray-600">신규 판매자도 동등한 노출 기회를 드립니다</p>
            </div>

            {/* 모바일 카드 - 수익 창출 */}
            <div className="bg-white rounded-xl p-4 shadow-sm flex-shrink-0 w-[200px] snap-start">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mb-3">
                <svg
                  className="w-5 h-5 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-base font-semibold text-gray-900 mb-1">수익 창출</h3>
              <p className="text-xs text-gray-600">
                당신의 전문성으로 안정적인 수익을 만들어보세요
              </p>
            </div>

            {/* 모바일 카드 - 넓은 고객층 */}
            <div className="bg-white rounded-xl p-4 shadow-sm flex-shrink-0 w-[200px] snap-start">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mb-3">
                <svg
                  className="w-5 h-5 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
              </div>
              <h3 className="text-base font-semibold text-gray-900 mb-1">넓은 고객층</h3>
              <p className="text-xs text-gray-600">
                다양한 고객들과 연결되어 비즈니스를 확장하세요
              </p>
            </div>

            {/* 모바일 카드 - 안전한 거래 */}
            <div className="bg-white rounded-xl p-4 shadow-sm flex-shrink-0 w-[200px] snap-start">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mb-3">
                <svg
                  className="w-5 h-5 text-purple-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
              </div>
              <h3 className="text-base font-semibold text-gray-900 mb-1">안전한 거래</h3>
              <p className="text-xs text-gray-600">
                신뢰할 수 있는 결제 시스템으로 안전하게 거래하세요
              </p>
            </div>
          </div>

          {/* PC 카드 그리드 */}
          <div className="hidden md:grid md:grid-cols-5 gap-4 mb-10">
            {/* PC 카드 - 수수료 0원 */}
            <div className="bg-white rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-11 h-11 bg-pink-100 rounded-lg flex items-center justify-center mb-3">
                <svg
                  className="w-5 h-5 text-pink-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                  />
                </svg>
              </div>
              <h3 className="text-base font-semibold text-gray-900 mb-1">수수료 0원</h3>
              <p className="text-sm text-gray-600">판매 수수료 없이 100% 수익을 가져가세요</p>
            </div>

            {/* PC 카드 - 판매기회균등 */}
            <div className="bg-white rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-11 h-11 bg-indigo-100 rounded-lg flex items-center justify-center mb-3">
                <svg
                  className="w-5 h-5 text-indigo-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3"
                  />
                </svg>
              </div>
              <h3 className="text-base font-semibold text-gray-900 mb-1">판매기회균등</h3>
              <p className="text-sm text-gray-600">신규 판매자도 동등한 노출 기회를 드립니다</p>
            </div>

            {/* PC 카드 - 수익 창출 */}
            <div className="bg-white rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-11 h-11 bg-blue-100 rounded-lg flex items-center justify-center mb-3">
                <svg
                  className="w-5 h-5 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-base font-semibold text-gray-900 mb-1">수익 창출</h3>
              <p className="text-sm text-gray-600">
                당신의 전문성으로 안정적인 수익을 만들어보세요
              </p>
            </div>

            {/* PC 카드 - 넓은 고객층 */}
            <div className="bg-white rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-11 h-11 bg-green-100 rounded-lg flex items-center justify-center mb-3">
                <svg
                  className="w-5 h-5 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
              </div>
              <h3 className="text-base font-semibold text-gray-900 mb-1">넓은 고객층</h3>
              <p className="text-sm text-gray-600">
                다양한 고객들과 연결되어 비즈니스를 확장하세요
              </p>
            </div>

            {/* PC 카드 - 안전한 거래 */}
            <div className="bg-white rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-11 h-11 bg-purple-100 rounded-lg flex items-center justify-center mb-3">
                <svg
                  className="w-5 h-5 text-purple-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
              </div>
              <h3 className="text-base font-semibold text-gray-900 mb-1">안전한 거래</h3>
              <p className="text-sm text-gray-600">
                신뢰할 수 있는 결제 시스템으로 안전하게 거래하세요
              </p>
            </div>
          </div>

          {/* CTA 버튼 */}
          <div className="text-center mt-6 md:mt-0">
            <Link
              href="/auth/register"
              className="inline-flex items-center px-6 py-3 md:px-8 md:py-4 bg-blue-600 hover:bg-blue-700 text-white text-sm md:text-base font-semibold rounded-lg transition-colors shadow-lg hover:shadow-xl"
            >
              판매자로 시작하기
              <svg
                className="w-4 h-4 md:w-5 md:h-5 ml-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            </Link>
            <p className="text-xs md:text-sm text-gray-500 mt-3 md:mt-4">
              가입 후 바로 서비스 등록이 가능합니다
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
