CREATE TABLE activity_logs (
  user_agent text,
  entity_type text,
  action text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  old_value jsonb,
  entity_id uuid,
  admin_id uuid,
  user_id uuid,
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  new_value jsonb,
  ip_address inet
);

CREATE TABLE admins (
  permissions jsonb DEFAULT '{}'::jsonb,
  role text NOT NULL,
  department text,
  notes text,
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  last_action_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE advertising_campaigns (
  campaign_type text NOT NULL,
  campaign_name text NOT NULL,
  updated_at timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now(),
  roi numeric DEFAULT 0.00,
  conversion_rate numeric DEFAULT 0.00,
  ctr numeric DEFAULT 0.00,
  conversions integer DEFAULT 0,
  clicks integer DEFAULT 0,
  impressions integer DEFAULT 0,
  end_date timestamp with time zone NOT NULL,
  start_date timestamp with time zone NOT NULL,
  target_keywords _text,
  target_user_types _text,
  bid_type text DEFAULT 'cpc'::text,
  status text DEFAULT 'draft'::text,
  approval_status text DEFAULT 'pending'::text,
  rejection_reason text,
  seller_id uuid NOT NULL,
  bid_amount integer NOT NULL,
  target_categories _uuid,
  spent_amount integer DEFAULT 0,
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  total_budget integer,
  daily_budget integer
);

CREATE TABLE advertising_credits (
  initial_amount integer NOT NULL DEFAULT 0,
  used_amount integer NOT NULL DEFAULT 0,
  expires_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  promotion_type text,
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  seller_id uuid NOT NULL,
  amount integer NOT NULL DEFAULT 0
);

CREATE TABLE advertising_impressions (
  subscription_id uuid NOT NULL,
  service_id uuid NOT NULL,
  position integer NOT NULL,
  page_number integer DEFAULT 1,
  user_id uuid,
  ip_address inet,
  clicked boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  session_id text,
  user_agent text,
  clicked_at timestamp with time zone,
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  category_id text
);

CREATE TABLE advertising_payments (
  supply_amount integer,
  updated_at timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now(),
  confirmed_by uuid,
  confirmed_at timestamp with time zone,
  paid_at timestamp with time zone,
  deposit_time time without time zone,
  deposit_date date,
  amount integer NOT NULL,
  subscription_id uuid NOT NULL,
  seller_id uuid NOT NULL,
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  pg_transaction_id text,
  receipt_image text,
  bank_name text,
  depositor_name text,
  status text NOT NULL DEFAULT 'pending'::text,
  card_number_masked text,
  admin_memo text,
  payment_method text NOT NULL,
  tax_invoice_id uuid,
  tax_amount integer,
  card_company text
);

CREATE TABLE advertising_subscriptions (
  payment_method text NOT NULL,
  service_id uuid NOT NULL,
  seller_id uuid NOT NULL,
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  monthly_price integer NOT NULL DEFAULT 100000,
  expires_at timestamp with time zone,
  cancelled_at timestamp with time zone,
  started_at timestamp with time zone DEFAULT now(),
  bank_transfer_confirmed_by uuid,
  bank_transfer_confirmed_at timestamp with time zone,
  bank_transfer_confirmed boolean DEFAULT false,
  bank_transfer_deadline timestamp with time zone,
  last_billed_at timestamp with time zone,
  next_billing_date date NOT NULL,
  status text NOT NULL DEFAULT 'active'::text,
  updated_at timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now(),
  total_paid integer DEFAULT 0,
  total_clicks integer DEFAULT 0,
  total_impressions integer DEFAULT 0
);

CREATE TABLE buyers (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  total_orders integer DEFAULT 0,
  total_spent integer DEFAULT 0,
  points integer DEFAULT 0,
  coupon_count integer DEFAULT 0,
  last_order_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  is_active boolean DEFAULT true
);

CREATE TABLE categories (
  created_at timestamp with time zone DEFAULT now(),
  is_active boolean DEFAULT true,
  commission_rate numeric DEFAULT 20.00,
  is_featured boolean DEFAULT false,
  is_ai_category boolean DEFAULT false,
  service_count integer DEFAULT 0,
  display_order integer DEFAULT 0,
  level integer,
  id text NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL,
  parent_id text,
  icon text,
  description text,
  meta_title text,
  meta_description text,
  keywords _text,
  service_type character varying(10) DEFAULT 'online'::character varying,
  is_ai boolean DEFAULT false,
  popularity_score integer DEFAULT 0,
  updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE category_visits (
  visited_at timestamp with time zone DEFAULT now(),
  visited_date date,
  category_name text NOT NULL,
  category_slug text NOT NULL,
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  category_id text NOT NULL
);

CREATE TABLE chat_favorites (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  room_id uuid NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE chat_messages (
  sender_id uuid NOT NULL,
  file_size integer,
  updated_at timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now(),
  is_read boolean DEFAULT false,
  room_id uuid NOT NULL,
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  file_type text,
  file_name text,
  file_url text,
  message text NOT NULL
);

CREATE TABLE chat_rooms (
  user1_id uuid NOT NULL,
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  service_id uuid,
  last_message_at timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  user2_id uuid NOT NULL
);

CREATE TABLE company_info (
  address text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  email character varying(100),
  phone character varying(20),
  business_item character varying(50),
  business_type character varying(50),
  business_number character varying(20) NOT NULL,
  updated_at timestamp with time zone DEFAULT now(),
  ceo_name character varying(50) NOT NULL,
  is_active boolean DEFAULT true,
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  company_name character varying(100) NOT NULL
);

CREATE TABLE conversations (
  last_message_preview text,
  updated_at timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now(),
  participant2_unread_count integer DEFAULT 0,
  participant1_unread_count integer DEFAULT 0,
  participant2_last_read timestamp with time zone,
  participant1_last_read timestamp with time zone,
  last_message_at timestamp with time zone,
  is_active boolean DEFAULT true,
  participant2_id uuid NOT NULL,
  participant1_id uuid NOT NULL,
  order_id uuid,
  id uuid NOT NULL DEFAULT gen_random_uuid()
);

CREATE TABLE credit_transactions (
  credit_id uuid NOT NULL,
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  reference_id uuid,
  balance_after integer NOT NULL,
  reference_type text,
  amount integer NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  description text NOT NULL,
  transaction_type text NOT NULL,
  seller_id uuid NOT NULL
);

CREATE TABLE disputes (
  dispute_type text NOT NULL,
  mediation_notes text,
  resolution_details text,
  resolution text,
  status text DEFAULT 'open'::text,
  evidence_urls _text,
  evidence_description text,
  requested_action text,
  reason text NOT NULL,
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL,
  initiated_by uuid NOT NULL,
  mediator_id uuid,
  opened_at timestamp with time zone DEFAULT now(),
  mediation_started_at timestamp with time zone,
  resolved_at timestamp with time zone,
  closed_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE earnings_transactions (
  type text NOT NULL,
  description text,
  order_id uuid,
  amount integer NOT NULL,
  transaction_date timestamp with time zone DEFAULT now(),
  completed_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  order_number text,
  status text NOT NULL,
  seller_id uuid NOT NULL
);

CREATE TABLE errand_applications (
  errand_id uuid NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  message text,
  updated_at timestamp with time zone DEFAULT now(),
  proposed_price numeric,
  status character varying(20) NOT NULL DEFAULT 'pending'::character varying,
  helper_id uuid NOT NULL
);

CREATE TABLE errand_chat_messages (
  is_read boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  errand_id uuid NOT NULL,
  sender_id uuid NOT NULL,
  message text NOT NULL,
  message_type character varying(20) DEFAULT 'text'::character varying
);

CREATE TABLE errand_disputes (
  resolution text,
  errand_id uuid NOT NULL,
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  evidence_urls _text,
  reporter_id uuid NOT NULL,
  updated_at timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now(),
  resolved_by uuid,
  resolved_at timestamp with time zone,
  reported_id uuid NOT NULL,
  description text NOT NULL,
  reason character varying(100) NOT NULL,
  status character varying(20) NOT NULL DEFAULT 'open'::character varying,
  admin_note text
);

CREATE TABLE errand_locations (
  recorded_at timestamp with time zone DEFAULT now(),
  errand_id uuid NOT NULL,
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  lat numeric NOT NULL,
  lng numeric NOT NULL,
  accuracy numeric,
  heading numeric,
  speed numeric,
  helper_id uuid NOT NULL
);

CREATE TABLE errand_messages (
  is_read boolean DEFAULT false,
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  sender_id uuid NOT NULL,
  message_type character varying(20) DEFAULT 'text'::character varying,
  created_at timestamp with time zone DEFAULT now(),
  errand_id uuid NOT NULL,
  message text NOT NULL
);

CREATE TABLE errand_reviews (
  content text,
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  errand_id uuid NOT NULL,
  reviewer_id uuid NOT NULL,
  helper_id uuid NOT NULL,
  rating integer NOT NULL,
  speed_rating integer,
  kindness_rating integer,
  accuracy_rating integer,
  created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE errand_settlements (
  withdrawn_at timestamp with time zone,
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  errand_id uuid NOT NULL,
  helper_id uuid NOT NULL,
  total_amount numeric NOT NULL,
  available_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  status character varying(20) NOT NULL DEFAULT 'pending'::character varying
);

CREATE TABLE errand_stops (
  created_at timestamp with time zone DEFAULT now(),
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  errand_id uuid NOT NULL,
  stop_order integer NOT NULL,
  lat numeric,
  lng numeric,
  is_completed boolean DEFAULT false,
  completed_at timestamp with time zone,
  recipient_phone text,
  recipient_name text,
  address_detail text,
  address text NOT NULL
);

CREATE TABLE errands (
  category errand_category NOT NULL DEFAULT 'OTHER'::errand_category,
  range_fee numeric DEFAULT 0,
  stop_fee numeric DEFAULT 0,
  shopping_items jsonb,
  is_multi_stop boolean DEFAULT false,
  updated_at timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now(),
  cancelled_at timestamp with time zone,
  completed_at timestamp with time zone,
  started_at timestamp with time zone,
  scheduled_at timestamp with time zone,
  status errand_status NOT NULL DEFAULT 'OPEN'::errand_status,
  total_price numeric NOT NULL,
  tip numeric DEFAULT 0,
  distance_price numeric DEFAULT 0,
  base_price numeric NOT NULL DEFAULT 5000,
  estimated_distance numeric,
  shopping_range text,
  total_stops integer DEFAULT 1,
  delivery_lng numeric,
  delivery_detail text,
  pickup_detail text,
  delivery_lat numeric,
  pickup_lng numeric,
  pickup_lat numeric,
  cancel_reason text,
  helper_id uuid,
  requester_id uuid NOT NULL,
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  delivery_address text NOT NULL,
  pickup_address text NOT NULL,
  description text,
  title character varying(200) NOT NULL,
  item_fee numeric DEFAULT 0
);

CREATE TABLE food_carts (
  updated_at timestamp with time zone DEFAULT now(),
  store_id uuid,
  user_id uuid,
  created_at timestamp with time zone DEFAULT now(),
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  items jsonb NOT NULL DEFAULT '[]'::jsonb
);

CREATE TABLE food_menu_categories (
  sort_order integer DEFAULT 0,
  store_id uuid,
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name character varying(50) NOT NULL,
  description text,
  created_at timestamp with time zone DEFAULT now(),
  is_active boolean DEFAULT true
);

CREATE TABLE food_menu_option_groups (
  created_at timestamp with time zone DEFAULT now(),
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name character varying(50) NOT NULL,
  min_select integer DEFAULT 0,
  max_select integer DEFAULT 1,
  is_required boolean DEFAULT false,
  menu_id uuid,
  sort_order integer DEFAULT 0
);

CREATE TABLE food_menu_option_items (
  option_group_id uuid,
  price integer DEFAULT 0,
  is_available boolean DEFAULT true,
  sort_order integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  name character varying(50) NOT NULL,
  id uuid NOT NULL DEFAULT gen_random_uuid()
);

CREATE TABLE food_menus (
  store_id uuid,
  sort_order integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  price integer NOT NULL,
  is_popular boolean DEFAULT false,
  category_id uuid,
  is_available boolean DEFAULT true,
  image_url text,
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name character varying(100) NOT NULL,
  description text
);

CREATE TABLE food_orders (
  payment_status character varying(20) DEFAULT 'pending'::character varying,
  payment_method character varying(20),
  delivery_request text,
  status food_order_status DEFAULT 'pending'::food_order_status,
  total_amount integer NOT NULL,
  discount_amount integer DEFAULT 0,
  platform_fee integer DEFAULT 0,
  delivery_detail_address character varying(100),
  delivery_fee integer DEFAULT 0,
  subtotal integer NOT NULL,
  items jsonb NOT NULL,
  customer_id uuid,
  store_id uuid,
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  delivery_address character varying(255) NOT NULL,
  order_number character varying(20) NOT NULL,
  cancel_reason text,
  delivery_phone character varying(20) NOT NULL,
  updated_at timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now(),
  cancelled_at timestamp with time zone,
  delivered_at timestamp with time zone,
  picked_up_at timestamp with time zone,
  estimated_delivery_time timestamp with time zone,
  rider_id uuid
);

CREATE TABLE food_reviews (
  reply text,
  store_id uuid,
  order_id uuid,
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  image_urls _text,
  updated_at timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now(),
  content text,
  replied_at timestamp with time zone,
  rating integer NOT NULL,
  user_id uuid
);

CREATE TABLE food_store_favorites (
  store_id uuid,
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid,
  created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE food_stores (
  is_open boolean DEFAULT true,
  longitude numeric NOT NULL,
  business_document_url text,
  banner_url text,
  thumbnail_url text,
  updated_at timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now(),
  is_active boolean DEFAULT true,
  is_verified boolean DEFAULT false,
  detail_address character varying(100),
  min_order_amount integer DEFAULT 0,
  order_count integer DEFAULT 0,
  address character varying(255) NOT NULL,
  phone character varying(20),
  description text,
  business_number character varying(20),
  review_count integer DEFAULT 0,
  name character varying(100) NOT NULL,
  rating numeric DEFAULT 0,
  estimated_prep_time integer DEFAULT 30,
  business_name character varying(100),
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  delivery_fee integer DEFAULT 0,
  owner_id uuid,
  category food_store_category NOT NULL,
  latitude numeric NOT NULL
);

CREATE TABLE helper_profiles (
  preferred_categories _text,
  account_holder character varying(50),
  total_cancelled integer DEFAULT 0,
  total_completed integer DEFAULT 0,
  grade helper_grade DEFAULT 'NEWBIE'::helper_grade,
  id_card_verified_at timestamp with time zone,
  is_verified boolean DEFAULT false,
  user_id uuid NOT NULL,
  is_online boolean DEFAULT false,
  bio text,
  preferred_areas _text,
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  last_location_at timestamp with time zone,
  current_lng numeric,
  current_lat numeric,
  updated_at timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now(),
  last_active_at timestamp with time zone,
  bank_name character varying(50),
  bank_account character varying(50),
  is_active boolean DEFAULT false,
  subscription_expires_at timestamp with time zone,
  subscription_status subscription_status DEFAULT 'trial'::subscription_status,
  total_reviews integer DEFAULT 0,
  billing_key character varying(255),
  average_rating numeric DEFAULT 0
);

CREATE TABLE helper_subscriptions (
  receipt_url text,
  payment_method character varying(50),
  status character varying(20) NOT NULL DEFAULT 'paid'::character varying,
  payment_id character varying(100),
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  helper_id uuid NOT NULL,
  amount numeric NOT NULL DEFAULT 30000,
  created_at timestamp with time zone DEFAULT now(),
  paid_at timestamp with time zone DEFAULT now(),
  expires_at timestamp with time zone NOT NULL
);

CREATE TABLE helper_withdrawals (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  account_holder character varying(50) NOT NULL,
  bank_account character varying(50) NOT NULL,
  helper_id uuid NOT NULL,
  amount numeric NOT NULL,
  bank_name character varying(50) NOT NULL,
  reject_reason text,
  status character varying(20) NOT NULL DEFAULT 'pending'::character varying,
  requested_at timestamp with time zone DEFAULT now(),
  processed_at timestamp with time zone,
  processed_by uuid
);

CREATE TABLE messages (
  read_at timestamp with time zone,
  message_type text DEFAULT 'text'::text,
  content text,
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL,
  sender_id uuid NOT NULL,
  attachments jsonb,
  is_read boolean DEFAULT false,
  is_edited boolean DEFAULT false,
  edited_at timestamp with time zone,
  is_deleted boolean DEFAULT false,
  deleted_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE notices (
  view_count integer DEFAULT 0,
  created_by uuid,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  title character varying(200) NOT NULL,
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  category character varying(20) NOT NULL DEFAULT '공지'::character varying,
  is_important boolean DEFAULT false,
  content text NOT NULL,
  is_published boolean DEFAULT true
);

CREATE TABLE notifications (
  type text NOT NULL,
  link text,
  sender_id uuid,
  metadata jsonb,
  message text NOT NULL,
  title text NOT NULL,
  order_id uuid,
  created_at timestamp with time zone DEFAULT now(),
  is_read boolean DEFAULT false,
  user_id uuid NOT NULL,
  id uuid NOT NULL DEFAULT gen_random_uuid()
);

CREATE TABLE order_revision_stats (
  total_revisions bigint,
  last_revision_requested_at timestamp with time zone,
  pending_revisions bigint,
  order_id uuid,
  completed_revisions bigint
);

CREATE TABLE order_settlements (
  paid_at timestamp with time zone,
  cancelled_at timestamp with time zone,
  auto_confirm_at timestamp with time zone,
  batch_settlement_id uuid,
  seller_id uuid NOT NULL,
  status character varying(20) NOT NULL DEFAULT 'pending'::character varying,
  note text,
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL,
  confirmed_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  net_amount integer NOT NULL,
  platform_fee integer DEFAULT 0,
  pg_fee integer DEFAULT 0,
  order_amount integer NOT NULL
);

CREATE TABLE orders (
  discount_amount integer DEFAULT 0,
  status text DEFAULT 'pending_payment'::text,
  payment_status text DEFAULT 'pending'::text,
  work_status text DEFAULT 'waiting'::text,
  seller_amount integer NOT NULL,
  buyer_satisfied boolean,
  auto_complete_at timestamp with time zone,
  completed_at timestamp with time zone,
  delivered_at timestamp with time zone,
  used_revisions integer DEFAULT 0,
  cancellation_reason text,
  delivery_date date NOT NULL,
  commission_fee integer NOT NULL,
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  buyer_id uuid NOT NULL,
  seller_id uuid NOT NULL,
  description text,
  revision_reason text,
  package_type text,
  cancel_reason text,
  auto_confirm_at timestamp with time zone,
  revision_requested_at timestamp with time zone,
  amount integer,
  cancelled_at timestamp with time zone,
  started_at timestamp with time zone,
  paid_at timestamp with time zone,
  revisions_used integer DEFAULT 0,
  revision_count integer DEFAULT 0,
  delivery_days integer DEFAULT 7,
  payment_request_id uuid,
  payment_id uuid,
  review_id uuid,
  updated_at timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now(),
  seller_rating integer,
  commission_rate numeric NOT NULL,
  total_amount integer NOT NULL,
  additional_amount integer DEFAULT 0,
  express_amount integer DEFAULT 0,
  base_amount integer NOT NULL,
  service_id uuid NOT NULL,
  order_number text NOT NULL DEFAULT ((('ORD-'::text || to_char(now(), 'YYYYMMDD'::text)) || '-'::text) || substr((gen_random_uuid())::text, 1, 8)),
  requirements text,
  attachments _text,
  merchant_uid text,
  title text
);

CREATE TABLE page_views (
  country text,
  referrer text,
  user_agent text,
  session_id text,
  path text NOT NULL,
  user_id uuid,
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  ip_address inet,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  device_type text
);

CREATE TABLE payment_requests (
  title text NOT NULL,
  delivery_days integer DEFAULT 7,
  buyer_response text,
  order_id uuid,
  status text NOT NULL DEFAULT 'pending'::text,
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  service_id uuid,
  expires_at timestamp with time zone NOT NULL DEFAULT (now() + '72:00:00'::interval),
  amount integer NOT NULL,
  buyer_id uuid NOT NULL,
  seller_id uuid NOT NULL,
  room_id uuid NOT NULL,
  paid_at timestamp with time zone,
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  responded_at timestamp with time zone,
  revision_count integer DEFAULT 0,
  description text
);

CREATE TABLE payments (
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL,
  amount integer NOT NULL,
  paid_at timestamp with time zone,
  failed_at timestamp with time zone,
  cancelled_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  payment_method text NOT NULL,
  payment_id text,
  status text NOT NULL DEFAULT 'pending'::text,
  pg_provider text,
  pg_tid text,
  receipt_url text
);

CREATE TABLE portfolio_items (
  thumbnail_url text,
  seller_id uuid NOT NULL,
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  updated_at timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now(),
  is_visible boolean DEFAULT true,
  view_count integer DEFAULT 0,
  images _text,
  title text NOT NULL,
  description text
);

CREATE TABLE portfolio_services (
  created_at timestamp with time zone DEFAULT now(),
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  portfolio_id uuid NOT NULL,
  service_id uuid NOT NULL
);

CREATE TABLE premium_placements (
  service_id uuid NOT NULL,
  campaign_id uuid,
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  actual_cost integer DEFAULT 0,
  clicks integer DEFAULT 0,
  end_date timestamp with time zone NOT NULL,
  conversions integer DEFAULT 0,
  revenue_generated bigint DEFAULT 0,
  is_active boolean DEFAULT true,
  placement_type text NOT NULL,
  category_id text,
  keywords _text,
  total_cost integer,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  display_priority integer DEFAULT 0,
  position_score integer DEFAULT 0,
  placement_slot integer,
  start_date timestamp with time zone NOT NULL,
  impressions integer DEFAULT 0,
  paused_reason text,
  daily_cost integer,
  paused_at timestamp with time zone
);

CREATE TABLE profiles (
  role text DEFAULT 'buyer'::text,
  bio text,
  profile_image text,
  name text NOT NULL,
  updated_at timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now(),
  user_id uuid NOT NULL,
  id uuid NOT NULL DEFAULT gen_random_uuid()
);

CREATE TABLE quote_responses (
  delivery_days integer NOT NULL,
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  quote_id uuid NOT NULL,
  seller_id uuid NOT NULL,
  proposed_price integer NOT NULL,
  is_read boolean DEFAULT false,
  read_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  message text NOT NULL,
  attachments _text,
  status text DEFAULT 'pending'::text
);

CREATE TABLE quotes (
  category_id text,
  attachments _text,
  requirements text,
  description text NOT NULL,
  status text DEFAULT 'pending'::text,
  created_at timestamp with time zone DEFAULT now(),
  selected_response_id uuid,
  view_count integer DEFAULT 0,
  title text NOT NULL,
  updated_at timestamp with time zone DEFAULT now(),
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  response_count integer DEFAULT 0,
  buyer_id uuid NOT NULL,
  budget_min integer,
  budget_max integer,
  deadline date
);

CREATE TABLE refunds (
  payment_id uuid NOT NULL,
  order_id uuid NOT NULL,
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  approved_at timestamp with time zone,
  reason text NOT NULL,
  status text NOT NULL DEFAULT 'pending'::text,
  rejected_at timestamp with time zone,
  approved_by uuid,
  amount integer NOT NULL,
  completed_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE reports (
  evidence_urls _text,
  description text,
  report_reason text NOT NULL,
  report_type text NOT NULL,
  action_taken text,
  admin_notes text,
  resolved_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  assigned_at timestamp with time zone,
  assigned_to uuid,
  reported_review_id uuid,
  reported_order_id uuid,
  reported_service_id uuid,
  reported_user_id uuid,
  reporter_id uuid NOT NULL,
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  updated_at timestamp with time zone DEFAULT now(),
  severity text DEFAULT 'low'::text,
  status text DEFAULT 'pending'::text
);

CREATE TABLE reviews (
  moderated boolean DEFAULT false,
  comment text,
  images _text,
  seller_reply text,
  moderation_reason text,
  tags _text,
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL,
  buyer_id uuid NOT NULL,
  seller_id uuid NOT NULL,
  service_id uuid NOT NULL,
  rating integer NOT NULL,
  communication_rating integer,
  quality_rating integer,
  delivery_rating integer,
  seller_reply_at timestamp with time zone,
  helpful_count integer DEFAULT 0,
  not_helpful_count integer DEFAULT 0,
  is_visible boolean DEFAULT true,
  updated_at timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now(),
  is_featured boolean DEFAULT false
);

CREATE TABLE revision_history (
  order_id uuid NOT NULL,
  completed_by uuid,
  reason text NOT NULL,
  completed_at timestamp with time zone,
  requested_at timestamp with time zone NOT NULL DEFAULT now(),
  requested_by uuid NOT NULL,
  id uuid NOT NULL DEFAULT gen_random_uuid()
);

CREATE TABLE schema_migrations (
  version text NOT NULL,
  executed_at timestamp with time zone DEFAULT now()
);

CREATE TABLE search_logs (
  search_duration_ms integer,
  session_id text,
  keyword text NOT NULL,
  category_id text,
  created_at timestamp with time zone DEFAULT now(),
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid,
  filters jsonb,
  clicked_service_ids _uuid,
  result_count integer,
  converted_service_id uuid
);

CREATE TABLE seller_earnings (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  available_balance integer DEFAULT 0,
  pending_balance integer DEFAULT 0,
  total_withdrawn integer DEFAULT 0,
  total_earned integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  seller_id uuid NOT NULL
);

CREATE TABLE seller_portfolio (
  updated_at timestamp with time zone DEFAULT now(),
  service_id uuid,
  created_at timestamp with time zone DEFAULT now(),
  view_count integer DEFAULT 0,
  seller_id uuid NOT NULL,
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  category_id text,
  thumbnail_url text,
  image_urls _text DEFAULT '{}'::text[],
  project_url text,
  tags _text DEFAULT '{}'::text[],
  youtube_url text
);

CREATE TABLE seller_profiles (
  rejection_reason text,
  phone text,
  business_number text,
  business_registration_file text,
  bank_name text,
  account_number text,
  is_active boolean,
  account_holder text,
  created_at timestamp with time zone,
  updated_at timestamp with time zone,
  show_phone boolean,
  is_business boolean,
  verification_status text,
  bio text,
  kakao_id text,
  kakao_openchat text,
  whatsapp text,
  website text,
  preferred_contact _text,
  certificates text,
  experience text,
  verified_phone text,
  id uuid,
  user_id uuid,
  verified_name text,
  is_verified boolean,
  verified_at timestamp with time zone,
  total_sales integer,
  total_revenue integer,
  service_count integer,
  status text,
  rating numeric,
  tax_invoice_available boolean,
  verified boolean,
  contact_hours text,
  real_name text,
  review_count integer,
  last_sale_at timestamp with time zone,
  profile_image text,
  display_name text,
  business_name text
);

CREATE TABLE sellers (
  is_business boolean DEFAULT false,
  phone text,
  kakao_id text,
  bio text,
  verified boolean DEFAULT false,
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  kakao_openchat text,
  whatsapp text,
  website text,
  preferred_contact _text,
  rating numeric DEFAULT 0.0,
  review_count integer DEFAULT 0,
  certificates text,
  is_verified boolean DEFAULT false,
  verified_at timestamp with time zone,
  last_sale_at timestamp with time zone,
  is_active boolean DEFAULT true,
  rejection_reason text,
  total_sales integer DEFAULT 0,
  experience text,
  total_revenue integer DEFAULT 0,
  status text DEFAULT 'pending_review'::text,
  real_name text,
  contact_hours text,
  service_count integer DEFAULT 0,
  verification_status text DEFAULT 'pending'::text,
  created_at timestamp with time zone DEFAULT now(),
  verified_name text,
  verified_phone text,
  ceo_name character varying(50),
  account_holder text,
  account_number text,
  business_address text,
  business_type character varying(50),
  business_item character varying(50),
  bank_name text,
  business_registration_file text,
  business_email character varying(100),
  business_number text,
  tax_invoice_available boolean DEFAULT false,
  business_name text,
  updated_at timestamp with time zone DEFAULT now(),
  show_phone boolean DEFAULT false
);

CREATE TABLE service_categories (
  category_id text NOT NULL,
  service_id uuid NOT NULL,
  is_primary boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE service_favorites (
  user_id uuid NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  service_id uuid NOT NULL
);

CREATE TABLE service_packages (
  express_days integer,
  is_express_available boolean DEFAULT false,
  display_order integer DEFAULT 1,
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  description text,
  features _text DEFAULT '{}'::text[],
  package_type text NOT NULL,
  name text NOT NULL,
  service_id uuid NOT NULL,
  is_active boolean DEFAULT true,
  revision_count integer DEFAULT 0,
  delivery_days integer NOT NULL,
  price numeric NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  express_price numeric,
  updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE service_revision_categories (
  revision_id uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  category_id text NOT NULL,
  id uuid NOT NULL DEFAULT gen_random_uuid()
);

CREATE TABLE service_revisions (
  delivery_days integer,
  revision_note text,
  reviewed_at timestamp with time zone,
  admin_note text,
  status character varying(20) DEFAULT 'pending'::character varying,
  thumbnail_url text,
  description text,
  title character varying(200) NOT NULL,
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  service_id uuid NOT NULL,
  location_latitude numeric,
  revision_count integer,
  reviewed_by uuid,
  location_address character varying(500),
  seller_id uuid NOT NULL,
  delivery_method character varying(20),
  location_region character varying(100),
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  price integer,
  location_longitude numeric
);

CREATE TABLE service_tags (
  tag_id uuid NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  service_id uuid NOT NULL
);

CREATE TABLE service_view_logs (
  user_agent text,
  service_id uuid NOT NULL,
  user_id uuid,
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  ip_address inet
);

CREATE TABLE service_views (
  user_id uuid NOT NULL,
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  viewed_at timestamp with time zone DEFAULT now(),
  service_id uuid NOT NULL
);

CREATE TABLE services (
  location_latitude numeric,
  express_delivery boolean DEFAULT false,
  express_price integer,
  express_days integer,
  description text NOT NULL,
  requirements text,
  price_unit text DEFAULT 'project'::text,
  orders_count integer DEFAULT 0,
  thumbnail_url text,
  portfolio_urls _text,
  video_url text,
  in_progress_orders integer DEFAULT 0,
  status text DEFAULT 'pending'::text,
  completed_orders integer DEFAULT 0,
  rating numeric DEFAULT 0.00,
  review_count integer DEFAULT 0,
  is_featured boolean DEFAULT false,
  featured_until timestamp with time zone,
  version integer DEFAULT 1,
  meta_title text,
  meta_description text,
  last_modified_by uuid,
  deleted_at timestamp with time zone,
  search_keywords text,
  delivery_method character varying(20) DEFAULT 'online'::character varying,
  location_address text,
  created_at timestamp with time zone DEFAULT now(),
  location_region text,
  updated_at timestamp with time zone DEFAULT now(),
  wishlist_count integer NOT NULL DEFAULT 0,
  has_packages boolean DEFAULT false,
  location_longitude numeric,
  views integer DEFAULT 0,
  clicks integer DEFAULT 0,
  revision_count integer DEFAULT 1,
  delivery_days integer NOT NULL,
  price integer NOT NULL DEFAULT 0,
  seller_id uuid NOT NULL,
  title text NOT NULL,
  slug text NOT NULL,
  id uuid NOT NULL DEFAULT gen_random_uuid()
);

CREATE TABLE settlement_details (
  created_at timestamp with time zone DEFAULT now(),
  seller_amount integer NOT NULL,
  description text,
  commission_amount integer NOT NULL,
  order_amount integer NOT NULL,
  type text DEFAULT 'order'::text,
  order_id uuid NOT NULL,
  settlement_id uuid NOT NULL,
  id uuid NOT NULL DEFAULT gen_random_uuid()
);

CREATE TABLE settlements (
  seller_id uuid NOT NULL,
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  status text DEFAULT 'pending'::text,
  total_sales bigint DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  paid_at timestamp with time zone,
  bank_name text,
  total_refunds bigint DEFAULT 0,
  bank_account text,
  payment_proof text,
  end_date date NOT NULL,
  confirmed_at timestamp with time zone,
  settlement_amount bigint NOT NULL,
  start_date date NOT NULL,
  account_holder text,
  updated_at timestamp with time zone DEFAULT now(),
  settlement_date date NOT NULL,
  adjustments bigint DEFAULT 0,
  total_commission bigint DEFAULT 0
);

CREATE TABLE tags (
  name text NOT NULL,
  slug text NOT NULL,
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  usage_count integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE tax_invoices (
  buyer_ceo_name character varying(50) NOT NULL,
  item_unit_price integer,
  created_at timestamp with time zone DEFAULT now(),
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  remarks text,
  supply_amount integer NOT NULL,
  item_spec character varying(100),
  item_name character varying(200) NOT NULL,
  buyer_address text NOT NULL,
  updated_at timestamp with time zone DEFAULT now(),
  buyer_business_type character varying(50),
  supplier_company_name character varying(100) NOT NULL,
  supplier_ceo_name character varying(50) NOT NULL,
  supplier_address text NOT NULL,
  supplier_business_type character varying(50),
  supplier_business_item character varying(50),
  buyer_business_number character varying(20) NOT NULL,
  buyer_company_name character varying(100) NOT NULL,
  invoice_number character varying(50) NOT NULL,
  buyer_business_item character varying(50),
  total_amount integer NOT NULL,
  issue_date date NOT NULL,
  subscription_id uuid,
  item_quantity numeric DEFAULT 1,
  buyer_email character varying(100),
  tax_amount integer NOT NULL,
  issue_type character varying(20) DEFAULT 'regular'::character varying,
  status character varying(20) DEFAULT 'issued'::character varying,
  supplier_business_number character varying(20) NOT NULL,
  payment_id uuid
);

CREATE TABLE user_wallets (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  user_id uuid NOT NULL,
  balance integer DEFAULT 0,
  total_charged integer DEFAULT 0,
  total_used integer DEFAULT 0
);

CREATE TABLE users (
  id uuid NOT NULL,
  user_type character varying(50) DEFAULT 'buyer'::character varying,
  email_verified boolean DEFAULT false,
  phone_verified boolean DEFAULT false,
  is_active boolean DEFAULT true,
  last_login_at timestamp with time zone,
  deleted_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  is_verified boolean DEFAULT false,
  verified_at timestamp with time zone,
  birth_date date,
  bio text,
  gender text,
  profile_image text,
  phone text,
  name text NOT NULL,
  email text NOT NULL,
  real_name text,
  verification_ci text
);

CREATE TABLE visitor_stats_daily (
  mobile_views integer NOT NULL DEFAULT 0,
  tablet_views integer NOT NULL DEFAULT 0,
  bot_views integer NOT NULL DEFAULT 0,
  desktop_views integer NOT NULL DEFAULT 0,
  unique_visitors integer NOT NULL DEFAULT 0,
  total_views integer NOT NULL DEFAULT 0,
  date date NOT NULL,
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  path text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  avg_session_duration integer,
  bounce_rate numeric
);

CREATE TABLE visitor_stats_hourly (
  bot_views integer NOT NULL DEFAULT 0,
  path text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  tablet_views integer NOT NULL DEFAULT 0,
  mobile_views integer NOT NULL DEFAULT 0,
  desktop_views integer NOT NULL DEFAULT 0,
  unique_visitors integer NOT NULL DEFAULT 0,
  total_views integer NOT NULL DEFAULT 0,
  hour timestamp with time zone NOT NULL,
  id uuid NOT NULL DEFAULT gen_random_uuid()
);

CREATE TABLE visitor_stats_monthly (
  year integer NOT NULL,
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  avg_session_duration integer,
  bounce_rate numeric,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  path text NOT NULL,
  bot_views integer NOT NULL DEFAULT 0,
  tablet_views integer NOT NULL DEFAULT 0,
  mobile_views integer NOT NULL DEFAULT 0,
  desktop_views integer NOT NULL DEFAULT 0,
  unique_visitors integer NOT NULL DEFAULT 0,
  total_views integer NOT NULL DEFAULT 0,
  month integer NOT NULL
);

CREATE TABLE wallet_transactions (
  type text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  wallet_id uuid NOT NULL,
  user_id uuid NOT NULL,
  amount integer NOT NULL,
  description text NOT NULL,
  balance_after integer NOT NULL,
  order_id uuid,
  payment_id uuid
);

CREATE TABLE withdrawal_requests (
  updated_at timestamp with time zone DEFAULT now(),
  rejected_reason text,
  status text DEFAULT 'pending'::text,
  account_holder text NOT NULL,
  completed_at timestamp with time zone,
  rejection_reason text,
  created_at timestamp with time zone DEFAULT now(),
  requested_at timestamp with time zone DEFAULT now(),
  processed_at timestamp with time zone,
  processed_by uuid,
  amount integer NOT NULL,
  seller_id uuid NOT NULL,
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  account_number text NOT NULL,
  bank_name text NOT NULL
);