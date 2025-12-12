-- Dolpagu Complete Database Schema Export
-- Generated: 2025-12-12T11:35:58.908Z
-- Source Project: bpvfkkrlyrjkwgwmfrci
--
-- This file contains the complete database schema including:
-- - Tables, Columns, Constraints
-- - Indexes
-- - Functions
-- - Triggers
-- - Views
-- - RLS Policies
--
-- Import order: Run this entire file in SQL Editor of new Supabase project

BEGIN;

-- ============================================
-- Tables
-- ============================================

CREATE TABLE public.activity_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid,
  admin_id uuid,
  action text NOT NULL,
  entity_type text,
  entity_id uuid,
  old_value jsonb,
  new_value jsonb,
  ip_address inet,
  user_agent text,
  created_at timestamp with time zone DEFAULT now(),
  PRIMARY KEY (id)
);

CREATE TABLE public.admins (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  role text NOT NULL,
  permissions jsonb DEFAULT '{}'::jsonb,
  department text,
  notes text,
  last_action_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  PRIMARY KEY (id),
  CHECK ((role = ANY (ARRAY['super_admin'::text, 'admin'::text, 'moderator'::text, 'cs_agent'::text]))),
  UNIQUE (user_id)
);

CREATE TABLE public.advertising_campaigns (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  seller_id uuid NOT NULL,
  campaign_name text NOT NULL,
  campaign_type text NOT NULL,
  daily_budget integer,
  total_budget integer,
  spent_amount integer DEFAULT 0,
  target_categories uuid[],
  target_keywords text[],
  target_user_types text[],
  bid_type text DEFAULT 'cpc'::text,
  bid_amount integer NOT NULL,
  start_date timestamp with time zone NOT NULL,
  end_date timestamp with time zone NOT NULL,
  status text DEFAULT 'draft'::text,
  approval_status text DEFAULT 'pending'::text,
  rejection_reason text,
  impressions integer DEFAULT 0,
  clicks integer DEFAULT 0,
  conversions integer DEFAULT 0,
  ctr numeric(5,2) DEFAULT 0.00,
  conversion_rate numeric(5,2) DEFAULT 0.00,
  roi numeric(10,2) DEFAULT 0.00,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CHECK ((approval_status = ANY (ARRAY['pending'::text, 'approved'::text, 'rejected'::text]))),
  CHECK ((bid_type = ANY (ARRAY['cpc'::text, 'cpm'::text, 'fixed'::text]))),
  CHECK ((campaign_type = ANY (ARRAY['premium_placement'::text, 'sponsored_search'::text, 'banner'::text]))),
  PRIMARY KEY (id),
  CHECK ((status = ANY (ARRAY['draft'::text, 'pending'::text, 'active'::text, 'paused'::text, 'completed'::text, 'cancelled'::text])))
);

CREATE TABLE public.advertising_credits (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  seller_id uuid NOT NULL,
  amount integer NOT NULL DEFAULT 0,
  initial_amount integer NOT NULL DEFAULT 0,
  used_amount integer NOT NULL DEFAULT 0,
  promotion_type text,
  expires_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  PRIMARY KEY (id)
);

CREATE TABLE public.advertising_impressions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  subscription_id uuid NOT NULL,
  service_id uuid NOT NULL,
  category_id text,
  "position" integer NOT NULL,
  page_number integer DEFAULT 1,
  user_id uuid,
  session_id text,
  ip_address inet,
  user_agent text,
  clicked boolean DEFAULT false,
  clicked_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  PRIMARY KEY (id)
);

CREATE TABLE public.advertising_payments (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  subscription_id uuid NOT NULL,
  seller_id uuid NOT NULL,
  amount integer NOT NULL,
  payment_method text NOT NULL,
  status text NOT NULL DEFAULT 'pending'::text,
  depositor_name text,
  bank_name text,
  deposit_date date,
  deposit_time time without time zone,
  receipt_image text,
  pg_transaction_id text,
  card_company text,
  card_number_masked text,
  paid_at timestamp with time zone,
  confirmed_at timestamp with time zone,
  confirmed_by uuid,
  admin_memo text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  supply_amount integer,
  tax_amount integer,
  tax_invoice_id uuid,
  PRIMARY KEY (id)
);

CREATE TABLE public.advertising_subscriptions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  seller_id uuid NOT NULL,
  service_id uuid NOT NULL,
  monthly_price integer NOT NULL DEFAULT 100000,
  status text NOT NULL DEFAULT 'active'::text,
  payment_method text NOT NULL,
  next_billing_date date NOT NULL,
  last_billed_at timestamp with time zone,
  bank_transfer_deadline timestamp with time zone,
  bank_transfer_confirmed boolean DEFAULT false,
  bank_transfer_confirmed_at timestamp with time zone,
  bank_transfer_confirmed_by uuid,
  started_at timestamp with time zone DEFAULT now(),
  cancelled_at timestamp with time zone,
  expires_at timestamp with time zone,
  total_impressions integer DEFAULT 0,
  total_clicks integer DEFAULT 0,
  total_paid integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  PRIMARY KEY (id),
  UNIQUE (service_id)
);

CREATE TABLE public.buyers (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  total_orders integer DEFAULT 0,
  total_spent integer DEFAULT 0,
  points integer DEFAULT 0,
  coupon_count integer DEFAULT 0,
  last_order_at timestamp with time zone,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  PRIMARY KEY (id),
  UNIQUE (user_id)
);

CREATE TABLE public.categories (
  id text NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL,
  parent_id text,
  level integer,
  icon text,
  description text,
  meta_title text,
  meta_description text,
  keywords text[],
  display_order integer DEFAULT 0,
  service_count integer DEFAULT 0,
  is_ai_category boolean DEFAULT false,
  is_featured boolean DEFAULT false,
  commission_rate numeric(5,2) DEFAULT 20.00,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  popularity_score integer DEFAULT 0,
  is_ai boolean DEFAULT false,
  service_type character varying(10) DEFAULT 'online'::character varying,
  CHECK ((level = ANY (ARRAY[1, 2, 3]))),
  PRIMARY KEY (id),
  CHECK (((service_type)::text = ANY ((ARRAY['online'::character varying, 'offline'::character varying, 'both'::character varying])::text[]))),
  UNIQUE (slug)
);

CREATE TABLE public.category_visits (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  category_id text NOT NULL,
  category_name text NOT NULL,
  category_slug text NOT NULL,
  visited_at timestamp with time zone DEFAULT now(),
  visited_date date,
  PRIMARY KEY (id)
);

CREATE TABLE public.chat_favorites (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  room_id uuid NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  PRIMARY KEY (id),
  UNIQUE (user_id, room_id)
);

CREATE TABLE public.chat_messages (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  room_id uuid NOT NULL,
  sender_id uuid NOT NULL,
  message text NOT NULL,
  is_read boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  file_url text,
  file_name text,
  file_size integer,
  file_type text,
  PRIMARY KEY (id)
);

CREATE TABLE public.chat_rooms (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user1_id uuid NOT NULL,
  user2_id uuid NOT NULL,
  service_id uuid,
  last_message_at timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  PRIMARY KEY (id),
  UNIQUE NULLS NOT DISTINCT (user1_id, user2_id, service_id),
  CHECK ((user1_id <= user2_id))
);

CREATE TABLE public.company_info (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  business_number character varying(20) NOT NULL,
  company_name character varying(100) NOT NULL,
  ceo_name character varying(50) NOT NULL,
  address text NOT NULL,
  business_type character varying(50),
  business_item character varying(50),
  phone character varying(20),
  email character varying(100),
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE (business_number),
  PRIMARY KEY (id)
);

CREATE TABLE public.conversations (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  order_id uuid,
  participant1_id uuid NOT NULL,
  participant2_id uuid NOT NULL,
  is_active boolean DEFAULT true,
  last_message_at timestamp with time zone,
  last_message_preview text,
  participant1_last_read timestamp with time zone,
  participant2_last_read timestamp with time zone,
  participant1_unread_count integer DEFAULT 0,
  participant2_unread_count integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  PRIMARY KEY (id)
);

CREATE TABLE public.credit_transactions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  credit_id uuid NOT NULL,
  seller_id uuid NOT NULL,
  transaction_type text NOT NULL,
  amount integer NOT NULL,
  balance_after integer NOT NULL,
  description text NOT NULL,
  reference_type text,
  reference_id uuid,
  created_at timestamp with time zone DEFAULT now(),
  PRIMARY KEY (id)
);

CREATE TABLE public.disputes (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL,
  initiated_by uuid NOT NULL,
  dispute_type text NOT NULL,
  reason text NOT NULL,
  requested_action text,
  evidence_description text,
  evidence_urls text[],
  status text DEFAULT 'open'::text,
  resolution text,
  resolution_details text,
  mediator_id uuid,
  mediation_notes text,
  opened_at timestamp with time zone DEFAULT now(),
  mediation_started_at timestamp with time zone,
  resolved_at timestamp with time zone,
  closed_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CHECK ((dispute_type = ANY (ARRAY['quality'::text, 'non_delivery'::text, 'delay'::text, 'communication'::text]))),
  PRIMARY KEY (id),
  CHECK ((requested_action = ANY (ARRAY['refund'::text, 'revision'::text, 'compensation'::text]))),
  CHECK ((resolution = ANY (ARRAY['refund_full'::text, 'refund_partial'::text, 'revision'::text, 'rejected'::text]))),
  CHECK ((status = ANY (ARRAY['open'::text, 'in_mediation'::text, 'resolved'::text, 'closed'::text])))
);

CREATE TABLE public.earnings_transactions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  seller_id uuid NOT NULL,
  order_id uuid,
  type text NOT NULL,
  amount integer NOT NULL,
  status text NOT NULL,
  description text,
  order_number text,
  transaction_date timestamp with time zone DEFAULT now(),
  completed_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  PRIMARY KEY (id),
  CHECK ((status = ANY (ARRAY['pending'::text, 'available'::text, 'completed'::text, 'cancelled'::text]))),
  CHECK ((type = ANY (ARRAY['sale'::text, 'withdraw'::text, 'refund'::text, 'adjustment'::text])))
);

CREATE TABLE public.errand_applications (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  errand_id uuid NOT NULL,
  helper_id uuid NOT NULL,
  message text,
  proposed_price numeric(10,0),
  status character varying(20) NOT NULL DEFAULT 'pending'::character varying,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE (errand_id, helper_id),
  PRIMARY KEY (id),
  CHECK (((status)::text = ANY ((ARRAY['pending'::character varying, 'accepted'::character varying, 'rejected'::character varying, 'withdrawn'::character varying])::text[])))
);

CREATE TABLE public.errand_chat_messages (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  errand_id uuid NOT NULL,
  sender_id uuid NOT NULL,
  message text NOT NULL,
  message_type character varying(20) DEFAULT 'text'::character varying,
  is_read boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CHECK (((message_type)::text = ANY ((ARRAY['text'::character varying, 'image'::character varying, 'location'::character varying, 'system'::character varying])::text[]))),
  PRIMARY KEY (id)
);

CREATE TABLE public.errand_disputes (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  errand_id uuid NOT NULL,
  reporter_id uuid NOT NULL,
  reported_id uuid NOT NULL,
  reason character varying(100) NOT NULL,
  description text NOT NULL,
  evidence_urls text[],
  status character varying(20) NOT NULL DEFAULT 'open'::character varying,
  admin_note text,
  resolution text,
  resolved_at timestamp with time zone,
  resolved_by uuid,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  PRIMARY KEY (id),
  CHECK (((status)::text = ANY ((ARRAY['open'::character varying, 'investigating'::character varying, 'resolved'::character varying, 'dismissed'::character varying])::text[])))
);

CREATE TABLE public.errand_locations (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  errand_id uuid NOT NULL,
  helper_id uuid NOT NULL,
  lat numeric(10,8) NOT NULL,
  lng numeric(11,8) NOT NULL,
  accuracy numeric(10,2),
  heading numeric(5,2),
  speed numeric(6,2),
  recorded_at timestamp with time zone DEFAULT now(),
  PRIMARY KEY (id)
);

CREATE TABLE public.errand_messages (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  errand_id uuid NOT NULL,
  sender_id uuid NOT NULL,
  message text NOT NULL,
  message_type character varying(20) DEFAULT 'text'::character varying,
  is_read boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  CHECK (((message_type)::text = ANY ((ARRAY['text'::character varying, 'image'::character varying, 'location'::character varying, 'system'::character varying])::text[]))),
  PRIMARY KEY (id)
);

CREATE TABLE public.errand_reviews (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  errand_id uuid NOT NULL,
  reviewer_id uuid NOT NULL,
  helper_id uuid NOT NULL,
  rating integer NOT NULL,
  speed_rating integer,
  kindness_rating integer,
  accuracy_rating integer,
  content text,
  created_at timestamp with time zone DEFAULT now(),
  CHECK (((accuracy_rating >= 1) AND (accuracy_rating <= 5))),
  UNIQUE (errand_id),
  CHECK (((kindness_rating >= 1) AND (kindness_rating <= 5))),
  PRIMARY KEY (id),
  CHECK (((rating >= 1) AND (rating <= 5))),
  CHECK (((speed_rating >= 1) AND (speed_rating <= 5)))
);

CREATE TABLE public.errand_settlements (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  errand_id uuid NOT NULL,
  helper_id uuid NOT NULL,
  total_amount numeric(10,0) NOT NULL,
  status character varying(20) NOT NULL DEFAULT 'pending'::character varying,
  available_at timestamp with time zone,
  withdrawn_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE (errand_id),
  PRIMARY KEY (id),
  CHECK (((status)::text = ANY ((ARRAY['pending'::character varying, 'available'::character varying, 'withdrawn'::character varying])::text[])))
);

CREATE TABLE public.errand_stops (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  errand_id uuid NOT NULL,
  stop_order integer NOT NULL,
  address text NOT NULL,
  address_detail text,
  lat numeric,
  lng numeric,
  recipient_name text,
  recipient_phone text,
  is_completed boolean DEFAULT false,
  completed_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  PRIMARY KEY (id)
);

CREATE TABLE public.errands (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  requester_id uuid NOT NULL,
  helper_id uuid,
  title character varying(200) NOT NULL,
  description text,
  category errand_category NOT NULL DEFAULT 'OTHER'::errand_category,
  pickup_address text NOT NULL,
  pickup_lat numeric(10,8),
  pickup_lng numeric(11,8),
  delivery_address text NOT NULL,
  delivery_lat numeric(10,8),
  delivery_lng numeric(11,8),
  estimated_distance numeric(10,2),
  base_price numeric(10,0) NOT NULL DEFAULT 5000,
  distance_price numeric(10,0) DEFAULT 0,
  tip numeric(10,0) DEFAULT 0,
  total_price numeric(10,0) NOT NULL,
  status errand_status NOT NULL DEFAULT 'OPEN'::errand_status,
  scheduled_at timestamp with time zone,
  started_at timestamp with time zone,
  completed_at timestamp with time zone,
  cancelled_at timestamp with time zone,
  cancel_reason text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  pickup_detail text,
  delivery_detail text,
  is_multi_stop boolean DEFAULT false,
  shopping_range text,
  shopping_items jsonb,
  stop_fee numeric DEFAULT 0,
  range_fee numeric DEFAULT 0,
  item_fee numeric DEFAULT 0,
  total_stops integer DEFAULT 1,
  PRIMARY KEY (id)
);

CREATE TABLE public.food_carts (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid,
  store_id uuid,
  items jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  PRIMARY KEY (id),
  UNIQUE (user_id, store_id)
);

CREATE TABLE public.food_menu_categories (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  store_id uuid,
  name character varying(50) NOT NULL,
  description text,
  sort_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  PRIMARY KEY (id)
);

CREATE TABLE public.food_menu_option_groups (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  menu_id uuid,
  name character varying(50) NOT NULL,
  is_required boolean DEFAULT false,
  min_select integer DEFAULT 0,
  max_select integer DEFAULT 1,
  sort_order integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  PRIMARY KEY (id)
);

CREATE TABLE public.food_menu_option_items (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  option_group_id uuid,
  name character varying(50) NOT NULL,
  price integer DEFAULT 0,
  is_available boolean DEFAULT true,
  sort_order integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  PRIMARY KEY (id)
);

CREATE TABLE public.food_menus (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  store_id uuid,
  category_id uuid,
  name character varying(100) NOT NULL,
  description text,
  price integer NOT NULL,
  image_url text,
  is_popular boolean DEFAULT false,
  is_available boolean DEFAULT true,
  sort_order integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  PRIMARY KEY (id)
);

CREATE TABLE public.food_orders (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  order_number character varying(20) NOT NULL,
  store_id uuid,
  customer_id uuid,
  delivery_address character varying(255) NOT NULL,
  delivery_detail_address character varying(100),
  delivery_phone character varying(20) NOT NULL,
  delivery_request text,
  items jsonb NOT NULL,
  subtotal integer NOT NULL,
  delivery_fee integer DEFAULT 0,
  platform_fee integer DEFAULT 0,
  discount_amount integer DEFAULT 0,
  total_amount integer NOT NULL,
  status food_order_status DEFAULT 'pending'::food_order_status,
  payment_method character varying(20),
  payment_status character varying(20) DEFAULT 'pending'::character varying,
  rider_id uuid,
  estimated_delivery_time timestamp with time zone,
  picked_up_at timestamp with time zone,
  delivered_at timestamp with time zone,
  cancelled_at timestamp with time zone,
  cancel_reason text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE (order_number),
  PRIMARY KEY (id)
);

CREATE TABLE public.food_reviews (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  order_id uuid,
  store_id uuid,
  user_id uuid,
  rating integer NOT NULL,
  content text,
  image_urls text[],
  reply text,
  replied_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  PRIMARY KEY (id),
  CHECK (((rating >= 1) AND (rating <= 5)))
);

CREATE TABLE public.food_store_favorites (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid,
  store_id uuid,
  created_at timestamp with time zone DEFAULT now(),
  PRIMARY KEY (id),
  UNIQUE (user_id, store_id)
);

CREATE TABLE public.food_stores (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  owner_id uuid,
  name character varying(100) NOT NULL,
  category food_store_category NOT NULL,
  description text,
  phone character varying(20),
  address character varying(255) NOT NULL,
  detail_address character varying(100),
  latitude numeric(10,8) NOT NULL,
  longitude numeric(11,8) NOT NULL,
  thumbnail_url text,
  banner_url text,
  min_order_amount integer DEFAULT 0,
  delivery_fee integer DEFAULT 0,
  estimated_prep_time integer DEFAULT 30,
  rating numeric(2,1) DEFAULT 0,
  review_count integer DEFAULT 0,
  order_count integer DEFAULT 0,
  is_open boolean DEFAULT true,
  is_verified boolean DEFAULT false,
  is_active boolean DEFAULT true,
  business_number character varying(20),
  business_name character varying(100),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  business_document_url text,
  PRIMARY KEY (id)
);

CREATE TABLE public.helper_profiles (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  is_verified boolean DEFAULT false,
  id_card_verified_at timestamp with time zone,
  bank_name character varying(50),
  bank_account character varying(50),
  account_holder character varying(50),
  grade helper_grade DEFAULT 'NEWBIE'::helper_grade,
  total_completed integer DEFAULT 0,
  total_cancelled integer DEFAULT 0,
  average_rating numeric(3,2) DEFAULT 0,
  total_reviews integer DEFAULT 0,
  subscription_status subscription_status DEFAULT 'trial'::subscription_status,
  subscription_expires_at timestamp with time zone,
  billing_key character varying(255),
  preferred_categories text[],
  preferred_areas text[],
  bio text,
  is_active boolean DEFAULT false,
  last_active_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  current_lat numeric(10,8),
  current_lng numeric(11,8),
  last_location_at timestamp with time zone,
  is_online boolean DEFAULT false,
  PRIMARY KEY (id),
  UNIQUE (user_id)
);

CREATE TABLE public.helper_subscriptions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  helper_id uuid NOT NULL,
  payment_id character varying(100),
  amount numeric(10,0) NOT NULL DEFAULT 30000,
  paid_at timestamp with time zone DEFAULT now(),
  expires_at timestamp with time zone NOT NULL,
  status character varying(20) NOT NULL DEFAULT 'paid'::character varying,
  payment_method character varying(50),
  receipt_url text,
  created_at timestamp with time zone DEFAULT now(),
  PRIMARY KEY (id),
  CHECK (((status)::text = ANY ((ARRAY['paid'::character varying, 'failed'::character varying, 'refunded'::character varying, 'pending'::character varying])::text[])))
);

CREATE TABLE public.helper_withdrawals (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  helper_id uuid NOT NULL,
  amount numeric(10,0) NOT NULL,
  bank_name character varying(50) NOT NULL,
  bank_account character varying(50) NOT NULL,
  account_holder character varying(50) NOT NULL,
  status character varying(20) NOT NULL DEFAULT 'pending'::character varying,
  reject_reason text,
  requested_at timestamp with time zone DEFAULT now(),
  processed_at timestamp with time zone,
  processed_by uuid,
  PRIMARY KEY (id),
  CHECK (((status)::text = ANY ((ARRAY['pending'::character varying, 'approved'::character varying, 'completed'::character varying, 'rejected'::character varying])::text[])))
);

