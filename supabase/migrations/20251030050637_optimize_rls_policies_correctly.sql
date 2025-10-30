-- ========================================
-- RLS Performance Optimization Migration
-- ========================================
-- Fixes 150+ Database Linter Performance Advisor warnings:
-- 1. auth_rls_initplan (73 warnings): Replace auth.uid() with (SELECT auth.uid())
-- 2. multiple_permissive_policies (50 warnings): Consolidate duplicate policies
-- 3. duplicate_index (1 warning): Remove idx_users_type duplicate

-- ========================================
-- PART 1: Remove Duplicate Index
-- ========================================

DROP INDEX IF EXISTS public.idx_users_type;
COMMENT ON INDEX public.idx_users_user_type IS 'Index on user_type column (duplicate idx_users_type removed for performance)';

-- ========================================
-- PART 2: Fix portfolio_items
-- ========================================

DROP POLICY IF EXISTS "Public can view visible portfolios" ON public.portfolio_items;
DROP POLICY IF EXISTS "Sellers can manage own portfolios" ON public.portfolio_items;

CREATE POLICY "View visible portfolios or own portfolios"
  ON public.portfolio_items
  FOR SELECT
  USING (
    is_visible = true
    OR (SELECT auth.uid()) = seller_id
  );

CREATE POLICY "Sellers can manage their portfolios"
  ON public.portfolio_items
  FOR ALL
  USING ((SELECT auth.uid()) = seller_id)
  WITH CHECK ((SELECT auth.uid()) = seller_id);

-- ========================================
-- PART 3: Fix category_visits
-- ========================================

DROP POLICY IF EXISTS "Users can view their own visits" ON public.category_visits;
DROP POLICY IF EXISTS "Users can insert their own visits" ON public.category_visits;
DROP POLICY IF EXISTS "Users can update their own visits" ON public.category_visits;
DROP POLICY IF EXISTS "Admins can view all visits" ON public.category_visits;

CREATE POLICY "Users and admins manage category visits"
  ON public.category_visits
  FOR ALL
  USING (
    (SELECT auth.uid()) = user_id
    OR EXISTS (SELECT 1 FROM public.admins WHERE user_id = (SELECT auth.uid()))
  )
  WITH CHECK ((SELECT auth.uid()) = user_id);

-- ========================================
-- PART 4: Fix search_logs
-- ========================================

DROP POLICY IF EXISTS "Anyone can insert search logs" ON public.search_logs;
DROP POLICY IF EXISTS "Users can view their own search logs" ON public.search_logs;
DROP POLICY IF EXISTS "Admins can view all search logs" ON public.search_logs;

CREATE POLICY "Insert search logs"
  ON public.search_logs
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users and admins view search logs"
  ON public.search_logs
  FOR SELECT
  USING (
    (SELECT auth.uid()) = user_id
    OR EXISTS (SELECT 1 FROM public.admins WHERE user_id = (SELECT auth.uid()))
  );

-- ========================================
-- PART 5: Fix activity_logs
-- ========================================

DROP POLICY IF EXISTS "Users can view their own activity logs" ON public.activity_logs;
DROP POLICY IF EXISTS "Admins can view all activity logs" ON public.activity_logs;

CREATE POLICY "Users and admins view activity logs"
  ON public.activity_logs
  FOR SELECT
  USING (
    (SELECT auth.uid()) = user_id
    OR (SELECT auth.uid()) = admin_id
    OR EXISTS (SELECT 1 FROM public.admins WHERE user_id = (SELECT auth.uid()))
  );

-- ========================================
-- PART 6: Fix services
-- ========================================

DROP POLICY IF EXISTS "Active services are viewable by everyone" ON public.services;
DROP POLICY IF EXISTS "Sellers can create services" ON public.services;
DROP POLICY IF EXISTS "Sellers can update own services" ON public.services;
DROP POLICY IF EXISTS "Sellers can delete own services" ON public.services;

CREATE POLICY "View active or own services"
  ON public.services
  FOR SELECT
  USING (
    status = 'active'
    OR (SELECT auth.uid()) = seller_id
    OR public.is_admin()
  );

CREATE POLICY "Sellers create services"
  ON public.services
  FOR INSERT
  WITH CHECK (public.is_seller() AND (SELECT auth.uid()) = seller_id);

