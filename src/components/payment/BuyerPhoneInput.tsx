import { extractNumbers } from '@/lib/validation/input';

interface BuyerPhoneInputProps {
  readonly phoneInput: string;
  readonly onPhoneChange: (value: string) => void;
  readonly title?: string;
  readonly showHelperText?: boolean;
  readonly inputId?: string;
}

export default function BuyerPhoneInput({
  phoneInput,
  onPhoneChange,
  title = '결제자 정보',
  showHelperText = false,
  inputId = 'buyer-phone',
}: BuyerPhoneInputProps) {
  return (
    <section className="bg-white rounded-lg border border-gray-200 p-6">
      <h2 className="text-lg font-bold text-gray-900 mb-4">{title}</h2>
      <div className="space-y-4">
        <div>
          <label htmlFor={inputId} className="block text-sm font-medium text-gray-700 mb-1">
            휴대폰 번호 <span className="text-red-500">*</span>
          </label>
          <input
            id={inputId}
            type="tel"
            value={phoneInput}
            onChange={(e) => onPhoneChange(extractNumbers(e.target.value))}
            placeholder="01012345678"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-brand-primary"
            maxLength={11}
          />
          {showHelperText && (
            <p className="mt-1 text-xs text-gray-500">결제 진행을 위해 휴대폰 번호가 필요합니다</p>
          )}
        </div>
      </div>
    </section>
  );
}
