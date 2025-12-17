-- 5. Functions

CREATE OR REPLACE FUNCTION public.aggregate_daily_stats()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
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
;

CREATE OR REPLACE FUNCTION public.aggregate_hourly_stats()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
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
;

CREATE OR REPLACE FUNCTION public.aggregate_monthly_stats()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
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
;

CREATE OR REPLACE FUNCTION public.apply_storage_policies()
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'storage'
AS $function$
BEGIN
  -- Enable RLS
  EXECUTE 'ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY';

  -- Drop existing policies
  DROP POLICY IF EXISTS "Anyone can view portfolio images" ON storage.objects;
  DROP POLICY IF EXISTS "Authenticated users can upload portfolio images" ON storage.objects;
  DROP POLICY IF EXISTS "Users can update portfolio images" ON storage.objects;
  DROP POLICY IF EXISTS "Users can delete portfolio images" ON storage.objects;

  -- Create policies
  EXECUTE 'CREATE POLICY "Anyone can view portfolio images" ON storage.objects FOR SELECT TO public USING (bucket_id = ''portfolio'')';

  EXECUTE 'CREATE POLICY "Authenticated users can upload portfolio images" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = ''portfolio'')';

  EXECUTE 'CREATE POLICY "Users can update portfolio images" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = ''portfolio'')';

  EXECUTE 'CREATE POLICY "Users can delete portfolio images" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = ''portfolio'')';

  RETURN 'Storage policies applied successfully!';
END;
$function$
;

CREATE OR REPLACE FUNCTION public.approve_service_revision(revision_id_param uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
DECLARE
  v_revision RECORD;
BEGIN
  -- 1. revision 정보 조회
  SELECT * INTO v_revision
  FROM public.service_revisions
  WHERE id = revision_id_param;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Revision not found';
  END IF;

  -- 2. 서비스 정보 업데이트
  UPDATE public.services
  SET
    title = v_revision.title,
    description = v_revision.description,
    thumbnail_url = v_revision.thumbnail_url,
    price = v_revision.price,
    delivery_days = COALESCE(v_revision.delivery_days, 7),
    revision_count = COALESCE(v_revision.revision_count, 0),
    location_address = COALESCE(v_revision.location_address, location_address),
    location_latitude = COALESCE(v_revision.location_latitude, location_latitude),
    location_longitude = COALESCE(v_revision.location_longitude, location_longitude),
    location_region = COALESCE(v_revision.location_region, location_region),
    delivery_method = COALESCE(v_revision.delivery_method, delivery_method),
    updated_at = now()
  WHERE id = v_revision.service_id;

  -- 3. 카테고리 업데이트
  -- 기존 카테고리 삭제
  DELETE FROM public.service_categories
  WHERE service_id = v_revision.service_id;

  -- 새 카테고리 삽입 (DISTINCT + ON CONFLICT로 중복 방지)
  INSERT INTO public.service_categories (service_id, category_id, is_primary)
  SELECT DISTINCT
    v_revision.service_id,
    category_id,
    true
  FROM public.service_revision_categories
  WHERE revision_id = revision_id_param
  ON CONFLICT (service_id, category_id)
  DO UPDATE SET is_primary = EXCLUDED.is_primary;

  -- 4. revision 상태 업데이트
  UPDATE public.service_revisions
  SET
    status = 'approved',
    reviewed_at = now(),
    reviewed_by = auth.uid()
  WHERE id = revision_id_param;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.calculate_distance(lat1 numeric, lon1 numeric, lat2 numeric, lon2 numeric)
 RETURNS numeric
 LANGUAGE plpgsql
 IMMUTABLE
 SET search_path TO 'public'
AS $function$
DECLARE
  R CONSTANT DECIMAL := 6371;
  dlat DECIMAL;
  dlon DECIMAL;
  a DECIMAL;
  c DECIMAL;
BEGIN
  dlat := RADIANS(lat2 - lat1);
  dlon := RADIANS(lon2 - lon1);
  a := SIN(dlat / 2) * SIN(dlat / 2) +
       COS(RADIANS(lat1)) * COS(RADIANS(lat2)) *
       SIN(dlon / 2) * SIN(dlon / 2);
  c := 2 * ATAN2(SQRT(a), SQRT(1 - a));
  RETURN R * c;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.check_email_exists(check_email text)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM auth.users WHERE email = check_email
  );
