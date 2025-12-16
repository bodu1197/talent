# SonarQube 로컬 설치 가이드 (Docker 없이)

## 1. 사전 요구사항

```bash
# Java 17 이상 필요
java -version
```

Java가 없다면:

- Windows: https://adoptium.net/temurin/releases/
- Chocolatey: `choco install temurin17`

## 2. SonarQube 다운로드

1. https://www.sonarsource.com/products/sonarqube/downloads/
2. Community Edition (무료) ZIP 다운로드
3. 압축 해제: `C:\sonarqube` (예시)

## 3. 서버 시작

```bash
# Windows
cd C:\sonarqube\bin\windows-x86-64
StartSonar.bat

# 서버 시작 대기 (1-2분)
# 로그: C:\sonarqube\logs\sonar.log
```

## 4. 초기 설정

```
1. 브라우저에서 http://localhost:9000 접속
2. 기본 로그인: admin / admin
3. 비밀번호 변경 요구됨 → 새 비밀번호 설정
```

## 5. 토큰 생성

```
1. 우측 상단 "A" (admin 아이콘) 클릭
2. "My Account" → "Security"
3. Generate Tokens:
   - Name: dolpagu-local
   - Type: Global Analysis Token
   - Expires: No expiration
4. Generate → 토큰 복사
```

## 6. 프로젝트 생성

```
1. "Create Project" → "Manually"
2. Project key: dolpagu
3. Display name: 돌파구
4. Main branch: master
5. "Set Up"
6. "Locally" 선택
7. 생성된 토큰 또는 기존 토큰 사용
```

## 7. 스캔 실행

```bash
# 환경변수 설정
set SONAR_TOKEN=your-generated-token
set SONAR_HOST_URL=http://localhost:9000

# 스캔 실행
npx sonarqube-scanner ^
  -Dsonar.projectKey=dolpagu ^
  -Dsonar.sources=. ^
  -Dsonar.host.url=http://localhost:9000 ^
  -Dsonar.token=%SONAR_TOKEN%
```

## 8. 결과 확인

- http://localhost:9000/dashboard?id=dolpagu
