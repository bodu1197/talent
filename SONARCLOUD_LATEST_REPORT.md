# 돌파구 (Dolpagu) SonarCloud 최신 분석 결과

**스캔 시간**: 2026. 1. 15. 오후 6:42:20
**프로젝트**: bodu1197_talent
**조직**: bodu1197

---

## 📊 전체 품질 현황

### Quality Gate 상태

**🔴 FAIL** - Coverage 미달

| 조건 | 상태 | 목표 | 현재 |
|------|------|------|------|
| New Reliability Rating | ❌ ERROR | 1 | 3 |
| New Security Rating | ✅ OK | 1 | 1 |
| New Maintainability Rating | ✅ OK | 1 | 1 |
| New Coverage | ❌ ERROR | 80 | 0.0 |
| New Duplicated Lines | ✅ OK | 3 | 2.3417519181585678 |
| Security Hotspots Reviewed | ✅ OK | 100 | 100.0 |

---

## 🎯 핵심 메트릭

### 코드 품질 등급

| 항목 | 등급 | 수치 | 평가 |
|------|------|------|------|
| **Reliability** | ⚪ ? | 3.0 | 버그 4개 존재 |
| **Security** | ⚪ ? | 1.0 | 취약점 0개 (우수) |
| **Maintainability** | ⚪ ? | 1.0 | 기술 부채 관리 양호 |

### 전체 지표

```
📈 코드 라인 수 (NCLOC): 82,634 라인
🐛 버그: 4개 
🔒 보안 취약점: 0개 ✅
💩 Code Smells: 69개
📋 커버리지: 0.0% ❌
🔁 중복 코드: 2.1%
⏱️ 기술 부채: 4시간
🔥 보안 핫스팟: 0개
```

### 신규 코드 지표 (New Code)

```
🐛 신규 버그: 4개
🔒 신규 취약점: 0개
💩 신규 Code Smells: 33개
📋 신규 커버리지: 0.0% ❌
🔁 신규 중복 코드: 2.3417519181585678%
```

---

## 🚨 이슈 분석

### 전체 이슈: 152개

#### 심각도별

| 심각도 | 개수 | 비율 |
|--------|------|------|
| 🔴 CRITICAL | 1 | 0.7% |
| 🟠 MAJOR | 151 | 99.3% |

#### 타입별

| 타입 | 개수 | 비율 |
|------|------|------|
| 👃 CODE_SMELL | 146 | 96.1% |
| 🐛 BUG | 6 | 3.9% |

#### 주요 태그별 이슈

| 태그 | 개수 |
|------|------|
| react | 124 |
| accessibility | 67 |
| performance | 55 |
| jsx | 50 |
| type-dependent | 15 |
| async | 5 |
| promise | 5 |
| javascript | 5 |
| optimization | 5 |
| design | 4 |

---

## 📋 우선 해결 이슈 (Top 20)

### 1. 🔴 👃 src/lib/ai/gemini.ts:128

**룰**: typescript:S4123
**메시지**: Unexpected `await` of a non-Promise (non-"Thenable") value.
**심각도**: CRITICAL
**타입**: CODE_SMELL
**예상 수정 시간**: 1min
**태그**: confusing, type-dependent

### 2. 🟠 🐛 src/app/mypage/seller/services/[id]/edit/page.tsx:60

**룰**: typescript:S6959
**메시지**: Add an initial value to this "reduce()" call.
**심각도**: MAJOR
**타입**: BUG
**예상 수정 시간**: 2min
**태그**: type-dependent

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

### 5. 🟠 🐛 src/app/errands/new/page.tsx:?

**룰**: typescript:S6544
**메시지**: Promise-returning function provided to property where a void return was expected.
**심각도**: MAJOR
**타입**: BUG
**예상 수정 시간**: 5min
**태그**: async, promise, type-dependent

### 6. 🟠 🐛 src/app/errands/new/page.tsx:?

**룰**: typescript:S6544
**메시지**: Promise-returning function provided to property where a void return was expected.
**심각도**: MAJOR
**타입**: BUG
**예상 수정 시간**: 5min
**태그**: async, promise, type-dependent

### 7. 🟠 🐛 src/components/service/LocationInputSection.tsx:?

