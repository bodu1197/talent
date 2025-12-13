# SonarQube MCP 완벽 설정 가이드

## 📋 개요

이 가이드는 AI Talent Hub 프로젝트에서 SonarQube MCP를 사용하여 코드 품질과 보안을 검사하는 방법을 설명합니다.

## 🎯 선택지

### 옵션 1: SonarCloud (추천 - 무료)

클라우드 기반으로 설치 없이 사용 가능

### 옵션 2: 로컬 SonarQube (Docker)

로컬 환경에서 완전한 제어 가능

---

## 🚀 옵션 1: SonarCloud 설정 (추천)

### 1단계: SonarCloud 계정 생성

1. https://sonarcloud.io 방문
2. GitHub 계정으로 로그인
3. Organization 생성

### 2단계: 프로젝트 추가

1. "+ Analyze new project" 클릭
2. GitHub 저장소 선택 또는 수동 설정
3. Project Key 생성: `ai-talent-hub`

### 3단계: 토큰 생성

1. Account > Security > Generate Token
2. Name: `ai-talent-hub-mcp`
3. Type: `User Token`
4. 생성된 토큰 복사 (다시 볼 수 없음!)

### 4단계: 환경 변수 설정

`.env.local` 파일에 추가:

```bash
# SonarQube MCP 설정
SONARQUBE_HOST_URL=https://sonarcloud.io
SONARQUBE_TOKEN=your-token-here
SONARQUBE_ORG=your-org-name
SONARQUBE_PROJECT_KEY=ai-talent-hub
```

### 5단계: MCP 설정 확인

Claude Code의 MCP 설정 파일 확인:

```json
{
  "mcpServers": {
    "sonarqube": {
      "env": {
        "SONARQUBE_HOST_URL": "${SONARQUBE_HOST_URL}",
        "SONARQUBE_TOKEN": "${SONARQUBE_TOKEN}"
      }
    }
  }
}
```

---

## 🐳 옵션 2: 로컬 SonarQube (Docker)

### 1단계: Docker 설치 확인

```bash
docker --version
docker-compose --version
```

### 2단계: docker-compose.yml 생성

프로젝트 루트에 `docker-compose.yml` 파일 생성 (이미 생성됨):

```yaml
version: '3.8'

services:
  sonarqube:
    image: sonarqube:community
    container_name: sonarqube
    ports:
      - '9000:9000'
    environment:
      - SONAR_ES_BOOTSTRAP_CHECKS_DISABLE=true
    volumes:
      - sonarqube_data:/opt/sonarqube/data
      - sonarqube_logs:/opt/sonarqube/logs
      - sonarqube_extensions:/opt/sonarqube/extensions
    networks:
      - sonarnet

volumes:
  sonarqube_data:
  sonarqube_logs:
  sonarqube_extensions:

networks:
  sonarnet:
    driver: bridge
```

### 3단계: SonarQube 실행

```bash
docker-compose up -d
```

### 4단계: 초기 설정

1. 브라우저에서 http://localhost:9000 접속
2. 기본 로그인: admin / admin
3. 비밀번호 변경 (필수)

### 5단계: 프로젝트 생성

1. Projects > Create Project Manually
2. Project Key: `ai-talent-hub`
3. Project Name: `AI Talent Hub`
4. Main Branch: `master`

### 6단계: 토큰 생성

1. My Account > Security > Generate Token
2. Name: `mcp-token`
3. Type: `Global Analysis Token`
4. 토큰 복사

### 7단계: 환경 변수 설정

`.env.local` 파일에 추가:

```bash
# SonarQube MCP 설정
SONARQUBE_HOST_URL=http://localhost:9000
SONARQUBE_TOKEN=your-token-here
SONARQUBE_PROJECT_KEY=ai-talent-hub
```

---

## 🔍 SonarScanner 설치 및 실행

### NPM으로 설치

```bash
npm install -D sonarqube-scanner
```

### package.json에 스크립트 추가

```json
{
  "scripts": {
    "sonar": "sonar-scanner"
  }
}
```

### 스캔 실행

```bash
npm run sonar
```

---

## ✅ MCP 도구 사용 방법

### 1. 프로젝트 목록 조회

```typescript
mcp__sonarqube__projects;
```

### 2. 이슈 검색

```typescript
mcp__sonarqube__issues({
  project_key: 'ai-talent-hub',
  severities: ['CRITICAL', 'BLOCKER'],
  types: ['BUG', 'VULNERABILITY'],
});
```

### 3. 보안 취약점 검색

```typescript
mcp__sonarqube__hotspots({
  project_key: 'ai-talent-hub',
  status: 'TO_REVIEW',
});
```

### 4. 코드 품질 메트릭 조회

```typescript
mcp__sonarqube__measures_component({
  component: 'ai-talent-hub',
  metric_keys: [
    'bugs',
    'vulnerabilities',
    'code_smells',
    'coverage',
    'duplicated_lines_density',
    'security_hotspots',
  ],
});
```

### 5. Quality Gate 상태 확인

```typescript
mcp__sonarqube__quality_gate_status({
  project_key: 'ai-talent-hub',
});
```

---

## 🎯 품질 기준 (CLAUDE.md 준수)

### 필수 체크리스트

- [ ] 보안 취약점 0개
- [ ] CRITICAL/BLOCKER 버그 0개
- [ ] 코드 스멜 최소화
- [ ] 코드 커버리지 90% 이상
- [ ] 중복 코드 3% 이하
- [ ] TypeScript strict mode 준수
- [ ] any 타입 사용 금지

---

## 🔧 트러블슈팅

### 문제 1: "No SonarQube authentication configured"

**해결:** `.env.local`에 `SONARQUBE_TOKEN` 추가

### 문제 2: Connection refused

**해결:** SonarQube 서버가 실행 중인지 확인

```bash
docker ps | grep sonarqube
curl http://localhost:9000/api/system/status
```

### 문제 3: Token 인증 실패

**해결:** 토큰 권한 확인 및 재생성

---

## 📊 CI/CD 통합 (선택사항)

### GitHub Actions

`.github/workflows/sonarqube.yml`:

```yaml
name: SonarQube Analysis

on:
  push:
    branches: [main, master]
  pull_request:
    branches: [main, master]

jobs:
  sonarqube:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: SonarQube Scan
        uses: sonarsource/sonarqube-scan-action@master
        env:
          SONAR_TOKEN: ${{ secrets.SONAR_TOKEN }}
          SONAR_HOST_URL: ${{ secrets.SONAR_HOST_URL }}
```

---

## 🎓 참고 자료

- SonarCloud 공식 문서: https://docs.sonarcloud.io
- SonarQube 공식 문서: https://docs.sonarqube.org
- TypeScript 분석: https://docs.sonarqube.org/latest/analysis/languages/typescript/
