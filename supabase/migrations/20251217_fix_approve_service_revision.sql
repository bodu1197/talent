-- approve_service_revision 함수 수정: 중복 카테고리 처리 및 충돌 방지
-- 409 Conflict 오류 해결을 위한 DISTINCT 및 ON CONFLICT 추가

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
$function$;

COMMENT ON FUNCTION public.approve_service_revision(uuid) IS
'서비스 수정 요청 승인 - DISTINCT와 ON CONFLICT로 중복 카테고리 처리';