END;
$function$
;

CREATE OR REPLACE FUNCTION public.cleanup_old_category_visits()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  DELETE FROM category_visits
  WHERE visited_at < NOW() - INTERVAL '90 days';
END;
$function$
;

CREATE OR REPLACE FUNCTION public.create_notification(p_user_id uuid, p_type text, p_title text, p_message text, p_link text DEFAULT NULL::text, p_order_id uuid DEFAULT NULL::uuid, p_sender_id uuid DEFAULT NULL::uuid, p_metadata jsonb DEFAULT NULL::jsonb)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
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
;

CREATE OR REPLACE FUNCTION public.create_seller_earnings()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$
BEGIN
    IF NEW.user_type IN ('seller', 'both') THEN
        INSERT INTO public.seller_earnings (seller_id, available_balance, pending_balance, total_withdrawn, total_earned)
        VALUES (NEW.id, 0, 0, 0, 0)
        ON CONFLICT (seller_id) DO NOTHING;
    END IF;
    RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.create_user_wallet()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
BEGIN
    INSERT INTO public.user_wallets (user_id, balance)
    VALUES (NEW.id, 0)
    ON CONFLICT (user_id) DO NOTHING;
    RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.generate_food_order_number()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$ DECLARE new_number TEXT; BEGIN new_number := 'F' || TO_CHAR(NOW(), 'YYYYMMDD') || LPAD(CAST(FLOOR(RANDOM() * 10000) AS TEXT), 4, '0'); NEW.order_number := new_number; RETURN NEW; END; $function$
;

CREATE OR REPLACE FUNCTION public.generate_order_number()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$
BEGIN
    NEW.order_number := 'ORD-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' ||
                       LPAD(NEXTVAL('public.order_number_seq')::TEXT, 6, '0');
    RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.generate_service_slug()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$
DECLARE
    base_slug TEXT;
    final_slug TEXT;
    counter INTEGER := 0;
BEGIN
    IF (TG_OP = 'INSERT' AND NEW.slug IS NULL) OR (TG_OP = 'UPDATE' AND NEW.title IS DISTINCT FROM OLD.title) THEN
        -- 기본 슬러그 생성 (한글 처리 포함)
        base_slug := LOWER(REGEXP_REPLACE(NEW.title, '[^a-zA-Z0-9가-힣]+', '-', 'g'));
        base_slug := TRIM(BOTH '-' FROM base_slug);

        final_slug := base_slug;

        -- 중복 체크 및 고유 슬러그 생성
        WHILE EXISTS (SELECT 1 FROM public.services WHERE slug = final_slug AND id != NEW.id) LOOP
            counter := counter + 1;
            final_slug := base_slug || '-' || counter;
        END LOOP;

        NEW.slug := final_slug;
    END IF;
    RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.get_buyer_id(user_uuid uuid)
 RETURNS uuid
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  buyer_uuid UUID;
BEGIN
  SELECT id INTO buyer_uuid
  FROM buyers
  WHERE user_id = user_uuid
  LIMIT 1;

  RETURN buyer_uuid;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.get_category_path(p_category_id uuid)
 RETURNS TABLE(id uuid, name text, slug text, icon text, description text, parent_id uuid, level integer, service_count integer, is_ai boolean, is_active boolean)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  RETURN QUERY
  WITH RECURSIVE category_path AS (
    -- Base case: 현재 카테고리
    SELECT
      c.id,
      c.name,
      c.slug,
      c.icon,
      c.description,
      c.parent_id,
      c.level,
      c.service_count,
      c.is_ai,
      c.is_active,
      1 as depth
    FROM categories c
    WHERE c.id = p_category_id

    UNION ALL

    -- Recursive case: 부모 카테고리들
    SELECT
      c.id,
      c.name,
      c.slug,
      c.icon,
      c.description,
      c.parent_id,
      c.level,
      c.service_count,
      c.is_ai,
      c.is_active,
      cp.depth + 1
    FROM categories c
    INNER JOIN category_path cp ON c.id = cp.parent_id
  )
  SELECT
    cp.id,
    cp.name,
    cp.slug,
    cp.icon,
    cp.description,
    cp.parent_id,
    cp.level,
    cp.service_count,
    cp.is_ai,
    cp.is_active
  FROM category_path cp
  ORDER BY cp.level ASC;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.get_errand_unread_count(p_errand_id uuid, p_user_id uuid)
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$ DECLARE v_count INTEGER; v_profile_id UUID; BEGIN SELECT id INTO v_profile_id FROM profiles WHERE user_id = p_user_id; IF v_profile_id IS NULL THEN RETURN 0; END IF; SELECT COUNT(*) INTO v_count FROM errand_chat_messages WHERE errand_id = p_errand_id AND sender_id != v_profile_id AND is_read = FALSE; RETURN COALESCE(v_count, 0); END; $function$
;