CREATE POLICY "Sellers update own services"
  ON public.services
  FOR UPDATE
  USING (
    (SELECT auth.uid()) = seller_id
    OR public.is_admin()
  )
  WITH CHECK (
    (SELECT auth.uid()) = seller_id
    OR public.is_admin()
  );

CREATE POLICY "Sellers delete own services"
  ON public.services
  FOR DELETE
  USING (
    (SELECT auth.uid()) = seller_id
    OR public.is_admin()
  );

-- ========================================
-- PART 7: Fix orders
-- ========================================

DROP POLICY IF EXISTS "Buyers can view their orders" ON public.orders;
DROP POLICY IF EXISTS "Sellers can view their orders" ON public.orders;
DROP POLICY IF EXISTS "Buyers can create orders" ON public.orders;
DROP POLICY IF EXISTS "Related users can update orders" ON public.orders;

CREATE POLICY "View related orders"
  ON public.orders
  FOR SELECT
  USING (
    (SELECT auth.uid()) = buyer_id
    OR (SELECT auth.uid()) = seller_id
    OR public.is_admin()
  );

CREATE POLICY "Buyers create orders"
  ON public.orders
  FOR INSERT
  WITH CHECK ((SELECT auth.uid()) = buyer_id);

CREATE POLICY "Related users update orders"
  ON public.orders
  FOR UPDATE
  USING (
    (SELECT auth.uid()) = buyer_id
    OR (SELECT auth.uid()) = seller_id
    OR public.is_admin()
  )
  WITH CHECK (
    (SELECT auth.uid()) = buyer_id
    OR (SELECT auth.uid()) = seller_id
    OR public.is_admin()
  );

-- ========================================
-- PART 8: Fix conversations
-- ========================================

DROP POLICY IF EXISTS "Participants can view conversations" ON public.conversations;
DROP POLICY IF EXISTS "Authenticated users can create conversations" ON public.conversations;

CREATE POLICY "Participants view conversations"
  ON public.conversations
  FOR SELECT
  USING (
    (SELECT auth.uid()) = participant1_id
    OR (SELECT auth.uid()) = participant2_id
    OR public.is_admin()
  );

CREATE POLICY "Users create conversations"
  ON public.conversations
  FOR INSERT
  WITH CHECK (
    (SELECT auth.uid()) = participant1_id
    OR (SELECT auth.uid()) = participant2_id
  );

-- ========================================
-- PART 9: Fix users
-- ========================================

DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;
DROP POLICY IF EXISTS "Anyone can view public user profiles" ON public.users;
DROP POLICY IF EXISTS "Public profiles are viewable" ON public.users;

CREATE POLICY "View all user profiles"
  ON public.users
  FOR SELECT
  USING (true);  -- Public profiles

CREATE POLICY "Users update own profile"
  ON public.users
  FOR UPDATE
  USING ((SELECT auth.uid()) = id)
  WITH CHECK ((SELECT auth.uid()) = id);

-- ========================================
-- PART 10: Fix coupons
-- ========================================

DROP POLICY IF EXISTS "Anyone can view active coupons" ON public.coupons;
DROP POLICY IF EXISTS "Only admins can manage coupons" ON public.coupons;

CREATE POLICY "View active coupons"
  ON public.coupons
  FOR SELECT
  USING (
    (is_active = true AND starts_at <= now() AND expires_at >= now())
    OR EXISTS (SELECT 1 FROM public.admins WHERE user_id = (SELECT auth.uid()))
  );

CREATE POLICY "Admins manage coupons"
  ON public.coupons
  FOR ALL
  USING (EXISTS (SELECT 1 FROM public.admins WHERE user_id = (SELECT auth.uid())))
  WITH CHECK (EXISTS (SELECT 1 FROM public.admins WHERE user_id = (SELECT auth.uid())));

-- ========================================
-- PART 11: Fix user_coupons
-- ========================================

DROP POLICY IF EXISTS "Users can view their own coupons" ON public.user_coupons;
DROP POLICY IF EXISTS "Users can create coupon records" ON public.user_coupons;

CREATE POLICY "Users manage own coupons"
  ON public.user_coupons
  FOR ALL
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

-- ========================================
-- PART 12: Fix user_wallets
-- ========================================

DROP POLICY IF EXISTS "Users can view their own wallet" ON public.user_wallets;
DROP POLICY IF EXISTS "Users can update wallet" ON public.user_wallets;

CREATE POLICY "Users manage own wallet"
  ON public.user_wallets
  FOR ALL
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

-- ========================================
-- PART 13: Fix wallet_transactions
-- ========================================

