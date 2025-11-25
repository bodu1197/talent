# 코드 품질 개선 전략 V2 (재스캔 후)

**작성일**: 2025-11-25
**기준**: SonarQube 재스캔 결과 (500개 이슈)
**목표**: BLOCKER/CRITICAL 0개, MAJOR 50% 감소

---

## 🎯 전략 개요

### V1 대비 변화

- **V1 결과**: 541개 → 500개 (-41개, 7.6% 감소) ✅
- **V1 완료**: Track C (자동화), 간단한 패턴 이슈
- **V2 목표**: 고위험 이슈 + 반복 패턴 집중 공략

### 핵심 방침

1. **긴급도 우선**: BLOCKER → CRITICAL → MAJOR
2. **효율성 우선**: 패턴 기반 일괄 수정
3. **자동화 활용**: ESLint 자동 수정 최대 활용
4. **점진적 개선**: 매 단계마다 커밋 & 스캔

---

## 📋 Phase 1: BLOCKER 제거 (2개)

### 목표

🎯 **BLOCKER 0개** (현재 2개)

### 작업 내역

#### Task 1.1: service-helpers.ts 함수 수정

- **파일**: `src/lib/supabase/queries/service-helpers.ts`
- **문제**: 2개 함수가 항상 같은 값 반환
- **규칙**: typescript:S3516
- **작업**:
  1. 파일 읽기 및 문제 함수 식별
  2. 로직 분석 (실제 사용되는지, 제거 가능한지)
  3. 옵션:
     - A) 불필요한 함수 → 삭제
     - B) 실제 로직 구현 필요 → 구현
     - C) 조건부 반환 → 수정
  4. 테스트 및 빌드 확인

**예상 시간**: 30분
**우선순위**: ⚠️ **최우선**

### 완료 조건

- [ ] service-helpers.ts BLOCKER 2개 수정
- [ ] 빌드 성공
- [ ] 커밋: "fix(blocker): resolve functions always returning same value"
- [ ] 스캔 확인: BLOCKER 0개

---

## 📋 Phase 2: CRITICAL 복잡도 개선 (10개)

### 목표

🎯 **CRITICAL 5개 이하** (현재 10개)

### 우선순위별 작업

#### Task 2.1: template-generator.ts (복잡도 45 → 15)

- **파일**: `src/lib/template-generator.ts:134`
- **현재 복잡도**: 45 (허용치의 300%)
- **전략**:
  1. 함수 분리 (Extract Function)
  2. Switch문 → 객체 매핑
  3. Early return 패턴
  4. 조건문 중첩 감소

**예상 시간**: 1시간
**우선순위**: 1순위

#### Task 2.2: services.ts 쿼리 함수 (3개)

- **파일**: `src/lib/supabase/queries/services.ts`
- **복잡도**: 28, 21, 16
- **전략**:
  1. 쿼리 빌더 함수 분리
  2. 필터 로직 모듈화
  3. 타입 가드 함수 추출

**예상 시간**: 1.5시간
**우선순위**: 2순위

#### Task 2.3: 나머지 복잡도 이슈 (6개)

- auth/register/page.tsx (23)
- chat/ChatListClient.tsx (18)
- api/chat/rooms/route.ts (18)
- 기타 3개 (17, 17, 16)

**전략**: 파일별 개별 리팩토링
**예상 시간**: 3시간
**우선순위**: 3순위

### 완료 조건

- [ ] template-generator.ts 복잡도 15 이하
- [ ] services.ts 3개 함수 복잡도 15 이하
- [ ] 기타 CRITICAL 이슈 최소 3개 수정
- [ ] 전체 CRITICAL 5개 이하 달성
- [ ] 커밋: "refactor(critical): reduce cognitive complexity"

---

## 📋 Phase 3: React Hooks 의존성 (152개)

### 목표

🎯 **React Hooks 이슈 50개 이하** (67% 감소)

### 전략

#### Step 3.1: ESLint 자동 수정

```bash
# 1. ESLint 규칙 활성화 (.eslintrc.json)
{
  "rules": {
    "react-hooks/exhaustive-deps": "error"
  }
}

# 2. 자동 수정 실행
npx eslint src --ext .ts,.tsx --fix

# 3. 빌드 테스트
npm run build
```

**예상 효과**: 50-70개 자동 수정 (33-46%)

#### Step 3.2: 수동 검토 필요한 케이스

자동 수정 후 남은 이슈:

- 의도적으로 빈 배열인 경우 → `eslint-disable-next-line` 주석
- 복잡한 의존성 → 함수 분리 후 재구성
- 무한 루프 위험 → useCallback/useMemo 활용

**예상 시간**: 2시간

### Top 5 파일 집중 공략

1. **advertising/page.tsx** (26개) - Hooks 많음
2. **SellerRegisterClient.tsx** (21개) - 다단계 폼
3. **page.tsx** (20개) - 메인 페이지
4. **admin/users/page.tsx** (16개) - 관리자
5. **SellerProfileClient.tsx** (16개) - 프로필

이 5개 파일만 수정 → **99개 이슈 해결 가능**

### 완료 조건

- [ ] ESLint 규칙 활성화
- [ ] 자동 수정 실행 및 테스트
- [ ] Top 5 파일 수동 검토
- [ ] React Hooks 이슈 50개 이하
- [ ] 커밋: "fix(hooks): add missing dependencies"

---

## 📋 Phase 4: 패턴 기반 일괄 수정

### 목표

🎯 **MAJOR 이슈 200개 이하** (현재 315개, 36% 감소)

### 4.1 Boolean 렌더링 (44개) - typescript:S6759

#### 문제 패턴

```tsx
// ❌ Bad
{
  isLoading && <Spinner />;
}

// ✅ Good
{
  isLoading ? <Spinner /> : null;
}
```

