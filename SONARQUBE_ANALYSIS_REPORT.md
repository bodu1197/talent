# SonarQube 코드 품질 분석 리포트

**생성 시간:** 2025-11-25T00:44:34.232Z
**프로젝트:** talent
**SonarQube URL:** http://localhost:9000

---

## 📊 전체 요약

### 주요 지표

| 지표                     | 값     |
| ------------------------ | ------ |
| 총 이슈 수               | 541    |
| 버그 (Bugs)              | 3      |
| 취약점 (Vulnerabilities) | 0      |
| 코드 스멜 (Code Smells)  | 538    |
| 보안 핫스팟              | 0      |
| 코드 라인 수             | 53,383 |
| 테스트 커버리지          | 0.0%   |
| 중복 코드 비율           | 7.4%   |
| 기술 부채                | 21시간 |

---

## 🔴 심각도별 이슈

| 심각도      | 개수 |
| ----------- | ---- |
| 🔴 CRITICAL | 10   |
| 🟠 MAJOR    | 318  |
| 🟡 MINOR    | 202  |
| 🔵 INFO     | 9    |
| 🚫 BLOCKER  | 2    |

---

## 📝 타입별 이슈

| 타입          | 개수 |
| ------------- | ---- |
| 👃 CODE_SMELL | 538  |
| 🐛 BUG        | 3    |

---

## 🎯 영향도 분석

### 유지보수성 (Maintainability)

- 높음 (HIGH): 10
- 중간 (MEDIUM): 167
- 낮음 (LOW): 197

### 신뢰성 (Reliability)

- 높음 (HIGH): 0
- 중간 (MEDIUM): 168
- 낮음 (LOW): 43

### 보안성 (Security)

- 높음 (HIGH): 0
- 중간 (MEDIUM): 0
- 낮음 (LOW): 0

---

## 🏷️ 주요 태그별 이슈

| 태그           | 개수 |
| -------------- | ---- |
| react          | 314  |
| accessibility  | 198  |
| performance    | 116  |
| readability    | 85   |
| type-dependent | 85   |
| confusing      | 44   |
| jsx            | 41   |
| convention     | 19   |
| cwe            | 15   |
| redundant      | 14   |

---

## 📁 이슈가 많은 파일 (Top 20)

| 순위 | 파일명                                                            | 이슈 수 |
| ---- | ----------------------------------------------------------------- | ------- |
| 1    | src/app/mypage/seller/advertising/page.tsx                        | 23      |
| 2    | src/app/mypage/seller/register/SellerRegisterClient.tsx           | 21      |
| 3    | src/app/admin/users/page.tsx                                      | 16      |
| 4    | src/app/mypage/seller/profile/SellerProfileClient.tsx             | 16      |
| 5    | src/app/page.tsx                                                  | 13      |
| 6    | src/lib/supabase/queries/services.ts                              | 13      |
| 7    | src/app/admin/advertising/payments/page.tsx                       | 12      |
| 8    | src/app/mypage/seller/services/new/NewServiceClient.tsx           | 12      |
| 9    | src/app/mypage/seller/advertising/bank-transfer/page.tsx          | 12      |
| 10   | src/app/mypage/seller/portfolio/[id]/edit/PortfolioEditClient.tsx | 12      |
| 11   | src/app/mypage/seller/profile/edit/SellerProfileEditClient.tsx    | 12      |
| 12   | src/app/mypage/buyer/orders/[id]/page.tsx                         | 11      |
| 13   | src/app/mypage/settings/edit/SettingsEditClient.tsx               | 11      |
| 14   | src/app/mypage/seller/services/[id]/edit/EditServiceClient.tsx    | 9       |
| 15   | src/components/services/PortfolioModal.tsx                        | 8       |
| 16   | src/app/mypage/seller/portfolio/new/PortfolioNewClient.tsx        | 8       |
| 17   | src/lib/logger.ts                                                 | 8       |
| 18   | src/app/chat/[roomId]/DirectChatClient.tsx                        | 7       |
| 19   | src/lib/categories.ts                                             | 7       |
| 20   | src/app/auth/register/page.tsx                                    | 7       |

---

## 🔧 가장 많이 발생한 룰 (Top 20)

| 순위 | 룰               | 발생 횟수 |
| ---- | ---------------- | --------- |
| 1    | typescript:S6853 | 152       |
| 2    | typescript:S7728 | 55        |
| 3    | typescript:S6759 | 53        |
| 4    | typescript:S6479 | 39        |
| 5    | typescript:S3358 | 37        |
| 6    | typescript:S6819 | 26        |
| 7    | typescript:S6772 | 17        |
| 8    | typescript:S7781 | 13        |
| 9    | typescript:S3776 | 10        |
| 10   | typescript:S1135 | 9         |
| 11   | typescript:S6594 | 9         |
| 12   | typescript:S7773 | 9         |
| 13   | typescript:S6847 | 8         |
| 14   | typescript:S6848 | 7         |
| 15   | typescript:S7747 | 7         |
| 16   | typescript:S7772 | 7         |
| 17   | typescript:S7721 | 7         |
| 18   | typescript:S1854 | 6         |
| 19   | typescript:S7759 | 5         |
| 20   | typescript:S4325 | 5         |

