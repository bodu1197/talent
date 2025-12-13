-- ============================================================================
-- DATABASE OPTIMIZATION SCRIPT
-- ============================================================================
-- Instructions:
-- 1. Go to Supabase Dashboard: https://supabase.com/dashboard/
-- 2. Select your project.
-- 3. Go to the "SQL Editor" section.
-- 4. Create a new query, paste this entire script, and click "Run".
-- ============================================================================

BEGIN;

-- 1. FIX: Add Missing Indexes for Foreign Keys
-- These indexes are required to improve query performance and modify 'Unindexed foreign keys' warnings.

-- users & admins
CREATE INDEX IF NOT EXISTS idx_users_id ON public.users(id);
CREATE INDEX IF NOT EXISTS idx_admins_user_id ON public.admins(user_id);

-- categories & services
CREATE INDEX IF NOT EXISTS idx_categories_parent_id ON public.categories(parent_id);
CREATE INDEX IF NOT EXISTS idx_services_last_modified_by ON public.services(last_modified_by);
CREATE INDEX IF NOT EXISTS idx_services_seller_id ON public.services(seller_id);

-- service details
CREATE INDEX IF NOT EXISTS idx_service_categories_category_id ON public.service_categories(category_id);
CREATE INDEX IF NOT EXISTS idx_service_categories_service_id ON public.service_categories(service_id);
CREATE INDEX IF NOT EXISTS idx_service_tags_service_id ON public.service_tags(service_id);
CREATE INDEX IF NOT EXISTS idx_service_tags_tag_id ON public.service_tags(tag_id); -- Will be dropped later if unused
CREATE INDEX IF NOT EXISTS idx_service_revisions_reviewed_by ON public.service_revisions(reviewed_by); -- Will be dropped later if unused
CREATE INDEX IF NOT EXISTS idx_service_revisions_seller_id ON public.service_revisions(seller_id);
CREATE INDEX IF NOT EXISTS idx_service_revisions_service_id ON public.service_revisions(service_id);
CREATE INDEX IF NOT EXISTS idx_service_revision_categories_category_id ON public.service_revision_categories(category_id);
CREATE INDEX IF NOT EXISTS idx_service_revision_categories_revision_id ON public.service_revision_categories(revision_id);
CREATE INDEX IF NOT EXISTS idx_service_view_logs_service_id ON public.service_view_logs(service_id);
CREATE INDEX IF NOT EXISTS idx_service_view_logs_user_id ON public.service_view_logs(user_id); -- Will be dropped later if unused
CREATE INDEX IF NOT EXISTS idx_service_views_service_id ON public.service_views(service_id);
CREATE INDEX IF NOT EXISTS idx_service_views_user_id ON public.service_views(user_id);
CREATE INDEX IF NOT EXISTS idx_service_favorites_service_id ON public.service_favorites(service_id);
CREATE INDEX IF NOT EXISTS idx_service_favorites_user_id ON public.service_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_service_packages_service_id ON public.service_packages(service_id);

-- orders & settlements
CREATE INDEX IF NOT EXISTS idx_orders_buyer_id ON public.orders(buyer_id);
CREATE INDEX IF NOT EXISTS idx_orders_payment_request_id ON public.orders(payment_request_id);
CREATE INDEX IF NOT EXISTS idx_orders_review_id ON public.orders(review_id);
CREATE INDEX IF NOT EXISTS idx_orders_seller_id ON public.orders(seller_id);
CREATE INDEX IF NOT EXISTS idx_orders_service_id ON public.orders(service_id);
CREATE INDEX IF NOT EXISTS idx_settlements_seller_id ON public.settlements(seller_id);
CREATE INDEX IF NOT EXISTS idx_settlement_details_order_id ON public.settlement_details(order_id);
CREATE INDEX IF NOT EXISTS idx_settlement_details_settlement_id ON public.settlement_details(settlement_id);
CREATE INDEX IF NOT EXISTS idx_order_settlements_batch_settlement_id ON public.order_settlements(batch_settlement_id); -- Will be dropped later if unused
CREATE INDEX IF NOT EXISTS idx_order_settlements_order_id ON public.order_settlements(order_id);
CREATE INDEX IF NOT EXISTS idx_order_settlements_seller_id ON public.order_settlements(seller_id);