CREATE TABLE public.messages (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL,
  sender_id uuid NOT NULL,
  message_type text DEFAULT 'text'::text,
  content text,
  attachments jsonb,
  is_read boolean DEFAULT false,
  read_at timestamp with time zone,
  is_edited boolean DEFAULT false,
  edited_at timestamp with time zone,
  is_deleted boolean DEFAULT false,
  deleted_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  CHECK ((message_type = ANY (ARRAY['text'::text, 'image'::text, 'file'::text, 'system'::text]))),
  PRIMARY KEY (id)
);

CREATE TABLE public.notices (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  title character varying(200) NOT NULL,
  content text NOT NULL,
  category character varying(20) NOT NULL DEFAULT '공지'::character varying,
  is_important boolean DEFAULT false,
  is_published boolean DEFAULT true,
  view_count integer DEFAULT 0,
  created_by uuid,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CHECK (((category)::text = ANY ((ARRAY['공지'::character varying, '이벤트'::character varying, '업데이트'::character varying, '점검'::character varying, '정책'::character varying])::text[]))),
  PRIMARY KEY (id)
);

CREATE TABLE public.notifications (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  type text NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  link text,
  is_read boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  order_id uuid,
  sender_id uuid,
  metadata jsonb,
  PRIMARY KEY (id),
  CHECK ((type = ANY (ARRAY['order_new'::text, 'order_started'::text, 'order_delivered'::text, 'order_completed'::text, 'order_revision_requested'::text, 'order_revision_completed'::text, 'order_cancelled'::text, 'message_new'::text, 'review_new'::text])))
);

CREATE TABLE public.order_settlements (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL,
  seller_id uuid NOT NULL,
  order_amount integer NOT NULL,
  pg_fee integer DEFAULT 0,
  platform_fee integer DEFAULT 0,
  net_amount integer NOT NULL,
  status character varying(20) NOT NULL DEFAULT 'pending'::character varying,
  created_at timestamp with time zone DEFAULT now(),
  confirmed_at timestamp with time zone,
  paid_at timestamp with time zone,
  cancelled_at timestamp with time zone,
  auto_confirm_at timestamp with time zone,
  batch_settlement_id uuid,
  note text,
  PRIMARY KEY (id),
  CHECK (((status)::text = ANY ((ARRAY['pending'::character varying, 'confirmed'::character varying, 'processing'::character varying, 'paid'::character varying, 'cancelled'::character varying])::text[])))
);

CREATE TABLE public.orders (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  order_number text NOT NULL DEFAULT ((('ORD-'::text || to_char(now(), 'YYYYMMDD'::text)) || '-'::text) || substr((gen_random_uuid())::text, 1, 8)),
  buyer_id uuid NOT NULL,
  seller_id uuid NOT NULL,
  service_id uuid NOT NULL,
  requirements text,
  attachments text[],
  base_amount integer NOT NULL,
  express_amount integer DEFAULT 0,
  additional_amount integer DEFAULT 0,
  discount_amount integer DEFAULT 0,
  total_amount integer NOT NULL,
  commission_rate numeric(5,2) NOT NULL,
  commission_fee integer NOT NULL,
  seller_amount integer NOT NULL,
  delivery_date date NOT NULL,
  used_revisions integer DEFAULT 0,
  status text DEFAULT 'pending_payment'::text,
  payment_status text DEFAULT 'pending'::text,
  work_status text DEFAULT 'waiting'::text,
  delivered_at timestamp with time zone,
  completed_at timestamp with time zone,
  cancellation_reason text,
  auto_complete_at timestamp with time zone,
  buyer_satisfied boolean,
  seller_rating integer,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  review_id uuid,
  payment_id uuid,
  merchant_uid text,
  payment_request_id uuid,
  delivery_days integer DEFAULT 7,
  revision_count integer DEFAULT 0,
  revisions_used integer DEFAULT 0,
  title text,
  description text,
  paid_at timestamp with time zone,
  started_at timestamp with time zone,
  cancelled_at timestamp with time zone,
  amount integer,
  revision_reason text,
  revision_requested_at timestamp with time zone,
  package_type text,
  cancel_reason text,
  auto_confirm_at timestamp with time zone,
  UNIQUE (merchant_uid),
  UNIQUE (order_number),
  CHECK ((payment_status = ANY (ARRAY['pending'::text, 'paid'::text, 'failed'::text, 'refunded'::text]))),
  PRIMARY KEY (id),
  CHECK (((seller_rating >= 1) AND (seller_rating <= 5))),
  CHECK ((status = ANY (ARRAY['pending_payment'::text, 'paid'::text, 'in_progress'::text, 'delivered'::text, 'revision_requested'::text, 'completed'::text, 'cancelled'::text, 'refund_requested'::text, 'refunded'::text]))),
  CHECK ((work_status = ANY (ARRAY['waiting'::text, 'working'::text, 'delivered'::text, 'accepted'::text])))
);

CREATE TABLE public.page_views (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  path text NOT NULL,
  user_id uuid,
  session_id text,
  ip_address inet,
  user_agent text,
  referrer text,
  country text,
  device_type text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CHECK ((device_type = ANY (ARRAY['desktop'::text, 'mobile'::text, 'tablet'::text, 'bot'::text]))),
  PRIMARY KEY (id)
);

CREATE TABLE public.payment_requests (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  room_id uuid NOT NULL,
  seller_id uuid NOT NULL,
  buyer_id uuid NOT NULL,
  service_id uuid,
  amount integer NOT NULL,
  title text NOT NULL,
  description text,
  delivery_days integer DEFAULT 7,
  revision_count integer DEFAULT 0,
  status text NOT NULL DEFAULT 'pending'::text,
  buyer_response text,
  responded_at timestamp with time zone,
  order_id uuid,
  paid_at timestamp with time zone,
  expires_at timestamp with time zone NOT NULL DEFAULT (now() + '72:00:00'::interval),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CHECK ((amount > 0)),
  PRIMARY KEY (id),
  CHECK ((status = ANY (ARRAY['pending'::text, 'accepted'::text, 'rejected'::text, 'expired'::text, 'paid'::text])))
);

CREATE TABLE public.payments (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL,
  amount integer NOT NULL,
  payment_method text NOT NULL,
  payment_id text,
  status text NOT NULL DEFAULT 'pending'::text,
  pg_provider text,
  pg_tid text,
  receipt_url text,
  paid_at timestamp with time zone,
  failed_at timestamp with time zone,
  cancelled_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CHECK ((amount > 0)),
  PRIMARY KEY (id),
  CHECK ((status = ANY (ARRAY['pending'::text, 'completed'::text, 'failed'::text, 'cancelled'::text])))
);

CREATE TABLE public.portfolio_items (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  seller_id uuid NOT NULL,
  title text NOT NULL,
  description text,
  thumbnail_url text,
  images text[],
  view_count integer DEFAULT 0,
  is_visible boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  PRIMARY KEY (id)
);

CREATE TABLE public.portfolio_services (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  portfolio_id uuid NOT NULL,
  service_id uuid NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  PRIMARY KEY (id),
  UNIQUE (portfolio_id, service_id)
);

CREATE TABLE public.premium_placements (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  campaign_id uuid,
  service_id uuid NOT NULL,
  placement_type text NOT NULL,
  placement_slot integer,
  category_id text,
  keywords text[],
  position_score integer DEFAULT 0,
  display_priority integer DEFAULT 0,
  start_date timestamp with time zone NOT NULL,
  end_date timestamp with time zone NOT NULL,
  daily_cost integer,
  total_cost integer,
  actual_cost integer DEFAULT 0,
  impressions integer DEFAULT 0,
  clicks integer DEFAULT 0,
  conversions integer DEFAULT 0,
  revenue_generated bigint DEFAULT 0,
  is_active boolean DEFAULT true,
  paused_at timestamp with time zone,
  paused_reason text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  PRIMARY KEY (id),
  CHECK ((placement_type = ANY (ARRAY['home_hero'::text, 'home_top'::text, 'category_top'::text, 'search_top'::text])))
);

CREATE TABLE public.profiles (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  name text NOT NULL,
  profile_image text,
  bio text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  role text DEFAULT 'buyer'::text,
  PRIMARY KEY (id),
  CHECK ((role = ANY (ARRAY['buyer'::text, 'seller'::text, 'admin'::text]))),
  UNIQUE (user_id)
);

CREATE TABLE public.quote_responses (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  quote_id uuid NOT NULL,
  seller_id uuid NOT NULL,
  message text NOT NULL,
  proposed_price integer NOT NULL,
  delivery_days integer NOT NULL,
  attachments text[],
  status text DEFAULT 'pending'::text,
  is_read boolean DEFAULT false,
  read_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  PRIMARY KEY (id),
  CHECK ((status = ANY (ARRAY['pending'::text, 'accepted'::text, 'rejected'::text])))
);

CREATE TABLE public.quotes (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  buyer_id uuid NOT NULL,
  title text NOT NULL,
  category_id text,
  description text NOT NULL,
  requirements text,
  attachments text[],
  budget_min integer,
  budget_max integer,
  deadline date,
  status text DEFAULT 'pending'::text,
  response_count integer DEFAULT 0,
  view_count integer DEFAULT 0,
  selected_response_id uuid,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  PRIMARY KEY (id),
  CHECK ((status = ANY (ARRAY['pending'::text, 'received'::text, 'selected'::text, 'cancelled'::text])))
);

CREATE TABLE public.refunds (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL,
  payment_id uuid NOT NULL,
  amount integer NOT NULL,
  reason text NOT NULL,
  status text NOT NULL DEFAULT 'pending'::text,
  approved_by uuid,
  approved_at timestamp with time zone,
  rejected_at timestamp with time zone,
  completed_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CHECK ((amount > 0)),
  PRIMARY KEY (id),
  CHECK ((status = ANY (ARRAY['pending'::text, 'approved'::text, 'rejected'::text, 'completed'::text])))
);

CREATE TABLE public.reports (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  reporter_id uuid NOT NULL,
  reported_user_id uuid,
  reported_service_id uuid,
  reported_order_id uuid,
  reported_review_id uuid,
  report_type text NOT NULL,
  report_reason text NOT NULL,
  description text,
  evidence_urls text[],
  status text DEFAULT 'pending'::text,
  severity text DEFAULT 'low'::text,
  assigned_to uuid,
  admin_notes text,
  action_taken text,
  assigned_at timestamp with time zone,
  resolved_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  PRIMARY KEY (id),
  CHECK ((report_type = ANY (ARRAY['spam'::text, 'fraud'::text, 'inappropriate_content'::text, 'copyright'::text, 'quality_issue'::text, 'non_delivery'::text]))),
  CHECK ((severity = ANY (ARRAY['low'::text, 'medium'::text, 'high'::text, 'critical'::text]))),
  CHECK ((status = ANY (ARRAY['pending'::text, 'reviewing'::text, 'resolved'::text, 'rejected'::text])))
);

CREATE TABLE public.reviews (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL,
  buyer_id uuid NOT NULL,
  seller_id uuid NOT NULL,
  service_id uuid NOT NULL,
  rating integer NOT NULL,
  communication_rating integer,
  quality_rating integer,
  delivery_rating integer,
  comment text,
  tags text[],
  images text[],
  seller_reply text,
  seller_reply_at timestamp with time zone,
  helpful_count integer DEFAULT 0,
  not_helpful_count integer DEFAULT 0,
  is_visible boolean DEFAULT true,
  is_featured boolean DEFAULT false,
  moderated boolean DEFAULT false,
  moderation_reason text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CHECK (((communication_rating >= 1) AND (communication_rating <= 5))),
  CHECK (((delivery_rating >= 1) AND (delivery_rating <= 5))),
  UNIQUE (order_id),
  PRIMARY KEY (id),
  CHECK (((quality_rating >= 1) AND (quality_rating <= 5))),
  CHECK (((rating >= 1) AND (rating <= 5)))
);

CREATE TABLE public.revision_history (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL,
  requested_by uuid NOT NULL,
  reason text NOT NULL,
  requested_at timestamp with time zone NOT NULL DEFAULT now(),
  completed_at timestamp with time zone,
  completed_by uuid,
  PRIMARY KEY (id),
  CHECK ((length(TRIM(BOTH FROM reason)) > 0))
);

CREATE TABLE public.schema_migrations (
  version text NOT NULL,
  executed_at timestamp with time zone DEFAULT now(),
  PRIMARY KEY (version)
);

CREATE TABLE public.search_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid,
  session_id text,
  keyword text NOT NULL,
  category_id text,
  filters jsonb,
  result_count integer,
  clicked_service_ids uuid[],
  converted_service_id uuid,
  search_duration_ms integer,
  created_at timestamp with time zone DEFAULT now(),
  PRIMARY KEY (id)
);

CREATE TABLE public.seller_earnings (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  seller_id uuid NOT NULL,
  available_balance integer DEFAULT 0,
  pending_balance integer DEFAULT 0,
  total_withdrawn integer DEFAULT 0,
  total_earned integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CHECK ((available_balance >= 0)),
  CHECK ((pending_balance >= 0)),
  PRIMARY KEY (id),
  UNIQUE (seller_id),
  CHECK ((total_earned >= 0)),
  CHECK ((total_withdrawn >= 0))
);

CREATE TABLE public.seller_portfolio (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  seller_id uuid NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  category_id text,
  thumbnail_url text,
  image_urls text[] DEFAULT '{}'::text[],
  project_url text,
  tags text[] DEFAULT '{}'::text[],
  view_count integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  youtube_url text,
  service_id uuid,
  PRIMARY KEY (id)
);

CREATE TABLE public.sellers (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  business_name text,
  business_number text,
  business_registration_file text,
  bank_name text,
  account_number text,
  account_holder text,
  is_verified boolean DEFAULT false,
  verification_status text DEFAULT 'pending'::text,
  verified_at timestamp with time zone,
  rejection_reason text,
  total_sales integer DEFAULT 0,
  total_revenue integer DEFAULT 0,
  service_count integer DEFAULT 0,
  rating numeric(3,2) DEFAULT 0.0,
  review_count integer DEFAULT 0,
  last_sale_at timestamp with time zone,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  bio text,
  phone text,
  show_phone boolean DEFAULT false,
  kakao_id text,
  kakao_openchat text,
  whatsapp text,
  website text,
  preferred_contact text[],
  certificates text,
  experience text,
  is_business boolean DEFAULT false,
  status text DEFAULT 'pending_review'::text,
  real_name text,
  contact_hours text,
  tax_invoice_available boolean DEFAULT false,
  verified boolean DEFAULT false,
  verified_name text,
  verified_phone text,
  ceo_name character varying(50),
  business_address text,
  business_type character varying(50),
  business_item character varying(50),
  business_email character varying(100),
  PRIMARY KEY (id),
  CHECK ((status = ANY (ARRAY['pending_review'::text, 'active'::text, 'suspended'::text, 'rejected'::text]))),
  UNIQUE (user_id),
  CHECK ((verification_status = ANY (ARRAY['pending'::text, 'verified'::text, 'rejected'::text])))
);

CREATE TABLE public.service_categories (
  service_id uuid NOT NULL,
  category_id text NOT NULL,
  is_primary boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  PRIMARY KEY (service_id, category_id)
);

CREATE TABLE public.service_favorites (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  service_id uuid NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  PRIMARY KEY (id),
  UNIQUE (user_id, service_id)
);

CREATE TABLE public.service_packages (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  service_id uuid NOT NULL,
  name text NOT NULL,
  package_type text NOT NULL,
  price numeric NOT NULL,
  delivery_days integer NOT NULL,
  revision_count integer DEFAULT 0,
  features text[] DEFAULT '{}'::text[],
  description text,
  is_active boolean DEFAULT true,
  display_order integer DEFAULT 1,
  is_express_available boolean DEFAULT false,
  express_days integer,
  express_price numeric,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CHECK ((package_type = ANY (ARRAY['standard'::text, 'deluxe'::text, 'premium'::text]))),
  PRIMARY KEY (id)
);

CREATE TABLE public.service_revision_categories (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  revision_id uuid NOT NULL,
  category_id text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  PRIMARY KEY (id)
);

CREATE TABLE public.service_revisions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  service_id uuid NOT NULL,
  seller_id uuid NOT NULL,
  title character varying(200) NOT NULL,
  description text,
  thumbnail_url text,
  price integer,
  status character varying(20) DEFAULT 'pending'::character varying,
  revision_note text,
  admin_note text,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  reviewed_at timestamp with time zone,
  reviewed_by uuid,
  delivery_days integer,
  revision_count integer,
  location_address character varying(500),
  location_latitude numeric(10,8),
  location_longitude numeric(11,8),
  location_region character varying(100),
  delivery_method character varying(20),
  PRIMARY KEY (id),
  CHECK (((status)::text = ANY ((ARRAY['pending'::character varying, 'approved'::character varying, 'rejected'::character varying])::text[])))
);

CREATE TABLE public.service_tags (
  service_id uuid NOT NULL,
  tag_id uuid NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  PRIMARY KEY (service_id, tag_id)
);

CREATE TABLE public.service_view_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  service_id uuid NOT NULL,
  user_id uuid,
  ip_address inet,
  user_agent text,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  PRIMARY KEY (id)
);

CREATE TABLE public.service_views (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  service_id uuid NOT NULL,
  viewed_at timestamp with time zone DEFAULT now(),
  PRIMARY KEY (id),
  UNIQUE (user_id, service_id)
);

CREATE TABLE public.services (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  seller_id uuid NOT NULL,
  title text NOT NULL,
  slug text NOT NULL,
  description text NOT NULL,
  requirements text,
  price integer NOT NULL DEFAULT 0,
  price_unit text DEFAULT 'project'::text,
  delivery_days integer NOT NULL,
  revision_count integer DEFAULT 1,
  express_delivery boolean DEFAULT false,
  express_days integer,
  express_price integer,
  thumbnail_url text,
  portfolio_urls text[],
  video_url text,
  views integer DEFAULT 0,
  clicks integer DEFAULT 0,
  orders_count integer DEFAULT 0,
  in_progress_orders integer DEFAULT 0,
  completed_orders integer DEFAULT 0,
  rating numeric(3,2) DEFAULT 0.00,
  review_count integer DEFAULT 0,
  status text DEFAULT 'pending'::text,
  is_featured boolean DEFAULT false,
  featured_until timestamp with time zone,
  meta_title text,
  meta_description text,
  version integer DEFAULT 1,
  last_modified_by uuid,
  deleted_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  search_keywords text,
  wishlist_count integer NOT NULL DEFAULT 0,
  has_packages boolean DEFAULT false,
  delivery_method character varying(20) DEFAULT 'online'::character varying,
  location_address text,
  location_latitude numeric(10,8),
  location_longitude numeric(11,8),
  location_region text,
  CHECK ((delivery_days > 0)),
  CHECK (((delivery_method)::text = ANY ((ARRAY['online'::character varying, 'offline'::character varying, 'both'::character varying])::text[]))),
  PRIMARY KEY (id),
  CHECK ((price > 0)),
  CHECK ((price_unit = ANY (ARRAY['project'::text, 'hour'::text, 'revision'::text]))),
  CHECK (((rating >= (0)::numeric) AND (rating <= (5)::numeric))),
  CHECK ((revision_count >= 0)),
  UNIQUE (slug),
  CHECK ((status = ANY (ARRAY['draft'::text, 'pending'::text, 'active'::text, 'inactive'::text, 'rejected'::text, 'suspended'::text])))
);

CREATE TABLE public.settlement_details (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  settlement_id uuid NOT NULL,
  order_id uuid NOT NULL,
  order_amount integer NOT NULL,
  commission_amount integer NOT NULL,
  seller_amount integer NOT NULL,
  type text DEFAULT 'order'::text,
  description text,
  created_at timestamp with time zone DEFAULT now(),
  PRIMARY KEY (id),
  CHECK ((type = ANY (ARRAY['order'::text, 'refund'::text, 'adjustment'::text])))
);

CREATE TABLE public.settlements (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  seller_id uuid NOT NULL,
  settlement_date date NOT NULL,
  start_date date NOT NULL,
  end_date date NOT NULL,
  total_sales bigint DEFAULT 0,
  total_commission bigint DEFAULT 0,
  total_refunds bigint DEFAULT 0,
  adjustments bigint DEFAULT 0,
  settlement_amount bigint NOT NULL,
  status text DEFAULT 'pending'::text,
  bank_name text,
  bank_account text,
  account_holder text,
  confirmed_at timestamp with time zone,
  paid_at timestamp with time zone,
  payment_proof text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  PRIMARY KEY (id),
  CHECK ((status = ANY (ARRAY['pending'::text, 'confirmed'::text, 'paid'::text, 'failed'::text])))
);

