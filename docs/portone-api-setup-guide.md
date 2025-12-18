# PortOne API 확보 및 설정 가이드

## 📋 개요

이 문서는 **PortOne Platform API**와 **PortOne B2B API**를 확보하고 설정하는 완전한 가이드입니다.

### API 종류 및 용도

| API 종류         | 용도                 | 별도 신청 필요          | 사용 기능           |
| ---------------- | -------------------- | ----------------------- | ------------------- |
| **Platform API** | 계좌 예금주 조회     | ❌ 불필요 (기본 제공)   | 계좌 실명 확인      |
| **B2B API**      | 사업자등록 정보 조회 | ✅ **필요** (별도 문의) | 사업자등록번호 검증 |
| **본인인증 API** | 휴대폰 본인인증      | ❌ 불필요 (기본 제공)   | KCP 본인인증        |

---

## 🚀 1단계: PortOne 계정 생성 및 로그인

### 1-1. 회원가입

1. **PortOne 관리자 콘솔** 접속: [https://admin.portone.io](https://admin.portone.io)
2. **회원가입** 클릭
3. 이메일 또는 소셜 로그인으로 가입
4. 사업자 정보 입력 (개인 또는 사업자)

### 1-2. 상점(Store) 생성

1. 로그인 후 **"상점 추가"** 클릭
2. 상점 정보 입력:
   - 상점명
   - 사업자등록번호 (법인/개인사업자)
   - 업종
   - 대표자 정보
3. 상점 생성 완료

---

## 🔑 2단계: API Secret Key 발급 (기본)

### 2-1. API Keys 메뉴 접속

1. **PortOne 관리자 콘솔** 로그인
2. 좌측 메뉴에서 **"개발자 센터"** 또는 **"설정"** 클릭
3. **"내 식별코드, API Keys"** 메뉴 클릭

### 2-2. API Key 정보 확인

다음 3가지 키를 확인할 수 있습니다:

```
✅ Store ID (가맹점 식별코드)
   - 예: imp12345678
   - 용도: 클라이언트 사이드 SDK 초기화
   - 공개 가능: NEXT_PUBLIC_PORTONE_STORE_ID

✅ Channel Key (채널 키)
   - 예: channel-key-abc123...
   - 용도: 결제/본인인증 요청 시 사용
   - 공개 가능: NEXT_PUBLIC_PORTONE_CHANNEL_KEY

✅ API Secret (REST API Secret Key)
   - 예: secret-key-xyz789...
   - 용도: 서버 사이드 API 호출 인증
   - ⚠️ 보안 중요: 절대 클라이언트에 노출 금지
   - 환경 변수: PORTONE_API_SECRET
```

### 2-3. API Secret 재발급 (필요시)

- **"재발급"** 버튼 클릭
- ⚠️ **주의**: 기존 Secret Key는 즉시 무효화됩니다
- 새로운 Secret Key를 안전하게 보관

---

## 🏦 3단계: Platform API 활성화 (계좌 인증용)

### ✅ Platform API는 별도 신청 불필요!

Platform API는 API Secret Key만 있으면 바로 사용 가능합니다.

### 사용 가능한 Platform API:

#### 1. 예금주 조회 API

```
GET https://api.portone.io/platform/bank-accounts/{bank}/{accountNumber}/holder
Authorization: PortOne YOUR_API_SECRET
```

**요청 예시:**

```bash
curl -X GET \
  'https://api.portone.io/platform/bank-accounts/KOOKMIN/123456789012/holder' \
  -H 'Authorization: PortOne YOUR_API_SECRET'
```

**응답 예시:**

```json
{
  "holderName": "홍길동",
  "accountVerificationId": "verification-id-123"
}
```

#### 2. 선택적 파라미터

- `birthdate`: 생년월일 (YYYYMMDD)
- `businessRegistrationNumber`: 사업자등록번호

**실명 확인 강화 예시:**

```
GET /platform/bank-accounts/KOOKMIN/123456789012/holder?birthdate=19900101
```

### 지원 은행 코드

```typescript
국민은행: KOOKMIN;
신한은행: SHINHAN;
우리은행: WOORI;
하나은행: HANA;
농협은행: NONGHYUP;
기업은행: IBK;
카카오뱅크: KAKAO;
케이뱅크: KBANK;
토스뱅크: TOSS;
SC제일은행: SC;
// ... 등
```

---

## 🏢 4단계: B2B API 신청 (사업자 정보 조회용)

### ⚠️ B2B API는 **별도 문의 필수**

PortOne 공식 문서에 따르면:

> "사업자등록 정보 조회는 별도 문의가 필요합니다"

### 4-1. B2B API 신청 방법

#### 방법 1: PortOne 고객센터 문의

1. **이메일**: support@portone.io
2. **제목**: "[B2B API 신청] 사업자등록번호 조회 기능 활성화 요청"
3. **내용**:

   ```
   안녕하세요.

   사업자등록번호 조회 기능(B2B API)을 사용하고자 합니다.

   - 상점 ID: imp12345678
   - 상점명: 돌파구
   - 사업자번호: XXX-XX-XXXXX
   - 사용 목적: 플랫폼 판매자 인증 (사업자 검증)
   - 예상 월 호출 횟수: 약 XXX회

   B2B API 활성화 절차 및 추가 비용 안내 부탁드립니다.

   감사합니다.
   ```

#### 방법 2: 관리자 콘솔 1:1 문의

1. PortOne 관리자 콘솔 로그인
2. 우측 하단 **"채팅 상담"** 또는 **"문의하기"** 클릭
3. 위와 동일한 내용으로 문의

#### 방법 3: 전화 문의

- **PortOne 고객센터**: 1670-5176
- 운영 시간: 평일 09:00 - 18:00

### 4-2. B2B API 활성화 후 확인

활성화 완료 후 다음 API를 사용할 수 있습니다:

#### 사업자등록 정보 조회 API

```
POST https://api.portone.io/b2b/companies/business-info
Authorization: PortOne YOUR_API_SECRET
Content-Type: application/json
```

**요청 예시:**

```bash
curl -X POST \
  'https://api.portone.io/b2b/companies/business-info' \
  -H 'Authorization: PortOne YOUR_API_SECRET' \
  -H 'Content-Type: application/json' \
  -d '{
    "brn": "1234567890"
  }'
```

**응답 예시 (성공):**

```json
{
  "b_nm": "(주)예시상호",
  "p_nm": "홍길동",
  "b_stt": "계속사업자",
  "b_type": "법인사업자",
  "b_sector": "도소매업"
}
```

**오류 (활성화 안 됨):**

```json
{
  "type": "B2bNotEnabledError",
  "message": "B2B 기능이 활성화되지 않았습니다"
}
```

### 4-3. B2B API 비용

- PortOne에 문의하여 확인 필요
- 일반적으로 호출량 기반 과금 또는 월정액
- 테스트 환경에서는 무료 제공 가능

---

## 🔧 5단계: 환경 변수 설정

### 5-1. `.env.local` 파일 생성

프로젝트 루트에 `.env.local` 파일을 생성하고 다음 내용 추가:

```bash
# PortOne API 설정
PORTONE_API_SECRET=your_api_secret_here_from_step2

# 클라이언트 사이드 (공개)
NEXT_PUBLIC_PORTONE_STORE_ID=imp12345678
NEXT_PUBLIC_PORTONE_CHANNEL_KEY=channel-key-abc123...
```

### 5-2. Vercel 환경 변수 설정 (프로덕션)

1. Vercel 대시보드 접속
2. 프로젝트 선택
3. **Settings → Environment Variables**
4. 다음 변수 추가:
   - `PORTONE_API_SECRET`: (Secret, Production/Preview/Development 모두 체크)
   - `NEXT_PUBLIC_PORTONE_STORE_ID`: (Plain Text)
   - `NEXT_PUBLIC_PORTONE_CHANNEL_KEY`: (Plain Text)
5. **Redeploy** 실행

---

## 🧪 6단계: API 테스트

### 6-1. Platform API 테스트 (계좌 조회)

**터미널에서 테스트:**

```bash
# 환경 변수 로드 (Windows PowerShell)
$env:PORTONE_API_SECRET="your_secret_here"

# curl 테스트
curl -X GET `
  'https://api.portone.io/platform/bank-accounts/KOOKMIN/실제계좌번호/holder' `
  -H "Authorization: PortOne $env:PORTONE_API_SECRET"
```

**성공 응답:**

```json
{
  "holderName": "홍길동"
}
```

**실패 응답 (404):**

```json
{
  "type": "NotFoundError",
  "message": "계좌를 찾을 수 없습니다"
}
```

### 6-2. B2B API 테스트 (사업자 조회)

**활성화 확인:**

```bash
curl -X POST `
  'https://api.portone.io/b2b/companies/business-info' `
  -H "Authorization: PortOne $env:PORTONE_API_SECRET" `
  -H 'Content-Type: application/json' `
  -d '{
    "brn": "1234567890"
  }'
```

**성공 (활성화됨):**

```json
{
  "b_nm": "상호명",
  "p_nm": "대표자명",
  ...
}
```

**실패 (활성화 안 됨):**

```json
{
  "type": "B2bNotEnabledError",
  "message": "B2B 기능이 활성화되지 않았습니다"
}
```

### 6-3. 애플리케이션 테스트

**개발 서버 실행:**

```bash
npm run dev
```

**테스트 페이지 접속:**

```
http://localhost:3000/mypage/seller/register
```

**테스트 시나리오:**

1. ✅ 본인인증 (PortOne SDK + KCP)
2. ✅ 계좌 실명확인 (Platform API)
3. ✅ 사업자번호 조회 (B2B API) - 활성화 후

---

## 📊 API 호출 흐름도

```
┌─────────────────────────────────────────────────────────┐
│ 1. PortOne 계정 생성 및 상점 등록                        │
│    → admin.portone.io 에서 진행                          │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│ 2. API Secret Key 발급                                  │
│    → "내 식별코드, API Keys" 메뉴에서 확인               │
│    → Store ID, Channel Key, API Secret 복사             │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│ 3. Platform API 사용 (별도 신청 불필요)                  │
│    ✅ 예금주 조회 바로 사용 가능                         │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│ 4. B2B API 신청 (별도 문의 필수)                         │
│    → support@portone.io 또는 1:1 문의                   │
│    → 사업자 정보 조회 기능 활성화 요청                   │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│ 5. PortOne 담당자 검토 및 활성화                         │
│    → 1-3 영업일 소요                                    │
│    → 비용 및 이용 조건 안내                              │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│ 6. 환경 변수 설정 및 API 호출                            │
│    → .env.local에 PORTONE_API_SECRET 설정               │
│    → 애플리케이션에서 API 호출                           │
└─────────────────────────────────────────────────────────┘
```

---

## ⚠️ 주의사항

### 1. API Secret 보안

- ✅ **서버 사이드에서만 사용** (절대 클라이언트 노출 금지)
- ✅ 환경 변수로 관리 (`.env.local`, `.gitignore` 추가)
- ✅ GitHub, 공개 저장소에 업로드 금지
- ✅ 주기적으로 재발급 (보안 사고 발생 시)

### 2. B2B API 활성화 대기

- ⏳ 활성화까지 **1-3 영업일** 소요
- 🔄 그 동안 Platform API (계좌 인증)는 사용 가능
- 📝 활성화 후 이메일 또는 콘솔에서 확인

### 3. Rate Limiting

- PortOne API는 호출 제한이 있을 수 있음
- 과도한 호출 시 429 오류 발생
- 클라이언트 측에서 디바운싱/쓰로틀링 적용 권장

### 4. 테스트 vs 프로덕션

- PortOne은 **테스트 모드**와 **실제 모드** 구분
- 테스트 모드에서 먼저 충분히 테스트
- 실제 모드로 전환 시 PortOne 담당자와 협의

---

## 🔄 대체 방안 (B2B API 대기 중)

B2B API 활성화를 기다리는 동안 다음 방안을 고려할 수 있습니다:

### 방안 1: 형식 검증만 수행

```typescript
// 사업자번호 체크섬 알고리즘으로 형식만 검증
function isValidBusinessNumber(businessNumber: string): boolean {
  // 국세청 체크섬 알고리즘
  // ... (이미 구현됨)
}
```

### 방안 2: 국세청 홈택스 API 활용

- 국세청 홈택스에서 제공하는 사업자 상태 조회 API
- 별도 신청 필요: [https://www.hometax.go.kr](https://www.hometax.go.kr)
- 인증서 기반 인증 필요

### 방안 3: 수동 검증 + 관리자 승인

- 판매자가 사업자등록증 이미지 업로드
- 관리자가 수동으로 확인 후 승인
- B2B API 활성화 후 자동화로 전환

---

## 📞 문의처

### PortOne 고객지원

- **이메일**: support@portone.io
- **전화**: 1670-5176 (평일 09:00-18:00)
- **채팅**: [admin.portone.io](https://admin.portone.io) 우측 하단
- **개발자 문서**: [developers.portone.io](https://developers.portone.io)

### 기술 지원

- **개발자 센터**: [developers.portone.io](https://developers.portone.io)
- **Slack 커뮤니티**: PortOne 개발자 커뮤니티
- **GitHub Issues**: PortOne SDK 저장소

---

## ✅ 체크리스트

작업을 완료하면서 다음 항목을 체크하세요:

### 기본 설정

- [ ] PortOne 계정 생성 완료
- [ ] 상점(Store) 등록 완료
- [ ] API Secret Key 발급 완료
- [ ] Store ID, Channel Key 확인 완료

### Platform API (계좌 인증)

- [ ] `.env.local`에 `PORTONE_API_SECRET` 설정
- [ ] Platform API 예금주 조회 테스트 성공
- [ ] 애플리케이션에서 계좌 실명확인 동작 확인

### B2B API (사업자 인증)

- [ ] PortOne 고객센터에 B2B API 활성화 요청
- [ ] 활성화 완료 이메일 수신 대기
- [ ] B2B API 사업자 조회 테스트 성공
- [ ] 애플리케이션에서 사업자번호 검증 동작 확인

### 프로덕션 배포

- [ ] Vercel 환경 변수 설정 완료
- [ ] 프로덕션 환경에서 API 호출 테스트
- [ ] 오류 로깅 및 모니터링 설정
- [ ] Rate Limiting 정책 적용

---

## 📅 예상 타임라인

```
Day 1  : PortOne 계정 생성, API Key 발급
Day 1  : Platform API 테스트 및 계좌 인증 기능 테스트
Day 1  : B2B API 활성화 요청 (이메일/문의)
Day 2-4: B2B API 활성화 대기 (PortOne 담당자 검토)
Day 5  : B2B API 활성화 완료 알림 수신
Day 5  : B2B API 테스트 및 사업자번호 검증 기능 테스트
Day 6  : 프로덕션 배포 및 최종 확인
```

---

**마지막 업데이트**: 2025-12-18  
**버전**: 1.0.0  
**상태**: ✅ 검증 완료
