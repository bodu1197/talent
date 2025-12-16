import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import { verifyAuth } from '@/lib/api/verification-common';

// 한국 주요 은행 코드 매핑
const BANK_CODES: Record<string, string> = {
  // 시중은행
  국민은행: 'KOOKMIN',
  KB국민은행: 'KOOKMIN',
  신한은행: 'SHINHAN',
  우리은행: 'WOORI',
  하나은행: 'HANA',
  KEB하나은행: 'HANA',
  농협은행: 'NONGHYUP',
  NH농협: 'NONGHYUP',
  NH농협은행: 'NONGHYUP',
  기업은행: 'IBK',
  IBK기업은행: 'IBK',
  SC제일은행: 'SC',
  씨티은행: 'CITI',
  한국씨티은행: 'CITI',

  // 지방은행
  경남은행: 'KYONGNAM',
  광주은행: 'GWANGJU',
  대구은행: 'DAEGU',
  부산은행: 'BUSAN',
  전북은행: 'JEONBUK',
  제주은행: 'JEJU',

  // 인터넷은행
  카카오뱅크: 'KAKAO',
  케이뱅크: 'KBANK',
  K뱅크: 'KBANK',
  토스뱅크: 'TOSS',

  // 특수은행
  산업은행: 'KDB',
  KDB산업은행: 'KDB',
  수협: 'SUHYUP',
  수협은행: 'SUHYUP',
  우체국: 'POST',
  우체국예금: 'POST',
  새마을금고: 'SAEMAUL',
  신협: 'SHINHYUP',
  신용협동조합: 'SHINHYUP',
  저축은행: 'SAVINGS',

  // 증권사
  미래에셋증권: 'MIRAE',
  삼성증권: 'SAMSUNG_SEC',
  NH투자증권: 'NH_SEC',
  한국투자증권: 'KOREA_SEC',
  KB증권: 'KB_SEC',
};

// 은행 이름에서 코드 추출
function getBankCode(bankName: string): string | null {
  // 직접 매핑
  if (BANK_CODES[bankName]) {
    return BANK_CODES[bankName];
  }

  // 부분 일치 검색
  for (const [name, code] of Object.entries(BANK_CODES)) {
    if (bankName.includes(name) || name.includes(bankName)) {
      return code;
    }
  }

  return null;
}