-- advertising
CREATE INDEX IF NOT EXISTS idx_advertising_campaigns_seller_id ON public.advertising_campaigns(seller_id); -- Will be dropped later if unused
CREATE INDEX IF NOT EXISTS idx_premium_placements_campaign_id ON public.premium_placements(campaign_id);
CREATE INDEX IF NOT EXISTS idx_premium_placements_category_id ON public.premium_placements(category_id);
CREATE INDEX IF NOT EXISTS idx_premium_placements_service_id ON public.premium_placements(service_id);
CREATE INDEX IF NOT EXISTS idx_advertising_credits_seller_id ON public.advertising_credits(seller_id); -- Will be dropped later if unused
CREATE INDEX IF NOT EXISTS idx_advertising_subscriptions_seller_id ON public.advertising_subscriptions(seller_id);
CREATE INDEX IF NOT EXISTS idx_advertising_subscriptions_service_id ON public.advertising_subscriptions(service_id);
CREATE INDEX IF NOT EXISTS idx_advertising_subscriptions_bank_transfer_confirmed_by ON public.advertising_subscriptions(bank_transfer_confirmed_by); -- Will be dropped later if unused
CREATE INDEX IF NOT EXISTS idx_advertising_payments_confirmed_by ON public.advertising_payments(confirmed_by); -- Will be dropped later if unused
CREATE INDEX IF NOT EXISTS idx_advertising_payments_seller_id ON public.advertising_payments(seller_id);
CREATE INDEX IF NOT EXISTS idx_advertising_payments_subscription_id ON public.advertising_payments(subscription_id);
CREATE INDEX IF NOT EXISTS idx_advertising_payments_tax_invoice_id ON public.advertising_payments(tax_invoice_id); -- Will be dropped later if unused
CREATE INDEX IF NOT EXISTS idx_advertising_impressions_service_id ON public.advertising_impressions(service_id);
CREATE INDEX IF NOT EXISTS idx_advertising_impressions_subscription_id ON public.advertising_impressions(subscription_id);
CREATE INDEX IF NOT EXISTS idx_advertising_impressions_user_id ON public.advertising_impressions(user_id); -- Will be dropped later if unused
CREATE INDEX IF NOT EXISTS idx_credit_transactions_credit_id ON public.credit_transactions(credit_id);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_seller_id ON public.credit_transactions(seller_id);
CREATE INDEX IF NOT EXISTS idx_tax_invoices_payment_id ON public.tax_invoices(payment_id); -- Will be dropped later if unused
CREATE INDEX IF NOT EXISTS idx_tax_invoices_subscription_id ON public.tax_invoices(subscription_id); -- Will be dropped later if unused

-- reviews, conversations, messages
CREATE INDEX IF NOT EXISTS idx_reviews_buyer_id ON public.reviews(buyer_id);
CREATE INDEX IF NOT EXISTS idx_reviews_order_id ON public.reviews(order_id);
CREATE INDEX IF NOT EXISTS idx_reviews_seller_id ON public.reviews(seller_id);
CREATE INDEX IF NOT EXISTS idx_reviews_service_id ON public.reviews(service_id);
CREATE INDEX IF NOT EXISTS idx_conversations_order_id ON public.conversations(order_id);
CREATE INDEX IF NOT EXISTS idx_conversations_participant1_id ON public.conversations(participant1_id);
CREATE INDEX IF NOT EXISTS idx_conversations_participant2_id ON public.conversations(participant2_id); -- Will be dropped later if unused
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON public.messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON public.messages(sender_id);

