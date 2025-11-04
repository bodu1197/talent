-- ============================================
-- 심부름 카테고리 재구성
-- ============================================

-- 1. 기존 심부름 카테고리와 모든 하위 카테고리 삭제
DELETE FROM categories WHERE slug = 'errands';
DELETE FROM categories WHERE parent_id IN (
  SELECT id FROM categories WHERE slug = 'delivery-service' OR slug = 'errand-service'
);
DELETE FROM categories WHERE slug IN ('delivery-service', 'errand-service');

-- 2. 새로운 심부름 카테고리 구조 삽입

-- 1단계: 심부름 (메인 카테고리)
INSERT INTO categories (name, slug, icon, service_count, description, parent_id, level, is_ai, is_featured, is_active)
VALUES ('심부름', 'errands', 'running', 0, '일상 심부름 및 배달 서비스', NULL, 1, false, true, true);

-- 2단계: 배달 서비스
INSERT INTO categories (name, slug, icon, service_count, description, parent_id, level, is_ai, is_featured, is_active)
VALUES ('배달 서비스', 'delivery-service', 'truck', 0, '각종 물품 배달 및 운송',
  (SELECT id FROM categories WHERE slug = 'errands'), 2, false, false, true);

-- 3단계: 배달 서비스 하위 카테고리
INSERT INTO categories (name, slug, icon, service_count, description, parent_id, level, is_ai, is_featured, is_active)
VALUES
  ('꽃 배달', 'flower-delivery', 'flower', 0, '꽃다발 및 화환 배달',
    (SELECT id FROM categories WHERE slug = 'delivery-service'), 3, false, false, true),

  ('서류 배달', 'document-delivery', 'file-alt', 0, '중요 서류 및 문서 배달',
    (SELECT id FROM categories WHERE slug = 'delivery-service'), 3, false, false, true),

  ('선물 배달', 'gift-delivery', 'gift', 0, '선물 및 답례품 배달',
    (SELECT id FROM categories WHERE slug = 'delivery-service'), 3, false, false, true),

  ('음식 배달 대행', 'food-delivery', 'utensils', 0, '음식 주문 및 배달 대행',
    (SELECT id FROM categories WHERE slug = 'delivery-service'), 3, false, false, true),

  ('택배 대행', 'parcel-delivery', 'box', 0, '택배 발송 및 수령 대행',
    (SELECT id FROM categories WHERE slug = 'delivery-service'), 3, false, false, true),

  ('장보기', 'grocery-shopping', 'shopping-cart', 0, '장보기 및 식료품 구매 대행',
    (SELECT id FROM categories WHERE slug = 'delivery-service'), 3, false, false, true);

-- 확인 쿼리
SELECT
  CASE
    WHEN c.level = 1 THEN c.name
    ELSE ''
  END as "1단계",
  CASE
    WHEN c.level = 2 THEN c.name
    ELSE ''
  END as "2단계",
  CASE
    WHEN c.level = 3 THEN c.name
    ELSE ''
  END as "3단계",
  c.slug as "slug"
FROM categories c
WHERE c.slug = 'errands'
   OR c.parent_id = (SELECT id FROM categories WHERE slug = 'errands')
   OR c.parent_id IN (SELECT id FROM categories WHERE parent_id = (SELECT id FROM categories WHERE slug = 'errands'))
ORDER BY c.level, c.name;
