# AI Talent Hub - 무결점 코딩 규칙

당신은 이 프로젝트의 **무결점 코드 어시스턴트**입니다.

## ⚠️ 절대 규칙 (예외 없음!)

**모든 작업에서 설치된 MCP 도구를 반드시 사용하세요. 이것은 선택이 아닌 의무입니다.**

---

## 🔧 필수 MCP 도구 사용 규칙

### 📊 작업 시작 전 (ALWAYS)

**모든 코드 작성/수정 요청을 받으면 다음 순서로 진행:**

1. **Sequential Thinking MCP 사용 (필수)**
   - 복잡한 작업은 단계별로 분석
   - 설계 결정 전 깊은 사고 과정 거치기

2. **Filesystem MCP로 프로젝트 구조 파악 (필수)**
   - `mcp__filesystem__directory_tree` 로 전체 구조 확인
   - 관련 파일들 미리 파악
   - 패턴 학습 및 일관성 유지

3. **Next.js DevTools MCP로 문서 확인 (필수)**
   - `mcp__next-devtools__nextjs_docs` 로 최신 문서 검색
   - Next.js 16 베스트 프랙티스 확인

---

## 📋 코드 작성 중 (MANDATORY)

### 1️⃣ 코드 작성 단계

파일을 작성하거나 수정할 때:

```
🔴 필수 1. Filesystem MCP로 기존 패턴 확인
🔴 필수 2. Next.js DevTools MCP로 문서 참조
🔴 필수 3. GitHub MCP로 관련 이슈/PR 확인
```

### 2️⃣ 코드 작성 후 품질 검사 (100% 필수!)

**무조건 다음 순서대로 실행:**

```
🔴 1. ESLint MCP로 코드 품질 검사 (mcp__eslint__*)
🔴 2. TypeScript 타입 체크 (npx tsc --noEmit)
🔴 3. Test Runner MCP로 테스트 실행 (mcp__test-runner__*)
🔴 4. Prettier 포맷팅 (자동)
🔴 5. SonarQube MCP로 보안 검사 (mcp__sonarqube__*)
```

**이 중 하나라도 건너뛰면 작업 실패로 간주합니다.**

### 3️⃣ 에러 핸들링 (Sentry MCP 필수!)

**모든 async 함수와 API 호출에 Sentry 추가:**

```typescript
import * as Sentry from '@sentry/nextjs'

try {
  // 위험한 작업
} catch (error) {
  Sentry.captureException(error)
  // 에러 처리
}
```

**작성 후 Sentry MCP로 에러 추적 확인:**
- `mcp__sentry__*` 도구 사용하여 유사 에러 검색
- 기존 에러 패턴과 비교

---

## 📊 작업 완료 후 (MANDATORY CHECKS)

### 🔴 필수 체크리스트 (모두 실행!)

**아래 단계를 순서대로 100% 수행하세요:**

#### 1단계: ESLint 검사 (ESLint MCP)
```
mcp__eslint__* 도구 사용
또는 npm run lint
→ 에러 0개 확인
→ 경고도 모두 수정
```

#### 2단계: TypeScript 검사
```bash
npx tsc --noEmit
→ 타입 에러 0개 확인
→ any 타입 사용 금지
```

#### 3단계: 테스트 (Test Runner MCP)
```
mcp__test-runner__* 도구 사용
또는 npm run test:run
→ 모든 테스트 통과 확인
→ 새 코드는 테스트 필수 작성
```

#### 4단계: 보안 검사 (SonarQube MCP)
```
mcp__sonarqube__* 도구 사용
→ 보안 취약점 0개 확인
→ 코드 스멜 해결
```

#### 5단계: GitHub 확인 (GitHub MCP)
```
mcp__github__* 도구 사용
→ 관련 이슈 확인
→ PR 컨벤션 준수
```

#### 6단계: 빌드 검증
```bash
npm run build
→ 빌드 에러 0개 확인
```

**🚨 위 6단계 중 하나라도 건너뛰면 안 됩니다!**

---

## 🚨 절대 규칙

### ❌ 하지 말아야 할 것

1. **타입 any 사용 금지**
   - 대신 제네릭이나 구체적 타입 사용

2. **console.log 금지** (디버깅 후 제거)
   - 대신 적절한 로깅 라이브러리 사용

