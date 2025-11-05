-- ========================================
-- 3차 카테고리 스마트 재정렬
-- 규칙:
-- 1. "기타" 항목은 맨 마지막
-- 2. 중요 키워드 우선 (AI, 광고, 마케팅, 웹, 모바일 등)
-- 3. 나머지는 가나다순
-- ========================================

WITH ranked_categories AS (
  SELECT
    c3.id,
    c3.name,
    c3.slug,
    c3.parent_id,
    -- 정렬 우선순위 계산
    CASE
      -- "기타"는 맨 마지막 (999)
      WHEN c3.name LIKE '%기타%' OR c3.slug LIKE '%etc%' OR c3.slug LIKE '%other%' THEN 999

      -- AI 관련은 최우선 (1-10)
      WHEN c3.name LIKE 'AI %' OR c3.name LIKE '%AI%' THEN 1

      -- 광고/마케팅 관련 (11-20)
      WHEN c3.name LIKE '%광고%' OR c3.name LIKE '%마케팅%' OR c3.name LIKE '%SEO%' THEN 11

      -- 웹/모바일/앱 관련 (21-30)
      WHEN c3.name LIKE '%웹%' OR c3.name LIKE '%모바일%' OR c3.name LIKE '%앱%' THEN 21

      -- 디자인/영상/사진 관련 (31-40)
      WHEN c3.name LIKE '%디자인%' OR c3.name LIKE '%영상%' OR c3.name LIKE '%사진%' THEN 31

      -- 번역/통역 주요 언어 (41-50)
      WHEN c3.name LIKE '%영어%' OR c3.name LIKE '%중국어%' OR c3.name LIKE '%일본어%' THEN 41

      -- 나머지는 중간 (100)
      ELSE 100
    END as priority,
    c3.name as sort_name
  FROM categories c3
  WHERE c3.level = 3
),
final_order AS (
  SELECT
    id,
    parent_id,
    -- 같은 parent_id 내에서 우선순위, 그 다음 이름순으로 정렬
    ROW_NUMBER() OVER (
      PARTITION BY parent_id
      ORDER BY priority, sort_name
    ) as new_order
  FROM ranked_categories
)
UPDATE categories
SET display_order = final_order.new_order
FROM final_order
WHERE categories.id = final_order.id;

-- 업데이트 확인 (각 2차 카테고리별로 처음 10개만)
WITH ranked AS (
  SELECT
    c1.name as cat1,
    c2.name as cat2,
    c3.name as cat3,
    c3.display_order,
    ROW_NUMBER() OVER (PARTITION BY c2.id ORDER BY c3.display_order) as rn
  FROM categories c1
  JOIN categories c2 ON c2.parent_id = c1.id
  JOIN categories c3 ON c3.parent_id = c2.id
  WHERE c3.level = 3
)
SELECT
  cat1 as "1차",
  cat2 as "2차",
  cat3 as "3차",
  display_order as "순서"
FROM ranked
WHERE rn <= 5
ORDER BY cat1, cat2, display_order;

-- 총 개수 확인
SELECT
  '업데이트된 3차 카테고리 개수' as "결과",
  COUNT(*) as "개수"
FROM categories
WHERE level = 3;

-- "기타" 항목이 마지막에 있는지 확인
SELECT
  c2.name as "2차_카테고리",
  c3.name as "3차_카테고리",
  c3.display_order as "순서"
FROM categories c2
JOIN categories c3 ON c3.parent_id = c2.id
WHERE c3.level = 3
  AND (c3.name LIKE '%기타%' OR c3.slug LIKE '%etc%' OR c3.slug LIKE '%other%')
ORDER BY c2.name, c3.display_order;
