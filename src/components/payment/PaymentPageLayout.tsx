import { ArrowLeft } from 'lucide-react';
import BuyerPhoneInput from './BuyerPhoneInput';
import PaymentMethodSelector from './PaymentMethodSelector';
import PaymentTermsSection from './PaymentTermsSection';
import PaymentSummarySidebar from './PaymentSummarySidebar';

interface PaymentPageLayoutProps {
  readonly title: string;
  readonly onBack: () => void;
  readonly productInfoSection: React.ReactNode;
  readonly buyer: {
    readonly phone: string | null;
  } | null;
  readonly phoneInput: string;
  readonly onPhoneChange: (phone: string) => void;
  readonly phoneInputId?: string;
  readonly selectedPaymentMethod: string;
  readonly easyPayProvider: string | null;
  readonly isInternationalCard: boolean;
  readonly onMethodChange: (method: string) => void;
  readonly onEasyPayProviderChange: (provider: string | null) => void;
  readonly onInternationalCardChange: (isInternational: boolean) => void;
  readonly agreedToTerms: boolean;
  readonly agreedToPrivacy: boolean;
  readonly onTermsChange: (agreed: boolean) => void;
  readonly onPrivacyChange: (agreed: boolean) => void;
  readonly onPayment: () => void | Promise<void>;
  readonly isProcessing: boolean;
  readonly totalAmount: number;
  readonly priceBreakdown: Array<{ label: string; amount: number }>;
  readonly sidebarTotalLabel?: string;
}

export default function PaymentPageLayout({
  title,
  onBack,
  productInfoSection,
  buyer,
  phoneInput,
  onPhoneChange,
  phoneInputId = 'buyer-phone',
  selectedPaymentMethod,
  easyPayProvider,
  isInternationalCard,
  onMethodChange,
  onEasyPayProviderChange,
  onInternationalCardChange,
  agreedToTerms,
  agreedToPrivacy,
  onTermsChange,
  onPrivacyChange,
  onPayment,
  isProcessing,
  totalAmount,
  priceBreakdown,
  sidebarTotalLabel,
}: PaymentPageLayoutProps) {
  const allAgreed = agreedToTerms && agreedToPrivacy;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">{title}</span>
          </button>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* 왼쪽: 상품/주문 정보 + 결제 옵션 */}
          <div className="flex-1 space-y-6">
            {/* 상품/주문 정보 (각 페이지별로 다름) */}
            {productInfoSection}

            {/* 구매자 정보 - 전화번호 미입력 시 */}
            {!buyer?.phone && (
              <BuyerPhoneInput
                phoneInput={phoneInput}
                onPhoneChange={onPhoneChange}
                inputId={phoneInputId}
              />
            )}

            {/* 결제 방법 */}
            <section className="bg-white rounded-lg border border-gray-200 p-6">
              <PaymentMethodSelector
                selectedMethod={selectedPaymentMethod}
                easyPayProvider={easyPayProvider}
                isInternationalCard={isInternationalCard}
                onMethodChange={onMethodChange}
                onEasyPayProviderChange={onEasyPayProviderChange}
                onInternationalCardChange={onInternationalCardChange}
              />
            </section>

            {/* 약관 동의 (모바일) */}
            <PaymentTermsSection
              agreedToTerms={agreedToTerms}
              agreedToPrivacy={agreedToPrivacy}
              onTermsChange={onTermsChange}
              onPrivacyChange={onPrivacyChange}
              onPayment={onPayment}
              isProcessing={isProcessing}
              disabled={!allAgreed}
              amount={totalAmount}
            />
          </div>

          {/* 오른쪽: 결제 요약 (PC) */}
          <PaymentSummarySidebar
            priceBreakdown={priceBreakdown}
            totalAmount={totalAmount}
            totalLabel={sidebarTotalLabel}
            agreedToTerms={agreedToTerms}
            agreedToPrivacy={agreedToPrivacy}
            onTermsChange={onTermsChange}
            onPrivacyChange={onPrivacyChange}
            onPayment={onPayment}
            isProcessing={isProcessing}
            disabled={!allAgreed}
          />
        </div>
      </div>
    </div>
  );
}