3. **주석 없는 복잡한 로직 금지**
   - 복잡한 로직은 JSDoc으로 설명

4. **테스트 없는 새 기능 금지**
   - 모든 새 기능은 최소 1개 테스트 필요

5. **에러 핸들링 없는 async/await 금지**
   - 모든 try-catch에 Sentry.captureException

### ✅ 반드시 해야 할 것

1. **TypeScript strict mode 준수**
   - 모든 타입 명시적으로 정의

2. **함수형 프로그래밍**
   - 순수 함수 우선
   - 불변성 유지

3. **접근성 (a11y)**
   - 모든 버튼에 aria-label
   - 키보드 네비게이션 지원

4. **보안**
   - XSS 방지
   - SQL Injection 방지
   - 환경변수로 비밀정보 관리

---

## 🎨 코드 스타일

### 파일 구조
```typescript
// 1. 타입 정의
interface Props {
  // ...
}

// 2. 컴포넌트/함수
export default function Component({ }: Props) {
  // 3. hooks
  // 4. 핸들러
  // 5. 렌더
}

// 6. 내부 헬퍼 함수
```

### 네이밍 컨벤션
- 컴포넌트: PascalCase
- 함수/변수: camelCase
- 상수: UPPER_SNAKE_CASE
- 타입/인터페이스: PascalCase

---

## 📊 코드 작성 후 리포트

코드를 작성한 후 다음 형식으로 요약하세요:

```
✅ 작성 완료: [파일명]

검사 결과:
- ESLint: ✓ 통과
- TypeScript: ✓ 통과
- Tests: ✓ 3개 테스트 통과
- Build: ✓ 성공

추가 작업:
- Sentry 에러 추적 추가됨
- 테스트 커버리지: 95%
```

---

## 🔧 필수 MCP 도구 사용 가이드

**모든 작업에서 다음 MCP를 반드시 사용하세요:**

### 1. Sequential Thinking MCP (사고 분석)
**언제:** 모든 복잡한 작업 시작 전
**도구:** `mcp__sequential-thinking__sequentialthinking`
**사용법:**
```
- 새 기능 설계 전
- 버그 분석 전
- 아키텍처 결정 전
- 리팩토링 계획 전
```

### 2. Filesystem MCP (구조 분석)
**언제:** 모든 파일 작업 전
**도구:**
- `mcp__filesystem__directory_tree` - 전체 구조 파악
- `mcp__filesystem__search_files` - 패턴 검색
- `mcp__filesystem__read_multiple_files` - 관련 파일 읽기
**사용법:**
```
1. 작업 시작 전 디렉토리 구조 확인
2. 유사한 파일 패턴 검색
3. 일관된 코딩 스타일 학습
```

### 3. Next.js DevTools MCP (문서 참조)
**언제:** Next.js 관련 모든 작업
**도구:**
- `mcp__next-devtools__init` - 문서 초기화
- `mcp__next-devtools__nextjs_docs` - 문서 검색
- `mcp__next-devtools__nextjs_runtime` - 런타임 정보
**사용법:**
```
1. 새 기능 전 최신 문서 확인
2. 베스트 프랙티스 참조
3. 런타임 에러 디버깅
```

### 4. ESLint MCP (코드 품질)
**언제:** 모든 코드 작성 후 (필수!)
**도구:** `mcp__eslint__*`
**사용법:**
```
1. 코드 작성 완료 후 즉시 실행
2. 모든 에러와 경고 수정
3. 자동 수정 적용
```

### 5. SonarQube MCP (보안 검사)
**언제:** 모든 PR 전 (필수!)
**도구:** `mcp__sonarqube__*`
**사용법:**
```
1. 보안 취약점 스캔
2. 코드 스멜 검사
3. 기술 부채 측정
```

### 6. GitHub MCP (버전 관리)
**언제:** 모든 PR, 이슈 작업
**도구:** `mcp__github__*`
**사용법:**
```
1. 이슈 생성/조회
2. PR 생성/리뷰
3. 브랜치 관리
```

### 7. Sentry MCP (에러 추적)
**언제:** 에러 핸들링 추가 후, 디버깅 시
**도구:** `mcp__sentry__*`
**사용법:**
```
1. 실시간 에러 조회
2. 유사 에러 패턴 분석
3. 스택트레이스 검토
```

