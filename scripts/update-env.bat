@echo off
echo ================================
echo .env.local 파일 업데이트 중...
echo ================================
echo.

cd /d "%~dp0\.."

if exist .env.local (
    echo 기존 .env.local 백업 중...
    copy .env.local .env.local.backup >nul
    echo 백업 완료: .env.local.backup
    echo.
)

echo 새 .env.local 파일 생성 중...
(
echo # 새 Supabase 프로젝트 설정
echo NEXT_PUBLIC_SUPABASE_URL=https://abroivxthindezdtdzmj.supabase.co
echo NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFicm9pdnh0aGluZGV6ZHRkem1qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzM5ODk3NjcsImV4cCI6MjA0OTU2NTc2N30.P-pJc-qGUYdw8z_jNmG-p8kE1TlhCpNzmYR4EBBZUBs
echo.
echo SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFicm9pdnh0aGluZGV6ZHRkem1qIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczMzk4OTc2NywiZXhwIjoyMDQ5NTY1NzY3fQ.sb_secret_yjCABwj3zJbfvFsJ4baU4A_4b3YUPvT
echo.
echo # PortOne 설정
echo NEXT_PUBLIC_PORTONE_STORE_ID=store-bcdb58b4-f4c3-497e-9505-03bc67e15562
echo NEXT_PUBLIC_PORTONE_CHANNEL_KEY=channel-key-d7003da1-f5e2-434f-9f48-135dd1c2eeda
) > .env.local

echo.
echo ================================
echo ✅ .env.local 파일 업데이트 완료!
echo ================================
echo.
echo 백업 파일: .env.local.backup
echo 새 파일: .env.local
echo.
pause