---

## ⚠️ 개선 권장사항

### 1. 🚨 심각한 버그 [CRITICAL]

**문제:** 12개의 CRITICAL/BLOCKER 이슈가 있습니다.
**조치:** 즉시 수정 필요

### 2. 🟡 버그 [MEDIUM]

**문제:** 3개의 버그가 발견되었습니다.
**조치:** 우선순위에 따라 수정

### 3. 🟡 코드 품질 [MEDIUM]

**문제:** 538개의 코드 스멜이 발견되었습니다.
**조치:** 점진적 리팩토링 필요

### 4. 🟡 테스트 커버리지 [MEDIUM]

**문제:** 테스트 커버리지가 0.0%로 낮습니다.
**조치:** 단위 테스트 추가 필요 (목표: 80% 이상)

### 5. 🔵 중복 코드 [LOW]

**문제:** 7.4%의 중복 코드가 있습니다.
**조치:** 공통 모듈 추출 권장 (목표: 3% 이하)

### 6. 🟡 접근성 (Accessibility) [MEDIUM]

**문제:** 198개의 접근성 이슈가 발견되었습니다.
**조치:** WCAG 가이드라인 준수를 위한 개선 필요

---

## 📋 우선 해결 필요 이슈 (Top 20)

### 1. 🔴 👃 src/app/mypage/seller/services/new/NewServiceClientV2.tsx:129

**룰:** typescript:S3776
**메시지:** Refactor this function to reduce its Cognitive Complexity from 17 to the 15 allowed.
**심각도:** CRITICAL
**타입:** CODE_SMELL
**예상 수정 시간:** 7min

### 2. 🔴 👃 src/lib/template-generator.ts:112

**룰:** typescript:S3776
**메시지:** Refactor this function to reduce its Cognitive Complexity from 45 to the 15 allowed.
**심각도:** CRITICAL
**타입:** CODE_SMELL
**예상 수정 시간:** 35min

### 3. 🔴 👃 src/lib/supabase/queries/services.ts:undefined

**룰:** typescript:S3776
**메시지:** Refactor this function to reduce its Cognitive Complexity from 16 to the 15 allowed.
**심각도:** CRITICAL
**타입:** CODE_SMELL
**예상 수정 시간:** 6min

### 4. 🔴 👃 src/lib/supabase/queries/services.ts:undefined

**룰:** typescript:S3776
**메시지:** Refactor this function to reduce its Cognitive Complexity from 21 to the 15 allowed.
**심각도:** CRITICAL
**타입:** CODE_SMELL
**예상 수정 시간:** 11min

### 5. 🔴 👃 src/lib/supabase/queries/services.ts:undefined

**룰:** typescript:S3776
**메시지:** Refactor this function to reduce its Cognitive Complexity from 28 to the 15 allowed.
**심각도:** CRITICAL
**타입:** CODE_SMELL
**예상 수정 시간:** 18min

### 6. 🔴 👃 src/app/api/chat/rooms/route.ts:undefined

**룰:** typescript:S3776
**메시지:** Refactor this function to reduce its Cognitive Complexity from 18 to the 15 allowed.
**심각도:** CRITICAL
**타입:** CODE_SMELL
**예상 수정 시간:** 8min

### 7. 🔴 👃 src/app/mypage/seller/services/page.tsx:undefined

**룰:** typescript:S3776
**메시지:** Refactor this function to reduce its Cognitive Complexity from 16 to the 15 allowed.
**심각도:** CRITICAL
**타입:** CODE_SMELL
**예상 수정 시간:** 6min

### 8. 🔴 👃 src/app/mypage/buyer/orders/[id]/page.tsx:undefined

**룰:** typescript:S3776
**메시지:** Refactor this function to reduce its Cognitive Complexity from 17 to the 15 allowed.
**심각도:** CRITICAL
**타입:** CODE_SMELL
**예상 수정 시간:** 7min

### 9. 🔴 👃 src/app/auth/register/page.tsx:undefined

**룰:** typescript:S3776
**메시지:** Refactor this function to reduce its Cognitive Complexity from 23 to the 15 allowed.
**심각도:** CRITICAL
**타입:** CODE_SMELL
**예상 수정 시간:** 13min

### 10. 🔴 👃 src/app/chat/ChatListClient.tsx:undefined

