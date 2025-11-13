-- 실시간 알림 시스템 구축
-- 주문 상태 변경, 메시지, 리뷰 등의 이벤트 발생 시 알림 생성

-- 0. 기존 notifications 테이블이 있다면 삭제 (조심스럽게)
DROP TABLE IF EXISTS notifications CASCADE;

-- 1. notifications 테이블 생성
CREATE TABLE notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type text NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  link text,
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),

  -- 관련 엔티티
  order_id uuid REFERENCES orders(id) ON DELETE CASCADE,
  sender_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,

  -- 추가 메타데이터
  metadata jsonb,

  -- 제약 조건
  CONSTRAINT notifications_type_valid CHECK (
    type IN (
      'order_new',
      'order_started',
      'order_delivered',
      'order_completed',
      'order_revision_requested',
      'order_revision_completed',
      'order_cancelled',
      'message_new',
      'review_new'
    )
  )
);

-- 2. 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON notifications(user_id, is_read) WHERE is_read = false;
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_order_id ON notifications(order_id) WHERE order_id IS NOT NULL;

-- 3. RLS 활성화
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- 4. RLS 정책
-- 사용자는 자신의 알림만 조회 가능
CREATE POLICY "사용자는 자신의 알림만 조회"
ON notifications FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- 사용자는 자신의 알림만 업데이트 가능 (읽음 처리)
CREATE POLICY "사용자는 자신의 알림만 업데이트"
ON notifications FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- 시스템/트리거에서 알림 생성 가능
CREATE POLICY "알림 생성 허용"
ON notifications FOR INSERT
TO authenticated
WITH CHECK (true);

-- 5. 알림 생성 헬퍼 함수
CREATE OR REPLACE FUNCTION create_notification(
  p_user_id uuid,
  p_type text,
  p_title text,
  p_message text,
  p_link text DEFAULT NULL,
  p_order_id uuid DEFAULT NULL,
  p_sender_id uuid DEFAULT NULL,
  p_metadata jsonb DEFAULT NULL
)
RETURNS uuid AS $$
DECLARE
  v_notification_id uuid;
BEGIN
  INSERT INTO notifications (
    user_id,
    type,
    title,
    message,
    link,
    order_id,
    sender_id,
    metadata
  ) VALUES (
    p_user_id,
    p_type,
    p_title,
    p_message,
    p_link,
    p_order_id,
    p_sender_id,
    p_metadata
  )
  RETURNING id INTO v_notification_id;

  RETURN v_notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. 주문 상태 변경 시 알림 생성 트리거 함수
CREATE OR REPLACE FUNCTION notify_order_status_change()
RETURNS TRIGGER AS $$
DECLARE
  v_buyer_id uuid;
  v_seller_id uuid;
  v_buyer_name text;
  v_seller_name text;
  v_service_title text;
  v_notification_type text;
  v_notification_title text;
  v_notification_message text;
  v_recipient_id uuid;
