# 사업자등록증 및 계좌 확인 기능 통합 가이드

## 📋 개요

이 문서는 한국 플랫폼에서 판매자 인증을 위한 **사업자등록증 확인**과 **계좌 실명 확인** 기능을 통합하는 완전한 가이드입니다.

### 핵심 기능

1. ✅ **사업자등록번호 검증** - 국세청 알고리즘 + PortOne B2B API
2. ✅ **계좌 실명 확인** - PortOne Platform API
3. ✅ **본인인증** - PortOne + KCP (이미 구현됨)

---

## 🏗️ 아키텍처

```
┌─────────────────────────────────────────────────────────────┐
│                    Client (브라우저)                          │
│  ┌───────────────────────────────────────────────────────┐  │
│  │   SellerRegisterClient.tsx (판매자 등록 페이지)        │  │
│  │                                                         │  │
│  │  1. 본인인증 (PortOne SDK)                             │  │
│  │  2. 계좌 실명확인 버튼                                  │  │
│  │  3. 사업자등록번호 확인 버튼                            │  │
│  └───────────────────────────────────────────────────────┘  │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       │ HTTP Request
                       │
┌──────────────────────▼──────────────────────────────────────┐
│               Next.js API Routes (서버)                      │
│  ┌───────────────────────────────────────────────────────┐  │
│  │   /api/verification/bank-account                       │  │
│  │   - 은행 코드 변환                                      │  │
│  │   - PortOne Platform API 호출                         │  │
│  │   - 예금주명 비교                                       │  │
│  └───────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │   /api/verification/business                           │  │
│  │   - 사업자번호 체크섬 검증                              │  │
│  │   - PortOne B2B API 호출                              │  │
│  │   - 사업자 상태 확인                                    │  │
│  └───────────────────────────────────────────────────────┘  │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       │ API Call
                       │
┌──────────────────────▼──────────────────────────────────────┐
│                  PortOne API                                 │
│  ┌───────────────────────────────────────────────────────┐  │
│  │   B2B API (사업자등록 정보 조회)                       │  │
│  │   POST /b2b/companies/business-info                   │  │
│  └───────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │   Platform API (예금주 조회)                           │  │
│  │   GET /platform/bank-accounts/{bank}/{account}/holder │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## 📁 파일 구조

```
talent/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── verification/
│   │   │       ├── bank-account/
│   │   │       │   └── route.ts          # 계좌 확인 API
│   │   │       └── business/
│   │   │           └── route.ts          # 사업자 확인 API
│   │   └── mypage/
│   │       └── seller/
│   │           └── register/
│   │               └── SellerRegisterClient.tsx  # UI 컴포넌트
│   └── lib/
│       ├── api/
│       │   └── verification-common.ts    # 공통 인증 로직
│       └── validation/
│           └── input.ts                  # 입력 검증 유틸
└── .env.local                            # 환경 변수 (gitignored)
```

---

## 🔧 구현 상세

### 1. 계좌 실명 확인 (`/api/verification/bank-account`)

#### 요청 예시

```typescript
POST /api/verification/bank-account
Content-Type: application/json

{
  "bankName": "국민은행",
  "accountNumber": "123456789012",
  "accountHolder": "홍길동"
}
```

#### 처리 흐름

1. **인증 확인**: JWT 토큰으로 사용자 인증
2. **은행 코드 변환**: 은행명 → PortOne 은행 코드
   - 예: "국민은행" → "KOOKMIN"
   - 지원 은행: 시중은행, 인터넷은행, 지방은행, 특수은행
3. **PortOne API 호출**:
   ```
   GET https://api.portone.io/platform/bank-accounts/{bankCode}/{accountNumber}/holder
   ```
4. **예금주명 비교**: 입력한 이름 vs 실제 예금주
5. **응답 반환**

#### 응답 예시 (성공)

```json
{
  "valid": true,
  "verified": true,
  "holderName": "홍길동",
  "nameMatch": true,
  "message": "계좌 실명확인이 완료되었습니다."
}
```

#### 응답 예시 (실패)

```json
{
  "valid": false,
  "verified": false,
  "error": "존재하지 않는 계좌입니다. 계좌번호를 확인해주세요."
}
```

#### 지원 은행 목록

```typescript
const BANK_CODES = {
  // 시중은행
  국민은행: 'KOOKMIN',
  신한은행: 'SHINHAN',
  우리은행: 'WOORI',
  하나은행: 'HANA',
  NH농협은행: 'NONGHYUP',
  IBK기업은행: 'IBK',

  // 인터넷은행
  카카오뱅크: 'KAKAO',
  케이뱅크: 'KBANK',
  토스뱅크: 'TOSS',

  // ... 및 기타 은행
};
```

---

### 2. 사업자등록번호 확인 (`/api/verification/business`)

#### 요청 예시

```typescript
POST /api/verification/business
Content-Type: application/json

