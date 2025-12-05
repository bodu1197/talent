-- 심부름 채팅 테이블 생성
-- 매칭된 심부름의 요청자와 라이더 간 실시간 채팅을 위한 테이블

-- 심부름 채팅 메시지 테이블
CREATE TABLE IF NOT EXISTS errand_chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  errand_id UUID NOT NULL REFERENCES errands(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  message_type VARCHAR(20) DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'location', 'system')),
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_errand_chat_messages_errand_id ON errand_chat_messages(errand_id);
CREATE INDEX IF NOT EXISTS idx_errand_chat_messages_sender_id ON errand_chat_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_errand_chat_messages_created_at ON errand_chat_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_errand_chat_messages_errand_unread ON errand_chat_messages(errand_id, is_read) WHERE is_read = FALSE;

-- updated_at 자동 갱신 트리거
CREATE OR REPLACE FUNCTION update_errand_chat_messages_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_update_errand_chat_messages_updated_at ON errand_chat_messages;
CREATE TRIGGER trigger_update_errand_chat_messages_updated_at
  BEFORE UPDATE ON errand_chat_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_errand_chat_messages_updated_at();

-- RLS 활성화
ALTER TABLE errand_chat_messages ENABLE ROW LEVEL SECURITY;

-- RLS 정책: 심부름 참여자만 메시지 조회 가능
CREATE POLICY "errand_chat_messages_select_policy" ON errand_chat_messages
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM errands e
      JOIN profiles p ON p.user_id = auth.uid()
      WHERE e.id = errand_chat_messages.errand_id
        AND (e.requester_id = p.id OR e.helper_id = p.id)
    )
  );

-- RLS 정책: 심부름 참여자만 메시지 작성 가능
CREATE POLICY "errand_chat_messages_insert_policy" ON errand_chat_messages
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM errands e
      JOIN profiles p ON p.user_id = auth.uid()
      WHERE e.id = errand_chat_messages.errand_id
        AND (e.requester_id = p.id OR e.helper_id = p.id)
        AND errand_chat_messages.sender_id = p.id
    )
  );

-- RLS 정책: 본인 메시지만 업데이트 가능 (읽음 처리 등)
CREATE POLICY "errand_chat_messages_update_policy" ON errand_chat_messages
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.user_id = auth.uid()
        AND errand_chat_messages.sender_id = p.id
    )
  );

-- Service Role은 모든 작업 가능
CREATE POLICY "errand_chat_messages_service_role_policy" ON errand_chat_messages
  FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

-- 읽지 않은 메시지 수를 카운트하는 함수
CREATE OR REPLACE FUNCTION get_errand_unread_count(p_errand_id UUID, p_user_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count INTEGER;
  v_profile_id UUID;
BEGIN
  -- 사용자의 profile_id 조회
  SELECT id INTO v_profile_id FROM profiles WHERE user_id = p_user_id;

  IF v_profile_id IS NULL THEN
    RETURN 0;
  END IF;

  -- 상대방이 보낸 읽지 않은 메시지 수 카운트
  SELECT COUNT(*)
  INTO v_count
  FROM errand_chat_messages
  WHERE errand_id = p_errand_id
    AND sender_id != v_profile_id
    AND is_read = FALSE;

  RETURN COALESCE(v_count, 0);
END;
$$;

-- 메시지 읽음 처리 함수
CREATE OR REPLACE FUNCTION mark_errand_messages_as_read(p_errand_id UUID, p_user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_profile_id UUID;
BEGIN
  -- 사용자의 profile_id 조회
  SELECT id INTO v_profile_id FROM profiles WHERE user_id = p_user_id;

  IF v_profile_id IS NULL THEN
    RETURN;
  END IF;

  -- 상대방이 보낸 메시지를 읽음 처리
  UPDATE errand_chat_messages
  SET is_read = TRUE
  WHERE errand_id = p_errand_id
    AND sender_id != v_profile_id
    AND is_read = FALSE;
END;
$$;

-- Realtime 활성화 (테이블의 변경사항을 실시간으로 구독 가능)
ALTER PUBLICATION supabase_realtime ADD TABLE errand_chat_messages;

-- 코멘트 추가
COMMENT ON TABLE errand_chat_messages IS '심부름 채팅 메시지 테이블 - 요청자와 라이더 간 실시간 채팅';
COMMENT ON COLUMN errand_chat_messages.errand_id IS '심부름 ID (FK)';
COMMENT ON COLUMN errand_chat_messages.sender_id IS '발신자 프로필 ID (FK)';
COMMENT ON COLUMN errand_chat_messages.message IS '메시지 내용';
COMMENT ON COLUMN errand_chat_messages.message_type IS '메시지 타입 (text, image, location, system)';
COMMENT ON COLUMN errand_chat_messages.is_read IS '읽음 여부';
