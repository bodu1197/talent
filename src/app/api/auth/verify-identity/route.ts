import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { logger } from '@/lib/logger';

// PortOne V2 API로 본인인증 결과 조회
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
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 });
    }

    const body = await request.json();
    const { identityVerificationId } = body;

    if (!identityVerificationId) {
      return NextResponse.json({ error: '본인인증 ID가 필요합니다' }, { status: 400 });
    }

    // PortOne API로 본인인증 결과 조회
    let verification;
    try {
      verification = await getIdentityVerification(identityVerificationId);
    } catch (error) {
      logger.error('Identity verification fetch failed:', error);
      return NextResponse.json({ error: '본인인증 결과 조회 실패' }, { status: 500 });
    }

    // 본인인증 상태 확인
    if (verification.status !== 'VERIFIED') {
      return NextResponse.json(
        { error: `본인인증이 완료되지 않았습니다. 상태: ${verification.status}` },
        { status: 400 }
      );
    }

    const verifiedCustomer = verification.verifiedCustomer;
    if (!verifiedCustomer) {
      return NextResponse.json({ error: '본인인증 정보를 가져올 수 없습니다' }, { status: 400 });
    }

    // CI(연계정보) 중복 체크 - 같은 사람이 다른 계정으로 가입했는지 확인
    if (verifiedCustomer.ci) {
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('verification_ci', verifiedCustomer.ci)
        .neq('id', user.id)
        .single();

      if (existingUser) {
        return NextResponse.json(
          { error: '이미 다른 계정으로 본인인증이 완료되어 있습니다' },
          { status: 400 }
        );
      }
    }

    // 사용자 정보 업데이트
    const { error: updateError } = await supabase
      .from('users')
      .update({
        is_verified: true,
        verified_at: new Date().toISOString(),
        verification_ci: verifiedCustomer.ci || null,
        real_name: verifiedCustomer.name || null,
        birth_date: verifiedCustomer.birthDate || null,
        gender: verifiedCustomer.gender?.toLowerCase() || null,
      })
      .eq('id', user.id);

    if (updateError) {
      logger.error('User verification update error:', updateError);
      return NextResponse.json({ error: '본인인증 정보 저장 실패' }, { status: 500 });
    }

    logger.info('Identity verification completed', {
      userId: user.id,
      name: verifiedCustomer.name,
    });

    return NextResponse.json({
      success: true,
      verified: true,
      name: verifiedCustomer.name,
      phone: verifiedCustomer.phoneNumber || null,
      birthDate: verifiedCustomer.birthDate || null,
      gender: verifiedCustomer.gender || null,
    });
  } catch (error) {
    logger.error('Identity verification error:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다' }, { status: 500 });
  }
}

// 본인인증 상태 확인
export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 });
    }

    const { data: userData } = await supabase
      .from('users')
      .select('is_verified, verified_at, real_name')
      .eq('id', user.id)
      .single();

    return NextResponse.json({
      isVerified: userData?.is_verified || false,
      verifiedAt: userData?.verified_at || null,
      realName: userData?.real_name || null,
    });
  } catch (error) {
    logger.error('Get verification status error:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다' }, { status: 500 });
  }
}
