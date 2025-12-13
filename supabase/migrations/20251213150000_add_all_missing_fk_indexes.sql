-- Add ALL missing foreign key indexes to improve query performance
-- This migration creates indexes for ALL foreign key columns that don't have a covering index
-- Note: Food delivery tables excluded (not currently in use)

-- ============================================================================
-- CORE SYSTEM TABLES
-- ============================================================================

-- users table
CREATE INDEX IF NOT EXISTS idx_users_id ON users(id);

-- admins
CREATE INDEX IF NOT EXISTS idx_admins_user_id ON admins(user_id);

-- categories
CREATE INDEX IF NOT EXISTS idx_categories_parent_id ON categories(parent_id);

-- ============================================================================
-- SERVICES
-- ============================================================================

-- services
CREATE INDEX IF NOT EXISTS idx_services_last_modified_by ON services(last_modified_by);
CREATE INDEX IF NOT EXISTS idx_services_seller_id ON services(seller_id);

-- service_categories
CREATE INDEX IF NOT EXISTS idx_service_categories_category_id ON service_categories(category_id);
CREATE INDEX IF NOT EXISTS idx_service_categories_service_id ON service_categories(service_id);

-- service_tags
CREATE INDEX IF NOT EXISTS idx_service_tags_service_id ON service_tags(service_id);
CREATE INDEX IF NOT EXISTS idx_service_tags_tag_id ON service_tags(tag_id);

-- service_revisions
CREATE INDEX IF NOT EXISTS idx_service_revisions_reviewed_by ON service_revisions(reviewed_by);
CREATE INDEX IF NOT EXISTS idx_service_revisions_seller_id ON service_revisions(seller_id);
CREATE INDEX IF NOT EXISTS idx_service_revisions_service_id ON service_revisions(service_id);

-- service_revision_categories
CREATE INDEX IF NOT EXISTS idx_service_revision_categories_category_id ON service_revision_categories(category_id);
CREATE INDEX IF NOT EXISTS idx_service_revision_categories_revision_id ON service_revision_categories(revision_id);

-- service_view_logs
CREATE INDEX IF NOT EXISTS idx_service_view_logs_service_id ON service_view_logs(service_id);
CREATE INDEX IF NOT EXISTS idx_service_view_logs_user_id ON service_view_logs(user_id);

-- service_views
CREATE INDEX IF NOT EXISTS idx_service_views_service_id ON service_views(service_id);
CREATE INDEX IF NOT EXISTS idx_service_views_user_id ON service_views(user_id);

-- service_favorites
CREATE INDEX IF NOT EXISTS idx_service_favorites_service_id ON service_favorites(service_id);
CREATE INDEX IF NOT EXISTS idx_service_favorites_user_id ON service_favorites(user_id);

-- service_packages
CREATE INDEX IF NOT EXISTS idx_service_packages_service_id ON service_packages(service_id);

-- ============================================================================
-- ORDERS
-- ============================================================================

-- orders
CREATE INDEX IF NOT EXISTS idx_orders_buyer_id ON orders(buyer_id);
CREATE INDEX IF NOT EXISTS idx_orders_payment_request_id ON orders(payment_request_id);
CREATE INDEX IF NOT EXISTS idx_orders_review_id ON orders(review_id);
CREATE INDEX IF NOT EXISTS idx_orders_seller_id ON orders(seller_id);
CREATE INDEX IF NOT EXISTS idx_orders_service_id ON orders(service_id);

-- ============================================================================
-- SETTLEMENTS
-- ============================================================================

-- settlements
CREATE INDEX IF NOT EXISTS idx_settlements_seller_id ON settlements(seller_id);

-- settlement_details
CREATE INDEX IF NOT EXISTS idx_settlement_details_order_id ON settlement_details(order_id);
CREATE INDEX IF NOT EXISTS idx_settlement_details_settlement_id ON settlement_details(settlement_id);

-- order_settlements
CREATE INDEX IF NOT EXISTS idx_order_settlements_batch_settlement_id ON order_settlements(batch_settlement_id);
CREATE INDEX IF NOT EXISTS idx_order_settlements_order_id ON order_settlements(order_id);
CREATE INDEX IF NOT EXISTS idx_order_settlements_seller_id ON order_settlements(seller_id);

