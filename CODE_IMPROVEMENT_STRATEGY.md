# AI Talent Hub 코드 개선 전략 (Strategic Plan)

**작성일:** 2025-11-25
**기반:** SonarQube 최신 스캔 (541개 이슈)
**전략:** Sequential Thinking MCP 심층 분석 결과

---

## 🎯 핵심 인사이트

### 발견한 문제점

1. **순환 의존성 딜레마**
   - 복잡한 코드를 안전하게 리팩토링 → 테스트 필요
   - 테스트 작성 → 코드 이해 필요
   - 코드가 복잡함 → 테스트 작성 어려움

2. **단순 자동화의 함정**
   - React Hooks 의존성 152건을 자동 수정하면 오히려 무한 렌더링 유발 가능
   - ESLint --fix는 신중하게 사용해야 함

3. **법적 리스크 간과**
   - 접근성 198건은 단순 "개선"이 아니라 법적 요구사항
   - ADA, 장애인차별금지법 등 법규 준수 필요

4. **PR 크기 관리**
   - 541개를 한꺼번에 고치면 리뷰 불가능
   - 작은 단위로 나누되, 독립적으로 배포 가능해야 함

---

## 🚀 3-Track 병렬 전략

### Track A: Technical Debt (기술 부채 해소)

**담당:** 백엔드/핵심 로직 개발자
**기간:** 4주

```
Week 1: 긴급 복잡도 문제 해결
├─ Day 1-2: template-generator.ts (복잡도 45 → 15)
│  └─ Extract Method + Guard Clauses만 사용 (안전)
├─ Day 3: services.ts 쿼리 로직 3개 함수
│  └─ 각 함수별 커밋, 작은 단위로
├─ Day 4: register/page.tsx, ChatListClient.tsx
└─ Day 5: 나머지 CRITICAL 6개 + BUG 3개

Week 2-3: 테스트 인프라
├─ Jest/Vitest 설정 확인
├─ 핵심 유틸리티 함수 테스트 (logger, categories 등)
├─ services.ts 쿼리 로직 테스트
└─ 목표: 커버리지 0% → 20%

Week 4+: 점진적 개선
└─ Boy Scout Rule: 수정하는 파일마다 조금씩 개선
```

**성과 지표:**

- Week 1: CRITICAL 12개 → 0개
- Week 2: 테스트 커버리지 20% 달성
- Week 4: 이슈 541 → 450개 이하

---

### Track B: User Experience (사용자 경험 개선)

**담당:** 프론트엔드/UI 개발자
**기간:** 4주

```
Week 1-2: 접근성 핫스팟 집중 공략
├─ Top 10 파일 우선 처리 (150개 이슈 포함)
│  ├─ mypage/seller/advertising/page.tsx (23건)
│  ├─ mypage/seller/register/SellerRegisterClient.tsx (21건)
│  ├─ admin/users/page.tsx (16건)
│  └─ 나머지 7개 파일
│
└─ 패턴별 일괄 처리
   ├─ <div onClick> → <button> 변환
   ├─ role="dialog" → <dialog> 변환
   └─ 누락된 aria-label 추가

Week 3-4: 나머지 파일 정리
└─ 48개 이슈 해결 (파일당 1-2건)
```

**자동화 도구:**

```bash
# 패턴 검색 스크립트
npx eslint --fix --rule 'jsx-a11y/no-static-element-interactions: error'

# 시각적 회귀 테스트
npm install -D @storybook/addon-a11y
```

**성과 지표:**

- Week 2: 접근성 이슈 198 → 48개
- Week 4: 접근성 이슈 0개, WCAG 2.1 AA 준수

---

### Track C: Prevention (재발 방지)

**담당:** DevOps/자동화
**기간:** 3일

```
Day 1: ESLint 규칙 강화 (1시간)
├─ .eslintrc.js 업데이트
│  {
│    "rules": {
│      "react-hooks/exhaustive-deps": "error",  // warning → error
│      "jsx-a11y/no-static-element-interactions": "error",
│      "complexity": ["error", { "max": 15 }]
│    }
│  }
└─ 기존 코드는 임시 무시 (.eslintignore)

Day 2: Pre-commit Hook (1시간)
├─ Husky + lint-staged 설정
│  {
│    "*.{ts,tsx}": [
│      "eslint --fix",
│      "prettier --write"
│    ]
│  }
└─ 새 코드만 엄격하게 검사

Day 3: CI/CD 통합 (2시간)
├─ GitHub Actions에 SonarQube 추가
│  - PR마다 자동 스캔
│  - Quality Gate: 새 코드는 A등급 강제
│  - 커버리지 80% 미만 시 경고
└─ Slack 알림 연동
```