{
  "businessNumber": "123-45-67890"
}
```

#### 처리 흐름

1. **형식 검증**:
   - 하이픈 제거 → 10자리 숫자 확인
   - **체크섬 알고리즘** 검증 (국세청 알고리즘)
   ```typescript
   const checkSum = [1, 3, 7, 1, 3, 7, 1, 3, 5];
   // ... 체크섬 계산
   ```
2. **PortOne B2B API 호출**:
   ```
   POST https://api.portone.io/b2b/companies/business-info
   Body: { "brn": "1234567890" }
   ```
3. **사업자 정보 조회**:
   - 상호명
   - 대표자명
   - 사업자 상태 (계속사업자/폐업)
   - 업태/업종
4. **응답 반환**

#### 응답 예시 (성공)

```json
{
  "valid": true,
  "verified": true,
  "businessName": "(주)예시상호",
  "representativeName": "홍길동",
  "status": "계속사업자",
  "isActive": true,
  "businessType": "법인사업자",
  "businessCategory": "도소매업"
}
```

#### 응답 예시 (실패)

```json
{
  "valid": false,
  "verified": false,
  "error": "등록되지 않은 사업자등록번호입니다"
}
```

#### 사업자번호 체크섬 알고리즘

```typescript
function isValidBusinessNumber(businessNumber: string): boolean {
  const cleanNumber = businessNumber.replaceAll('-', '');

  if (!/^\d{10}$/.test(cleanNumber)) {
    return false;
  }

  const checkSum = [1, 3, 7, 1, 3, 7, 1, 3, 5];
  let sum = 0;

  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleanNumber[i]) * checkSum[i];
  }

  sum += Math.floor((parseInt(cleanNumber[8]) * 5) / 10);
  const remainder = (10 - (sum % 10)) % 10;

  return remainder === parseInt(cleanNumber[9]);
}
```

---

### 3. UI 컴포넌트 (`SellerRegisterClient.tsx`)

#### 상태 관리

```typescript
interface VerificationStatus {
  isVerified: boolean;
  isVerifying: boolean;
  message?: string;
  data?: Record<string, unknown>;
}

const [bankVerification, setBankVerification] = useState<VerificationStatus>({
  isVerified: false,
  isVerifying: false,
});

