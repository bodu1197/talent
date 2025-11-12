-- Supabase Complete Schema Dump
-- Generated: 2025-11-12T11:10:49.920Z
-- Project: bpvfkkrlyrjkwgwmfrci
-- Database: postgres

SET statement_timeout = 0;
SET lock_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";


-- Table: users
CREATE TABLE IF NOT EXISTS public.users (
  id UUID DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  phone TEXT,
  profile_image TEXT,
  bio TEXT,
  email_verified BOOLEAN DEFAULT false,
  phone_verified BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  user_type TEXT DEFAULT 'buyer',
  last_login_at TIMESTAMP WITH TIME ZONE,
  deleted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (id)
);
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users (email);
CREATE INDEX IF NOT EXISTS idx_users_phone ON public.users (phone);

-- Table: seller_profiles
CREATE TABLE IF NOT EXISTS public.seller_profiles (
  user_id UUID,
  business_name TEXT,
  description TEXT,
  skills TEXT[],
  bank_name TEXT,
  bank_account TEXT,
  account_holder TEXT,
  is_verified BOOLEAN DEFAULT false,
  rating DECIMAL(3,2) DEFAULT 0,
  total_sales INTEGER DEFAULT 0,
  total_reviews INTEGER DEFAULT 0,
  response_time TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (user_id)
);
ALTER TABLE public.seller_profiles ADD CONSTRAINT seller_profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);

