interface PaymentInfoSidebarProps {
  readonly totalAmount?: number | null;
  readonly finalLabel?: string;
}

export default function PaymentInfoSidebar({
  totalAmount,
  finalLabel = '결제 금액',
}: PaymentInfoSidebarProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-3 lg:p-4">
      <h3 className="font-semibold text-gray-900 mb-3 lg:mb-4 text-xs lg:text-base">결제 정보</h3>
      <div className="space-y-2 lg:space-y-3">
        <div className="flex items-center justify-between text-xs lg:text-sm">
          <span className="text-gray-600">주문 금액</span>
          <span className="font-medium">{totalAmount?.toLocaleString() || '0'}원</span>
        </div>
        <div className="flex items-center justify-between pt-2 lg:pt-3 border-t border-gray-200">
          <span className="font-semibold text-gray-900 text-xs lg:text-sm">{finalLabel}</span>
          <span className="font-semibold text-brand-primary text-sm lg:text-lg">
            {totalAmount?.toLocaleString() || '0'}원
          </span>
        </div>
      </div>
    </div>
  );
}