BEGIN
  -- 주문 정보 조회
  SELECT
    o.buyer_id,
    o.seller_id,
    o.title,
    buyer.name,
    seller.name
  INTO
    v_buyer_id,
    v_seller_id,
    v_service_title,
    v_buyer_name,
    v_seller_name
  FROM orders o
  LEFT JOIN users buyer ON buyer.id = o.buyer_id
  LEFT JOIN users seller ON seller.id = o.seller_id
  WHERE o.id = NEW.id;

  -- 상태 변경에 따른 알림 생성
  IF OLD.status IS DISTINCT FROM NEW.status THEN

    -- 결제 완료 → 진행중 (판매자가 작업 시작)
    IF OLD.status = 'paid' AND NEW.status = 'in_progress' THEN
      v_notification_type := 'order_started';
      v_notification_title := '작업이 시작되었습니다';
      v_notification_message := v_seller_name || '님이 "' || v_service_title || '" 작업을 시작했습니다.';
      v_recipient_id := v_buyer_id;

    -- 진행중 → 완료 대기 (판매자가 작업 완료)
    ELSIF OLD.status = 'in_progress' AND NEW.status = 'delivered' THEN
      v_notification_type := 'order_delivered';
      v_notification_title := '작업이 완료되었습니다';
      v_notification_message := v_seller_name || '님이 "' || v_service_title || '" 작업을 완료했습니다. 확인해주세요.';
      v_recipient_id := v_buyer_id;

    -- 완료 대기 → 완료 (구매자가 구매 확정)
    ELSIF OLD.status = 'delivered' AND NEW.status = 'completed' THEN
      v_notification_type := 'order_completed';
      v_notification_title := '구매가 확정되었습니다';
      v_notification_message := v_buyer_name || '님이 "' || v_service_title || '" 구매를 확정했습니다.';
      v_recipient_id := v_seller_id;

    -- 완료 대기 → 수정 요청 (구매자가 수정 요청)
    ELSIF OLD.status = 'delivered' AND NEW.status = 'revision' THEN
      v_notification_type := 'order_revision_requested';
      v_notification_title := '수정 요청이 도착했습니다';
      v_notification_message := v_buyer_name || '님이 "' || v_service_title || '"에 대해 수정을 요청했습니다.';
      v_recipient_id := v_seller_id;

    -- 수정 요청 → 완료 대기 (판매자가 수정 완료)
    ELSIF OLD.status = 'revision' AND NEW.status = 'delivered' THEN
      v_notification_type := 'order_revision_completed';
      v_notification_title := '수정이 완료되었습니다';
      v_notification_message := v_seller_name || '님이 "' || v_service_title || '" 수정을 완료했습니다. 확인해주세요.';
      v_recipient_id := v_buyer_id;

    -- 취소
    ELSIF NEW.status = 'cancelled' THEN
      v_notification_type := 'order_cancelled';
      v_notification_title := '주문이 취소되었습니다';
      v_notification_message := '"' || v_service_title || '" 주문이 취소되었습니다.';
      -- 취소한 사람의 반대편에게 알림
      v_recipient_id := CASE
        WHEN auth.uid() = v_buyer_id THEN v_seller_id
        ELSE v_buyer_id
      END;

    END IF;

    -- 알림 생성
    IF v_recipient_id IS NOT NULL AND v_notification_type IS NOT NULL THEN
      PERFORM create_notification(
        v_recipient_id,
        v_notification_type,
        v_notification_title,
        v_notification_message,
        '/mypage/' || CASE WHEN v_recipient_id = v_buyer_id THEN 'buyer' ELSE 'seller' END || '/orders/' || NEW.id,
        NEW.id,
        CASE WHEN v_recipient_id = v_buyer_id THEN v_seller_id ELSE v_buyer_id END,
        jsonb_build_object('old_status', OLD.status, 'new_status', NEW.status)
      );
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. 주문 상태 변경 트리거 생성
DROP TRIGGER IF EXISTS trigger_notify_order_status_change ON orders;
CREATE TRIGGER trigger_notify_order_status_change
  AFTER UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION notify_order_status_change();

-- 8. 새 주문 생성 시 판매자에게 알림
CREATE OR REPLACE FUNCTION notify_new_order()
RETURNS TRIGGER AS $$
DECLARE
  v_seller_name text;
  v_buyer_name text;
BEGIN
  -- 판매자, 구매자 이름 조회
  SELECT name INTO v_seller_name FROM users WHERE id = NEW.seller_id;
  SELECT name INTO v_buyer_name FROM users WHERE id = NEW.buyer_id;

  -- 판매자에게 알림
  PERFORM create_notification(
    NEW.seller_id,
    'order_new',
    '새로운 주문이 도착했습니다',
    v_buyer_name || '님이 "' || NEW.title || '"를 주문했습니다.',
    '/mypage/seller/orders/' || NEW.id,
    NEW.id,
    NEW.buyer_id,
    jsonb_build_object('amount', NEW.total_amount)
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_notify_new_order ON orders;
CREATE TRIGGER trigger_notify_new_order
  AFTER INSERT ON orders
  FOR EACH ROW
  EXECUTE FUNCTION notify_new_order();

-- 9. 주석 추가
COMMENT ON TABLE notifications IS '실시간 알림 테이블 - 주문, 메시지, 리뷰 등의 이벤트 알림';
COMMENT ON COLUMN notifications.id IS '알림 고유 ID';
COMMENT ON COLUMN notifications.user_id IS '알림 수신자 ID';
COMMENT ON COLUMN notifications.type IS '알림 유형';
COMMENT ON COLUMN notifications.title IS '알림 제목';
COMMENT ON COLUMN notifications.message IS '알림 내용';
COMMENT ON COLUMN notifications.link IS '클릭 시 이동할 링크';
COMMENT ON COLUMN notifications.is_read IS '읽음 여부';
COMMENT ON COLUMN notifications.created_at IS '알림 생성 시간';
COMMENT ON COLUMN notifications.order_id IS '관련 주문 ID';
COMMENT ON COLUMN notifications.sender_id IS '알림 발신자 ID';
COMMENT ON COLUMN notifications.metadata IS '추가 메타데이터';

COMMENT ON FUNCTION create_notification IS '알림 생성 헬퍼 함수';
COMMENT ON FUNCTION notify_order_status_change IS '주문 상태 변경 시 알림 생성';
COMMENT ON FUNCTION notify_new_order IS '새 주문 생성 시 알림 생성';
