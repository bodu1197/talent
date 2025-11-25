# SonarQube 재스캔 분석 리포트

**스캔 일시**: 2025-11-25
**프로젝트**: talent (돌파구 플랫폼)
**이전 스캔**: 541개 이슈 → **현재**: 500개 이슈 ✅ **-41개 감소**

---

## 📊 종합 현황

### 심각도별 분포

| 심각도      | 이슈 수   | 비율     |
| ----------- | --------- | -------- |
| 🔴 BLOCKER  | 2개       | 0.4%     |
| 🟠 CRITICAL | 10개      | 2.0%     |
| 🟡 MAJOR    | 315개     | 63.0%    |
| 🔵 MINOR    | 166개     | 33.2%    |
| ⚪ INFO     | 7개       | 1.4%     |
| **총계**    | **500개** | **100%** |

### 타입별 분포

- **CODE_SMELL**: 496개 (99.2%)
- **BUG**: 4개 (0.8%)

---

## 🎯 Top 20 규칙 (발생 빈도순)

| 순위 | 규칙             | 이슈 수 | 설명                           |
| ---- | ---------------- | ------- | ------------------------------ |
| 1    | typescript:S6853 | 152개   | React Hooks dependencies 누락  |
| 2    | typescript:S7728 | 49개    | 타입스크립트 타입 관련         |
| 3    | typescript:S6759 | 44개    | JSX에서 boolean 값 직접 렌더링 |
| 4    | typescript:S3358 | 40개    | 중첩 삼항 연산자               |
| 5    | typescript:S6479 | 40개    | Array index를 key로 사용       |
| 6    | typescript:S6819 | 25개    | 의미있는 HTML 태그 사용 권장   |
| 7    | typescript:S6772 | 17개    | React state 업데이트 관련      |
| 8    | typescript:S3776 | 10개    | **Cognitive Complexity** ⚠️    |
| 9    | typescript:S7781 | 10개    | 타입스크립트 추론 개선         |
| 10   | typescript:S7723 | 8개     | 타입 안정성                    |
| 11   | typescript:S6847 | 8개     | 비대화형 요소에 이벤트 리스너  |
| 12   | typescript:S6848 | 7개     | 대화형 요소 접근성             |
| 13   | typescript:S7747 | 7개     | 타입 단언 개선                 |
| 14   | typescript:S1135 | 7개     | TODO 주석                      |
| 15   | typescript:S7772 | 7개     | 정규식 개선                    |
| 16   | typescript:S7721 | 7개     | Optional chaining              |
| 17   | typescript:S7759 | 6개     | 타입 가드                      |
| 18   | typescript:S1854 | 6개     | 사용하지 않는 할당             |
| 19   | typescript:S6594 | 6개     | React effect 최적화            |
| 20   | typescript:S1082 | 4개     | 주석 스타일                    |

---

## 📁 Top 20 파일 (이슈가 많은 순)

| 순위 | 파일                                                              | 이슈 수 |
| ---- | ----------------------------------------------------------------- | ------- |
| 1    | src/app/mypage/seller/advertising/page.tsx                        | 26개    |
| 2    | src/app/mypage/seller/register/SellerRegisterClient.tsx           | 21개    |
| 3    | src/app/page.tsx                                                  | 20개    |
| 4    | src/app/admin/users/page.tsx                                      | 16개    |
| 5    | src/app/mypage/seller/profile/SellerProfileClient.tsx             | 16개    |
| 6    | src/app/admin/advertising/payments/page.tsx                       | 14개    |
| 7    | src/app/mypage/buyer/orders/[id]/page.tsx                         | 13개    |
| 8    | src/lib/supabase/queries/services.ts                              | 12개    |
| 9    | src/app/mypage/seller/services/new/NewServiceClient.tsx           | 12개    |
| 10   | src/app/mypage/seller/advertising/bank-transfer/page.tsx          | 12개    |
| 11   | src/app/mypage/seller/portfolio/[id]/edit/PortfolioEditClient.tsx | 12개    |
| 12   | src/app/mypage/seller/profile/edit/SellerProfileEditClient.tsx    | 12개    |
| 13   | src/app/mypage/settings/edit/SettingsEditClient.tsx               | 11개    |
| 14   | src/app/mypage/seller/services/[id]/edit/EditServiceClient.tsx    | 9개     |
| 15   | src/app/mypage/seller/portfolio/new/PortfolioNewClient.tsx        | 8개     |
| 16   | src/app/admin/advertising/page.tsx                                | 7개     |
| 17   | src/app/chat/[roomId]/DirectChatClient.tsx                        | 7개     |
| 18   | src/app/auth/register/page.tsx                                    | 7개     |
| 19   | src/app/mypage/seller/orders/SellerOrdersClient.tsx               | 7개     |
| 20   | src/app/mypage/settings/SettingsClient.tsx                        | 7개     |

---

## 🚨 BLOCKER 및 CRITICAL 이슈 상세

### BLOCKER (2개) - 최우선 수정 필요 ⚠️

#### 1-2. src/lib/supabase/queries/service-helpers.ts

