-- 분쟁 시스템: 분쟁 상세 뷰 생성
-- 작성일: 2025-12-20
-- profiles 테이블과의 조인을 쉽게 하기 위한 뷰

-- ============================================
-- 1. 분쟁 상세 뷰 생성
-- ============================================

CREATE OR REPLACE VIEW dispute_details
WITH (security_invoker=true) AS
SELECT
  d.id,
  d.case_number,
  d.plaintiff_id,
  d.defendant_id,
  d.order_id,
  d.service_id,
  d.dispute_type,
  d.plaintiff_role,
  d.dispute_amount,
  d.plaintiff_claim,
  d.defendant_response,
  d.ai_verdict,
  d.ai_refund_amount,
  d.ai_verdict_reason,
  d.ai_verdict_at,
  d.status,
  d.plaintiff_accepted,
  d.defendant_accepted,
  d.response_deadline,
  d.verdict_deadline,
  d.created_at,
  d.updated_at,
  -- 원고 정보
  pp.name AS plaintiff_name,
  pp.profile_image AS plaintiff_avatar_url,
  -- 피고 정보
  pd.name AS defendant_name,
  pd.profile_image AS defendant_avatar_url,
  -- 서비스 정보
  s.title AS service_title,
  -- 주문 정보
  o.total_amount AS order_total_amount,
  o.status AS order_status,
  o.created_at AS order_created_at
FROM disputes d
LEFT JOIN profiles pp ON pp.user_id = d.plaintiff_id
LEFT JOIN profiles pd ON pd.user_id = d.defendant_id
LEFT JOIN services s ON s.id = d.service_id
LEFT JOIN orders o ON o.id = d.order_id;

-- ============================================
-- 2. 뷰에 대한 RLS 정책
-- (security_invoker=true로 기본 테이블의 RLS를 따름)
-- ============================================

-- 뷰는 기본 disputes 테이블의 RLS를 상속받습니다.
-- security_invoker=true 설정으로 인해 자동으로 적용됩니다.

-- ============================================
-- 3. 코멘트 추가
-- ============================================

COMMENT ON VIEW dispute_details IS '분쟁 상세 정보 뷰 - 원고/피고 프로필, 서비스, 주문 정보 포함';