// PortOne Platform API로 예금주 조회
async function verifyBankAccount(bankCode: string, accountNumber: string) {
  const apiSecret = process.env.PORTONE_API_SECRET;
  if (!apiSecret) {
    throw new Error('PortOne API Secret이 설정되지 않았습니다');
  }

  // 계좌번호에서 공백과 하이픈 제거
  const cleanAccountNumber = accountNumber.replaceAll(/[\s-]/g, '');

  const response = await fetch(
    `https://api.portone.io/platform/bank-accounts/${encodeURIComponent(bankCode)}/${encodeURIComponent(cleanAccountNumber)}/holder`,
    {
      method: 'GET',
      headers: {
        Authorization: `PortOne ${apiSecret}`,
        Accept: 'application/json',
      },
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    logger.error('PortOne Bank Account Verification API error:', {
      status: response.status,
      error: errorText,
    });

    // 404: 계좌가 존재하지 않음
    if (response.status === 404) {
      return { valid: false, reason: 'NOT_FOUND' };
    }

    // 400: 잘못된 요청 (계좌번호 형식 오류 등)
    if (response.status === 400) {
      return { valid: false, reason: 'INVALID_FORMAT' };
    }

    throw new Error(`PortOne API 호출 실패: ${response.status}`);
  }

  return response.json();
}

interface BankAccountRequest {
  bankName: string;
  accountNumber: string;
  accountHolder?: string;
}

export async function POST(request: NextRequest) {
  try {
    // 인증 및 본문 파싱
    const authResult = await verifyAuth<BankAccountRequest>(request);
    if (!authResult.success) {
      return authResult.error;
    }

    const { user, body } = authResult;
    const { bankName, accountNumber, accountHolder } = body;

    if (!bankName || !accountNumber) {
      return NextResponse.json({ error: '은행명과 계좌번호가 필요합니다' }, { status: 400 });
    }

    // 1. 은행 코드 변환
    const bankCode = getBankCode(bankName);
    if (!bankCode) {
      return NextResponse.json({
        valid: false,
        verified: false,
        error: '지원하지 않는 은행입니다. 주요 시중은행, 인터넷은행을 선택해주세요.',
        supportedBanks: Object.keys(BANK_CODES).slice(0, 15),
      });
    }

    // 2. PortOne API로 예금주 조회
    let accountInfo;
    try {
      accountInfo = await verifyBankAccount(bankCode, accountNumber);
    } catch (error) {
      logger.error('Bank account verification fetch failed:', error);
      return NextResponse.json(
        { error: '계좌 조회 실패. 잠시 후 다시 시도해주세요.' },
        { status: 500 }
      );
    }

    // 3. 결과 확인
    if (accountInfo.valid === false) {
      const errorMessages: Record<string, string> = {
        NOT_FOUND: '존재하지 않는 계좌입니다. 계좌번호를 확인해주세요.',
        INVALID_FORMAT: '잘못된 계좌번호 형식입니다.',
      };

      return NextResponse.json({
        valid: false,
        verified: false,
        error: errorMessages[accountInfo.reason] || '계좌 조회에 실패했습니다.',
      });
    }

    // 4. 예금주 이름 비교 (입력된 이름과 실제 예금주 비교)
    const actualHolder = accountInfo.holder || accountInfo.holderName;
    let nameMatch = true;

    if (accountHolder && actualHolder) {
      // 공백 제거 후 비교
      const inputName = accountHolder.replaceAll(/\s/g, '');
      const actualName = actualHolder.replaceAll(/\s/g, '');
      nameMatch = inputName === actualName;
    }

    logger.info('Bank account verification completed', {
      userId: user.id,
      bankCode,
      accountNumberMasked: accountNumber.substring(0, 4) + '****',
      nameMatch,
    });

    return NextResponse.json({
      valid: true,
      verified: nameMatch,
      holderName: actualHolder,
      nameMatch,
      message: nameMatch
        ? '계좌 실명확인이 완료되었습니다.'
        : `입력하신 예금주명(${accountHolder})과 실제 예금주명(${actualHolder})이 일치하지 않습니다.`,
    });
  } catch (error) {
    logger.error('Bank account verification error:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다' }, { status: 500 });
  }
}

// 지원되는 은행 목록 조회
export async function GET() {
  const banks = [
    { name: '국민은행', code: 'KOOKMIN' },
    { name: '신한은행', code: 'SHINHAN' },
    { name: '우리은행', code: 'WOORI' },
    { name: '하나은행', code: 'HANA' },
    { name: 'NH농협은행', code: 'NONGHYUP' },
    { name: 'IBK기업은행', code: 'IBK' },
    { name: '카카오뱅크', code: 'KAKAO' },
    { name: '케이뱅크', code: 'KBANK' },
    { name: '토스뱅크', code: 'TOSS' },
    { name: 'SC제일은행', code: 'SC' },
    { name: '경남은행', code: 'KYONGNAM' },
    { name: '광주은행', code: 'GWANGJU' },
    { name: '대구은행', code: 'DAEGU' },
    { name: '부산은행', code: 'BUSAN' },
    { name: '전북은행', code: 'JEONBUK' },
    { name: '제주은행', code: 'JEJU' },
    { name: 'KDB산업은행', code: 'KDB' },
    { name: '수협은행', code: 'SUHYUP' },
    { name: '우체국', code: 'POST' },
    { name: '새마을금고', code: 'SAEMAUL' },
    { name: '신협', code: 'SHINHYUP' },
  ];

  return NextResponse.json({ banks });
}
