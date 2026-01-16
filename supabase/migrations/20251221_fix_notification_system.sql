-- ============================================
-- 알림 시스템 전면 수정 및 확장
-- 작성일: 2025-12-21
-- 1. 스키마 불일치 버그 수정 (body→message, data→metadata)
-- 2. CHECK constraint 확장
-- 3. 심부름 알림 트리거 추가
-- 4. 출금/정산 알림 트리거 추가
-- ============================================

-- ============================================
-- 1. CHECK CONSTRAINT 확장 (기존 제거 후 재생성)
-- ============================================

-- 기존 constraint 제거
ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_type_valid;

-- 새로운 constraint 추가 (모든 알림 타입 포함)
ALTER TABLE notifications ADD CONSTRAINT notifications_type_valid CHECK (
  type IN (
    -- 주문 관련 (기존)
    'order_new',
    'order_started',
    'order_delivered',
    'order_completed',
    'order_revision_requested',
    'order_revision_completed',
    'order_cancelled',
    'message_new',
    'review_new',
    -- API에서 사용하는 추가 타입
    'payment_received',
    'work_completed',
    'order_confirmed',
    'new_order',
    'new_message',
    'new_review',
    -- 심부름 관련
    'new_errand',
    'errand_matched',
    'errand_chat',
    'errand_application',
    'errand_application_accepted',
    'errand_application_rejected',
    'errand_started',
    'errand_completed',
    'errand_cancelled',
    -- 정산/출금 관련
    'settlement_available',
    'withdrawal_requested',
    'withdrawal_completed',
    'withdrawal_rejected',
    -- 분쟁 관련
    'dispute',
    'dispute_created',
    'dispute_status_changed',
    -- 헬퍼 관련
    'helper_verification',
    -- 공지/광고 관련
    'notice',
    'payment_failed',
    'payment_expired',
    'credit_expired'
  )
);

-- ============================================
-- 2. 분쟁 알림 함수 수정 (컬럼명 버그 수정)
-- ============================================

-- 분쟁 알림 생성 함수 수정 (body→message, data→metadata)
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
    message,  -- 수정: body → message
    metadata, -- 수정: data → metadata
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

-- 분쟁 생성 알림 트리거 수정
CREATE OR REPLACE FUNCTION notify_dispute_created()
RETURNS TRIGGER AS $$
DECLARE
  v_plaintiff_name TEXT;
  v_errand_title TEXT;
BEGIN
  -- 원고 이름 조회
  SELECT name INTO v_plaintiff_name FROM profiles WHERE user_id = NEW.plaintiff_id;

  -- 심부름 제목 조회
  SELECT title INTO v_errand_title FROM errands WHERE id = NEW.errand_id;

  -- 피고에게 알림
  PERFORM create_dispute_notification(
    NEW.defendant_id,
    NEW.id,
    '분쟁이 제기되었습니다',
    COALESCE(v_plaintiff_name, '상대방') || '님이 "' || COALESCE(v_errand_title, '심부름') || '" 건에 대해 분쟁을 제기했습니다. 72시간 내에 답변해주세요.',
    'dispute_created'
  );

  -- 관리자들에게 알림
  INSERT INTO notifications (user_id, type, title, message, metadata, is_read, created_at)
  SELECT
    p.user_id,
    'dispute',
    '[관리자] 새 분쟁 접수',
    '새로운 분쟁이 접수되었습니다. 확인이 필요합니다.',
    jsonb_build_object('dispute_id', NEW.id, 'link', '/admin/disputes/' || NEW.id),
    false,
    NOW()
  FROM profiles p
  WHERE p.role = 'admin';

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 분쟁 상태 변경 알림 트리거 수정
CREATE OR REPLACE FUNCTION notify_dispute_status_changed()
RETURNS TRIGGER AS $$
DECLARE
  v_title TEXT;
  v_body TEXT;
  v_errand_title TEXT;
