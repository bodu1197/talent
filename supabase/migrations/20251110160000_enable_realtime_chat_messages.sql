-- Enable Realtime for chat_messages table
-- This allows clients to subscribe to INSERT/UPDATE/DELETE events on chat_messages

-- Realtime을 chat_messages 테이블에 활성화
ALTER PUBLICATION supabase_realtime ADD TABLE chat_messages;

-- 확인용 쿼리 (실행 후 결과 확인)
-- SELECT schemaname, tablename FROM pg_publication_tables WHERE pubname = 'supabase_realtime';
