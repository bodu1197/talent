import Link from 'next/link'

export default function SellerGuidePage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container-1200">
        <div className="mb-8">
          <Link href="/" className="text-[#0f3460] hover:underline flex items-center gap-2">
            <i className="fas fa-arrow-left"></i>
            홈으로
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">판매자 이용 가이드</h1>

          <div className="prose max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">판매자 시작하기</h2>
              <ol className="list-decimal list-inside space-y-2 text-gray-700">
                <li>마이페이지에서 판매자 등록</li>
                <li>본인 인증 및 정산 계좌 등록</li>
                <li>프로필 작성 (자기소개, 경력 등)</li>
                <li>서비스 등록 및 판매 시작</li>
              </ol>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">서비스 등록 방법</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-bold text-gray-900 mb-2">1. 카테고리 선택</h3>
                  <p className="text-gray-700">제공하는 서비스에 가장 적합한 카테고리를 선택합니다.</p>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-2">2. 서비스 정보 입력</h3>
                  <ul className="list-disc list-inside text-gray-700">
                    <li>제목: 명확하고 매력적인 제목 작성</li>
                    <li>설명: 서비스 내용을 상세히 설명</li>
                    <li>포함 사항: 제공되는 항목 명시</li>
                    <li>작업 기간: 평균 소요 시간 설정</li>
                    <li>수정 횟수: 무료 수정 가능 횟수</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-2">3. 가격 및 옵션 설정</h3>
                  <p className="text-gray-700">기본 가격과 추가 옵션을 설정합니다.</p>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-2">4. 포트폴리오 첨부</h3>
                  <p className="text-gray-700">작업 샘플이나 포트폴리오를 첨부하여 신뢰도를 높입니다.</p>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">주문 처리 프로세스</h2>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <span className="bg-[#0f3460] text-white w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0">1</span>
                  <div>
                    <h3 className="font-bold">주문 접수</h3>
                    <p className="text-sm text-gray-600">새 주문 알림을 받고 주문서를 확인합니다</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="bg-[#0f3460] text-white w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0">2</span>
                  <div>
                    <h3 className="font-bold">구매자와 소통</h3>
                    <p className="text-sm text-gray-600">요구사항을 명확히 파악하고 작업 시작</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="bg-[#0f3460] text-white w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0">3</span>
                  <div>
                    <h3 className="font-bold">작업 진행</h3>
                    <p className="text-sm text-gray-600">약속한 기간 내에 작업을 완료합니다</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="bg-[#0f3460] text-white w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0">4</span>
                  <div>
                    <h3 className="font-bold">결과물 전달</h3>
                    <p className="text-sm text-gray-600">완성된 작업물을 전달하고 피드백 대기</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="bg-[#0f3460] text-white w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0">5</span>
                  <div>
                    <h3 className="font-bold">수정 및 최종 확인</h3>
                    <p className="text-sm text-gray-600">필요 시 수정하고 최종 확인을 받습니다</p>
                  </div>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">성공적인 판매를 위한 팁</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-bold text-blue-900 mb-2">✓ 빠른 응답</h3>
                  <p className="text-sm text-blue-800">구매자 문의에 신속하게 답변하세요</p>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-bold text-blue-900 mb-2">✓ 명확한 커뮤니케이션</h3>
                  <p className="text-sm text-blue-800">작업 범위와 일정을 명확히 하세요</p>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-bold text-blue-900 mb-2">✓ 품질 유지</h3>
                  <p className="text-sm text-blue-800">일관된 품질로 신뢰를 쌓으세요</p>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-bold text-blue-900 mb-2">✓ 포트폴리오 관리</h3>
                  <p className="text-sm text-blue-800">최신 작업물로 포트폴리오를 업데이트하세요</p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">주의사항</h2>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <ul className="list-disc list-inside space-y-2 text-red-900">
                  <li>약속한 작업 기간을 반드시 지켜주세요</li>
                  <li>서비스 설명과 다른 내용을 제공하지 마세요</li>
                  <li>구매자와의 외부 거래는 금지됩니다</li>
                  <li>타인의 작업물을 도용하지 마세요</li>
                </ul>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}