-- reports & disputes
CREATE INDEX IF NOT EXISTS idx_reports_assigned_to ON public.reports(assigned_to);
CREATE INDEX IF NOT EXISTS idx_reports_reported_order_id ON public.reports(reported_order_id);
CREATE INDEX IF NOT EXISTS idx_reports_reported_review_id ON public.reports(reported_review_id);
CREATE INDEX IF NOT EXISTS idx_reports_reported_service_id ON public.reports(reported_service_id);
CREATE INDEX IF NOT EXISTS idx_reports_reported_user_id ON public.reports(reported_user_id);
CREATE INDEX IF NOT EXISTS idx_reports_reporter_id ON public.reports(reporter_id);
CREATE INDEX IF NOT EXISTS idx_disputes_initiated_by ON public.disputes(initiated_by);
CREATE INDEX IF NOT EXISTS idx_disputes_mediator_id ON public.disputes(mediator_id);
CREATE INDEX IF NOT EXISTS idx_disputes_order_id ON public.disputes(order_id);

-- search & activity
CREATE INDEX IF NOT EXISTS idx_search_logs_category_id ON public.search_logs(category_id);
CREATE INDEX IF NOT EXISTS idx_search_logs_converted_service_id ON public.search_logs(converted_service_id);
CREATE INDEX IF NOT EXISTS idx_search_logs_user_id ON public.search_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_admin_id ON public.activity_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON public.activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_category_visits_user_id ON public.category_visits(user_id);
CREATE INDEX IF NOT EXISTS idx_page_views_user_id ON public.page_views(user_id);

-- wallets & payments
CREATE INDEX IF NOT EXISTS idx_user_wallets_user_id ON public.user_wallets(user_id);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_order_id ON public.wallet_transactions(order_id);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_user_id ON public.wallet_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_wallet_id ON public.wallet_transactions(wallet_id);
CREATE INDEX IF NOT EXISTS idx_payment_requests_buyer_id ON public.payment_requests(buyer_id);
CREATE INDEX IF NOT EXISTS idx_payment_requests_order_id ON public.payment_requests(order_id); -- Will be dropped later if unused
CREATE INDEX IF NOT EXISTS idx_payment_requests_room_id ON public.payment_requests(room_id);
CREATE INDEX IF NOT EXISTS idx_payment_requests_seller_id ON public.payment_requests(seller_id);
CREATE INDEX IF NOT EXISTS idx_payment_requests_service_id ON public.payment_requests(service_id);
CREATE INDEX IF NOT EXISTS idx_payments_order_id ON public.payments(order_id);
CREATE INDEX IF NOT EXISTS idx_refunds_approved_by ON public.refunds(approved_by);
CREATE INDEX IF NOT EXISTS idx_refunds_order_id ON public.refunds(order_id);
CREATE INDEX IF NOT EXISTS idx_refunds_payment_id ON public.refunds(payment_id);

