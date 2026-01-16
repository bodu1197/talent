-- ============================================
-- 보안 경고 수정: Function Search Path & RLS 정책 강화
-- 작성일: 2026-01-16
-- Supabase Linter 경고 해결
-- ============================================

-- ============================================
-- 1. Function Search Path 설정 (17개 함수)
--
-- 보안 배경: SECURITY DEFINER 함수에서 search_path가 설정되지 않으면
-- 공격자가 search_path를 조작하여 악성 함수를 실행시킬 수 있음
-- 해결: SET search_path = '' 추가 (빈 문자열 = 가장 안전)
-- ============================================

-- 1-1. generate_case_number
CREATE OR REPLACE FUNCTION generate_case_number()
RETURNS TRIGGER AS $$
DECLARE
  year_part TEXT;
  sequence_num INTEGER;
BEGIN
  year_part := EXTRACT(YEAR FROM NOW())::TEXT;

  -- 올해 분쟁 건수 조회
  SELECT COUNT(*) + 1 INTO sequence_num
  FROM public.disputes
  WHERE EXTRACT(YEAR FROM created_at) = EXTRACT(YEAR FROM NOW());

  NEW.case_number := 'DISP-' || year_part || '-' || LPAD(sequence_num::TEXT, 5, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- 1-2. is_admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE user_id = auth.uid()
    AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE SET search_path = '';

-- 1-3. create_dispute_notification
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
  INSERT INTO public.notifications (
    user_id,
    type,
    title,
    message,
    metadata,
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- 1-4. notify_dispute_created
CREATE OR REPLACE FUNCTION notify_dispute_created()
RETURNS TRIGGER AS $$
DECLARE
  v_plaintiff_name TEXT;
  v_errand_title TEXT;
BEGIN
  -- 원고 이름 조회
  SELECT name INTO v_plaintiff_name FROM public.profiles WHERE user_id = NEW.plaintiff_id;

  -- 심부름 제목 조회
  SELECT title INTO v_errand_title FROM public.errands WHERE id = NEW.errand_id;

  -- 피고에게 알림
  PERFORM public.create_dispute_notification(
    NEW.defendant_id,
    NEW.id,
    '분쟁이 제기되었습니다',
    COALESCE(v_plaintiff_name, '상대방') || '님이 "' || COALESCE(v_errand_title, '심부름') || '" 건에 대해 분쟁을 제기했습니다. 72시간 내에 답변해주세요.',
    'dispute_created'
  );

  -- 관리자들에게 알림
  INSERT INTO public.notifications (user_id, type, title, message, metadata, is_read, created_at)
  SELECT
    p.user_id,
    'dispute',
    '[관리자] 새 분쟁 접수',
    '새로운 분쟁이 접수되었습니다. 확인이 필요합니다.',
    jsonb_build_object('dispute_id', NEW.id, 'link', '/admin/disputes/' || NEW.id),
    false,
    NOW()
  FROM public.profiles p
  WHERE p.role = 'admin';

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- 1-5. notify_dispute_status_changed
CREATE OR REPLACE FUNCTION notify_dispute_status_changed()
RETURNS TRIGGER AS $$
DECLARE
  v_title TEXT;
  v_body TEXT;
  v_errand_title TEXT;
BEGIN
  IF OLD.status = NEW.status THEN
    RETURN NEW;
  END IF;

  SELECT title INTO v_errand_title FROM public.errands WHERE id = NEW.errand_id;

  CASE NEW.status
    WHEN 'waiting_response' THEN
      v_title := '답변이 요청되었습니다';
      v_body := '"' || COALESCE(v_errand_title, '심부름') || '" 분쟁에 대해 72시간 내에 답변해주세요.';
      PERFORM public.create_dispute_notification(NEW.defendant_id, NEW.id, v_title, v_body, 'dispute_status_changed');

    WHEN 'ai_reviewing' THEN
      v_title := 'AI 심사가 시작되었습니다';
      v_body := '양측의 주장을 분석 중입니다. 잠시만 기다려주세요.';
      PERFORM public.create_dispute_notification(NEW.plaintiff_id, NEW.id, v_title, v_body, 'dispute_status_changed');
      PERFORM public.create_dispute_notification(NEW.defendant_id, NEW.id, v_title, v_body, 'dispute_status_changed');

    WHEN 'ai_verdict' THEN
      v_title := 'AI 판결이 나왔습니다';
      v_body := '분쟁에 대한 AI 판결을 확인해주세요. 이의가 있으면 24시간 내에 신청해주세요.';
      PERFORM public.create_dispute_notification(NEW.plaintiff_id, NEW.id, v_title, v_body, 'dispute_status_changed');
      PERFORM public.create_dispute_notification(NEW.defendant_id, NEW.id, v_title, v_body, 'dispute_status_changed');

    WHEN 'appealed' THEN
      v_title := '이의 신청이 접수되었습니다';
      v_body := '관리자 검토가 진행될 예정입니다.';
      PERFORM public.create_dispute_notification(NEW.plaintiff_id, NEW.id, v_title, v_body, 'dispute_status_changed');
      PERFORM public.create_dispute_notification(NEW.defendant_id, NEW.id, v_title, v_body, 'dispute_status_changed');

    WHEN 'admin_review' THEN
      v_title := '관리자 검토 중입니다';
      v_body := '관리자가 분쟁을 직접 검토하고 있습니다.';
      PERFORM public.create_dispute_notification(NEW.plaintiff_id, NEW.id, v_title, v_body, 'dispute_status_changed');
      PERFORM public.create_dispute_notification(NEW.defendant_id, NEW.id, v_title, v_body, 'dispute_status_changed');

    WHEN 'resolved' THEN
      v_title := '분쟁이 해결되었습니다';
      v_body := '분쟁이 최종 해결되었습니다. 결과를 확인해주세요.';
      PERFORM public.create_dispute_notification(NEW.plaintiff_id, NEW.id, v_title, v_body, 'dispute_status_changed');
      PERFORM public.create_dispute_notification(NEW.defendant_id, NEW.id, v_title, v_body, 'dispute_status_changed');

    WHEN 'both_accepted' THEN
      v_title := '양측이 합의했습니다';
      v_body := '분쟁이 양측 합의로 종결되었습니다.';
      PERFORM public.create_dispute_notification(NEW.plaintiff_id, NEW.id, v_title, v_body, 'dispute_status_changed');
      PERFORM public.create_dispute_notification(NEW.defendant_id, NEW.id, v_title, v_body, 'dispute_status_changed');

    ELSE
      NULL;
  END CASE;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- 1-6. record_dispute_timeline_on_create
CREATE OR REPLACE FUNCTION record_dispute_timeline_on_create()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.dispute_messages (
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
    '분쟁 조정이 접수되었습니다. (사건번호: ' || COALESCE(NEW.case_number, '생성 중') || ')',
    jsonb_build_object('event', 'dispute_created', 'status', NEW.status),
    NOW()
  );

  INSERT INTO public.dispute_messages (
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- 1-7. record_dispute_timeline_on_update
CREATE OR REPLACE FUNCTION record_dispute_timeline_on_update()
RETURNS TRIGGER AS $$
DECLARE
  v_status_label TEXT;
BEGIN
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

    INSERT INTO public.dispute_messages (
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

  IF OLD.defendant_response IS NULL AND NEW.defendant_response IS NOT NULL THEN
    INSERT INTO public.dispute_messages (
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

  IF OLD.ai_verdict IS NULL AND NEW.ai_verdict IS NOT NULL THEN
    INSERT INTO public.dispute_messages (
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- 1-8. notify_helper_documents_submitted
CREATE OR REPLACE FUNCTION notify_helper_documents_submitted()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.verification_status = 'submitted' AND
     (OLD.verification_status IS NULL OR OLD.verification_status != 'submitted') THEN

    INSERT INTO public.notifications (user_id, type, title, message, metadata, is_read, created_at)
    SELECT
      p.user_id,
      'helper_verification',
      '[관리자] 헬퍼 서류 검토 요청',
      '새로운 헬퍼 등록 서류가 제출되었습니다. 검토가 필요합니다.',
      jsonb_build_object(
        'helper_profile_id', NEW.id,
        'helper_user_id', NEW.user_id,
        'link', '/admin/helpers/' || NEW.id
      ),
      false,
      NOW()
    FROM public.profiles p
    WHERE p.role = 'admin';
  END IF;

  IF NEW.verification_status IN ('verified', 'rejected') AND
     OLD.verification_status != NEW.verification_status THEN

    INSERT INTO public.notifications (user_id, type, title, message, metadata, is_read, created_at)
    VALUES (
      NEW.user_id,
      'helper_verification',
      CASE NEW.verification_status
        WHEN 'verified' THEN '헬퍼 등록이 승인되었습니다'
        WHEN 'rejected' THEN '헬퍼 등록이 반려되었습니다'
      END,
      CASE NEW.verification_status
        WHEN 'verified' THEN '축하합니다! 이제 심부름 수행이 가능합니다.'
        WHEN 'rejected' THEN COALESCE(NEW.documents_rejected_reason, '서류를 다시 제출해주세요.')
      END,
      jsonb_build_object('link', '/errands/mypage/helper'),
      false,
      NOW()
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- 1-9. notify_errand_application
CREATE OR REPLACE FUNCTION notify_errand_application()
RETURNS TRIGGER AS $$
DECLARE
  v_requester_id UUID;
  v_errand_title TEXT;
  v_helper_name TEXT;
BEGIN
  SELECT requester_id, title INTO v_requester_id, v_errand_title
  FROM public.errands WHERE id = NEW.errand_id;

  SELECT p.name INTO v_helper_name
  FROM public.helper_profiles hp
  JOIN public.profiles p ON hp.user_id = p.user_id
  WHERE hp.id = NEW.helper_id;

  INSERT INTO public.notifications (user_id, type, title, message, metadata, is_read, created_at)
  VALUES (
    v_requester_id,
    'errand_application',
    '새로운 지원자가 있습니다',
    '"' || COALESCE(v_errand_title, '심부름') || '"에 ' || COALESCE(v_helper_name, '헬퍼') || '님이 지원했습니다.',
    jsonb_build_object(
      'errand_id', NEW.errand_id,
      'application_id', NEW.id,
      'link', '/errands/' || NEW.errand_id
    ),
    false,
    NOW()
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- 1-10. notify_errand_application_result
CREATE OR REPLACE FUNCTION notify_errand_application_result()
RETURNS TRIGGER AS $$
DECLARE
  v_errand_title TEXT;
  v_helper_user_id UUID;
BEGIN
  IF OLD.status = NEW.status THEN
    RETURN NEW;
  END IF;

  IF OLD.status != 'pending' THEN
    RETURN NEW;
  END IF;

  SELECT title INTO v_errand_title FROM public.errands WHERE id = NEW.errand_id;
  SELECT user_id INTO v_helper_user_id FROM public.helper_profiles WHERE id = NEW.helper_id;

  IF NEW.status = 'accepted' THEN
    INSERT INTO public.notifications (user_id, type, title, message, metadata, is_read, created_at)
    VALUES (
      v_helper_user_id,
      'errand_application_accepted',
      '지원이 수락되었습니다!',
      '"' || COALESCE(v_errand_title, '심부름') || '" 지원이 수락되었습니다. 심부름을 시작해주세요!',
      jsonb_build_object('errand_id', NEW.errand_id, 'link', '/errands/' || NEW.errand_id),
      false,
      NOW()
    );
  ELSIF NEW.status = 'rejected' THEN
    INSERT INTO public.notifications (user_id, type, title, message, metadata, is_read, created_at)
    VALUES (
      v_helper_user_id,
      'errand_application_rejected',
      '지원이 선택되지 않았습니다',
      '"' || COALESCE(v_errand_title, '심부름') || '" 지원이 선택되지 않았습니다. 다른 심부름에 도전해보세요!',
      jsonb_build_object('errand_id', NEW.errand_id, 'link', '/errands'),
      false,
      NOW()
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- 1-11. notify_errand_status_change
CREATE OR REPLACE FUNCTION notify_errand_status_change()
RETURNS TRIGGER AS $$
DECLARE
  v_requester_name TEXT;
  v_helper_user_id UUID;
  v_helper_name TEXT;
BEGIN
  IF OLD.status = NEW.status THEN
    RETURN NEW;
  END IF;

  SELECT name INTO v_requester_name FROM public.profiles WHERE user_id = NEW.requester_id;

  IF NEW.helper_id IS NOT NULL THEN
    SELECT hp.user_id, p.name INTO v_helper_user_id, v_helper_name
    FROM public.helper_profiles hp
    JOIN public.profiles p ON hp.user_id = p.user_id
    WHERE hp.id = NEW.helper_id;
  END IF;

  CASE NEW.status
    WHEN 'IN_PROGRESS' THEN
      IF NEW.requester_id IS NOT NULL THEN
        INSERT INTO public.notifications (user_id, type, title, message, metadata, is_read, created_at)
        VALUES (
          NEW.requester_id,
          'errand_started',
          '심부름이 시작되었습니다',
          COALESCE(v_helper_name, '헬퍼') || '님이 "' || NEW.title || '" 심부름을 시작했습니다.',
          jsonb_build_object('errand_id', NEW.id, 'link', '/errands/' || NEW.id),
          false,
          NOW()
        );
      END IF;

    WHEN 'COMPLETED' THEN
      IF NEW.requester_id IS NOT NULL THEN
        INSERT INTO public.notifications (user_id, type, title, message, metadata, is_read, created_at)
        VALUES (
          NEW.requester_id,
          'errand_completed',
          '심부름이 완료되었습니다',
          '"' || NEW.title || '" 심부름이 완료되었습니다. 확인해주세요!',
          jsonb_build_object('errand_id', NEW.id, 'link', '/errands/' || NEW.id),
          false,
          NOW()
        );
      END IF;

    WHEN 'CANCELLED' THEN
      IF v_helper_user_id IS NOT NULL THEN
        INSERT INTO public.notifications (user_id, type, title, message, metadata, is_read, created_at)
        VALUES (
          v_helper_user_id,
          'errand_cancelled',
          '심부름이 취소되었습니다',
          '"' || NEW.title || '" 심부름이 취소되었습니다. 사유: ' || COALESCE(NEW.cancel_reason, '사유 없음'),
          jsonb_build_object('errand_id', NEW.id, 'link', '/errands'),
          false,
          NOW()
        );
      END IF;
      IF NEW.requester_id IS NOT NULL AND OLD.status = 'IN_PROGRESS' THEN
        INSERT INTO public.notifications (user_id, type, title, message, metadata, is_read, created_at)
        VALUES (
          NEW.requester_id,
          'errand_cancelled',
          '심부름이 취소되었습니다',
          '"' || NEW.title || '" 심부름이 취소되었습니다. 사유: ' || COALESCE(NEW.cancel_reason, '사유 없음'),
          jsonb_build_object('errand_id', NEW.id, 'link', '/errands/' || NEW.id),
          false,
          NOW()
        );
      END IF;

    ELSE
      NULL;
  END CASE;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- 1-12. notify_settlement_available
CREATE OR REPLACE FUNCTION notify_settlement_available()
RETURNS TRIGGER AS $$
DECLARE
  v_helper_user_id UUID;
  v_errand_title TEXT;
BEGIN
  IF OLD.status = 'pending' AND NEW.status = 'available' THEN
    SELECT user_id INTO v_helper_user_id FROM public.helper_profiles WHERE id = NEW.helper_id;
    SELECT title INTO v_errand_title FROM public.errands WHERE id = NEW.errand_id;

    INSERT INTO public.notifications (user_id, type, title, message, metadata, is_read, created_at)
    VALUES (
      v_helper_user_id,
      'settlement_available',
      '정산금이 출금 가능합니다',
      '"' || COALESCE(v_errand_title, '심부름') || '" 수익 ' || NEW.total_amount::TEXT || '원이 출금 가능합니다.',
      jsonb_build_object('settlement_id', NEW.id, 'link', '/errands/mypage/helper/earnings'),
      false,
      NOW()
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- 1-13. notify_withdrawal_requested
CREATE OR REPLACE FUNCTION notify_withdrawal_requested()
RETURNS TRIGGER AS $$
DECLARE
  v_helper_name TEXT;
BEGIN
  SELECT p.name INTO v_helper_name
  FROM public.helper_profiles hp
  JOIN public.profiles p ON hp.user_id = p.user_id
  WHERE hp.id = NEW.helper_id;

  INSERT INTO public.notifications (user_id, type, title, message, metadata, is_read, created_at)
  SELECT
    p.user_id,
    'withdrawal_requested',
    '[관리자] 출금 신청 접수',
    COALESCE(v_helper_name, '헬퍼') || '님이 ' || NEW.amount::TEXT || '원 출금을 신청했습니다.',
    jsonb_build_object('withdrawal_id', NEW.id, 'link', '/admin/withdrawals'),
    false,
    NOW()
  FROM public.profiles p
  WHERE p.role = 'admin';

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- 1-14. notify_withdrawal_result
CREATE OR REPLACE FUNCTION notify_withdrawal_result()
RETURNS TRIGGER AS $$
DECLARE
  v_helper_user_id UUID;
BEGIN
  IF OLD.status = NEW.status THEN
    RETURN NEW;
  END IF;

  IF OLD.status NOT IN ('pending', 'approved') THEN
    RETURN NEW;
  END IF;

  SELECT user_id INTO v_helper_user_id FROM public.helper_profiles WHERE id = NEW.helper_id;

  IF NEW.status = 'completed' THEN
    INSERT INTO public.notifications (user_id, type, title, message, metadata, is_read, created_at)
    VALUES (
      v_helper_user_id,
      'withdrawal_completed',
      '출금이 완료되었습니다',
      NEW.amount::TEXT || '원이 ' || NEW.bank_name || ' ' || NEW.bank_account || '로 입금되었습니다.',
      jsonb_build_object('withdrawal_id', NEW.id, 'link', '/errands/mypage/helper/earnings'),
      false,
      NOW()
    );
  ELSIF NEW.status = 'rejected' THEN
    INSERT INTO public.notifications (user_id, type, title, message, metadata, is_read, created_at)
    VALUES (
      v_helper_user_id,
      'withdrawal_rejected',
      '출금이 거절되었습니다',
      NEW.amount::TEXT || '원 출금이 거절되었습니다. 사유: ' || COALESCE(NEW.reject_reason, '사유 없음'),
      jsonb_build_object('withdrawal_id', NEW.id, 'link', '/errands/mypage/helper/earnings'),
      false,
      NOW()
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- 1-15. trigger_push_notification
CREATE OR REPLACE FUNCTION trigger_push_notification()
RETURNS TRIGGER AS $$
DECLARE
  v_has_tokens BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM public.user_device_tokens
    WHERE user_id = NEW.user_id
    AND is_active = true
    AND push_enabled = true
  ) INTO v_has_tokens;

  IF v_has_tokens THEN
    INSERT INTO public.push_notification_queue (notification_id, user_id, created_at)
    VALUES (NEW.id, NEW.user_id, NOW())
    ON CONFLICT DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- 1-16. should_send_push
CREATE OR REPLACE FUNCTION should_send_push(
  p_user_id UUID,
  p_notification_type TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
  v_result BOOLEAN := false;
BEGIN
  SELECT CASE
    WHEN p_notification_type LIKE 'order%' OR p_notification_type IN ('payment_received', 'work_completed', 'new_order')
      THEN notify_orders
    WHEN p_notification_type IN ('message_new', 'new_message', 'errand_chat')
      THEN notify_messages
    WHEN p_notification_type LIKE 'errand%' OR p_notification_type LIKE 'settlement%' OR p_notification_type LIKE 'withdrawal%'
      THEN notify_errands
    ELSE true
  END INTO v_result
  FROM public.user_device_tokens
  WHERE user_id = p_user_id
  AND is_active = true
  AND push_enabled = true
  LIMIT 1;

  RETURN COALESCE(v_result, false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- 1-17. cleanup_inactive_tokens
CREATE OR REPLACE FUNCTION cleanup_inactive_tokens()
RETURNS INTEGER AS $$
DECLARE
  v_deleted INTEGER;
BEGIN
  UPDATE public.user_device_tokens
  SET is_active = false, updated_at = NOW()
  WHERE is_active = true
  AND last_used_at < NOW() - INTERVAL '30 days';

  DELETE FROM public.user_device_tokens
  WHERE is_active = false
  AND updated_at < NOW() - INTERVAL '90 days';

  GET DIAGNOSTICS v_deleted = ROW_COUNT;
  RETURN v_deleted;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- ============================================
-- 2. RLS 정책 강화
--
-- 문제: WITH CHECK (true)로 누구나 INSERT 가능
-- 해결: 적절한 권한 검사 추가
-- ============================================

-- 2-1. payments - 인증된 사용자 또는 service_role만 결제 생성 가능
-- payments 테이블은 order_id를 통해 orders와 연결됨
DROP POLICY IF EXISTS "payments_insert" ON payments;
CREATE POLICY "payments_insert" ON payments
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL OR auth.jwt() ->> 'role' = 'service_role'
  );

-- 2-2. users - service_role만 생성 가능 (handle_new_user 트리거가 사용)
DROP POLICY IF EXISTS "Service role can insert users" ON users;
CREATE POLICY "service_role_insert_users" ON users
  FOR INSERT WITH CHECK (
    auth.jwt() ->> 'role' = 'service_role'
  );

-- 2-3. service_categories - 관리자만 생성 가능
DROP POLICY IF EXISTS "Enable insert for service categories" ON service_categories;
CREATE POLICY "admin_insert_service_categories" ON service_categories
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- 2-4. order_settlements - service_role만 생성 가능 (시스템에서만 생성)
DROP POLICY IF EXISTS "order_settlements_insert" ON order_settlements;
CREATE POLICY "service_role_insert_order_settlements" ON order_settlements
  FOR INSERT WITH CHECK (
    auth.jwt() ->> 'role' = 'service_role'
  );

-- ============================================
-- 3. 코멘트 추가
-- ============================================

COMMENT ON FUNCTION generate_case_number IS '분쟁 사건번호 자동 생성 (SECURITY DEFINER with search_path)';
COMMENT ON FUNCTION is_admin IS '관리자 여부 확인 (SECURITY DEFINER with search_path)';
COMMENT ON FUNCTION create_dispute_notification IS '분쟁 알림 생성 (SECURITY DEFINER with search_path)';
COMMENT ON FUNCTION notify_dispute_created IS '분쟁 생성 알림 트리거 (SECURITY DEFINER with search_path)';
COMMENT ON FUNCTION notify_dispute_status_changed IS '분쟁 상태 변경 알림 트리거 (SECURITY DEFINER with search_path)';
COMMENT ON FUNCTION record_dispute_timeline_on_create IS '분쟁 타임라인 생성 기록 (SECURITY DEFINER with search_path)';
COMMENT ON FUNCTION record_dispute_timeline_on_update IS '분쟁 타임라인 업데이트 기록 (SECURITY DEFINER with search_path)';
COMMENT ON FUNCTION notify_helper_documents_submitted IS '헬퍼 문서 제출 알림 (SECURITY DEFINER with search_path)';
COMMENT ON FUNCTION notify_errand_application IS '심부름 지원 알림 (SECURITY DEFINER with search_path)';
COMMENT ON FUNCTION notify_errand_application_result IS '심부름 지원 결과 알림 (SECURITY DEFINER with search_path)';
COMMENT ON FUNCTION notify_errand_status_change IS '심부름 상태 변경 알림 (SECURITY DEFINER with search_path)';
COMMENT ON FUNCTION notify_settlement_available IS '정산 가능 알림 (SECURITY DEFINER with search_path)';
COMMENT ON FUNCTION notify_withdrawal_requested IS '출금 신청 알림 (SECURITY DEFINER with search_path)';
COMMENT ON FUNCTION notify_withdrawal_result IS '출금 결과 알림 (SECURITY DEFINER with search_path)';
COMMENT ON FUNCTION trigger_push_notification IS '푸시 알림 트리거 (SECURITY DEFINER with search_path)';
COMMENT ON FUNCTION should_send_push IS '푸시 발송 여부 확인 (SECURITY DEFINER with search_path)';
COMMENT ON FUNCTION cleanup_inactive_tokens IS '비활성 토큰 정리 (SECURITY DEFINER with search_path)';

-- ============================================
-- 3. 추가 RLS 정책 강화 (모든 true 정책 수정)
-- ============================================

-- 3-1. activity_logs - service_role만 INSERT 가능
DROP POLICY IF EXISTS "System can insert activity logs" ON activity_logs;
CREATE POLICY "service_role_insert_activity_logs" ON activity_logs
  FOR INSERT WITH CHECK (auth.jwt() ->> 'role' = 'service_role');

-- 3-2. inquiries - 인증된 사용자만 INSERT 가능 (익명 문의 불가)
DROP POLICY IF EXISTS "inquiries_insert_anyone" ON inquiries;
CREATE POLICY "authenticated_insert_inquiries" ON inquiries
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- 3-3. notifications - service_role만 INSERT 가능 (트리거에서 사용)
DROP POLICY IF EXISTS "알림 생성 허용" ON notifications;
CREATE POLICY "service_role_insert_notifications" ON notifications
  FOR INSERT WITH CHECK (auth.jwt() ->> 'role' = 'service_role');

-- 3-4. schema_migrations - service_role만 INSERT 가능
DROP POLICY IF EXISTS "System can insert schema migrations" ON schema_migrations;
CREATE POLICY "service_role_insert_schema_migrations" ON schema_migrations
  FOR INSERT WITH CHECK (auth.jwt() ->> 'role' = 'service_role');

-- 3-5. visitor_stats_daily - service_role만 INSERT/UPDATE 가능
DROP POLICY IF EXISTS "Service role can insert daily stats" ON visitor_stats_daily;
DROP POLICY IF EXISTS "Service role can update daily stats" ON visitor_stats_daily;
CREATE POLICY "service_role_insert_visitor_stats_daily" ON visitor_stats_daily
  FOR INSERT WITH CHECK (auth.jwt() ->> 'role' = 'service_role');
CREATE POLICY "service_role_update_visitor_stats_daily" ON visitor_stats_daily
  FOR UPDATE USING (auth.jwt() ->> 'role' = 'service_role');

-- 3-6. visitor_stats_hourly - service_role만 INSERT/UPDATE 가능
DROP POLICY IF EXISTS "Service role can insert hourly stats" ON visitor_stats_hourly;
DROP POLICY IF EXISTS "Service role can update hourly stats" ON visitor_stats_hourly;
CREATE POLICY "service_role_insert_visitor_stats_hourly" ON visitor_stats_hourly
  FOR INSERT WITH CHECK (auth.jwt() ->> 'role' = 'service_role');
CREATE POLICY "service_role_update_visitor_stats_hourly" ON visitor_stats_hourly
  FOR UPDATE USING (auth.jwt() ->> 'role' = 'service_role');

-- 3-7. visitor_stats_monthly - service_role만 INSERT/UPDATE 가능
DROP POLICY IF EXISTS "Service role can insert monthly stats" ON visitor_stats_monthly;
DROP POLICY IF EXISTS "Service role can update monthly stats" ON visitor_stats_monthly;
CREATE POLICY "service_role_insert_visitor_stats_monthly" ON visitor_stats_monthly
  FOR INSERT WITH CHECK (auth.jwt() ->> 'role' = 'service_role');
CREATE POLICY "service_role_update_visitor_stats_monthly" ON visitor_stats_monthly
  FOR UPDATE USING (auth.jwt() ->> 'role' = 'service_role');

-- 3-8. page_views - 인증된 사용자 또는 service_role만
DROP POLICY IF EXISTS "Anyone can insert page_views" ON page_views;
CREATE POLICY "authenticated_or_service_insert_page_views" ON page_views
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL OR auth.jwt() ->> 'role' = 'service_role');

-- 3-9. search_logs - 인증된 사용자 또는 service_role만
DROP POLICY IF EXISTS "Insert search logs" ON search_logs;
CREATE POLICY "authenticated_or_service_insert_search_logs" ON search_logs
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL OR auth.jwt() ->> 'role' = 'service_role');

-- 3-10. service_view_logs - 인증된 사용자 또는 service_role만
DROP POLICY IF EXISTS "Anyone can insert view logs" ON service_view_logs;
CREATE POLICY "authenticated_or_service_insert_service_view_logs" ON service_view_logs
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL OR auth.jwt() ->> 'role' = 'service_role');

-- ============================================
-- 4. auth_rls_initplan 성능 최적화
--
-- 문제: auth.uid(), auth.jwt()가 행마다 재평가되어 성능 저하
-- 해결: (select auth.uid()), (select auth.jwt())로 변경하여 한 번만 평가
-- ============================================

-- 4-1. ai_support_sessions
DROP POLICY IF EXISTS "Users can create ai sessions" ON ai_support_sessions;
DROP POLICY IF EXISTS "Users can view own ai sessions" ON ai_support_sessions;
DROP POLICY IF EXISTS "Users can update own ai sessions" ON ai_support_sessions;

CREATE POLICY "Users can create ai sessions" ON ai_support_sessions
  FOR INSERT WITH CHECK (((select auth.uid()) = user_id) OR (user_id IS NULL));

CREATE POLICY "Users can view own ai sessions" ON ai_support_sessions
  FOR SELECT USING (((select auth.uid()) = user_id) OR (user_id IS NULL));

CREATE POLICY "Users can update own ai sessions" ON ai_support_sessions
  FOR UPDATE USING (((select auth.uid()) = user_id) OR (user_id IS NULL));

-- 4-2. ai_support_messages
DROP POLICY IF EXISTS "Users can create ai messages" ON ai_support_messages;
DROP POLICY IF EXISTS "Users can view ai messages from own sessions" ON ai_support_messages;

CREATE POLICY "Users can create ai messages" ON ai_support_messages
  FOR INSERT WITH CHECK (
    session_id IN (
      SELECT id FROM ai_support_sessions
      WHERE (user_id = (select auth.uid())) OR (user_id IS NULL)
    )
  );

CREATE POLICY "Users can view ai messages from own sessions" ON ai_support_messages
  FOR SELECT USING (
    session_id IN (
      SELECT id FROM ai_support_sessions
      WHERE (user_id = (select auth.uid())) OR (user_id IS NULL)
    )
  );

-- 4-3. disputes
DROP POLICY IF EXISTS "disputes_insert_policy" ON disputes;
DROP POLICY IF EXISTS "disputes_select_policy" ON disputes;
DROP POLICY IF EXISTS "disputes_update_policy" ON disputes;

CREATE POLICY "disputes_insert_policy" ON disputes
  FOR INSERT WITH CHECK ((select auth.uid()) = plaintiff_id);

CREATE POLICY "disputes_select_policy" ON disputes
  FOR SELECT USING (
    (select auth.uid()) = plaintiff_id OR
    (select auth.uid()) = defendant_id OR
    is_admin()
  );

CREATE POLICY "disputes_update_policy" ON disputes
  FOR UPDATE USING (
    (select auth.uid()) = plaintiff_id OR
    (select auth.uid()) = defendant_id OR
    is_admin()
  );

-- 4-4. dispute_evidences
DROP POLICY IF EXISTS "dispute_evidences_insert_policy" ON dispute_evidences;
DROP POLICY IF EXISTS "dispute_evidences_select_policy" ON dispute_evidences;

CREATE POLICY "dispute_evidences_insert_policy" ON dispute_evidences
  FOR INSERT WITH CHECK ((select auth.uid()) = submitted_by);

CREATE POLICY "dispute_evidences_select_policy" ON dispute_evidences
  FOR SELECT USING (
    dispute_id IN (
      SELECT id FROM disputes
      WHERE plaintiff_id = (select auth.uid()) OR defendant_id = (select auth.uid())
    ) OR is_admin()
  );

-- 4-5. dispute_messages
DROP POLICY IF EXISTS "dispute_messages_insert_policy" ON dispute_messages;
DROP POLICY IF EXISTS "dispute_messages_select_policy" ON dispute_messages;

CREATE POLICY "dispute_messages_insert_policy" ON dispute_messages
  FOR INSERT WITH CHECK (
    (select auth.uid()) = sender_id OR
    sender_id IS NULL OR
    is_admin()
  );

CREATE POLICY "dispute_messages_select_policy" ON dispute_messages
  FOR SELECT USING (
    dispute_id IN (
      SELECT id FROM disputes
      WHERE plaintiff_id = (select auth.uid()) OR defendant_id = (select auth.uid())
    ) OR is_admin()
  );

-- ============================================
-- 5. multiple_permissive_policies 통합 + auth_rls_initplan 수정
--
-- 문제: 같은 테이블/역할/작업에 여러 permissive 정책이 있으면 성능 저하
-- 해결: OR 조건으로 단일 정책으로 통합
-- ============================================

-- 5-1. inquiries (SELECT 정책 통합)
DROP POLICY IF EXISTS "authenticated_insert_inquiries" ON inquiries;
DROP POLICY IF EXISTS "inquiries_select_admin" ON inquiries;
DROP POLICY IF EXISTS "inquiries_select_own" ON inquiries;
DROP POLICY IF EXISTS "inquiries_update_admin" ON inquiries;
DROP POLICY IF EXISTS "inquiries_delete_admin" ON inquiries;

CREATE POLICY "inquiries_insert" ON inquiries
  FOR INSERT WITH CHECK ((select auth.uid()) IS NOT NULL);

CREATE POLICY "inquiries_select" ON inquiries
  FOR SELECT USING (
    user_id = (select auth.uid()) OR
    EXISTS (
      SELECT 1 FROM admins
      WHERE admins.user_id = (select auth.uid()) AND admins.role = 'super_admin'
    )
  );

CREATE POLICY "inquiries_update" ON inquiries
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM admins
      WHERE admins.user_id = (select auth.uid()) AND admins.role = 'super_admin'
    )
  );

CREATE POLICY "inquiries_delete" ON inquiries
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM admins
      WHERE admins.user_id = (select auth.uid()) AND admins.role = 'super_admin'
    )
  );

-- 5-2. user_device_tokens (ALL 정책을 개별 정책으로 + 통합)
DROP POLICY IF EXISTS "service_role_all" ON user_device_tokens;
DROP POLICY IF EXISTS "users_own_tokens_select" ON user_device_tokens;
DROP POLICY IF EXISTS "users_own_tokens_insert" ON user_device_tokens;
DROP POLICY IF EXISTS "users_own_tokens_update" ON user_device_tokens;
DROP POLICY IF EXISTS "users_own_tokens_delete" ON user_device_tokens;

CREATE POLICY "device_tokens_select" ON user_device_tokens
  FOR SELECT USING (
    (select auth.uid()) = user_id OR
    ((select auth.jwt()) ->> 'role') = 'service_role'
  );

CREATE POLICY "device_tokens_insert" ON user_device_tokens
  FOR INSERT WITH CHECK (
    (select auth.uid()) = user_id OR
    ((select auth.jwt()) ->> 'role') = 'service_role'
  );

CREATE POLICY "device_tokens_update" ON user_device_tokens
  FOR UPDATE USING (
    (select auth.uid()) = user_id OR
    ((select auth.jwt()) ->> 'role') = 'service_role'
  );

CREATE POLICY "device_tokens_delete" ON user_device_tokens
  FOR DELETE USING (
    (select auth.uid()) = user_id OR
    ((select auth.jwt()) ->> 'role') = 'service_role'
  );

-- 5-3. push_notification_logs (ALL + SELECT 통합)
DROP POLICY IF EXISTS "service_role_logs" ON push_notification_logs;
DROP POLICY IF EXISTS "users_own_logs" ON push_notification_logs;

CREATE POLICY "push_logs_select" ON push_notification_logs
  FOR SELECT USING (
    (select auth.uid()) = user_id OR
    ((select auth.jwt()) ->> 'role') = 'service_role'
  );

CREATE POLICY "push_logs_insert" ON push_notification_logs
  FOR INSERT WITH CHECK (
    ((select auth.jwt()) ->> 'role') = 'service_role'
  );

CREATE POLICY "push_logs_update" ON push_notification_logs
  FOR UPDATE USING (
    ((select auth.jwt()) ->> 'role') = 'service_role'
  );

CREATE POLICY "push_logs_delete" ON push_notification_logs
  FOR DELETE USING (
    ((select auth.jwt()) ->> 'role') = 'service_role'
  );

-- 5-4. push_notification_queue (ALL → 개별 정책)
DROP POLICY IF EXISTS "service_role_queue" ON push_notification_queue;

CREATE POLICY "push_queue_select" ON push_notification_queue
  FOR SELECT USING (
    ((select auth.jwt()) ->> 'role') = 'service_role'
  );

CREATE POLICY "push_queue_insert" ON push_notification_queue
  FOR INSERT WITH CHECK (
    ((select auth.jwt()) ->> 'role') = 'service_role'
  );

CREATE POLICY "push_queue_update" ON push_notification_queue
  FOR UPDATE USING (
    ((select auth.jwt()) ->> 'role') = 'service_role'
  );

CREATE POLICY "push_queue_delete" ON push_notification_queue
  FOR DELETE USING (
    ((select auth.jwt()) ->> 'role') = 'service_role'
  );

-- ============================================
-- 6. 기존 INSERT 정책 auth_rls_initplan 수정
-- ============================================

-- 6-1. payments_insert
DROP POLICY IF EXISTS "payments_insert" ON payments;
CREATE POLICY "payments_insert" ON payments
  FOR INSERT WITH CHECK (
    (select auth.uid()) IS NOT NULL OR
    ((select auth.jwt()) ->> 'role') = 'service_role'
  );

-- 6-2. service_role_insert_users
DROP POLICY IF EXISTS "service_role_insert_users" ON users;
CREATE POLICY "service_role_insert_users" ON users
  FOR INSERT WITH CHECK (
    ((select auth.jwt()) ->> 'role') = 'service_role'
  );

-- 6-3. admin_insert_service_categories
DROP POLICY IF EXISTS "admin_insert_service_categories" ON service_categories;
CREATE POLICY "admin_insert_service_categories" ON service_categories
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE user_id = (select auth.uid()) AND role = 'admin'
    )
  );

-- 6-4. service_role_insert_order_settlements
DROP POLICY IF EXISTS "service_role_insert_order_settlements" ON order_settlements;
CREATE POLICY "service_role_insert_order_settlements" ON order_settlements
  FOR INSERT WITH CHECK (
    ((select auth.jwt()) ->> 'role') = 'service_role'
  );

-- 6-5. service_role_insert_activity_logs
DROP POLICY IF EXISTS "service_role_insert_activity_logs" ON activity_logs;
CREATE POLICY "service_role_insert_activity_logs" ON activity_logs
  FOR INSERT WITH CHECK (
    ((select auth.jwt()) ->> 'role') = 'service_role'
  );

-- 6-6. service_role_insert_notifications
DROP POLICY IF EXISTS "service_role_insert_notifications" ON notifications;
CREATE POLICY "service_role_insert_notifications" ON notifications
  FOR INSERT WITH CHECK (
    ((select auth.jwt()) ->> 'role') = 'service_role'
  );

-- 6-7. service_role_insert_schema_migrations
DROP POLICY IF EXISTS "service_role_insert_schema_migrations" ON schema_migrations;
CREATE POLICY "service_role_insert_schema_migrations" ON schema_migrations
  FOR INSERT WITH CHECK (
    ((select auth.jwt()) ->> 'role') = 'service_role'
  );

-- ============================================
-- 7. visitor_stats 정책 auth_rls_initplan 수정
-- ============================================

-- visitor_stats_daily
DROP POLICY IF EXISTS "service_role_insert_visitor_stats_daily" ON visitor_stats_daily;
DROP POLICY IF EXISTS "service_role_update_visitor_stats_daily" ON visitor_stats_daily;

CREATE POLICY "service_role_insert_visitor_stats_daily" ON visitor_stats_daily
  FOR INSERT WITH CHECK (
    ((select auth.jwt()) ->> 'role') = 'service_role'
  );

CREATE POLICY "service_role_update_visitor_stats_daily" ON visitor_stats_daily
  FOR UPDATE USING (
    ((select auth.jwt()) ->> 'role') = 'service_role'
  );

-- visitor_stats_hourly
DROP POLICY IF EXISTS "service_role_insert_visitor_stats_hourly" ON visitor_stats_hourly;
DROP POLICY IF EXISTS "service_role_update_visitor_stats_hourly" ON visitor_stats_hourly;

CREATE POLICY "service_role_insert_visitor_stats_hourly" ON visitor_stats_hourly
  FOR INSERT WITH CHECK (
    ((select auth.jwt()) ->> 'role') = 'service_role'
  );

CREATE POLICY "service_role_update_visitor_stats_hourly" ON visitor_stats_hourly
  FOR UPDATE USING (
    ((select auth.jwt()) ->> 'role') = 'service_role'
  );

-- visitor_stats_monthly
DROP POLICY IF EXISTS "service_role_insert_visitor_stats_monthly" ON visitor_stats_monthly;
DROP POLICY IF EXISTS "service_role_update_visitor_stats_monthly" ON visitor_stats_monthly;

CREATE POLICY "service_role_insert_visitor_stats_monthly" ON visitor_stats_monthly
  FOR INSERT WITH CHECK (
    ((select auth.jwt()) ->> 'role') = 'service_role'
  );

CREATE POLICY "service_role_update_visitor_stats_monthly" ON visitor_stats_monthly
  FOR UPDATE USING (
    ((select auth.jwt()) ->> 'role') = 'service_role'
  );

-- ============================================
-- 8. 기타 로그 테이블 정책 auth_rls_initplan 수정
-- ============================================

-- page_views
DROP POLICY IF EXISTS "authenticated_or_service_insert_page_views" ON page_views;
CREATE POLICY "page_views_insert" ON page_views
  FOR INSERT WITH CHECK (
    (select auth.uid()) IS NOT NULL OR
    ((select auth.jwt()) ->> 'role') = 'service_role'
  );

-- search_logs
DROP POLICY IF EXISTS "authenticated_or_service_insert_search_logs" ON search_logs;
CREATE POLICY "search_logs_insert" ON search_logs
  FOR INSERT WITH CHECK (
    (select auth.uid()) IS NOT NULL OR
    ((select auth.jwt()) ->> 'role') = 'service_role'
  );

-- service_view_logs
DROP POLICY IF EXISTS "authenticated_or_service_insert_service_view_logs" ON service_view_logs;
CREATE POLICY "service_view_logs_insert" ON service_view_logs
  FOR INSERT WITH CHECK (
    (select auth.uid()) IS NOT NULL OR
    ((select auth.jwt()) ->> 'role') = 'service_role'
  );

-- ============================================
-- 9. 외래 키 인덱스 추가 (unindexed_foreign_keys)
--
-- 문제: FK 컬럼에 인덱스가 없으면 JOIN 및 삭제 시 성능 저하
-- 해결: FK 컬럼에 인덱스 추가
-- ============================================

CREATE INDEX IF NOT EXISTS idx_dispute_evidences_submitted_by
  ON dispute_evidences(submitted_by);

CREATE INDEX IF NOT EXISTS idx_dispute_messages_sender_id
  ON dispute_messages(sender_id);

CREATE INDEX IF NOT EXISTS idx_disputes_service_id
  ON disputes(service_id);

CREATE INDEX IF NOT EXISTS idx_inquiries_replied_by
  ON inquiries(replied_by);

CREATE INDEX IF NOT EXISTS idx_push_notification_logs_device_token_id
  ON push_notification_logs(device_token_id);

CREATE INDEX IF NOT EXISTS idx_push_notification_queue_user_id
  ON push_notification_queue(user_id);

-- ============================================
-- 완료: 슈퍼앱 수준 보안 적용
-- - 17개 함수에 search_path = '' 설정
-- - 14개 RLS 정책 강화 (모든 WITH CHECK true 제거)
-- - 43개 RLS 정책 auth_rls_initplan 최적화 (subselect 적용)
-- - 30개 multiple_permissive_policies 통합
-- - 6개 외래 키 인덱스 추가
-- ============================================