CREATE TABLE public.tags (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL,
  usage_count integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE (name),
  PRIMARY KEY (id),
  UNIQUE (slug)
);

CREATE TABLE public.tax_invoices (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  invoice_number character varying(50) NOT NULL,
  payment_id uuid,
  subscription_id uuid,
  issue_date date NOT NULL,
  issue_type character varying(20) DEFAULT 'regular'::character varying,
  status character varying(20) DEFAULT 'issued'::character varying,
  supplier_business_number character varying(20) NOT NULL,
  supplier_company_name character varying(100) NOT NULL,
  supplier_ceo_name character varying(50) NOT NULL,
  supplier_address text NOT NULL,
  supplier_business_type character varying(50),
  supplier_business_item character varying(50),
  buyer_business_number character varying(20) NOT NULL,
  buyer_company_name character varying(100) NOT NULL,
  buyer_ceo_name character varying(50) NOT NULL,
  buyer_address text NOT NULL,
  buyer_business_type character varying(50),
  buyer_business_item character varying(50),
  buyer_email character varying(100),
  supply_amount integer NOT NULL,
  tax_amount integer NOT NULL,
  total_amount integer NOT NULL,
  item_name character varying(200) NOT NULL,
  item_spec character varying(100),
  item_quantity numeric(10,2) DEFAULT 1,
  item_unit_price integer,
  remarks text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE (invoice_number),
  PRIMARY KEY (id)
);

CREATE TABLE public.user_wallets (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  balance integer DEFAULT 0,
  total_charged integer DEFAULT 0,
  total_used integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CHECK ((balance >= 0)),
  PRIMARY KEY (id),
  UNIQUE (user_id)
);

CREATE TABLE public.users (
  id uuid NOT NULL,
  email text NOT NULL,
  name text NOT NULL,
  phone text,
  profile_image text,
  bio text,
  email_verified boolean DEFAULT false,
  phone_verified boolean DEFAULT false,
  is_active boolean DEFAULT true,
  last_login_at timestamp with time zone,
  deleted_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  user_type character varying(50) DEFAULT 'buyer'::character varying,
  is_verified boolean DEFAULT false,
  verified_at timestamp with time zone,
  verification_ci text,
  real_name text,
  birth_date date,
  gender text,
  UNIQUE (email),
  PRIMARY KEY (id)
);

CREATE TABLE public.visitor_stats_daily (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  date date NOT NULL,
  path text NOT NULL,
  total_views integer NOT NULL DEFAULT 0,
  unique_visitors integer NOT NULL DEFAULT 0,
  desktop_views integer NOT NULL DEFAULT 0,
  mobile_views integer NOT NULL DEFAULT 0,
  tablet_views integer NOT NULL DEFAULT 0,
  bot_views integer NOT NULL DEFAULT 0,
  avg_session_duration integer,
  bounce_rate numeric(5,2),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE (date, path),
  PRIMARY KEY (id)
);

CREATE TABLE public.visitor_stats_hourly (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  hour timestamp with time zone NOT NULL,
  path text NOT NULL,
  total_views integer NOT NULL DEFAULT 0,
  unique_visitors integer NOT NULL DEFAULT 0,
  desktop_views integer NOT NULL DEFAULT 0,
  mobile_views integer NOT NULL DEFAULT 0,
  tablet_views integer NOT NULL DEFAULT 0,
  bot_views integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE (hour, path),
  PRIMARY KEY (id)
);

CREATE TABLE public.visitor_stats_monthly (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  year integer NOT NULL,
  month integer NOT NULL,
  path text NOT NULL,
  total_views integer NOT NULL DEFAULT 0,
  unique_visitors integer NOT NULL DEFAULT 0,
  desktop_views integer NOT NULL DEFAULT 0,
  mobile_views integer NOT NULL DEFAULT 0,
  tablet_views integer NOT NULL DEFAULT 0,
  bot_views integer NOT NULL DEFAULT 0,
  avg_session_duration integer,
  bounce_rate numeric(5,2),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CHECK (((month >= 1) AND (month <= 12))),
  PRIMARY KEY (id),
  UNIQUE (year, month, path)
);

CREATE TABLE public.wallet_transactions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  wallet_id uuid NOT NULL,
  user_id uuid NOT NULL,
  type text NOT NULL,
  amount integer NOT NULL,
  balance_after integer NOT NULL,
  description text NOT NULL,
  order_id uuid,
  payment_id uuid,
  created_at timestamp with time zone DEFAULT now(),
  PRIMARY KEY (id),
  CHECK ((type = ANY (ARRAY['charge'::text, 'use'::text, 'refund'::text, 'reward'::text])))
);

CREATE TABLE public.withdrawal_requests (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  seller_id uuid NOT NULL,
  amount integer NOT NULL,
  bank_name text NOT NULL,
  account_number text NOT NULL,
  account_holder text NOT NULL,
  status text DEFAULT 'pending'::text,
  processed_by uuid,
  processed_at timestamp with time zone,
  rejection_reason text,
  requested_at timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  completed_at timestamp with time zone,
  rejected_reason text,
  CHECK ((amount > 0)),
  PRIMARY KEY (id),
  CHECK ((status = ANY (ARRAY['pending'::text, 'processing'::text, 'completed'::text, 'rejected'::text, 'cancelled'::text])))
);


-- ============================================
-- Foreign Keys
-- ============================================

null
null
null
null
null
null
null
null
null
null
null
null
null
null
null
ALTER TABLE public.categories ADD CONSTRAINT categories_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES public.categories (parent_id);
null
null
null
null
null
null
null
null
null
null
null
null
null
null
null
null
null
null
null
null
null
null
null
null
null
null
null
null
null
null
null
null
null
null
null
null
null
null
null
null
null
null
null
null
null
null
null
null
null
null
null
null
null
null
null
null
null
null
null
null
null
null
null
null
null
null
null
null
null
null
null
null
null
null
null
null
null
null
null
null
null
null
null
null
null
null
null
null
null
null
null
null
null
null
null
null
null
null
null
null
null
null
null
null
null
null
null
null
null
null
null
null
null
null
null
null
null

-- ============================================
-- Indexes
-- ============================================

CREATE INDEX idx_activity_logs_admin_id ON public.activity_logs USING btree (admin_id);
CREATE INDEX idx_activity_logs_user_id ON public.activity_logs USING btree (user_id);
CREATE UNIQUE INDEX admins_user_id_key ON public.admins USING btree (user_id);
CREATE INDEX idx_campaigns_seller ON public.advertising_campaigns USING btree (seller_id);
CREATE INDEX idx_campaigns_status ON public.advertising_campaigns USING btree (status, approval_status);
CREATE INDEX idx_advertising_credits_expires_at ON public.advertising_credits USING btree (expires_at);
CREATE INDEX idx_advertising_credits_seller_id ON public.advertising_credits USING btree (seller_id);
CREATE INDEX idx_ad_impressions_category_id ON public.advertising_impressions USING btree (category_id);
CREATE INDEX idx_ad_impressions_clicked ON public.advertising_impressions USING btree (clicked) WHERE (clicked = true);
CREATE INDEX idx_ad_impressions_created_at ON public.advertising_impressions USING btree (created_at);
CREATE INDEX idx_ad_impressions_service_id ON public.advertising_impressions USING btree (service_id);
CREATE INDEX idx_ad_impressions_subscription_id ON public.advertising_impressions USING btree (subscription_id);
CREATE INDEX idx_ad_payments_created_at ON public.advertising_payments USING btree (created_at);
CREATE INDEX idx_ad_payments_payment_method ON public.advertising_payments USING btree (payment_method);
CREATE INDEX idx_ad_payments_seller_id ON public.advertising_payments USING btree (seller_id);
CREATE INDEX idx_ad_payments_status ON public.advertising_payments USING btree (status);
CREATE INDEX idx_ad_payments_subscription_id ON public.advertising_payments USING btree (subscription_id);
CREATE UNIQUE INDEX advertising_subscriptions_service_id_key ON public.advertising_subscriptions USING btree (service_id);
CREATE INDEX idx_ad_subscriptions_bank_transfer ON public.advertising_subscriptions USING btree (bank_transfer_confirmed) WHERE (payment_method = 'bank_transfer'::text);
CREATE INDEX idx_ad_subscriptions_next_billing ON public.advertising_subscriptions USING btree (next_billing_date);
CREATE INDEX idx_ad_subscriptions_seller_id ON public.advertising_subscriptions USING btree (seller_id);
CREATE INDEX idx_ad_subscriptions_service_id ON public.advertising_subscriptions USING btree (service_id);
CREATE INDEX idx_ad_subscriptions_status ON public.advertising_subscriptions USING btree (status);
CREATE INDEX buyers_user_id_idx ON public.buyers USING btree (user_id);
CREATE UNIQUE INDEX buyers_user_id_key ON public.buyers USING btree (user_id);
CREATE INDEX idx_buyers_created_at ON public.buyers USING btree (created_at DESC);
CREATE INDEX idx_buyers_is_active ON public.buyers USING btree (is_active);
CREATE UNIQUE INDEX categories_slug_key ON public.categories USING btree (slug);
CREATE INDEX idx_categories_active ON public.categories USING btree (is_active, display_order);
CREATE INDEX idx_categories_ai ON public.categories USING btree (is_ai_category, is_active);
CREATE INDEX idx_categories_is_ai ON public.categories USING btree (is_ai) WHERE (is_ai = true);
CREATE INDEX idx_categories_keywords ON public.categories USING gin (keywords);
CREATE INDEX idx_categories_level ON public.categories USING btree (level);
CREATE INDEX idx_categories_parent ON public.categories USING btree (parent_id);
CREATE INDEX idx_categories_parent_id ON public.categories USING btree (parent_id, display_order);
CREATE INDEX idx_categories_popularity ON public.categories USING btree (popularity_score DESC);
CREATE INDEX idx_categories_root ON public.categories USING btree (display_order) WHERE ((parent_id IS NULL) AND (is_active = true));
CREATE INDEX idx_categories_service_count ON public.categories USING btree (service_count DESC);
CREATE INDEX idx_categories_slug ON public.categories USING btree (slug);
CREATE INDEX idx_category_visits_category_id ON public.category_visits USING btree (category_id);
CREATE INDEX idx_category_visits_cleanup ON public.category_visits USING btree (visited_at);
CREATE UNIQUE INDEX idx_category_visits_unique_daily ON public.category_visits USING btree (user_id, category_id, visited_date);
CREATE INDEX idx_category_visits_user_date ON public.category_visits USING btree (user_id, visited_at DESC);
CREATE INDEX idx_category_visits_user_id ON public.category_visits USING btree (user_id);
CREATE INDEX idx_category_visits_visited_at ON public.category_visits USING btree (visited_at DESC);
CREATE UNIQUE INDEX chat_favorites_user_id_room_id_key ON public.chat_favorites USING btree (user_id, room_id);
CREATE INDEX idx_chat_favorites_room_id ON public.chat_favorites USING btree (room_id);
CREATE INDEX idx_chat_favorites_user_id ON public.chat_favorites USING btree (user_id);
CREATE INDEX idx_chat_messages_created_at ON public.chat_messages USING btree (created_at DESC);
CREATE INDEX idx_chat_messages_room_created ON public.chat_messages USING btree (room_id, created_at DESC);
CREATE INDEX idx_chat_messages_room_id ON public.chat_messages USING btree (room_id);
CREATE INDEX idx_chat_messages_room_sender ON public.chat_messages USING btree (room_id, sender_id);
CREATE INDEX idx_chat_messages_sender ON public.chat_messages USING btree (sender_id);
CREATE INDEX idx_chat_messages_unread ON public.chat_messages USING btree (room_id, is_read, sender_id) WHERE (is_read = false);
CREATE UNIQUE INDEX chat_rooms_users_service_unique ON public.chat_rooms USING btree (user1_id, user2_id, service_id) NULLS NOT DISTINCT;
CREATE INDEX idx_chat_rooms_last_message_at ON public.chat_rooms USING btree (last_message_at DESC);
CREATE INDEX idx_chat_rooms_service_id ON public.chat_rooms USING btree (service_id) WHERE (service_id IS NOT NULL);
CREATE INDEX idx_chat_rooms_user1_id ON public.chat_rooms USING btree (user1_id);
CREATE INDEX idx_chat_rooms_user1_last_message ON public.chat_rooms USING btree (user1_id, last_message_at DESC);
CREATE INDEX idx_chat_rooms_user2_id ON public.chat_rooms USING btree (user2_id);
CREATE INDEX idx_chat_rooms_user2_last_message ON public.chat_rooms USING btree (user2_id, last_message_at DESC);
CREATE UNIQUE INDEX company_info_business_number_key ON public.company_info USING btree (business_number);
CREATE INDEX idx_conversations_order_id ON public.conversations USING btree (order_id);
CREATE INDEX idx_conversations_participants ON public.conversations USING btree (participant1_id, participant2_id);
CREATE INDEX idx_credit_transactions_created_at ON public.credit_transactions USING btree (created_at);
CREATE INDEX idx_credit_transactions_credit_id ON public.credit_transactions USING btree (credit_id);
CREATE INDEX idx_credit_transactions_seller_id ON public.credit_transactions USING btree (seller_id);
CREATE INDEX idx_credit_transactions_type ON public.credit_transactions USING btree (transaction_type);
CREATE INDEX idx_disputes_initiated_by ON public.disputes USING btree (initiated_by);
CREATE INDEX idx_disputes_mediator_id ON public.disputes USING btree (mediator_id);
CREATE INDEX idx_disputes_order_id ON public.disputes USING btree (order_id);
CREATE INDEX idx_earnings_transactions_date ON public.earnings_transactions USING btree (transaction_date DESC);
CREATE INDEX idx_earnings_transactions_order_id ON public.earnings_transactions USING btree (order_id);
CREATE INDEX idx_earnings_transactions_seller_id ON public.earnings_transactions USING btree (seller_id);
CREATE INDEX idx_earnings_transactions_status ON public.earnings_transactions USING btree (status);
CREATE UNIQUE INDEX errand_applications_errand_id_helper_id_key ON public.errand_applications USING btree (errand_id, helper_id);
CREATE INDEX idx_errand_applications_errand ON public.errand_applications USING btree (errand_id);
CREATE INDEX idx_errand_applications_helper ON public.errand_applications USING btree (helper_id);
CREATE INDEX idx_errand_chat_messages_created_at ON public.errand_chat_messages USING btree (created_at DESC);
CREATE INDEX idx_errand_chat_messages_errand_id ON public.errand_chat_messages USING btree (errand_id);
CREATE INDEX idx_errand_chat_messages_sender_id ON public.errand_chat_messages USING btree (sender_id);
CREATE INDEX idx_errand_disputes_status ON public.errand_disputes USING btree (status);
CREATE INDEX idx_errand_locations_errand ON public.errand_locations USING btree (errand_id);
CREATE INDEX idx_errand_messages_errand ON public.errand_messages USING btree (errand_id);
CREATE UNIQUE INDEX errand_reviews_errand_id_key ON public.errand_reviews USING btree (errand_id);
CREATE INDEX idx_errand_reviews_helper ON public.errand_reviews USING btree (helper_id);
CREATE UNIQUE INDEX errand_settlements_errand_id_key ON public.errand_settlements USING btree (errand_id);
CREATE INDEX idx_errand_settlements_helper ON public.errand_settlements USING btree (helper_id);
CREATE INDEX idx_errand_settlements_status ON public.errand_settlements USING btree (status);
CREATE INDEX idx_errands_category ON public.errands USING btree (category);
CREATE INDEX idx_errands_created ON public.errands USING btree (created_at DESC);
CREATE INDEX idx_errands_helper ON public.errands USING btree (helper_id);
CREATE INDEX idx_errands_requester ON public.errands USING btree (requester_id);
CREATE INDEX idx_errands_status ON public.errands USING btree (status);
CREATE UNIQUE INDEX food_carts_user_id_store_id_key ON public.food_carts USING btree (user_id, store_id);
CREATE INDEX idx_food_menus_store ON public.food_menus USING btree (store_id);
CREATE UNIQUE INDEX food_orders_order_number_key ON public.food_orders USING btree (order_number);
CREATE INDEX idx_food_orders_customer ON public.food_orders USING btree (customer_id);
CREATE INDEX idx_food_orders_status ON public.food_orders USING btree (status);
CREATE INDEX idx_food_orders_store ON public.food_orders USING btree (store_id);
CREATE INDEX idx_food_reviews_store ON public.food_reviews USING btree (store_id);
CREATE UNIQUE INDEX food_store_favorites_user_id_store_id_key ON public.food_store_favorites USING btree (user_id, store_id);
CREATE INDEX idx_food_stores_active ON public.food_stores USING btree (is_active, is_verified);
CREATE INDEX idx_food_stores_category ON public.food_stores USING btree (category);
CREATE INDEX idx_food_stores_location ON public.food_stores USING btree (latitude, longitude);
CREATE UNIQUE INDEX helper_profiles_user_id_key ON public.helper_profiles USING btree (user_id);
CREATE INDEX idx_helper_profiles_grade ON public.helper_profiles USING btree (grade);
CREATE INDEX idx_helper_profiles_location ON public.helper_profiles USING btree (current_lat, current_lng) WHERE ((is_online = true) AND (is_active = true));
CREATE INDEX idx_helper_profiles_online_active ON public.helper_profiles USING btree (is_online, is_active, last_location_at) WHERE ((is_online = true) AND (is_active = true));
CREATE INDEX idx_helper_profiles_status ON public.helper_profiles USING btree (subscription_status);
CREATE INDEX idx_helper_profiles_user ON public.helper_profiles USING btree (user_id);
CREATE INDEX idx_helper_subscriptions_helper ON public.helper_subscriptions USING btree (helper_id);
CREATE INDEX idx_helper_withdrawals_helper ON public.helper_withdrawals USING btree (helper_id);
CREATE INDEX idx_helper_withdrawals_status ON public.helper_withdrawals USING btree (status);
CREATE INDEX idx_messages_conversation ON public.messages USING btree (conversation_id);
CREATE INDEX idx_messages_sender ON public.messages USING btree (sender_id);
CREATE INDEX idx_notices_category ON public.notices USING btree (category);
CREATE INDEX idx_notices_created_at ON public.notices USING btree (created_at DESC);
CREATE INDEX idx_notices_is_important ON public.notices USING btree (is_important);
CREATE INDEX idx_notices_is_published ON public.notices USING btree (is_published);
CREATE INDEX idx_notifications_created_at ON public.notifications USING btree (created_at DESC);
CREATE INDEX idx_notifications_order_id ON public.notifications USING btree (order_id) WHERE (order_id IS NOT NULL);
CREATE INDEX idx_notifications_user_id ON public.notifications USING btree (user_id);
CREATE INDEX idx_notifications_user_unread ON public.notifications USING btree (user_id, is_read) WHERE (is_read = false);
CREATE INDEX idx_order_settlements_confirmed_at ON public.order_settlements USING btree (confirmed_at) WHERE ((status)::text = 'confirmed'::text);
CREATE INDEX idx_order_settlements_order_id ON public.order_settlements USING btree (order_id);
CREATE INDEX idx_order_settlements_seller_id ON public.order_settlements USING btree (seller_id);
CREATE INDEX idx_order_settlements_status ON public.order_settlements USING btree (status);
CREATE INDEX idx_orders_buyer ON public.orders USING btree (buyer_id);
CREATE INDEX idx_orders_buyer_id ON public.orders USING btree (buyer_id, created_at DESC);
CREATE INDEX idx_orders_buyer_status ON public.orders USING btree (buyer_id, status) WHERE (buyer_id IS NOT NULL);
CREATE INDEX idx_orders_cancelled_at ON public.orders USING btree (cancelled_at) WHERE (cancelled_at IS NOT NULL);
CREATE INDEX idx_orders_completed ON public.orders USING btree (buyer_id, created_at DESC) WHERE (status = 'completed'::text);
CREATE INDEX idx_orders_merchant_uid ON public.orders USING btree (merchant_uid);
CREATE INDEX idx_orders_number ON public.orders USING btree (order_number);
CREATE INDEX idx_orders_payment_id ON public.orders USING btree (payment_id);
CREATE INDEX idx_orders_payment_request_id ON public.orders USING btree (payment_request_id);
CREATE INDEX idx_orders_pending_payment ON public.orders USING btree (created_at DESC) WHERE (status = 'pending_payment'::text);
CREATE INDEX idx_orders_seller ON public.orders USING btree (seller_id);
CREATE INDEX idx_orders_seller_id ON public.orders USING btree (seller_id, created_at DESC);
CREATE INDEX idx_orders_seller_status ON public.orders USING btree (seller_id, status) WHERE (seller_id IS NOT NULL);
CREATE INDEX idx_orders_service_id ON public.orders USING btree (service_id);
CREATE INDEX idx_orders_status ON public.orders USING btree (status, payment_status);
CREATE UNIQUE INDEX orders_merchant_uid_key ON public.orders USING btree (merchant_uid);
CREATE UNIQUE INDEX orders_order_number_key ON public.orders USING btree (order_number);
CREATE INDEX orders_review_id_idx ON public.orders USING btree (review_id);
CREATE INDEX idx_page_views_created_at ON public.page_views USING btree (created_at DESC);
CREATE INDEX idx_page_views_device_type ON public.page_views USING btree (device_type);
CREATE INDEX idx_page_views_path ON public.page_views USING btree (path);
CREATE INDEX idx_page_views_session_id ON public.page_views USING btree (session_id);
CREATE INDEX idx_page_views_user_id ON public.page_views USING btree (user_id) WHERE (user_id IS NOT NULL);
CREATE INDEX idx_payment_requests_buyer ON public.payment_requests USING btree (buyer_id);
CREATE INDEX idx_payment_requests_room ON public.payment_requests USING btree (room_id);
CREATE INDEX idx_payment_requests_seller ON public.payment_requests USING btree (seller_id);
CREATE INDEX idx_payment_requests_service_id ON public.payment_requests USING btree (service_id);
CREATE INDEX idx_payment_requests_status ON public.payment_requests USING btree (status);
CREATE INDEX idx_payments_order ON public.payments USING btree (order_id);
CREATE INDEX idx_payments_payment_id ON public.payments USING btree (payment_id);
CREATE INDEX idx_payments_status ON public.payments USING btree (status);
CREATE INDEX idx_portfolio_items_seller_id ON public.portfolio_items USING btree (seller_id);
CREATE INDEX idx_portfolio_items_visible ON public.portfolio_items USING btree (is_visible);
CREATE INDEX idx_portfolio_services_portfolio ON public.portfolio_services USING btree (portfolio_id);
CREATE INDEX idx_portfolio_services_service ON public.portfolio_services USING btree (service_id);
CREATE UNIQUE INDEX portfolio_services_portfolio_id_service_id_key ON public.portfolio_services USING btree (portfolio_id, service_id);
CREATE INDEX idx_premium_active ON public.premium_placements USING btree (is_active, start_date, end_date);
CREATE INDEX idx_premium_placements_campaign_id ON public.premium_placements USING btree (campaign_id);
CREATE INDEX idx_premium_placements_category_id ON public.premium_placements USING btree (category_id);
CREATE INDEX idx_premium_service ON public.premium_placements USING btree (service_id);
CREATE INDEX idx_profiles_role ON public.profiles USING btree (role);
CREATE INDEX idx_profiles_user_id ON public.profiles USING btree (user_id);
CREATE UNIQUE INDEX profiles_user_id_key ON public.profiles USING btree (user_id);
CREATE INDEX idx_quote_responses_quote_id ON public.quote_responses USING btree (quote_id);
CREATE INDEX idx_quote_responses_seller_id ON public.quote_responses USING btree (seller_id);
CREATE INDEX idx_quote_responses_status ON public.quote_responses USING btree (status);
CREATE INDEX idx_quotes_buyer_id ON public.quotes USING btree (buyer_id);
CREATE INDEX idx_quotes_category_id ON public.quotes USING btree (category_id);
CREATE INDEX idx_quotes_created_at ON public.quotes USING btree (created_at DESC);
CREATE INDEX idx_quotes_status ON public.quotes USING btree (status);
CREATE INDEX idx_refunds_approved_by ON public.refunds USING btree (approved_by);
CREATE INDEX idx_refunds_order ON public.refunds USING btree (order_id);
CREATE INDEX idx_refunds_payment ON public.refunds USING btree (payment_id);
CREATE INDEX idx_refunds_status ON public.refunds USING btree (status);
CREATE INDEX idx_reports_assigned_to ON public.reports USING btree (assigned_to);
CREATE INDEX idx_reports_reported_order_id ON public.reports USING btree (reported_order_id);
CREATE INDEX idx_reports_reported_review_id ON public.reports USING btree (reported_review_id);
CREATE INDEX idx_reports_reported_service_id ON public.reports USING btree (reported_service_id);
CREATE INDEX idx_reports_reported_user_id ON public.reports USING btree (reported_user_id);
CREATE INDEX idx_reports_reporter ON public.reports USING btree (reporter_id);
CREATE INDEX idx_reports_status ON public.reports USING btree (status, severity);
CREATE INDEX idx_reviews_buyer ON public.reviews USING btree (buyer_id);
CREATE INDEX idx_reviews_buyer_id ON public.reviews USING btree (buyer_id, created_at DESC);
CREATE INDEX idx_reviews_moderation ON public.reviews USING btree (created_at) WHERE ((moderated = true) OR (is_visible = false));
CREATE INDEX idx_reviews_order_id ON public.reviews USING btree (order_id);
CREATE INDEX idx_reviews_public ON public.reviews USING btree (created_at DESC) WHERE ((is_visible = true) AND (moderated = false));
CREATE INDEX idx_reviews_rating ON public.reviews USING btree (service_id, rating) WHERE ((is_visible = true) AND (moderated = false));
CREATE INDEX idx_reviews_seller ON public.reviews USING btree (seller_id);
CREATE INDEX idx_reviews_seller_id ON public.reviews USING btree (seller_id, created_at DESC);
CREATE INDEX idx_reviews_service ON public.reviews USING btree (service_id);
CREATE INDEX idx_reviews_service_id ON public.reviews USING btree (service_id, created_at DESC) WHERE ((is_visible = true) AND (moderated = false));
CREATE INDEX idx_reviews_visible ON public.reviews USING btree (is_visible, is_featured);
CREATE UNIQUE INDEX reviews_order_id_key ON public.reviews USING btree (order_id);
CREATE INDEX idx_revision_history_incomplete ON public.revision_history USING btree (order_id, completed_at) WHERE (completed_at IS NULL);
CREATE INDEX idx_revision_history_order_id ON public.revision_history USING btree (order_id);
CREATE INDEX idx_revision_history_requested_at ON public.revision_history USING btree (requested_at DESC);
CREATE INDEX idx_search_logs_category_id ON public.search_logs USING btree (category_id);
CREATE INDEX idx_search_logs_converted_service_id ON public.search_logs USING btree (converted_service_id);
CREATE INDEX idx_search_logs_keyword ON public.search_logs USING btree (keyword);
CREATE INDEX idx_search_logs_user ON public.search_logs USING btree (user_id);
CREATE INDEX idx_seller_earnings_seller_id ON public.seller_earnings USING btree (seller_id);
CREATE UNIQUE INDEX seller_earnings_seller_id_key ON public.seller_earnings USING btree (seller_id);
CREATE INDEX idx_seller_portfolio_category_id ON public.seller_portfolio USING btree (category_id);
CREATE INDEX idx_seller_portfolio_created_at ON public.seller_portfolio USING btree (created_at DESC);
CREATE INDEX idx_seller_portfolio_seller_id ON public.seller_portfolio USING btree (seller_id);
CREATE INDEX idx_seller_portfolio_service_id ON public.seller_portfolio USING btree (service_id);
CREATE INDEX idx_sellers_created_at ON public.sellers USING btree (created_at DESC);
CREATE INDEX idx_sellers_is_active ON public.sellers USING btree (is_active);
CREATE INDEX idx_sellers_is_verified ON public.sellers USING btree (is_verified);
CREATE INDEX idx_sellers_user_id ON public.sellers USING btree (user_id);
CREATE INDEX idx_sellers_verification_status ON public.sellers USING btree (verification_status);
CREATE UNIQUE INDEX sellers_user_id_key ON public.sellers USING btree (user_id);
CREATE INDEX idx_service_categories_service_id ON public.service_categories USING btree (service_id);
CREATE INDEX idx_service_favorites_created_at ON public.service_favorites USING btree (created_at DESC);
CREATE INDEX idx_service_favorites_service_id ON public.service_favorites USING btree (service_id);
CREATE INDEX idx_service_favorites_user_id ON public.service_favorites USING btree (user_id);
CREATE UNIQUE INDEX service_favorites_user_service_key ON public.service_favorites USING btree (user_id, service_id);
CREATE INDEX idx_service_packages_service_active ON public.service_packages USING btree (service_id, is_active, display_order);
CREATE UNIQUE INDEX idx_service_packages_unique_type ON public.service_packages USING btree (service_id, package_type) WHERE (is_active = true);
CREATE INDEX idx_service_revision_categories_category_id ON public.service_revision_categories USING btree (category_id);
CREATE INDEX idx_service_revision_categories_revision_id ON public.service_revision_categories USING btree (revision_id);
CREATE INDEX idx_service_revisions_seller_id ON public.service_revisions USING btree (seller_id);
CREATE INDEX idx_service_revisions_seller_status ON public.service_revisions USING btree (seller_id, status);
CREATE INDEX idx_service_revisions_service_id ON public.service_revisions USING btree (service_id);
CREATE INDEX idx_service_revisions_status ON public.service_revisions USING btree (status);
CREATE INDEX idx_service_view_logs_created_brin ON public.service_view_logs USING brin (created_at);
CREATE INDEX idx_service_view_logs_service_created ON public.service_view_logs USING btree (service_id, created_at DESC);
CREATE INDEX idx_service_view_logs_service_id ON public.service_view_logs USING btree (service_id);
CREATE INDEX idx_service_views_service_id ON public.service_views USING btree (service_id);
CREATE INDEX idx_service_views_user_id ON public.service_views USING btree (user_id);
CREATE INDEX idx_service_views_viewed_at ON public.service_views USING btree (viewed_at DESC);
CREATE UNIQUE INDEX service_views_user_service_key ON public.service_views USING btree (user_id, service_id);
CREATE INDEX idx_services_active ON public.services USING btree (created_at DESC) WHERE (status = 'active'::text);
CREATE INDEX idx_services_delivery_method ON public.services USING btree (delivery_method);
CREATE INDEX idx_services_has_packages ON public.services USING btree (has_packages) WHERE (has_packages = true);
CREATE INDEX idx_services_last_modified_by ON public.services USING btree (last_modified_by);
CREATE INDEX idx_services_location ON public.services USING btree (location_latitude, location_longitude) WHERE ((location_latitude IS NOT NULL) AND (location_longitude IS NOT NULL));
CREATE INDEX idx_services_popular ON public.services USING btree (views DESC) WHERE (status = 'active'::text);
CREATE INDEX idx_services_rating ON public.services USING btree (rating DESC, review_count DESC);
CREATE INDEX idx_services_seller_id ON public.services USING btree (seller_id);
CREATE INDEX idx_services_seller_status ON public.services USING btree (seller_id, status);
CREATE INDEX idx_services_slug ON public.services USING btree (slug);
CREATE INDEX idx_services_status ON public.services USING btree (status, deleted_at);
CREATE INDEX idx_services_status_active ON public.services USING btree (status) WHERE (status = 'active'::text);
CREATE INDEX idx_services_status_created ON public.services USING btree (status, created_at DESC) WHERE (status = 'active'::text);
CREATE INDEX idx_services_wishlist_count ON public.services USING btree (wishlist_count DESC);
CREATE UNIQUE INDEX services_slug_key ON public.services USING btree (slug);
CREATE INDEX idx_settlement_details_order_id ON public.settlement_details USING btree (order_id);
CREATE INDEX idx_settlement_details_settlement_id ON public.settlement_details USING btree (settlement_id);
CREATE INDEX idx_settlements_date ON public.settlements USING btree (settlement_date);
CREATE INDEX idx_settlements_seller ON public.settlements USING btree (seller_id);
CREATE INDEX idx_settlements_status ON public.settlements USING btree (status);
CREATE UNIQUE INDEX tags_name_key ON public.tags USING btree (name);
CREATE UNIQUE INDEX tags_slug_key ON public.tags USING btree (slug);
CREATE UNIQUE INDEX tax_invoices_invoice_number_key ON public.tax_invoices USING btree (invoice_number);
CREATE INDEX idx_user_wallets_user_id ON public.user_wallets USING btree (user_id);
CREATE UNIQUE INDEX user_wallets_user_id_key ON public.user_wallets USING btree (user_id);
CREATE INDEX idx_users_active ON public.users USING btree (is_active, deleted_at);
CREATE INDEX idx_users_email ON public.users USING btree (email);
CREATE INDEX idx_users_is_active ON public.users USING btree (is_active);
CREATE INDEX idx_users_is_verified ON public.users USING btree (is_verified);
CREATE INDEX idx_users_verification_ci ON public.users USING btree (verification_ci);
CREATE UNIQUE INDEX users_email_key ON public.users USING btree (email);
CREATE INDEX idx_visitor_stats_daily_date ON public.visitor_stats_daily USING btree (date DESC);
CREATE INDEX idx_visitor_stats_daily_path ON public.visitor_stats_daily USING btree (path);
CREATE UNIQUE INDEX visitor_stats_daily_date_path_key ON public.visitor_stats_daily USING btree (date, path);
CREATE INDEX idx_visitor_stats_hourly_hour ON public.visitor_stats_hourly USING btree (hour DESC);
CREATE INDEX idx_visitor_stats_hourly_path ON public.visitor_stats_hourly USING btree (path);
CREATE UNIQUE INDEX visitor_stats_hourly_hour_path_key ON public.visitor_stats_hourly USING btree (hour, path);
CREATE INDEX idx_visitor_stats_monthly_path ON public.visitor_stats_monthly USING btree (path);
CREATE INDEX idx_visitor_stats_monthly_year_month ON public.visitor_stats_monthly USING btree (year DESC, month DESC);
CREATE UNIQUE INDEX visitor_stats_monthly_year_month_path_key ON public.visitor_stats_monthly USING btree (year, month, path);
CREATE INDEX idx_wallet_transactions_created_at ON public.wallet_transactions USING btree (created_at DESC);
CREATE INDEX idx_wallet_transactions_order_id ON public.wallet_transactions USING btree (order_id);
CREATE INDEX idx_wallet_transactions_user_id ON public.wallet_transactions USING btree (user_id);
CREATE INDEX idx_wallet_transactions_wallet_id ON public.wallet_transactions USING btree (wallet_id);
CREATE INDEX idx_withdrawal_requests_processed_by ON public.withdrawal_requests USING btree (processed_by);
CREATE INDEX idx_withdrawal_requests_seller_id ON public.withdrawal_requests USING btree (seller_id);
CREATE UNIQUE INDEX idx_withdrawal_requests_seller_pending ON public.withdrawal_requests USING btree (seller_id) WHERE (status = 'pending'::text);
CREATE INDEX idx_withdrawal_requests_status ON public.withdrawal_requests USING btree (status);

