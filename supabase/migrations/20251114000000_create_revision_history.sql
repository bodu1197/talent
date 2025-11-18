-- 수정 요청 이력 관리 테이블 생성
-- 구매자가 여러 번 수정 요청할 수 있도록 이력을 저장

-- 1. revision_history 테이블 생성
CREATE TABLE IF NOT EXISTS revision_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  requested_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reason text NOT NULL,
  requested_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  completed_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,

  -- 제약 조건
  CONSTRAINT revision_history_reason_not_empty CHECK (length(trim(reason)) > 0)
);

-- 2. 인덱스 생성 (조회 성능 최적화)
-- order_id로 특정 주문의 수정 이력 조회
CREATE INDEX IF NOT EXISTS idx_revision_history_order_id ON revision_history(order_id);

-- requested_at으로 시간순 정렬
CREATE INDEX IF NOT EXISTS idx_revision_history_requested_at ON revision_history(requested_at DESC);

-- 미완료 수정 요청 조회 (completed_at이 NULL인 것)
CREATE INDEX IF NOT EXISTS idx_revision_history_incomplete ON revision_history(order_id, completed_at)
WHERE completed_at IS NULL;

-- 3. RLS (Row Level Security) 활성화
ALTER TABLE revision_history ENABLE ROW LEVEL SECURITY;

-- 4. RLS 정책 설정

-- 기존 정책 삭제
DROP POLICY IF EXISTS "구매자는 자신의 수정 요청 이력 조회 가능" ON revision_history;
DROP POLICY IF EXISTS "판매자는 판매 주문의 수정 이력 조회 가능" ON revision_history;
DROP POLICY IF EXISTS "구매자는 수정 요청 생성 가능" ON revision_history;
DROP POLICY IF EXISTS "판매자는 수정 완료 처리 가능" ON revision_history;

-- 구매자는 자신이 요청한 수정 이력만 조회 가능
CREATE POLICY "구매자는 자신의 수정 요청 이력 조회 가능"
ON revision_history FOR SELECT
TO authenticated
USING (
  requested_by = auth.uid()
);

-- 판매자는 자신이 판매한 주문의 수정 이력 조회 가능
CREATE POLICY "판매자는 판매 주문의 수정 이력 조회 가능"
ON revision_history FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM orders
    WHERE orders.id = revision_history.order_id
    AND orders.seller_id = auth.uid()
  )
);

-- 구매자만 수정 요청 생성 가능 (본인이 구매한 주문에 대해서만)
CREATE POLICY "구매자는 수정 요청 생성 가능"
ON revision_history FOR INSERT
TO authenticated
WITH CHECK (
  requested_by = auth.uid()
  AND EXISTS (
    SELECT 1 FROM orders
    WHERE orders.id = revision_history.order_id
    AND orders.buyer_id = auth.uid()
  )
);

-- 판매자만 수정 완료 처리 가능 (본인이 판매한 주문에 대해서만)
CREATE POLICY "판매자는 수정 완료 처리 가능"
ON revision_history FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM orders
    WHERE orders.id = revision_history.order_id
    AND orders.seller_id = auth.uid()
  )
)
WITH CHECK (
  completed_by = auth.uid()
  AND EXISTS (
    SELECT 1 FROM orders
    WHERE orders.id = revision_history.order_id
    AND orders.seller_id = auth.uid()
  )
);

-- 5. 주석 추가
COMMENT ON TABLE revision_history IS '주문 수정 요청 이력 테이블 - 구매자가 여러 번 수정 요청할 수 있도록 모든 이력을 저장';
COMMENT ON COLUMN revision_history.id IS '수정 요청 이력 고유 ID';
COMMENT ON COLUMN revision_history.order_id IS '주문 ID (외래키)';
COMMENT ON COLUMN revision_history.requested_by IS '수정 요청자 ID (구매자)';
COMMENT ON COLUMN revision_history.reason IS '수정 요청 사유';
COMMENT ON COLUMN revision_history.requested_at IS '수정 요청 시간';
COMMENT ON COLUMN revision_history.completed_at IS '수정 완료 시간 (NULL = 미완료)';
COMMENT ON COLUMN revision_history.completed_by IS '수정 완료자 ID (판매자)';

-- 6. 수정 횟수 조회를 위한 뷰 생성 (선택사항)
CREATE OR REPLACE VIEW order_revision_stats AS
SELECT
  order_id,
  COUNT(*) as total_revisions,
  COUNT(*) FILTER (WHERE completed_at IS NOT NULL) as completed_revisions,
  COUNT(*) FILTER (WHERE completed_at IS NULL) as pending_revisions,
  MAX(requested_at) as last_revision_requested_at
FROM revision_history
GROUP BY order_id;

COMMENT ON VIEW order_revision_stats IS '주문별 수정 요청 통계 뷰';
