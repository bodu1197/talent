'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import * as PortOne from '@portone/browser-sdk/v2';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { CheckCircle2, Shield, AlertCircle, Loader2 } from 'lucide-react';

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

      // PortOne 본인인증 요청
      const response = await PortOne.requestIdentityVerification({
        storeId: process.env.NEXT_PUBLIC_PORTONE_STORE_ID!,
        channelKey: process.env.NEXT_PUBLIC_PORTONE_IDENTITY_CHANNEL_KEY!,
        identityVerificationId,
        customer: {
          customerId: customerInfo.email || undefined,
          fullName: customerInfo.name || undefined,
          phoneNumber: customerInfo.phone || undefined,
        },
      });

      if (response?.code) {
        // 사용자가 취소한 경우
        if (response.code === 'FAILURE_TYPE_PG' && response.message?.includes('취소')) {
          toast.info('본인인증이 취소되었습니다');
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
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <Shield className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">본인인증</CardTitle>
          <CardDescription>안전한 거래를 위해 본인인증이 필요합니다</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
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
              <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-gray-900">안전한 결제</p>
                <p className="text-sm text-gray-600">본인인증 후 안전하게 결제할 수 있습니다</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-gray-900">분쟁 보호</p>
                <p className="text-sm text-gray-600">
                  거래 분쟁 시 본인확인으로 보호받을 수 있습니다
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-gray-900">신뢰 거래</p>
                <p className="text-sm text-gray-600">판매자와 구매자 모두 신뢰할 수 있는 거래</p>
              </div>
            </div>
          </div>

          {/* 인증 버튼 */}
          <Button
            onClick={handleVerify}
            disabled={isLoading || isVerifying}
            className="w-full h-12 text-lg"
          >
            {renderButtonContent()}
          </Button>

          {/* 건너뛰기 안내 */}
          <p className="text-center text-sm text-gray-500">
            본인인증을 완료해야 서비스 구매가 가능합니다
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
