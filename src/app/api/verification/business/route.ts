import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { logger } from '@/lib/logger';

// 사업자등록번호 형식 검증 (000-00-00000)
function isValidBusinessNumber(businessNumber: string): boolean {
  // 하이픈 제거
  const cleanNumber = businessNumber.replace(/-/g, '');

  // 10자리 숫자인지 확인
  if (!/^\d{10}$/.test(cleanNumber)) {
    return false;
  }

  // 사업자등록번호 체크섬 검증 (국세청 검증 알고리즘)
  const checkSum = [1, 3, 7, 1, 3, 7, 1, 3, 5];
  let sum = 0;

  for (let i = 0; i < 9; i++) {
    sum += Number.parseInt(cleanNumber[i]) * checkSum[i];
  }

  sum += Math.floor((Number.parseInt(cleanNumber[8]) * 5) / 10);
  const remainder = (10 - (sum % 10)) % 10;

  return remainder === Number.parseInt(cleanNumber[9]);
}

// PortOne B2B API로 사업자등록 정보 조회
async function verifyBusinessNumber(businessNumber: string) {
  const apiSecret = process.env.PORTONE_API_SECRET;
  if (!apiSecret) {
    throw new Error('PortOne API Secret이 설정되지 않았습니다');
  }

  // 하이픈 제거
  const cleanNumber = businessNumber.replace(/-/g, '');

  const response = await fetch('https://api.portone.io/b2b/companies/business-info', {
    method: 'POST',
    headers: {
      Authorization: `PortOne ${apiSecret}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      brn: cleanNumber, // Business Registration Number
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    logger.error('PortOne Business Verification API error:', {
      status: response.status,
      error: errorText,
    });

    // 404: 사업자등록번호가 존재하지 않음
    if (response.status === 404) {
      return { valid: false, reason: 'NOT_FOUND' };
    }

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
    const { businessNumber } = body;

    if (!businessNumber) {
      return NextResponse.json({ error: '사업자등록번호가 필요합니다' }, { status: 400 });
    }

    // 1. 형식 검증 (체크섬)
    if (!isValidBusinessNumber(businessNumber)) {
      return NextResponse.json({
        valid: false,
        verified: false,
        error: '올바르지 않은 사업자등록번호 형식입니다',
      });
    }

    // 2. PortOne API로 사업자 정보 조회
    let businessInfo;
    try {
      businessInfo = await verifyBusinessNumber(businessNumber);
    } catch (error) {
      logger.error('Business verification fetch failed:', error);
      return NextResponse.json({ error: '사업자등록번호 조회 실패' }, { status: 500 });
    }

    // 3. 결과 반환
    if (businessInfo.valid === false) {
      return NextResponse.json({
        valid: false,
        verified: false,
        error: '등록되지 않은 사업자등록번호입니다',
      });
    }

    // 사업자 상태 확인
    const businessStatus = businessInfo.status || businessInfo.b_stt;
    const isActive = businessStatus === '계속사업자' || businessStatus === '01';

    logger.info('Business verification completed', {
      userId: user.id,
      businessNumber: businessNumber.substring(0, 3) + '-**-*****',
      status: businessStatus,
      isActive,
    });

    return NextResponse.json({
      valid: true,
      verified: true,
      businessName: businessInfo.b_nm || businessInfo.companyName || null,
      representativeName: businessInfo.p_nm || businessInfo.representativeName || null,
      status: businessStatus,
      isActive,
      businessType: businessInfo.b_type || null,
      businessCategory: businessInfo.b_sector || null,
    });
  } catch (error) {
    logger.error('Business verification error:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다' }, { status: 500 });
  }
}
