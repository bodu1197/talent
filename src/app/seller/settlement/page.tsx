import Link from 'next/link'

export default function SellerSettlementPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container-1200">
        <div className="mb-8">
          <Link href="/" className="text-brand-primary hover:underline flex items-center gap-2">
            <i className="fas fa-arrow-left"></i>
            홈으로
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">정산 안내</h1>

          <div className="prose max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">정산 프로세스</h2>
              <div className="space-y-4">
                <div className="border-l-4 border-brand-primary pl-4">
                  <h3 className="font-bold text-gray-900 mb-2">1. 판매 수익 발생</h3>
                  <p className="text-gray-700">구매자가 작업 최종 확인을 하면 정산 대상 금액으로 전환됩니다.</p>
                </div>
                <div className="border-l-4 border-brand-primary pl-4">
                  <h3 className="font-bold text-gray-900 mb-2">2. 정산 대기 (7일)</h3>
                  <p className="text-gray-700">구매자 보호를 위한 7일 대기 기간이 적용됩니다.</p>
                </div>
                <div className="border-l-4 border-brand-primary pl-4">
                  <h3 className="font-bold text-gray-900 mb-2">3. 정산 가능</h3>
                  <p className="text-gray-700">대기 기간 종료 후 출금 신청이 가능합니다.</p>
                </div>
                <div className="border-l-4 border-brand-primary pl-4">
                  <h3 className="font-bold text-gray-900 mb-2">4. 출금 신청</h3>
                  <p className="text-gray-700">마이페이지에서 원하는 금액만큼 출금 신청합니다.</p>
                </div>
                <div className="border-l-4 border-brand-primary pl-4">
                  <h3 className="font-bold text-gray-900 mb-2">5. 계좌 입금</h3>
                  <p className="text-gray-700">영업일 기준 2-3일 내 등록된 계좌로 입금됩니다.</p>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">정산 기준</h2>
              <div className="bg-gray-50 rounded-lg p-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-bold text-gray-900 mb-2">정산 금액 계산</h3>
                    <div className="text-gray-700">
                      <p className="mb-2">판매 금액 - 플랫폼 수수료(20%) = 정산 금액</p>
                      <p className="text-sm text-gray-600">예시: 100,000원 판매 시 → 80,000원 정산</p>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-2">최소 출금 금액</h3>
                    <p className="text-gray-700">10,000원 이상부터 출금 신청 가능</p>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-2">출금 수수료</h3>
                    <p className="text-gray-700">건당 500원 (부가세 별도)</p>
                  </div>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">정산 일정</h2>
              <table className="w-full border-collapse border border-gray-300">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="border border-gray-300 px-4 py-2 text-left">구분</th>
                    <th className="border border-gray-300 px-4 py-2 text-left">설명</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-gray-300 px-4 py-2 font-medium">정산 대기 기간</td>
                    <td className="border border-gray-300 px-4 py-2">작업 완료 후 7일</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-4 py-2 font-medium">출금 신청 마감</td>
                    <td className="border border-gray-300 px-4 py-2">매주 금요일 18:00</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-4 py-2 font-medium">입금 일정</td>
                    <td className="border border-gray-300 px-4 py-2">신청 후 2-3 영업일</td>
                  </tr>
                </tbody>
              </table>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">세금 신고</h2>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h3 className="font-bold text-yellow-900 mb-2">사업자 판매자</h3>
                <ul className="list-disc list-inside text-yellow-800 space-y-1 mb-4">
                  <li>세금계산서 발행 가능</li>
                  <li>별도 세무 신고 필요</li>
                </ul>
                <h3 className="font-bold text-yellow-900 mb-2">개인 판매자</h3>
                <ul className="list-disc list-inside text-yellow-800 space-y-1">
                  <li>연 2,400만원 이상 수익 시 사업자 등록 권장</li>
                  <li>종합소득세 신고 대상</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">자주 묻는 질문</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-bold text-gray-900 mb-2">Q. 정산 대기 기간을 줄일 수 없나요?</h3>
                  <p className="text-gray-700">구매자 보호를 위한 필수 기간으로, 단축이 불가능합니다.</p>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-2">Q. 계좌 정보를 변경하고 싶어요</h3>
                  <p className="text-gray-700">마이페이지 &gt; 판매자 정보에서 언제든 변경 가능합니다.</p>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-2">Q. 출금이 지연되고 있어요</h3>
                  <p className="text-gray-700">영업일 기준 3일 이상 지연 시 고객센터로 문의해주세요.</p>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}