**룰**: typescript:S6544
**메시지**: Promise-returning function provided to property where a void return was expected.
**심각도**: MAJOR
**타입**: BUG
**예상 수정 시간**: 5min
**태그**: async, promise, type-dependent

### 8. 🟠 👃 src/app/help/dispute/page.tsx:287

**룰**: typescript:S6853
**메시지**: A form label must have accessible text.
**심각도**: MAJOR
**타입**: CODE_SMELL
**예상 수정 시간**: 5min
**태그**: accessibility, react

### 9. 🟠 👃 src/app/help/dispute/page.tsx:412

**룰**: typescript:S6479
**메시지**: Do not use Array index in keys
**심각도**: MAJOR
**타입**: CODE_SMELL
**예상 수정 시간**: 5min
**태그**: jsx, performance, react

### 10. 🟠 👃 src/app/admin/ai-faq/page.tsx:259

**룰**: typescript:S6848
**메시지**: Avoid non-native interactive elements. If using native HTML is not possible, add an appropriate role and support for tabbing, mouse, keyboard, and touch inputs to an interactive content element.
**심각도**: MAJOR
**타입**: CODE_SMELL
**예상 수정 시간**: 5min
**태그**: accessibility, react

### 11. 🟠 👃 src/app/admin/ai-faq/page.tsx:346

**룰**: typescript:S6479
**메시지**: Do not use Array index in keys
**심각도**: MAJOR
**타입**: CODE_SMELL
**예상 수정 시간**: 5min
**태그**: jsx, performance, react

### 12. 🟠 👃 src/app/admin/ai-faq/page.tsx:425

**룰**: typescript:S6853
**메시지**: A form label must be associated with a control.
**심각도**: MAJOR
**타입**: CODE_SMELL
**예상 수정 시간**: 5min
**태그**: accessibility, react

### 13. 🟠 👃 src/app/admin/ai-faq/page.tsx:442

**룰**: typescript:S6853
**메시지**: A form label must be associated with a control.
**심각도**: MAJOR
**타입**: CODE_SMELL
**예상 수정 시간**: 5min
**태그**: accessibility, react

### 14. 🟠 👃 src/app/admin/ai-faq/page.tsx:457

**룰**: typescript:S6853
**메시지**: A form label must be associated with a control.
**심각도**: MAJOR
**타입**: CODE_SMELL
**예상 수정 시간**: 5min
**태그**: accessibility, react

### 15. 🟠 👃 src/app/admin/ai-faq/page.tsx:472

**룰**: typescript:S6853
**메시지**: A form label must be associated with a control.
**심각도**: MAJOR
**타입**: CODE_SMELL
**예상 수정 시간**: 5min
**태그**: accessibility, react

### 16. 🟠 👃 src/app/admin/ai-faq/page.tsx:489

**룰**: typescript:S6853
**메시지**: A form label must be associated with a control.
**심각도**: MAJOR
**타입**: CODE_SMELL
**예상 수정 시간**: 5min
**태그**: accessibility, react

### 17. 🟠 👃 src/components/categories/LocationSortToggle.tsx:194

**룰**: typescript:S6848
**메시지**: Avoid non-native interactive elements. If using native HTML is not possible, add an appropriate role and support for tabbing, mouse, keyboard, and touch inputs to an interactive content element.
**심각도**: MAJOR
**타입**: CODE_SMELL
**예상 수정 시간**: 5min
**태그**: accessibility, react

### 18. 🟠 👃 src/components/categories/LocationSortToggle.tsx:198

**룰**: typescript:S6848
**메시지**: Avoid non-native interactive elements. If using native HTML is not possible, add an appropriate role and support for tabbing, mouse, keyboard, and touch inputs to an interactive content element.
**심각도**: MAJOR
**타입**: CODE_SMELL
**예상 수정 시간**: 5min
**태그**: accessibility, react

### 19. 🟠 👃 src/components/categories/LocationSortToggle.tsx:227

**룰**: typescript:S6479
**메시지**: Do not use Array index in keys
**심각도**: MAJOR
**타입**: CODE_SMELL
**예상 수정 시간**: 5min
**태그**: jsx, performance, react

