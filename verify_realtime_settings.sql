-- Realtime 설정 확인 쿼리
SELECT
  schemaname,
  tablename,
  'Realtime ENABLED ✅' as status
FROM pg_publication_tables
WHERE pubname = 'supabase_realtime'
ORDER BY tablename;