-- ============================================
-- Functions
-- ============================================

CREATE OR REPLACE FUNCTION public.aggregate_daily_stats()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
BEGIN
  INSERT INTO visitor_stats_daily (date, path, total_views, unique_visitors, desktop_views, mobile_views, tablet_views, bot_views)
  SELECT
    DATE(created_at) as date,
    path,
    COUNT(*) as total_views,
    COUNT(DISTINCT COALESCE(user_id::text, session_id)) as unique_visitors,
    COUNT(*) FILTER (WHERE device_type = 'desktop') as desktop_views,
    COUNT(*) FILTER (WHERE device_type = 'mobile') as mobile_views,
    COUNT(*) FILTER (WHERE device_type = 'tablet') as tablet_views,
    COUNT(*) FILTER (WHERE device_type = 'bot') as bot_views
  FROM page_views
  WHERE DATE(created_at) = CURRENT_DATE - INTERVAL '1 day'
  GROUP BY DATE(created_at), path
  ON CONFLICT (date, path)
  DO UPDATE SET
    total_views = EXCLUDED.total_views,
    unique_visitors = EXCLUDED.unique_visitors,
    desktop_views = EXCLUDED.desktop_views,
    mobile_views = EXCLUDED.mobile_views,
    tablet_views = EXCLUDED.tablet_views,
    bot_views = EXCLUDED.bot_views;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.aggregate_hourly_stats()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
BEGIN
  INSERT INTO visitor_stats_hourly (hour, path, total_views, unique_visitors, desktop_views, mobile_views, tablet_views, bot_views)
  SELECT
    date_trunc('hour', created_at) as hour,
    path,
    COUNT(*) as total_views,
    COUNT(DISTINCT COALESCE(user_id::text, session_id)) as unique_visitors,
    COUNT(*) FILTER (WHERE device_type = 'desktop') as desktop_views,
    COUNT(*) FILTER (WHERE device_type = 'mobile') as mobile_views,
    COUNT(*) FILTER (WHERE device_type = 'tablet') as tablet_views,
    COUNT(*) FILTER (WHERE device_type = 'bot') as bot_views
  FROM page_views
  WHERE created_at >= date_trunc('hour', NOW()) - INTERVAL '1 hour'
    AND created_at < date_trunc('hour', NOW())
  GROUP BY date_trunc('hour', created_at), path
  ON CONFLICT (hour, path)
  DO UPDATE SET
    total_views = EXCLUDED.total_views,
    unique_visitors = EXCLUDED.unique_visitors,
    desktop_views = EXCLUDED.desktop_views,
    mobile_views = EXCLUDED.mobile_views,
    tablet_views = EXCLUDED.tablet_views,
    bot_views = EXCLUDED.bot_views;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.aggregate_monthly_stats()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
BEGIN
  INSERT INTO visitor_stats_monthly (year, month, path, total_views, unique_visitors, desktop_views, mobile_views, tablet_views, bot_views)
  SELECT
    EXTRACT(YEAR FROM created_at)::INTEGER as year,
    EXTRACT(MONTH FROM created_at)::INTEGER as month,
    path,
    COUNT(*) as total_views,
    COUNT(DISTINCT COALESCE(user_id::text, session_id)) as unique_visitors,
    COUNT(*) FILTER (WHERE device_type = 'desktop') as desktop_views,
    COUNT(*) FILTER (WHERE device_type = 'mobile') as mobile_views,
    COUNT(*) FILTER (WHERE device_type = 'tablet') as tablet_views,
    COUNT(*) FILTER (WHERE device_type = 'bot') as bot_views
  FROM page_views
  WHERE date_trunc('month', created_at) = date_trunc('month', NOW()) - INTERVAL '1 month'
  GROUP BY EXTRACT(YEAR FROM created_at), EXTRACT(MONTH FROM created_at), path
  ON CONFLICT (year, month, path)
  DO UPDATE SET
    total_views = EXCLUDED.total_views,
    unique_visitors = EXCLUDED.unique_visitors,
    desktop_views = EXCLUDED.desktop_views,
    mobile_views = EXCLUDED.mobile_views,
    tablet_views = EXCLUDED.tablet_views,
    bot_views = EXCLUDED.bot_views;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.apply_storage_policies()
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'storage'
AS $function$
BEGIN
  -- Enable RLS
  EXECUTE 'ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY';

  -- Drop existing policies
  DROP POLICY IF EXISTS "Anyone can view portfolio images" ON storage.objects;
  DROP POLICY IF EXISTS "Authenticated users can upload portfolio images" ON storage.objects;
  DROP POLICY IF EXISTS "Users can update portfolio images" ON storage.objects;
  DROP POLICY IF EXISTS "Users can delete portfolio images" ON storage.objects;

  -- Create policies
  EXECUTE 'CREATE POLICY "Anyone can view portfolio images" ON storage.objects FOR SELECT TO public USING (bucket_id = ''portfolio'')';

  EXECUTE 'CREATE POLICY "Authenticated users can upload portfolio images" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = ''portfolio'')';

  EXECUTE 'CREATE POLICY "Users can update portfolio images" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = ''portfolio'')';

  EXECUTE 'CREATE POLICY "Users can delete portfolio images" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = ''portfolio'')';

  RETURN 'Storage policies applied successfully!';
END;
$function$
;

CREATE OR REPLACE FUNCTION public.approve_service_revision(revision_id_param uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$ DECLARE v_revision RECORD; BEGIN SELECT * INTO v_revision FROM public.service_revisions WHERE id = revision_id_param; IF NOT FOUND THEN RAISE EXCEPTION 'Revision not found'; END IF; UPDATE public.services SET title = v_revision.title, description = v_revision.description, thumbnail_url = v_revision.thumbnail_url, price = v_revision.price, delivery_days = COALESCE(v_revision.delivery_days, 7), revision_count = COALESCE(v_revision.revision_count, 0), location_address = COALESCE(v_revision.location_address, location_address), location_latitude = COALESCE(v_revision.location_latitude, location_latitude), location_longitude = COALESCE(v_revision.location_longitude, location_longitude), location_region = COALESCE(v_revision.location_region, location_region), delivery_method = COALESCE(v_revision.delivery_method, delivery_method), updated_at = now() WHERE id = v_revision.service_id; DELETE FROM public.service_categories WHERE service_id = v_revision.service_id; INSERT INTO public.service_categories (service_id, category_id) SELECT v_revision.service_id, category_id FROM public.service_revision_categories WHERE revision_id = revision_id_param; UPDATE public.service_revisions SET status = 'approved', reviewed_at = now(), reviewed_by = auth.uid() WHERE id = revision_id_param; END; $function$
;

CREATE OR REPLACE FUNCTION public.calculate_distance(lat1 numeric, lon1 numeric, lat2 numeric, lon2 numeric)
 RETURNS numeric
 LANGUAGE plpgsql
 IMMUTABLE
 SET search_path TO 'public'
AS $function$
DECLARE
  R CONSTANT DECIMAL := 6371;
  dlat DECIMAL;
  dlon DECIMAL;
  a DECIMAL;
  c DECIMAL;
BEGIN
  dlat := RADIANS(lat2 - lat1);
  dlon := RADIANS(lon2 - lon1);
  a := SIN(dlat / 2) * SIN(dlat / 2) +
       COS(RADIANS(lat1)) * COS(RADIANS(lat2)) *
       SIN(dlon / 2) * SIN(dlon / 2);
  c := 2 * ATAN2(SQRT(a), SQRT(1 - a));
  RETURN R * c;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.check_email_exists(check_email text)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM auth.users WHERE email = check_email
  );