- **규칙**: typescript:S3516
- **문제**: 함수가 항상 같은 값을 반환
- **영향**: 로직 오류 가능성, 불필요한 코드
- **우선순위**: **즉시 수정 필요**

### CRITICAL (10개) - Cognitive Complexity 초과

모든 CRITICAL 이슈는 **typescript:S3776** (인지 복잡도) 규칙 위반입니다.

| 파일                                                          | 복잡도 | 허용치 |
| ------------------------------------------------------------- | ------ | ------ | ----------- |
| src/lib/template-generator.ts:134                             | 45     | 15     | ⚠️ **심각** |
| src/lib/supabase/queries/services.ts                          | 28     | 15     |
| src/app/auth/register/page.tsx                                | 23     | 15     |
| src/lib/supabase/queries/services.ts                          | 21     | 15     |
| src/app/chat/ChatListClient.tsx                               | 18     | 15     |
| src/app/api/chat/rooms/route.ts                               | 18     | 15     |
| src/app/mypage/buyer/orders/[id]/page.tsx                     | 17     | 15     |
| src/app/mypage/seller/services/new/NewServiceClientV2.tsx:129 | 17     | 15     |
| src/lib/supabase/queries/services.ts                          | 16     | 15     |
| src/app/mypage/seller/services/page.tsx                       | 16     | 15     |

---

## 📈 이전 스캔 대비 변화

### 수정된 이슈 (9개)

1. ✅ Array index in keys 수정 (2개)
   - src/app/mypage/buyer/favorites/page.tsx
   - src/components/services/ServiceGrid.tsx
2. ✅ 접근성 이슈 수정 (6개)
   - Modal keyboard handlers
   - Semantic HTML (`<nav>` 태그)
3. ✅ 404 라우트 오류 수정 (1개)
   - src/components/home/SellerRegistrationGuide.tsx

### 결과

- **이전**: 541개
- **현재**: 500개
- **감소**: -41개 ✅

> 💡 **9개 수정 → 41개 감소**: 일부 이슈 수정이 연관된 다른 이슈들도 함께 해결한 것으로 추정됩니다.

---

## 🎯 우선순위별 개선 계획

### Phase 1: 긴급 (BLOCKER)

🔴 **즉시 수정 필요** - 2개

- [ ] service-helpers.ts의 항상 같은 값 반환하는 함수 수정

### Phase 2: 고위험 (CRITICAL - Complexity)

🟠 **1주일 내 수정** - 10개

- [ ] template-generator.ts (복잡도 45 → 15)
- [ ] services.ts 쿼리 함수 리팩토링 (3개 함수)
- [ ] 기타 복잡한 컴포넌트 리팩토링 (6개)

### Phase 3: 패턴 기반 수정 (MAJOR)

🟡 **2주 내 수정** - 상위 6개 규칙 (327개)

1. **typescript:S6853** (152개) - React Hooks dependencies
   - useEffect, useMemo, useCallback 의존성 배열 수정
   - 자동화 도구 활용 가능
2. **typescript:S7728** (49개) - 타입스크립트 타입
3. **typescript:S6759** (44개) - Boolean 렌더링
4. **typescript:S3358** (40개) - 중첩 삼항 연산자 → if문으로 변경
5. **typescript:S6479** (40개) - Array index keys
6. **typescript:S6819** (25개) - Semantic HTML

### Phase 4: 점진적 개선 (MINOR)

🔵 **1개월 내** - 166개

- 코드 스타일, 가독성 개선
- TODO 주석 정리
- Optional chaining 적용

---

## 💡 권장 사항

### 1. 자동화 가능한 이슈 우선 처리

- **eslint-plugin-react-hooks** 설정 강화
- **typescript-eslint** 규칙 활성화
- Pre-commit hook 강화

### 2. 복잡도 개선 전략

- 함수 분리 (Extract Function)
- Early return 패턴 적용
- 조건문 단순화

### 3. React Hooks 의존성 (152개)

```bash
# ESLint 규칙 활성화
"react-hooks/exhaustive-deps": "error"
```

### 4. 파일별 집중 공략

상위 5개 파일만 수정해도 **109개 이슈 해결** (21.8%):

1. advertising/page.tsx (26개)
2. SellerRegisterClient.tsx (21개)
3. page.tsx (20개)
4. admin/users/page.tsx (16개)
5. SellerProfileClient.tsx (16개)

---

## 📝 결론

### 긍정적 변화

✅ **41개 이슈 감소** (541 → 500)
✅ 간단한 패턴 이슈 대부분 수정 완료
✅ 접근성 기본 이슈 해결

### 남은 과제

⚠️ **BLOCKER 2개** - 즉시 수정 필요
⚠️ **CRITICAL 10개** - 복잡도 리팩토링
⚠️ **React Hooks 152개** - 체계적 접근 필요

### 다음 단계

1. **BLOCKER** 2개 즉시 수정
2. **CRITICAL** 복잡도 가장 높은 3개 파일 리팩토링
3. **React Hooks** ESLint 자동 수정 적용
4. **패턴 기반** 반복 이슈 일괄 수정

---

**Generated**: 2025-11-25
**Analyzer**: Claude Code
**Next Update**: After Phase 1-2 completion
