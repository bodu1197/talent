-- advertising_impressions 테이블의 category_id 외래 키 제약 조건 제거
-- 통계 목적이므로 카테고리 참조 무결성은 필요 없음

-- 1. 기존 외래 키 제약 조건 삭제
ALTER TABLE advertising_impressions
  DROP CONSTRAINT IF EXISTS advertising_impressions_category_id_fkey;

-- 2. category_id를 TEXT로 유지 (UUID가 아닌 일반 텍스트 ID 사용)
-- 이미 TEXT 타입이므로 변경 불필요

-- 3. 코멘트 업데이트
COMMENT ON COLUMN advertising_impressions.category_id IS '카테고리 ID (통계용, 외래 키 없음)';

-- 완료 메시지
DO $$
BEGIN
  RAISE NOTICE '광고 노출 테이블 category_id 제약 조건 제거 완료!';
  RAISE NOTICE '- category_id는 이제 자유 텍스트로 저장됩니다';
  RAISE NOTICE '- 통계 목적으로만 사용됩니다';
END $$;