END;
$function$
;

CREATE OR REPLACE FUNCTION public.cleanup_old_category_visits()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  DELETE FROM category_visits
  WHERE visited_at < NOW() - INTERVAL '90 days';
END;
$function$
;

CREATE OR REPLACE FUNCTION public.create_notification(p_user_id uuid, p_type text, p_title text, p_message text, p_link text DEFAULT NULL::text, p_order_id uuid DEFAULT NULL::uuid, p_sender_id uuid DEFAULT NULL::uuid, p_metadata jsonb DEFAULT NULL::jsonb)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
DECLARE
  v_notification_id uuid;
BEGIN
  INSERT INTO notifications (
    user_id,
    type,
    title,
    message,
    link,
    order_id,
    sender_id,
    metadata
  ) VALUES (
    p_user_id,
    p_type,
    p_title,
    p_message,
    p_link,
    p_order_id,
    p_sender_id,
    p_metadata
  )
  RETURNING id INTO v_notification_id;

  RETURN v_notification_id;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.create_seller_earnings()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$
BEGIN
    IF NEW.user_type IN ('seller', 'both') THEN
        INSERT INTO public.seller_earnings (seller_id, available_balance, pending_balance, total_withdrawn, total_earned)
        VALUES (NEW.id, 0, 0, 0, 0)
        ON CONFLICT (seller_id) DO NOTHING;
    END IF;
    RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.create_user_wallet()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
BEGIN
    INSERT INTO public.user_wallets (user_id, balance)
    VALUES (NEW.id, 0)
    ON CONFLICT (user_id) DO NOTHING;
    RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.generate_food_order_number()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$ DECLARE new_number TEXT; BEGIN new_number := 'F' || TO_CHAR(NOW(), 'YYYYMMDD') || LPAD(CAST(FLOOR(RANDOM() * 10000) AS TEXT), 4, '0'); NEW.order_number := new_number; RETURN NEW; END; $function$
;

CREATE OR REPLACE FUNCTION public.generate_order_number()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$
BEGIN
    NEW.order_number := 'ORD-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' ||
                       LPAD(NEXTVAL('public.order_number_seq')::TEXT, 6, '0');
    RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.generate_service_slug()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$
DECLARE
    base_slug TEXT;
    final_slug TEXT;
    counter INTEGER := 0;
BEGIN
    IF (TG_OP = 'INSERT' AND NEW.slug IS NULL) OR (TG_OP = 'UPDATE' AND NEW.title IS DISTINCT FROM OLD.title) THEN
        -- 기본 슬러그 생성 (한글 처리 포함)
        base_slug := LOWER(REGEXP_REPLACE(NEW.title, '[^a-zA-Z0-9가-힣]+', '-', 'g'));
        base_slug := TRIM(BOTH '-' FROM base_slug);

        final_slug := base_slug;

        -- 중복 체크 및 고유 슬러그 생성
        WHILE EXISTS (SELECT 1 FROM public.services WHERE slug = final_slug AND id != NEW.id) LOOP
            counter := counter + 1;
            final_slug := base_slug || '-' || counter;
        END LOOP;

        NEW.slug := final_slug;
    END IF;
    RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.get_buyer_id(user_uuid uuid)
 RETURNS uuid
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  buyer_uuid UUID;
BEGIN
  SELECT id INTO buyer_uuid
  FROM buyers
  WHERE user_id = user_uuid
  LIMIT 1;

  RETURN buyer_uuid;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.get_category_path(p_category_id uuid)
 RETURNS TABLE(id uuid, name text, slug text, icon text, description text, parent_id uuid, level integer, service_count integer, is_ai boolean, is_active boolean)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  RETURN QUERY
  WITH RECURSIVE category_path AS (
    -- Base case: 현재 카테고리
    SELECT
      c.id,
      c.name,
      c.slug,
      c.icon,
      c.description,
      c.parent_id,
      c.level,
      c.service_count,
      c.is_ai,
      c.is_active,
      1 as depth
    FROM categories c
    WHERE c.id = p_category_id

    UNION ALL

    -- Recursive case: 부모 카테고리들
    SELECT
      c.id,
      c.name,
      c.slug,
      c.icon,
      c.description,
      c.parent_id,
      c.level,
      c.service_count,
      c.is_ai,
      c.is_active,
      cp.depth + 1
    FROM categories c
    INNER JOIN category_path cp ON c.id = cp.parent_id
  )
  SELECT
    cp.id,
    cp.name,
    cp.slug,
    cp.icon,
    cp.description,
    cp.parent_id,
    cp.level,
    cp.service_count,
    cp.is_ai,
    cp.is_active
  FROM category_path cp
  ORDER BY cp.level ASC;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.get_errand_unread_count(p_errand_id uuid, p_user_id uuid)
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$ DECLARE v_count INTEGER; v_profile_id UUID; BEGIN SELECT id INTO v_profile_id FROM profiles WHERE user_id = p_user_id; IF v_profile_id IS NULL THEN RETURN 0; END IF; SELECT COUNT(*) INTO v_count FROM errand_chat_messages WHERE errand_id = p_errand_id AND sender_id != v_profile_id AND is_read = FALSE; RETURN COALESCE(v_count, 0); END; $function$
;

CREATE OR REPLACE FUNCTION public.get_nearby_errands(p_lat numeric, p_lng numeric, p_radius_km numeric DEFAULT 10.0, p_limit integer DEFAULT 20)
 RETURNS TABLE(errand_id uuid, title text, category text, total_price numeric, pickup_lat numeric, pickup_lng numeric, pickup_address text, distance_km numeric)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$ BEGIN RETURN QUERY SELECT e.id as errand_id, e.title, e.category, e.total_price, e.pickup_lat, e.pickup_lng, e.pickup_address, ROUND((6371 * acos(cos(radians(p_lat)) * cos(radians(e.pickup_lat)) * cos(radians(e.pickup_lng) - radians(p_lng)) + sin(radians(p_lat)) * sin(radians(e.pickup_lat))))::DECIMAL, 2) as distance_km FROM errands e WHERE e.status = 'OPEN' AND e.pickup_lat IS NOT NULL AND e.pickup_lng IS NOT NULL AND (6371 * acos(cos(radians(p_lat)) * cos(radians(e.pickup_lat)) * cos(radians(e.pickup_lng) - radians(p_lng)) + sin(radians(p_lat)) * sin(radians(e.pickup_lat)))) <= p_radius_km ORDER BY distance_km ASC LIMIT p_limit; END; $function$
;

CREATE OR REPLACE FUNCTION public.get_nearby_experts(user_lat numeric, user_lon numeric, category_slug_filter text DEFAULT NULL::text, radius_km integer DEFAULT 10, limit_count integer DEFAULT 20)
 RETURNS TABLE(seller_id uuid, display_name text, profile_image text, distance_km numeric, location_region text, avg_rating numeric, review_count bigint)
 LANGUAGE plpgsql
 STABLE
 SET search_path TO 'public'
AS $function$ BEGIN RETURN QUERY SELECT sel.id as seller_id, sel.display_name, sel.profile_image, calculate_distance(user_lat, user_lon, sel.location_latitude, sel.location_longitude) as distance_km, sel.location_region, COALESCE(AVG(r.rating), 0)::DECIMAL as avg_rating, COUNT(r.id)::BIGINT as review_count FROM sellers sel JOIN services s ON s.seller_id = sel.id AND s.status = 'active' LEFT JOIN service_categories sc ON sc.service_id = s.id LEFT JOIN categories c ON c.id = sc.category_id LEFT JOIN reviews r ON r.seller_id = sel.id WHERE sel.location_latitude IS NOT NULL AND sel.location_longitude IS NOT NULL AND calculate_distance(user_lat, user_lon, sel.location_latitude, sel.location_longitude) <= radius_km AND (category_slug_filter IS NULL OR c.slug = category_slug_filter) GROUP BY sel.id, sel.display_name, sel.profile_image, sel.location_latitude, sel.location_longitude, sel.location_region ORDER BY distance_km ASC LIMIT limit_count; END; $function$
;

CREATE OR REPLACE FUNCTION public.get_nearby_experts_count(user_lat numeric, user_lon numeric, radius_km integer DEFAULT 10)
 RETURNS TABLE(category_id uuid, category_slug text, category_name text, expert_count bigint)
 LANGUAGE plpgsql
 STABLE
 SET search_path TO 'public'
AS $function$ BEGIN RETURN QUERY SELECT c.id, c.slug, c.name, COUNT(DISTINCT sel.id)::BIGINT as expert_count FROM categories c LEFT JOIN services s ON EXISTS (SELECT 1 FROM service_categories sc WHERE sc.service_id = s.id AND sc.category_id = c.id) LEFT JOIN sellers sel ON s.seller_id = sel.id AND sel.location_latitude IS NOT NULL AND sel.location_longitude IS NOT NULL AND calculate_distance(user_lat, user_lon, sel.location_latitude, sel.location_longitude) <= radius_km WHERE c.parent_id IS NULL AND c.service_type IN ('offline', 'both') AND (s.status = 'active' OR s.status IS NULL) GROUP BY c.id, c.slug, c.name ORDER BY expert_count DESC; END; $function$
;

CREATE OR REPLACE FUNCTION public.get_nearby_helpers(p_lat numeric, p_lng numeric, p_radius_km numeric DEFAULT 5.0, p_stale_minutes integer DEFAULT 10, p_limit integer DEFAULT 20)
 RETURNS TABLE(helper_id uuid, user_id uuid, grade text, average_rating numeric, total_completed integer, distance_km numeric)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$ BEGIN RETURN QUERY SELECT hp.id as helper_id, hp.user_id, hp.grade, hp.average_rating, hp.total_completed, ROUND((6371 * acos(cos(radians(p_lat)) * cos(radians(hp.current_lat)) * cos(radians(hp.current_lng) - radians(p_lng)) + sin(radians(p_lat)) * sin(radians(hp.current_lat))))::DECIMAL, 2) as distance_km FROM helper_profiles hp WHERE hp.is_online = true AND hp.is_active = true AND hp.current_lat IS NOT NULL AND hp.current_lng IS NOT NULL AND hp.last_location_at >= NOW() - (p_stale_minutes || ' minutes')::INTERVAL AND (hp.subscription_status = 'active' OR (hp.subscription_status = 'trial' AND hp.subscription_expires_at > NOW())) AND (6371 * acos(cos(radians(p_lat)) * cos(radians(hp.current_lat)) * cos(radians(hp.current_lng) - radians(p_lng)) + sin(radians(p_lat)) * sin(radians(hp.current_lat)))) <= p_radius_km ORDER BY distance_km ASC LIMIT p_limit; END; $function$
;

CREATE OR REPLACE FUNCTION public.get_nearby_helpers_count(p_lat numeric, p_lng numeric, p_radius_km numeric DEFAULT 5.0, p_stale_minutes integer DEFAULT 10)
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$ DECLARE helper_count INTEGER; BEGIN SELECT COUNT(*) INTO helper_count FROM helper_profiles hp WHERE hp.is_online = true AND hp.is_active = true AND hp.current_lat IS NOT NULL AND hp.current_lng IS NOT NULL AND hp.last_location_at >= NOW() - (p_stale_minutes || ' minutes')::INTERVAL AND (hp.subscription_status = 'active' OR (hp.subscription_status = 'trial' AND hp.subscription_expires_at > NOW())) AND (6371 * acos(cos(radians(p_lat)) * cos(radians(hp.current_lat)) * cos(radians(hp.current_lng) - radians(p_lng)) + sin(radians(p_lat)) * sin(radians(hp.current_lat)))) <= p_radius_km; RETURN helper_count; END; $function$
;

CREATE OR REPLACE FUNCTION public.get_nearby_services(user_lat numeric, user_lon numeric, category_slug_filter text DEFAULT NULL::text, radius_km integer DEFAULT 10, limit_count integer DEFAULT 20)
 RETURNS TABLE(service_id uuid, service_title character varying, service_description text, service_price numeric, thumbnail_url text, category_slug character varying, category_name character varying, seller_id uuid, seller_nickname character varying, seller_profile_image text, seller_rating numeric, seller_review_count integer, location_address character varying, location_region character varying, distance_km numeric, delivery_method character varying)
 LANGUAGE plpgsql
 STABLE
 SET search_path TO 'public'
AS $function$
BEGIN
  RETURN QUERY
  SELECT
    s.id AS service_id,
    s.title AS service_title,
    s.description AS service_description,
    s.price AS service_price,
    s.thumbnail_url,
    c.slug AS category_slug,
    c.name AS category_name,
    sel.id AS seller_id,
    sel.nickname AS seller_nickname,
    sel.profile_image_url AS seller_profile_image,
    sel.rating AS seller_rating,
    sel.review_count AS seller_review_count,
    s.location_address,
    s.location_region,
    calculate_distance(user_lat, user_lon, s.location_latitude, s.location_longitude) AS distance_km,
    s.delivery_method
  FROM services s
  JOIN sellers sel ON s.seller_id = sel.id
  LEFT JOIN categories c ON s.category_id = c.id
  WHERE
    s.status = 'active'
    AND s.location_latitude IS NOT NULL
    AND s.location_longitude IS NOT NULL
    AND (s.delivery_method = 'offline' OR s.delivery_method = 'both')
    AND calculate_distance(user_lat, user_lon, s.location_latitude, s.location_longitude) <= radius_km
    AND (category_slug_filter IS NULL OR c.slug = category_slug_filter)
  ORDER BY distance_km ASC
  LIMIT limit_count;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.get_random_ai_services(p_limit integer DEFAULT 10)
 RETURNS TABLE(id uuid, title text, description text, seller_id uuid, category_id uuid, price_basic integer, delivery_days_basic integer, thumbnail_url text, view_count integer, wishlist_count integer, created_at timestamp with time zone)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  RETURN QUERY
  SELECT
    s.id,
    s.title,
    s.description,
    s.seller_id,
    s.category_id,
    s.price_basic,
    s.delivery_days_basic,
    s.thumbnail_url,
    s.view_count,
    s.wishlist_count,
    s.created_at
  FROM services s
  JOIN categories c ON c.id = s.category_id
  WHERE c.is_ai = TRUE
    AND s.status = 'active'
  ORDER BY RANDOM()
  LIMIT p_limit;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.get_recent_category_visits(p_user_id uuid, p_days integer DEFAULT 30, p_limit integer DEFAULT 10)
 RETURNS TABLE(category_id uuid, category_name text, category_slug text, visit_count bigint)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$ BEGIN RETURN QUERY SELECT cv.category_id, cv.category_name, cv.category_slug, COUNT(*)::BIGINT as visit_count FROM public.category_visits cv WHERE cv.user_id = p_user_id AND cv.visited_at >= NOW() - (p_days || ' days')::INTERVAL GROUP BY cv.category_id, cv.category_name, cv.category_slug ORDER BY MAX(cv.visited_at) DESC LIMIT p_limit; END; $function$
;

CREATE OR REPLACE FUNCTION public.get_seller_id(user_uuid uuid)
 RETURNS uuid
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  seller_uuid UUID;
BEGIN
  SELECT id INTO seller_uuid
  FROM sellers
  WHERE user_id = user_uuid
  LIMIT 1;

  RETURN seller_uuid;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.get_unread_room_count(p_user_id uuid)
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  unread_count INTEGER;
BEGIN
  SELECT COUNT(DISTINCT cm.room_id)
  INTO unread_count
  FROM chat_messages cm
  INNER JOIN chat_rooms cr ON cm.room_id = cr.id
  WHERE (cr.user1_id = p_user_id OR cr.user2_id = p_user_id)
    AND cm.is_read = false
    AND cm.sender_id != p_user_id;

  RETURN COALESCE(unread_count, 0);
END;
$function$
;

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
BEGIN
  -- users 테이블에 프로필 생성
  INSERT INTO public.users (id, email, name, profile_image)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', '익명'),
    COALESCE(NEW.raw_user_meta_data->>'profile_image', '')
  );

  -- buyers 테이블에 자동 생성 (모든 회원은 기본 구매자)
  INSERT INTO public.buyers (user_id)
  VALUES (NEW.id);

  RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.handle_user_profile_sync()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'auth'
