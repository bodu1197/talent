'use client';

import { toast } from 'react-hot-toast';

interface CertificationResponse {
  code?: string;
  message?: string;
  identityId?: string;
  [key: string]: unknown;
}

interface CertificationButtonProps {
  /**
   * 본인인증 완료 후 실행될 콜백 함수
   * @param response 인증 결과 객체
   */
  onComplete?: (response: CertificationResponse) => void;
  /**
   * 버튼에 표시될 텍스트
   * @default "휴대폰 본인인증"
   */
  label?: string;
  /**
   * 버튼 스타일 클래스
   */
  className?: string;
}

/**
 * 휴대폰 본인인증 버튼 컴포넌트
 * Portone V2 SDK를 사용하여 KCP 본인인증을 수행합니다.
 */
export default function CertificationButton({
  onComplete,
  label = '휴대폰 본인인증',
  className = 'btn-ai w-full',
}: CertificationButtonProps) {
  const handleCertification = async () => {
    try {
      // 0. SDK 동적 로드 (클릭 시점에만 로드하여 초기 번들 최적화)
      const Portone = await import('@portone/browser-sdk/v2');

      // 1. 본인인증 요청 (TS Error 우회를 위한 any 캐스팅)
      // 참고: storeId와 channelKey는 포트원 관리자 페이지에서 발급받아야 합니다.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const response = await (Portone as any).identityVerification({
        storeId:
          process.env.NEXT_PUBLIC_PORTONE_STORE_ID || 'store-4ff4af41-85e3-457f-9bf3-017f7a7710a3',
        channelKey: process.env.NEXT_PUBLIC_PORTONE_CHANNEL_KEY || 'channel-key-321456',
        paymentId: `cert-${crypto.randomUUID()}`,
      });

      if (response.code != null) {
        // 에러 발생
        console.error('인증 실패:', response);
        toast.error(`본인인증 실패: ${response.message}`);
        return;
      }

      // 2. 인증 성공
      toast.success('본인인증이 완료되었습니다.');

      // 3. 부모 컴포넌트에 알림
      if (onComplete) {
        onComplete(response);
      }
    } catch (error) {
      console.error('인증 요청 중 오류 발생:', error);
      toast.error('인증 요청 중 오류가 발생했습니다.');
    }
  };

  return (
    <button onClick={handleCertification} className={className} type="button">
      {label}
    </button>
  );
}