-- Table: categories
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT,
  parent_id UUID,
  level INTEGER DEFAULT 0 NOT NULL,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  is_ai_category BOOLEAN DEFAULT false,
  service_count INTEGER DEFAULT 0,
  commission_rate DECIMAL(5,2) DEFAULT 10.00,
  keywords TEXT[],
  meta_title TEXT,
  meta_description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (id)
);
ALTER TABLE public.categories ADD CONSTRAINT categories_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES public.categories(id);
CREATE INDEX IF NOT EXISTS idx_categories_parent_id ON public.categories (parent_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_categories_slug ON public.categories (slug);

-- Table: services
CREATE TABLE IF NOT EXISTS public.services (
  id UUID DEFAULT gen_random_uuid(),
  seller_id UUID NOT NULL,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  price INTEGER NOT NULL,
  price_unit TEXT DEFAULT 'KRW',
  delivery_days INTEGER NOT NULL,
  revision_count INTEGER DEFAULT 1,
  express_delivery BOOLEAN DEFAULT false,
  express_days INTEGER,
  express_price INTEGER,
  thumbnail_url TEXT,
  video_url TEXT,
  portfolio_urls TEXT[],
  requirements TEXT,
  status TEXT DEFAULT 'draft',
  is_featured BOOLEAN DEFAULT false,
  featured_until TIMESTAMP WITH TIME ZONE,
  views INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  orders_count INTEGER DEFAULT 0,
  completed_orders INTEGER DEFAULT 0,
  in_progress_orders INTEGER DEFAULT 0,
  rating DECIMAL(3,2),
  review_count INTEGER DEFAULT 0,
  meta_title TEXT,
  meta_description TEXT,
  version INTEGER DEFAULT 1,
  last_modified_by UUID,
  deleted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (id)
);
ALTER TABLE public.services ADD CONSTRAINT services_seller_id_fkey FOREIGN KEY (seller_id) REFERENCES public.users(id);
ALTER TABLE public.services ADD CONSTRAINT services_last_modified_by_fkey FOREIGN KEY (last_modified_by) REFERENCES public.users(id);
CREATE INDEX IF NOT EXISTS idx_services_seller_id ON public.services (seller_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_services_slug ON public.services (slug);
CREATE INDEX IF NOT EXISTS idx_services_status ON public.services (status);

-- Table: favorites
CREATE TABLE IF NOT EXISTS public.favorites (
  id UUID DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  service_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (id)
);
ALTER TABLE public.favorites ADD CONSTRAINT favorites_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);
ALTER TABLE public.favorites ADD CONSTRAINT favorites_service_id_fkey FOREIGN KEY (service_id) REFERENCES public.services(id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_favorites_user_service ON public.favorites (user_id, service_id);

-- Table: orders
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID DEFAULT gen_random_uuid(),
  order_number TEXT NOT NULL UNIQUE,
  buyer_id UUID NOT NULL,
  seller_id UUID NOT NULL,
  service_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  package_type TEXT,
  requirements TEXT,
  attachments TEXT[],
  base_amount INTEGER NOT NULL,
  express_amount INTEGER DEFAULT 0,
  additional_amount INTEGER DEFAULT 0,
  discount_amount INTEGER DEFAULT 0,
  total_amount INTEGER NOT NULL,
  commission_rate DECIMAL(5,2) NOT NULL,
  commission_fee INTEGER NOT NULL,
  seller_amount INTEGER NOT NULL,
  delivery_date TEXT NOT NULL,
  revision_count INTEGER DEFAULT 1,
  used_revisions INTEGER DEFAULT 0,
  status TEXT DEFAULT 'pending',
  payment_status TEXT DEFAULT 'unpaid',
  work_status TEXT DEFAULT 'pending',
  paid_at TIMESTAMP WITH TIME ZONE,
  started_at TIMESTAMP WITH TIME ZONE,
  delivered_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  cancelled_at TIMESTAMP WITH TIME ZONE,
  cancellation_reason TEXT,
  auto_complete_at TIMESTAMP WITH TIME ZONE,
  buyer_satisfied BOOLEAN,
  seller_rating INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (id)
);
ALTER TABLE public.orders ADD CONSTRAINT orders_buyer_id_fkey FOREIGN KEY (buyer_id) REFERENCES public.users(id);
ALTER TABLE public.orders ADD CONSTRAINT orders_seller_id_fkey FOREIGN KEY (seller_id) REFERENCES public.users(id);
ALTER TABLE public.orders ADD CONSTRAINT orders_service_id_fkey FOREIGN KEY (service_id) REFERENCES public.services(id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_orders_order_number ON public.orders (order_number);
CREATE INDEX IF NOT EXISTS idx_orders_buyer_id ON public.orders (buyer_id);
CREATE INDEX IF NOT EXISTS idx_orders_seller_id ON public.orders (seller_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders (status);

-- Table: reviews
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL UNIQUE,
  buyer_id UUID NOT NULL,
  seller_id UUID NOT NULL,
  service_id UUID NOT NULL,
  rating INTEGER NOT NULL,
  communication_rating INTEGER,
  quality_rating INTEGER,
  delivery_rating INTEGER,
  comment TEXT,
  tags TEXT[],
  images TEXT[],
  seller_reply TEXT,
  seller_reply_at TIMESTAMP WITH TIME ZONE,
  helpful_count INTEGER DEFAULT 0,
  not_helpful_count INTEGER DEFAULT 0,
  is_visible BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  moderated BOOLEAN DEFAULT false,
  moderation_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (id)
);
ALTER TABLE public.reviews ADD CONSTRAINT reviews_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id);
ALTER TABLE public.reviews ADD CONSTRAINT reviews_buyer_id_fkey FOREIGN KEY (buyer_id) REFERENCES public.users(id);
ALTER TABLE public.reviews ADD CONSTRAINT reviews_seller_id_fkey FOREIGN KEY (seller_id) REFERENCES public.users(id);
ALTER TABLE public.reviews ADD CONSTRAINT reviews_service_id_fkey FOREIGN KEY (service_id) REFERENCES public.services(id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_reviews_order_id ON public.reviews (order_id);
CREATE INDEX IF NOT EXISTS idx_reviews_seller_id ON public.reviews (seller_id);
CREATE INDEX IF NOT EXISTS idx_reviews_service_id ON public.reviews (service_id);

-- Table: conversations
CREATE TABLE IF NOT EXISTS public.conversations (
  id UUID DEFAULT gen_random_uuid(),
  participant1_id UUID NOT NULL,
  participant2_id UUID NOT NULL,
  order_id UUID,
  is_active BOOLEAN DEFAULT true,
  last_message_at TIMESTAMP WITH TIME ZONE,
  last_message_preview TEXT,
  participant1_last_read TIMESTAMP WITH TIME ZONE,
  participant2_last_read TIMESTAMP WITH TIME ZONE,
  participant1_unread_count INTEGER DEFAULT 0,
  participant2_unread_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (id)
);
ALTER TABLE public.conversations ADD CONSTRAINT conversations_participant1_id_fkey FOREIGN KEY (participant1_id) REFERENCES public.users(id);
ALTER TABLE public.conversations ADD CONSTRAINT conversations_participant2_id_fkey FOREIGN KEY (participant2_id) REFERENCES public.users(id);
ALTER TABLE public.conversations ADD CONSTRAINT conversations_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id);
CREATE INDEX IF NOT EXISTS idx_conversations_participants ON public.conversations (participant1_id, participant2_id);

-- Table: messages
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL,
  sender_id UUID NOT NULL,
  content TEXT,
  message_type TEXT DEFAULT 'text',
  attachments JSONB,
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMP WITH TIME ZONE,
  is_edited BOOLEAN DEFAULT false,
  edited_at TIMESTAMP WITH TIME ZONE,
  is_deleted BOOLEAN DEFAULT false,
  deleted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (id)
);
ALTER TABLE public.messages ADD CONSTRAINT messages_conversation_id_fkey FOREIGN KEY (conversation_id) REFERENCES public.conversations(id);
ALTER TABLE public.messages ADD CONSTRAINT messages_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES public.users(id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON public.messages (conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON public.messages (sender_id);

-- Table: payments
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID DEFAULT gen_random_uuid(),
  order_id UUID,
  transaction_id TEXT NOT NULL UNIQUE,
  amount INTEGER NOT NULL,
  vat INTEGER,
  payment_method TEXT NOT NULL,
  pg_provider TEXT NOT NULL,
  card_company TEXT,
  card_number_masked TEXT,
  installment_months INTEGER,
  approval_number TEXT,
  status TEXT DEFAULT 'pending',
  pg_response JSONB,
  paid_at TIMESTAMP WITH TIME ZONE,
  failed_at TIMESTAMP WITH TIME ZONE,
  cancelled_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (id)
);
ALTER TABLE public.payments ADD CONSTRAINT payments_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_payments_transaction_id ON public.payments (transaction_id);
CREATE INDEX IF NOT EXISTS idx_payments_order_id ON public.payments (order_id);