### 8. Test Runner MCP (테스팅)
**언제:** 모든 코드 작성 후 (필수!)
**도구:** `mcp__test-runner__*`
**사용법:**
```
1. 테스트 자동 생성
2. 테스트 실행
3. 커버리지 확인
```

### 9. Memory MCP (컨텍스트 저장)
**언제:** 중요한 결정이나 패턴 발견 시
**도구:** `mcp__memory__*`
**사용법:**
```
1. 프로젝트 아키텍처 결정 저장
2. 자주 사용하는 패턴 저장
3. 팀 컨벤션 저장
```

### 10. Chrome DevTools MCP (브라우저 테스트)
**언제:** UI 개발 및 E2E 테스트
**도구:** `mcp__chrome-devtools__*`
**사용법:**
```
1. 페이지 렌더링 확인
2. 성능 측정
3. 네트워크 요청 검사
```

---

## 💡 강제 워크플로우 (반드시 따를 것!)

### 🔴 모든 새 기능/버그 수정 시:

```
1단계: Sequential Thinking MCP
   → "이 작업의 최적 접근법을 단계별로 분석"

2단계: Filesystem MCP
   → directory_tree로 구조 파악
   → search_files로 유사 코드 검색

3단계: Next.js DevTools MCP
   → nextjs_docs로 최신 문서 확인
   → 베스트 프랙티스 학습

4단계: 코드 작성
   → 일관된 패턴 유지
   → Sentry 에러 핸들링 포함

5단계: ESLint MCP
   → 코드 품질 검사
   → 모든 에러/경고 수정

6단계: TypeScript 검사
   → npx tsc --noEmit
   → 타입 에러 0개 확인

7단계: Test Runner MCP
   → 테스트 생성 및 실행
   → 커버리지 90%+ 확인

8단계: SonarQube MCP
   → 보안 취약점 스캔
   → 코드 스멜 수정

9단계: 빌드 검증
   → npm run build
   → 에러 0개 확인

10단계: GitHub MCP
   → PR 생성
   → 이슈 링크
```

**🚨 이 10단계는 필수입니다. 건너뛸 수 없습니다!**

---

## 🎯 성공 기준 (모두 필수!)

**다음 조건을 100% 만족해야 작업 완료:**

### ✅ MCP 사용 체크리스트
- [ ] Sequential Thinking MCP 사용함 (복잡한 작업 시)
- [ ] Filesystem MCP로 구조 분석함
- [ ] Next.js DevTools MCP로 문서 확인함
- [ ] ESLint MCP로 코드 검사함
- [ ] Test Runner MCP로 테스트 실행함
- [ ] SonarQube MCP로 보안 검사함
- [ ] GitHub MCP로 이슈/PR 관리함
- [ ] Sentry MCP로 에러 확인함 (해당 시)
- [ ] Memory MCP에 중요 결정 저장함

### ✅ 품질 체크리스트
- [ ] ESLint 에러 0개
- [ ] ESLint 경고 0개
- [ ] TypeScript 에러 0개
- [ ] any 타입 사용 0개
- [ ] 모든 테스트 통과
- [ ] 테스트 커버리지 90% 이상
- [ ] 빌드 성공 (에러 0개)
- [ ] Sentry 에러 핸들링 추가됨
- [ ] 보안 취약점 0개 (SonarQube)
- [ ] 코드 스멜 해결됨 (SonarQube)

### ✅ 최종 확인
- [ ] 10단계 워크플로우 완료
- [ ] 모든 MCP 도구 사용함
- [ ] Git pre-commit hooks 통과 준비됨
- [ ] PR 생성 준비 완료

---

## 📚 기술 스택

- **Framework**: Next.js 16+ (App Router)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Testing**: Vitest + Playwright
- **Error Tracking**: Sentry
- **Linting**: ESLint + Prettier
- **Type Checking**: TypeScript

---

## 🚀 프로젝트 정보

- **이름**: AI Talent Hub (AI 재능 거래 플랫폼)
- **목표**: 무결점 코드로 안정적인 서비스 제공
- **품질 기준**: 프로덕션 레벨

---

**이 규칙을 항상 따르세요. 예외는 없습니다.**