BEGIN
  -- 상태가 변경되지 않았으면 종료
  IF OLD.status = NEW.status THEN
    RETURN NEW;
  END IF;

  -- 심부름 제목 조회
  SELECT title INTO v_errand_title FROM errands WHERE id = NEW.errand_id;

  -- 상태별 알림 메시지 설정
  CASE NEW.status
    WHEN 'waiting_response' THEN
      v_title := '답변이 요청되었습니다';
      v_body := '"' || COALESCE(v_errand_title, '심부름') || '" 분쟁에 대해 72시간 내에 답변해주세요.';
      PERFORM create_dispute_notification(NEW.defendant_id, NEW.id, v_title, v_body, 'dispute_status_changed');

    WHEN 'ai_reviewing' THEN
      v_title := 'AI 심사가 시작되었습니다';
      v_body := '양측의 주장을 분석 중입니다. 잠시만 기다려주세요.';
      PERFORM create_dispute_notification(NEW.plaintiff_id, NEW.id, v_title, v_body, 'dispute_status_changed');
      PERFORM create_dispute_notification(NEW.defendant_id, NEW.id, v_title, v_body, 'dispute_status_changed');

    WHEN 'ai_verdict' THEN
      v_title := 'AI 판결이 나왔습니다';
      v_body := '분쟁에 대한 AI 판결을 확인해주세요. 이의가 있으면 24시간 내에 신청해주세요.';
      PERFORM create_dispute_notification(NEW.plaintiff_id, NEW.id, v_title, v_body, 'dispute_status_changed');
      PERFORM create_dispute_notification(NEW.defendant_id, NEW.id, v_title, v_body, 'dispute_status_changed');

    WHEN 'appealed' THEN
      v_title := '이의 신청이 접수되었습니다';
      v_body := '관리자 검토가 진행될 예정입니다.';
      PERFORM create_dispute_notification(NEW.plaintiff_id, NEW.id, v_title, v_body, 'dispute_status_changed');
      PERFORM create_dispute_notification(NEW.defendant_id, NEW.id, v_title, v_body, 'dispute_status_changed');

    WHEN 'admin_review' THEN
      v_title := '관리자 검토 중입니다';
      v_body := '관리자가 분쟁을 직접 검토하고 있습니다.';
      PERFORM create_dispute_notification(NEW.plaintiff_id, NEW.id, v_title, v_body, 'dispute_status_changed');
      PERFORM create_dispute_notification(NEW.defendant_id, NEW.id, v_title, v_body, 'dispute_status_changed');

    WHEN 'resolved' THEN
      v_title := '분쟁이 해결되었습니다';
      v_body := '분쟁이 최종 해결되었습니다. 결과를 확인해주세요.';
      PERFORM create_dispute_notification(NEW.plaintiff_id, NEW.id, v_title, v_body, 'dispute_status_changed');
      PERFORM create_dispute_notification(NEW.defendant_id, NEW.id, v_title, v_body, 'dispute_status_changed');

    WHEN 'both_accepted' THEN
      v_title := '양측이 합의했습니다';
      v_body := '분쟁이 양측 합의로 종결되었습니다.';
      PERFORM create_dispute_notification(NEW.plaintiff_id, NEW.id, v_title, v_body, 'dispute_status_changed');
      PERFORM create_dispute_notification(NEW.defendant_id, NEW.id, v_title, v_body, 'dispute_status_changed');

    ELSE
      -- 다른 상태는 무시
      NULL;
  END CASE;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 3. 헬퍼 문서 검증 알림 함수 수정 (컬럼명 버그 수정)
-- ============================================

CREATE OR REPLACE FUNCTION notify_helper_documents_submitted()
RETURNS TRIGGER AS $$
BEGIN
  -- 문서가 제출되었을 때 (status가 submitted로 변경)
  IF NEW.verification_status = 'submitted' AND
     (OLD.verification_status IS NULL OR OLD.verification_status != 'submitted') THEN

    -- 관리자들에게 알림 (수정: body→message, data→metadata)
    INSERT INTO notifications (user_id, type, title, message, metadata, is_read, created_at)
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
    FROM profiles p
    WHERE p.role = 'admin';
  END IF;

  -- 문서가 검증/거부되었을 때 헬퍼에게 알림
  IF NEW.verification_status IN ('verified', 'rejected') AND
     OLD.verification_status != NEW.verification_status THEN

    INSERT INTO notifications (user_id, type, title, message, metadata, is_read, created_at)
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 4. 심부름 지원 알림 트리거
-- ============================================

