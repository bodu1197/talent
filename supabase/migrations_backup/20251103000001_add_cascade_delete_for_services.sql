-- 서비스 삭제 시 관련 데이터도 함께 삭제되도록 CASCADE 설정

-- service_categories 외래키 업데이트
ALTER TABLE service_categories
  DROP CONSTRAINT IF EXISTS service_categories_service_id_fkey,
  ADD CONSTRAINT service_categories_service_id_fkey
    FOREIGN KEY (service_id)
    REFERENCES services(id)
    ON DELETE CASCADE;

-- service_revisions 외래키 업데이트
ALTER TABLE service_revisions
  DROP CONSTRAINT IF EXISTS service_revisions_service_id_fkey,
  ADD CONSTRAINT service_revisions_service_id_fkey
    FOREIGN KEY (service_id)
    REFERENCES services(id)
    ON DELETE CASCADE;

-- service_favorites 외래키 업데이트
ALTER TABLE service_favorites
  DROP CONSTRAINT IF EXISTS service_favorites_service_id_fkey,
  ADD CONSTRAINT service_favorites_service_id_fkey
    FOREIGN KEY (service_id)
    REFERENCES services(id)
    ON DELETE CASCADE;

-- service_views 외래키 업데이트 (테이블이 있다면)
DO $$
BEGIN
  IF EXISTS (
    SELECT FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_name = 'service_views'
  ) THEN
    ALTER TABLE service_views
      DROP CONSTRAINT IF EXISTS service_views_service_id_fkey,
      ADD CONSTRAINT service_views_service_id_fkey
        FOREIGN KEY (service_id)
        REFERENCES services(id)
        ON DELETE CASCADE;
  END IF;
END $$;

-- reviews 외래키 업데이트 (서비스 삭제 시 리뷰는 유지하되 service_id를 NULL로 설정)
ALTER TABLE reviews
  DROP CONSTRAINT IF EXISTS reviews_service_id_fkey,
  ADD CONSTRAINT reviews_service_id_fkey
    FOREIGN KEY (service_id)
    REFERENCES services(id)
    ON DELETE SET NULL;

-- orders는 삭제하지 않고 service_id를 NULL로 설정 (주문 기록 보존)
ALTER TABLE orders
  DROP CONSTRAINT IF EXISTS orders_service_id_fkey,
  ADD CONSTRAINT orders_service_id_fkey
    FOREIGN KEY (service_id)
    REFERENCES services(id)
    ON DELETE SET NULL;
