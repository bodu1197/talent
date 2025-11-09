-- Fix remaining duplicate_index warnings for category_visits table

-- 1. Drop duplicate index on category_visits.last_visited_at
DROP INDEX IF EXISTS public.idx_category_visits_last_visited;

-- 2. Drop duplicate index on category_visits.user_id
DROP INDEX IF EXISTS public.idx_category_visits_user_id;
