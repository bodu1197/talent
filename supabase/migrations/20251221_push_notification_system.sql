-- ============================================
-- 모바일 푸시 알림 시스템
-- 작성일: 2025-12-21
-- FCM(Android) / APNS(iOS) 지원
-- ============================================

-- ============================================
-- 1. 디바이스 토큰 테이블
-- ============================================

CREATE TABLE IF NOT EXISTS user_device_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- 디바이스 정보
  device_token TEXT NOT NULL,
  platform TEXT NOT NULL CHECK (platform IN ('android', 'ios', 'web')),
  device_id TEXT, -- 고유 디바이스 식별자 (중복 등록 방지)
  device_name TEXT, -- 사용자 친화적 이름 (예: "iPhone 15 Pro")

  -- 푸시 설정
  is_active BOOLEAN DEFAULT true,
  push_enabled BOOLEAN DEFAULT true,

  -- 알림 카테고리별 설정
  notify_orders BOOLEAN DEFAULT true,
  notify_messages BOOLEAN DEFAULT true,
  notify_errands BOOLEAN DEFAULT true,
  notify_marketing BOOLEAN DEFAULT false,

  -- 메타데이터
  app_version TEXT,
  os_version TEXT,
  last_used_at TIMESTAMPTZ DEFAULT NOW(),

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- 같은 디바이스에 중복 토큰 방지
  UNIQUE(user_id, device_token)
);

-- 인덱스
CREATE INDEX idx_device_tokens_user_id ON user_device_tokens(user_id);
CREATE INDEX idx_device_tokens_active ON user_device_tokens(user_id, is_active) WHERE is_active = true;
CREATE INDEX idx_device_tokens_device_id ON user_device_tokens(device_id) WHERE device_id IS NOT NULL;

-- RLS 정책
ALTER TABLE user_device_tokens ENABLE ROW LEVEL SECURITY;

-- 사용자는 자신의 토큰만 조회/수정 가능
CREATE POLICY "users_own_tokens_select" ON user_device_tokens
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "users_own_tokens_insert" ON user_device_tokens
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users_own_tokens_update" ON user_device_tokens
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "users_own_tokens_delete" ON user_device_tokens
  FOR DELETE USING (auth.uid() = user_id);

-- 서비스 역할은 모든 토큰 접근 가능 (푸시 발송용)
CREATE POLICY "service_role_all" ON user_device_tokens
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- ============================================
-- 2. 푸시 알림 발송 로그 테이블
-- ============================================

CREATE TABLE IF NOT EXISTS push_notification_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  notification_id UUID REFERENCES notifications(id) ON DELETE SET NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  device_token_id UUID REFERENCES user_device_tokens(id) ON DELETE SET NULL,

  -- 발송 정보
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  data JSONB,

  -- 결과
  status TEXT NOT NULL CHECK (status IN ('pending', 'sent', 'delivered', 'failed', 'clicked')),
  error_message TEXT,
  fcm_message_id TEXT, -- FCM 응답 메시지 ID

  -- 시간
  sent_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  clicked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스
CREATE INDEX idx_push_logs_notification ON push_notification_logs(notification_id);
CREATE INDEX idx_push_logs_user ON push_notification_logs(user_id, created_at DESC);
CREATE INDEX idx_push_logs_status ON push_notification_logs(status) WHERE status IN ('pending', 'failed');

-- RLS
ALTER TABLE push_notification_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_own_logs" ON push_notification_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "service_role_logs" ON push_notification_logs
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- ============================================
-- 3. 알림 생성 시 푸시 발송 트리거
-- ============================================

-- 푸시 알림 발송 함수 (Edge Function 호출)
CREATE OR REPLACE FUNCTION trigger_push_notification()
RETURNS TRIGGER AS $$
DECLARE
  v_has_tokens BOOLEAN;
BEGIN
  -- 사용자에게 활성화된 디바이스 토큰이 있는지 확인
  SELECT EXISTS (
    SELECT 1 FROM user_device_tokens
    WHERE user_id = NEW.user_id
    AND is_active = true
    AND push_enabled = true
  ) INTO v_has_tokens;

  -- 토큰이 있으면 푸시 발송 예약 (pg_net으로 Edge Function 호출)
  IF v_has_tokens THEN
    -- push_notification_queue에 추가 (비동기 처리)
    INSERT INTO push_notification_queue (notification_id, user_id, created_at)
    VALUES (NEW.id, NEW.user_id, NOW())
    ON CONFLICT DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 알림 생성 시 푸시 트리거
DROP TRIGGER IF EXISTS on_notification_for_push ON notifications;
CREATE TRIGGER on_notification_for_push
  AFTER INSERT ON notifications
  FOR EACH ROW
  EXECUTE FUNCTION trigger_push_notification();

-- ============================================
-- 4. 푸시 알림 대기열 테이블 (배치 처리용)
-- ============================================

CREATE TABLE IF NOT EXISTS push_notification_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  notification_id UUID NOT NULL REFERENCES notifications(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  retry_count INTEGER DEFAULT 0,
  last_error TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  processed_at TIMESTAMPTZ,

  UNIQUE(notification_id)
);

-- 인덱스
CREATE INDEX idx_push_queue_pending ON push_notification_queue(status, created_at)
  WHERE status = 'pending';

-- RLS (서비스 역할만 접근)
ALTER TABLE push_notification_queue ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service_role_queue" ON push_notification_queue
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- ============================================
-- 5. 푸시 알림 설정 헬퍼 함수
-- ============================================

-- 알림 카테고리별 수신 여부 확인
CREATE OR REPLACE FUNCTION should_send_push(
  p_user_id UUID,
  p_notification_type TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
  v_result BOOLEAN := false;
BEGIN
  SELECT CASE
    -- 주문 관련
    WHEN p_notification_type LIKE 'order%' OR p_notification_type IN ('payment_received', 'work_completed', 'new_order')
      THEN notify_orders
    -- 메시지 관련
    WHEN p_notification_type IN ('message_new', 'new_message', 'errand_chat')
      THEN notify_messages
    -- 심부름 관련
    WHEN p_notification_type LIKE 'errand%' OR p_notification_type LIKE 'settlement%' OR p_notification_type LIKE 'withdrawal%'
      THEN notify_errands
    -- 기타 (항상 발송)
    ELSE true
  END INTO v_result
  FROM user_device_tokens
  WHERE user_id = p_user_id
  AND is_active = true
  AND push_enabled = true
  LIMIT 1;

  RETURN COALESCE(v_result, false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 6. 토큰 정리 함수 (비활성 토큰 제거)
-- ============================================

CREATE OR REPLACE FUNCTION cleanup_inactive_tokens()
RETURNS INTEGER AS $$
DECLARE
  v_deleted INTEGER;
BEGIN
  -- 30일 이상 미사용 토큰 비활성화
  UPDATE user_device_tokens
  SET is_active = false, updated_at = NOW()
  WHERE is_active = true
  AND last_used_at < NOW() - INTERVAL '30 days';

  -- 90일 이상 비활성 토큰 삭제
  DELETE FROM user_device_tokens
  WHERE is_active = false
  AND updated_at < NOW() - INTERVAL '90 days';

  GET DIAGNOSTICS v_deleted = ROW_COUNT;
  RETURN v_deleted;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 완료
-- ============================================

COMMENT ON TABLE user_device_tokens IS '사용자 디바이스 푸시 토큰 관리';
COMMENT ON TABLE push_notification_logs IS '푸시 알림 발송 로그';
COMMENT ON TABLE push_notification_queue IS '푸시 알림 발송 대기열 (비동기 처리)';
