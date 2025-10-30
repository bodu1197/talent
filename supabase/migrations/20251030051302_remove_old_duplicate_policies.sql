-- Remove Old Duplicate RLS Policies
-- This migration removes all old policies that were causing auth_rls_initplan and multiple_permissive_policies warnings
-- The new optimized policies were already created in the previous migration

-- ============================================================================
-- PART 1: Remove old policies with auth_rls_initplan issues
-- ============================================================================

-- users table
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;

-- orders table
DROP POLICY IF EXISTS "Users can view own orders" ON public.orders;
DROP POLICY IF EXISTS "Sellers can view orders" ON public.orders;
DROP POLICY IF EXISTS "Users can create orders" ON public.orders;
DROP POLICY IF EXISTS "Buyers can view their orders" ON public.orders;

-- payments table
DROP POLICY IF EXISTS "Users can view own payments" ON public.payments;
DROP POLICY IF EXISTS "Users can create payments" ON public.payments;
DROP POLICY IF EXISTS "Buyers can view their payments" ON public.payments;

-- settlement_details table
DROP POLICY IF EXISTS "Sellers can view own settlements" ON public.settlement_details;

-- conversations table
DROP POLICY IF EXISTS "Participants can view conversations" ON public.conversations;
DROP POLICY IF EXISTS "Users can view their conversations" ON public.conversations;

-- notifications table
DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can insert notifications" ON public.notifications;

-- reports table
DROP POLICY IF EXISTS "Users can create reports" ON public.reports;
DROP POLICY IF EXISTS "Users can view own reports" ON public.reports;

-- favorites table
DROP POLICY IF EXISTS "Users can create favorites" ON public.favorites;
DROP POLICY IF EXISTS "Users can delete own favorites" ON public.favorites;
DROP POLICY IF EXISTS "Users can view own favorites" ON public.favorites;
DROP POLICY IF EXISTS "Users can view favorites" ON public.favorites;

-- tags table
DROP POLICY IF EXISTS "Anyone can view tags" ON public.tags;
DROP POLICY IF EXISTS "Public can view tags" ON public.tags;

-- service_tags table
DROP POLICY IF EXISTS "Anyone can view service tags" ON public.service_tags;
DROP POLICY IF EXISTS "Public can view service tags" ON public.service_tags;

-- ai_services table
DROP POLICY IF EXISTS "Public can view active AI services" ON public.ai_services;
DROP POLICY IF EXISTS "Sellers can manage their AI services" ON public.ai_services;
DROP POLICY IF EXISTS "Sellers can view their AI services" ON public.ai_services;
DROP POLICY IF EXISTS "Anyone can view AI services" ON public.ai_services;

-- service_packages table
DROP POLICY IF EXISTS "Public can view packages" ON public.service_packages;
DROP POLICY IF EXISTS "Sellers can manage their packages" ON public.service_packages;
DROP POLICY IF EXISTS "Sellers can view their packages" ON public.service_packages;
DROP POLICY IF EXISTS "Anyone can view service packages" ON public.service_packages;

-- user_coupons table
DROP POLICY IF EXISTS "Users can view own coupons" ON public.user_coupons;
DROP POLICY IF EXISTS "Users can update own coupons" ON public.user_coupons;
DROP POLICY IF EXISTS "Users can view their coupons" ON public.user_coupons;

-- user_wallets table
DROP POLICY IF EXISTS "Users can view own wallet" ON public.user_wallets;
DROP POLICY IF EXISTS "Users can update own wallet" ON public.user_wallets;
DROP POLICY IF EXISTS "Users can view their wallet" ON public.user_wallets;

-- wallet_transactions table
DROP POLICY IF EXISTS "Users can view own transactions" ON public.wallet_transactions;
DROP POLICY IF EXISTS "Users can view their transactions" ON public.wallet_transactions;

-- seller_earnings table
DROP POLICY IF EXISTS "Sellers can view own earnings" ON public.seller_earnings;
DROP POLICY IF EXISTS "Sellers can update own earnings" ON public.seller_earnings;
DROP POLICY IF EXISTS "Sellers can view their earnings" ON public.seller_earnings;

-- earnings_transactions table
DROP POLICY IF EXISTS "Sellers can view own earnings transactions" ON public.earnings_transactions;
DROP POLICY IF EXISTS "Sellers can create earnings transactions" ON public.earnings_transactions;
DROP POLICY IF EXISTS "Sellers can view their earnings transactions" ON public.earnings_transactions;

-- withdrawal_requests table
DROP POLICY IF EXISTS "Sellers can create withdrawal requests" ON public.withdrawal_requests;
DROP POLICY IF EXISTS "Sellers can view own withdrawal requests" ON public.withdrawal_requests;
DROP POLICY IF EXISTS "Sellers can view their withdrawal requests" ON public.withdrawal_requests;

