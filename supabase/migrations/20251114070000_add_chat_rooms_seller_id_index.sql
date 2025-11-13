-- chat_rooms seller_id 인덱스 추가
-- 느린 쿼리 최적화: seller_id로 채팅방 조회 성능 향상

-- ============================================================
-- 문제점
-- ============================================================
-- 쿼리: SELECT id FROM chat_rooms WHERE seller_id = ?
-- 호출 횟수: 6,910회
-- 평균 시간: 0.87ms
-- 문제: seller_id 컬럼에 인덱스 없음
--
-- 해결: seller_id 인덱스 추가
-- 예상 효과: 0.87ms → 0.1-0.2ms (80% 향상)
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_chat_rooms_seller_id
ON chat_rooms(seller_id);

COMMENT ON INDEX idx_chat_rooms_seller_id IS
'판매자별 채팅방 조회 성능 향상 (느린 쿼리 최적화)';

-- ============================================================
-- 참고: chat_rooms 테이블 구조
-- ============================================================
-- chat_rooms 테이블은 user1_id, user2_id, seller_id를 가짐
-- - user1_id: 채팅 시작한 사용자
-- - user2_id: 채팅 상대방
-- - seller_id: 판매자 (서비스 제공자)
--
-- 기존 인덱스:
-- - idx_chat_rooms_user1_id (이미 존재)
-- - idx_chat_rooms_user2_id (이미 존재)
-- - idx_chat_rooms_seller_id (이번에 추가) ← NEW!
-- ============================================================
