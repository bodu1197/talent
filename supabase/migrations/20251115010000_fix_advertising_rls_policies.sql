-- Fix RLS policies for advertising_subscriptions table
-- Problem: Previous policy used auth.uid() = seller_id, but seller_id references sellers.id, not users.id

-- Drop old policies
DROP POLICY IF EXISTS "판매자는 자신의 구독만 조회" ON advertising_subscriptions;
DROP POLICY IF EXISTS "판매자는 자신의 구독 생성 가능" ON advertising_subscriptions;
DROP POLICY IF EXISTS "판매자는 자신의 구독 수정 가능" ON advertising_subscriptions;

-- Create new SELECT policy that correctly joins through sellers table
CREATE POLICY "판매자는 자신의 구독만 조회" ON advertising_subscriptions
  FOR SELECT
  USING (seller_id IN (SELECT id FROM sellers WHERE user_id = auth.uid()));

-- Note: INSERT and UPDATE policies are removed as these operations should only be done via Server Actions
-- which use the service role client and bypass RLS