CREATE OR REPLACE FUNCTION public.get_nearby_errands(p_lat numeric, p_lng numeric, p_radius_km numeric DEFAULT 10.0, p_limit integer DEFAULT 20)
 RETURNS TABLE(errand_id uuid, title text, category text, total_price numeric, pickup_lat numeric, pickup_lng numeric, pickup_address text, distance_km numeric)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$ BEGIN RETURN QUERY SELECT e.id as errand_id, e.title, e.category, e.total_price, e.pickup_lat, e.pickup_lng, e.pickup_address, ROUND((6371 * acos(cos(radians(p_lat)) * cos(radians(e.pickup_lat)) * cos(radians(e.pickup_lng) - radians(p_lng)) + sin(radians(p_lat)) * sin(radians(e.pickup_lat))))::DECIMAL, 2) as distance_km FROM errands e WHERE e.status = 'OPEN' AND e.pickup_lat IS NOT NULL AND e.pickup_lng IS NOT NULL AND (6371 * acos(cos(radians(p_lat)) * cos(radians(e.pickup_lat)) * cos(radians(e.pickup_lng) - radians(p_lng)) + sin(radians(p_lat)) * sin(radians(e.pickup_lat)))) <= p_radius_km ORDER BY distance_km ASC LIMIT p_limit; END; $function$
;

CREATE OR REPLACE FUNCTION public.get_nearby_experts(user_lat numeric, user_lon numeric, category_slug_filter text DEFAULT NULL::text, radius_km integer DEFAULT 10, limit_count integer DEFAULT 20)
 RETURNS TABLE(seller_id uuid, display_name text, profile_image text, distance_km numeric, location_region text, avg_rating numeric, review_count bigint)
 LANGUAGE plpgsql
 STABLE
 SET search_path TO 'public'
AS $function$ BEGIN RETURN QUERY SELECT sel.id as seller_id, sel.display_name, sel.profile_image, calculate_distance(user_lat, user_lon, sel.location_latitude, sel.location_longitude) as distance_km, sel.location_region, COALESCE(AVG(r.rating), 0)::DECIMAL as avg_rating, COUNT(r.id)::BIGINT as review_count FROM sellers sel JOIN services s ON s.seller_id = sel.id AND s.status = 'active' LEFT JOIN service_categories sc ON sc.service_id = s.id LEFT JOIN categories c ON c.id = sc.category_id LEFT JOIN reviews r ON r.seller_id = sel.id WHERE sel.location_latitude IS NOT NULL AND sel.location_longitude IS NOT NULL AND calculate_distance(user_lat, user_lon, sel.location_latitude, sel.location_longitude) <= radius_km AND (category_slug_filter IS NULL OR c.slug = category_slug_filter) GROUP BY sel.id, sel.display_name, sel.profile_image, sel.location_latitude, sel.location_longitude, sel.location_region ORDER BY distance_km ASC LIMIT limit_count; END; $function$
;

