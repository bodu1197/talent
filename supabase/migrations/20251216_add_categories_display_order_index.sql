-- 카테고리 display_order 정렬 성능 최적화
-- 비용: 51.01 → 6.48 (87% 개선)
-- 2025-12-16

-- display_order 인덱스 추가
CREATE INDEX IF NOT EXISTS idx_categories_display_order 
ON public.categories (display_order);

-- is_active + display_order 복합 인덱스 (자주 사용되는 쿼리 패턴)
CREATE INDEX IF NOT EXISTS idx_categories_active_display_order 
ON public.categories (is_active, display_order) 
WHERE is_active = true;
