-- Migration to remove unused indexes identified by linter
-- NOTE: All commands are commented out because these indexes correspond to Foreign Keys.
-- Removing them resolves the "Unused Index" lint but triggers the "Unindexed Foreign Keys" lint (and risks locking issues).
-- Uncomment specific lines only if you are certain the index is truly redundant (e.g. covered by another composite index).

-- advertising_campaigns
-- DROP INDEX IF EXISTS idx_advertising_campaigns_seller_id;

-- advertising_credits
-- DROP INDEX IF EXISTS advertising_credits_seller_id_idx;

-- advertising_impressions
-- DROP INDEX IF EXISTS idx_advertising_impressions_user_id;

-- advertising_payments
-- DROP INDEX IF EXISTS idx_advertising_payments_confirmed_by;
-- DROP INDEX IF EXISTS idx_advertising_payments_tax_invoice_id;

-- advertising_subscriptions
-- DROP INDEX IF EXISTS idx_advertising_subscriptions_bank_transfer_confirmed_by;

-- conversations
-- DROP INDEX IF EXISTS idx_conversations_participant2_id;

-- errand_disputes
-- DROP INDEX IF EXISTS idx_errand_disputes_errand_id;
-- DROP INDEX IF EXISTS idx_errand_disputes_reported_id;
-- DROP INDEX IF EXISTS idx_errand_disputes_reporter_id;
-- DROP INDEX IF EXISTS idx_errand_disputes_resolved_by;

-- errand_locations
-- DROP INDEX IF EXISTS idx_errand_locations_helper_id;

-- errand_messages
-- DROP INDEX IF EXISTS idx_errand_messages_sender_id;

-- errand_reviews
-- DROP INDEX IF EXISTS idx_errand_reviews_reviewer_id;

-- errand_stops
-- DROP INDEX IF EXISTS idx_errand_stops_errand_id;

-- helper_withdrawals
-- DROP INDEX IF EXISTS idx_helper_withdrawals_processed_by;

-- notices
-- DROP INDEX IF EXISTS idx_notices_created_by;

-- notifications
-- DROP INDEX IF EXISTS idx_notifications_sender_id;

-- order_settlements
-- DROP INDEX IF EXISTS idx_order_settlements_batch_settlement_id;

-- payment_requests
-- DROP INDEX IF EXISTS idx_payment_requests_order_id;

-- revision_history
-- DROP INDEX IF EXISTS idx_revision_history_completed_by;
-- DROP INDEX IF EXISTS idx_revision_history_requested_by;

-- service_revisions
-- DROP INDEX IF EXISTS idx_service_revisions_reviewed_by;

-- service_tags
-- DROP INDEX IF EXISTS idx_service_tags_tag_id;

-- service_view_logs
-- DROP INDEX IF EXISTS idx_service_view_logs_user_id;

-- tax_invoices
-- DROP INDEX IF EXISTS idx_tax_invoices_payment_id;
-- DROP INDEX IF EXISTS idx_tax_invoices_subscription_id;
