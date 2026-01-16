-- 분쟁 시스템: 관리자 RLS 정책 및 알림 트리거
-- 작성일: 2025-12-20

-- ============================================
-- 1. 관리자 RLS 정책 추가
-- ============================================

-- 관리자 확인 함수 생성
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE user_id = auth.uid()
    AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- 기존 정책 삭제 후 재생성 (관리자 포함)
DROP POLICY IF EXISTS "disputes_select_policy" ON disputes;
DROP POLICY IF EXISTS "disputes_update_policy" ON disputes;
DROP POLICY IF EXISTS "dispute_evidences_select_policy" ON dispute_evidences;
DROP POLICY IF EXISTS "dispute_messages_select_policy" ON dispute_messages;
DROP POLICY IF EXISTS "dispute_messages_insert_policy" ON dispute_messages;

-- 분쟁 조회: 당사자 + 관리자
CREATE POLICY "disputes_select_policy" ON disputes
  FOR SELECT USING (
    auth.uid() = plaintiff_id OR
    auth.uid() = defendant_id OR
    is_admin()
  );

-- 분쟁 수정: 당사자 + 관리자
CREATE POLICY "disputes_update_policy" ON disputes
  FOR UPDATE USING (
    auth.uid() = plaintiff_id OR
    auth.uid() = defendant_id OR
    is_admin()
  );

-- 증거 조회: 당사자 + 관리자
CREATE POLICY "dispute_evidences_select_policy" ON dispute_evidences
  FOR SELECT USING (
    dispute_id IN (
      SELECT id FROM disputes
      WHERE plaintiff_id = auth.uid() OR defendant_id = auth.uid()
    ) OR is_admin()
  );

-- 메시지 조회: 당사자 + 관리자
CREATE POLICY "dispute_messages_select_policy" ON dispute_messages
  FOR SELECT USING (
    dispute_id IN (
      SELECT id FROM disputes
      WHERE plaintiff_id = auth.uid() OR defendant_id = auth.uid()
    ) OR is_admin()
  );

-- 메시지 생성: 당사자 + 관리자 (시스템 메시지)
CREATE POLICY "dispute_messages_insert_policy" ON dispute_messages
  FOR INSERT WITH CHECK (
    auth.uid() = sender_id OR
    sender_id IS NULL OR  -- 시스템 메시지
    is_admin()  -- 관리자
  );

-- ============================================
-- 2. 분쟁 알림 함수
-- ============================================

-- 분쟁 알림 생성 함수
CREATE OR REPLACE FUNCTION create_dispute_notification(
  p_user_id UUID,
  p_dispute_id UUID,
  p_title TEXT,
  p_body TEXT,
  p_notification_type TEXT DEFAULT 'dispute'
)
RETURNS UUID AS $$
DECLARE
  v_notification_id UUID;
BEGIN
  INSERT INTO notifications (
    user_id,
    type,
    title,
    body,
    data,
    is_read,
    created_at
  ) VALUES (
    p_user_id,
    p_notification_type,
    p_title,
    p_body,
    jsonb_build_object('dispute_id', p_dispute_id, 'link', '/help/dispute/' || p_dispute_id),
    false,
    NOW()
  )
  RETURNING id INTO v_notification_id;

  RETURN v_notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 3. 분쟁 생성 시 알림 트리거
-- ============================================

CREATE OR REPLACE FUNCTION notify_dispute_created()
RETURNS TRIGGER AS $$
DECLARE
  v_plaintiff_name TEXT;
  v_case_number TEXT;
BEGIN
  -- 원고 이름 조회
  SELECT name INTO v_plaintiff_name
  FROM profiles
  WHERE user_id = NEW.plaintiff_id;

  v_case_number := COALESCE(NEW.case_number, '미지정');

  -- 피고에게 알림
  PERFORM create_dispute_notification(
    NEW.defendant_id,
    NEW.id,
    '분쟁 조정 신청이 접수되었습니다',
    v_plaintiff_name || '님이 분쟁 조정을 신청했습니다. (사건번호: ' || v_case_number || ') 72시간 내에 답변해주세요.'
  );

  -- 관리자들에게 알림 (profiles에서 role='admin'인 사용자)
  INSERT INTO notifications (user_id, type, title, body, data, is_read, created_at)
  SELECT
    user_id,
    'dispute',
    '[관리자] 새 분쟁 접수',
    '사건번호 ' || v_case_number || ' - ' || NEW.dispute_type || ' 유형의 분쟁이 접수되었습니다.',
    jsonb_build_object('dispute_id', NEW.id, 'link', '/admin/disputes/' || NEW.id),
    false,
    NOW()
  FROM profiles
  WHERE role = 'admin';

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_dispute_created ON disputes;
CREATE TRIGGER on_dispute_created
  AFTER INSERT ON disputes
  FOR EACH ROW
  EXECUTE FUNCTION notify_dispute_created();

