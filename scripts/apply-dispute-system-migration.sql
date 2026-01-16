-- ============================================
-- 분쟁 조정 시스템 전체 마이그레이션
-- 실행 순서: Supabase SQL Editor에서 순서대로 실행
-- 작성일: 2025-12-20
-- ============================================

-- 주의: 이 스크립트는 기존 disputes 테이블을 삭제하고 새로 생성합니다.
-- 기존 분쟁 데이터가 있다면 백업 후 실행하세요.

-- ============================================
-- PART 1: 테이블 생성
-- ============================================

-- 기존 테이블 삭제 (CASCADE로 관련 정책/트리거도 삭제)
DROP TABLE IF EXISTS dispute_messages CASCADE;
DROP TABLE IF EXISTS dispute_evidences CASCADE;
DROP TABLE IF EXISTS disputes CASCADE;

-- 분쟁 테이블
CREATE TABLE disputes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  case_number TEXT UNIQUE,
  plaintiff_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  defendant_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  service_id UUID REFERENCES services(id) ON DELETE SET NULL,
  dispute_type TEXT NOT NULL CHECK (dispute_type IN (
    'refund', 'quality', 'mismatch', 'no_response', 'extra_charge', 'other'
  )),
  plaintiff_role TEXT NOT NULL CHECK (plaintiff_role IN ('buyer', 'seller')),
  dispute_amount INTEGER NOT NULL DEFAULT 0,
  plaintiff_claim TEXT NOT NULL,
  defendant_response TEXT,
  ai_verdict TEXT CHECK (ai_verdict IN (
    'full_refund', 'partial_refund', 'no_refund', 'extra_payment', 'negotiation', 'pending'
  )),
  ai_refund_amount INTEGER,
  ai_verdict_reason TEXT,
  ai_verdict_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
    'pending', 'waiting_response', 'ai_reviewing', 'ai_verdict',
    'plaintiff_accepted', 'defendant_accepted', 'both_accepted',
    'appealed', 'admin_review', 'resolved', 'cancelled'
  )),
  plaintiff_accepted BOOLEAN,
  defendant_accepted BOOLEAN,
  response_deadline TIMESTAMPTZ,
  verdict_deadline TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 분쟁 증거 테이블
CREATE TABLE dispute_evidences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  dispute_id UUID REFERENCES disputes(id) ON DELETE CASCADE NOT NULL,
  submitted_by UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  evidence_type TEXT NOT NULL CHECK (evidence_type IN (
    'screenshot', 'file', 'chat_log', 'contract', 'other'
  )),
  file_url TEXT,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 분쟁 메시지 테이블