**성과 지표:**

- Day 1: 새 코드에서 Hook 의존성 문제 0건
- Day 2: 잘못된 커밋 방지
- Day 3: PR 리뷰 시간 50% 단축

---

## 📊 4개월 로드맵

### Month 1: 긴급 문제 해결 + 인프라 구축

| Week | Track A         | Track B       | Track C        |
| ---- | --------------- | ------------- | -------------- |
| 1    | CRITICAL 12개   | 접근성 Top 10 | 자동화 설정    |
| 2    | 테스트 인프라   | 접근성 나머지 | -              |
| 3    | 테스트 작성 20% | UI 개선 완료  | -              |
| 4    | 복잡도 검증     | 접근성 검증   | CI/CD 모니터링 |

**목표:** 이슈 541 → 300개

### Month 2: 체계적 정리

- React Hooks 의존성 152건 해결 (파일별 검토)
- 테스트 커버리지 20% → 50%
- 중복 코드 제거 (7.4% → 5%)

**목표:** 이슈 300 → 150개

### Month 3: 품질 향상

- 성능 최적화 116건 (React.memo, useCallback)
- 테스트 커버리지 50% → 80%
- 중복 코드 5% → 3%

**목표:** 이슈 150 → 100개

### Month 4: 마무리

- 나머지 MAJOR/MINOR 이슈 정리
- 문서화 (코드 가이드라인)
- SonarQube Quality Gate A등급 달성

**목표:** 이슈 100 → 50개 (유지보수 가능 수준)

---

## 🎯 즉시 실행 가능한 첫 단계 (오늘)

### Step 1: 자동화 설정 (2시간)

```bash
# 1. ESLint 규칙 업데이트
npm install -D eslint-plugin-jsx-a11y

# 2. Husky 설정
npm install -D husky lint-staged
npx husky install

# 3. Pre-commit hook 생성
npx husky add .husky/pre-commit "npx lint-staged"
```

### Step 2: 복잡도 분석 (1시간)

```bash
# template-generator.ts 읽기
code src/lib/template-generator.ts

# 복잡도 측정
npx ts-complexity src/lib/template-generator.ts
```

### Step 3: 첫 PR 준비 (1시간)

```bash
# Feature branch 생성
git checkout -b fix/critical-template-generator

# 작은 단위로 커밋 계획 수립
# - Commit 1: Extract validation function
# - Commit 2: Extract formatting function
# - Commit 3: Add guard clauses
# - Commit 4: Update tests
```

---

## ⚠️ 리스크와 대응책

### 리스크 1: 리팩토링 중 버그 발생

**확률:** 중간
**영향:** 높음
**대응책:**

- 작은 커밋 유지 (Git bisect로 원인 추적 가능)
- 리팩토링 전후 동작 비교 테스트
- 카나리 배포로 점진적 롤아웃

### 리스크 2: 시간 부족 (다른 업무 우선)

**확률:** 높음
**영향:** 중간
**대응책:**

- Track C를 먼저 완료 (자동화로 시간 절약)
- 새 기능 개발 시 해당 파일 개선 병행
- 스프린트당 20% 리팩토링 시간 할당

### 리스크 3: 접근성 수정 후 UI 깨짐

**확률:** 중간
**영향:** 높음
**대응책:**

- Storybook으로 컴포넌트별 검증
- 시각적 회귀 테스트 (Chromatic)
- QA 단계에서 스크린 리더 테스트

### 리스크 4: 팀 저항 (기존 코드 건드리기 꺼려함)

**확률:** 중간
**영향:** 중간
**대응책:**

- SonarQube 대시보드로 개선 효과 가시화
- 작은 성공(Quick Win)으로 신뢰 구축
- 페어 프로그래밍으로 지식 공유

---

## 📈 성공 측정 지표

### 코드 품질 지표

