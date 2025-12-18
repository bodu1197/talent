---
description: 사업자등록증 및 계좌 확인 기능 테스트
---

# 사업자등록증 및 계좌 확인 기능 테스트 워크플로우

## 사전 준비

### 1. 환경 변수 확인

`.env.local` 파일에 다음 환경 변수가 설정되어 있는지 확인:

```bash
PORTONE_API_SECRET=your_portone_api_secret_here
NEXT_PUBLIC_PORTONE_STORE_ID=your_store_id_here
NEXT_PUBLIC_PORTONE_CHANNEL_KEY=your_channel_key_here
```

### 2. PortOne 계정 설정

- PortOne 관리자 콘솔에서 B2B 서비스 활성화
- Platform API 권한 확인

## 테스트 단계

### 1. 개발 서버 실행

```bash
npm run dev
```

### 2. 판매자 등록 페이지 접속

```
http://localhost:3000/mypage/seller/register
```

### 3. 본인인증 (휴대폰)

- "본인인증" 버튼 클릭
- PortOne + KCP 본인인증 팝업에서 인증 진행
- 실명과 전화번호가 자동으로 입력됨

### 4. 계좌 실명 확인 테스트

**개인 판매자 흐름:**

- 은행명 선택 (예: 국민은행)
- 계좌번호 입력 (예: 123456789012)
- 예금주명 입력 (본인인증한 실명과 동일해야 함)
- "계좌 실명확인" 버튼 클릭
- 결과 확인:
  - ✅ 성공: "계좌 실명확인이 완료되었습니다"
  - ❌ 실패: 오류 메시지 표시

**예상 응답 (성공):**

```json
{
  "valid": true,
  "verified": true,
  "holderName": "홍길동",
  "nameMatch": true,
  "message": "계좌 실명확인이 완료되었습니다."
}
```

### 5. 사업자등록번호 확인 테스트

**사업자 판매자 흐름:**

- "개인/사업자 구분"에서 "사업자" 선택
- 사업자등록번호 입력 (예: 123-45-67890)
- "사업자등록번호 확인" 버튼 클릭
- 결과 확인:
  - ✅ 성공: 상호명, 대표자명, 사업자 상태 표시
  - ❌ 실패: 오류 메시지 표시

**예상 응답 (성공):**

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

## API 직접 테스트 (선택)

### 계좌 확인 API

```bash
curl -X POST http://localhost:3000/api/verification/bank-account \
  -H "Content-Type: application/json" \
  -d '{
    "bankName": "국민은행",
    "accountNumber": "123456789012",
    "accountHolder": "홍길동"
  }'
```

### 사업자등록번호 확인 API

```bash
curl -X POST http://localhost:3000/api/verification/business \
  -H "Content-Type: application/json" \
  -d '{
    "businessNumber": "123-45-67890"
  }'
```

## 지원 은행 목록 확인

```bash
curl http://localhost:3000/api/verification/bank-account
```

## 트러블슈팅

### 1. PortOne API Secret 오류

**증상:** "PortOne API Secret이 설정되지 않았습니다"
**해결:** `.env.local` 파일에 `PORTONE_API_SECRET` 환경 변수 추가

### 2. 계좌 조회 실패 (404)

**증상:** "존재하지 않는 계좌입니다"
**원인:**

- 잘못된 계좌번호 입력
- 해당 은행에 실제로 존재하지 않는 계좌
  **해결:** 실제 계좌번호로 테스트

### 3. 사업자등록번호 형식 오류

**증상:** "올바르지 않은 사업자등록번호 형식입니다"
**원인:** 체크섬 검증 실패 (잘못된 번호)
**해결:** 실제 사업자등록번호로 테스트 (10자리 숫자)

### 4. 예금주명 불일치

**증상:** "입력하신 예금주명과 실제 예금주명이 일치하지 않습니다"
**원인:**

- 본인인증한 이름과 계좌 예금주가 다름
- 개명, 띄어쓰기 차이 등
  **해결:**
- 실제 예금주명과 정확히 일치하는지 확인
- 공백은 자동으로 제거되어 비교됨

## 로그 확인

서버 로그에서 다음 정보 확인 가능:

- 검증 요청 (userId, 마스킹된 계좌번호/사업자번호)
- API 호출 결과
- 에러 상세 정보

```
# 개발 서버 콘솔에서 확인
[INFO] Bank account verification completed { userId: '...', nameMatch: true }
[INFO] Business verification completed { userId: '...', isActive: true }
```

## 추가 개선 사항 (선택)

1. **검증 결과 저장**: Supabase에 검증 이력 저장
2. **재검증 제한**: 1일 N회 제한 (악용 방지)
3. **관리자 승인**: 판매자 등록 시 관리자 최종 승인 단계 추가
4. **지원 은행 확장**: 더 많은 은행/증권사 추가
5. **사업자 상태 모니터링**: 폐업/휴업 상태 자동 체크
