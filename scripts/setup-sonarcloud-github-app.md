# SonarCloud GitHub App 연동 가이드

## 1. SonarCloud GitHub App 설치

### 단계 1: GitHub App 설치 페이지 접속

브라우저에서 다음 URL을 열어주세요:

```
https://github.com/apps/sonarcloud
```

### 단계 2: Install/Configure 클릭

- 이미 설치되어 있다면: **Configure** 버튼 클릭
- 설치가 안 되어 있다면: **Install** 버튼 클릭

### 단계 3: 저장소 선택

- Organization/Account 선택: **bodu1197**
- Repository 권한 설정:
  - **Only select repositories** 선택
  - `talent` 저장소 선택
  - 또는 **All repositories** 선택 (모든 프로젝트에 적용)

### 단계 4: 권한 확인 및 승인

SonarCloud가 요청하는 권한:

- ✅ Read access to code
- ✅ Read and write access to checks
- ✅ Read and write access to pull requests
- ✅ Read access to metadata

**Install** 또는 **Save** 클릭

---

## 2. SonarCloud에서 프로젝트 연동

### 단계 1: SonarCloud 로그인

```
https://sonarcloud.io
```

GitHub 계정으로 로그인

### 단계 2: 프로젝트 연동 확인

```
https://sonarcloud.io/project/configuration?id=bodu1197_talent
```

또는 직접 이동:

1. 왼쪽 메뉴 → **My Projects**
2. **bodu1197_talent** 프로젝트 클릭
3. **Administration** → **General Settings**

### 단계 3: GitHub Integration 설정 확인

**Administration** → **GitHub Integration**에서:

- ✅ GitHub App이 연동되어 있는지 확인
- ✅ Repository: `bodu1197/talent` 표시 확인
- ✅ Automatic Analysis 활성화 확인

---

## 3. GitHub Actions에서 Automatic Analysis 사용

GitHub App이 연동되면 두 가지 방식 중 선택 가능:

### 옵션 A: Automatic Analysis (권장)

SonarCloud GitHub App이 자동으로 분석 실행

- **장점**: 별도의 workflow 파일 불필요, SONAR_TOKEN 불필요
- **설정**: SonarCloud → Project Settings → GitHub Integration → Enable Automatic Analysis

### 옵션 B: CI-based Analysis (현재 방식)

GitHub Actions workflow에서 수동 실행

- **장점**: 세밀한 제어 가능
- **필요**: SONAR_TOKEN secret 설정

---

## 4. SONAR_TOKEN 설정 (옵션 B 사용 시)

### 단계 1: SonarCloud 토큰 생성

```
https://sonarcloud.io/account/security
```

1. "Generate Tokens" 클릭
2. Name: `GitHub Actions - talent`
3. Type: **Project Analysis Token** 선택
4. Project: **bodu1197_talent** 선택
5. **Generate** 클릭
6. 생성된 토큰 복사 (한 번만 표시됨!)

### 단계 2: GitHub Secret 추가

```
https://github.com/bodu1197/talent/settings/secrets/actions
```

1. **New repository secret** 클릭
2. Name: `SONAR_TOKEN`
3. Secret: (복사한 토큰 붙여넣기)
4. **Add secret** 클릭

---

## 5. 연동 확인

### Push 후 확인

1. 코드 변경 후 push
2. GitHub Actions 확인:
   ```
   https://github.com/bodu1197/talent/actions
   ```
3. SonarCloud 분석 결과 확인:
   ```
   https://sonarcloud.io/project/overview?id=bodu1197_talent
   ```

### Automatic Analysis 활성화 시

- `.github/workflows/sonar.yml` 파일 삭제 가능
- SonarCloud가 자동으로 모든 push/PR 분석

---

## 문제 해결

### GitHub App 연동이 안 되는 경우

1. Organization 권한 확인
2. SonarCloud 로그아웃 후 재로그인
3. GitHub App 재설치

### SONAR_TOKEN이 작동하지 않는 경우

1. 토큰 만료 확인
2. 토큰 권한 확인 (Project Analysis Token)
3. Secret 이름 확인 (`SONAR_TOKEN` 정확히)

---

## 완료 후 확인 사항

✅ SonarCloud GitHub App 설치 완료
✅ bodu1197/talent 저장소 연동 완료
✅ Automatic Analysis 활성화 또는 SONAR_TOKEN 설정 완료
✅ 최신 분석 결과 반영 확인

현재 상태: **279개 이슈** → Phase 6 수정 후 **약 60-80개 이슈**로 감소 예상