CREATE OR REPLACE FUNCTION public.get_nearby_experts_count(user_lat numeric, user_lon numeric, radius_km integer DEFAULT 10)
 RETURNS TABLE(category_id uuid, category_slug text, category_name text, expert_count bigint)
 LANGUAGE plpgsql
 STABLE
 SET search_path TO 'public'
AS $function$ BEGIN RETURN QUERY SELECT c.id, c.slug, c.name, COUNT(DISTINCT sel.id)::BIGINT as expert_count FROM categories c LEFT JOIN services s ON EXISTS (SELECT 1 FROM service_categories sc WHERE sc.service_id = s.id AND sc.category_id = c.id) LEFT JOIN sellers sel ON s.seller_id = sel.id AND sel.location_latitude IS NOT NULL AND sel.location_longitude IS NOT NULL AND calculate_distance(user_lat, user_lon, sel.location_latitude, sel.location_longitude) <= radius_km WHERE c.parent_id IS NULL AND c.service_type IN ('offline', 'both') AND (s.status = 'active' OR s.status IS NULL) GROUP BY c.id, c.slug, c.name ORDER BY expert_count DESC; END; $function$
;

CREATE OR REPLACE FUNCTION public.get_nearby_helpers(p_lat numeric, p_lng numeric, p_radius_km numeric DEFAULT 5.0, p_stale_minutes integer DEFAULT 10, p_limit integer DEFAULT 20)
 RETURNS TABLE(helper_id uuid, user_id uuid, grade text, average_rating numeric, total_completed integer, distance_km numeric)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$ BEGIN RETURN QUERY SELECT hp.id as helper_id, hp.user_id, hp.grade, hp.average_rating, hp.total_completed, ROUND((6371 * acos(cos(radians(p_lat)) * cos(radians(hp.current_lat)) * cos(radians(hp.current_lng) - radians(p_lng)) + sin(radians(p_lat)) * sin(radians(hp.current_lat))))::DECIMAL, 2) as distance_km FROM helper_profiles hp WHERE hp.is_online = true AND hp.is_active = true AND hp.current_lat IS NOT NULL AND hp.current_lng IS NOT NULL AND hp.last_location_at >= NOW() - (p_stale_minutes || ' minutes')::INTERVAL AND (hp.subscription_status = 'active' OR (hp.subscription_status = 'trial' AND hp.subscription_expires_at > NOW())) AND (6371 * acos(cos(radians(p_lat)) * cos(radians(hp.current_lat)) * cos(radians(hp.current_lng) - radians(p_lng)) + sin(radians(p_lat)) * sin(radians(hp.current_lat)))) <= p_radius_km ORDER BY distance_km ASC LIMIT p_limit; END; $function$
;

CREATE OR REPLACE FUNCTION public.get_nearby_helpers_count(p_lat numeric, p_lng numeric, p_radius_km numeric DEFAULT 5.0, p_stale_minutes integer DEFAULT 10)
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$ DECLARE helper_count INTEGER; BEGIN SELECT COUNT(*) INTO helper_count FROM helper_profiles hp WHERE hp.is_online = true AND hp.is_active = true AND hp.current_lat IS NOT NULL AND hp.current_lng IS NOT NULL AND hp.last_location_at >= NOW() - (p_stale_minutes || ' minutes')::INTERVAL AND (hp.subscription_status = 'active' OR (hp.subscription_status = 'trial' AND hp.subscription_expires_at > NOW())) AND (6371 * acos(cos(radians(p_lat)) * cos(radians(hp.current_lat)) * cos(radians(hp.current_lng) - radians(p_lng)) + sin(radians(p_lat)) * sin(radians(hp.current_lat)))) <= p_radius_km; RETURN helper_count; END; $function$
;

