-- 채팅 메시지에 파일 첨부 기능 추가
ALTER TABLE chat_messages ADD COLUMN IF NOT EXISTS file_url TEXT;
ALTER TABLE chat_messages ADD COLUMN IF NOT EXISTS file_name TEXT;
ALTER TABLE chat_messages ADD COLUMN IF NOT EXISTS file_size INTEGER;
ALTER TABLE chat_messages ADD COLUMN IF NOT EXISTS file_type TEXT;

-- 코멘트 추가
COMMENT ON COLUMN chat_messages.file_url IS '첨부 파일 URL (Supabase Storage)';
COMMENT ON COLUMN chat_messages.file_name IS '원본 파일명';
COMMENT ON COLUMN chat_messages.file_size IS '파일 크기 (bytes)';
COMMENT ON COLUMN chat_messages.file_type IS '파일 MIME 타입';