-- ============================================================================
-- ADVERTISING
-- ============================================================================

-- advertising_campaigns
CREATE INDEX IF NOT EXISTS idx_advertising_campaigns_seller_id ON advertising_campaigns(seller_id);

-- premium_placements
CREATE INDEX IF NOT EXISTS idx_premium_placements_campaign_id ON premium_placements(campaign_id);
CREATE INDEX IF NOT EXISTS idx_premium_placements_category_id ON premium_placements(category_id);
CREATE INDEX IF NOT EXISTS idx_premium_placements_service_id ON premium_placements(service_id);

-- advertising_credits
CREATE INDEX IF NOT EXISTS idx_advertising_credits_seller_id ON advertising_credits(seller_id);

-- advertising_subscriptions
CREATE INDEX IF NOT EXISTS idx_advertising_subscriptions_bank_transfer_confirmed_by ON advertising_subscriptions(bank_transfer_confirmed_by);
CREATE INDEX IF NOT EXISTS idx_advertising_subscriptions_seller_id ON advertising_subscriptions(seller_id);
CREATE INDEX IF NOT EXISTS idx_advertising_subscriptions_service_id ON advertising_subscriptions(service_id);

-- advertising_payments
CREATE INDEX IF NOT EXISTS idx_advertising_payments_confirmed_by ON advertising_payments(confirmed_by);
CREATE INDEX IF NOT EXISTS idx_advertising_payments_seller_id ON advertising_payments(seller_id);
CREATE INDEX IF NOT EXISTS idx_advertising_payments_subscription_id ON advertising_payments(subscription_id);
CREATE INDEX IF NOT EXISTS idx_advertising_payments_tax_invoice_id ON advertising_payments(tax_invoice_id);

-- advertising_impressions
CREATE INDEX IF NOT EXISTS idx_advertising_impressions_service_id ON advertising_impressions(service_id);
CREATE INDEX IF NOT EXISTS idx_advertising_impressions_subscription_id ON advertising_impressions(subscription_id);
CREATE INDEX IF NOT EXISTS idx_advertising_impressions_user_id ON advertising_impressions(user_id);

-- credit_transactions
CREATE INDEX IF NOT EXISTS idx_credit_transactions_credit_id ON credit_transactions(credit_id);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_seller_id ON credit_transactions(seller_id);

-- tax_invoices
CREATE INDEX IF NOT EXISTS idx_tax_invoices_payment_id ON tax_invoices(payment_id);
CREATE INDEX IF NOT EXISTS idx_tax_invoices_subscription_id ON tax_invoices(subscription_id);

-- ============================================================================
-- REVIEWS
-- ============================================================================

-- reviews
CREATE INDEX IF NOT EXISTS idx_reviews_buyer_id ON reviews(buyer_id);
CREATE INDEX IF NOT EXISTS idx_reviews_order_id ON reviews(order_id);
CREATE INDEX IF NOT EXISTS idx_reviews_seller_id ON reviews(seller_id);
CREATE INDEX IF NOT EXISTS idx_reviews_service_id ON reviews(service_id);

-- ============================================================================
-- CONVERSATIONS & MESSAGES
-- ============================================================================

-- conversations
CREATE INDEX IF NOT EXISTS idx_conversations_order_id ON conversations(order_id);
CREATE INDEX IF NOT EXISTS idx_conversations_participant1_id ON conversations(participant1_id);
CREATE INDEX IF NOT EXISTS idx_conversations_participant2_id ON conversations(participant2_id);

-- messages
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);

-- ============================================================================
-- REPORTS & DISPUTES
-- ============================================================================

-- reports
CREATE INDEX IF NOT EXISTS idx_reports_assigned_to ON reports(assigned_to);
CREATE INDEX IF NOT EXISTS idx_reports_reported_order_id ON reports(reported_order_id);
CREATE INDEX IF NOT EXISTS idx_reports_reported_review_id ON reports(reported_review_id);
CREATE INDEX IF NOT EXISTS idx_reports_reported_service_id ON reports(reported_service_id);
CREATE INDEX IF NOT EXISTS idx_reports_reported_user_id ON reports(reported_user_id);
CREATE INDEX IF NOT EXISTS idx_reports_reporter_id ON reports(reporter_id);