CREATE OR REPLACE FUNCTION public.get_nearby_services(user_lat numeric, user_lon numeric, category_slug_filter text DEFAULT NULL::text, radius_km integer DEFAULT 10, limit_count integer DEFAULT 20)
 RETURNS TABLE(service_id uuid, service_title character varying, service_description text, service_price numeric, thumbnail_url text, category_slug character varying, category_name character varying, seller_id uuid, seller_nickname character varying, seller_profile_image text, seller_rating numeric, seller_review_count integer, location_address character varying, location_region character varying, distance_km numeric, delivery_method character varying)
 LANGUAGE plpgsql
 STABLE
 SET search_path TO 'public'
AS $function$
BEGIN
  RETURN QUERY
  SELECT
    s.id AS service_id,
    s.title AS service_title,
    s.description AS service_description,
    s.price AS service_price,
    s.thumbnail_url,
    c.slug AS category_slug,
    c.name AS category_name,
    sel.id AS seller_id,
    sel.nickname AS seller_nickname,
    sel.profile_image_url AS seller_profile_image,
    sel.rating AS seller_rating,
    sel.review_count AS seller_review_count,
    s.location_address,
    s.location_region,
    calculate_distance(user_lat, user_lon, s.location_latitude, s.location_longitude) AS distance_km,
    s.delivery_method
  FROM services s
  JOIN sellers sel ON s.seller_id = sel.id
  LEFT JOIN categories c ON s.category_id = c.id
  WHERE
    s.status = 'active'
    AND s.location_latitude IS NOT NULL
    AND s.location_longitude IS NOT NULL
    AND (s.delivery_method = 'offline' OR s.delivery_method = 'both')
    AND calculate_distance(user_lat, user_lon, s.location_latitude, s.location_longitude) <= radius_km
    AND (category_slug_filter IS NULL OR c.slug = category_slug_filter)
  ORDER BY distance_km ASC
  LIMIT limit_count;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.get_random_ai_services(p_limit integer DEFAULT 10)
 RETURNS TABLE(id uuid, title text, description text, seller_id uuid, category_id uuid, price_basic integer, delivery_days_basic integer, thumbnail_url text, view_count integer, wishlist_count integer, created_at timestamp with time zone)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  RETURN QUERY
  SELECT
    s.id,
    s.title,
    s.description,
    s.seller_id,
    s.category_id,
    s.price_basic,
    s.delivery_days_basic,
    s.thumbnail_url,
    s.view_count,
    s.wishlist_count,
    s.created_at
  FROM services s
  JOIN categories c ON c.id = s.category_id
  WHERE c.is_ai = TRUE
    AND s.status = 'active'
  ORDER BY RANDOM()
  LIMIT p_limit;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.get_recent_category_visits(p_user_id uuid, p_days integer DEFAULT 30, p_limit integer DEFAULT 10)
 RETURNS TABLE(category_id uuid, category_name text, category_slug text, visit_count bigint)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$ BEGIN RETURN QUERY SELECT cv.category_id, cv.category_name, cv.category_slug, COUNT(*)::BIGINT as visit_count FROM public.category_visits cv WHERE cv.user_id = p_user_id AND cv.visited_at >= NOW() - (p_days || ' days')::INTERVAL GROUP BY cv.category_id, cv.category_name, cv.category_slug ORDER BY MAX(cv.visited_at) DESC LIMIT p_limit; END; $function$
;

CREATE OR REPLACE FUNCTION public.get_seller_id(user_uuid uuid)
 RETURNS uuid
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  seller_uuid UUID;
BEGIN
  SELECT id INTO seller_uuid
  FROM sellers
  WHERE user_id = user_uuid
  LIMIT 1;

  RETURN seller_uuid;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.get_unread_room_count(p_user_id uuid)
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  unread_count INTEGER;
BEGIN
  SELECT COUNT(DISTINCT cm.room_id)
  INTO unread_count
  FROM chat_messages cm
  INNER JOIN chat_rooms cr ON cm.room_id = cr.id
  WHERE (cr.user1_id = p_user_id OR cr.user2_id = p_user_id)
    AND cm.is_read = false
    AND cm.sender_id != p_user_id;

  RETURN COALESCE(unread_count, 0);
