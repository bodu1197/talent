# SonarQube MCP 인증 설정 스크립트
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "SonarQube MCP 인증 설정" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 환경 변수 설정
$env:SONARQUBE_URL = "http://localhost:9000"
$env:SONARQUBE_USERNAME = "admin"
$env:SONARQUBE_PASSWORD = "admin"

Write-Host "✅ SonarQube MCP 인증 정보 설정 완료" -ForegroundColor Green
Write-Host ""
Write-Host "설정된 환경 변수:" -ForegroundColor Yellow
Write-Host "  - SONARQUBE_URL: $env:SONARQUBE_URL" -ForegroundColor White
Write-Host "  - SONARQUBE_USERNAME: $env:SONARQUBE_USERNAME" -ForegroundColor White
Write-Host "  - SONARQUBE_PASSWORD: ****" -ForegroundColor White
Write-Host ""
Write-Host "⚠️  주의: 이 환경 변수는 현재 PowerShell 세션에서만 유효합니다." -ForegroundColor Yellow
Write-Host "   새 터미널을 열면 다시 실행해야 합니다." -ForegroundColor Yellow
Write-Host ""
Write-Host "이제 Claude Code에서 SonarQube MCP 도구를 사용할 수 있습니다!" -ForegroundColor Green