AS $function$
BEGIN
  -- On INSERT: Create profile from user_metadata
  IF (TG_OP = 'INSERT') THEN
    INSERT INTO public.profiles (user_id, name, profile_image)
    VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data->>'name', 'Anonymous'),
      NEW.raw_user_meta_data->>'profile_image'
    )
    ON CONFLICT (user_id) DO NOTHING;

    RETURN NEW;
  END IF;

  -- On UPDATE: Sync metadata changes to profiles
  IF (TG_OP = 'UPDATE') THEN
    -- Check if raw_user_meta_data has changed
    IF (NEW.raw_user_meta_data IS DISTINCT FROM OLD.raw_user_meta_data) THEN
      UPDATE public.profiles
      SET
        name = COALESCE(NEW.raw_user_meta_data->>'name', name),
        profile_image = COALESCE(NEW.raw_user_meta_data->>'profile_image', profile_image),
        updated_at = now()
      WHERE user_id = NEW.id;
    END IF;

    RETURN NEW;
  END IF;

  RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.increment_notice_view_count(notice_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  UPDATE notices
  SET view_count = view_count + 1
  WHERE id = notice_id AND is_published = TRUE;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.increment_service_view_count()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
BEGIN
    UPDATE public.services
    SET view_count = COALESCE(view_count, 0) + 1
    WHERE id = NEW.service_id;

    RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.is_admin()
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
DECLARE
  is_admin_user boolean;
BEGIN
  -- admins 테이블에서 현재 사용자 확인
  SELECT EXISTS (
    SELECT 1
    FROM public.admins
    WHERE user_id = auth.uid()
  ) INTO is_admin_user;

  RETURN is_admin_user;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.is_buyer()
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
BEGIN
    -- Check if current user exists in buyers table and is active
    RETURN EXISTS (
        SELECT 1 FROM public.buyers
        WHERE user_id = auth.uid()
        AND is_active = true
    );
END;
$function$
;

CREATE OR REPLACE FUNCTION public.is_buyer(check_user_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.buyers
        WHERE user_id = check_user_id
    );
END;
$function$
;

CREATE OR REPLACE FUNCTION public.is_seller(check_user_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.sellers
        WHERE user_id = check_user_id
    );
END;
$function$
;

CREATE OR REPLACE FUNCTION public.is_seller()
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
BEGIN
    -- Check if current user exists in sellers table and is active
    RETURN EXISTS (
        SELECT 1 FROM public.sellers
        WHERE user_id = auth.uid()
        AND is_active = true
    );
END;
$function$
;

CREATE OR REPLACE FUNCTION public.is_verified_seller(check_user_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.sellers
        WHERE user_id = check_user_id
        AND is_verified = true
    );
END;
$function$
;

CREATE OR REPLACE FUNCTION public.mark_errand_messages_as_read(p_errand_id uuid, p_user_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$ DECLARE v_profile_id UUID; BEGIN SELECT id INTO v_profile_id FROM profiles WHERE user_id = p_user_id; IF v_profile_id IS NULL THEN RETURN; END IF; UPDATE errand_chat_messages SET is_read = TRUE WHERE errand_id = p_errand_id AND sender_id != v_profile_id AND is_read = FALSE; END; $function$
;

CREATE OR REPLACE FUNCTION public.mark_room_messages_as_read(p_room_id uuid, p_user_id uuid)
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  updated_count INTEGER;
BEGIN
  UPDATE chat_messages
  SET is_read = true,
      updated_at = NOW()
  WHERE room_id = p_room_id
    AND is_read = false
    AND sender_id != p_user_id;

  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RETURN updated_count;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.notify_new_order()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
DECLARE
  v_seller_name text;
  v_buyer_name text;
BEGIN
  -- 판매자, 구매자 이름 조회
  SELECT name INTO v_seller_name FROM users WHERE id = NEW.seller_id;
  SELECT name INTO v_buyer_name FROM users WHERE id = NEW.buyer_id;

  -- 판매자에게 알림
  PERFORM create_notification(
    NEW.seller_id,
    'order_new',
    '새로운 주문이 도착했습니다',
    v_buyer_name || '님이 "' || NEW.title || '"를 주문했습니다.',
    '/mypage/seller/orders/' || NEW.id,
    NEW.id,
    NEW.buyer_id,
    jsonb_build_object('amount', NEW.total_amount)
  );

  RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.notify_order_status_change()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
DECLARE
  v_buyer_id uuid;
  v_seller_id uuid;
  v_buyer_name text;
  v_seller_name text;
  v_service_title text;
  v_notification_type text;
  v_notification_title text;
  v_notification_message text;
  v_recipient_id uuid;
BEGIN
  -- 주문 정보 조회
  SELECT
    o.buyer_id,
    o.seller_id,
    o.title,
    buyer.name,
    seller.name
  INTO
    v_buyer_id,
    v_seller_id,
    v_service_title,
    v_buyer_name,
    v_seller_name
  FROM orders o
  LEFT JOIN users buyer ON buyer.id = o.buyer_id
  LEFT JOIN users seller ON seller.id = o.seller_id
  WHERE o.id = NEW.id;

  -- 상태 변경에 따른 알림 생성
  IF OLD.status IS DISTINCT FROM NEW.status THEN

    -- 결제 완료 → 진행중 (판매자가 작업 시작)
    IF OLD.status = 'paid' AND NEW.status = 'in_progress' THEN
      v_notification_type := 'order_started';
      v_notification_title := '작업이 시작되었습니다';
      v_notification_message := v_seller_name || '님이 "' || v_service_title || '" 작업을 시작했습니다.';
      v_recipient_id := v_buyer_id;

    -- 진행중 → 완료 대기 (판매자가 작업 완료)
    ELSIF OLD.status = 'in_progress' AND NEW.status = 'delivered' THEN
      v_notification_type := 'order_delivered';
      v_notification_title := '작업이 완료되었습니다';
      v_notification_message := v_seller_name || '님이 "' || v_service_title || '" 작업을 완료했습니다. 확인해주세요.';
      v_recipient_id := v_buyer_id;

    -- 완료 대기 → 완료 (구매자가 구매 확정)
    ELSIF OLD.status = 'delivered' AND NEW.status = 'completed' THEN
      v_notification_type := 'order_completed';
      v_notification_title := '구매가 확정되었습니다';
      v_notification_message := v_buyer_name || '님이 "' || v_service_title || '" 구매를 확정했습니다.';
      v_recipient_id := v_seller_id;

    -- 완료 대기 → 수정 요청 (구매자가 수정 요청)
    ELSIF OLD.status = 'delivered' AND NEW.status = 'revision' THEN
      v_notification_type := 'order_revision_requested';
      v_notification_title := '수정 요청이 도착했습니다';
      v_notification_message := v_buyer_name || '님이 "' || v_service_title || '"에 대해 수정을 요청했습니다.';
      v_recipient_id := v_seller_id;

    -- 수정 요청 → 완료 대기 (판매자가 수정 완료)
    ELSIF OLD.status = 'revision' AND NEW.status = 'delivered' THEN
      v_notification_type := 'order_revision_completed';
      v_notification_title := '수정이 완료되었습니다';
      v_notification_message := v_seller_name || '님이 "' || v_service_title || '" 수정을 완료했습니다. 확인해주세요.';
      v_recipient_id := v_buyer_id;

    -- 취소
    ELSIF NEW.status = 'cancelled' THEN
      v_notification_type := 'order_cancelled';
      v_notification_title := '주문이 취소되었습니다';
      v_notification_message := '"' || v_service_title || '" 주문이 취소되었습니다.';
      -- 취소한 사람의 반대편에게 알림
      v_recipient_id := CASE
        WHEN auth.uid() = v_buyer_id THEN v_seller_id
        ELSE v_buyer_id
      END;

    END IF;

    -- 알림 생성
    IF v_recipient_id IS NOT NULL AND v_notification_type IS NOT NULL THEN
      PERFORM create_notification(
        v_recipient_id,
        v_notification_type,
        v_notification_title,
        v_notification_message,
        '/mypage/' || CASE WHEN v_recipient_id = v_buyer_id THEN 'buyer' ELSE 'seller' END || '/orders/' || NEW.id,
        NEW.id,
        CASE WHEN v_recipient_id = v_buyer_id THEN v_seller_id ELSE v_buyer_id END,
        jsonb_build_object('old_status', OLD.status, 'new_status', NEW.status)
      );
    END IF;
  END IF;

  RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.owns_service(service_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.services
        WHERE id = service_id
        AND seller_id = auth.uid()
    );
END;
$function$
;

CREATE OR REPLACE FUNCTION public.set_visited_date(p_category_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO category_visits (user_id, category_id, visited_at)
  VALUES (auth.uid(), p_category_id, NOW())
  ON CONFLICT (user_id, category_id)
  DO UPDATE SET visited_at = NOW();
END;
$function$
;

CREATE OR REPLACE FUNCTION public.update_chat_room_last_message()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  UPDATE chat_rooms
  SET
    last_message_at = NEW.created_at,
    updated_at = NOW()
  WHERE id = NEW.room_id;

  RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.update_coupon_issued_quantity()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$
BEGIN
    UPDATE public.coupons
    SET issued_quantity = issued_quantity + 1
    WHERE id = NEW.coupon_id;
    RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.update_errand_chat_messages_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$ BEGIN NEW.updated_at = NOW(); RETURN NEW; END; $function$
;

CREATE OR REPLACE FUNCTION public.update_food_store_rating()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$ BEGIN UPDATE food_stores SET rating = (SELECT COALESCE(AVG(rating), 0) FROM food_reviews WHERE store_id = NEW.store_id), review_count = (SELECT COUNT(*) FROM food_reviews WHERE store_id = NEW.store_id), updated_at = NOW() WHERE id = NEW.store_id; RETURN NEW; END; $function$
;

CREATE OR REPLACE FUNCTION public.update_notices_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.update_quote_response_count()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE public.quotes
        SET response_count = response_count + 1
        WHERE id = NEW.quote_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE public.quotes
        SET response_count = GREATEST(response_count - 1, 0)
        WHERE id = OLD.quote_id;
    END IF;
    RETURN COALESCE(NEW, OLD);
END;
$function$
;

CREATE OR REPLACE FUNCTION public.update_service_orders_count()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$ BEGIN IF TG_OP = 'INSERT' THEN UPDATE services SET orders_count = orders_count + 1 WHERE id = NEW.service_id; RETURN NEW; END IF; RETURN NULL; END; $function$
;

CREATE OR REPLACE FUNCTION public.update_service_views_count()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$ BEGIN UPDATE services SET views = views + 1 WHERE id = NEW.service_id; RETURN NEW; END; $function$
;

CREATE OR REPLACE FUNCTION public.update_service_wishlist_count()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$ BEGIN IF TG_OP = 'INSERT' THEN UPDATE services SET wishlist_count = wishlist_count + 1 WHERE id = NEW.service_id; RETURN NEW; ELSIF TG_OP = 'DELETE' THEN UPDATE services SET wishlist_count = GREATEST(wishlist_count - 1, 0) WHERE id = OLD.service_id; RETURN OLD; END IF; RETURN NULL; END; $function$
;

CREATE OR REPLACE FUNCTION public.update_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.update_user_profile(p_name text, p_profile_image text DEFAULT NULL::text)
 RETURNS TABLE(id uuid, email text, name text, profile_image text, role text, created_at timestamp with time zone, updated_at timestamp with time zone)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Only allow users to update their own profile
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  -- Validate input
  IF p_name IS NULL OR trim(p_name) = '' THEN
    RAISE EXCEPTION 'Name is required';
  END IF;

  -- Update and return the user profile
  RETURN QUERY
  UPDATE users
  SET
    name = p_name,
    profile_image = p_profile_image,
    updated_at = now()
  WHERE id = auth.uid()
  RETURNING
    users.id,
    users.email,
    users.name,
    users.profile_image,
    users.role,
    users.created_at,
    users.updated_at;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.update_users_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$function$
;


-- ============================================
-- Triggers
-- ============================================

CREATE TRIGGER update_campaigns_updated_at BEFORE UPDATE ON advertising_campaigns FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_advertising_credits_updated_at BEFORE UPDATE ON advertising_credits FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_advertising_payments_updated_at BEFORE UPDATE ON advertising_payments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_advertising_subscriptions_updated_at BEFORE UPDATE ON advertising_subscriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_buyers_updated_at BEFORE UPDATE ON buyers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trigger_update_chat_room_last_message AFTER INSERT ON chat_messages FOR EACH ROW EXECUTE FUNCTION update_chat_room_last_message();
CREATE TRIGGER update_chat_room_last_message_trigger AFTER INSERT ON chat_messages FOR EACH ROW EXECUTE FUNCTION update_chat_room_last_message();
CREATE TRIGGER update_conversations_updated_at BEFORE UPDATE ON conversations FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_disputes_updated_at BEFORE UPDATE ON disputes FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trigger_update_errand_chat_messages_updated_at BEFORE UPDATE ON errand_chat_messages FOR EACH ROW EXECUTE FUNCTION update_errand_chat_messages_updated_at();
CREATE TRIGGER trigger_generate_food_order_number BEFORE INSERT ON food_orders FOR EACH ROW EXECUTE FUNCTION generate_food_order_number();
CREATE TRIGGER trigger_update_food_store_rating AFTER INSERT ON food_reviews FOR EACH ROW EXECUTE FUNCTION update_food_store_rating();
CREATE TRIGGER trigger_notices_updated_at BEFORE UPDATE ON notices FOR EACH ROW EXECUTE FUNCTION update_notices_updated_at();
CREATE TRIGGER generate_order_number_trigger BEFORE INSERT ON orders FOR EACH ROW EXECUTE FUNCTION generate_order_number();
CREATE TRIGGER trigger_notify_new_order AFTER INSERT ON orders FOR EACH ROW EXECUTE FUNCTION notify_new_order();
CREATE TRIGGER trigger_notify_order_status_change AFTER UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION notify_order_status_change();
CREATE TRIGGER trigger_orders_insert AFTER INSERT ON orders FOR EACH ROW EXECUTE FUNCTION update_service_orders_count();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_portfolio_items_updated_at BEFORE UPDATE ON portfolio_items FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_premium_updated_at BEFORE UPDATE ON premium_placements FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_quote_response_count_on_change AFTER INSERT ON quote_responses FOR EACH ROW EXECUTE FUNCTION update_quote_response_count();
CREATE TRIGGER update_quote_responses_updated_at BEFORE UPDATE ON quote_responses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_quotes_updated_at BEFORE UPDATE ON quotes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_reports_updated_at BEFORE UPDATE ON reports FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON reviews FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_seller_earnings_updated_at BEFORE UPDATE ON seller_earnings FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_sellers_updated_at BEFORE UPDATE ON sellers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trigger_service_favorites_delete AFTER DELETE ON service_favorites FOR EACH ROW EXECUTE FUNCTION update_service_wishlist_count();
CREATE TRIGGER trigger_service_favorites_insert AFTER INSERT ON service_favorites FOR EACH ROW EXECUTE FUNCTION update_service_wishlist_count();
CREATE TRIGGER trigger_increment_view_count AFTER INSERT ON service_view_logs FOR EACH ROW EXECUTE FUNCTION increment_service_view_count();
CREATE TRIGGER trigger_service_views_insert AFTER INSERT ON service_views FOR EACH ROW EXECUTE FUNCTION update_service_views_count();
CREATE TRIGGER generate_service_slug_trigger BEFORE INSERT ON services FOR EACH ROW EXECUTE FUNCTION generate_service_slug();
CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON services FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_settlements_updated_at BEFORE UPDATE ON settlements FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_user_wallets_updated_at BEFORE UPDATE ON user_wallets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER create_wallet_on_user_creation AFTER INSERT ON users FOR EACH ROW EXECUTE FUNCTION create_user_wallet();
CREATE TRIGGER trigger_create_seller_earnings AFTER INSERT ON users FOR EACH ROW EXECUTE FUNCTION create_seller_earnings();
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_users_updated_at();
CREATE TRIGGER update_withdrawal_requests_updated_at BEFORE UPDATE ON withdrawal_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- Enable Row Level Security
-- ============================================

ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE advertising_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE advertising_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE advertising_impressions ENABLE ROW LEVEL SECURITY;
ALTER TABLE advertising_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE advertising_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE buyers ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE category_visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE disputes ENABLE ROW LEVEL SECURITY;
ALTER TABLE earnings_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE errand_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE errand_chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE errand_disputes ENABLE ROW LEVEL SECURITY;
ALTER TABLE errand_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE errand_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE errand_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE errand_settlements ENABLE ROW LEVEL SECURITY;
ALTER TABLE errand_stops ENABLE ROW LEVEL SECURITY;
ALTER TABLE errands ENABLE ROW LEVEL SECURITY;
ALTER TABLE food_carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE food_menu_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE food_menu_option_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE food_menu_option_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE food_menus ENABLE ROW LEVEL SECURITY;
ALTER TABLE food_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE food_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE food_store_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE food_stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE helper_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE helper_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE helper_withdrawals ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE notices ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_settlements ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE premium_placements ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE quote_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE refunds ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE revision_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE schema_migrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE search_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE seller_earnings ENABLE ROW LEVEL SECURITY;
ALTER TABLE seller_portfolio ENABLE ROW LEVEL SECURITY;
ALTER TABLE sellers ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_revision_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_revisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_view_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE settlement_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE settlements ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE tax_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE visitor_stats_daily ENABLE ROW LEVEL SECURITY;
ALTER TABLE visitor_stats_hourly ENABLE ROW LEVEL SECURITY;
ALTER TABLE visitor_stats_monthly ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallet_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE withdrawal_requests ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS Policies
-- ============================================

CREATE POLICY "System can insert activity logs" ON activity_logs FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Users and admins view activity logs" ON activity_logs FOR SELECT TO public USING (((( SELECT auth.uid() AS uid) = user_id) OR (( SELECT auth.uid() AS uid) = admin_id) OR (EXISTS ( SELECT 1
   FROM admins
  WHERE (admins.user_id = ( SELECT auth.uid() AS uid))))));
CREATE POLICY admins_insert_own ON admins FOR INSERT TO public WITH CHECK ((user_id = ( SELECT auth.uid() AS uid)));
CREATE POLICY admins_select_own ON admins FOR SELECT TO public USING ((user_id = ( SELECT auth.uid() AS uid)));
CREATE POLICY admins_update_policy ON admins FOR UPDATE TO public USING ((user_id = ( SELECT auth.uid() AS uid)));
CREATE POLICY "Sellers manage own campaigns" ON advertising_campaigns FOR ALL TO public USING (((( SELECT auth.uid() AS uid) = seller_id) OR is_admin())) WITH CHECK (((( SELECT auth.uid() AS uid) = seller_id) OR is_admin()));
CREATE POLICY sellers_select_own_credits ON advertising_credits FOR SELECT TO public USING ((seller_id IN ( SELECT sellers.id
   FROM sellers
  WHERE (sellers.user_id = ( SELECT auth.uid() AS uid)))));
CREATE POLICY "모든 사용자는 노출 기록 조회 가능" ON advertising_impressions FOR SELECT TO public USING (true);
CREATE POLICY sellers_select_own_payments ON advertising_payments FOR SELECT TO public USING ((seller_id IN ( SELECT sellers.id
   FROM sellers
  WHERE (sellers.user_id = ( SELECT auth.uid() AS uid)))));
CREATE POLICY sellers_select_own_subscriptions ON advertising_subscriptions FOR SELECT TO public USING ((seller_id IN ( SELECT sellers.id
   FROM sellers
  WHERE (sellers.user_id = ( SELECT auth.uid() AS uid)))));
CREATE POLICY buyers_insert_own ON buyers FOR INSERT TO public WITH CHECK ((user_id = ( SELECT auth.uid() AS uid)));
CREATE POLICY buyers_select_policy ON buyers FOR SELECT TO public USING (((user_id = ( SELECT auth.uid() AS uid)) OR is_admin()));
CREATE POLICY buyers_update_policy ON buyers FOR UPDATE TO public USING (((user_id = ( SELECT auth.uid() AS uid)) OR is_admin()));
CREATE POLICY "Admins manage category deletion" ON categories FOR DELETE TO public USING ((EXISTS ( SELECT 1
   FROM admins
  WHERE (admins.user_id = ( SELECT auth.uid() AS uid)))));
CREATE POLICY "Admins manage category insertion" ON categories FOR INSERT TO public WITH CHECK ((EXISTS ( SELECT 1
   FROM admins
  WHERE (admins.user_id = ( SELECT auth.uid() AS uid)))));
CREATE POLICY "Admins manage category updates" ON categories FOR UPDATE TO public USING ((EXISTS ( SELECT 1
   FROM admins
  WHERE (admins.user_id = ( SELECT auth.uid() AS uid)))));
CREATE POLICY "Everyone can view categories" ON categories FOR SELECT TO public USING (true);
CREATE POLICY "Users can insert own visits" ON category_visits FOR INSERT TO public WITH CHECK ((user_id = ( SELECT auth.uid() AS uid)));
CREATE POLICY "Users can update own visits" ON category_visits FOR UPDATE TO public USING ((user_id = ( SELECT auth.uid() AS uid))) WITH CHECK ((user_id = ( SELECT auth.uid() AS uid)));
CREATE POLICY "Users can view own visits" ON category_visits FOR SELECT TO public USING ((user_id = ( SELECT auth.uid() AS uid)));
CREATE POLICY "Users can delete their own favorites" ON chat_favorites FOR DELETE TO public USING ((user_id = ( SELECT auth.uid() AS uid)));
CREATE POLICY "Users can insert their own favorites" ON chat_favorites FOR INSERT TO public WITH CHECK ((user_id = ( SELECT auth.uid() AS uid)));
CREATE POLICY "Users can view their own favorites" ON chat_favorites FOR SELECT TO public USING ((user_id = ( SELECT auth.uid() AS uid)));
CREATE POLICY "Users can delete their own messages" ON chat_messages FOR DELETE TO public USING (((sender_id = ( SELECT auth.uid() AS uid)) AND (EXISTS ( SELECT 1
   FROM chat_rooms
  WHERE ((chat_rooms.id = chat_messages.room_id) AND ((chat_rooms.user1_id = ( SELECT auth.uid() AS uid)) OR (chat_rooms.user2_id = ( SELECT auth.uid() AS uid))))))));
CREATE POLICY "Users can send messages to their chat rooms" ON chat_messages FOR INSERT TO public WITH CHECK (((sender_id = ( SELECT auth.uid() AS uid)) AND (EXISTS ( SELECT 1
   FROM chat_rooms
  WHERE ((chat_rooms.id = chat_messages.room_id) AND ((chat_rooms.user1_id = ( SELECT auth.uid() AS uid)) OR (chat_rooms.user2_id = ( SELECT auth.uid() AS uid))))))));
CREATE POLICY "Users can update messages in their rooms" ON chat_messages FOR UPDATE TO public USING (((EXISTS ( SELECT 1
   FROM chat_rooms
  WHERE ((chat_rooms.id = chat_messages.room_id) AND ((chat_rooms.user1_id = ( SELECT auth.uid() AS uid)) OR (chat_rooms.user2_id = ( SELECT auth.uid() AS uid)))))) AND ((sender_id = ( SELECT auth.uid() AS uid)) OR ((sender_id <> ( SELECT auth.uid() AS uid)) AND (is_read IS DISTINCT FROM true))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM chat_rooms
  WHERE ((chat_rooms.id = chat_messages.room_id) AND ((chat_rooms.user1_id = ( SELECT auth.uid() AS uid)) OR (chat_rooms.user2_id = ( SELECT auth.uid() AS uid)))))));
CREATE POLICY "Users can view messages in their chat rooms" ON chat_messages FOR SELECT TO public USING ((EXISTS ( SELECT 1
   FROM chat_rooms
  WHERE ((chat_rooms.id = chat_messages.room_id) AND ((chat_rooms.user1_id = ( SELECT auth.uid() AS uid)) OR (chat_rooms.user2_id = ( SELECT auth.uid() AS uid)))))));
CREATE POLICY "Users can create chat rooms" ON chat_rooms FOR INSERT TO public WITH CHECK (((user1_id = ( SELECT auth.uid() AS uid)) OR (user2_id = ( SELECT auth.uid() AS uid))));
CREATE POLICY "Users can update their chat rooms" ON chat_rooms FOR UPDATE TO public USING (((user1_id = ( SELECT auth.uid() AS uid)) OR (user2_id = ( SELECT auth.uid() AS uid))));
CREATE POLICY "Users can view their own chat rooms" ON chat_rooms FOR SELECT TO public USING (((user1_id = ( SELECT auth.uid() AS uid)) OR (user2_id = ( SELECT auth.uid() AS uid))));
CREATE POLICY "Allow admins to delete company info" ON company_info FOR DELETE TO public USING ((EXISTS ( SELECT 1
   FROM admins
  WHERE ((admins.user_id = ( SELECT auth.uid() AS uid)) AND (admins.role = 'super_admin'::text)))));