**룰:** typescript:S3776
**메시지:** Refactor this function to reduce its Cognitive Complexity from 18 to the 15 allowed.
**심각도:** CRITICAL
**타입:** CODE_SMELL
**예상 수정 시간:** 8min

### 11. 🟠 👃 src/app/admin/users/page.tsx:311

**룰:** typescript:S6848
**메시지:** Avoid non-native interactive elements. If using native HTML is not possible, add an appropriate role and support for tabbing, mouse, keyboard, and touch inputs to an interactive content element.
**심각도:** MAJOR
**타입:** CODE_SMELL
**예상 수정 시간:** 5min

### 12. 🟠 👃 src/app/mypage/seller/advertising/page.tsx:641

**룰:** typescript:S6848
**메시지:** Avoid non-native interactive elements. If using native HTML is not possible, add an appropriate role and support for tabbing, mouse, keyboard, and touch inputs to an interactive content element.
**심각도:** MAJOR
**타입:** CODE_SMELL
**예상 수정 시간:** 5min

### 13. 🟠 👃 src/app/page.tsx:1

**룰:** typescript:S125
**메시지:** Remove this commented out code.
**심각도:** MAJOR
**타입:** CODE_SMELL
**예상 수정 시간:** 5min

### 14. 🟠 👃 src/app/page.tsx:289

**룰:** typescript:S6479
**메시지:** Do not use Array index in keys
**심각도:** MAJOR
**타입:** CODE_SMELL
**예상 수정 시간:** 5min

### 15. 🟠 👃 src/components/layout/MegaMenu.tsx:191

**룰:** typescript:S6819
**메시지:** Use <nav> instead of the "navigation" role to ensure accessibility across all devices.
**심각도:** MAJOR
**타입:** CODE_SMELL
**예상 수정 시간:** 5min

### 16. 🟠 👃 src/components/services/PortfolioModal.tsx:60

**룰:** typescript:S6848
**메시지:** Avoid non-native interactive elements. If using native HTML is not possible, add an appropriate role and support for tabbing, mouse, keyboard, and touch inputs to an interactive content element.
**심각도:** MAJOR
**타입:** CODE_SMELL
**예상 수정 시간:** 5min

### 17. 🟠 👃 src/lib/template-generator.ts:167

**룰:** typescript:S1854
**메시지:** Remove this useless assignment to variable "sliceLength".
**심각도:** MAJOR
**타입:** CODE_SMELL
**예상 수정 시간:** 1min

### 18. 🟠 👃 src/components/home/UserReviews.tsx:71

**룰:** typescript:S6479
**메시지:** Do not use Array index in keys
**심각도:** MAJOR
**타입:** CODE_SMELL
**예상 수정 시간:** 5min

### 19. 🟠 👃 src/app/admin/advertising/page.tsx:416

**룰:** typescript:S6848
**메시지:** Avoid non-native interactive elements. If using native HTML is not possible, add an appropriate role and support for tabbing, mouse, keyboard, and touch inputs to an interactive content element.
**심각도:** MAJOR
**타입:** CODE_SMELL
**예상 수정 시간:** 5min

### 20. 🟠 👃 src/app/admin/advertising/page.tsx:427

**룰:** typescript:S6847
**메시지:** Non-interactive elements should not be assigned mouse or keyboard event listeners.
**심각도:** MAJOR
**타입:** CODE_SMELL
**예상 수정 시간:** 5min

---

## 📈 상세 메트릭

| 메트릭              | 값    |
| ------------------- | ----- |
| 테스트 커버리지 (%) | 0.0   |
| 순환 복잡도         | 6086  |
| 신뢰성 등급         | 2.0   |
| 중복 코드 비율 (%)  | 7.4   |
| 코드 스멜           | 277   |
| 보안 등급           | 1.0   |
| 보안 핫스팟         | 3     |
| 기술 부채 (분)      | 1254  |
| 유지보수성 등급     | 1.0   |
| 버그                | 3     |
| 인지 복잡도         | 3256  |
| 코드 라인 수        | 53383 |
| 취약점              | 0     |

---

## 🎯 다음 단계

1. **즉시 조치 (Critical)**
   - BLOCKER/CRITICAL 이슈 12개 수정
   - 보안 취약점 0개 검토 및 수정

2. **단기 개선 (1-2주)**
   - 버그 3개 수정
   - 보안 핫스팟 검토
   - 접근성 이슈 198개 개선

3. **중장기 개선 (1-3개월)**
   - 코드 스멜 점진적 리팩토링
   - 테스트 커버리지 향상 (현재 0.0% → 목표 80%)
   - 중복 코드 제거 (현재 7.4% → 목표 3% 이하)

---

**리포트 끝**
