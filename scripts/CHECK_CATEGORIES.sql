-- 생활 서비스 카테고리 확인 쿼리

-- 1. 생성된 카테고리 총 개수 확인 (21개여야 함)
SELECT COUNT(*) as 총개수
FROM categories
WHERE slug IN ('life-service', 'professional-cleaning', 'home-helper', 'home-repair', 'moving-service')
   OR slug LIKE 'deep-cleaning'
   OR slug LIKE 'office-cleaning'
   OR slug LIKE 'aircon-cleaning'
   OR slug LIKE 'housekeeping'
   OR slug LIKE 'babysitter'
   OR slug LIKE 'senior-care'
   OR slug LIKE 'pet-sitting'
   OR slug LIKE 'wallpaper-flooring'
   OR slug LIKE 'plumbing'
   OR slug LIKE 'screen-repair'
   OR slug LIKE 'kitchen-bathroom'
   OR slug LIKE 'interior-remodeling'
   OR slug LIKE 'moving-full'
   OR slug LIKE 'moving-half'
   OR slug LIKE 'small-moving'
   OR slug LIKE 'disposal-service';

-- 2. 생활 서비스 전체 구조 확인
SELECT
  c1.name as 대분류,
  c2.name as 중분류,
  c3.name as 소분류
FROM categories c1
LEFT JOIN categories c2 ON c2.parent_id = c1.id
LEFT JOIN categories c3 ON c3.parent_id = c2.id
WHERE c1.slug = 'life-service'
ORDER BY c2.name, c3.name;

-- 3. 1차 카테고리만 확인
SELECT * FROM categories WHERE slug = 'life-service';

-- 4. 2차 카테고리만 확인
SELECT * FROM categories
WHERE parent_id IN (SELECT id FROM categories WHERE slug = 'life-service');

-- 5. 3차 카테고리만 확인
SELECT c3.*, c2.name as 상위카테고리
FROM categories c3
JOIN categories c2 ON c3.parent_id = c2.id
WHERE c2.parent_id IN (SELECT id FROM categories WHERE slug = 'life-service')
ORDER BY c2.name, c3.name;
