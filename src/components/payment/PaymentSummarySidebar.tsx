import { Loader2 } from 'lucide-react';
import TermsAgreement from './TermsAgreement';

interface PriceBreakdownItem {
  label: string;
  amount: number;
}

interface PaymentSummarySidebarProps {
  priceBreakdown: PriceBreakdownItem[];
  totalAmount: number;
  agreedToTerms: boolean;
  agreedToPrivacy: boolean;
  onTermsChange: (value: boolean) => void;
  onPrivacyChange: (value: boolean) => void;
  onPayment: () => void;
  isProcessing: boolean;
  disabled: boolean;
  buttonText?: string;
  totalLabel?: string;
}

export default function PaymentSummarySidebar({
  priceBreakdown,
  totalAmount,
  agreedToTerms,
  agreedToPrivacy,
  onTermsChange,
  onPrivacyChange,
  onPayment,
  isProcessing,
  disabled,
  buttonText = '결제하기',
  totalLabel = '총 결제 금액',
}: PaymentSummarySidebarProps) {
  return (
    <div className="hidden lg:block w-80 flex-shrink-0">
      <div className="bg-white rounded-lg border border-gray-200 p-6 sticky top-20">
        {/* 금액 상세 */}
        <div className="space-y-3 pb-4 border-b border-gray-200">
          {priceBreakdown.map((item, index) => (
            <div key={index} className="flex justify-between text-sm">
              <span className="text-gray-600">{item.label}</span>
              <span className="text-gray-900 font-medium">{item.amount.toLocaleString()}원</span>
            </div>
          ))}
        </div>

        {/* 총 결제 금액 */}
        <div className="flex justify-between items-center py-4 border-b border-gray-200">
          <span className="font-medium text-gray-900">{totalLabel}</span>
          <span className="text-2xl font-bold text-brand-primary">
            {totalAmount.toLocaleString()}원
          </span>
        </div>

        {/* 약관 동의 */}
        <div className="py-4">
          <TermsAgreement
            agreedToTerms={agreedToTerms}
            agreedToPrivacy={agreedToPrivacy}
            onTermsChange={onTermsChange}
            onPrivacyChange={onPrivacyChange}
          />
        </div>

        {/* 결제 버튼 */}
        <button
          onClick={onPayment}
          disabled={disabled || isProcessing}
          className="w-full h-14 bg-brand-primary text-white rounded-lg font-bold text-lg disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors hover:bg-brand-dark"
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              처리 중...
            </>
          ) : (
            buttonText
          )}
        </button>
      </div>
    </div>
  );
}
