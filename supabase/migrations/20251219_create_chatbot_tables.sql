-- AI 고객지원 챗봇 데이터베이스 스키마
-- 작성일: 2025-12-19
-- 주의: 기존 chat_* 테이블과 충돌 방지를 위해 ai_support_* 접두사 사용

-- AI 고객지원 세션 테이블
CREATE TABLE IF NOT EXISTS ai_support_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_key TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- AI 고객지원 메시지 테이블
CREATE TABLE IF NOT EXISTS ai_support_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES ai_support_sessions(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- AI 지식 베이스 테이블 (FAQ)
CREATE TABLE IF NOT EXISTS ai_support_knowledge (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  keywords TEXT[] DEFAULT ARRAY[]::TEXT[],
  priority INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_ai_support_messages_session_id ON ai_support_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_ai_support_messages_created_at ON ai_support_messages(created_at);
CREATE INDEX IF NOT EXISTS idx_ai_support_sessions_user_id ON ai_support_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_support_sessions_session_key ON ai_support_sessions(session_key);
CREATE INDEX IF NOT EXISTS idx_ai_support_knowledge_category ON ai_support_knowledge(category);
CREATE INDEX IF NOT EXISTS idx_ai_support_knowledge_keywords ON ai_support_knowledge USING GIN(keywords);

-- RLS 정책
ALTER TABLE ai_support_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_support_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_support_knowledge ENABLE ROW LEVEL SECURITY;

-- ai_support_sessions 정책
DROP POLICY IF EXISTS "Users can view own ai sessions" ON ai_support_sessions;
CREATE POLICY "Users can view own ai sessions"
  ON ai_support_sessions FOR SELECT
  USING (auth.uid() = user_id OR user_id IS NULL);

DROP POLICY IF EXISTS "Users can create ai sessions" ON ai_support_sessions;
CREATE POLICY "Users can create ai sessions"
  ON ai_support_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

DROP POLICY IF EXISTS "Users can update own ai sessions" ON ai_support_sessions;
CREATE POLICY "Users can update own ai sessions"
  ON ai_support_sessions FOR UPDATE
  USING (auth.uid() = user_id OR user_id IS NULL);

-- ai_support_messages 정책
DROP POLICY IF EXISTS "Users can view ai messages from own sessions" ON ai_support_messages;
CREATE POLICY "Users can view ai messages from own sessions"
  ON ai_support_messages FOR SELECT
  USING (
    session_id IN (
      SELECT id FROM ai_support_sessions
      WHERE user_id = auth.uid() OR user_id IS NULL
    )
  );

DROP POLICY IF EXISTS "Users can create ai messages" ON ai_support_messages;
CREATE POLICY "Users can create ai messages"
  ON ai_support_messages FOR INSERT
  WITH CHECK (
    session_id IN (
      SELECT id FROM ai_support_sessions
      WHERE user_id = auth.uid() OR user_id IS NULL
    )
  );

-- ai_support_knowledge 정책 (모두 읽기 가능)
DROP POLICY IF EXISTS "Anyone can read active ai knowledge base" ON ai_support_knowledge;
CREATE POLICY "Anyone can read active ai knowledge base"
  ON ai_support_knowledge FOR SELECT
  USING (is_active = TRUE);

-- 기본 FAQ 데이터 삽입
INSERT INTO ai_support_knowledge (category, question, answer, keywords, priority) VALUES
('서비스 이용', '회원가입은 어떻게 하나요?', '우측 상단의 "로그인" 버튼을 클릭한 후, "회원가입" 탭을 선택하여 이메일 또는 소셜 로그인(Google, Kakao)으로 가입할 수 있습니다.', ARRAY['회원가입', '가입', '계정'], 10),
('서비스 이용', '판매자 등록은 어떻게 하나요?', '마이페이지에서 "판매자 등록" 메뉴를 선택하고, 본인인증 및 사업자 등록증 인증을 완료하면 서비스를 판매할 수 있습니다.', ARRAY['판매자', '등록', '서비스 등록'], 10),
('결제', '결제 방법은 무엇이 있나요?', '신용카드, 체크카드, 계좌이체, 간편결제(카카오페이, 네이버페이 등)를 지원합니다.', ARRAY['결제', '결제수단', '카드'], 9),
('결제', '환불은 어떻게 받나요?', '서비스 이용 전 취소 시 전액 환불이 가능하며, 서비스 시작 후에는 판매자와의 협의를 통해 부분 환불이 가능합니다. 마이페이지 > 구매내역에서 환불 요청을 할 수 있습니다.', ARRAY['환불', '취소', '반환'], 9),
('고객지원', '문의는 어디로 하나요?', '우측 하단의 채팅 상담을 이용하시거나, help@dolpagu.com으로 이메일을 보내주세요. 영업일 기준 24시간 내 답변드립니다.', ARRAY['문의', '상담', '고객센터'], 8),
('계정', '비밀번호를 잊어버렸어요', '로그인 화면에서 "비밀번호 찾기"를 클릭하여 이메일로 재설정 링크를 받으실 수 있습니다.', ARRAY['비밀번호', '찾기', '분실'], 8)
ON CONFLICT DO NOTHING;

-- updated_at 자동 업데이트 트리거
DROP TRIGGER IF EXISTS update_ai_support_sessions_updated_at ON ai_support_sessions;
CREATE TRIGGER update_ai_support_sessions_updated_at
  BEFORE UPDATE ON ai_support_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_ai_support_knowledge_updated_at ON ai_support_knowledge;
CREATE TRIGGER update_ai_support_knowledge_updated_at
  BEFORE UPDATE ON ai_support_knowledge
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