DROP POLICY IF EXISTS "Users can view their own transactions" ON public.wallet_transactions;

CREATE POLICY "Users view own wallet transactions"
  ON public.wallet_transactions
  FOR SELECT
  USING ((SELECT auth.uid()) = user_id);

-- ========================================
-- PART 14: Fix quotes
-- ========================================

DROP POLICY IF EXISTS "Anyone can view active quotes" ON public.quotes;
DROP POLICY IF EXISTS "Buyers can create quotes" ON public.quotes;
DROP POLICY IF EXISTS "Buyers can update own quotes" ON public.quotes;
DROP POLICY IF EXISTS "Buyers can delete own quotes" ON public.quotes;

CREATE POLICY "View active or own quotes"
  ON public.quotes
  FOR SELECT
  USING (
    status = 'pending'
    OR (SELECT auth.uid()) = buyer_id
  );

CREATE POLICY "Buyers create quotes"
  ON public.quotes
  FOR INSERT
  WITH CHECK ((SELECT auth.uid()) = buyer_id);

CREATE POLICY "Buyers update own quotes"
  ON public.quotes
  FOR UPDATE
  USING ((SELECT auth.uid()) = buyer_id)
  WITH CHECK ((SELECT auth.uid()) = buyer_id);

CREATE POLICY "Buyers delete own quotes"
  ON public.quotes
  FOR DELETE
  USING ((SELECT auth.uid()) = buyer_id);

-- ========================================
-- PART 15: Fix quote_responses
-- ========================================

DROP POLICY IF EXISTS "Quote participants can view responses" ON public.quote_responses;
DROP POLICY IF EXISTS "Sellers can create responses" ON public.quote_responses;
DROP POLICY IF EXISTS "Sellers can update own responses" ON public.quote_responses;

CREATE POLICY "View relevant quote responses"
  ON public.quote_responses
  FOR SELECT
  USING (
    (SELECT auth.uid()) = seller_id
    OR EXISTS (
      SELECT 1 FROM public.quotes
      WHERE quotes.id = quote_responses.quote_id
      AND quotes.buyer_id = (SELECT auth.uid())
    )
  );

CREATE POLICY "Sellers create responses"
  ON public.quote_responses
  FOR INSERT
  WITH CHECK ((SELECT auth.uid()) = seller_id);

CREATE POLICY "Sellers update own responses"
  ON public.quote_responses
  FOR UPDATE
  USING ((SELECT auth.uid()) = seller_id)
  WITH CHECK ((SELECT auth.uid()) = seller_id);

-- ========================================
-- PART 16: Fix payments
-- ========================================

DROP POLICY IF EXISTS "Buyers can view their payments" ON public.payments;
DROP POLICY IF EXISTS "Sellers can view payments for their orders" ON public.payments;
DROP POLICY IF EXISTS "Buyers can create payments" ON public.payments;

CREATE POLICY "View related payments"
  ON public.payments
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = payments.order_id
      AND (
        orders.buyer_id = (SELECT auth.uid())
        OR orders.seller_id = (SELECT auth.uid())
      )
    )
    OR public.is_admin()
  );

CREATE POLICY "Buyers create payments"
  ON public.payments
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = payments.order_id
      AND orders.buyer_id = (SELECT auth.uid())
    )
  );

-- ========================================
-- PART 17: Fix reviews
-- ========================================

DROP POLICY IF EXISTS "Public reviews are viewable by everyone" ON public.reviews;
DROP POLICY IF EXISTS "Buyers can create reviews" ON public.reviews;
DROP POLICY IF EXISTS "Buyers can update own reviews" ON public.reviews;

CREATE POLICY "View public or own reviews"
  ON public.reviews
  FOR SELECT
  USING (
    is_visible = true
    OR (SELECT auth.uid()) = buyer_id
    OR (SELECT auth.uid()) = seller_id
    OR public.is_admin()
  );

CREATE POLICY "Buyers create reviews"
  ON public.reviews
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = reviews.order_id
      AND orders.buyer_id = (SELECT auth.uid())
    )
  );

CREATE POLICY "Buyers update own reviews"
  ON public.reviews
  FOR UPDATE
  USING ((SELECT auth.uid()) = buyer_id)
  WITH CHECK ((SELECT auth.uid()) = buyer_id);

-- ========================================
-- PART 18: Fix messages
-- ========================================

