# PortOne API 확보 방법 - 빠른 요약

## 🎯 핵심 요약

### Platform API (계좌 인증) - ✅ 바로 사용 가능

1. [PortOne 관리자 콘솔](https://admin.portone.io) 로그인
2. **"내 식별코드, API Keys"** 메뉴에서 **API Secret** 복사
3. `.env.local`에 설정:
   ```bash
   PORTONE_API_SECRET=복사한_시크릿_키
   ```
4. 끝! 바로 사용 가능 ✅

### B2B API (사업자 인증) - ⚠️ 별도 신청 필요

1. **support@portone.io**로 이메일 발송:

   ```
   제목: [B2B API 신청] 사업자등록번호 조회 기능 활성화 요청

   내용:
   - 상점 ID: imp12345678
   - 사용 목적: 플랫폼 판매자 사업자 검증
   - 예상 월 호출량: 약 100회

   B2B API 활성화 절차 안내 부탁드립니다.
   ```

2. 또는 **전화**: 1670-5176 (평일 09:00-18:00)
3. **1-3 영업일** 후 활성화 완료 통보 대기

---

## 📝 필요한 API Keys

```bash
# .env.local 파일에 추가
PORTONE_API_SECRET=your_api_secret_here              # 서버 사이드 전용 (비공개)
NEXT_PUBLIC_PORTONE_STORE_ID=imp12345678             # 클라이언트 사이드 (공개 가능)
NEXT_PUBLIC_PORTONE_CHANNEL_KEY=channel-key-abc123   # 클라이언트 사이드 (공개 가능)
```

---

## 🔍 API 확보 상태 확인 방법

### 1. Platform API 테스트 (PowerShell)

```powershell
$env:PORTONE_API_SECRET="your_secret_here"

curl -X GET `
  'https://api.portone.io/platform/bank-accounts/KOOKMIN/테스트계좌번호/holder' `
  -H "Authorization: PortOne $env:PORTONE_API_SECRET"
```

✅ **성공 시**: `{"holderName": "예금주명"}`  
❌ **실패 시**: `{"type": "UnauthorizedError"}` → API Secret 확인 필요

### 2. B2B API 테스트 (PowerShell)

```powershell
curl -X POST `
  'https://api.portone.io/b2b/companies/business-info' `
  -H "Authorization: PortOne $env:PORTONE_API_SECRET" `
  -H 'Content-Type: application/json' `
  -d '{\"brn\": \"1234567890\"}'
```

✅ **성공 시**: `{"b_nm": "상호명", ...}`  
❌ **활성화 안 됨**: `{"type": "B2bNotEnabledError"}` → PortOne에 문의 필요

---

## 🚨 긴급 연락처

- **이메일**: support@portone.io
- **전화**: 1670-5176 (평일 09:00-18:00)
- **관리자 콘솔**: [admin.portone.io](https://admin.portone.io)
- **개발자 문서**: [developers.portone.io](https://developers.portone.io)

---

## 📚 상세 문서

자세한 내용은 다음 문서를 참고하세요:

- **전체 가이드**: `docs/portone-api-setup-guide.md`
- **통합 가이드**: `docs/verification-integration-guide.md`
- **테스트 워크플로우**: `.agent/workflows/test-verification.md`
