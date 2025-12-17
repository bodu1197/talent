import { Loader2 } from 'lucide-react';
import TermsAgreement from './TermsAgreement';

interface PaymentTermsSectionProps {
  readonly agreedToTerms: boolean;
  readonly agreedToPrivacy: boolean;
  readonly onTermsChange: (value: boolean) => void;
  readonly onPrivacyChange: (value: boolean) => void;
  readonly onPayment: () => void;
  readonly isProcessing: boolean;
  readonly disabled: boolean;
  readonly amount: number;
  readonly buttonText?: string;
  readonly showTitle?: boolean;
  readonly className?: string;
}

export default function PaymentTermsSection({
  agreedToTerms,
  agreedToPrivacy,
  onTermsChange,
  onPrivacyChange,
  onPayment,
  isProcessing,
  disabled,
  amount,
  buttonText,
  showTitle = true,
  className = '',
}: PaymentTermsSectionProps) {
  return (
    <section className={`lg:hidden bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
      {showTitle && <h2 className="text-lg font-bold text-gray-900 mb-4">약관 동의</h2>}
      <TermsAgreement
        agreedToTerms={agreedToTerms}
        agreedToPrivacy={agreedToPrivacy}
        onTermsChange={onTermsChange}
        onPrivacyChange={onPrivacyChange}
      />

      <button
        onClick={onPayment}
        disabled={disabled || isProcessing}
        className="w-full mt-6 h-14 bg-brand-primary text-white rounded-lg font-bold text-lg disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors"
      >
        {isProcessing ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            처리 중...
          </>
        ) : (
          buttonText || `${amount.toLocaleString()}원 결제하기`
        )}
      </button>
    </section>
  );
}
