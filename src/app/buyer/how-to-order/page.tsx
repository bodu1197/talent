import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function HowToOrderPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container-1200">
        <div className="mb-8">
          <Link
            href="/"
            className="text-brand-primary hover:underline flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            홈으로
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-8">
          <h1 className="text-3xl font-semibold text-gray-900 mb-6">
            주문 방법 안내
          </h1>

          <div className="prose max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                처음 주문하시나요?
              </h2>
              <p className="text-gray-700 mb-4">
                재능 마켓플레이스에서 원하는 서비스를 주문하는 방법을 단계별로
                안내해드립니다.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                상세 주문 가이드
              </h2>

              <div className="space-y-6">
                <div className="border-l-4 border-brand-primary pl-4">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    STEP 1. 회원가입 및 로그인
                  </h3>
                  <p className="text-gray-700 mb-2">
                    서비스 주문을 위해서는 회원가입이 필요합니다.
                  </p>
                  <ul className="list-disc list-inside text-gray-600 space-y-1">
                    <li>이메일 또는 소셜 계정으로 간편 가입</li>
                    <li>본인 인증 후 모든 서비스 이용 가능</li>
                  </ul>
                </div>

                <div className="border-l-4 border-brand-primary pl-4">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    STEP 2. 원하는 서비스 찾기
                  </h3>
                  <p className="text-gray-700 mb-2">
                    여러 방법으로 필요한 서비스를 검색할 수 있습니다.
                  </p>
                  <ul className="list-disc list-inside text-gray-600 space-y-1">
                    <li>검색창에 키워드 입력</li>
                    <li>카테고리별 탐색</li>
                    <li>인기 서비스 또는 추천 서비스 확인</li>
                    <li>판매자 프로필에서 다른 서비스 보기</li>
                  </ul>
                </div>

                <div className="border-l-4 border-brand-primary pl-4">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    STEP 3. 서비스 상세 정보 확인
                  </h3>
                  <p className="text-gray-700 mb-2">
                    주문 전 반드시 확인해야 할 사항들:
                  </p>
                  <ul className="list-disc list-inside text-gray-600 space-y-1">
                    <li>서비스 설명 및 포함 사항</li>
                    <li>작업 기간 및 수정 횟수</li>
                    <li>가격 및 추가 옵션</li>
                    <li>판매자 후기 및 평점</li>
                    <li>포트폴리오 및 샘플</li>
                  </ul>
                </div>

                <div className="border-l-4 border-brand-primary pl-4">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    STEP 4. 옵션 선택 및 주문서 작성
                  </h3>
                  <p className="text-gray-700 mb-2">
                    필요한 옵션을 선택하고 요구사항을 입력합니다.
                  </p>
                  <ul className="list-disc list-inside text-gray-600 space-y-1">
                    <li>기본 패키지 또는 추가 옵션 선택</li>
                    <li>작업 요청사항 상세 작성</li>
                    <li>참고 자료 첨부 (선택)</li>
                    <li>최종 금액 확인</li>
                  </ul>
                </div>

                <div className="border-l-4 border-brand-primary pl-4">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    STEP 5. 결제하기
                  </h3>
                  <p className="text-gray-700 mb-2">
                    안전한 결제 시스템으로 주문을 완료합니다.
                  </p>
                  <ul className="list-disc list-inside text-gray-600 space-y-1">
                    <li>결제 수단 선택 (신용카드, 계좌이체, 간편결제 등)</li>
                    <li>쿠폰 또는 캐시 사용 (선택)</li>
                    <li>최종 결제 금액 확인</li>
                    <li>결제 진행</li>
                  </ul>
                </div>

                <div className="border-l-4 border-brand-primary pl-4">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    STEP 6. 판매자와 소통
                  </h3>
                  <p className="text-gray-700 mb-2">
                    결제 완료 후 판매자와 메시지로 소통합니다.
                  </p>
                  <ul className="list-disc list-inside text-gray-600 space-y-1">
                    <li>작업 요청사항 재확인</li>
                    <li>작업 진행 상황 확인</li>
                    <li>수정 요청 및 피드백</li>
                  </ul>
                </div>

                <div className="border-l-4 border-brand-primary pl-4">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    STEP 7. 작업물 받기 및 확인
                  </h3>
                  <p className="text-gray-700 mb-2">
                    완성된 작업물을 받고 검수합니다.
                  </p>
                  <ul className="list-disc list-inside text-gray-600 space-y-1">
                    <li>마이페이지에서 작업물 다운로드</li>
                    <li>내용 검수 및 확인</li>
                    <li>수정 필요 시 요청 (수정 횟수 내)</li>
                    <li>최종 확인 버튼 클릭</li>
                  </ul>
                </div>

                <div className="border-l-4 border-brand-primary pl-4">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    STEP 8. 리뷰 작성
                  </h3>
                  <p className="text-gray-700 mb-2">
                    서비스 이용 후기를 남겨주세요.
                  </p>
                  <ul className="list-disc list-inside text-gray-600 space-y-1">
                    <li>별점 및 리뷰 작성</li>
                    <li>다른 구매자들에게 도움이 되는 정보 공유</li>
                    <li>리뷰 작성 시 적립금 지급</li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                주문 시 유의사항
              </h2>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <ul className="list-disc list-inside space-y-2 text-yellow-900">
                  <li>서비스 설명을 꼼꼼히 읽고 주문해주세요</li>
                  <li>요구사항은 구체적이고 명확하게 작성해주세요</li>
                  <li>참고 자료가 있다면 함께 첨부해주세요</li>
                  <li>작업 기간은 영업일 기준입니다</li>
                  <li>추가 수정은 수정 횟수 내에서만 가능합니다</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                도움이 필요하신가요?
              </h2>
              <p className="text-gray-700 mb-4">
                주문 과정에서 어려움이 있으시면 언제든 고객센터로 문의해주세요.
              </p>
              <Link
                href="/support"
                className="inline-block px-6 py-3 bg-brand-primary text-white rounded-lg hover:bg-brand-light transition-colors"
              >
                고객센터 바로가기
              </Link>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