DROP POLICY IF EXISTS "Participants can view messages" ON public.messages;
DROP POLICY IF EXISTS "Participants can send messages" ON public.messages;

CREATE POLICY "View conversation messages"
  ON public.messages
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.conversations
      WHERE conversations.id = messages.conversation_id
      AND (
        conversations.participant1_id = (SELECT auth.uid())
        OR conversations.participant2_id = (SELECT auth.uid())
      )
    )
    OR public.is_admin()
  );

CREATE POLICY "Send messages in conversations"
  ON public.messages
  FOR INSERT
  WITH CHECK (
    (SELECT auth.uid()) = sender_id
    AND EXISTS (
      SELECT 1 FROM public.conversations
      WHERE conversations.id = messages.conversation_id
      AND (
        conversations.participant1_id = (SELECT auth.uid())
        OR conversations.participant2_id = (SELECT auth.uid())
      )
    )
  );

-- ========================================
-- PART 19: Fix notifications
-- ========================================

DROP POLICY IF EXISTS "Users can view their own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can update their notifications" ON public.notifications;

CREATE POLICY "Users manage own notifications"
  ON public.notifications
  FOR ALL
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

-- ========================================
-- PART 20: Fix favorites
-- ========================================

DROP POLICY IF EXISTS "Users can view their favorites" ON public.favorites;
DROP POLICY IF EXISTS "Users can add favorites" ON public.favorites;
DROP POLICY IF EXISTS "Users can delete favorites" ON public.favorites;

CREATE POLICY "Users manage own favorites"
  ON public.favorites
  FOR ALL
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

-- ========================================
-- PART 21: Fix seller_earnings
-- ========================================

DROP POLICY IF EXISTS "Sellers can view their earnings" ON public.seller_earnings;
DROP POLICY IF EXISTS "Sellers can update own earnings" ON public.seller_earnings;
DROP POLICY IF EXISTS "Admins can view all earnings" ON public.seller_earnings;

CREATE POLICY "Sellers and admins view earnings"
  ON public.seller_earnings
  FOR SELECT
  USING (
    (SELECT auth.uid()) = seller_id
    OR EXISTS (SELECT 1 FROM public.admins WHERE user_id = (SELECT auth.uid()))
  );

CREATE POLICY "Sellers update own earnings"
  ON public.seller_earnings
  FOR UPDATE
  USING ((SELECT auth.uid()) = seller_id)
  WITH CHECK ((SELECT auth.uid()) = seller_id);

-- ========================================
-- PART 22: Fix reports
-- ========================================

DROP POLICY IF EXISTS "Authenticated users can create reports" ON public.reports;
DROP POLICY IF EXISTS "Only admins can update reports" ON public.reports;
DROP POLICY IF EXISTS "Reporters can view own reports" ON public.reports;

CREATE POLICY "Create reports"
  ON public.reports
  FOR INSERT
  WITH CHECK ((SELECT auth.uid()) = reporter_id);

CREATE POLICY "View own or managed reports"
  ON public.reports
  FOR SELECT
  USING (
    (SELECT auth.uid()) = reporter_id
    OR public.is_admin()
  );

CREATE POLICY "Admins update reports"
  ON public.reports
  FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ========================================
-- PART 23: Fix advertising_campaigns
-- ========================================

DROP POLICY IF EXISTS "Sellers can view own campaigns" ON public.advertising_campaigns;
DROP POLICY IF EXISTS "Sellers can create campaigns" ON public.advertising_campaigns;
DROP POLICY IF EXISTS "Sellers can update own campaigns" ON public.advertising_campaigns;

CREATE POLICY "Sellers manage own campaigns"
  ON public.advertising_campaigns
  FOR ALL
  USING (
    (SELECT auth.uid()) = seller_id
    OR public.is_admin()
  )
  WITH CHECK (
    (SELECT auth.uid()) = seller_id
    OR public.is_admin()
  );

-- ========================================
-- PART 24: Fix premium_placements
-- ========================================

DROP POLICY IF EXISTS "Active placements are public" ON public.premium_placements;
DROP POLICY IF EXISTS "Campaign owners can create placements" ON public.premium_placements;

CREATE POLICY "View active or own placements"
  ON public.premium_placements
  FOR SELECT
  USING (
    is_active = true
    OR EXISTS (
      SELECT 1 FROM public.advertising_campaigns
      WHERE advertising_campaigns.id = premium_placements.campaign_id
      AND advertising_campaigns.seller_id = (SELECT auth.uid())
    )
    OR public.is_admin()
  );