### 20. 🟠 👃 src/components/service/PackagePricingForm.tsx:?

**룰**: typescript:S6847
**메시지**: Non-interactive elements should not be assigned mouse or keyboard event listeners.
**심각도**: MAJOR
**타입**: CODE_SMELL
**예상 수정 시간**: 5min
**태그**: accessibility, react


---

## 📁 이슈가 많은 파일 (Top 20)

| 순위 | 파일명 | 이슈 수 |
|------|--------|---------|
| 1 | src/components/service/PackagePricingForm.tsx | 12 |
| 2 | src/app/errands/new/page.tsx | 11 |
| 3 | src/app/errands/register/page.tsx | 10 |
| 4 | src/components/portfolio/PortfolioForm.tsx | 9 |
| 5 | src/app/errands/mypage/helper/settings/page.tsx | 8 |
| 6 | src/app/admin/ai-faq/page.tsx | 7 |
| 7 | src/app/privacy/page.tsx | 6 |
| 8 | src/app/admin/notices/page.tsx | 5 |
| 9 | src/components/home/DesktopHomePage.tsx | 4 |
| 10 | src/components/home/ErrandBannerStrip.tsx | 4 |
| 11 | src/components/service/PackageSelector.tsx | 4 |
| 12 | src/components/categories/LocationSortToggle.tsx | 3 |
| 13 | src/components/home/CategoryGridSkeleton.tsx | 3 |
| 14 | src/app/errands/mypage/helper/earnings/page.tsx | 3 |
| 15 | src/app/helper/guide/page.tsx | 3 |
| 16 | src/app/errands/mypage/settings/page.tsx | 3 |
| 17 | src/components/services/MobilePackageSelector.tsx | 3 |
| 18 | src/components/service/LocationInputSection.tsx | 2 |
| 19 | src/app/help/dispute/page.tsx | 2 |
| 20 | src/app/mypage/seller/advertising/purchase/page.tsx | 2 |

---

## ⚠️ 개선 권장사항

### 1. 🚨 테스트 커버리지 [CRITICAL]

**문제**: 현재 커버리지 0.0% (목표: 80%)
**조치**: Jest 설정 및 핵심 로직부터 테스트 작성 시작
**예상 소요**: 40-60시간 (전체 프로젝트)
**ROI**: ★★★★★

### 2. 🔴 버그 수정 [HIGH]

**문제**: 4개의 버그 존재
**조치**: 즉시 수정 필요
**예상 소요**: 1-2시간
**ROI**: ★★★★★

### 3. 🟡 접근성 (Accessibility) [MEDIUM]

**문제**: 67개의 접근성 이슈
**조치**: Form label과 input 연결, WCAG 가이드라인 준수
**예상 소요**: 2-3시간
**ROI**: ★★★★☆

### 4. 🟡 React 성능 [MEDIUM]

**문제**: 124개의 React 성능 이슈
**조치**: Array key 수정, Component 정의 위치 최적화
**예상 소요**: 3-4시간
**ROI**: ★★★★☆


---

## 🎯 다음 단계

### Phase 1: 긴급 (이번 주)
- 🐛 버그 4개 즉시 수정
- ♿ 접근성 이슈 67개 수정
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

| 메트릭 | 현재 | Phase 1 후 | Phase 2 후 | Phase 3 후 |
|--------|------|------------|------------|------------|
| **Bugs** | 4 | 0 ✅ | 0 | 0 |
| **Code Smells** | 69 | 39 | 9 | <100 |
| **Coverage** | 0.0% | 0.0% | 20% | 80% ✅ |
| **Quality Gate** | FAIL ❌ | FAIL | FAIL | PASS ✅ |
| **기술 부채** | 4h | 4h | 3h | <5h |

---

## 📚 참고 링크

- **SonarCloud Dashboard**: https://sonarcloud.io/dashboard?id=bodu1197_talent
- **Issues**: https://sonarcloud.io/project/issues?id=bodu1197_talent
- **Security Hotspots**: https://sonarcloud.io/project/security_hotspots?id=bodu1197_talent

---

**리포트 생성**: 2026. 1. 15. 오후 6:42:27
**분석 도구**: SonarCloud