-- category_visits table
DROP POLICY IF EXISTS "Users can insert their own category visits" ON public.category_visits;
DROP POLICY IF EXISTS "Users can update their own category visits" ON public.category_visits;
DROP POLICY IF EXISTS "Users can view their own visits" ON public.category_visits;
DROP POLICY IF EXISTS "Users can view their category visits" ON public.category_visits;

-- messages table
DROP POLICY IF EXISTS "Conversation participants can view messages" ON public.messages;
DROP POLICY IF EXISTS "Users can view their messages" ON public.messages;

-- reviews table
DROP POLICY IF EXISTS "Users can create reviews" ON public.reviews;
DROP POLICY IF EXISTS "Users can update own reviews" ON public.reviews;
DROP POLICY IF EXISTS "Buyers can create reviews" ON public.reviews;

-- quote_responses table
DROP POLICY IF EXISTS "Sellers can create responses" ON public.quote_responses;
DROP POLICY IF EXISTS "Related users can view responses" ON public.quote_responses;

-- quotes table
DROP POLICY IF EXISTS "Users can create quotes" ON public.quotes;
DROP POLICY IF EXISTS "Users can view own quotes" ON public.quotes;
DROP POLICY IF EXISTS "Buyers can view their quotes" ON public.quotes;

-- coupons table
DROP POLICY IF EXISTS "Sellers can manage own coupons" ON public.coupons;
DROP POLICY IF EXISTS "Sellers can view their coupons" ON public.coupons;

-- portfolio_items table
DROP POLICY IF EXISTS "Public can view active portfolio items" ON public.portfolio_items;
DROP POLICY IF EXISTS "Sellers can manage their portfolio" ON public.portfolio_items;

-- services table
DROP POLICY IF EXISTS "Public can view active services" ON public.services;
DROP POLICY IF EXISTS "Sellers can manage their services" ON public.services;
DROP POLICY IF EXISTS "Sellers can insert services" ON public.services;
DROP POLICY IF EXISTS "Sellers can update own services" ON public.services;

-- search_logs table
DROP POLICY IF EXISTS "Users can insert search logs" ON public.search_logs;
DROP POLICY IF EXISTS "Users can view own search logs" ON public.search_logs;

-- activity_logs table
DROP POLICY IF EXISTS "Users can insert activity logs" ON public.activity_logs;
DROP POLICY IF EXISTS "Users can view own activity logs" ON public.activity_logs;

-- premium_placements table
DROP POLICY IF EXISTS "Public can view active placements" ON public.premium_placements;
DROP POLICY IF EXISTS "Sellers can manage their placements" ON public.premium_placements;

-- advertising_campaigns table
DROP POLICY IF EXISTS "Sellers can create campaigns" ON public.advertising_campaigns;
DROP POLICY IF EXISTS "Sellers can view own campaigns" ON public.advertising_campaigns;
DROP POLICY IF EXISTS "Sellers can update own campaigns" ON public.advertising_campaigns;

-- admins table
DROP POLICY IF EXISTS "Admins can view all admins" ON public.admins;
DROP POLICY IF EXISTS "Admins can insert admins" ON public.admins;
DROP POLICY IF EXISTS "Admins can update admins" ON public.admins;

-- ============================================================================
-- PART 2: Remove old multiple permissive policies
-- ============================================================================

-- These policies were creating multiple_permissive_policies warnings
-- by having separate policies for SELECT, INSERT, UPDATE, DELETE
-- They have been replaced with unified "FOR ALL" policies

-- Additional cleanup for any remaining old-style policies
DROP POLICY IF EXISTS "enable_read_access" ON public.users;
DROP POLICY IF EXISTS "enable_insert_access" ON public.users;
DROP POLICY IF EXISTS "enable_update_access" ON public.users;
DROP POLICY IF EXISTS "enable_delete_access" ON public.users;

-- Cleanup for services
DROP POLICY IF EXISTS "enable_read_for_all" ON public.services;
DROP POLICY IF EXISTS "enable_insert_for_sellers" ON public.services;
DROP POLICY IF EXISTS "enable_update_for_sellers" ON public.services;
DROP POLICY IF EXISTS "enable_delete_for_sellers" ON public.services;

-- Cleanup for orders
DROP POLICY IF EXISTS "enable_read_for_participants" ON public.orders;
DROP POLICY IF EXISTS "enable_insert_for_buyers" ON public.orders;
DROP POLICY IF EXISTS "enable_update_for_participants" ON public.orders;

-- Cleanup for categories
DROP POLICY IF EXISTS "Enable read access for all users" ON public.categories;
DROP POLICY IF EXISTS "Anyone can view categories" ON public.categories;

-- Migration complete
-- Verify in Supabase Dashboard > Database > Database Linter that warnings are resolved