-- disputes
CREATE INDEX IF NOT EXISTS idx_disputes_initiated_by ON disputes(initiated_by);
CREATE INDEX IF NOT EXISTS idx_disputes_mediator_id ON disputes(mediator_id);
CREATE INDEX IF NOT EXISTS idx_disputes_order_id ON disputes(order_id);

-- ============================================================================
-- SEARCH & ACTIVITY LOGS
-- ============================================================================

-- search_logs
CREATE INDEX IF NOT EXISTS idx_search_logs_category_id ON search_logs(category_id);
CREATE INDEX IF NOT EXISTS idx_search_logs_converted_service_id ON search_logs(converted_service_id);
CREATE INDEX IF NOT EXISTS idx_search_logs_user_id ON search_logs(user_id);

-- activity_logs
CREATE INDEX IF NOT EXISTS idx_activity_logs_admin_id ON activity_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON activity_logs(user_id);

-- category_visits
CREATE INDEX IF NOT EXISTS idx_category_visits_user_id ON category_visits(user_id);

-- page_views
CREATE INDEX IF NOT EXISTS idx_page_views_user_id ON page_views(user_id);

-- ============================================================================
-- WALLETS
-- ============================================================================

-- user_wallets
CREATE INDEX IF NOT EXISTS idx_user_wallets_user_id ON user_wallets(user_id);

-- wallet_transactions
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_order_id ON wallet_transactions(order_id);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_user_id ON wallet_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_wallet_id ON wallet_transactions(wallet_id);

-- ============================================================================
-- QUOTES
-- ============================================================================

-- quotes
CREATE INDEX IF NOT EXISTS idx_quotes_buyer_id ON quotes(buyer_id);
CREATE INDEX IF NOT EXISTS idx_quotes_category_id ON quotes(category_id);

-- quote_responses
CREATE INDEX IF NOT EXISTS idx_quote_responses_quote_id ON quote_responses(quote_id);
CREATE INDEX IF NOT EXISTS idx_quote_responses_seller_id ON quote_responses(seller_id);

-- ============================================================================
-- SELLER EARNINGS & WITHDRAWALS
-- ============================================================================

-- seller_earnings
CREATE INDEX IF NOT EXISTS idx_seller_earnings_seller_id ON seller_earnings(seller_id);

-- earnings_transactions
CREATE INDEX IF NOT EXISTS idx_earnings_transactions_order_id ON earnings_transactions(order_id);
CREATE INDEX IF NOT EXISTS idx_earnings_transactions_seller_id ON earnings_transactions(seller_id);

-- withdrawal_requests
CREATE INDEX IF NOT EXISTS idx_withdrawal_requests_processed_by ON withdrawal_requests(processed_by);
CREATE INDEX IF NOT EXISTS idx_withdrawal_requests_seller_id ON withdrawal_requests(seller_id);

-- ============================================================================
-- PORTFOLIO
-- ============================================================================

-- portfolio_items
CREATE INDEX IF NOT EXISTS idx_portfolio_items_seller_id ON portfolio_items(seller_id);

-- seller_portfolio
CREATE INDEX IF NOT EXISTS idx_seller_portfolio_category_id ON seller_portfolio(category_id);
CREATE INDEX IF NOT EXISTS idx_seller_portfolio_seller_id ON seller_portfolio(seller_id);
CREATE INDEX IF NOT EXISTS idx_seller_portfolio_service_id ON seller_portfolio(service_id);