CREATE POLICY "Allow admins to insert company info" ON company_info FOR INSERT TO public WITH CHECK ((EXISTS ( SELECT 1
   FROM admins
  WHERE ((admins.user_id = ( SELECT auth.uid() AS uid)) AND (admins.role = 'super_admin'::text)))));
CREATE POLICY "Allow admins to update company info" ON company_info FOR UPDATE TO public USING ((EXISTS ( SELECT 1
   FROM admins
  WHERE ((admins.user_id = ( SELECT auth.uid() AS uid)) AND (admins.role = 'super_admin'::text)))));
CREATE POLICY "Allow public read access to company info" ON company_info FOR SELECT TO public USING (true);
CREATE POLICY "Users create conversations" ON conversations FOR INSERT TO public WITH CHECK (((( SELECT auth.uid() AS uid) = participant1_id) OR (( SELECT auth.uid() AS uid) = participant2_id)));
CREATE POLICY sellers_select_own_transactions ON credit_transactions FOR SELECT TO public USING ((seller_id IN ( SELECT sellers.id
   FROM sellers
  WHERE (sellers.user_id = ( SELECT auth.uid() AS uid)))));
CREATE POLICY "분쟁 조회 권한" ON disputes FOR SELECT TO public USING (((initiated_by = ( SELECT auth.uid() AS uid)) OR (EXISTS ( SELECT 1
   FROM orders
  WHERE ((orders.id = disputes.order_id) AND ((orders.buyer_id = ( SELECT auth.uid() AS uid)) OR (orders.seller_id = ( SELECT auth.uid() AS uid)))))) OR (EXISTS ( SELECT 1
   FROM admins
  WHERE (admins.user_id = ( SELECT auth.uid() AS uid))))));
CREATE POLICY "사용자는 자신의 주문에 대해 분쟁 생성 가능" ON disputes FOR INSERT TO public WITH CHECK (((initiated_by = ( SELECT auth.uid() AS uid)) AND (EXISTS ( SELECT 1
   FROM orders
  WHERE ((orders.id = disputes.order_id) AND ((orders.buyer_id = ( SELECT auth.uid() AS uid)) OR (orders.seller_id = ( SELECT auth.uid() AS uid))))))));
CREATE POLICY "중재자는 분쟁 업데이트 가능" ON disputes FOR UPDATE TO public USING ((EXISTS ( SELECT 1
   FROM admins
  WHERE (admins.user_id = ( SELECT auth.uid() AS uid))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM admins
  WHERE (admins.user_id = ( SELECT auth.uid() AS uid)))));
CREATE POLICY "Sellers view own earnings transactions" ON earnings_transactions FOR SELECT TO public USING (((( SELECT auth.uid() AS uid) = seller_id) OR (EXISTS ( SELECT 1
   FROM admins
  WHERE (admins.user_id = ( SELECT auth.uid() AS uid))))));
CREATE POLICY errand_applications_delete_policy ON errand_applications FOR DELETE TO public USING ((( SELECT auth.uid() AS uid) = ( SELECT helper_profiles.user_id
   FROM helper_profiles
  WHERE (helper_profiles.id = errand_applications.helper_id))));
CREATE POLICY errand_applications_insert_policy ON errand_applications FOR INSERT TO public WITH CHECK ((( SELECT auth.uid() AS uid) = ( SELECT helper_profiles.user_id
   FROM helper_profiles
  WHERE (helper_profiles.id = errand_applications.helper_id))));
CREATE POLICY errand_applications_select_policy ON errand_applications FOR SELECT TO public USING (true);
CREATE POLICY errand_applications_update_policy ON errand_applications FOR UPDATE TO public USING (((( SELECT auth.uid() AS uid) = ( SELECT helper_profiles.user_id
   FROM helper_profiles
  WHERE (helper_profiles.id = errand_applications.helper_id))) OR (( SELECT auth.uid() AS uid) = ( SELECT p.user_id
   FROM (errands e
     JOIN profiles p ON ((e.requester_id = p.id)))
  WHERE (e.id = errand_applications.errand_id)))));
CREATE POLICY errand_chat_messages_insert_policy ON errand_chat_messages FOR INSERT TO public WITH CHECK ((EXISTS ( SELECT 1
   FROM (errands e
     JOIN profiles p ON ((p.user_id = ( SELECT auth.uid() AS uid))))
  WHERE ((e.id = errand_chat_messages.errand_id) AND ((e.requester_id = p.id) OR (e.helper_id = p.id)) AND (errand_chat_messages.sender_id = p.id)))));
CREATE POLICY errand_chat_messages_select_policy ON errand_chat_messages FOR SELECT TO public USING ((EXISTS ( SELECT 1
   FROM (errands e
     JOIN profiles p ON ((p.user_id = ( SELECT auth.uid() AS uid))))
  WHERE ((e.id = errand_chat_messages.errand_id) AND ((e.requester_id = p.id) OR (e.helper_id = p.id))))));
CREATE POLICY errand_chat_messages_service_role_policy ON errand_chat_messages FOR ALL TO public USING (true) WITH CHECK (true);
CREATE POLICY errand_chat_messages_update_policy ON errand_chat_messages FOR UPDATE TO public USING ((EXISTS ( SELECT 1
   FROM profiles p
  WHERE ((p.user_id = ( SELECT auth.uid() AS uid)) AND (errand_chat_messages.sender_id = p.id)))));
CREATE POLICY errand_disputes_insert_policy ON errand_disputes FOR INSERT TO public WITH CHECK ((( SELECT auth.uid() AS uid) = reporter_id));
CREATE POLICY errand_disputes_select_policy ON errand_disputes FOR SELECT TO public USING (((( SELECT auth.uid() AS uid) = reporter_id) OR (( SELECT auth.uid() AS uid) = reported_id)));
CREATE POLICY errand_locations_insert_policy ON errand_locations FOR INSERT TO public WITH CHECK ((( SELECT auth.uid() AS uid) = helper_id));
CREATE POLICY errand_locations_select_policy ON errand_locations FOR SELECT TO public USING ((EXISTS ( SELECT 1
   FROM errands
  WHERE ((errands.id = errand_locations.errand_id) AND ((errands.requester_id IN ( SELECT profiles.id
           FROM profiles
          WHERE (profiles.user_id = ( SELECT auth.uid() AS uid)))) OR (errands.helper_id = ( SELECT auth.uid() AS uid)))))));
CREATE POLICY errand_messages_insert_policy ON errand_messages FOR INSERT TO public WITH CHECK (((( SELECT auth.uid() AS uid) = sender_id) AND (EXISTS ( SELECT 1
   FROM errands
  WHERE ((errands.id = errand_messages.errand_id) AND ((errands.requester_id IN ( SELECT profiles.id
           FROM profiles
          WHERE (profiles.user_id = ( SELECT auth.uid() AS uid)))) OR (errands.helper_id = ( SELECT auth.uid() AS uid))))))));
CREATE POLICY errand_messages_select_policy ON errand_messages FOR SELECT TO public USING ((EXISTS ( SELECT 1
   FROM errands
  WHERE ((errands.id = errand_messages.errand_id) AND ((errands.requester_id IN ( SELECT profiles.id
           FROM profiles
          WHERE (profiles.user_id = ( SELECT auth.uid() AS uid)))) OR (errands.helper_id = ( SELECT auth.uid() AS uid)))))));
CREATE POLICY errand_reviews_insert_policy ON errand_reviews FOR INSERT TO public WITH CHECK ((( SELECT auth.uid() AS uid) = reviewer_id));
CREATE POLICY errand_reviews_select_policy ON errand_reviews FOR SELECT TO public USING (true);
CREATE POLICY errand_settlements_select_policy ON errand_settlements FOR SELECT TO public USING ((EXISTS ( SELECT 1
   FROM helper_profiles
  WHERE ((helper_profiles.id = errand_settlements.helper_id) AND (helper_profiles.user_id = ( SELECT auth.uid() AS uid))))));
CREATE POLICY errand_stops_delete_policy ON errand_stops FOR DELETE TO public USING ((( SELECT auth.uid() AS uid) = ( SELECT p.user_id
   FROM (errands e
     JOIN profiles p ON ((e.requester_id = p.id)))
  WHERE (e.id = errand_stops.errand_id))));
CREATE POLICY errand_stops_insert_policy ON errand_stops FOR INSERT TO public WITH CHECK ((( SELECT auth.uid() AS uid) = ( SELECT p.user_id
   FROM (errands e
     JOIN profiles p ON ((e.requester_id = p.id)))
  WHERE (e.id = errand_stops.errand_id))));
CREATE POLICY errand_stops_select_policy ON errand_stops FOR SELECT TO public USING (true);
CREATE POLICY errand_stops_update_policy ON errand_stops FOR UPDATE TO public USING ((( SELECT auth.uid() AS uid) = ( SELECT p.user_id
   FROM (errands e
     JOIN profiles p ON ((e.requester_id = p.id)))
  WHERE (e.id = errand_stops.errand_id))));
CREATE POLICY errands_delete_policy ON errands FOR DELETE TO public USING ((requester_id IN ( SELECT profiles.id
   FROM profiles
  WHERE (profiles.user_id = ( SELECT auth.uid() AS uid)))));
CREATE POLICY errands_insert_policy ON errands FOR INSERT TO public WITH CHECK ((requester_id IN ( SELECT profiles.id
   FROM profiles
  WHERE (profiles.user_id = ( SELECT auth.uid() AS uid)))));
CREATE POLICY errands_select_policy ON errands FOR SELECT TO public USING (true);
CREATE POLICY errands_update_policy ON errands FOR UPDATE TO public USING ((requester_id IN ( SELECT profiles.id
   FROM profiles
  WHERE (profiles.user_id = ( SELECT auth.uid() AS uid)))));
CREATE POLICY food_carts_user_access ON food_carts FOR ALL TO public USING ((( SELECT auth.uid() AS uid) = user_id)) WITH CHECK ((( SELECT auth.uid() AS uid) = user_id));
CREATE POLICY food_menu_categories_owner_delete ON food_menu_categories FOR DELETE TO public USING ((EXISTS ( SELECT 1
   FROM food_stores
  WHERE ((food_stores.id = food_menu_categories.store_id) AND (food_stores.owner_id = ( SELECT auth.uid() AS uid))))));
CREATE POLICY food_menu_categories_owner_insert ON food_menu_categories FOR INSERT TO public WITH CHECK ((EXISTS ( SELECT 1
   FROM food_stores
  WHERE ((food_stores.id = food_menu_categories.store_id) AND (food_stores.owner_id = ( SELECT auth.uid() AS uid))))));
CREATE POLICY food_menu_categories_owner_update ON food_menu_categories FOR UPDATE TO public USING ((EXISTS ( SELECT 1
   FROM food_stores
  WHERE ((food_stores.id = food_menu_categories.store_id) AND (food_stores.owner_id = ( SELECT auth.uid() AS uid)))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM food_stores
  WHERE ((food_stores.id = food_menu_categories.store_id) AND (food_stores.owner_id = ( SELECT auth.uid() AS uid))))));
CREATE POLICY food_menu_categories_public_read ON food_menu_categories FOR SELECT TO public USING ((is_active = true));
CREATE POLICY food_menu_option_groups_public_read ON food_menu_option_groups FOR SELECT TO public USING (true);
CREATE POLICY food_menu_option_items_public_read ON food_menu_option_items FOR SELECT TO public USING ((is_available = true));
CREATE POLICY food_menus_owner_delete ON food_menus FOR DELETE TO public USING ((EXISTS ( SELECT 1
   FROM food_stores
  WHERE ((food_stores.id = food_menus.store_id) AND (food_stores.owner_id = ( SELECT auth.uid() AS uid))))));
CREATE POLICY food_menus_owner_insert ON food_menus FOR INSERT TO public WITH CHECK ((EXISTS ( SELECT 1
   FROM food_stores
  WHERE ((food_stores.id = food_menus.store_id) AND (food_stores.owner_id = ( SELECT auth.uid() AS uid))))));
CREATE POLICY food_menus_owner_update ON food_menus FOR UPDATE TO public USING ((EXISTS ( SELECT 1
   FROM food_stores
  WHERE ((food_stores.id = food_menus.store_id) AND (food_stores.owner_id = ( SELECT auth.uid() AS uid)))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM food_stores
  WHERE ((food_stores.id = food_menus.store_id) AND (food_stores.owner_id = ( SELECT auth.uid() AS uid))))));
CREATE POLICY food_menus_public_read ON food_menus FOR SELECT TO public USING ((is_available = true));
CREATE POLICY food_orders_customer_access ON food_orders FOR ALL TO public USING ((( SELECT auth.uid() AS uid) = customer_id)) WITH CHECK ((( SELECT auth.uid() AS uid) = customer_id));
CREATE POLICY food_reviews_public_read ON food_reviews FOR SELECT TO public USING (true);
CREATE POLICY food_reviews_user_create ON food_reviews FOR INSERT TO public WITH CHECK ((( SELECT auth.uid() AS uid) = user_id));
CREATE POLICY food_store_favorites_user_access ON food_store_favorites FOR ALL TO public USING ((( SELECT auth.uid() AS uid) = user_id)) WITH CHECK ((( SELECT auth.uid() AS uid) = user_id));
CREATE POLICY food_stores_insert ON food_stores FOR INSERT TO public WITH CHECK ((( SELECT auth.uid() AS uid) = owner_id));
CREATE POLICY food_stores_owner_delete ON food_stores FOR DELETE TO public USING ((( SELECT auth.uid() AS uid) = owner_id));
CREATE POLICY food_stores_owner_update ON food_stores FOR UPDATE TO public USING ((( SELECT auth.uid() AS uid) = owner_id)) WITH CHECK ((( SELECT auth.uid() AS uid) = owner_id));
CREATE POLICY food_stores_public_read ON food_stores FOR SELECT TO public USING ((is_active = true));
CREATE POLICY helper_profiles_insert_policy ON helper_profiles FOR INSERT TO public WITH CHECK ((( SELECT auth.uid() AS uid) = user_id));
CREATE POLICY helper_profiles_select_policy ON helper_profiles FOR SELECT TO public USING (true);
CREATE POLICY helper_profiles_update_policy ON helper_profiles FOR UPDATE TO public USING ((( SELECT auth.uid() AS uid) = user_id));
CREATE POLICY helper_subscriptions_select_policy ON helper_subscriptions FOR SELECT TO public USING ((EXISTS ( SELECT 1
   FROM helper_profiles
  WHERE ((helper_profiles.id = helper_subscriptions.helper_id) AND (helper_profiles.user_id = ( SELECT auth.uid() AS uid))))));
CREATE POLICY helper_withdrawals_insert_policy ON helper_withdrawals FOR INSERT TO public WITH CHECK ((EXISTS ( SELECT 1
   FROM helper_profiles
  WHERE ((helper_profiles.id = helper_withdrawals.helper_id) AND (helper_profiles.user_id = ( SELECT auth.uid() AS uid))))));
CREATE POLICY helper_withdrawals_select_policy ON helper_withdrawals FOR SELECT TO public USING ((EXISTS ( SELECT 1
   FROM helper_profiles
  WHERE ((helper_profiles.id = helper_withdrawals.helper_id) AND (helper_profiles.user_id = ( SELECT auth.uid() AS uid))))));
CREATE POLICY "Send messages in conversations" ON messages FOR INSERT TO public WITH CHECK (((( SELECT auth.uid() AS uid) = sender_id) AND (EXISTS ( SELECT 1
   FROM conversations
  WHERE ((conversations.id = messages.conversation_id) AND ((conversations.participant1_id = ( SELECT auth.uid() AS uid)) OR (conversations.participant2_id = ( SELECT auth.uid() AS uid))))))));
CREATE POLICY "View conversation messages" ON messages FOR SELECT TO public USING (((EXISTS ( SELECT 1
   FROM conversations
  WHERE ((conversations.id = messages.conversation_id) AND ((conversations.participant1_id = ( SELECT auth.uid() AS uid)) OR (conversations.participant2_id = ( SELECT auth.uid() AS uid)))))) OR is_admin()));
CREATE POLICY notices_delete ON notices FOR DELETE TO public USING ((EXISTS ( SELECT 1
   FROM admins
  WHERE (admins.user_id = ( SELECT auth.uid() AS uid)))));
CREATE POLICY notices_insert ON notices FOR INSERT TO public WITH CHECK ((EXISTS ( SELECT 1
   FROM admins
  WHERE (admins.user_id = ( SELECT auth.uid() AS uid)))));
CREATE POLICY notices_select ON notices FOR SELECT TO public USING (((is_published = true) OR (EXISTS ( SELECT 1
   FROM admins
  WHERE (admins.user_id = ( SELECT auth.uid() AS uid))))));
CREATE POLICY notices_update ON notices FOR UPDATE TO public USING ((EXISTS ( SELECT 1
   FROM admins
  WHERE (admins.user_id = ( SELECT auth.uid() AS uid)))));
CREATE POLICY "사용자는 자신의 알림만 업데이트" ON notifications FOR UPDATE TO public USING ((user_id = ( SELECT auth.uid() AS uid))) WITH CHECK ((user_id = ( SELECT auth.uid() AS uid)));
CREATE POLICY "사용자는 자신의 알림만 조회" ON notifications FOR SELECT TO public USING ((user_id = ( SELECT auth.uid() AS uid)));
CREATE POLICY "알림 생성 허용" ON notifications FOR INSERT TO public WITH CHECK (true);
CREATE POLICY order_settlements_insert ON order_settlements FOR INSERT TO public WITH CHECK (true);
CREATE POLICY order_settlements_select ON order_settlements FOR SELECT TO public USING (((seller_id IN ( SELECT sellers.id
   FROM sellers
  WHERE (sellers.user_id = ( SELECT auth.uid() AS uid)))) OR (EXISTS ( SELECT 1
   FROM admins
  WHERE (admins.user_id = ( SELECT auth.uid() AS uid))))));
CREATE POLICY order_settlements_update ON order_settlements FOR UPDATE TO public USING ((EXISTS ( SELECT 1
   FROM admins
  WHERE (admins.user_id = ( SELECT auth.uid() AS uid)))));
CREATE POLICY "Buyers create orders" ON orders FOR INSERT TO public WITH CHECK ((( SELECT auth.uid() AS uid) = buyer_id));
CREATE POLICY "Related users update orders" ON orders FOR UPDATE TO public USING (((( SELECT auth.uid() AS uid) = buyer_id) OR (( SELECT auth.uid() AS uid) = seller_id) OR is_admin())) WITH CHECK (((( SELECT auth.uid() AS uid) = buyer_id) OR (( SELECT auth.uid() AS uid) = seller_id) OR is_admin()));
CREATE POLICY "View related orders" ON orders FOR SELECT TO public USING (((( SELECT auth.uid() AS uid) = buyer_id) OR (( SELECT auth.uid() AS uid) = seller_id) OR is_admin()));
CREATE POLICY "Admins can view page_views" ON page_views FOR SELECT TO public USING ((EXISTS ( SELECT 1
   FROM admins
  WHERE ((admins.user_id = ( SELECT auth.uid() AS uid)) AND (admins.role = 'super_admin'::text)))));
CREATE POLICY "Anyone can insert page_views" ON page_views FOR INSERT TO public WITH CHECK (true);
CREATE POLICY payment_requests_buyer_update ON payment_requests FOR UPDATE TO public USING ((buyer_id = ( SELECT auth.uid() AS uid))) WITH CHECK ((buyer_id = ( SELECT auth.uid() AS uid)));
CREATE POLICY payment_requests_select ON payment_requests FOR SELECT TO public USING (((buyer_id = ( SELECT auth.uid() AS uid)) OR (seller_id IN ( SELECT sellers.id
   FROM sellers
  WHERE (sellers.user_id = ( SELECT auth.uid() AS uid))))));
CREATE POLICY payment_requests_seller_insert ON payment_requests FOR INSERT TO public WITH CHECK ((seller_id IN ( SELECT sellers.id
   FROM sellers
  WHERE (sellers.user_id = ( SELECT auth.uid() AS uid)))));
CREATE POLICY payments_insert ON payments FOR INSERT TO public WITH CHECK (true);
CREATE POLICY payments_select ON payments FOR SELECT TO public USING ((EXISTS ( SELECT 1
   FROM orders
  WHERE ((orders.id = payments.order_id) AND ((orders.buyer_id = ( SELECT auth.uid() AS uid)) OR (orders.seller_id = ( SELECT auth.uid() AS uid)))))));
