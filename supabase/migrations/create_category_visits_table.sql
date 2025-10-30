-- 카테고리 방문 기록 테이블 생성
CREATE TABLE IF NOT EXISTS category_visits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  category_id VARCHAR(100) NOT NULL,
  category_name VARCHAR(255) NOT NULL,
  category_slug VARCHAR(255) NOT NULL,
  visit_count INTEGER DEFAULT 1,
  last_visited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- 복합 유니크 제약조건: 한 사용자당 하나의 카테고리만 기록
  CONSTRAINT unique_user_category UNIQUE (user_id, category_id)
);

-- 인덱스 생성
CREATE INDEX idx_category_visits_user_id ON category_visits(user_id);
CREATE INDEX idx_category_visits_last_visited ON category_visits(last_visited_at DESC);
CREATE INDEX idx_category_visits_user_last_visited ON category_visits(user_id, last_visited_at DESC);

-- RLS (Row Level Security) 활성화
ALTER TABLE category_visits ENABLE ROW LEVEL SECURITY;

-- RLS 정책: 사용자는 자신의 기록만 조회 가능
CREATE POLICY "Users can view their own category visits"
  ON category_visits
  FOR SELECT
  USING (auth.uid() = user_id);

-- RLS 정책: 사용자는 자신의 기록만 삽입 가능
CREATE POLICY "Users can insert their own category visits"
  ON category_visits
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS 정책: 사용자는 자신의 기록만 업데이트 가능
CREATE POLICY "Users can update their own category visits"
  ON category_visits
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- updated_at 자동 업데이트 트리거
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_category_visits_updated_at
  BEFORE UPDATE ON category_visits
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 코멘트 추가
COMMENT ON TABLE category_visits IS '사용자의 카테고리 방문 기록을 저장하는 테이블';
COMMENT ON COLUMN category_visits.user_id IS '사용자 ID (auth.users 테이블 참조)';
COMMENT ON COLUMN category_visits.category_id IS '카테고리 ID';
COMMENT ON COLUMN category_visits.category_name IS '카테고리 이름 (1차 카테고리)';
COMMENT ON COLUMN category_visits.category_slug IS '카테고리 슬러그 (URL용)';
COMMENT ON COLUMN category_visits.visit_count IS '방문 횟수';
COMMENT ON COLUMN category_visits.last_visited_at IS '마지막 방문 시간';