-- ============================================
-- 4. 분쟁 상태 변경 시 알림 트리거
-- ============================================

CREATE OR REPLACE FUNCTION notify_dispute_status_changed()
RETURNS TRIGGER AS $$
DECLARE
  v_title TEXT;
  v_body TEXT;
  v_case_number TEXT;
BEGIN
  -- 상태가 변경되지 않았으면 무시
  IF OLD.status = NEW.status THEN
    RETURN NEW;
  END IF;

  v_case_number := COALESCE(NEW.case_number, '미지정');

  -- 상태별 알림 메시지
  CASE NEW.status
    WHEN 'waiting_response' THEN
      v_title := '분쟁 조정 답변 요청';
      v_body := '사건번호 ' || v_case_number || ' - 72시간 내에 답변을 제출해주세요.';
      -- 피고에게만 알림
      PERFORM create_dispute_notification(NEW.defendant_id, NEW.id, v_title, v_body);

    WHEN 'ai_reviewing' THEN
      v_title := 'AI 심사 시작';
      v_body := '사건번호 ' || v_case_number || ' - AI가 제출된 증거와 주장을 분석 중입니다.';
      PERFORM create_dispute_notification(NEW.plaintiff_id, NEW.id, v_title, v_body);
      PERFORM create_dispute_notification(NEW.defendant_id, NEW.id, v_title, v_body);

    WHEN 'ai_verdict' THEN
      v_title := 'AI 판결 완료';
      v_body := '사건번호 ' || v_case_number || ' - AI 판결이 완료되었습니다. 결과를 확인해주세요.';
      PERFORM create_dispute_notification(NEW.plaintiff_id, NEW.id, v_title, v_body);
      PERFORM create_dispute_notification(NEW.defendant_id, NEW.id, v_title, v_body);

    WHEN 'appealed' THEN
      v_title := '이의 신청 접수';
      v_body := '사건번호 ' || v_case_number || ' - 이의 신청이 접수되어 관리자 검토 중입니다.';
      PERFORM create_dispute_notification(NEW.plaintiff_id, NEW.id, v_title, v_body);
      PERFORM create_dispute_notification(NEW.defendant_id, NEW.id, v_title, v_body);

    WHEN 'admin_review' THEN
      v_title := '관리자 검토 중';
      v_body := '사건번호 ' || v_case_number || ' - 관리자가 해당 분쟁을 검토 중입니다.';
      PERFORM create_dispute_notification(NEW.plaintiff_id, NEW.id, v_title, v_body);
      PERFORM create_dispute_notification(NEW.defendant_id, NEW.id, v_title, v_body);

    WHEN 'resolved' THEN
      v_title := '분쟁 해결 완료';
      v_body := '사건번호 ' || v_case_number || ' - 분쟁이 해결되었습니다.';
      PERFORM create_dispute_notification(NEW.plaintiff_id, NEW.id, v_title, v_body);
      PERFORM create_dispute_notification(NEW.defendant_id, NEW.id, v_title, v_body);

    WHEN 'both_accepted' THEN
      v_title := '양측 합의 완료';
      v_body := '사건번호 ' || v_case_number || ' - 양측이 AI 판결을 수용하여 분쟁이 종료되었습니다.';
      PERFORM create_dispute_notification(NEW.plaintiff_id, NEW.id, v_title, v_body);
      PERFORM create_dispute_notification(NEW.defendant_id, NEW.id, v_title, v_body);

    ELSE
      -- 기타 상태는 알림 없음
      NULL;
  END CASE;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_dispute_status_changed ON disputes;
CREATE TRIGGER on_dispute_status_changed
  AFTER UPDATE ON disputes
  FOR EACH ROW
  EXECUTE FUNCTION notify_dispute_status_changed();

-- ============================================
-- 5. 분쟁 메시지 타임라인 기록 함수
-- ============================================

