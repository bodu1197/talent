-- 채팅방 테이블
CREATE TABLE IF NOT EXISTS chat_rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  seller_id UUID NOT NULL REFERENCES sellers(id) ON DELETE CASCADE,
  service_id UUID REFERENCES services(id) ON DELETE SET NULL,
  last_message_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  -- 한 구매자와 한 판매자 간에는 하나의 채팅방만 존재
  UNIQUE(buyer_id, seller_id)
);

-- 메시지 테이블
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES chat_rooms(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_chat_rooms_buyer_id ON chat_rooms(buyer_id);
CREATE INDEX IF NOT EXISTS idx_chat_rooms_seller_id ON chat_rooms(seller_id);
CREATE INDEX IF NOT EXISTS idx_chat_rooms_last_message_at ON chat_rooms(last_message_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_messages_room_id ON chat_messages(room_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(created_at DESC);

-- RLS 활성화
ALTER TABLE chat_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- chat_rooms RLS 정책
-- 구매자는 자신이 참여한 채팅방만 조회 가능
CREATE POLICY "Users can view their own chat rooms as buyer"
  ON chat_rooms FOR SELECT
  USING (auth.uid() = buyer_id);

-- 판매자는 자신이 참여한 채팅방만 조회 가능 (seller의 user_id와 비교)
CREATE POLICY "Users can view their own chat rooms as seller"
  ON chat_rooms FOR SELECT
  USING (
    auth.uid() IN (
      SELECT user_id FROM sellers WHERE id = chat_rooms.seller_id
    )
  );

-- 구매자는 채팅방 생성 가능
CREATE POLICY "Buyers can create chat rooms"
  ON chat_rooms FOR INSERT
  WITH CHECK (auth.uid() = buyer_id);

-- 채팅방 업데이트 (last_message_at 등)
CREATE POLICY "Users can update their chat rooms"
  ON chat_rooms FOR UPDATE
  USING (
    auth.uid() = buyer_id OR
    auth.uid() IN (
      SELECT user_id FROM sellers WHERE id = chat_rooms.seller_id
    )
  );

-- chat_messages RLS 정책
-- 채팅방 참여자만 메시지 조회 가능
CREATE POLICY "Users can view messages in their chat rooms"
  ON chat_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM chat_rooms
      WHERE chat_rooms.id = chat_messages.room_id
      AND (
        chat_rooms.buyer_id = auth.uid() OR
        chat_rooms.seller_id IN (
          SELECT id FROM sellers WHERE user_id = auth.uid()
        )
      )
    )
  );

-- 채팅방 참여자만 메시지 전송 가능
CREATE POLICY "Users can send messages in their chat rooms"
  ON chat_messages FOR INSERT
  WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
      SELECT 1 FROM chat_rooms
      WHERE chat_rooms.id = chat_messages.room_id
      AND (
        chat_rooms.buyer_id = auth.uid() OR
        chat_rooms.seller_id IN (
          SELECT id FROM sellers WHERE user_id = auth.uid()
        )
      )
    )
  );

-- 메시지 읽음 상태 업데이트
CREATE POLICY "Users can update message read status"
  ON chat_messages FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM chat_rooms
      WHERE chat_rooms.id = chat_messages.room_id
      AND (
        chat_rooms.buyer_id = auth.uid() OR
        chat_rooms.seller_id IN (
          SELECT id FROM sellers WHERE user_id = auth.uid()
        )
      )
    )
  );

-- 채팅방의 last_message_at 자동 업데이트 트리거
CREATE OR REPLACE FUNCTION update_chat_room_last_message()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE chat_rooms
  SET last_message_at = NEW.created_at,
      updated_at = NOW()
  WHERE id = NEW.room_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_chat_room_last_message
  AFTER INSERT ON chat_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_chat_room_last_message();

-- 코멘트
COMMENT ON TABLE chat_rooms IS '일대일 채팅방';
COMMENT ON TABLE chat_messages IS '채팅 메시지';
