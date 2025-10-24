-- =====================================================
-- 누락된 테이블 추가 마이그레이션
-- 날짜: 2024-10-24
-- 설명: seller_profiles, ai_services 테이블 생성
-- =====================================================

-- 1. seller_profiles 테이블 생성 (판매자 프로필)
CREATE TABLE IF NOT EXISTS seller_profiles (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  business_name VARCHAR(255),
  description TEXT,
  rating DECIMAL(3,2) DEFAULT 0.00 CHECK (rating >= 0 AND rating <= 5),
  total_reviews INTEGER DEFAULT 0 CHECK (total_reviews >= 0),
  total_sales INTEGER DEFAULT 0 CHECK (total_sales >= 0),
  response_time VARCHAR(50), -- 예: "1시간 이내", "30분 이내"
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- seller_profiles 인덱스
CREATE INDEX idx_seller_profiles_rating ON seller_profiles(rating DESC);
CREATE INDEX idx_seller_profiles_total_sales ON seller_profiles(total_sales DESC);
CREATE INDEX idx_seller_profiles_is_verified ON seller_profiles(is_verified);

-- seller_profiles 코멘트
COMMENT ON TABLE seller_profiles IS '판매자 프로필 정보 테이블';
COMMENT ON COLUMN seller_profiles.user_id IS '사용자 ID (users 테이블 참조)';
COMMENT ON COLUMN seller_profiles.business_name IS '비즈니스명 또는 상호';
COMMENT ON COLUMN seller_profiles.description IS '판매자 소개';
COMMENT ON COLUMN seller_profiles.rating IS '평균 평점 (0.00 ~ 5.00)';
COMMENT ON COLUMN seller_profiles.total_reviews IS '총 리뷰 수';
COMMENT ON COLUMN seller_profiles.total_sales IS '총 판매 건수';
COMMENT ON COLUMN seller_profiles.response_time IS '평균 응답 시간';
COMMENT ON COLUMN seller_profiles.is_verified IS '인증 여부';

-- =====================================================

-- 2. ai_services 테이블 생성 (AI 서비스 추가 정보)
CREATE TABLE IF NOT EXISTS ai_services (
  service_id UUID PRIMARY KEY REFERENCES services(id) ON DELETE CASCADE,
  ai_tool VARCHAR(255) NOT NULL, -- 예: "ChatGPT", "Midjourney", "Stable Diffusion"
  version VARCHAR(50), -- 예: "GPT-4", "v5.2"
  features TEXT[] DEFAULT '{}', -- AI 서비스 특징 배열
  sample_prompts TEXT[] DEFAULT '{}', -- 샘플 프롬프트 배열
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ai_services 인덱스
CREATE INDEX idx_ai_services_ai_tool ON ai_services(ai_tool);

-- ai_services 코멘트
COMMENT ON TABLE ai_services IS 'AI 서비스 추가 정보 테이블';
COMMENT ON COLUMN ai_services.service_id IS '서비스 ID (services 테이블 참조)';
COMMENT ON COLUMN ai_services.ai_tool IS '사용하는 AI 도구명';
COMMENT ON COLUMN ai_services.version IS 'AI 도구 버전';
COMMENT ON COLUMN ai_services.features IS 'AI 서비스 특징 목록';
COMMENT ON COLUMN ai_services.sample_prompts IS '샘플 프롬프트 목록';

-- =====================================================
-- 3. Row Level Security (RLS) 정책 설정
-- =====================================================

-- RLS 활성화
ALTER TABLE seller_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_services ENABLE ROW LEVEL SECURITY;

-- seller_profiles RLS 정책
CREATE POLICY "seller_profiles_select_policy"
  ON seller_profiles FOR SELECT
  USING (true);

CREATE POLICY "seller_profiles_insert_policy"
  ON seller_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "seller_profiles_update_policy"
  ON seller_profiles FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "seller_profiles_delete_policy"
  ON seller_profiles FOR DELETE
  USING (auth.uid() = user_id);

-- ai_services RLS 정책
CREATE POLICY "ai_services_select_policy"
  ON ai_services FOR SELECT
  USING (true);

CREATE POLICY "ai_services_insert_policy"
  ON ai_services FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM services
      WHERE services.id = service_id
      AND services.seller_id = auth.uid()
    )
  );

CREATE POLICY "ai_services_update_policy"
  ON ai_services FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM services
      WHERE services.id = service_id
      AND services.seller_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM services
      WHERE services.id = service_id
      AND services.seller_id = auth.uid()
    )
  );

CREATE POLICY "ai_services_delete_policy"
  ON ai_services FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM services
      WHERE services.id = service_id
      AND services.seller_id = auth.uid()
    )
  );

-- =====================================================
-- 4. 트리거 함수 생성 (updated_at 자동 업데이트)
-- =====================================================

-- updated_at 자동 업데이트 함수
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- seller_profiles 트리거
CREATE TRIGGER update_seller_profiles_updated_at
  BEFORE UPDATE ON seller_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ai_services 트리거
CREATE TRIGGER update_ai_services_updated_at
  BEFORE UPDATE ON ai_services
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 5. 샘플 데이터 (선택사항 - 필요시 주석 해제)
-- =====================================================

-- 샘플 seller_profiles 데이터
/*
INSERT INTO seller_profiles (user_id, business_name, description, rating, total_reviews, total_sales, response_time, is_verified)
VALUES
  ('user-uuid-here', 'AI 전문가', 'ChatGPT와 Midjourney를 활용한 AI 서비스 전문가입니다.', 4.8, 150, 230, '30분 이내', true);
*/

-- 샘플 ai_services 데이터
/*
INSERT INTO ai_services (service_id, ai_tool, version, features, sample_prompts)
VALUES
  ('service-uuid-here', 'ChatGPT', 'GPT-4',
   ARRAY['고품질 프롬프트 작성', '다국어 지원', '맞춤형 AI 솔루션'],
   ARRAY['블로그 포스트 작성 프롬프트', '제품 설명 생성 프롬프트', '코드 리뷰 프롬프트']);
*/

-- =====================================================
-- 마이그레이션 완료!
-- =====================================================