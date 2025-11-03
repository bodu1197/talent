-- ai_services 테이블 삭제
-- 사용되지 않는 테이블이므로 제거

DROP TABLE IF EXISTS ai_services CASCADE;

-- 확인
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name = 'ai_services';
-- (결과가 없어야 정상)
