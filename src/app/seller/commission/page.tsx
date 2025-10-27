export default function SellerCommissionPage() {
  return (
    <div className="container-1200 py-16">
      <h1 className="text-3xl font-bold mb-8">수수료 안내</h1>

      <div className="max-w-4xl">
        {/* 기본 수수료 안내 */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-6">기본 수수료</h2>
          <div className="bg-white rounded-lg border border-gray-200 p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-gray-600 mb-2">서비스 판매 시 플랫폼 수수료</p>
                <p className="text-4xl font-bold text-[#0f3460]">10%</p>
              </div>
              <div className="w-20 h-20 bg-[#0f3460] bg-opacity-10 rounded-full flex items-center justify-center">
                <i className="fas fa-percentage text-[#0f3460] text-3xl"></i>
              </div>
            </div>
            <p className="text-gray-600 text-sm">
              거래 금액의 10%가 플랫폼 수수료로 차감됩니다. <br />
              예: 100,000원 판매 시 → 90,000원 정산
            </p>
          </div>
        </section>

        {/* 수수료 예시 */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-6">수수료 계산 예시</h2>
          <div className="space-y-4">
            {[
              { price: 50000, commission: 5000, settlement: 45000 },
              { price: 100000, commission: 10000, settlement: 90000 },
              { price: 200000, commission: 20000, settlement: 180000 },
              { price: 500000, commission: 50000, settlement: 450000 },
            ].map((item) => (
              <div key={item.price} className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-sm text-gray-600 mb-2">판매 금액</p>
                    <p className="text-xl font-bold">{item.price.toLocaleString()}원</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-2">수수료 (10%)</p>
                    <p className="text-xl font-bold text-red-600">-{item.commission.toLocaleString()}원</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-2">정산 금액</p>
                    <p className="text-xl font-bold text-[#0f3460]">{item.settlement.toLocaleString()}원</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 수수료 정책 */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-6">수수료 정책</h2>
          <div className="bg-gray-50 rounded-lg p-6 space-y-4">
            <div className="flex gap-3">
              <i className="fas fa-check-circle text-[#0f3460] mt-1"></i>
              <div>
                <h3 className="font-semibold mb-1">투명한 수수료</h3>
                <p className="text-sm text-gray-600">모든 거래에서 동일한 10% 수수료가 적용됩니다.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <i className="fas fa-check-circle text-[#0f3460] mt-1"></i>
              <div>
                <h3 className="font-semibold mb-1">정산 수수료 없음</h3>
                <p className="text-sm text-gray-600">정산 신청 시 추가 수수료가 발생하지 않습니다.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <i className="fas fa-check-circle text-[#0f3460] mt-1"></i>
              <div>
                <h3 className="font-semibold mb-1">VAT 별도</h3>
                <p className="text-sm text-gray-600">수수료에는 VAT가 포함되어 있습니다.</p>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section>
          <h2 className="text-2xl font-semibold mb-6">자주 묻는 질문</h2>
          <div className="space-y-4">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="font-semibold mb-2">Q. 수수료는 언제 차감되나요?</h3>
              <p className="text-sm text-gray-600">
                구매자가 결제를 완료하면 자동으로 수수료가 차감된 금액이 정산 대기 금액에 추가됩니다.
              </p>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="font-semibold mb-2">Q. 환불 시 수수료는 어떻게 되나요?</h3>
              <p className="text-sm text-gray-600">
                환불 시에는 수수료가 차감되지 않으며, 전액 구매자에게 환불됩니다.
              </p>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="font-semibold mb-2">Q. 수수료 할인 혜택이 있나요?</h3>
              <p className="text-sm text-gray-600">
                프리미엄 셀러의 경우 별도 협의를 통해 수수료 할인 혜택을 받으실 수 있습니다.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