-- 새 지원자 알림 함수
CREATE OR REPLACE FUNCTION notify_errand_application()
RETURNS TRIGGER AS $$
DECLARE
  v_requester_id UUID;
  v_errand_title TEXT;
  v_helper_name TEXT;
BEGIN
  -- 심부름 정보 조회
  SELECT requester_id, title INTO v_requester_id, v_errand_title
  FROM errands WHERE id = NEW.errand_id;

  -- 헬퍼 이름 조회
  SELECT p.name INTO v_helper_name
  FROM helper_profiles hp
  JOIN profiles p ON hp.user_id = p.user_id
  WHERE hp.id = NEW.helper_id;

  -- 요청자에게 새 지원자 알림
  INSERT INTO notifications (user_id, type, title, message, metadata, is_read, created_at)
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_errand_application_created ON errand_applications;
CREATE TRIGGER on_errand_application_created
  AFTER INSERT ON errand_applications
  FOR EACH ROW
  EXECUTE FUNCTION notify_errand_application();

-- 지원 수락/거절 알림 함수
CREATE OR REPLACE FUNCTION notify_errand_application_result()
RETURNS TRIGGER AS $$
DECLARE
  v_errand_title TEXT;
  v_helper_user_id UUID;
BEGIN
  -- 상태가 변경되지 않았으면 종료
  IF OLD.status = NEW.status THEN
    RETURN NEW;
  END IF;

  -- pending에서 다른 상태로 변경될 때만
  IF OLD.status != 'pending' THEN
    RETURN NEW;
  END IF;

  -- 심부름 제목 조회
  SELECT title INTO v_errand_title FROM errands WHERE id = NEW.errand_id;

  -- 헬퍼의 user_id 조회
  SELECT user_id INTO v_helper_user_id FROM helper_profiles WHERE id = NEW.helper_id;

  IF NEW.status = 'accepted' THEN
    -- 수락 알림
    INSERT INTO notifications (user_id, type, title, message, metadata, is_read, created_at)
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
    -- 거절 알림
    INSERT INTO notifications (user_id, type, title, message, metadata, is_read, created_at)
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_errand_application_status_change ON errand_applications;
CREATE TRIGGER on_errand_application_status_change
  AFTER UPDATE ON errand_applications
  FOR EACH ROW
  EXECUTE FUNCTION notify_errand_application_result();

-- ============================================
-- 5. 심부름 상태 변경 알림 트리거
-- ============================================

CREATE OR REPLACE FUNCTION notify_errand_status_change()
RETURNS TRIGGER AS $$
DECLARE
  v_requester_name TEXT;
  v_helper_user_id UUID;
  v_helper_name TEXT;
BEGIN
  -- 상태가 변경되지 않았으면 종료
  IF OLD.status = NEW.status THEN
    RETURN NEW;
  END IF;

  -- 요청자 이름 조회
  SELECT name INTO v_requester_name FROM profiles WHERE user_id = NEW.requester_id;

  -- 헬퍼 정보 조회 (있는 경우)
  IF NEW.helper_id IS NOT NULL THEN
    SELECT hp.user_id, p.name INTO v_helper_user_id, v_helper_name
    FROM helper_profiles hp
    JOIN profiles p ON hp.user_id = p.user_id
    WHERE hp.id = NEW.helper_id;
  END IF;

  CASE NEW.status
    WHEN 'IN_PROGRESS' THEN
      -- 심부름 시작 → 요청자에게 알림
      IF NEW.requester_id IS NOT NULL THEN
        INSERT INTO notifications (user_id, type, title, message, metadata, is_read, created_at)
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
      -- 심부름 완료 → 요청자에게 알림
      IF NEW.requester_id IS NOT NULL THEN
        INSERT INTO notifications (user_id, type, title, message, metadata, is_read, created_at)
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
      -- 심부름 취소 → 상대방에게 알림
      -- 요청자가 취소한 경우 → 헬퍼에게
      IF v_helper_user_id IS NOT NULL THEN
        INSERT INTO notifications (user_id, type, title, message, metadata, is_read, created_at)
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
      -- 헬퍼가 취소한 경우 → 요청자에게
      IF NEW.requester_id IS NOT NULL AND OLD.status = 'IN_PROGRESS' THEN
        INSERT INTO notifications (user_id, type, title, message, metadata, is_read, created_at)
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_errand_status_change ON errands;
CREATE TRIGGER on_errand_status_change
  AFTER UPDATE ON errands
  FOR EACH ROW
  EXECUTE FUNCTION notify_errand_status_change();

