# 돌파구 (Dolpagu) SonarCloud 최신 분석 결과

**스캔 시간**: 2025. 12. 17. 오전 4:54:20
**프로젝트**: bodu1197_talent
**조직**: bodu1197

---

## 📊 전체 품질 현황

### Quality Gate 상태

**🔴 FAIL** - Coverage 미달

| 조건                       | 상태     | 목표 | 현재              |
| -------------------------- | -------- | ---- | ----------------- |
| New Reliability Rating     | ✅ OK    | 1    | 1                 |
| New Security Rating        | ✅ OK    | 1    | 1                 |
| New Maintainability Rating | ✅ OK    | 1    | 1                 |
| New Coverage               | ❌ ERROR | 80   | 0.0               |
| New Duplicated Lines       | ❌ ERROR | 3    | 4.385000610724319 |
| Security Hotspots Reviewed | ✅ OK    | 100  | 100.0             |

---

## 🎯 핵심 메트릭

### 코드 품질 등급

| 항목                | 등급 | 수치 | 평가                |
| ------------------- | ---- | ---- | ------------------- |
| **Reliability**     | ⚪ ? | 1.0  | 버그 0개 (우수)     |
| **Security**        | ⚪ ? | 1.0  | 취약점 0개 (우수)   |
| **Maintainability** | ⚪ ? | 1.0  | 기술 부채 관리 양호 |

### 전체 지표

```
📈 코드 라인 수 (NCLOC): 80,660 라인
🐛 버그: 0개 ✅
🔒 보안 취약점: 0개 ✅
💩 Code Smells: 121개
📋 커버리지: 0.0% ❌
🔁 중복 코드: 2.4%
⏱️ 기술 부채: 8시간
🔥 보안 핫스팟: 0개
```

### 신규 코드 지표 (New Code)

```
🐛 신규 버그: 0개
🔒 신규 취약점: 0개
💩 신규 Code Smells: 48개
📋 신규 커버리지: 0.0% ❌
🔁 신규 중복 코드: 4.385000610724319%
```

---

## 🚨 이슈 분석

### 전체 이슈: 137개

#### 심각도별

| 심각도   | 개수 | 비율   |
| -------- | ---- | ------ |
| 🟠 MAJOR | 137  | 100.0% |

#### 타입별

| 타입          | 개수 | 비율  |
| ------------- | ---- | ----- |
| 👃 CODE_SMELL | 132  | 96.4% |
| 🐛 BUG        | 5    | 3.6%  |

#### 주요 태그별 이슈

| 태그           | 개수 |
| -------------- | ---- |
| react          | 111  |
| accessibility  | 57   |
| performance    | 52   |
| jsx            | 47   |
| type-dependent | 13   |
| async          | 5    |
| promise        | 5    |
| javascript     | 5    |
| optimization   | 5    |
| design         | 4    |

---

## 📋 우선 해결 이슈 (Top 20)

### 1. 🟠 🐛 src/app/errands/new/page.tsx:?

**룰**: typescript:S6544
**메시지**: Promise-returning function provided to property where a void return was expected.
**심각도**: MAJOR
**타입**: BUG
**예상 수정 시간**: 5min
**태그**: async, promise, type-dependent

### 2. 🟠 🐛 src/app/errands/new/page.tsx:?

**룰**: typescript:S6544
**메시지**: Promise-returning function provided to property where a void return was expected.
**심각도**: MAJOR
**타입**: BUG
**예상 수정 시간**: 5min
**태그**: async, promise, type-dependent

### 3. 🟠 🐛 src/app/errands/new/page.tsx:?

**룰**: typescript:S6544
**메시지**: Promise-returning function provided to property where a void return was expected.
**심각도**: MAJOR
**타입**: BUG
**예상 수정 시간**: 5min
**태그**: async, promise, type-dependent

### 4. 🟠 🐛 src/app/errands/new/page.tsx:?

**룰**: typescript:S6544
**메시지**: Promise-returning function provided to property where a void return was expected.
**심각도**: MAJOR
**타입**: BUG
**예상 수정 시간**: 5min
**태그**: async, promise, type-dependent

### 5. 🟠 🐛 src/components/service/LocationInputSection.tsx:?

**룰**: typescript:S6544
**메시지**: Promise-returning function provided to property where a void return was expected.
**심각도**: MAJOR
**타입**: BUG
**예상 수정 시간**: 5min
**태그**: async, promise, type-dependent

### 6. 🟠 👃 src/components/orders/DeliverablesSection.tsx:14

