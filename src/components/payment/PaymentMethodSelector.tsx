/**
 * 결제 수단 선택 컴포넌트
 */

import { CreditCard, Building2, Smartphone, Wallet, Globe } from 'lucide-react';
import type { PaymentMethod, EasyPayProvider } from '@/hooks/usePaymentState';

export interface PaymentMethodSelectorProps {
  readonly selectedMethod: PaymentMethod;
  readonly easyPayProvider: EasyPayProvider;
  readonly isInternationalCard: boolean;
  readonly onMethodChange: (method: PaymentMethod) => void;
  readonly onEasyPayProviderChange: (provider: EasyPayProvider) => void;
  readonly onInternationalCardChange: (isInternational: boolean) => void;
}

interface PaymentOption {
  readonly method: PaymentMethod;
  readonly icon: React.ComponentType<{ className?: string }>;
  readonly label: string;
  readonly description: string;
}

const PAYMENT_OPTIONS: PaymentOption[] = [
  {
    method: 'CARD',
    icon: CreditCard,
    label: '신용/체크카드',
    description: '간편하고 빠른 카드 결제',
  },
  {
    method: 'EASY_PAY',
    icon: Wallet,
    label: '간편결제',
    description: '토스페이, 네이버페이, 카카오페이',
  },
  {
    method: 'TRANSFER',
    icon: Building2,
    label: '실시간 계좌이체',
    description: '은행 계좌로 즉시 결제',
  },
  {
    method: 'VIRTUAL_ACCOUNT',
    icon: Smartphone,
    label: '가상계좌',
    description: '가상계좌 발급 후 입금',
  },
  {
    method: 'MOBILE',
    icon: Smartphone,
    label: '휴대폰 결제',
    description: '휴대폰 소액결제',
  },
];

export default function PaymentMethodSelector({
  selectedMethod,
  easyPayProvider,
  isInternationalCard,
  onMethodChange,
  onEasyPayProviderChange,
  onInternationalCardChange,
}: PaymentMethodSelectorProps) {
  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-gray-900">결제 수단</h3>

      <div className="grid grid-cols-1 gap-3">
        {PAYMENT_OPTIONS.map((option) => (
          <label
            key={option.method}
            className={`flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer transition-colors ${
              selectedMethod === option.method
                ? 'border-brand-primary bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <input
              type="radio"
              name="paymentMethod"
              value={option.method}
              checked={selectedMethod === option.method}
              onChange={() => onMethodChange(option.method)}
              className="sr-only"
            />
            <div
              className={`flex items-center justify-center w-12 h-12 rounded-lg ${
                selectedMethod === option.method ? 'bg-brand-primary text-white' : 'bg-gray-100'
              }`}
            >
              <option.icon className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <div className="font-medium text-gray-900">{option.label}</div>
              <div className="text-sm text-gray-600">{option.description}</div>
            </div>
          </label>
        ))}
      </div>

      {/* 카드 선택 시 국제카드 옵션 */}
      {selectedMethod === 'CARD' && (
        <div className="bg-gray-50 rounded-lg p-4">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={isInternationalCard}
              onChange={(e) => onInternationalCardChange(e.target.checked)}
              className="w-4 h-4 text-brand-primary"
            />
            <div className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-gray-600" />
              <span className="text-gray-900">국제카드 사용</span>
            </div>
          </label>
          <p className="text-sm text-gray-600 mt-2 ml-7">Visa, MasterCard, Amex 등</p>
        </div>
      )}

      {/* 간편결제 선택 시 제공업체 선택 */}
      {selectedMethod === 'EASY_PAY' && (
        <div className="bg-gray-50 rounded-lg p-4 space-y-3">
          <p className="text-sm font-medium text-gray-900">간편결제 업체 선택</p>
          <div className="grid grid-cols-3 gap-2">
            {(['TOSSPAY', 'NAVERPAY', 'KAKAOPAY'] as const).map((provider) => (
              <button
                key={provider}
                type="button"
                onClick={() => onEasyPayProviderChange(provider)}
                className={`p-3 rounded-lg border-2 text-sm font-medium transition-colors ${
                  easyPayProvider === provider
                    ? 'border-brand-primary bg-blue-50 text-brand-primary'
                    : 'border-gray-200 hover:border-gray-300 text-gray-700'
                }`}
              >
                {provider === 'TOSSPAY' && '토스페이'}
                {provider === 'NAVERPAY' && '네이버페이'}
                {provider === 'KAKAOPAY' && '카카오페이'}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