CREATE OR REPLACE FUNCTION add_dispute_timeline_message(
  p_dispute_id UUID,
  p_sender_id UUID,
  p_message_type TEXT,
  p_content TEXT,
  p_metadata JSONB DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_message_id UUID;
BEGIN
  INSERT INTO dispute_messages (
    dispute_id,
    sender_id,
    message_type,
    content,
    metadata,
    created_at
  ) VALUES (
    p_dispute_id,
    p_sender_id,
    p_message_type,
    p_content,
    p_metadata,
    NOW()
  )
  RETURNING id INTO v_message_id;

  RETURN v_message_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 6. 분쟁 생성 시 타임라인 자동 기록
-- ============================================

CREATE OR REPLACE FUNCTION record_dispute_timeline_on_create()
RETURNS TRIGGER AS $$
BEGIN
  -- 분쟁 접수 시스템 메시지
  INSERT INTO dispute_messages (
    dispute_id,
    sender_id,
    message_type,
    content,
    metadata,
    created_at
  ) VALUES (
    NEW.id,
    NULL,  -- 시스템 메시지
    'system',
    '분쟁 조정이 접수되었습니다. (사건번호: ' || COALESCE(NEW.case_number, '생성 중') || ')',
    jsonb_build_object('event', 'dispute_created', 'status', NEW.status),
    NOW()
  );

  -- 원고 주장 메시지
  INSERT INTO dispute_messages (
    dispute_id,
    sender_id,
    message_type,
    content,
    metadata,
    created_at
  ) VALUES (
    NEW.id,
    NEW.plaintiff_id,
    'claim',
    NEW.plaintiff_claim,
    jsonb_build_object('dispute_type', NEW.dispute_type, 'amount', NEW.dispute_amount),
    NOW()
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_dispute_timeline_create ON disputes;
CREATE TRIGGER on_dispute_timeline_create
  AFTER INSERT ON disputes
  FOR EACH ROW
  EXECUTE FUNCTION record_dispute_timeline_on_create();

-- ============================================
-- 7. 분쟁 상태 변경 시 타임라인 자동 기록
-- ============================================

CREATE OR REPLACE FUNCTION record_dispute_timeline_on_update()
RETURNS TRIGGER AS $$
DECLARE
  v_status_label TEXT;
BEGIN
  -- 상태가 변경된 경우
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    v_status_label := CASE NEW.status
      WHEN 'pending' THEN '접수 대기'
      WHEN 'waiting_response' THEN '피고 답변 대기'
      WHEN 'ai_reviewing' THEN 'AI 심사 중'
      WHEN 'ai_verdict' THEN 'AI 판결 완료'
      WHEN 'plaintiff_accepted' THEN '원고 판결 수용'
      WHEN 'defendant_accepted' THEN '피고 판결 수용'
      WHEN 'both_accepted' THEN '양측 합의 완료'
      WHEN 'appealed' THEN '이의 신청'
      WHEN 'admin_review' THEN '관리자 검토 중'
      WHEN 'resolved' THEN '해결 완료'
      WHEN 'cancelled' THEN '취소됨'
      ELSE NEW.status
    END;

    INSERT INTO dispute_messages (
      dispute_id,
      sender_id,
      message_type,
      content,
      metadata,
      created_at
    ) VALUES (
      NEW.id,
      NULL,
      'system',
      '상태가 "' || v_status_label || '"(으)로 변경되었습니다.',
      jsonb_build_object('event', 'status_changed', 'old_status', OLD.status, 'new_status', NEW.status),
      NOW()
    );
  END IF;

  -- 피고 답변이 추가된 경우
  IF OLD.defendant_response IS NULL AND NEW.defendant_response IS NOT NULL THEN
    INSERT INTO dispute_messages (
      dispute_id,
      sender_id,
      message_type,
      content,
      metadata,
      created_at
    ) VALUES (
      NEW.id,
      NEW.defendant_id,
      'response',
      NEW.defendant_response,
      NULL,
      NOW()
    );
  END IF;

  -- AI 판결이 추가된 경우
  IF OLD.ai_verdict IS NULL AND NEW.ai_verdict IS NOT NULL THEN
    INSERT INTO dispute_messages (
      dispute_id,
      sender_id,
      message_type,
      content,
      metadata,
      created_at
    ) VALUES (
      NEW.id,
      NULL,
      'ai_verdict',
      NEW.ai_verdict_reason,
      jsonb_build_object(
        'verdict', NEW.ai_verdict,
        'refund_amount', NEW.ai_refund_amount
      ),
      NOW()
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_dispute_timeline_update ON disputes;
CREATE TRIGGER on_dispute_timeline_update
  AFTER UPDATE ON disputes
  FOR EACH ROW
  EXECUTE FUNCTION record_dispute_timeline_on_update();

-- ============================================
-- 8. 인덱스 추가 (성능 최적화)
-- ============================================

CREATE INDEX IF NOT EXISTS idx_disputes_created_at ON disputes(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_dispute_messages_created_at ON dispute_messages(created_at);
CREATE INDEX IF NOT EXISTS idx_notifications_user_type ON notifications(user_id, type) WHERE type = 'dispute';