**룰**: typescript:S4782
**메시지**: Consider removing 'undefined' type or '?' specifier, one of them is redundant.
**심각도**: MAJOR
**타입**: CODE_SMELL
**예상 수정 시간**: 1min
**태그**: redundant, type-dependent

### 7. 🟠 👃 src/components/orders/RequirementsSection.tsx:5

**룰**: typescript:S4782
**메시지**: Consider removing 'undefined' type or '?' specifier, one of them is redundant.
**심각도**: MAJOR
**타입**: CODE_SMELL
**예상 수정 시간**: 1min
**태그**: redundant, type-dependent

### 8. 🟠 👃 src/components/payment/PaymentSummarySidebar.tsx:42

**룰**: typescript:S6479
**메시지**: Do not use Array index in keys
**심각도**: MAJOR
**타입**: CODE_SMELL
**예상 수정 시간**: 5min
**태그**: jsx, performance, react

### 9. 🟠 👃 src/components/payment/PaymentMethodSelector.tsx:71

**룰**: typescript:S6853
**메시지**: A form label must have accessible text.
**심각도**: MAJOR
**타입**: CODE_SMELL
**예상 수정 시간**: 5min
**태그**: accessibility, react

### 10. 🟠 👃 src/app/errands/new/page.tsx:161

**룰**: typescript:S6582
**메시지**: Prefer using an optional chain expression instead, as it's more concise and easier to read.
**심각도**: MAJOR
**타입**: CODE_SMELL
**예상 수정 시간**: 5min

### 11. 🟠 👃 src/app/errands/register/page.tsx:965

**룰**: typescript:S6853
**메시지**: A form label must have accessible text.
**심각도**: MAJOR
**타입**: CODE_SMELL
**예상 수정 시간**: 5min
**태그**: accessibility, react

### 12. 🟠 👃 src/app/errands/register/page.tsx:987

**룰**: typescript:S6853
**메시지**: A form label must have accessible text.
**심각도**: MAJOR
**타입**: CODE_SMELL
**예상 수정 시간**: 5min
**태그**: accessibility, react

### 13. 🟠 👃 src/app/errands/register/page.tsx:1009

**룰**: typescript:S6853
**메시지**: A form label must have accessible text.
**심각도**: MAJOR
**타입**: CODE_SMELL
**예상 수정 시간**: 5min
**태그**: accessibility, react

### 14. 🟠 👃 src/app/mypage/seller/advertising/purchase/page.tsx:206

**룰**: typescript:S6819
**메시지**: Use <input type="button">, <input type="image">, <input type="reset">, <input type="submit">, or <button> instead of the "button" role to ensure accessibility across all devices.
**심각도**: MAJOR
**타입**: CODE_SMELL
**예상 수정 시간**: 5min
**태그**: accessibility, react

### 15. 🟠 👃 src/components/service/LocationInputSection.tsx:90

**룰**: typescript:S6582
**메시지**: Prefer using an optional chain expression instead, as it's more concise and easier to read.
**심각도**: MAJOR
**타입**: CODE_SMELL
**예상 수정 시간**: 5min

### 16. 🟠 👃 src/components/service/PackagePricingForm.tsx:187

**룰**: typescript:S6819
**메시지**: Use <input type="button">, <input type="image">, <input type="reset">, <input type="submit">, or <button> instead of the "button" role to ensure accessibility across all devices.
**심각도**: MAJOR
**타입**: CODE_SMELL
**예상 수정 시간**: 5min
**태그**: accessibility, react

### 17. 🟠 👃 src/app/api/errands/[id]/chat/route.ts:?

**룰**: typescript:S4043
**메시지**: Move this array "reverse" operation to a separate statement or replace it with "toReversed".
**심각도**: MAJOR
**타입**: CODE_SMELL
**예상 수정 시간**: 5min
**태그**: type-dependent

### 18. 🟠 👃 src/components/home/DesktopHomePage.tsx:?

**룰**: typescript:S6479
**메시지**: Do not use Array index in keys
**심각도**: MAJOR
**타입**: CODE_SMELL
**예상 수정 시간**: 5min
**태그**: jsx, performance, react

### 19. 🟠 👃 src/components/home/DesktopHomePage.tsx:?

**룰**: typescript:S6479
**메시지**: Do not use Array index in keys
**심각도**: MAJOR
**타입**: CODE_SMELL
**예상 수정 시간**: 5min
**태그**: jsx, performance, react

### 20. 🟠 👃 src/components/home/DesktopHomePage.tsx:?

