# SonarQube 완전 자동화 분석 스크립트
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "SonarQube 코드 품질 자동 분석" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 1단계: SonarQube 인증 정보 설정
Write-Host "[1/6] SonarQube 인증 정보 설정 중..." -ForegroundColor Yellow
$env:SONARQUBE_URL = "http://localhost:9000"
$env:SONARQUBE_USERNAME = "admin"
$env:SONARQUBE_PASSWORD = "admin"
Write-Host "✅ 인증 정보 설정 완료" -ForegroundColor Green
Write-Host ""

# 2단계: SonarQube 서버 상태 확인
Write-Host "[2/6] SonarQube 서버 상태 확인 중..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:9000/api/system/status" -UseBasicParsing -ErrorAction Stop
    $status = ($response.Content | ConvertFrom-Json).status
    Write-Host "✅ SonarQube 서버 상태: $status" -ForegroundColor Green
} catch {
    Write-Host "❌ SonarQube 서버에 연결할 수 없습니다!" -ForegroundColor Red
    Write-Host "   http://localhost:9000 이 실행 중인지 확인하세요." -ForegroundColor Yellow
    exit 1
}
Write-Host ""

# 3단계: 프로젝트 등록 여부 확인
Write-Host "[3/6] 프로젝트 등록 여부 확인 중..." -ForegroundColor Yellow
$projectKey = "talent"
try {
    $authHeader = "Basic " + [Convert]::ToBase64String([Text.Encoding]::ASCII.GetBytes("admin:admin"))
    $headers = @{
        "Authorization" = $authHeader
    }
    $projectsResponse = Invoke-RestMethod -Uri "http://localhost:9000/api/projects/search?projects=$projectKey" -Headers $headers -ErrorAction Stop
    
    if ($projectsResponse.components.Count -gt 0) {
        Write-Host "✅ 프로젝트 '$projectKey' 이미 등록되어 있습니다" -ForegroundColor Green
    } else {
        Write-Host "⚠️  프로젝트 '$projectKey' 미등록 상태" -ForegroundColor Yellow
        Write-Host "   프로젝트를 먼저 등록해야 합니다." -ForegroundColor Yellow
        Write-Host ""
        Write-Host "   1. http://localhost:9000 접속" -ForegroundColor Cyan
        Write-Host "   2. 'Create Project' 클릭" -ForegroundColor Cyan
        Write-Host "   3. Project Key: talent" -ForegroundColor Cyan
        Write-Host "   4. Display Name: AI Talent Hub" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "   등록 후 이 스크립트를 다시 실행하세요." -ForegroundColor Yellow
        exit 0
    }
} catch {
    Write-Host "❌ 프로젝트 확인 실패: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# 4단계: sonar-scanner 설치 확인
Write-Host "[4/6] sonar-scanner 설치 확인 중..." -ForegroundColor Yellow
$scannerExists = Get-Command sonar-scanner -ErrorAction SilentlyContinue
if (-not $scannerExists) {
    Write-Host "⚠️  sonar-scanner가 설치되어 있지 않습니다" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "   설치 방법:" -ForegroundColor Cyan
    Write-Host "   1. Chocolatey 사용: choco install sonarscanner" -ForegroundColor White
    Write-Host "   2. NPM 사용: npm install -g sonarqube-scanner" -ForegroundColor White
    Write-Host ""
    Write-Host "   또는 수동 다운로드:" -ForegroundColor Cyan
    Write-Host "   https://docs.sonarqube.org/latest/analysis/scan/sonarscanner/" -ForegroundColor White
    Write-Host ""
    exit 0
}
Write-Host "✅ sonar-scanner 설치됨" -ForegroundColor Green
Write-Host ""

# 5단계: SonarQube 분석 실행
Write-Host "[5/6] SonarQube 코드 분석 실행 중..." -ForegroundColor Yellow
Write-Host "   이 작업은 몇 분 걸릴 수 있습니다..." -ForegroundColor Yellow
Write-Host ""

sonar-scanner `
    -Dsonar.projectKey=talent `
    -Dsonar.projectName="AI Talent Hub" `
    -Dsonar.sources=src `
    -Dsonar.host.url=http://localhost:9000 `
    -Dsonar.login=admin `
    -Dsonar.password=admin `
    -Dsonar.javascript.lcov.reportPaths=coverage/lcov.info `
    -Dsonar.typescript.lcov.reportPaths=coverage/lcov.info `
    -Dsonar.exclusions="**/*.test.ts,**/*.test.tsx,**/node_modules/**,**/.next/**,**/coverage/**"

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ SonarQube 분석 완료!" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "❌ SonarQube 분석 실패" -ForegroundColor Red
    exit 1
}
Write-Host ""

# 6단계: 결과 확인 안내
Write-Host "[6/6] 분석 결과 확인" -ForegroundColor Yellow
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "✅ 모든 작업 완료!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "분석 결과 확인:" -ForegroundColor Yellow
Write-Host "  http://localhost:9000/dashboard?id=talent" -ForegroundColor Cyan
Write-Host ""
Write-Host "확인할 수 있는 정보:" -ForegroundColor Yellow
Write-Host "  ✓ 코드 품질 (버그, 취약점, 코드 스멜)" -ForegroundColor White
Write-Host "  ✓ 보안 취약점" -ForegroundColor White
Write-Host "  ✓ 테스트 커버리지" -ForegroundColor White
Write-Host "  ✓ 중복 코드 비율" -ForegroundColor White
Write-Host ""
