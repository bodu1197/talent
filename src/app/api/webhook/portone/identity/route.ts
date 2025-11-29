import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { logger } from '@/lib/logger';

// 웹훅은 서버에서 직접 호출되므로 service role key 사용
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// PortOne V2 API로 본인인증 정보 조회
async function getIdentityVerification(identityVerificationId: string) {
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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    logger.info('PortOne Identity Webhook received:', body);

    const { type, data } = body;

    // 본인인증 관련 이벤트만 처리
    if (!type?.startsWith('IdentityVerification.')) {
      return NextResponse.json({ success: true, message: 'Ignored event type' });
    }

    const identityVerificationId = data?.identityVerificationId;
    if (!identityVerificationId) {
      logger.warn('Webhook missing identityVerificationId:', body);
      return NextResponse.json({ error: 'Missing identityVerificationId' }, { status: 400 });
    }

    // PortOne API로 실제 본인인증 정보 조회 (위변조 방지)
    let verification;
    try {
      verification = await getIdentityVerification(identityVerificationId);
    } catch (error) {
      logger.error('Failed to fetch identity verification info:', error);
      return NextResponse.json({ error: 'Failed to verify identity' }, { status: 500 });
    }

    logger.info('Identity verification info from PortOne:', {
      identityVerificationId,
      status: verification.status,
    });

    // 본인인증 상태에 따른 처리
    switch (verification.status) {
      case 'VERIFIED':
        await handleVerified(identityVerificationId, verification);
        break;

      case 'FAILED':
        await handleFailed(identityVerificationId, verification);
        break;

      default:
        logger.info(`Unhandled verification status: ${verification.status}`);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('Identity webhook error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}

// 본인인증 완료 처리
async function handleVerified(
  identityVerificationId: string,
  verification: Record<string, unknown>
) {
  const verifiedCustomer = verification.verifiedCustomer as Record<string, unknown> | undefined;
  if (!verifiedCustomer) {
    logger.warn('No verified customer data:', { identityVerificationId });
    return;
  }

  // identityVerificationId에서 사용자 정보 추출 시도
  // 형식: identity_{timestamp}_{randomPart} 또는 seller_{timestamp}_{randomPart}
  const idParts = identityVerificationId.split('_');
  const idType = idParts[0]; // 'identity' 또는 'seller'

  logger.info('Identity verification completed via webhook:', {
    identityVerificationId,
    idType,
    name: verifiedCustomer.name,
    ci: verifiedCustomer.ci ? '있음' : '없음',
  });

  // 웹훅에서는 사용자 ID를 알 수 없으므로 로그만 기록
  // 실제 사용자 정보 업데이트는 클라이언트에서 처리
  // 필요시 임시 테이블에 저장하여 클라이언트에서 조회 가능

  // 임시 저장 (선택적)
  const { error } = await supabase.from('identity_verification_logs').insert({
    verification_id: identityVerificationId,
    status: 'VERIFIED',
    verified_name: verifiedCustomer.name as string,
    verified_phone: verifiedCustomer.phoneNumber as string,
    verified_ci: verifiedCustomer.ci as string,
    verified_at: new Date().toISOString(),
  });

  if (error) {
    // 테이블이 없을 수 있음 - 무시
    logger.warn('Failed to log identity verification (table may not exist):', error.message);
  }
}

// 본인인증 실패 처리
async function handleFailed(identityVerificationId: string, verification: Record<string, unknown>) {
  logger.info('Identity verification failed via webhook:', {
    identityVerificationId,
    reason: verification.failReason || 'Unknown',
  });
}

// GET 요청 처리 (웹훅 URL 확인용)
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    message: 'PortOne Identity Verification Webhook Endpoint',
    timestamp: new Date().toISOString(),
  });
}
