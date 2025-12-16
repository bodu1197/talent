import { logger } from '@/lib/logger';

// PortOne V2 API로 본인인증 결과 조회
export async function getIdentityVerification(identityVerificationId: string) {
  const apiSecret = process.env.PORTONE_API_SECRET;
  if (!apiSecret) {
    throw new Error('PortOne API Secret이 설정되지 않았습니다');
  }

  const response = await fetch(
    `https://api.portone.io/identity-verifications/${encodeURIComponent(identityVerificationId)}`,
    {
      method: 'GET',
      headers: {
        Authorization: `PortOne ${apiSecret}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    logger.error('PortOne Identity Verification API error:', {
      status: response.status,
      error: errorText,
    });
    throw new Error(`PortOne API 호출 실패: ${response.status}`);
  }

  return response.json();
}
