-- Fix duplicate RLS policies for errand_chat_messages
-- service_role은 기본적으로 RLS를 우회하므로 별도 정책이 필요하지 않음
-- service_role_policy가 TO 절 없이 생성되어 모든 role에 대해 평가되는 문제 해결

-- 중복 정책 제거
DROP POLICY IF EXISTS "errand_chat_messages_service_role_policy" ON errand_chat_messages;

-- 결과:
-- - INSERT: errand_chat_messages_insert_policy만 남음 (심부름 참여자)
-- - SELECT: errand_chat_messages_select_policy만 남음 (심부름 참여자)
-- - UPDATE: errand_chat_messages_update_policy만 남음 (메시지 작성자)
-- - service_role: RLS 우회하므로 별도 정책 불필요

-- 검증: 정책 확인
DO $$
DECLARE
  policy_count INTEGER;
BEGIN
  SELECT COUNT(*)
  INTO policy_count
  FROM pg_policies
  WHERE tablename = 'errand_chat_messages';

  RAISE NOTICE 'Total policies for errand_chat_messages: %', policy_count;

  IF policy_count != 3 THEN
    RAISE WARNING 'Expected 3 policies (INSERT, SELECT, UPDATE) but found %', policy_count;
  END IF;
END $$;
