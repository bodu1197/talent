# SonarCloud GitHub App 연동을 위한 브라우저 자동 열기 스크립트
# PowerShell 스크립트

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "SonarCloud GitHub App 연동 시작" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "[1/5] GitHub App 설치 페이지 열기..." -ForegroundColor Yellow
Start-Process "https://github.com/apps/sonarcloud/installations/new"
Start-Sleep -Seconds 3

Write-Host ""
Write-Host "브라우저에서 다음 작업을 수행하세요:" -ForegroundColor Green
Write-Host "  1. bodu1197 계정 선택" -ForegroundColor White
Write-Host "  2. 'Only select repositories' 선택" -ForegroundColor White
Write-Host "  3. 'talent' 저장소 선택" -ForegroundColor White
Write-Host "  4. 'Install' 버튼 클릭" -ForegroundColor White
Write-Host ""
Write-Host "계속하려면 아무 키나 누르세요..." -ForegroundColor Cyan
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

Write-Host ""
Write-Host "[2/5] SonarCloud 프로젝트 페이지 열기..." -ForegroundColor Yellow
Start-Process "https://sonarcloud.io/project/overview?id=bodu1197_talent"
Start-Sleep -Seconds 3

Write-Host ""
Write-Host "[3/5] SonarCloud Administration 페이지 열기..." -ForegroundColor Yellow
Start-Process "https://sonarcloud.io/project/configuration?id=bodu1197_talent"
Start-Sleep -Seconds 3

Write-Host ""
Write-Host "브라우저에서 다음 작업을 수행하세요:" -ForegroundColor Green
Write-Host "  1. SonarCloud에 GitHub로 로그인" -ForegroundColor White
Write-Host "  2. Administration → Analysis Method" -ForegroundColor White
Write-Host "  3. 'GitHub Actions' 선택" -ForegroundColor White
Write-Host "  4. 또는 'Automatic Analysis' 활성화 (권장)" -ForegroundColor White
Write-Host ""
Write-Host "계속하려면 아무 키나 누르세요..." -ForegroundColor Cyan
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

Write-Host ""
Write-Host "[4/5] GitHub Secrets 설정 페이지 열기..." -ForegroundColor Yellow
Start-Process "https://github.com/bodu1197/talent/settings/secrets/actions"
Start-Sleep -Seconds 2

Write-Host ""
Write-Host "[5/5] SonarCloud Token 생성 페이지 열기..." -ForegroundColor Yellow
Start-Process "https://sonarcloud.io/account/security"
Start-Sleep -Seconds 2

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "다음 단계:" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "GitHub Actions를 사용하는 경우 (옵션 B):" -ForegroundColor Yellow
Write-Host "  1. SonarCloud Token 페이지에서 토큰 생성" -ForegroundColor White
Write-Host "     - Name: GitHub Actions - talent" -ForegroundColor White
Write-Host "     - Type: Project Analysis Token" -ForegroundColor White
Write-Host "     - Project: bodu1197_talent" -ForegroundColor White
Write-Host "  2. 생성된 토큰 복사" -ForegroundColor White
Write-Host "  3. GitHub Secrets 페이지에서 새 Secret 추가" -ForegroundColor White
Write-Host "     - Name: SONAR_TOKEN" -ForegroundColor White
Write-Host "     - Value: (복사한 토큰)" -ForegroundColor White
Write-Host ""
Write-Host "Automatic Analysis를 사용하는 경우 (옵션 A, 권장):" -ForegroundColor Yellow
Write-Host "  - SonarCloud에서 Automatic Analysis 활성화만 하면 끝!" -ForegroundColor White
Write-Host "  - SONAR_TOKEN 불필요" -ForegroundColor White
Write-Host "  - .github/workflows/sonar.yml 파일 삭제 가능" -ForegroundColor White
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "설정 완료 후 다음 명령어 실행:" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "  git push origin master" -ForegroundColor Green
Write-Host ""
Write-Host "그러면 SonarCloud 분석이 자동 실행됩니다!" -ForegroundColor Green
Write-Host ""
