#!/bin/bash

echo "🚀 Vercel 환경변수 업데이트 중..."
echo ""

# 1. NEXT_PUBLIC_SUPABASE_URL 업데이트
echo "📝 NEXT_PUBLIC_SUPABASE_URL 업데이트 중..."
echo "https://abroivxthindezdtdzmj.supabase.co" | vercel env rm NEXT_PUBLIC_SUPABASE_URL production preview development --yes 2>/dev/null || true
echo "https://abroivxthindezdtdzmj.supabase.co" | vercel env add NEXT_PUBLIC_SUPABASE_URL production preview development

echo ""

# 2. NEXT_PUBLIC_SUPABASE_ANON_KEY 업데이트
echo "📝 NEXT_PUBLIC_SUPABASE_ANON_KEY 업데이트 중..."
echo "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFicm9pdnh0aGluZGV6ZHRkem1qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzM5ODk3NjcsImV4cCI6MjA0OTU2NTc2N30.P-pJc-qGUYdw8z_jNmG-p8kE1TlhCpNzmYR4EBBZUBs" | vercel env rm NEXT_PUBLIC_SUPABASE_ANON_KEY production preview development --yes 2>/dev/null || true
echo "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFicm9pdnh0aGluZGV6ZHRkem1qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzM5ODk3NjcsImV4cCI6MjA0OTU2NTc2N30.P-pJc-qGUYdw8z_jNmG-p8kE1TlhCpNzmYR4EBBZUBs" | vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production preview development

echo ""

# 3. SUPABASE_SERVICE_ROLE_KEY 업데이트
echo "📝 SUPABASE_SERVICE_ROLE_KEY 업데이트 중..."
echo "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFicm9pdnh0aGluZGV6ZHRkem1qIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczMzk4OTc2NywiZXhwIjoyMDQ5NTY1NzY3fQ.sb_secret_yjCABwj3zJbfvFsJ4baU4A_4b3YUPvT" | vercel env rm SUPABASE_SERVICE_ROLE_KEY production preview development --yes 2>/dev/null || true
echo "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFicm9pdnh0aGluZGV6ZHRkem1qIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczMzk4OTc2NywiZXhwIjoyMDQ5NTY1NzY3fQ.sb_secret_yjCABwj3zJbfvFsJ4baU4A_4b3YUPvT" | vercel env add SUPABASE_SERVICE_ROLE_KEY production preview development

echo ""
echo "✅ 모든 환경변수 업데이트 완료!"
echo ""
echo "📌 다음 단계:"
echo "   1. vercel env ls 명령어로 확인"
echo "   2. Vercel 대시보드 확인: https://vercel.com/soriplays-projects/talent/settings/environment-variables"
echo "   3. 변경사항이 적용되려면 재배포 필요 (git push 또는 vercel --prod)"
echo ""