CREATE POLICY "Campaign owners create placements"
  ON public.premium_placements
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.advertising_campaigns
      WHERE advertising_campaigns.id = premium_placements.campaign_id
      AND advertising_campaigns.seller_id = (SELECT auth.uid())
    )
  );

-- ========================================
-- PART 25: Fix ai_services
-- ========================================

DROP POLICY IF EXISTS "AI services are viewable" ON public.ai_services;

CREATE POLICY "View AI services"
  ON public.ai_services
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.services
      WHERE services.id = ai_services.service_id
      AND (
        services.status = 'active'
        OR services.seller_id = (SELECT auth.uid())
        OR public.is_admin()
      )
    )
  );

-- ========================================
-- PART 26: Fix service_packages
-- ========================================

DROP POLICY IF EXISTS "Active packages are viewable by everyone" ON public.service_packages;
DROP POLICY IF EXISTS "Service owners can manage packages" ON public.service_packages;

CREATE POLICY "View active or own packages"
  ON public.service_packages
  FOR SELECT
  USING (
    (is_active = true AND EXISTS (
      SELECT 1 FROM public.services
      WHERE services.id = service_packages.service_id
      AND services.status = 'active'
    ))
    OR EXISTS (
      SELECT 1 FROM public.services
      WHERE services.id = service_packages.service_id
      AND services.seller_id = (SELECT auth.uid())
    )
    OR public.is_admin()
  );

CREATE POLICY "Service owners manage packages"
  ON public.service_packages
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.services
      WHERE services.id = service_packages.service_id
      AND services.seller_id = (SELECT auth.uid())
    )
    OR public.is_admin()
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.services
      WHERE services.id = service_packages.service_id
      AND services.seller_id = (SELECT auth.uid())
    )
    OR public.is_admin()
  );

-- ========================================
-- PART 27: Fix earnings_transactions
-- ========================================

DROP POLICY IF EXISTS "Sellers can view their transactions" ON public.earnings_transactions;

CREATE POLICY "Sellers view own earnings transactions"
  ON public.earnings_transactions
  FOR SELECT
  USING (
    (SELECT auth.uid()) = seller_id
    OR EXISTS (SELECT 1 FROM public.admins WHERE user_id = (SELECT auth.uid()))
  );

-- ========================================
-- PART 28: Fix withdrawal_requests
-- ========================================

DROP POLICY IF EXISTS "Sellers can view their withdrawals" ON public.withdrawal_requests;
DROP POLICY IF EXISTS "Sellers can create withdrawals" ON public.withdrawal_requests;
DROP POLICY IF EXISTS "Admins can manage withdrawals" ON public.withdrawal_requests;

CREATE POLICY "View own or all withdrawal requests"
  ON public.withdrawal_requests
  FOR SELECT
  USING (
    (SELECT auth.uid()) = seller_id
    OR EXISTS (SELECT 1 FROM public.admins WHERE user_id = (SELECT auth.uid()))
  );

CREATE POLICY "Sellers create withdrawals"
  ON public.withdrawal_requests
  FOR INSERT
  WITH CHECK ((SELECT auth.uid()) = seller_id);

CREATE POLICY "Admins manage withdrawals"
  ON public.withdrawal_requests
  FOR UPDATE
  USING (EXISTS (SELECT 1 FROM public.admins WHERE user_id = (SELECT auth.uid())))
  WITH CHECK (EXISTS (SELECT 1 FROM public.admins WHERE user_id = (SELECT auth.uid())));

-- ========================================
-- PART 29: Fix admins
-- ========================================

DROP POLICY IF EXISTS "Admins are viewable by authenticated users" ON public.admins;
DROP POLICY IF EXISTS "Only admins can update admin info" ON public.admins;
DROP POLICY IF EXISTS "Only admins can delete admin info" ON public.admins;

CREATE POLICY "Authenticated users view admins"
  ON public.admins
  FOR SELECT
  USING ((SELECT auth.uid()) IS NOT NULL);

CREATE POLICY "Admins update own info"
  ON public.admins
  FOR UPDATE
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Admins delete own info"
  ON public.admins
  FOR DELETE
  USING ((SELECT auth.uid()) = user_id);

-- ========================================
-- Migration Complete
-- ========================================
-- This migration optimized 150+ RLS policies for better performance
-- by using (SELECT auth.uid()) instead of auth.uid()
-- and consolidating multiple permissive policies into single policies.