CREATE TABLE dispute_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  dispute_id UUID REFERENCES disputes(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  message_type TEXT NOT NULL CHECK (message_type IN (
    'claim', 'response', 'evidence', 'ai_analysis', 'ai_verdict',
    'acceptance', 'appeal', 'admin_note', 'system'
  )),
  content TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스
CREATE INDEX idx_disputes_plaintiff ON disputes(plaintiff_id);
CREATE INDEX idx_disputes_defendant ON disputes(defendant_id);
CREATE INDEX idx_disputes_order ON disputes(order_id);
CREATE INDEX idx_disputes_status ON disputes(status);
CREATE INDEX idx_disputes_case_number ON disputes(case_number);
CREATE INDEX idx_disputes_created_at ON disputes(created_at DESC);
CREATE INDEX idx_dispute_evidences_dispute ON dispute_evidences(dispute_id);
CREATE INDEX idx_dispute_messages_dispute ON dispute_messages(dispute_id);
CREATE INDEX idx_dispute_messages_created_at ON dispute_messages(created_at);

-- ============================================
-- PART 2: 함수 및 트리거
-- ============================================

-- 사건번호 자동 생성 함수
CREATE OR REPLACE FUNCTION generate_case_number()
RETURNS TRIGGER AS $$
DECLARE
  year_part TEXT;
  sequence_num INTEGER;
BEGIN
  year_part := EXTRACT(YEAR FROM NOW())::TEXT;
  SELECT COALESCE(MAX(CAST(SUBSTRING(case_number FROM 6) AS INTEGER)), 0) + 1
  INTO sequence_num
  FROM disputes
  WHERE case_number LIKE year_part || '-%';
  NEW.case_number := year_part || '-' || LPAD(sequence_num::TEXT, 4, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_case_number
  BEFORE INSERT ON disputes
  FOR EACH ROW
  EXECUTE FUNCTION generate_case_number();

-- updated_at 자동 업데이트
CREATE TRIGGER update_disputes_updated_at
  BEFORE UPDATE ON disputes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- PART 3: RLS 정책
-- ============================================

ALTER TABLE disputes ENABLE ROW LEVEL SECURITY;
ALTER TABLE dispute_evidences ENABLE ROW LEVEL SECURITY;
ALTER TABLE dispute_messages ENABLE ROW LEVEL SECURITY;

-- 관리자 확인 함수
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

-- 분쟁 정책 (당사자 + 관리자)
CREATE POLICY "disputes_select_policy" ON disputes
  FOR SELECT USING (
    auth.uid() = plaintiff_id OR auth.uid() = defendant_id OR is_admin()
  );

CREATE POLICY "disputes_insert_policy" ON disputes
  FOR INSERT WITH CHECK (auth.uid() = plaintiff_id);

CREATE POLICY "disputes_update_policy" ON disputes
  FOR UPDATE USING (
    auth.uid() = plaintiff_id OR auth.uid() = defendant_id OR is_admin()
  );

-- 증거 정책
CREATE POLICY "dispute_evidences_select_policy" ON dispute_evidences
  FOR SELECT USING (
    dispute_id IN (
      SELECT id FROM disputes
      WHERE plaintiff_id = auth.uid() OR defendant_id = auth.uid()
    ) OR is_admin()
  );

CREATE POLICY "dispute_evidences_insert_policy" ON dispute_evidences
  FOR INSERT WITH CHECK (auth.uid() = submitted_by);

-- 메시지 정책
CREATE POLICY "dispute_messages_select_policy" ON dispute_messages
  FOR SELECT USING (
    dispute_id IN (
      SELECT id FROM disputes
      WHERE plaintiff_id = auth.uid() OR defendant_id = auth.uid()
    ) OR is_admin()
  );

CREATE POLICY "dispute_messages_insert_policy" ON dispute_messages
  FOR INSERT WITH CHECK (
    auth.uid() = sender_id OR sender_id IS NULL OR is_admin()
  );

-- ============================================
-- PART 4: 알림 시스템
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
    user_id, type, title, body, data, is_read, created_at
  ) VALUES (
    p_user_id, p_notification_type, p_title, p_body,
    jsonb_build_object('dispute_id', p_dispute_id, 'link', '/help/dispute/' || p_dispute_id),
    false, NOW()
  )
  RETURNING id INTO v_notification_id;
  RETURN v_notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 분쟁 생성 알림 트리거
CREATE OR REPLACE FUNCTION notify_dispute_created()
RETURNS TRIGGER AS $$
DECLARE
  v_plaintiff_name TEXT;
  v_case_number TEXT;
BEGIN
  SELECT name INTO v_plaintiff_name FROM profiles WHERE user_id = NEW.plaintiff_id;
  v_case_number := COALESCE(NEW.case_number, '미지정');

  -- 피고에게 알림
  PERFORM create_dispute_notification(
    NEW.defendant_id, NEW.id,
    '분쟁 조정 신청이 접수되었습니다',
    v_plaintiff_name || '님이 분쟁 조정을 신청했습니다. (사건번호: ' || v_case_number || ') 72시간 내에 답변해주세요.'
  );

  -- 관리자들에게 알림
  INSERT INTO notifications (user_id, type, title, body, data, is_read, created_at)
  SELECT user_id, 'dispute', '[관리자] 새 분쟁 접수',
    '사건번호 ' || v_case_number || ' - ' || NEW.dispute_type || ' 유형의 분쟁이 접수되었습니다.',
    jsonb_build_object('dispute_id', NEW.id, 'link', '/admin/disputes/' || NEW.id),
    false, NOW()
  FROM profiles WHERE role = 'admin';

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_dispute_created
  AFTER INSERT ON disputes
  FOR EACH ROW
  EXECUTE FUNCTION notify_dispute_created();

-- 분쟁 상태 변경 알림 트리거
CREATE OR REPLACE FUNCTION notify_dispute_status_changed()
RETURNS TRIGGER AS $$
DECLARE
  v_title TEXT;
  v_body TEXT;
  v_case_number TEXT;
BEGIN
  IF OLD.status = NEW.status THEN RETURN NEW; END IF;

  v_case_number := COALESCE(NEW.case_number, '미지정');

  CASE NEW.status
    WHEN 'waiting_response' THEN
      v_title := '분쟁 조정 답변 요청';
      v_body := '사건번호 ' || v_case_number || ' - 72시간 내에 답변을 제출해주세요.';
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

    ELSE NULL;
  END CASE;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_dispute_status_changed
  AFTER UPDATE ON disputes
  FOR EACH ROW
  EXECUTE FUNCTION notify_dispute_status_changed();

-- ============================================
-- PART 5: 타임라인 자동 기록
-- ============================================

CREATE OR REPLACE FUNCTION record_dispute_timeline_on_create()
RETURNS TRIGGER AS $$
BEGIN
  -- 분쟁 접수 시스템 메시지
  INSERT INTO dispute_messages (dispute_id, sender_id, message_type, content, metadata, created_at)
  VALUES (
    NEW.id, NULL, 'system',
    '분쟁 조정이 접수되었습니다. (사건번호: ' || COALESCE(NEW.case_number, '생성 중') || ')',
    jsonb_build_object('event', 'dispute_created', 'status', NEW.status),
    NOW()
  );

  -- 원고 주장 메시지
  INSERT INTO dispute_messages (dispute_id, sender_id, message_type, content, metadata, created_at)
  VALUES (
    NEW.id, NEW.plaintiff_id, 'claim', NEW.plaintiff_claim,
    jsonb_build_object('dispute_type', NEW.dispute_type, 'amount', NEW.dispute_amount),
    NOW()
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_dispute_timeline_create
  AFTER INSERT ON disputes
  FOR EACH ROW
  EXECUTE FUNCTION record_dispute_timeline_on_create();

CREATE OR REPLACE FUNCTION record_dispute_timeline_on_update()
RETURNS TRIGGER AS $$
DECLARE
  v_status_label TEXT;
BEGIN
  -- 상태 변경 기록
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

    INSERT INTO dispute_messages (dispute_id, sender_id, message_type, content, metadata, created_at)
    VALUES (NEW.id, NULL, 'system', '상태가 "' || v_status_label || '"(으)로 변경되었습니다.',
      jsonb_build_object('event', 'status_changed', 'old_status', OLD.status, 'new_status', NEW.status), NOW());
  END IF;

  -- 피고 답변 추가
  IF OLD.defendant_response IS NULL AND NEW.defendant_response IS NOT NULL THEN
    INSERT INTO dispute_messages (dispute_id, sender_id, message_type, content, created_at)
    VALUES (NEW.id, NEW.defendant_id, 'response', NEW.defendant_response, NOW());
  END IF;

  -- AI 판결 추가
  IF OLD.ai_verdict IS NULL AND NEW.ai_verdict IS NOT NULL THEN
    INSERT INTO dispute_messages (dispute_id, sender_id, message_type, content, metadata, created_at)
    VALUES (NEW.id, NULL, 'ai_verdict', NEW.ai_verdict_reason,
      jsonb_build_object('verdict', NEW.ai_verdict, 'refund_amount', NEW.ai_refund_amount), NOW());
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_dispute_timeline_update
  AFTER UPDATE ON disputes
  FOR EACH ROW
  EXECUTE FUNCTION record_dispute_timeline_on_update();

-- ============================================
-- PART 6: 뷰 생성
-- ============================================

CREATE OR REPLACE VIEW dispute_details
WITH (security_invoker=true) AS
SELECT
  d.id, d.case_number, d.plaintiff_id, d.defendant_id, d.order_id, d.service_id,
  d.dispute_type, d.plaintiff_role, d.dispute_amount, d.plaintiff_claim, d.defendant_response,
  d.ai_verdict, d.ai_refund_amount, d.ai_verdict_reason, d.ai_verdict_at,
  d.status, d.plaintiff_accepted, d.defendant_accepted,
  d.response_deadline, d.verdict_deadline, d.created_at, d.updated_at,
  pp.name AS plaintiff_name, pp.profile_image AS plaintiff_avatar_url,
  pd.name AS defendant_name, pd.profile_image AS defendant_avatar_url,
  s.title AS service_title,
  o.total_amount AS order_total_amount, o.status AS order_status, o.created_at AS order_created_at
FROM disputes d
LEFT JOIN profiles pp ON pp.user_id = d.plaintiff_id
LEFT JOIN profiles pd ON pd.user_id = d.defendant_id
LEFT JOIN services s ON s.id = d.service_id
LEFT JOIN orders o ON o.id = d.order_id;

COMMENT ON VIEW dispute_details IS '분쟁 상세 정보 뷰 - 원고/피고 프로필, 서비스, 주문 정보 포함';

-- ============================================
-- PART 7: 스토리지 정책 (disputes 버킷)
-- ============================================

-- 기존 정책 삭제
DROP POLICY IF EXISTS "Dispute files viewable by participants and admins" ON storage.objects;
DROP POLICY IF EXISTS "Dispute initiators can upload files" ON storage.objects;

-- 새 정책 생성
CREATE POLICY "Dispute files viewable by parties and admins" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'disputes' AND (
      EXISTS (
        SELECT 1 FROM disputes
        WHERE id::text = (storage.foldername(objects.name))[1]
        AND (plaintiff_id = auth.uid() OR defendant_id = auth.uid())
      )
      OR EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'admin')
    )
  );

CREATE POLICY "Dispute parties can upload files" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'disputes' AND
    EXISTS (
      SELECT 1 FROM disputes
      WHERE id::text = (storage.foldername(objects.name))[1]
      AND (plaintiff_id = auth.uid() OR defendant_id = auth.uid())
    )
  );

-- disputes 버킷 생성/업데이트
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'disputes', 'disputes', false, 10485760,
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf', 'video/mp4']
)
ON CONFLICT (id) DO UPDATE SET
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf', 'video/mp4'];

-- ============================================
-- 완료!
-- ============================================