| 지표             | 현재 | 1개월 후 | 3개월 후 | 목표 |
| ---------------- | ---- | -------- | -------- | ---- |
| 총 이슈          | 541  | 300      | 100      | 50   |
| CRITICAL/BLOCKER | 12   | 0        | 0        | 0    |
| 접근성 이슈      | 198  | 0        | 0        | 0    |
| 테스트 커버리지  | 0%   | 20%      | 80%      | 80%+ |
| 중복 코드        | 7.4% | 5%       | 3%       | <3%  |
| 평균 복잡도      | 15+  | 12       | 10       | <10  |

### 개발 생산성 지표

| 지표                | 현재    | 목표  |
| ------------------- | ------- | ----- |
| PR 리뷰 시간        | 2-3시간 | 1시간 |
| 버그 발생률         | -       | -50%  |
| 신규 기능 개발 속도 | -       | +30%  |
| 온보딩 시간         | -       | -50%  |

### 비즈니스 영향

- 접근성 준수 → 법적 리스크 제거 → 소송 비용 0원
- 코드 품질 향상 → 유지보수 비용 감소 → 개발 속도 증가
- 테스트 커버리지 → 버그 감소 → 고객 만족도 증가

---

## 🔧 도구 및 리소스

### 필수 도구

```json
{
  "devDependencies": {
    "@typescript-eslint/eslint-plugin": "^6.0.0",
    "eslint-plugin-jsx-a11y": "^6.8.0",
    "eslint-plugin-react-hooks": "^4.6.0",
    "husky": "^8.0.3",
    "lint-staged": "^15.0.0",
    "@storybook/addon-a11y": "^7.5.0",
    "vitest": "^1.0.0",
    "@testing-library/react": "^14.0.0"
  }
}
```

### 참고 문서

- [SonarQube 룰 가이드](https://rules.sonarsource.com/typescript)
- [WCAG 2.1 가이드라인](https://www.w3.org/WAI/WCAG21/quickref/)
- [React Testing Library 모범 사례](https://testing-library.com/docs/react-testing-library/intro/)
- [Cognitive Complexity 백서](https://www.sonarsource.com/docs/CognitiveComplexity.pdf)

### 자동화 스크립트 예시

```typescript
// scripts/fix-accessibility.ts
import { glob } from 'glob';
import fs from 'fs';

// <div onClick> → <button> 자동 변환
const files = await glob('src/**/*.tsx');
files.forEach((file) => {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/<div([^>]*)onClick={([^}]+)}([^>]*)>/g, '<button$1onClick={$2}$3>');
  fs.writeFileSync(file, content);
});
```

---

## 💡 핵심 원칙

1. **작은 단계로 (Small Steps)**
   - 한 번에 하나의 문제만 해결
   - 커밋은 작게, 자주
   - PR은 리뷰 가능한 크기로

2. **안전하게 (Safety First)**
   - 테스트 없이 복잡한 리팩토링 금지
   - Git bisect 가능하도록 커밋 유지
   - 카나리 배포로 위험 분산

3. **자동화 우선 (Automate First)**
   - 수동 작업은 실수 발생
   - ESLint, Prettier, Husky로 자동화
   - CI/CD로 품질 게이트 강제

4. **측정 가능하게 (Measure Everything)**
   - SonarQube 대시보드 매일 확인
   - 커버리지 추이 모니터링
   - 개선 효과를 데이터로 증명

5. **점진적으로 (Boy Scout Rule)**
   - 모든 파일을 한꺼번에 고치려 하지 말 것
   - 수정하는 파일만 조금씩 개선
   - 3-4개월에 걸쳐 자연스럽게 개선

---

## 🎉 예상 결과

### 3개월 후

- ✅ CRITICAL/BLOCKER 이슈 0개
- ✅ 접근성 100% 준수 (WCAG 2.1 AA)
- ✅ 테스트 커버리지 80%+
- ✅ 중복 코드 3% 이하
- ✅ 새로운 이슈 자동 차단 (CI/CD)

### 6개월 후

- ✅ 전체 이슈 50개 이하
- ✅ SonarQube Quality Gate A등급
- ✅ 개발 속도 30% 향상
- ✅ 버그 발생률 50% 감소
- ✅ 신규 개발자 온보딩 시간 50% 단축

---

**다음 단계: 오늘 당장 Track C (자동화 설정)부터 시작하세요!**

```bash
# 지금 바로 실행
npm install -D husky lint-staged eslint-plugin-jsx-a11y
npx husky install
```
