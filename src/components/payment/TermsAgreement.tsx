/**
 * 약관 동의 컴포넌트
 * 결제 시 필수 약관 동의 UI
 */

import { Check } from 'lucide-react';

export interface TermsAgreementProps {
  readonly agreedToTerms: boolean;
  readonly agreedToPrivacy: boolean;
  readonly onTermsChange: (agreed: boolean) => void;
  readonly onPrivacyChange: (agreed: boolean) => void;
}

export default function TermsAgreement({
  agreedToTerms,
  agreedToPrivacy,
  onTermsChange,
  onPrivacyChange,
}: TermsAgreementProps) {
  return (
    <div className="space-y-3">
      <label className="flex items-start gap-3 cursor-pointer">
        <div
          className={`flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
            agreedToTerms ? 'bg-brand-primary border-brand-primary' : 'bg-white border-gray-300'
          }`}
        >
          {agreedToTerms && <Check className="w-3 h-3 text-white" />}
        </div>
        <input
          type="checkbox"
          checked={agreedToTerms}
          onChange={(e) => onTermsChange(e.target.checked)}
          className="sr-only"
        />
        <div className="flex-1">
          <span className="text-gray-900 font-medium">
            이용약관 동의 <span className="text-red-500">*</span>
          </span>
          <p className="text-sm text-gray-600 mt-1">서비스 이용을 위해 약관에 동의해주세요</p>
        </div>
      </label>

      <label className="flex items-start gap-3 cursor-pointer">
        <div
          className={`flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
            agreedToPrivacy ? 'bg-brand-primary border-brand-primary' : 'bg-white border-gray-300'
          }`}
        >
          {agreedToPrivacy && <Check className="w-3 h-3 text-white" />}
        </div>
        <input
          type="checkbox"
          checked={agreedToPrivacy}
          onChange={(e) => onPrivacyChange(e.target.checked)}
          className="sr-only"
        />
        <div className="flex-1">
          <span className="text-gray-900 font-medium">
            개인정보 처리방침 동의 <span className="text-red-500">*</span>
          </span>
          <p className="text-sm text-gray-600 mt-1">결제를 위해 개인정보 수집에 동의해주세요</p>
        </div>
      </label>

      <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-600">
        <p>※ 필수 항목에 동의하지 않으시면 결제가 불가능합니다.</p>
      </div>
    </div>
  );
}