-- ============================================
-- 6. 정산/출금 알림 트리거
-- ============================================

-- 정산 가능 알림 (pending → available)
CREATE OR REPLACE FUNCTION notify_settlement_available()
RETURNS TRIGGER AS $$
DECLARE
  v_helper_user_id UUID;
  v_errand_title TEXT;
BEGIN
  -- pending에서 available로 변경될 때만
  IF OLD.status = 'pending' AND NEW.status = 'available' THEN
    -- 헬퍼 user_id 조회
    SELECT user_id INTO v_helper_user_id FROM helper_profiles WHERE id = NEW.helper_id;

    -- 심부름 제목 조회
    SELECT title INTO v_errand_title FROM errands WHERE id = NEW.errand_id;

    INSERT INTO notifications (user_id, type, title, message, metadata, is_read, created_at)
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_settlement_available ON errand_settlements;
CREATE TRIGGER on_settlement_available
  AFTER UPDATE ON errand_settlements
  FOR EACH ROW
  EXECUTE FUNCTION notify_settlement_available();

-- 출금 신청 시 관리자 알림
CREATE OR REPLACE FUNCTION notify_withdrawal_requested()
RETURNS TRIGGER AS $$
DECLARE
  v_helper_name TEXT;
BEGIN
  -- 헬퍼 이름 조회
  SELECT p.name INTO v_helper_name
  FROM helper_profiles hp
  JOIN profiles p ON hp.user_id = p.user_id
  WHERE hp.id = NEW.helper_id;

  -- 관리자들에게 알림
  INSERT INTO notifications (user_id, type, title, message, metadata, is_read, created_at)
  SELECT
    p.user_id,
    'withdrawal_requested',
    '[관리자] 출금 신청 접수',
    COALESCE(v_helper_name, '헬퍼') || '님이 ' || NEW.amount::TEXT || '원 출금을 신청했습니다.',
    jsonb_build_object('withdrawal_id', NEW.id, 'link', '/admin/withdrawals'),
    false,
    NOW()
  FROM profiles p
  WHERE p.role = 'admin';

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_withdrawal_requested ON helper_withdrawals;
CREATE TRIGGER on_withdrawal_requested
  AFTER INSERT ON helper_withdrawals
  FOR EACH ROW
  EXECUTE FUNCTION notify_withdrawal_requested();

-- 출금 처리 완료/거절 알림
CREATE OR REPLACE FUNCTION notify_withdrawal_result()
RETURNS TRIGGER AS $$
DECLARE
  v_helper_user_id UUID;
BEGIN
  -- 상태가 변경되지 않았으면 종료
  IF OLD.status = NEW.status THEN
    RETURN NEW;
  END IF;

  -- pending/approved에서 다른 상태로 변경될 때만
  IF OLD.status NOT IN ('pending', 'approved') THEN
    RETURN NEW;
  END IF;

  -- 헬퍼 user_id 조회
  SELECT user_id INTO v_helper_user_id FROM helper_profiles WHERE id = NEW.helper_id;

  IF NEW.status = 'completed' THEN
    INSERT INTO notifications (user_id, type, title, message, metadata, is_read, created_at)
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
    INSERT INTO notifications (user_id, type, title, message, metadata, is_read, created_at)
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_withdrawal_result ON helper_withdrawals;
CREATE TRIGGER on_withdrawal_result
  AFTER UPDATE ON helper_withdrawals
  FOR EACH ROW
  EXECUTE FUNCTION notify_withdrawal_result();

-- ============================================
-- 완료
-- ============================================
