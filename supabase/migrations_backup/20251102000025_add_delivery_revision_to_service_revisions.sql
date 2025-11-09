-- service_revisions 테이블에 delivery_days와 revision_count 컬럼 추가

ALTER TABLE public.service_revisions
ADD COLUMN IF NOT EXISTS delivery_days INTEGER;

ALTER TABLE public.service_revisions
ADD COLUMN IF NOT EXISTS revision_count INTEGER;