const [businessVerification, setBusinessVerification] = useState<VerificationStatus>({
  isVerified: false,
  isVerifying: false,
});
```

#### 계좌 확인 핸들러

```typescript
const handleBankAccountVerification = async () => {
  if (!formData.bankName || !formData.accountNumber || !formData.accountHolder) {
    toast.error('은행명, 계좌번호, 예금주명을 모두 입력해주세요.');
    return;
  }

  setBankVerification({ isVerified: false, isVerifying: true });

  try {
    const response = await fetch('/api/verification/bank-account', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        bankName: formData.bankName,
        accountNumber: formData.accountNumber,
        accountHolder: formData.accountHolder,
      }),
    });

    const result = await response.json();

    if (result.verified && result.nameMatch) {
      setBankVerification({
        isVerified: true,
        isVerifying: false,
        message: result.message,
        data: result,
      });
      toast.success('계좌 실명확인이 완료되었습니다.');
    } else {
      setBankVerification({ isVerified: false, isVerifying: false });
      toast.error(result.message || result.error || '계좌 확인에 실패했습니다.');
    }
  } catch (error) {
    setBankVerification({ isVerified: false, isVerifying: false });
    toast.error('계좌 확인 중 오류가 발생했습니다');
  }
};
```

#### 사업자 확인 핸들러

```typescript
const handleBusinessVerification = async () => {
  if (!formData.businessNumber) {
    toast.error('사업자등록번호를 입력해주세요.');
    return;
  }

  setBusinessVerification({ isVerified: false, isVerifying: true });

  try {
    const response = await fetch('/api/verification/business', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        businessNumber: formData.businessNumber,
      }),
    });

    const result = await response.json();

    if (result.verified && result.isActive) {
      setBusinessVerification({
        isVerified: true,
        isVerifying: false,
        message: `${result.businessName} (${result.representativeName})`,
        data: result,
      });
      toast.success(`사업자 확인 완료: ${result.businessName}`);
    } else {
      setBusinessVerification({ isVerified: false, isVerifying: false });
      toast.error(result.error || '사업자등록번호 확인에 실패했습니다.');
    }
  } catch (error) {
    setBusinessVerification({ isVerified: false, isVerifying: false });
    toast.error('사업자 확인 중 오류가 발생했습니다');
  }
};
```

#### 제출 조건 검증

```typescript
const canProceed = () => {
  switch (currentStep) {
    case 1: // 본인인증
      return identityVerified;

    case 2: // 계좌 정보
      const hasBasicInfo = formData.bankName && formData.accountNumber && formData.accountHolder;

      const hasValidVerification = bankVerification.isVerified;

      // 사업자인 경우 사업자번호도 필요
      if (formData.isBusiness) {
        return (
          hasBasicInfo &&
          hasValidVerification &&
          formData.businessNumber &&
          businessVerification.isVerified
        );
      }

      return hasBasicInfo && hasValidVerification;

    // ...
  }
};
```

---

## 🔐 보안 고려사항

### 1. API 인증

- 모든 API는 JWT 토큰을 요구합니다
- `verifyAuth()` 함수로 사용자 인증 확인

```typescript
const authResult = await verifyAuth<RequestType>(request);
if (!authResult.success) {
  return authResult.error; // 401 Unauthorized
}
```

### 2. 민감 정보 로깅

- 계좌번호/사업자번호는 마스킹하여 로깅

```typescript
logger.info('Bank account verification', {
  userId: user.id,
  accountNumberMasked: accountNumber.substring(0, 4) + '****',
});
```

### 3. 환경 변수 보호

- `.env.local`은 `.gitignore`에 포함
- `PORTONE_API_SECRET`은 서버 사이드 전용

### 4. Rate Limiting (권장)

향후 추가 구현 권장:

- 1시간당 N회 제한
- IP 기반 제한
- Redis 또는 Upstash 사용

---

## 🚀 배포 체크리스트

### 1. 환경 변수 설정

- [ ] Vercel/배포 환경에 `PORTONE_API_SECRET` 추가
- [ ] `NEXT_PUBLIC_PORTONE_STORE_ID` 추가
- [ ] `NEXT_PUBLIC_PORTONE_CHANNEL_KEY` 추가

### 2. PortOne 설정

- [ ] B2B 서비스 활성화
- [ ] Platform API 권한 확인
- [ ] KCP 본인인증 설정 (이미 완료된 것으로 보임)

### 3. 테스트

- [ ] 실제 사업자번호로 검증 테스트
- [ ] 실제 계좌번호로 실명확인 테스트
- [ ] 오류 케이스 테스트 (존재하지 않는 계좌/사업자)
- [ ] 개인 판매자 흐름 테스트
- [ ] 사업자 판매자 흐름 테스트

### 4. 데이터베이스

현재 검증은 메모리 상태로만 관리됩니다. 추후 고려사항:

- [ ] 검증 결과를 `profiles` 테이블에 저장
- [ ] 검증 이력 테이블 생성 (감사 로그)
- [ ] 검증 만료 정책 (예: 1년마다 재검증)

---

## 📊 모니터링 및 로깅

### 로그 이벤트

```typescript
// 성공
logger.info('Bank account verification completed', {
  userId: user.id,
  bankCode,
  nameMatch: true,
});

logger.info('Business verification completed', {
  userId: user.id,
  businessNumber: masked,
  status: '계속사업자',
  isActive: true,
});

