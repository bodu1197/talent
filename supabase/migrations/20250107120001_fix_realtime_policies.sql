-- Realtime을 위한 추가 설정

-- chat_messages 테이블에 REPLICA IDENTITY 설정
ALTER TABLE chat_messages REPLICA IDENTITY FULL;
ALTER TABLE chat_rooms REPLICA IDENTITY FULL;

-- Realtime publication 재확인 및 추가
DO $$
BEGIN
  -- chat_messages가 이미 publication에 있는지 확인
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
    AND tablename = 'chat_messages'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE chat_messages;
  END IF;

  -- chat_rooms가 이미 publication에 있는지 확인
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
    AND tablename = 'chat_rooms'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE chat_rooms;
  END IF;
END $$;

-- 코멘트
COMMENT ON TABLE chat_messages IS 'Chat messages with realtime enabled';
COMMENT ON TABLE chat_rooms IS 'Chat rooms with realtime enabled';
