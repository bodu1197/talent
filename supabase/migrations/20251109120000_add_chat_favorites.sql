-- 채팅방 즐겨찾기 테이블 생성
CREATE TABLE IF NOT EXISTS chat_favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  room_id UUID NOT NULL REFERENCES chat_rooms(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, room_id)
);

-- 인덱스 추가
CREATE INDEX IF NOT EXISTS idx_chat_favorites_user_id ON chat_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_favorites_room_id ON chat_favorites(room_id);

-- RLS 정책
ALTER TABLE chat_favorites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own favorites"
  ON chat_favorites FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own favorites"
  ON chat_favorites FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own favorites"
  ON chat_favorites FOR DELETE
  USING (auth.uid() = user_id);
