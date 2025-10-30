import Link from 'next/link'

export default function SellerCommissionPage() {
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
          <h1 className="text-3xl font-bold text-gray-900 mb-6">수수료 안내</h1>

          <div className="prose max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">플랫폼 수수료</h2>
              <div className="bg-[#0f3460] text-white rounded-lg p-6 text-center mb-4">
                <div className="text-5xl font-bold mb-2">20%</div>
                <p className="text-lg">거래 금액의 20%가 플랫폼 수수료로 부과됩니다</p>
              </div>
              <p className="text-gray-700">
                플랫폼 수수료는 안전한 거래 환경 제공, 시스템 운영, 고객 지원 등에 사용됩니다.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">수수료 계산 예시</h2>
              <div className="space-y-4">
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-700">서비스 판매 금액</span>
                    <span className="text-xl font-bold text-gray-900">100,000원</span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-700">플랫폼 수수료 (20%)</span>
                    <span className="text-xl font-bold text-red-600">- 20,000원</span>
                  </div>
                  <div className="border-t border-gray-300 pt-2 mt-2">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-gray-900">판매자 정산 금액</span>
                      <span className="text-2xl font-bold text-[#0f3460]">80,000원</span>
                    </div>
                  </div>
                </div>

                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-700">서비스 판매 금액</span>
                    <span className="text-xl font-bold text-gray-900">500,000원</span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-700">플랫폼 수수료 (20%)</span>
                    <span className="text-xl font-bold text-red-600">- 100,000원</span>
                  </div>
                  <div className="border-t border-gray-300 pt-2 mt-2">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-gray-900">판매자 정산 금액</span>
                      <span className="text-2xl font-bold text-[#0f3460]">400,000원</span>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">수수료에 포함된 서비스</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <i className="fas fa-shield-alt text-2xl text-blue-600 mt-1"></i>
                    <div>
                      <h3 className="font-bold text-blue-900 mb-1">안전한 거래</h3>
                      <p className="text-sm text-blue-800">에스크로 시스템으로 안전하게 대금 보호</p>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <i className="fas fa-headset text-2xl text-blue-600 mt-1"></i>
                    <div>
                      <h3 className="font-bold text-blue-900 mb-1">고객 지원</h3>
                      <p className="text-sm text-blue-800">분쟁 발생 시 중재 및 지원</p>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <i className="fas fa-credit-card text-2xl text-blue-600 mt-1"></i>
                    <div>
                      <h3 className="font-bold text-blue-900 mb-1">결제 시스템</h3>
                      <p className="text-sm text-blue-800">다양한 결제 수단 제공</p>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <i className="fas fa-chart-line text-2xl text-blue-600 mt-1"></i>
                    <div>
                      <h3 className="font-bold text-blue-900 mb-1">마케팅 지원</h3>
                      <p className="text-sm text-blue-800">플랫폼 내 노출 및 프로모션</p>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <i className="fas fa-server text-2xl text-blue-600 mt-1"></i>
                    <div>
                      <h3 className="font-bold text-blue-900 mb-1">시스템 운영</h3>
                      <p className="text-sm text-blue-800">안정적인 플랫폼 유지 및 관리</p>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <i className="fas fa-mobile-alt text-2xl text-blue-600 mt-1"></i>
                    <div>
                      <h3 className="font-bold text-blue-900 mb-1">모바일 앱</h3>
                      <p className="text-sm text-blue-800">언제 어디서나 편리한 이용</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">추가 수수료</h2>
              <table className="w-full border-collapse border border-gray-300">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="border border-gray-300 px-4 py-2 text-left">항목</th>
                    <th className="border border-gray-300 px-4 py-2 text-left">수수료</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-gray-300 px-4 py-2">출금 수수료</td>
                    <td className="border border-gray-300 px-4 py-2">건당 500원 (부가세 별도)</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-4 py-2">환불 수수료</td>
                    <td className="border border-gray-300 px-4 py-2">없음 (판매자 귀책 사유 시)</td>
                  </tr>
                </tbody>
              </table>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">수수료 혜택</h2>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="font-bold text-green-900 mb-3">우수 판매자 혜택 (추후 제공 예정)</h3>
                <ul className="list-disc list-inside space-y-2 text-green-800">
                  <li>월 100건 이상 판매 시 수수료 18%</li>
                  <li>평점 4.8 이상 유지 시 우선 노출</li>
                  <li>전문가 등급 달성 시 추가 프로모션 지원</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">자주 묻는 질문</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-bold text-gray-900 mb-2">Q. 수수료는 언제 차감되나요?</h3>
                  <p className="text-gray-700">구매자가 결제하는 시점에 자동으로 계산되어, 판매자에게는 수수료가 차감된 금액이 정산됩니다.</p>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-2">Q. 부가세는 별도인가요?</h3>
                  <p className="text-gray-700">플랫폼 수수료 20%에는 부가세가 포함되어 있습니다.</p>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-2">Q. 수수료율 협상이 가능한가요?</h3>
                  <p className="text-gray-700">대량 거래나 장기 계약의 경우 별도 협의가 가능합니다. 고객센터로 문의해주세요.</p>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}
