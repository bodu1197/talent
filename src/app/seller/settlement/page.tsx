export default function SellerSettlementGuidePage() {
  return (
    <div className="container-1200 py-16">
      <h1 className="text-3xl font-bold mb-8">정산 안내</h1>

      <div className="max-w-4xl">
        {/* 정산 프로세스 */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-6">정산 프로세스</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { step: 1, title: '거래 완료', desc: '구매자가 최종 승인', icon: 'fa-check-circle' },
              { step: 2, title: '정산 가능', desc: '정산 가능 금액 확인', icon: 'fa-wallet' },
              { step: 3, title: '정산 신청', desc: '계좌 정보 입력 후 신청', icon: 'fa-hand-pointer' },
              { step: 4, title: '정산 완료', desc: '1-3 영업일 내 입금', icon: 'fa-credit-card' },
            ].map((item) => (
              <div key={item.step} className="bg-white rounded-lg border border-gray-200 p-6 text-center">
                <div className="w-16 h-16 bg-[#0f3460] bg-opacity-10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className={`fas ${item.icon} text-[#0f3460] text-2xl`}></i>
                </div>
                <div className="text-sm font-semibold text-[#0f3460] mb-2">STEP {item.step}</div>
                <h3 className="font-bold mb-2">{item.title}</h3>
                <p className="text-sm text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 정산 조건 */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-6">정산 조건</h2>
          <div className="bg-white rounded-lg border border-gray-200 p-8">
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-[#0f3460] bg-opacity-10 rounded-full flex items-center justify-center flex-shrink-0">
                  <i className="fas fa-money-bill-wave text-[#0f3460]"></i>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">최소 정산 금액</h3>
                  <p className="text-gray-600">10,000원 이상부터 정산 신청이 가능합니다.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-[#0f3460] bg-opacity-10 rounded-full flex items-center justify-center flex-shrink-0">
                  <i className="fas fa-calendar-alt text-[#0f3460]"></i>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">정산 주기</h3>
                  <p className="text-gray-600">언제든지 정산 신청이 가능하며, 신청일로부터 1-3 영업일 내 입금됩니다.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-[#0f3460] bg-opacity-10 rounded-full flex items-center justify-center flex-shrink-0">
                  <i className="fas fa-university text-[#0f3460]"></i>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">정산 계좌</h3>
                  <p className="text-gray-600">본인 명의의 계좌만 등록 가능하며, 계좌 정보는 안전하게 암호화되어 저장됩니다.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 정산 일정 */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-6">정산 일정</h2>
          <div className="bg-gray-50 rounded-lg p-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="font-semibold">정산 신청</span>
                <span className="text-[#0f3460]">매일 24시간 가능</span>
              </div>
              <div className="border-t border-gray-200"></div>
              <div className="flex justify-between items-center">
                <span className="font-semibold">정산 처리</span>
                <span className="text-[#0f3460]">영업일 기준 1-3일</span>
              </div>
              <div className="border-t border-gray-200"></div>
              <div className="flex justify-between items-center">
                <span className="font-semibold">정산 수수료</span>
                <span className="text-[#0f3460] font-bold">무료</span>
              </div>
            </div>
          </div>
        </section>

        {/* 유의사항 */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-6">유의사항</h2>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex gap-2">
                <i className="fas fa-exclamation-circle text-yellow-600 mt-0.5"></i>
                <span>정산 신청 후에는 취소가 불가능합니다.</span>
              </li>
              <li className="flex gap-2">
                <i className="fas fa-exclamation-circle text-yellow-600 mt-0.5"></i>
                <span>계좌 정보 오류로 인한 입금 실패 시, 재신청이 필요합니다.</span>
              </li>
              <li className="flex gap-2">
                <i className="fas fa-exclamation-circle text-yellow-600 mt-0.5"></i>
                <span>공휴일 및 주말에는 정산 처리가 지연될 수 있습니다.</span>
              </li>
              <li className="flex gap-2">
                <i className="fas fa-exclamation-circle text-yellow-600 mt-0.5"></i>
                <span>정산 내역은 판매자 대시보드에서 확인 가능합니다.</span>
              </li>
            </ul>
          </div>
        </section>

        {/* 문의 */}
        <section>
          <div className="bg-[#0f3460] bg-opacity-5 rounded-lg p-8 text-center">
            <h3 className="text-xl font-bold mb-4">정산 관련 문의</h3>
            <p className="text-gray-600 mb-6">정산과 관련하여 궁금하신 사항이 있으시면 언제든지 문의해주세요.</p>
            <button className="px-6 py-3 bg-[#0f3460] text-white rounded-lg hover:bg-opacity-90 transition-colors">
              1:1 문의하기
            </button>
          </div>
        </section>
      </div>
    </div>
  )
}
