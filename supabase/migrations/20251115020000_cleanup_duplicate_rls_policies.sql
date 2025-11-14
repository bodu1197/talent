-- Cleanup duplicate RLS policies and optimize for performance
-- This migration removes old Korean-named policies that were duplicates of the new English-named policies

-- Remove duplicate Korean-named policies from advertising_credits
DROP POLICY IF EXISTS "판매자는 자신의 크레딧만 조회" ON advertising_credits;

-- Remove duplicate Korean-named policies from advertising_payments
DROP POLICY IF EXISTS "판매자는 자신의 결제 내역만 조회" ON advertising_payments;

-- Remove duplicate Korean-named policies from advertising_subscriptions
DROP POLICY IF EXISTS "판매자는 자신의 구독만 조회" ON advertising_subscriptions;
DROP POLICY IF EXISTS "판매자는 자신의 구독 생성 가능" ON advertising_subscriptions;
DROP POLICY IF EXISTS "판매자는 자신의 구독 수정 가능" ON advertising_subscriptions;

-- Remove duplicate Korean-named policies from credit_transactions
DROP POLICY IF EXISTS "판매자는 자신의 거래 내역만 조회" ON credit_transactions;

-- Remove duplicate Korean-named policies from tax_invoices
DROP POLICY IF EXISTS "관리자는 모든 세금계산서 조회 가능" ON tax_invoices;

-- Remove duplicate Korean-named policies from company_info
DROP POLICY IF EXISTS "판매자는 자신의 회사 정보만 조회" ON company_info;

-- Disable RLS on company_info (no proper FK relationship to sellers exists)
ALTER TABLE company_info DISABLE ROW LEVEL SECURITY;

-- Note: The following optimized English-named policies are already in place from previous migration:
-- - sellers_select_own_credits (advertising_credits)
-- - sellers_select_own_payments (advertising_payments)
-- - sellers_select_own_subscriptions (advertising_subscriptions)
-- - sellers_select_own_transactions (credit_transactions)
-- - sellers_select_own_invoices (tax_invoices)
--
-- All policies use optimized (select auth.uid()) pattern for better performance
-- All policies correctly join through sellers table: seller_id IN (SELECT id FROM sellers WHERE user_id = (select auth.uid()))
