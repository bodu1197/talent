# SonarQube Docker 컨테이너 충돌 해결 스크립트
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "SonarQube Docker 컨테이너 자동 정리 및 재시작" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 1단계: 기존 컨테이너 확인
Write-Host "[1/5] 기존 SonarQube 컨테이너 확인 중..." -ForegroundColor Yellow
docker ps -a --filter "name=sonarqube"

# 2단계: 기존 컨테이너 중지
Write-Host ""
Write-Host "[2/5] 기존 컨테이너 중지 중..." -ForegroundColor Yellow
docker stop sonarqube-db sonarqube sonarqube-talent 2>$null
Write-Host "컨테이너 중지 완료" -ForegroundColor Green

# 3단계: 기존 컨테이너 삭제
Write-Host ""
Write-Host "[3/5] 기존 컨테이너 삭제 중..." -ForegroundColor Yellow
docker rm sonarqube-db sonarqube sonarqube-talent 2>$null
Write-Host "컨테이너 삭제 완료" -ForegroundColor Green

# 4단계: 네트워크 정리 (선택사항)
Write-Host ""
Write-Host "[4/5] Docker 네트워크 정리 중..." -ForegroundColor Yellow
docker network rm talent_sonarnet sonarnet 2>$null
Write-Host "네트워크 정리 완료" -ForegroundColor Green

# 5단계: docker-compose로 SonarQube 재시작
Write-Host ""
Write-Host "[5/5] SonarQube 컨테이너 재시작 중..." -ForegroundColor Yellow
Set-Location "C:\Users\ohyus\talent"
docker-compose up -d

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "✅ 완료!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "SonarQube가 시작되고 있습니다. 약 1-2분 기다린 후:" -ForegroundColor Yellow
Write-Host "http://localhost:9000 에서 접속하세요" -ForegroundColor Yellow
Write-Host ""
Write-Host "기본 로그인 정보:" -ForegroundColor Cyan
Write-Host "  - 사용자명: admin" -ForegroundColor White
Write-Host "  - 비밀번호: admin" -ForegroundColor White
Write-Host ""
Write-Host "로그 확인 명령어:" -ForegroundColor Cyan
Write-Host "  docker logs -f sonarqube-talent" -ForegroundColor White
Write-Host ""

# 컨테이너 상태 확인
Write-Host "현재 실행 중인 컨테이너:" -ForegroundColor Cyan
docker ps --filter "name=sonarqube"
