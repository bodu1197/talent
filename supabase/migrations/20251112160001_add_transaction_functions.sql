-- 트랜잭션 처리를 위한 PostgreSQL 함수들

-- 1. 광고 크레딧 안전 차감 함수 (Race Condition 방지)
CREATE OR REPLACE FUNCTION deduct_credit_safe(
  p_credit_id UUID,
  p_amount NUMERIC
)
RETURNS JSON
LANGUAGE plpgsql
AS $$
DECLARE
  v_current_amount NUMERIC;
  v_new_amount NUMERIC;
  v_result JSON;
BEGIN
  -- Row-level lock으로 동시성 제어
  SELECT amount INTO v_current_amount
  FROM advertising_credits
  WHERE id = p_credit_id
  FOR UPDATE;  -- 다른 트랜잭션이 동시에 수정 불가

  -- 잔액 부족 체크
  IF v_current_amount < p_amount THEN
    v_result := json_build_object(
      'success', false,
      'remaining', p_amount - v_current_amount,
      'error', '크레딧 잔액이 부족합니다'
    );
    RETURN v_result;
  END IF;

  -- 차감 실행
  v_new_amount := v_current_amount - p_amount;

  UPDATE advertising_credits
  SET
    amount = v_new_amount,
    used_amount = used_amount + p_amount,
    updated_at = NOW()
  WHERE id = p_credit_id;

  -- 성공 반환
  v_result := json_build_object(
    'success', true,
    'remaining', 0,
    'new_balance', v_new_amount
  );
  RETURN v_result;
END;
$$;

-- 2. 주문 생성 및 재고 차감 원자적 처리 (필요시 사용)
CREATE OR REPLACE FUNCTION create_order_atomic(
  p_buyer_id UUID,
  p_seller_id UUID,
  p_service_id UUID,
  p_amount NUMERIC,
  p_merchant_uid TEXT,
  p_order_data JSONB
)
RETURNS JSON
LANGUAGE plpgsql
AS $$
DECLARE
  v_order_id UUID;
  v_result JSON;
BEGIN
  -- 주문 생성
  INSERT INTO orders (
    buyer_id,
    seller_id,
    service_id,
    amount,
    merchant_uid,
    status,
    title,
    description,
    delivery_days,
    revision_count,
    base_amount,
    total_amount,
    seller_amount
  )
  VALUES (
    p_buyer_id,
    p_seller_id,
    p_service_id,
    p_amount,
    p_merchant_uid,
    'pending_payment',
    (p_order_data->>'title')::TEXT,
    (p_order_data->>'description')::TEXT,
    (p_order_data->>'delivery_days')::INTEGER,
    (p_order_data->>'revision_count')::INTEGER,
    p_amount,
    p_amount,
    p_amount
  )
  RETURNING id INTO v_order_id;

  -- 성공 반환
  v_result := json_build_object(
    'success', true,
    'order_id', v_order_id
  );
  RETURN v_result;

EXCEPTION
  WHEN unique_violation THEN
    -- merchant_uid 중복 시 에러 반환
    v_result := json_build_object(
      'success', false,
      'error', 'duplicate_merchant_uid',
      'message', '이미 존재하는 주문입니다'
    );
    RETURN v_result;
  WHEN OTHERS THEN
    v_result := json_build_object(
      'success', false,
      'error', 'internal_error',
      'message', SQLERRM
    );
    RETURN v_result;
END;
$$;

-- 3. 주석 추가
COMMENT ON FUNCTION deduct_credit_safe IS '광고 크레딧을 안전하게 차감 (Row Lock으로 동시성 제어)';
COMMENT ON FUNCTION create_order_atomic IS '주문 생성을 원자적으로 처리 (트랜잭션 보장)';
