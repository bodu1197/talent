-- 현재 함수 정의
-- 생성일: 2025-11-13T21:21:52.126Z

======================================================================

-- create_notification
-- SECURITY DEFINER: true
-- 현재 설정: 없음

CREATE OR REPLACE FUNCTION public.create_notification(p_user_id uuid, p_type text, p_title text, p_message text, p_link text DEFAULT NULL::text, p_order_id uuid DEFAULT NULL::uuid, p_sender_id uuid DEFAULT NULL::uuid, p_metadata jsonb DEFAULT NULL::jsonb)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
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
$function$


======================================================================

-- notify_order_status_change
-- SECURITY DEFINER: true
-- 현재 설정: 없음

CREATE OR REPLACE FUNCTION public.notify_order_status_change()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
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
$function$


======================================================================

-- notify_new_order
-- SECURITY DEFINER: true
-- 현재 설정: 없음

CREATE OR REPLACE FUNCTION public.notify_new_order()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
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
$function$


======================================================================

-- handle_new_user
-- SECURITY DEFINER: true
-- 현재 설정: 없음

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  -- users 테이블에 프로필 생성
  INSERT INTO public.users (id, email, name, profile_image)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', '익명'),
    COALESCE(NEW.raw_user_meta_data->>'profile_image', '')
  );

  -- buyers 테이블에 자동 생성 (모든 회원은 기본 구매자)
  INSERT INTO public.buyers (user_id)
  VALUES (NEW.id);

  RETURN NEW;
END;
$function$


======================================================================

-- aggregate_hourly_stats
-- SECURITY DEFINER: true
-- 현재 설정: 없음

CREATE OR REPLACE FUNCTION public.aggregate_hourly_stats()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  INSERT INTO visitor_stats_hourly (hour, path, total_views, unique_visitors, desktop_views, mobile_views, tablet_views, bot_views)
  SELECT
    date_trunc('hour', created_at) as hour,
    path,
    COUNT(*) as total_views,
    COUNT(DISTINCT COALESCE(user_id::text, session_id)) as unique_visitors,
    COUNT(*) FILTER (WHERE device_type = 'desktop') as desktop_views,
    COUNT(*) FILTER (WHERE device_type = 'mobile') as mobile_views,
    COUNT(*) FILTER (WHERE device_type = 'tablet') as tablet_views,
    COUNT(*) FILTER (WHERE device_type = 'bot') as bot_views
  FROM page_views
  WHERE created_at >= date_trunc('hour', NOW()) - INTERVAL '1 hour'
    AND created_at < date_trunc('hour', NOW())
  GROUP BY date_trunc('hour', created_at), path
  ON CONFLICT (hour, path)
  DO UPDATE SET
    total_views = EXCLUDED.total_views,
    unique_visitors = EXCLUDED.unique_visitors,
    desktop_views = EXCLUDED.desktop_views,
    mobile_views = EXCLUDED.mobile_views,
    tablet_views = EXCLUDED.tablet_views,
    bot_views = EXCLUDED.bot_views;
END;
$function$


======================================================================

-- aggregate_daily_stats
-- SECURITY DEFINER: true
-- 현재 설정: 없음

CREATE OR REPLACE FUNCTION public.aggregate_daily_stats()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  INSERT INTO visitor_stats_daily (date, path, total_views, unique_visitors, desktop_views, mobile_views, tablet_views, bot_views)
  SELECT
    DATE(created_at) as date,
    path,
    COUNT(*) as total_views,
    COUNT(DISTINCT COALESCE(user_id::text, session_id)) as unique_visitors,
    COUNT(*) FILTER (WHERE device_type = 'desktop') as desktop_views,
    COUNT(*) FILTER (WHERE device_type = 'mobile') as mobile_views,
    COUNT(*) FILTER (WHERE device_type = 'tablet') as tablet_views,
    COUNT(*) FILTER (WHERE device_type = 'bot') as bot_views
  FROM page_views
  WHERE DATE(created_at) = CURRENT_DATE - INTERVAL '1 day'
  GROUP BY DATE(created_at), path
  ON CONFLICT (date, path)
  DO UPDATE SET
    total_views = EXCLUDED.total_views,
    unique_visitors = EXCLUDED.unique_visitors,
    desktop_views = EXCLUDED.desktop_views,
    mobile_views = EXCLUDED.mobile_views,
    tablet_views = EXCLUDED.tablet_views,
    bot_views = EXCLUDED.bot_views;
END;
$function$


======================================================================

-- aggregate_monthly_stats
-- SECURITY DEFINER: true
-- 현재 설정: 없음

CREATE OR REPLACE FUNCTION public.aggregate_monthly_stats()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  INSERT INTO visitor_stats_monthly (year, month, path, total_views, unique_visitors, desktop_views, mobile_views, tablet_views, bot_views)
  SELECT
    EXTRACT(YEAR FROM created_at)::INTEGER as year,
    EXTRACT(MONTH FROM created_at)::INTEGER as month,
    path,
    COUNT(*) as total_views,
    COUNT(DISTINCT COALESCE(user_id::text, session_id)) as unique_visitors,
    COUNT(*) FILTER (WHERE device_type = 'desktop') as desktop_views,
    COUNT(*) FILTER (WHERE device_type = 'mobile') as mobile_views,
    COUNT(*) FILTER (WHERE device_type = 'tablet') as tablet_views,
    COUNT(*) FILTER (WHERE device_type = 'bot') as bot_views
  FROM page_views
  WHERE date_trunc('month', created_at) = date_trunc('month', NOW()) - INTERVAL '1 month'
  GROUP BY EXTRACT(YEAR FROM created_at), EXTRACT(MONTH FROM created_at), path
  ON CONFLICT (year, month, path)
  DO UPDATE SET
    total_views = EXCLUDED.total_views,
    unique_visitors = EXCLUDED.unique_visitors,
    desktop_views = EXCLUDED.desktop_views,
    mobile_views = EXCLUDED.mobile_views,
    tablet_views = EXCLUDED.tablet_views,
    bot_views = EXCLUDED.bot_views;
END;
$function$


======================================================================