**룰**: typescript:S6479
**메시지**: Do not use Array index in keys
**심각도**: MAJOR
**타입**: CODE_SMELL
**예상 수정 시간**: 5min
**태그**: jsx, performance, react

---

## 📁 이슈가 많은 파일 (Top 20)

| 순위 | 파일명                                              | 이슈 수 |
| ---- | --------------------------------------------------- | ------- |
| 1    | src/app/errands/new/page.tsx                        | 11      |
| 2    | src/components/service/PackagePricingForm.tsx       | 11      |
| 3    | src/app/errands/register/page.tsx                   | 10      |
| 4    | src/components/portfolio/PortfolioForm.tsx          | 9       |
| 5    | src/app/errands/mypage/helper/settings/page.tsx     | 8       |
| 6    | src/app/privacy/page.tsx                            | 6       |
| 7    | src/app/admin/notices/page.tsx                      | 5       |
| 8    | src/components/home/DesktopHomePage.tsx             | 4       |
| 9    | src/components/home/ErrandBannerStrip.tsx           | 4       |
| 10   | src/components/service/PackageSelector.tsx          | 4       |
| 11   | src/components/home/CategoryGridSkeleton.tsx        | 3       |
| 12   | src/app/errands/mypage/helper/earnings/page.tsx     | 3       |
| 13   | src/app/helper/guide/page.tsx                       | 3       |
| 14   | src/app/errands/mypage/settings/page.tsx            | 3       |
| 15   | src/components/services/MobilePackageSelector.tsx   | 3       |
| 16   | src/components/service/LocationInputSection.tsx     | 2       |
| 17   | src/app/mypage/seller/advertising/purchase/page.tsx | 2       |
| 18   | src/app/terms/location/page.tsx                     | 2       |
| 19   | src/app/terms/partner/page.tsx                      | 2       |
| 20   | src/app/buyer/how-to-order/page.tsx                 | 2       |

---

## ⚠️ 개선 권장사항

### 1. 🚨 테스트 커버리지 [CRITICAL]

**문제**: 현재 커버리지 0.0% (목표: 80%)
**조치**: Jest 설정 및 핵심 로직부터 테스트 작성 시작
**예상 소요**: 40-60시간 (전체 프로젝트)
**ROI**: ★★★★★

### 2. 🟡 접근성 (Accessibility) [MEDIUM]

**문제**: 57개의 접근성 이슈
**조치**: Form label과 input 연결, WCAG 가이드라인 준수
**예상 소요**: 2-3시간
**ROI**: ★★★★☆

### 3. 🟡 React 성능 [MEDIUM]

**문제**: 111개의 React 성능 이슈
**조치**: Array key 수정, Component 정의 위치 최적화
**예상 소요**: 3-4시간
**ROI**: ★★★★☆

### 4. 🟡 코드 품질 [MEDIUM]

**문제**: 121개의 Code Smell
**조치**: 점진적 리팩토링 및 코드 정리
**예상 소요**: 지속적
**ROI**: ★★★☆☆

---

## 🎯 다음 단계

### Phase 1: 긴급 (이번 주)

- ♿ 접근성 이슈 57개 수정
- 📋 MAJOR 이슈 우선순위 수정 (상위 20개)

### Phase 2: 단기 (2주 이내)

- 🧪 Jest 설정 및 테스트 작성 시작
- 📈 커버리지 20% 달성 목표
- 🔄 React 성능 이슈 수정

### Phase 3: 중장기 (1개월 이내)

- 📊 커버리지 80% 달성
- ✅ Quality Gate PASS
- 🎯 기술 부채 50% 감소

---

## 📈 예상 개선 효과

| 메트릭           | 현재    | Phase 1 후 | Phase 2 후 | Phase 3 후 |
| ---------------- | ------- | ---------- | ---------- | ---------- |
| **Bugs**         | 0       | 0 ✅       | 0          | 0          |
| **Code Smells**  | 121     | 91         | 61         | <100       |
| **Coverage**     | 0.0%    | 0.0%       | 20%        | 80% ✅     |
| **Quality Gate** | FAIL ❌ | FAIL       | FAIL       | PASS ✅    |
| **기술 부채**    | 8h      | 7h         | 5h         | <5h        |

---

## 📚 참고 링크

- **SonarCloud Dashboard**: https://sonarcloud.io/dashboard?id=bodu1197_talent
- **Issues**: https://sonarcloud.io/project/issues?id=bodu1197_talent
- **Security Hotspots**: https://sonarcloud.io/project/security_hotspots?id=bodu1197_talent

---

**리포트 생성**: 2025. 12. 17. 오전 4:55:51
**분석 도구**: SonarCloud