CREATE POLICY "View visible portfolios or own portfolios" ON portfolio_items FOR SELECT TO public USING (((is_visible = true) OR (( SELECT auth.uid() AS uid) = seller_id)));
CREATE POLICY "Anyone can view portfolio-service links" ON portfolio_services FOR SELECT TO public USING (true);
CREATE POLICY "Sellers can link their own portfolios and services" ON portfolio_services FOR INSERT TO public WITH CHECK ((EXISTS ( SELECT 1
   FROM seller_portfolio sp
  WHERE ((sp.id = portfolio_services.portfolio_id) AND (sp.seller_id = ( SELECT get_seller_id(( SELECT auth.uid() AS uid)) AS get_seller_id))))));
CREATE POLICY "Sellers can unlink their own portfolios and services" ON portfolio_services FOR DELETE TO public USING ((EXISTS ( SELECT 1
   FROM seller_portfolio sp
  WHERE ((sp.id = portfolio_services.portfolio_id) AND (sp.seller_id = ( SELECT get_seller_id(( SELECT auth.uid() AS uid)) AS get_seller_id))))));
CREATE POLICY "Campaign owners create placements" ON premium_placements FOR INSERT TO public WITH CHECK ((EXISTS ( SELECT 1
   FROM advertising_campaigns
  WHERE ((advertising_campaigns.id = premium_placements.campaign_id) AND (advertising_campaigns.seller_id = ( SELECT auth.uid() AS uid))))));
CREATE POLICY "View active or own placements" ON premium_placements FOR SELECT TO public USING (((is_active = true) OR (EXISTS ( SELECT 1
   FROM advertising_campaigns
  WHERE ((advertising_campaigns.id = premium_placements.campaign_id) AND (advertising_campaigns.seller_id = ( SELECT auth.uid() AS uid))))) OR is_admin()));
CREATE POLICY profiles_delete_own ON profiles FOR DELETE TO public USING ((( SELECT auth.uid() AS uid) = user_id));
CREATE POLICY profiles_insert_own ON profiles FOR INSERT TO public WITH CHECK ((( SELECT auth.uid() AS uid) = user_id));
CREATE POLICY profiles_select_all ON profiles FOR SELECT TO public USING (true);
CREATE POLICY profiles_update_own ON profiles FOR UPDATE TO public USING ((( SELECT auth.uid() AS uid) = user_id)) WITH CHECK ((( SELECT auth.uid() AS uid) = user_id));
CREATE POLICY "Sellers create responses" ON quote_responses FOR INSERT TO public WITH CHECK ((( SELECT auth.uid() AS uid) = seller_id));
CREATE POLICY "Sellers update own responses" ON quote_responses FOR UPDATE TO public USING ((( SELECT auth.uid() AS uid) = seller_id)) WITH CHECK ((( SELECT auth.uid() AS uid) = seller_id));
CREATE POLICY "View relevant quote responses" ON quote_responses FOR SELECT TO public USING (((( SELECT auth.uid() AS uid) = seller_id) OR (EXISTS ( SELECT 1
   FROM quotes
  WHERE ((quotes.id = quote_responses.quote_id) AND (quotes.buyer_id = ( SELECT auth.uid() AS uid)))))));
CREATE POLICY "Buyers create quotes" ON quotes FOR INSERT TO public WITH CHECK ((( SELECT auth.uid() AS uid) = buyer_id));
CREATE POLICY "Buyers delete own quotes" ON quotes FOR DELETE TO public USING ((( SELECT auth.uid() AS uid) = buyer_id));
CREATE POLICY "Buyers update own quotes" ON quotes FOR UPDATE TO public USING ((( SELECT auth.uid() AS uid) = buyer_id)) WITH CHECK ((( SELECT auth.uid() AS uid) = buyer_id));
CREATE POLICY "View active or own quotes" ON quotes FOR SELECT TO public USING (((status = 'pending'::text) OR (( SELECT auth.uid() AS uid) = buyer_id)));
CREATE POLICY refunds_insert ON refunds FOR INSERT TO public WITH CHECK ((EXISTS ( SELECT 1
   FROM orders
  WHERE ((orders.id = refunds.order_id) AND ((orders.buyer_id = ( SELECT auth.uid() AS uid)) OR (orders.seller_id = ( SELECT auth.uid() AS uid)))))));
CREATE POLICY refunds_select ON refunds FOR SELECT TO public USING ((EXISTS ( SELECT 1
   FROM orders
  WHERE ((orders.id = refunds.order_id) AND ((orders.buyer_id = ( SELECT auth.uid() AS uid)) OR (orders.seller_id = ( SELECT auth.uid() AS uid)))))));
CREATE POLICY "Admins update reports" ON reports FOR UPDATE TO public USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "Create reports" ON reports FOR INSERT TO public WITH CHECK ((( SELECT auth.uid() AS uid) = reporter_id));
CREATE POLICY "View own or managed reports" ON reports FOR SELECT TO public USING (((( SELECT auth.uid() AS uid) = reporter_id) OR is_admin()));
CREATE POLICY "Buyers create reviews" ON reviews FOR INSERT TO public WITH CHECK ((EXISTS ( SELECT 1
   FROM orders
  WHERE ((orders.id = reviews.order_id) AND (orders.buyer_id = ( SELECT auth.uid() AS uid))))));
CREATE POLICY "Buyers update own reviews" ON reviews FOR UPDATE TO public USING ((( SELECT auth.uid() AS uid) = buyer_id)) WITH CHECK ((( SELECT auth.uid() AS uid) = buyer_id));
CREATE POLICY "View public or own reviews" ON reviews FOR SELECT TO public USING (((is_visible = true) OR (( SELECT auth.uid() AS uid) = buyer_id) OR (( SELECT auth.uid() AS uid) = seller_id) OR is_admin()));
CREATE POLICY "구매자는 수정 요청 생성 가능" ON revision_history FOR INSERT TO public WITH CHECK (((requested_by = ( SELECT auth.uid() AS uid)) AND (EXISTS ( SELECT 1
   FROM orders
  WHERE ((orders.id = revision_history.order_id) AND (orders.buyer_id = ( SELECT auth.uid() AS uid)))))));
CREATE POLICY "수정 요청 이력 조회 권한" ON revision_history FOR SELECT TO public USING (((requested_by = ( SELECT auth.uid() AS uid)) OR (EXISTS ( SELECT 1
   FROM orders
  WHERE ((orders.id = revision_history.order_id) AND (orders.seller_id = ( SELECT auth.uid() AS uid)))))));
CREATE POLICY "판매자는 수정 완료 처리 가능" ON revision_history FOR UPDATE TO public USING ((EXISTS ( SELECT 1
   FROM orders
  WHERE ((orders.id = revision_history.order_id) AND (orders.seller_id = ( SELECT auth.uid() AS uid)))))) WITH CHECK (((completed_by = ( SELECT auth.uid() AS uid)) AND (EXISTS ( SELECT 1
   FROM orders
  WHERE ((orders.id = revision_history.order_id) AND (orders.seller_id = ( SELECT auth.uid() AS uid)))))));
CREATE POLICY "Anyone can view schema migrations" ON schema_migrations FOR SELECT TO public USING (true);
CREATE POLICY "System can insert schema migrations" ON schema_migrations FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Insert search logs" ON search_logs FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Users and admins view search logs" ON search_logs FOR SELECT TO public USING (((( SELECT auth.uid() AS uid) = user_id) OR (EXISTS ( SELECT 1
   FROM admins
  WHERE (admins.user_id = ( SELECT auth.uid() AS uid))))));
CREATE POLICY "seller_earnings 생성 허용" ON seller_earnings FOR INSERT TO public WITH CHECK ((seller_id = ( SELECT auth.uid() AS uid)));
CREATE POLICY "수익 정보 조회 권한" ON seller_earnings FOR SELECT TO public USING (((seller_id = ( SELECT auth.uid() AS uid)) OR (EXISTS ( SELECT 1
   FROM admins
  WHERE (admins.user_id = ( SELECT auth.uid() AS uid))))));
CREATE POLICY "판매자는 자신의 수익 정보 업데이트 가능" ON seller_earnings FOR UPDATE TO public USING ((seller_id = ( SELECT auth.uid() AS uid))) WITH CHECK ((seller_id = ( SELECT auth.uid() AS uid)));
CREATE POLICY "Anyone can view portfolio" ON seller_portfolio FOR SELECT TO public USING (true);
CREATE POLICY "Sellers can delete own portfolio" ON seller_portfolio FOR DELETE TO public USING ((seller_id = ( SELECT get_seller_id(( SELECT auth.uid() AS uid)) AS get_seller_id)));
CREATE POLICY "Sellers can insert own portfolio" ON seller_portfolio FOR INSERT TO public WITH CHECK ((seller_id = ( SELECT get_seller_id(( SELECT auth.uid() AS uid)) AS get_seller_id)));
CREATE POLICY "Sellers can update own portfolio" ON seller_portfolio FOR UPDATE TO public USING ((seller_id = ( SELECT get_seller_id(( SELECT auth.uid() AS uid)) AS get_seller_id))) WITH CHECK ((seller_id = ( SELECT get_seller_id(( SELECT auth.uid() AS uid)) AS get_seller_id)));
CREATE POLICY "Anyone can view seller public info" ON sellers FOR SELECT TO public USING (true);
CREATE POLICY sellers_insert_own ON sellers FOR INSERT TO public WITH CHECK ((user_id = ( SELECT auth.uid() AS uid)));
CREATE POLICY sellers_update_policy ON sellers FOR UPDATE TO public USING (((user_id = ( SELECT auth.uid() AS uid)) OR is_admin()));
CREATE POLICY "Anyone can view service categories" ON service_categories FOR SELECT TO public USING (true);
CREATE POLICY "Enable insert for service categories" ON service_categories FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Users can delete own favorites" ON service_favorites FOR DELETE TO public USING ((( SELECT auth.uid() AS uid) = user_id));
CREATE POLICY "Users can insert own favorites" ON service_favorites FOR INSERT TO public WITH CHECK ((( SELECT auth.uid() AS uid) = user_id));
CREATE POLICY service_favorites_select ON service_favorites FOR SELECT TO public USING (((user_id = ( SELECT auth.uid() AS uid)) OR (service_id IN ( SELECT s.id
   FROM (services s
     JOIN sellers sel ON ((s.seller_id = sel.id)))
  WHERE (sel.user_id = ( SELECT auth.uid() AS uid))))));
CREATE POLICY service_packages_delete_policy ON service_packages FOR DELETE TO public USING ((EXISTS ( SELECT 1
   FROM (services s
     JOIN sellers sel ON ((s.seller_id = sel.id)))
  WHERE ((s.id = service_packages.service_id) AND (sel.user_id = ( SELECT auth.uid() AS uid))))));
CREATE POLICY service_packages_insert_policy ON service_packages FOR INSERT TO public WITH CHECK ((EXISTS ( SELECT 1
   FROM (services s
     JOIN sellers sel ON ((s.seller_id = sel.id)))
  WHERE ((s.id = service_packages.service_id) AND (sel.user_id = ( SELECT auth.uid() AS uid))))));
CREATE POLICY service_packages_select_policy ON service_packages FOR SELECT TO public USING (true);
CREATE POLICY service_packages_update_policy ON service_packages FOR UPDATE TO public USING ((EXISTS ( SELECT 1
   FROM (services s
     JOIN sellers sel ON ((s.seller_id = sel.id)))
  WHERE ((s.id = service_packages.service_id) AND (sel.user_id = ( SELECT auth.uid() AS uid))))));
CREATE POLICY service_revision_categories_insert_policy ON service_revision_categories FOR INSERT TO public WITH CHECK ((EXISTS ( SELECT 1
   FROM (service_revisions
     JOIN sellers ON ((sellers.id = service_revisions.seller_id)))
  WHERE ((service_revisions.id = service_revision_categories.revision_id) AND (sellers.user_id = ( SELECT auth.uid() AS uid))))));
CREATE POLICY service_revision_categories_select_policy ON service_revision_categories FOR SELECT TO public USING ((is_admin() OR (EXISTS ( SELECT 1
   FROM (service_revisions
     JOIN sellers ON ((sellers.id = service_revisions.seller_id)))
  WHERE ((service_revisions.id = service_revision_categories.revision_id) AND (sellers.user_id = ( SELECT auth.uid() AS uid)))))));
CREATE POLICY service_revisions_delete_policy ON service_revisions FOR DELETE TO public USING ((((status)::text = 'rejected'::text) AND (EXISTS ( SELECT 1
   FROM sellers
  WHERE ((sellers.id = service_revisions.seller_id) AND (sellers.user_id = ( SELECT auth.uid() AS uid)))))));
CREATE POLICY service_revisions_insert_policy ON service_revisions FOR INSERT TO public WITH CHECK ((EXISTS ( SELECT 1
   FROM sellers
  WHERE ((sellers.id = service_revisions.seller_id) AND (sellers.user_id = ( SELECT auth.uid() AS uid))))));
CREATE POLICY service_revisions_select_policy ON service_revisions FOR SELECT TO public USING ((is_admin() OR (EXISTS ( SELECT 1
   FROM sellers
  WHERE ((sellers.id = service_revisions.seller_id) AND (sellers.user_id = ( SELECT auth.uid() AS uid)))))));
CREATE POLICY service_revisions_update_policy ON service_revisions FOR UPDATE TO public USING (is_admin());
CREATE POLICY "Service owners can manage their service tags" ON service_tags FOR ALL TO public USING ((EXISTS ( SELECT 1
   FROM services
  WHERE ((services.id = service_tags.service_id) AND (services.seller_id = ( SELECT auth.uid() AS uid)))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM services
  WHERE ((services.id = service_tags.service_id) AND (services.seller_id = ( SELECT auth.uid() AS uid))))));
CREATE POLICY "Anyone can insert view logs" ON service_view_logs FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Users can view service logs" ON service_view_logs FOR SELECT TO public USING (((EXISTS ( SELECT 1
   FROM (services
     JOIN sellers ON ((sellers.id = services.seller_id)))
  WHERE ((services.id = service_view_logs.service_id) AND (sellers.user_id = ( SELECT auth.uid() AS uid))))) OR (EXISTS ( SELECT 1
   FROM admins
  WHERE (admins.user_id = ( SELECT auth.uid() AS uid))))));
CREATE POLICY "Users can delete own service views" ON service_views FOR DELETE TO public USING ((( SELECT auth.uid() AS uid) = user_id));
CREATE POLICY "Users can insert own service views" ON service_views FOR INSERT TO public WITH CHECK ((( SELECT auth.uid() AS uid) = user_id));
CREATE POLICY "Users can update own service views" ON service_views FOR UPDATE TO public USING ((( SELECT auth.uid() AS uid) = user_id)) WITH CHECK ((( SELECT auth.uid() AS uid) = user_id));
CREATE POLICY service_views_select ON service_views FOR SELECT TO public USING (((user_id = ( SELECT auth.uid() AS uid)) OR (service_id IN ( SELECT s.id
   FROM (services s
     JOIN sellers sel ON ((s.seller_id = sel.id)))
  WHERE (sel.user_id = ( SELECT auth.uid() AS uid))))));
CREATE POLICY "Authorized users can update services" ON services FOR UPDATE TO public USING (((seller_id IN ( SELECT sellers.id
   FROM sellers
  WHERE (sellers.user_id = ( SELECT auth.uid() AS uid)))) OR (EXISTS ( SELECT 1
   FROM admins
  WHERE (admins.user_id = ( SELECT auth.uid() AS uid))))));
CREATE POLICY "Sellers manage service deletion" ON services FOR DELETE TO public USING ((seller_id IN ( SELECT sellers.id
   FROM sellers
  WHERE (sellers.user_id = ( SELECT auth.uid() AS uid)))));
CREATE POLICY "Sellers manage service insertion" ON services FOR INSERT TO public WITH CHECK ((seller_id IN ( SELECT sellers.id
   FROM sellers
  WHERE (sellers.user_id = ( SELECT auth.uid() AS uid)))));
CREATE POLICY "Users can view services" ON services FOR SELECT TO public USING (((status = 'active'::text) OR (seller_id IN ( SELECT sellers.id
   FROM sellers
  WHERE (sellers.user_id = ( SELECT auth.uid() AS uid)))) OR (EXISTS ( SELECT 1
   FROM admins
  WHERE (admins.user_id = ( SELECT auth.uid() AS uid))))));
CREATE POLICY "Admins can view all settlement details" ON settlement_details FOR SELECT TO public USING ((EXISTS ( SELECT 1
   FROM admins
  WHERE (admins.user_id = ( SELECT auth.uid() AS uid)))));
CREATE POLICY "관리자는 정산 생성 가능" ON settlements FOR INSERT TO public WITH CHECK ((EXISTS ( SELECT 1
   FROM admins
  WHERE (admins.user_id = ( SELECT auth.uid() AS uid)))));
CREATE POLICY "관리자는 정산 업데이트 가능" ON settlements FOR UPDATE TO public USING ((EXISTS ( SELECT 1
   FROM admins
  WHERE (admins.user_id = ( SELECT auth.uid() AS uid))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM admins
  WHERE (admins.user_id = ( SELECT auth.uid() AS uid)))));
CREATE POLICY "정산 내역 조회 권한" ON settlements FOR SELECT TO public USING (((seller_id = ( SELECT auth.uid() AS uid)) OR (EXISTS ( SELECT 1
   FROM admins
  WHERE (admins.user_id = ( SELECT auth.uid() AS uid))))));
CREATE POLICY "Admins can manage tags" ON tags FOR ALL TO public USING ((EXISTS ( SELECT 1
   FROM admins
  WHERE (admins.user_id = ( SELECT auth.uid() AS uid))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM admins
  WHERE (admins.user_id = ( SELECT auth.uid() AS uid)))));
CREATE POLICY sellers_select_own_invoices ON tax_invoices FOR SELECT TO public USING ((subscription_id IN ( SELECT advertising_subscriptions.id
   FROM advertising_subscriptions
  WHERE (advertising_subscriptions.seller_id IN ( SELECT sellers.id
           FROM sellers
          WHERE (sellers.user_id = ( SELECT auth.uid() AS uid)))))));
CREATE POLICY "Users manage own wallet" ON user_wallets FOR ALL TO public USING ((( SELECT auth.uid() AS uid) = user_id)) WITH CHECK ((( SELECT auth.uid() AS uid) = user_id));
CREATE POLICY "Service role can insert users" ON users FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE TO public USING ((id = ( SELECT auth.uid() AS uid))) WITH CHECK ((id = ( SELECT auth.uid() AS uid)));
CREATE POLICY users_select_policy ON users FOR SELECT TO public USING (((id = ( SELECT auth.uid() AS uid)) OR is_admin()));
CREATE POLICY "Admins can view daily stats" ON visitor_stats_daily FOR SELECT TO public USING ((EXISTS ( SELECT 1
   FROM admins
  WHERE ((admins.user_id = ( SELECT auth.uid() AS uid)) AND (admins.role = 'super_admin'::text)))));
CREATE POLICY "Service role can insert daily stats" ON visitor_stats_daily FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Service role can update daily stats" ON visitor_stats_daily FOR UPDATE TO public USING (true);
CREATE POLICY "Admins can view hourly stats" ON visitor_stats_hourly FOR SELECT TO public USING ((EXISTS ( SELECT 1
   FROM admins
  WHERE ((admins.user_id = ( SELECT auth.uid() AS uid)) AND (admins.role = 'super_admin'::text)))));
CREATE POLICY "Service role can insert hourly stats" ON visitor_stats_hourly FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Service role can update hourly stats" ON visitor_stats_hourly FOR UPDATE TO public USING (true);
CREATE POLICY "Admins can view monthly stats" ON visitor_stats_monthly FOR SELECT TO public USING ((EXISTS ( SELECT 1
   FROM admins
  WHERE ((admins.user_id = ( SELECT auth.uid() AS uid)) AND (admins.role = 'super_admin'::text)))));
CREATE POLICY "Service role can insert monthly stats" ON visitor_stats_monthly FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Service role can update monthly stats" ON visitor_stats_monthly FOR UPDATE TO public USING (true);
CREATE POLICY "Users view own wallet transactions" ON wallet_transactions FOR SELECT TO public USING ((( SELECT auth.uid() AS uid) = user_id));
CREATE POLICY "Sellers can create withdrawal requests" ON withdrawal_requests FOR INSERT TO public WITH CHECK ((seller_id IN ( SELECT sellers.id
   FROM sellers
  WHERE (sellers.user_id = ( SELECT auth.uid() AS uid)))));
CREATE POLICY "Sellers can update own pending withdrawals" ON withdrawal_requests FOR UPDATE TO public USING (((seller_id IN ( SELECT sellers.id
   FROM sellers
  WHERE (sellers.user_id = ( SELECT auth.uid() AS uid)))) AND (status = 'pending'::text))) WITH CHECK ((seller_id IN ( SELECT sellers.id
   FROM sellers
  WHERE (sellers.user_id = ( SELECT auth.uid() AS uid)))));
CREATE POLICY "Sellers can view own withdrawal requests" ON withdrawal_requests FOR SELECT TO public USING ((seller_id IN ( SELECT sellers.id
   FROM sellers
  WHERE (sellers.user_id = ( SELECT auth.uid() AS uid)))));

COMMIT;
