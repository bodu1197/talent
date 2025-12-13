-- ============================================================================
-- FIX LINTER CONFLICTS SCRIPT
-- ============================================================================
-- Purpose:
-- 1. Restore Foreign Key indexes that were dropped (causing "Unindexed Foreign Keys").
-- 2. Remove truly redundant indexes (like `idx_users_id`).
--
-- Instructions:
-- 1. Run this script in Supabase SQL Editor.
-- 2. NOTE: You may still see "Unused Index" warnings for Foreign Keys (e.g. idx_orders_buyer_id).
--    Please IGNORE these warnings. Removing these indexes will cause the more critical
--    "Unindexed Foreign Keys" error. We must keep them for database integrity.
-- ============================================================================

BEGIN;

-- 1. Restore Critical Foreign Key Indexes
-- These fix the "Unindexed foreign keys" errors reported by the linter.

CREATE INDEX IF NOT EXISTS idx_advertising_campaigns_seller_id ON public.advertising_campaigns(seller_id);
CREATE INDEX IF NOT EXISTS idx_advertising_impressions_user_id ON public.advertising_impressions(user_id);
CREATE INDEX IF NOT EXISTS idx_advertising_payments_confirmed_by ON public.advertising_payments(confirmed_by);
CREATE INDEX IF NOT EXISTS idx_advertising_payments_tax_invoice_id ON public.advertising_payments(tax_invoice_id);
CREATE INDEX IF NOT EXISTS idx_advertising_subscriptions_bank_transfer_confirmed_by ON public.advertising_subscriptions(bank_transfer_confirmed_by);
CREATE INDEX IF NOT EXISTS idx_conversations_participant2_id ON public.conversations(participant2_id);
CREATE INDEX IF NOT EXISTS idx_errand_disputes_errand_id ON public.errand_disputes(errand_id);
CREATE INDEX IF NOT EXISTS idx_errand_disputes_reported_id ON public.errand_disputes(reported_id);
CREATE INDEX IF NOT EXISTS idx_errand_disputes_reporter_id ON public.errand_disputes(reporter_id);
CREATE INDEX IF NOT EXISTS idx_errand_disputes_resolved_by ON public.errand_disputes(resolved_by);
CREATE INDEX IF NOT EXISTS idx_errand_locations_helper_id ON public.errand_locations(helper_id);
CREATE INDEX IF NOT EXISTS idx_errand_messages_sender_id ON public.errand_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_errand_reviews_reviewer_id ON public.errand_reviews(reviewer_id);
CREATE INDEX IF NOT EXISTS idx_errand_stops_errand_id ON public.errand_stops(errand_id);
CREATE INDEX IF NOT EXISTS idx_helper_withdrawals_processed_by ON public.helper_withdrawals(processed_by);
CREATE INDEX IF NOT EXISTS idx_order_settlements_batch_settlement_id ON public.order_settlements(batch_settlement_id);
CREATE INDEX IF NOT EXISTS idx_payment_requests_order_id ON public.payment_requests(order_id);
CREATE INDEX IF NOT EXISTS idx_service_tags_tag_id ON public.service_tags(tag_id);
CREATE INDEX IF NOT EXISTS idx_tax_invoices_payment_id ON public.tax_invoices(payment_id);
CREATE INDEX IF NOT EXISTS idx_tax_invoices_subscription_id ON public.tax_invoices(subscription_id);

-- 2. Drop Redundant Indexes
-- idx_users_id is redundant because 'id' is the Primary Key.

DROP INDEX IF EXISTS idx_users_id;

-- Note regarding "Unused Index":
-- Indexes like `idx_admins_user_id`, `idx_orders_buyer_id`, etc., ARE required for Foreign Keys.
-- Even if the linter says they are unused, DO NOT remove them, or you will get "Unindexed Foreign Keys" errors.

COMMIT;