-- portfolio_services
CREATE INDEX IF NOT EXISTS idx_portfolio_services_portfolio_id ON portfolio_services(portfolio_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_services_service_id ON portfolio_services(service_id);

-- ============================================================================
-- BUYERS & SELLERS
-- ============================================================================

-- buyers
CREATE INDEX IF NOT EXISTS idx_buyers_user_id ON buyers(user_id);

-- sellers
CREATE INDEX IF NOT EXISTS idx_sellers_user_id ON sellers(user_id);

-- ============================================================================
-- CHAT SYSTEM
-- ============================================================================

-- chat_messages
CREATE INDEX IF NOT EXISTS idx_chat_messages_sender_id ON chat_messages(sender_id);

-- chat_rooms
CREATE INDEX IF NOT EXISTS idx_chat_rooms_service_id ON chat_rooms(service_id);
CREATE INDEX IF NOT EXISTS idx_chat_rooms_user1_id ON chat_rooms(user1_id);
CREATE INDEX IF NOT EXISTS idx_chat_rooms_user2_id ON chat_rooms(user2_id);

-- chat_favorites
CREATE INDEX IF NOT EXISTS idx_chat_favorites_room_id ON chat_favorites(room_id);
CREATE INDEX IF NOT EXISTS idx_chat_favorites_user_id ON chat_favorites(user_id);

-- ============================================================================
-- PAYMENTS
-- ============================================================================

-- payment_requests
CREATE INDEX IF NOT EXISTS idx_payment_requests_buyer_id ON payment_requests(buyer_id);
CREATE INDEX IF NOT EXISTS idx_payment_requests_order_id ON payment_requests(order_id);
CREATE INDEX IF NOT EXISTS idx_payment_requests_room_id ON payment_requests(room_id);
CREATE INDEX IF NOT EXISTS idx_payment_requests_seller_id ON payment_requests(seller_id);
CREATE INDEX IF NOT EXISTS idx_payment_requests_service_id ON payment_requests(service_id);

-- payments
CREATE INDEX IF NOT EXISTS idx_payments_order_id ON payments(order_id);

-- refunds
CREATE INDEX IF NOT EXISTS idx_refunds_approved_by ON refunds(approved_by);
CREATE INDEX IF NOT EXISTS idx_refunds_order_id ON refunds(order_id);
CREATE INDEX IF NOT EXISTS idx_refunds_payment_id ON refunds(payment_id);

-- ============================================================================
-- REVISION HISTORY
-- ============================================================================

-- revision_history
CREATE INDEX IF NOT EXISTS idx_revision_history_completed_by ON revision_history(completed_by);
CREATE INDEX IF NOT EXISTS idx_revision_history_order_id ON revision_history(order_id);
CREATE INDEX IF NOT EXISTS idx_revision_history_requested_by ON revision_history(requested_by);

-- ============================================================================
-- NOTIFICATIONS
-- ============================================================================

-- notifications
CREATE INDEX IF NOT EXISTS idx_notifications_order_id ON notifications(order_id);
CREATE INDEX IF NOT EXISTS idx_notifications_sender_id ON notifications(sender_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);

-- notices
CREATE INDEX IF NOT EXISTS idx_notices_created_by ON notices(created_by);

-- ============================================================================
-- PROFILES
-- ============================================================================

-- profiles
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);

-- ============================================================================
-- ERRANDS (심부름)
-- ============================================================================

-- errands
CREATE INDEX IF NOT EXISTS idx_errands_helper_id ON errands(helper_id);
CREATE INDEX IF NOT EXISTS idx_errands_requester_id ON errands(requester_id);

-- errand_applications
CREATE INDEX IF NOT EXISTS idx_errand_applications_errand_id ON errand_applications(errand_id);
CREATE INDEX IF NOT EXISTS idx_errand_applications_helper_id ON errand_applications(helper_id);

-- errand_locations
CREATE INDEX IF NOT EXISTS idx_errand_locations_errand_id ON errand_locations(errand_id);
CREATE INDEX IF NOT EXISTS idx_errand_locations_helper_id ON errand_locations(helper_id);

-- errand_messages
CREATE INDEX IF NOT EXISTS idx_errand_messages_errand_id ON errand_messages(errand_id);
CREATE INDEX IF NOT EXISTS idx_errand_messages_sender_id ON errand_messages(sender_id);

-- errand_reviews
CREATE INDEX IF NOT EXISTS idx_errand_reviews_errand_id ON errand_reviews(errand_id);
CREATE INDEX IF NOT EXISTS idx_errand_reviews_helper_id ON errand_reviews(helper_id);
CREATE INDEX IF NOT EXISTS idx_errand_reviews_reviewer_id ON errand_reviews(reviewer_id);

