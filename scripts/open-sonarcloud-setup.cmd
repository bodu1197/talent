@echo off
chcp 65001 > nul
echo ========================================
echo SonarCloud GitHub App 연동 자동 설정
echo ========================================
echo.
echo [1/5] GitHub App 설치 페이지 열기...
start https://github.com/apps/sonarcloud/installations/new
timeout /t 3 /nobreak > nul

echo.
echo 브라우저에서 다음 작업을 수행하세요:
echo   1. bodu1197 계정 선택
echo   2. 'Only select repositories' 선택
echo   3. 'talent' 저장소 선택
echo   4. 'Install' 버튼 클릭
echo.
pause

echo.
echo [2/5] SonarCloud 프로젝트 페이지 열기...
start https://sonarcloud.io/project/overview?id=bodu1197_talent
timeout /t 2 /nobreak > nul

echo.
echo [3/5] SonarCloud Administration 페이지 열기...
start https://sonarcloud.io/project/configuration?id=bodu1197_talent
timeout /t 2 /nobreak > nul

echo.
echo [4/5] GitHub Secrets 설정 페이지 열기...
start https://github.com/bodu1197/talent/settings/secrets/actions
timeout /t 2 /nobreak > nul

echo.
echo [5/5] SonarCloud Token 생성 페이지 열기...
start https://sonarcloud.io/account/security
timeout /t 2 /nobreak > nul

echo.
echo ========================================
echo 설정 완료 안내
echo ========================================
echo.
echo 옵션 A: Automatic Analysis (권장)
echo   - SonarCloud에서 Automatic Analysis 활성화
echo   - SONAR_TOKEN 불필요
echo   - 자동으로 모든 push 분석
echo.
echo 옵션 B: GitHub Actions
echo   1. SonarCloud에서 토큰 생성
echo   2. GitHub Secrets에 SONAR_TOKEN 추가
echo.
echo ========================================
echo.
pause
