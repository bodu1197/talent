'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import * as PortOne from '@portone/browser-sdk/v2';
import toast from 'react-hot-toast';
import { CheckCircle, Shield, AlertCircle, Loader2 } from 'lucide-react';

interface CustomerInfo {
  name: string | null;
  phone: string | null;
  email: string | null;
}

interface Props {
  customerInfo: CustomerInfo;
  returnUrl: string;
}

export default function VerifyIdentityClient({ customerInfo, returnUrl }: Props) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  const handleVerify = async () => {
    setIsLoading(true);

    try {
      // 고유한 인증 ID 생성
      const timestamp = Date.now();
      const randomPart = crypto.randomUUID().slice(0, 8);
      const identityVerificationId = `identity_${timestamp}_${randomPart}`;

      // returnUrl을 localStorage에 저장 (콜백에서 사용)
      localStorage.setItem('verifyReturnUrl', returnUrl);

      // PortOne 본인인증 요청 (KCP 휴대폰 본인인증)
      const response = await PortOne.requestIdentityVerification({
        storeId: 'store-8855d73e-d61a-469b-a5ed-60e21cc45122',
        channelKey: 'channel-key-112bb8b1-8dcc-4045-9686-66b83f0f0026',
        identityVerificationId,
        redirectUrl: `${window.location.origin}/verify-identity/callback`,
        windowType: {
          pc: 'POPUP',
          mobile: 'REDIRECTION',
        },
        customer: {
          customerId: customerInfo.email || undefined,
          fullName: customerInfo.name || undefined,
          phoneNumber: customerInfo.phone || undefined,
        },
      });

      if (response?.code) {
        // 사용자가 취소한 경우
        if (response.code === 'FAILURE_TYPE_PG' && response.message?.includes('취소')) {
          toast('본인인증이 취소되었습니다');
          setIsLoading(false);
          return;
        }
        throw new Error(response.message || '본인인증 중 오류가 발생했습니다');
      }

      // 본인인증 성공 - 서버에서 검증
      setIsVerifying(true);
      const verifyResponse = await fetch('/api/auth/verify-identity', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ identityVerificationId }),
      });

      const result = await verifyResponse.json();

      if (!verifyResponse.ok) {
        throw new Error(result.error || '본인인증 검증 실패');
      }

      toast.success(`본인인증이 완료되었습니다. ${result.name}님 환영합니다!`);

      // returnUrl로 리다이렉트
      setTimeout(() => {
        router.push(returnUrl);
        router.refresh();
      }, 1500);
    } catch (error) {
      console.error('Identity verification error:', error);
      toast.error(error instanceof Error ? error.message : '본인인증 중 오류가 발생했습니다');
      setIsLoading(false);
      setIsVerifying(false);
    }
  };

  const renderButtonContent = () => {
    if (isVerifying) {
      return (
        <>
          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
          인증 확인 중...
        </>
      );
    }
    if (isLoading) {
      return (
        <>
          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
          본인인증 진행 중...
        </>
      );
    }
    return (
      <>
        <Shield className="w-5 h-5 mr-2" />
        휴대폰 본인인증
      </>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 pt-20">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg border border-gray-200">
        {/* 헤더 */}
        <div className="text-center p-6 border-b border-gray-100">
          <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <Shield className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">본인인증</h1>
          <p className="text-gray-600 mt-2">안전한 거래를 위해 본인인증이 필요합니다</p>
        </div>

        {/* 컨텐츠 */}
        <div className="p-6 space-y-6">
          {/* 안내 사항 */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              본인인증 안내
            </h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• 본인 명의의 휴대폰으로 인증이 진행됩니다</li>
              <li>• 인증 정보는 안전하게 암호화되어 저장됩니다</li>
              <li>• 한 번 인증하면 다시 인증할 필요가 없습니다</li>
            </ul>
          </div>

          {/* 혜택 안내 */}
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-gray-900">안전한 결제</p>
                <p className="text-sm text-gray-600">본인인증 후 안전하게 결제할 수 있습니다</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-gray-900">분쟁 보호</p>
                <p className="text-sm text-gray-600">
                  거래 분쟁 시 본인확인으로 보호받을 수 있습니다
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-gray-900">신뢰 거래</p>
                <p className="text-sm text-gray-600">전문가와 구매자 모두 신뢰할 수 있는 거래</p>
              </div>
            </div>
          </div>

          {/* 인증 버튼 */}
          <button
            onClick={handleVerify}
            disabled={isLoading || isVerifying}
            className="w-full h-12 bg-brand-primary text-white rounded-lg font-semibold text-lg hover:bg-[#1a4d8f] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {renderButtonContent()}
          </button>

          {/* 안내 */}
          <p className="text-center text-sm text-gray-500">
            본인인증을 완료해야 서비스 구매가 가능합니다
          </p>
        </div>
      </div>
    </div>
  );
}