#### 수정 방법

```bash
# 패턴 찾기
grep -r "&&.*<" src --include="*.tsx"

# 수동 수정 또는 스크립트 활용
```

**예상 시간**: 1시간

### 4.2 중첩 삼항 연산자 (40개) - typescript:S3358

#### 문제 패턴

```tsx
// ❌ Bad
const result = a ? b : c ? d : e;

// ✅ Good
let result;
if (a) {
  result = b;
} else if (c) {
  result = d;
} else {
  result = e;
}
```

**예상 시간**: 1.5시간

### 4.3 Array Index Keys (40개) - typescript:S6479

#### 현황

✅ 이미 일부 수정됨 (skeleton loaders)
⚠️ 40개 남음

#### 수정 방법

```bash
# 패턴 찾기
grep -r "key={.*index" src --include="*.tsx"
grep -r "key={i}" src --include="*.tsx"

# UUID 또는 고유 ID 사용
```

**예상 시간**: 1시간

### 4.4 Semantic HTML (25개) - typescript:S6819

#### 문제 패턴

```tsx
// ❌ Bad
<div role="button" onClick={...}>

// ✅ Good
<button onClick={...}>
```

**예상 시간**: 45분

### 완료 조건

- [ ] Boolean 렌더링 44개 수정
- [ ] 중첩 삼항 연산자 40개 수정
- [ ] Array index keys 40개 수정
- [ ] Semantic HTML 25개 수정
- [ ] MAJOR 이슈 200개 이하
- [ ] 커밋: "refactor(major): fix common patterns"

---

## 📋 Phase 5: 파일별 집중 개선

### 목표

🎯 **Top 10 파일 이슈 5개 이하**

### 작업 계획

| 파일                     | 현재 | 목표 | 주요 작업         |
| ------------------------ | ---- | ---- | ----------------- |
| advertising/page.tsx     | 26   | 5    | Hooks + 복잡도    |
| SellerRegisterClient.tsx | 21   | 5    | Hooks + 폼 로직   |
| page.tsx                 | 20   | 5    | Hooks + 렌더링    |
| admin/users/page.tsx     | 16   | 5    | 복잡도 + 타입     |
| SellerProfileClient.tsx  | 16   | 5    | Hooks + 상태 관리 |

**예상 시간**: 4시간 (파일당 45분)

### 완료 조건

- [ ] Top 5 파일 이슈 5개 이하
- [ ] 빌드 및 테스트 통과
- [ ] 커밋: "refactor: improve top issue files"

---

## 🔄 작업 흐름

### 각 Phase 완료 후

1. ✅ 변경사항 커밋
2. 🏗️ `npm run build` 실행 및 확인
3. 🧪 `npm test` 실행 (있는 경우)
4. 📊 `npm run sonar:local` 재스캔
5. 📈 진행상황 분석
6. 📝 다음 Phase 진행

### 커밋 메시지 규칙

```
fix(blocker): [설명]    # BLOCKER 수정
refactor(critical): [설명]  # CRITICAL 수정
fix(hooks): [설명]      # React Hooks
refactor(major): [설명]    # MAJOR 패턴 수정
```

---

## 📊 예상 결과

### Phase별 목표

| Phase    | 대상        | 현재    | 목표     | 감소           |
| -------- | ----------- | ------- | -------- | -------------- |
| Phase 1  | BLOCKER     | 2       | 0        | -2 (100%)      |
| Phase 2  | CRITICAL    | 10      | 5        | -5 (50%)       |
| Phase 3  | React Hooks | 152     | 50       | -102 (67%)     |
| Phase 4  | MAJOR 패턴  | 149     | 50       | -99 (66%)      |
| Phase 5  | Top 파일    | 99      | 25       | -74 (75%)      |
| **합계** | **전체**    | **500** | **~218** | **-282 (56%)** |

### 최종 목표 (V2 완료 후)

- 🎯 **총 이슈**: 500 → 220개 이하 (56% 감소)
- 🎯 **BLOCKER**: 0개
- 🎯 **CRITICAL**: 5개 이하
- 🎯 **MAJOR**: 150개 이하

---

## 🚀 즉시 시작 가능한 작업

### 지금 바로 시작

1. **Phase 1 - Task 1.1**: service-helpers.ts BLOCKER 수정
   - 파일 읽기
   - 문제 함수 분석
   - 수정 적용
   - 커밋 & 푸시

**예상 시간**: 30분
**명령어**:

```bash
# 1. 파일 확인
cat src/lib/supabase/queries/service-helpers.ts

# 2. 수정 후
npm run build

# 3. 커밋
git add src/lib/supabase/queries/service-helpers.ts
git commit -m "fix(blocker): resolve functions always returning same value (typescript:S3516)"
git push origin master
```

---

## 📝 성공 지표

### Phase 1-2 완료 기준

- ✅ BLOCKER 0개
- ✅ CRITICAL 5개 이하
- ✅ 빌드 성공
- ✅ 기능 정상 동작

### Phase 3-4 완료 기준

- ✅ React Hooks 50개 이하
- ✅ MAJOR 200개 이하
- ✅ ESLint 에러 0개
- ✅ 주요 페이지 동작 확인

### V2 전체 완료 기준

- ✅ 총 이슈 220개 이하
- ✅ BLOCKER/CRITICAL 5개 이하
- ✅ 코드 리뷰 통과
- ✅ 프로덕션 배포 준비 완료

---

**작성자**: Claude Code
**승인 필요**: Yes
**시작 전 확인사항**:

- [ ] 현재 코드 백업 완료
- [ ] Git 브랜치 정리
- [ ] 충분한 작업 시간 확보
- [ ] SonarQube 서버 정상 동작 확인
