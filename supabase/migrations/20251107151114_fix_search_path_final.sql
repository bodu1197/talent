-- Fix function search_path security warnings - FINAL
-- Set search_path to public schema for all functions to prevent SQL injection

-- 1. set_visited_date function
CREATE OR REPLACE FUNCTION public.set_visited_date(
  p_category_id UUID
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO category_visits (user_id, category_id, visited_at)
  VALUES (auth.uid(), p_category_id, NOW())
  ON CONFLICT (user_id, category_id)
  DO UPDATE SET visited_at = NOW();
END;
$$;

-- 2. cleanup_old_category_visits function
CREATE OR REPLACE FUNCTION public.cleanup_old_category_visits()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM category_visits
  WHERE visited_at < NOW() - INTERVAL '90 days';
END;
$$;

-- 3. get_recent_category_visits function
CREATE OR REPLACE FUNCTION public.get_recent_category_visits(
  p_user_id UUID,
  p_limit INT DEFAULT 10
)
RETURNS TABLE (
  category_id UUID,
  category_name TEXT,
  category_slug TEXT,
  visited_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    c.id,
    c.name,
    c.slug,
    cv.visited_at
  FROM category_visits cv
  JOIN categories c ON c.id = cv.category_id
  WHERE cv.user_id = p_user_id
  ORDER BY cv.visited_at DESC
  LIMIT p_limit;
END;
$$;

-- 4. get_random_ai_services function
CREATE OR REPLACE FUNCTION public.get_random_ai_services(
  p_limit INT DEFAULT 10
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  description TEXT,
  seller_id UUID,
  category_id UUID,
  price_basic INT,
  delivery_days_basic INT,
  thumbnail_url TEXT,
  view_count INT,
  wishlist_count INT,
  created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
$$;

-- 5. update_chat_room_last_message function
CREATE OR REPLACE FUNCTION public.update_chat_room_last_message()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE chat_rooms
  SET
    last_message = NEW.message,
    last_message_at = NEW.created_at,
    updated_at = NOW()
  WHERE id = NEW.room_id;

  RETURN NEW;
END;
$$;

-- 6. get_seller_id function
CREATE OR REPLACE FUNCTION public.get_seller_id(user_uuid UUID)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
DECLARE
  seller_uuid UUID;
BEGIN
  SELECT id INTO seller_uuid
  FROM sellers
  WHERE user_id = user_uuid
  LIMIT 1;

  RETURN seller_uuid;
END;
$$;

-- 7. get_buyer_id function
CREATE OR REPLACE FUNCTION public.get_buyer_id(user_uuid UUID)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
DECLARE
  buyer_uuid UUID;
BEGIN
  SELECT id INTO buyer_uuid
  FROM buyers
  WHERE user_id = user_uuid
  LIMIT 1;

  RETURN buyer_uuid;
END;
$$;
