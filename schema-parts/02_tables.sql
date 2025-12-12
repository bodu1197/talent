-- 2. Tables (without foreign keys)

CREATE TABLE activity_logs (
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

CREATE TABLE admins (
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

CREATE TABLE advertising_campaigns (
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

CREATE TABLE advertising_credits (
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

CREATE TABLE advertising_impressions (
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

CREATE TABLE advertising_payments (
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

CREATE TABLE advertising_subscriptions (
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

CREATE TABLE buyers (
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

CREATE TABLE categories (
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

CREATE TABLE category_visits (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  category_id text NOT NULL,
  category_name text NOT NULL,
  category_slug text NOT NULL,
  visited_at timestamp with time zone DEFAULT now(),
  visited_date date,
  PRIMARY KEY (id)
);

CREATE TABLE chat_favorites (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  room_id uuid NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  PRIMARY KEY (id),
  UNIQUE (user_id, room_id)
);

CREATE TABLE chat_messages (
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

CREATE TABLE chat_rooms (
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

CREATE TABLE company_info (
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

CREATE TABLE conversations (
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

CREATE TABLE credit_transactions (
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

CREATE TABLE disputes (
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

CREATE TABLE earnings_transactions (
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

CREATE TABLE errand_applications (
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

CREATE TABLE errand_chat_messages (
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

CREATE TABLE errand_disputes (
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

CREATE TABLE errand_locations (
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

CREATE TABLE errand_messages (
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

CREATE TABLE errand_reviews (
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

CREATE TABLE errand_settlements (
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

CREATE TABLE errand_stops (
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

CREATE TABLE errands (
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

CREATE TABLE food_carts (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid,
  store_id uuid,
  items jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  PRIMARY KEY (id),
  UNIQUE (user_id, store_id)
);

CREATE TABLE food_menu_categories (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  store_id uuid,
  name character varying(50) NOT NULL,
  description text,
  sort_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  PRIMARY KEY (id)
);

CREATE TABLE food_menu_option_groups (
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

CREATE TABLE food_menu_option_items (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  option_group_id uuid,
  name character varying(50) NOT NULL,
  price integer DEFAULT 0,
  is_available boolean DEFAULT true,
  sort_order integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  PRIMARY KEY (id)
);

CREATE TABLE food_menus (
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

CREATE TABLE food_orders (
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

CREATE TABLE food_reviews (
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

CREATE TABLE food_store_favorites (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid,
  store_id uuid,
  created_at timestamp with time zone DEFAULT now(),
  PRIMARY KEY (id),
  UNIQUE (user_id, store_id)
);

CREATE TABLE food_stores (
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

CREATE TABLE helper_profiles (
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

CREATE TABLE helper_subscriptions (
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

CREATE TABLE helper_withdrawals (
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

CREATE TABLE messages (
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

CREATE TABLE notices (
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

CREATE TABLE notifications (
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

CREATE TABLE order_settlements (
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

CREATE TABLE orders (
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

CREATE TABLE page_views (
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

CREATE TABLE payment_requests (
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

CREATE TABLE payments (
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

CREATE TABLE portfolio_items (
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

CREATE TABLE portfolio_services (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  portfolio_id uuid NOT NULL,
  service_id uuid NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  PRIMARY KEY (id),
  UNIQUE (portfolio_id, service_id)
);

CREATE TABLE premium_placements (
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

CREATE TABLE profiles (
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

CREATE TABLE quote_responses (
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

CREATE TABLE quotes (
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

CREATE TABLE refunds (
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

CREATE TABLE reports (
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

CREATE TABLE reviews (
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

CREATE TABLE revision_history (
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

CREATE TABLE schema_migrations (
  version text NOT NULL,
  executed_at timestamp with time zone DEFAULT now(),
  PRIMARY KEY (version)
);

CREATE TABLE search_logs (
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

CREATE TABLE seller_earnings (
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

CREATE TABLE seller_portfolio (
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

CREATE TABLE sellers (
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

CREATE TABLE service_categories (
  service_id uuid NOT NULL,
  category_id text NOT NULL,
  is_primary boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  PRIMARY KEY (service_id, category_id)
);

CREATE TABLE service_favorites (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  service_id uuid NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  PRIMARY KEY (id),
  UNIQUE (user_id, service_id)
);

CREATE TABLE service_packages (
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

CREATE TABLE service_revision_categories (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  revision_id uuid NOT NULL,
  category_id text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  PRIMARY KEY (id)
);

CREATE TABLE service_revisions (
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

CREATE TABLE service_tags (
  service_id uuid NOT NULL,
  tag_id uuid NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  PRIMARY KEY (service_id, tag_id)
);

CREATE TABLE service_view_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  service_id uuid NOT NULL,
  user_id uuid,
  ip_address inet,
  user_agent text,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  PRIMARY KEY (id)
);

CREATE TABLE service_views (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  service_id uuid NOT NULL,
  viewed_at timestamp with time zone DEFAULT now(),
  PRIMARY KEY (id),
  UNIQUE (user_id, service_id)
);

CREATE TABLE services (
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

CREATE TABLE settlement_details (
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

CREATE TABLE settlements (
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

CREATE TABLE tags (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL,
  usage_count integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE (name),
  PRIMARY KEY (id),
  UNIQUE (slug)
);

CREATE TABLE tax_invoices (
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

CREATE TABLE user_wallets (
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

CREATE TABLE users (
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

CREATE TABLE visitor_stats_daily (
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

CREATE TABLE visitor_stats_hourly (
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

CREATE TABLE visitor_stats_monthly (
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

CREATE TABLE wallet_transactions (
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

CREATE TABLE withdrawal_requests (
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

