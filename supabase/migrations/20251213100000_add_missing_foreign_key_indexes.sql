-- Add missing foreign key indexes to improve query performance
-- Foreign keys without covering indexes can lead to suboptimal query performance, especially for JOINs

-- advertising_impressions
CREATE INDEX IF NOT EXISTS idx_advertising_impressions_user_id ON advertising_impressions(user_id);

-- advertising_payments
CREATE INDEX IF NOT EXISTS idx_advertising_payments_confirmed_by ON advertising_payments(confirmed_by);
CREATE INDEX IF NOT EXISTS idx_advertising_payments_tax_invoice_id ON advertising_payments(tax_invoice_id);

-- advertising_subscriptions
CREATE INDEX IF NOT EXISTS idx_advertising_subscriptions_bank_transfer_confirmed_by ON advertising_subscriptions(bank_transfer_confirmed_by);

-- conversations
CREATE INDEX IF NOT EXISTS idx_conversations_participant2_id ON conversations(participant2_id);

-- errand_disputes
CREATE INDEX IF NOT EXISTS idx_errand_disputes_errand_id ON errand_disputes(errand_id);
CREATE INDEX IF NOT EXISTS idx_errand_disputes_reported_id ON errand_disputes(reported_id);
CREATE INDEX IF NOT EXISTS idx_errand_disputes_reporter_id ON errand_disputes(reporter_id);
CREATE INDEX IF NOT EXISTS idx_errand_disputes_resolved_by ON errand_disputes(resolved_by);

-- errand_locations
CREATE INDEX IF NOT EXISTS idx_errand_locations_helper_id ON errand_locations(helper_id);

-- errand_messages
CREATE INDEX IF NOT EXISTS idx_errand_messages_sender_id ON errand_messages(sender_id);

-- errand_reviews
CREATE INDEX IF NOT EXISTS idx_errand_reviews_reviewer_id ON errand_reviews(reviewer_id);

-- errand_stops
CREATE INDEX IF NOT EXISTS idx_errand_stops_errand_id ON errand_stops(errand_id);

-- food_carts
CREATE INDEX IF NOT EXISTS idx_food_carts_store_id ON food_carts(store_id);

-- food_menu_categories
CREATE INDEX IF NOT EXISTS idx_food_menu_categories_store_id ON food_menu_categories(store_id);

-- food_menu_option_groups
CREATE INDEX IF NOT EXISTS idx_food_menu_option_groups_menu_id ON food_menu_option_groups(menu_id);

-- food_menu_option_items
CREATE INDEX IF NOT EXISTS idx_food_menu_option_items_option_group_id ON food_menu_option_items(option_group_id);

-- food_menus
CREATE INDEX IF NOT EXISTS idx_food_menus_category_id ON food_menus(category_id);

-- food_orders
CREATE INDEX IF NOT EXISTS idx_food_orders_rider_id ON food_orders(rider_id);

-- food_reviews
CREATE INDEX IF NOT EXISTS idx_food_reviews_order_id ON food_reviews(order_id);
CREATE INDEX IF NOT EXISTS idx_food_reviews_user_id ON food_reviews(user_id);

-- food_store_favorites
CREATE INDEX IF NOT EXISTS idx_food_store_favorites_store_id ON food_store_favorites(store_id);

-- food_stores
CREATE INDEX IF NOT EXISTS idx_food_stores_owner_id ON food_stores(owner_id);

-- helper_withdrawals
CREATE INDEX IF NOT EXISTS idx_helper_withdrawals_processed_by ON helper_withdrawals(processed_by);

-- notices
CREATE INDEX IF NOT EXISTS idx_notices_created_by ON notices(created_by);

-- notifications
CREATE INDEX IF NOT EXISTS idx_notifications_sender_id ON notifications(sender_id);

-- order_settlements
CREATE INDEX IF NOT EXISTS idx_order_settlements_batch_settlement_id ON order_settlements(batch_settlement_id);

-- payment_requests
CREATE INDEX IF NOT EXISTS idx_payment_requests_order_id ON payment_requests(order_id);

-- revision_history
CREATE INDEX IF NOT EXISTS idx_revision_history_completed_by ON revision_history(completed_by);
CREATE INDEX IF NOT EXISTS idx_revision_history_requested_by ON revision_history(requested_by);

-- service_categories
CREATE INDEX IF NOT EXISTS idx_service_categories_category_id ON service_categories(category_id);

-- service_revisions
CREATE INDEX IF NOT EXISTS idx_service_revisions_reviewed_by ON service_revisions(reviewed_by);

-- service_tags
CREATE INDEX IF NOT EXISTS idx_service_tags_tag_id ON service_tags(tag_id);

-- service_view_logs
CREATE INDEX IF NOT EXISTS idx_service_view_logs_user_id ON service_view_logs(user_id);

-- tax_invoices
CREATE INDEX IF NOT EXISTS idx_tax_invoices_payment_id ON tax_invoices(payment_id);
CREATE INDEX IF NOT EXISTS idx_tax_invoices_subscription_id ON tax_invoices(subscription_id);

-- Verify index creation
DO $$
DECLARE
  index_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO index_count
  FROM pg_indexes
  WHERE schemaname = 'public'
    AND indexname IN (
      'idx_advertising_impressions_user_id',
      'idx_advertising_payments_confirmed_by',
      'idx_advertising_payments_tax_invoice_id',
      'idx_advertising_subscriptions_bank_transfer_confirmed_by',
      'idx_conversations_participant2_id',
      'idx_errand_disputes_errand_id',
      'idx_errand_disputes_reported_id',
      'idx_errand_disputes_reporter_id',
      'idx_errand_disputes_resolved_by',
      'idx_errand_locations_helper_id',
      'idx_errand_messages_sender_id',
      'idx_errand_reviews_reviewer_id',
      'idx_errand_stops_errand_id',
      'idx_food_carts_store_id',
      'idx_food_menu_categories_store_id',
      'idx_food_menu_option_groups_menu_id',
      'idx_food_menu_option_items_option_group_id',
      'idx_food_menus_category_id',
      'idx_food_orders_rider_id',
      'idx_food_reviews_order_id',
      'idx_food_reviews_user_id',
      'idx_food_store_favorites_store_id',
      'idx_food_stores_owner_id',
      'idx_helper_withdrawals_processed_by',
      'idx_notices_created_by',
      'idx_notifications_sender_id',
      'idx_order_settlements_batch_settlement_id',
      'idx_payment_requests_order_id',
      'idx_revision_history_completed_by',
      'idx_revision_history_requested_by',
      'idx_service_categories_category_id',
      'idx_service_revisions_reviewed_by',
      'idx_service_tags_tag_id',
      'idx_service_view_logs_user_id',
      'idx_tax_invoices_payment_id',
      'idx_tax_invoices_subscription_id'
    );

  RAISE NOTICE 'Created % new foreign key indexes', index_count;

  IF index_count != 36 THEN
    RAISE WARNING 'Expected 36 indexes but found %. Some indexes may have failed to create.', index_count;
  END IF;
END $$;