END;
$function$
;

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
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
;

CREATE OR REPLACE FUNCTION public.handle_user_profile_sync()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'auth'
AS $function$
BEGIN
  -- On INSERT: Create profile from user_metadata
  IF (TG_OP = 'INSERT') THEN
    INSERT INTO public.profiles (user_id, name, profile_image)
    VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data->>'name', 'Anonymous'),
      NEW.raw_user_meta_data->>'profile_image'
    )
    ON CONFLICT (user_id) DO NOTHING;

    RETURN NEW;
  END IF;

  -- On UPDATE: Sync metadata changes to profiles
  IF (TG_OP = 'UPDATE') THEN
    -- Check if raw_user_meta_data has changed
    IF (NEW.raw_user_meta_data IS DISTINCT FROM OLD.raw_user_meta_data) THEN
      UPDATE public.profiles
      SET
        name = COALESCE(NEW.raw_user_meta_data->>'name', name),
        profile_image = COALESCE(NEW.raw_user_meta_data->>'profile_image', profile_image),
        updated_at = now()
      WHERE user_id = NEW.id;
    END IF;

    RETURN NEW;
  END IF;

  RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.increment_notice_view_count(notice_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  UPDATE notices
  SET view_count = view_count + 1
  WHERE id = notice_id AND is_published = TRUE;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.increment_service_view_count()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
BEGIN
    UPDATE public.services
    SET view_count = COALESCE(view_count, 0) + 1
    WHERE id = NEW.service_id;

    RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.is_admin()
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
DECLARE
  is_admin_user boolean;
BEGIN
  -- admins 테이블에서 현재 사용자 확인
  SELECT EXISTS (
    SELECT 1
    FROM public.admins
    WHERE user_id = auth.uid()
  ) INTO is_admin_user;

  RETURN is_admin_user;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.is_buyer()
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
BEGIN
    -- Check if current user exists in buyers table and is active
    RETURN EXISTS (
        SELECT 1 FROM public.buyers
        WHERE user_id = auth.uid()
        AND is_active = true
    );
END;
$function$
;

CREATE OR REPLACE FUNCTION public.is_buyer(check_user_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.buyers
        WHERE user_id = check_user_id
    );
END;
$function$
;

CREATE OR REPLACE FUNCTION public.is_seller(check_user_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.sellers
        WHERE user_id = check_user_id
    );
END;
$function$
;

CREATE OR REPLACE FUNCTION public.is_seller()
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
BEGIN
    -- Check if current user exists in sellers table and is active
    RETURN EXISTS (
        SELECT 1 FROM public.sellers
        WHERE user_id = auth.uid()
        AND is_active = true
    );
END;
$function$
;

CREATE OR REPLACE FUNCTION public.is_verified_seller(check_user_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.sellers
        WHERE user_id = check_user_id
        AND is_verified = true
    );
END;
$function$
;

CREATE OR REPLACE FUNCTION public.mark_errand_messages_as_read(p_errand_id uuid, p_user_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$ DECLARE v_profile_id UUID; BEGIN SELECT id INTO v_profile_id FROM profiles WHERE user_id = p_user_id; IF v_profile_id IS NULL THEN RETURN; END IF; UPDATE errand_chat_messages SET is_read = TRUE WHERE errand_id = p_errand_id AND sender_id != v_profile_id AND is_read = FALSE; END; $function$
;

CREATE OR REPLACE FUNCTION public.mark_room_messages_as_read(p_room_id uuid, p_user_id uuid)
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  updated_count INTEGER;
BEGIN
  UPDATE chat_messages
  SET is_read = true,
      updated_at = NOW()
  WHERE room_id = p_room_id
    AND is_read = false
    AND sender_id != p_user_id;

  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RETURN updated_count;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.notify_new_order()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
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
;

CREATE OR REPLACE FUNCTION public.notify_order_status_change()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
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
;

CREATE OR REPLACE FUNCTION public.owns_service(service_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.services
        WHERE id = service_id
        AND seller_id = auth.uid()
    );
END;
$function$
;

CREATE OR REPLACE FUNCTION public.set_visited_date(p_category_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO category_visits (user_id, category_id, visited_at)
  VALUES (auth.uid(), p_category_id, NOW())
  ON CONFLICT (user_id, category_id)
  DO UPDATE SET visited_at = NOW();
END;
$function$
;

CREATE OR REPLACE FUNCTION public.update_chat_room_last_message()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  UPDATE chat_rooms
  SET
    last_message_at = NEW.created_at,
    updated_at = NOW()
  WHERE id = NEW.room_id;

  RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.update_coupon_issued_quantity()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$
BEGIN
    UPDATE public.coupons
    SET issued_quantity = issued_quantity + 1
    WHERE id = NEW.coupon_id;
    RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.update_errand_chat_messages_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$ BEGIN NEW.updated_at = NOW(); RETURN NEW; END; $function$
;

CREATE OR REPLACE FUNCTION public.update_food_store_rating()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$ BEGIN UPDATE food_stores SET rating = (SELECT COALESCE(AVG(rating), 0) FROM food_reviews WHERE store_id = NEW.store_id), review_count = (SELECT COUNT(*) FROM food_reviews WHERE store_id = NEW.store_id), updated_at = NOW() WHERE id = NEW.store_id; RETURN NEW; END; $function$
;

CREATE OR REPLACE FUNCTION public.update_notices_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.update_quote_response_count()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE public.quotes
        SET response_count = response_count + 1
        WHERE id = NEW.quote_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE public.quotes
        SET response_count = GREATEST(response_count - 1, 0)
        WHERE id = OLD.quote_id;
    END IF;
    RETURN COALESCE(NEW, OLD);
END;
$function$
;

CREATE OR REPLACE FUNCTION public.update_service_orders_count()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$ BEGIN IF TG_OP = 'INSERT' THEN UPDATE services SET orders_count = orders_count + 1 WHERE id = NEW.service_id; RETURN NEW; END IF; RETURN NULL; END; $function$
;

CREATE OR REPLACE FUNCTION public.update_service_views_count()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$ BEGIN UPDATE services SET views = views + 1 WHERE id = NEW.service_id; RETURN NEW; END; $function$
;

CREATE OR REPLACE FUNCTION public.update_service_wishlist_count()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$ BEGIN IF TG_OP = 'INSERT' THEN UPDATE services SET wishlist_count = wishlist_count + 1 WHERE id = NEW.service_id; RETURN NEW; ELSIF TG_OP = 'DELETE' THEN UPDATE services SET wishlist_count = GREATEST(wishlist_count - 1, 0) WHERE id = OLD.service_id; RETURN OLD; END IF; RETURN NULL; END; $function$
;

CREATE OR REPLACE FUNCTION public.update_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.update_user_profile(p_name text, p_profile_image text DEFAULT NULL::text)
 RETURNS TABLE(id uuid, email text, name text, profile_image text, role text, created_at timestamp with time zone, updated_at timestamp with time zone)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Only allow users to update their own profile
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  -- Validate input
  IF p_name IS NULL OR trim(p_name) = '' THEN
    RAISE EXCEPTION 'Name is required';
  END IF;

  -- Update and return the user profile
  RETURN QUERY
  UPDATE users
  SET
    name = p_name,
    profile_image = p_profile_image,
    updated_at = now()
  WHERE id = auth.uid()
  RETURNING
    users.id,
    users.email,
    users.name,
    users.profile_image,
    users.role,
    users.created_at,
    users.updated_at;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.update_users_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$function$
;