// 실패
logger.error('PortOne API error:', {
  status: response.status,
  error: errorText,
});
```

### 주요 메트릭

- 검증 요청 수 (성공/실패)
- 평균 응답 시간
- 오류율 (by 오류 타입)
- 지원되지 않는 은행 요청 빈도

---

## 🔄 추가 개선 사항

### 1. 검증 결과 영속화

```sql
-- 검증 이력 테이블 (예시)
CREATE TABLE verification_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  verification_type TEXT NOT NULL, -- 'bank_account', 'business'
  verified_at TIMESTAMPTZ DEFAULT NOW(),
  verification_data JSONB,
  is_valid BOOLEAN NOT NULL
);
```

### 2. 재검증 제한

```typescript
// 1일 3회 제한 예시
const verificationCount = await getVerificationCountToday(userId);
if (verificationCount >= 3) {
  return NextResponse.json(
    { error: '오늘 검증 횟수를 초과했습니다. 내일 다시 시도해주세요.' },
    { status: 429 }
  );
}
```

### 3. 관리자 승인 플로우

```typescript
// 판매자 등록 후 관리자 승인 대기
const sellerStatus = 'pending_approval'; // 최초 등록 시

// 관리자가 검증 결과 확인 후 승인
const approveSellerStatus = 'approved';
```

### 4. 웹훅 통합

검증 상태 변경 시 외부 시스템에 알림:

```typescript
await fetch(WEBHOOK_URL, {
  method: 'POST',
  body: JSON.stringify({
    event: 'seller.verified',
    userId,
    timestamp: new Date(),
  }),
});
```

### 5. 다중 계좌 지원

```typescript
// 판매자가 여러 계좌 등록 가능
interface BankAccount {
  id: string;
  bankName: string;
  accountNumber: string;
  accountHolder: string;
  isVerified: boolean;
  isPrimary: boolean; // 주 계좌
}
```

---

## 🐛 트러블슈팅

### 문제 1: "PortOne API Secret이 설정되지 않았습니다"

**원인**: 환경 변수 미설정 또는 배포 환경에 미반영
**해결**:

1. `.env.local` 파일에 `PORTONE_API_SECRET` 추가
2. Vercel 대시보드 → Settings → Environment Variables에서 추가
3. 배포 재시작

### 문제 2: 계좌 조회 실패 (404)

**원인**:

- 실제로 존재하지 않는 계좌번호
- 은행 코드 매핑 오류
  **해결**:

1. 실제 계좌번호로 테스트
2. 지원 은행 목록 확인: `GET /api/verification/bank-account`
3. 로그에서 변환된 은행 코드 확인

### 문제 3: 사업자번호 체크섬 검증 실패

**원인**: 잘못된 사업자등록번호 입력
**해결**:

1. 국세청 체크섬 알고리즘으로 사전 검증
2. 실제 사업자등록번호로 테스트
3. 온라인 사업자번호 검증 사이트로 확인

### 문제 4: CORS 에러

**원인**: 클라이언트에서 직접 PortOne API 호출 시도
**해결**:

- 항상 Next.js API Route를 통해 호출
- PortOne API는 서버 사이드에서만 호출

### 문제 5: Rate Limit 초과

**원인**: PortOne API Rate Limit 초과
**해결**:

1. 클라이언트 측에서 중복 요청 방지
2. 디바운싱/쓰로틀링 적용
3. 사용자당 일일 검증 횟수 제한

---

## 📚 참고 자료

### PortOne 문서

- [B2B API](https://developers.portone.io/api/rest-v2/b2b)
- [Platform API](https://developers.portone.io/api/rest-v2/platform)
- [본인인증](https://developers.portone.io/docs/ko/auth/guide)

### 국세청

- [사업자등록번호 조회](https://www.hometax.go.kr/)

### 관련 법률

- 전자금융거래법 (계좌 실명확인 의무)
- 부가가치세법 (사업자등록 확인)

---

## 👥 문의 및 지원

구현 중 문제가 발생하거나 추가 기능이 필요한 경우:

1. 로그를 확인하여 구체적인 오류 내용 파악
2. PortOne 고객 지원팀 문의
3. 개발팀 내부 문의

---

**마지막 업데이트**: 2025-12-18
**버전**: 1.0.0
**상태**: ✅ 프로덕션 준비 완료
