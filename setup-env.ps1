# PowerShell 환경 변수 영구 설정 스크립트
# 관리자 권한 없이 사용자 환경 변수에 추가합니다

Write-Host "🔧 Supabase 환경 변수 설정 중..." -ForegroundColor Cyan

# 사용자 환경 변수 설정
[System.Environment]::SetEnvironmentVariable('SUPABASE_ACCESS_TOKEN', 'sbp_753b67c2411cad6320ef44d6626ac13ee2ba6296', 'User')
[System.Environment]::SetEnvironmentVariable('SUPABASE_PROJECT_ID', 'abroivxthindezdtdzmj', 'User')

# 현재 세션에도 적용
$env:SUPABASE_ACCESS_TOKEN = 'sbp_753b67c2411cad6320ef44d6626ac13ee2ba6296'
$env:SUPABASE_PROJECT_ID = 'abroivxthindezdtdzmj'

Write-Host "✅ 환경 변수가 영구적으로 설정되었습니다!" -ForegroundColor Green
Write-Host ""
Write-Host "설정된 환경 변수:" -ForegroundColor Yellow
Write-Host "  SUPABASE_ACCESS_TOKEN = $env:SUPABASE_ACCESS_TOKEN"
Write-Host "  SUPABASE_PROJECT_ID = $env:SUPABASE_PROJECT_ID"
Write-Host ""
Write-Host "⚠️  새 터미널을 열어야 적용됩니다 (현재 터미널은 이미 적용됨)" -ForegroundColor Yellow