-- errand_disputes
CREATE INDEX IF NOT EXISTS idx_errand_disputes_errand_id ON errand_disputes(errand_id);
CREATE INDEX IF NOT EXISTS idx_errand_disputes_reported_id ON errand_disputes(reported_id);
CREATE INDEX IF NOT EXISTS idx_errand_disputes_reporter_id ON errand_disputes(reporter_id);
CREATE INDEX IF NOT EXISTS idx_errand_disputes_resolved_by ON errand_disputes(resolved_by);

-- errand_stops
CREATE INDEX IF NOT EXISTS idx_errand_stops_errand_id ON errand_stops(errand_id);

-- errand_chat_messages
CREATE INDEX IF NOT EXISTS idx_errand_chat_messages_errand_id ON errand_chat_messages(errand_id);
CREATE INDEX IF NOT EXISTS idx_errand_chat_messages_sender_id ON errand_chat_messages(sender_id);

-- helper_profiles
CREATE INDEX IF NOT EXISTS idx_helper_profiles_user_id ON helper_profiles(user_id);

-- helper_subscriptions
CREATE INDEX IF NOT EXISTS idx_helper_subscriptions_helper_id ON helper_subscriptions(helper_id);

-- errand_settlements
CREATE INDEX IF NOT EXISTS idx_errand_settlements_errand_id ON errand_settlements(errand_id);
CREATE INDEX IF NOT EXISTS idx_errand_settlements_helper_id ON errand_settlements(helper_id);

-- helper_withdrawals
CREATE INDEX IF NOT EXISTS idx_helper_withdrawals_helper_id ON helper_withdrawals(helper_id);
CREATE INDEX IF NOT EXISTS idx_helper_withdrawals_processed_by ON helper_withdrawals(processed_by);

-- ============================================================================
-- VERIFICATION
-- ============================================================================

DO $$
DECLARE
  total_fk_count INTEGER;
  indexed_fk_count INTEGER;
  unindexed_fk_count INTEGER;
BEGIN
  -- Count total single-column foreign keys
  SELECT COUNT(DISTINCT (conrelid::regclass::text, a.attname))
  INTO total_fk_count
  FROM pg_constraint con
  JOIN pg_attribute a ON a.attrelid = con.conrelid AND a.attnum = ANY(con.conkey)
  WHERE con.contype = 'f'
    AND con.connamespace = 'public'::regnamespace;

  -- Count foreign keys with leading column index
  WITH fk_columns AS (
    SELECT DISTINCT conrelid::regclass AS table_name, a.attname AS column_name
    FROM pg_constraint con
    JOIN pg_attribute a ON a.attrelid = con.conrelid AND a.attnum = ANY(con.conkey)
    WHERE con.contype = 'f' AND con.connamespace = 'public'::regnamespace
  ),
  indexed_columns AS (
    SELECT DISTINCT i.indrelid::regclass AS table_name, a.attname AS column_name
    FROM pg_index i
    JOIN pg_attribute a ON a.attrelid = i.indrelid AND a.attnum = i.indkey[0]
    JOIN pg_class c ON c.oid = i.indrelid
    WHERE c.relnamespace = 'public'::regnamespace
  )
  SELECT
    COUNT(CASE WHEN idx.column_name IS NOT NULL THEN 1 END),
    COUNT(CASE WHEN idx.column_name IS NULL THEN 1 END)
  INTO indexed_fk_count, unindexed_fk_count
  FROM fk_columns fk
  LEFT JOIN indexed_columns idx ON fk.table_name = idx.table_name AND fk.column_name = idx.column_name;

  RAISE NOTICE '=================================================';
  RAISE NOTICE 'Foreign Key Index Coverage Report';
  RAISE NOTICE '=================================================';
  RAISE NOTICE 'Total FK columns: %', total_fk_count;
  RAISE NOTICE 'Indexed FK columns: %', indexed_fk_count;
  RAISE NOTICE 'Unindexed FK columns: %', unindexed_fk_count;
  RAISE NOTICE '=================================================';

  IF unindexed_fk_count > 0 THEN
    RAISE WARNING 'Still have % unindexed foreign key columns!', unindexed_fk_count;
  ELSE
    RAISE NOTICE 'SUCCESS: All foreign keys are properly indexed!';
  END IF;
END $$;