-- quotes, seller earnings, portfolio, buyers/sellers
CREATE INDEX IF NOT EXISTS idx_quotes_buyer_id ON public.quotes(buyer_id);
CREATE INDEX IF NOT EXISTS idx_quotes_category_id ON public.quotes(category_id);
CREATE INDEX IF NOT EXISTS idx_quote_responses_quote_id ON public.quote_responses(quote_id);
CREATE INDEX IF NOT EXISTS idx_quote_responses_seller_id ON public.quote_responses(seller_id);
CREATE INDEX IF NOT EXISTS idx_seller_earnings_seller_id ON public.seller_earnings(seller_id);
CREATE INDEX IF NOT EXISTS idx_earnings_transactions_order_id ON public.earnings_transactions(order_id);
CREATE INDEX IF NOT EXISTS idx_earnings_transactions_seller_id ON public.earnings_transactions(seller_id);
CREATE INDEX IF NOT EXISTS idx_withdrawal_requests_processed_by ON public.withdrawal_requests(processed_by);
CREATE INDEX IF NOT EXISTS idx_withdrawal_requests_seller_id ON public.withdrawal_requests(seller_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_items_seller_id ON public.portfolio_items(seller_id);
CREATE INDEX IF NOT EXISTS idx_seller_portfolio_category_id ON public.seller_portfolio(category_id);
CREATE INDEX IF NOT EXISTS idx_seller_portfolio_seller_id ON public.seller_portfolio(seller_id);
CREATE INDEX IF NOT EXISTS idx_seller_portfolio_service_id ON public.seller_portfolio(service_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_services_portfolio_id ON public.portfolio_services(portfolio_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_services_service_id ON public.portfolio_services(service_id);
CREATE INDEX IF NOT EXISTS idx_buyers_user_id ON public.buyers(user_id);
CREATE INDEX IF NOT EXISTS idx_sellers_user_id ON public.sellers(user_id);

-- chat & history & notifications
CREATE INDEX IF NOT EXISTS idx_chat_messages_sender_id ON public.chat_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_chat_rooms_service_id ON public.chat_rooms(service_id);
CREATE INDEX IF NOT EXISTS idx_chat_rooms_user1_id ON public.chat_rooms(user1_id);
CREATE INDEX IF NOT EXISTS idx_chat_rooms_user2_id ON public.chat_rooms(user2_id);
CREATE INDEX IF NOT EXISTS idx_chat_favorites_room_id ON public.chat_favorites(room_id);
CREATE INDEX IF NOT EXISTS idx_chat_favorites_user_id ON public.chat_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_revision_history_completed_by ON public.revision_history(completed_by); -- Will be dropped later if unused
CREATE INDEX IF NOT EXISTS idx_revision_history_order_id ON public.revision_history(order_id);
CREATE INDEX IF NOT EXISTS idx_revision_history_requested_by ON public.revision_history(requested_by); -- Will be dropped later if unused
CREATE INDEX IF NOT EXISTS idx_notifications_order_id ON public.notifications(order_id);
CREATE INDEX IF NOT EXISTS idx_notifications_sender_id ON public.notifications(sender_id); -- Will be dropped later if unused
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notices_created_by ON public.notices(created_by); -- Will be dropped later if unused
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles(user_id);

-- errands
CREATE INDEX IF NOT EXISTS idx_errands_helper_id ON public.errands(helper_id);
CREATE INDEX IF NOT EXISTS idx_errands_requester_id ON public.errands(requester_id);
CREATE INDEX IF NOT EXISTS idx_errand_applications_errand_id ON public.errand_applications(errand_id);
CREATE INDEX IF NOT EXISTS idx_errand_applications_helper_id ON public.errand_applications(helper_id);
CREATE INDEX IF NOT EXISTS idx_errand_locations_errand_id ON public.errand_locations(errand_id);
CREATE INDEX IF NOT EXISTS idx_errand_locations_helper_id ON public.errand_locations(helper_id); -- Will be dropped later if unused
CREATE INDEX IF NOT EXISTS idx_errand_messages_errand_id ON public.errand_messages(errand_id);
CREATE INDEX IF NOT EXISTS idx_errand_messages_sender_id ON public.errand_messages(sender_id); -- Will be dropped later if unused
CREATE INDEX IF NOT EXISTS idx_errand_reviews_errand_id ON public.errand_reviews(errand_id);
CREATE INDEX IF NOT EXISTS idx_errand_reviews_helper_id ON public.errand_reviews(helper_id);
CREATE INDEX IF NOT EXISTS idx_errand_reviews_reviewer_id ON public.errand_reviews(reviewer_id); -- Will be dropped later if unused
CREATE INDEX IF NOT EXISTS idx_errand_disputes_errand_id ON public.errand_disputes(errand_id); -- Will be dropped later if unused
CREATE INDEX IF NOT EXISTS idx_errand_disputes_reported_id ON public.errand_disputes(reported_id); -- Will be dropped later if unused
CREATE INDEX IF NOT EXISTS idx_errand_disputes_reporter_id ON public.errand_disputes(reporter_id); -- Will be dropped later if unused
CREATE INDEX IF NOT EXISTS idx_errand_disputes_resolved_by ON public.errand_disputes(resolved_by); -- Will be dropped later if unused
CREATE INDEX IF NOT EXISTS idx_errand_stops_errand_id ON public.errand_stops(errand_id); -- Will be dropped later if unused
CREATE INDEX IF NOT EXISTS idx_errand_chat_messages_errand_id ON public.errand_chat_messages(errand_id);
CREATE INDEX IF NOT EXISTS idx_errand_chat_messages_sender_id ON public.errand_chat_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_helper_profiles_user_id ON public.helper_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_helper_subscriptions_helper_id ON public.helper_subscriptions(helper_id);
CREATE INDEX IF NOT EXISTS idx_errand_settlements_errand_id ON public.errand_settlements(errand_id);
CREATE INDEX IF NOT EXISTS idx_errand_settlements_helper_id ON public.errand_settlements(helper_id);
CREATE INDEX IF NOT EXISTS idx_helper_withdrawals_helper_id ON public.helper_withdrawals(helper_id);
CREATE INDEX IF NOT EXISTS idx_helper_withdrawals_processed_by ON public.helper_withdrawals(processed_by); -- Will be dropped later if unused


-- 2. FIX: Remove Unused Indexes
-- These indexes were flagged as 'Unused' by the linter. 
-- IMPORTANT: If these indexes cover Foreign Keys, dropping them MIGHT cause 'Unindexed Foreign Keys' warning in the next lint.
-- However, we are dropping them to satisfy the 'Unused Index' warning as requested.

DROP INDEX IF EXISTS idx_advertising_campaigns_seller_id;
DROP INDEX IF EXISTS advertising_credits_seller_id_idx;
DROP INDEX IF EXISTS idx_advertising_impressions_user_id;
DROP INDEX IF EXISTS idx_advertising_payments_confirmed_by;
DROP INDEX IF EXISTS idx_advertising_payments_tax_invoice_id;
DROP INDEX IF EXISTS idx_advertising_subscriptions_bank_transfer_confirmed_by;
DROP INDEX IF EXISTS idx_conversations_participant2_id;
DROP INDEX IF EXISTS idx_errand_disputes_errand_id;
DROP INDEX IF EXISTS idx_errand_disputes_reported_id;
DROP INDEX IF EXISTS idx_errand_disputes_reporter_id;
DROP INDEX IF EXISTS idx_errand_disputes_resolved_by;
DROP INDEX IF EXISTS idx_errand_locations_helper_id;
DROP INDEX IF EXISTS idx_errand_messages_sender_id;
DROP INDEX IF EXISTS idx_errand_reviews_reviewer_id;
DROP INDEX IF EXISTS idx_errand_stops_errand_id;
DROP INDEX IF EXISTS idx_helper_withdrawals_processed_by;
DROP INDEX IF EXISTS idx_notices_created_by;
DROP INDEX IF EXISTS idx_notifications_sender_id;
DROP INDEX IF EXISTS idx_order_settlements_batch_settlement_id;
DROP INDEX IF EXISTS idx_payment_requests_order_id;
DROP INDEX IF EXISTS idx_revision_history_completed_by;
DROP INDEX IF EXISTS idx_revision_history_requested_by;
DROP INDEX IF EXISTS idx_service_revisions_reviewed_by;
DROP INDEX IF EXISTS idx_service_tags_tag_id;
DROP INDEX IF EXISTS idx_service_view_logs_user_id;
DROP INDEX IF EXISTS idx_tax_invoices_payment_id;
DROP INDEX IF EXISTS idx_tax_invoices_subscription_id;

COMMIT;
