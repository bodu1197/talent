-- ============================================
-- Supabase Schema Export
-- Generated: 2025-11-12T03:49:40.653Z
-- Project: bpvfkkrlyrjkwgwmfrci.supabase.co
-- ============================================

-- ============================================
-- Tables (48 total)
-- ============================================

-- ============================================
-- Table: activity_logs
-- Records: 0
-- ============================================

CREATE TABLE IF NOT EXISTS activity_logs (
  -- No data available to infer schema
);

-- ============================================
-- Table: admins
-- Records: 1
-- ============================================

CREATE TABLE IF NOT EXISTS admins (
  id uuid,
  user_id uuid,
  role text,
  permissions jsonb,
  department text,
  notes text,
  last_action_at text,
  created_at timestamp with time zone,
  updated_at timestamp with time zone
);

-- Sample data:
-- {
--   "id": "a2674414-a5c4-451e-abbf-879c14506b05",
--   "user_id": "ccf26cba-d1d5-4aae-b5d9-0fe85449f086",
--   "role": "super_admin",
--   "permissions": {},
--   "department": "IT",
--   "notes": "시스템 최고 관리자",
--   "last_action_at": null,
--   "created_at": "2025-10-26T06:38:35.048899+00:00",
--   "updated_at": "2025-10-26T06:38:35.048899+00:00"
-- }

-- ============================================
-- Table: advertising_campaigns
-- Records: 0
-- ============================================

CREATE TABLE IF NOT EXISTS advertising_campaigns (
  -- No data available to infer schema
);

-- ============================================
-- Table: buyers
-- Records: 3
-- ============================================

CREATE TABLE IF NOT EXISTS buyers (
  id uuid,
  user_id uuid,
  total_orders integer,
  total_spent integer,
  points integer,
  coupon_count integer,
  last_order_at text,
  is_active boolean,
  created_at timestamp with time zone,
  updated_at timestamp with time zone
);

-- Sample data:
-- {
--   "id": "6f4b6489-7215-493a-9b36-b1b0bebab650",
--   "user_id": "ccf26cba-d1d5-4aae-b5d9-0fe85449f086",
--   "total_orders": 0,
--   "total_spent": 0,
--   "points": 0,
--   "coupon_count": 0,
--   "last_order_at": null,
--   "is_active": true,
--   "created_at": "2025-10-26T06:22:27.342409+00:00",
--   "updated_at": "2025-10-27T01:31:38.478159+00:00"
-- }

-- ============================================
-- Table: categories
-- Records: 582
-- ============================================

CREATE TABLE IF NOT EXISTS categories (
  id uuid,
  name text,
  slug text,
  parent_id text,
  level integer,
  icon text,
  description text,
  meta_title text,
  meta_description text,
  keywords text,
  display_order integer,
  service_count integer,
  is_ai_category boolean,
  is_featured boolean,
  commission_rate integer,
  is_active boolean,
  created_at timestamp with time zone,
  updated_at timestamp with time zone,
  popularity_score integer,
  is_ai boolean
);

-- Sample data:
-- {
--   "id": "1bc1fd04-678b-4572-ae0a-950d39bede68",
--   "name": "AI 디자인",
--   "slug": "ai-design",
--   "parent_id": "ai-services",
--   "level": 2,
--   "icon": "palette",
--   "description": "AI 기반 디자인 서비스",
--   "meta_title": null,
--   "meta_description": null,
--   "keywords": null,
--   "display_order": 1,
--   "service_count": 0,
--   "is_ai_category": false,
--   "is_featured": false,
--   "commission_rate": 20,
--   "is_active": true,
--   "created_at": "2025-11-04T18:24:31.443618+00:00",
--   "updated_at": "2025-11-04T18:24:31.443618+00:00",
--   "popularity_score": 0,
--   "is_ai": true
-- }

-- ============================================
-- Table: category_visits
-- Records: 67
-- ============================================

CREATE TABLE IF NOT EXISTS category_visits (
  id uuid,
  user_id uuid,
  category_id text,
  category_name text,
  category_slug text,
  visited_at timestamp with time zone,
  visited_date text
);

-- Sample data:
-- {
--   "id": "cffa2ea4-b2d2-4667-94d6-5925042e2b8b",
--   "user_id": "ccf26cba-d1d5-4aae-b5d9-0fe85449f086",
--   "category_id": "marketing",
--   "category_name": "마케팅",
--   "category_slug": "marketing",
--   "visited_at": "2025-11-07T16:25:00.243+00:00",
--   "visited_date": null
-- }

-- ============================================
-- Table: chat_favorites
-- Records: 2
-- ============================================

CREATE TABLE IF NOT EXISTS chat_favorites (
  id uuid,
  user_id uuid,
  room_id uuid,
  created_at timestamp with time zone
);

-- Sample data:
-- {
--   "id": "bbc2bce7-2e60-417a-a8e0-37d559ae042d",
--   "user_id": "ccf26cba-d1d5-4aae-b5d9-0fe85449f086",
--   "room_id": "af4fff4e-82cd-47a7-be77-3685c3e839a8",
--   "created_at": "2025-11-10T06:57:33.901088+00:00"
-- }

-- ============================================
-- Table: chat_messages
-- Records: 54
-- ============================================

CREATE TABLE IF NOT EXISTS chat_messages (
  id uuid,
  room_id uuid,
  sender_id uuid,
  message text,
  is_read boolean,
  created_at timestamp with time zone,
  updated_at timestamp with time zone,
  file_url text,
  file_name text,
  file_size text,
  file_type text
);

-- Sample data:
-- {
--   "id": "7ab8516f-4627-4845-8013-04d4e76bff03",
--   "room_id": "41713177-6e5a-4f79-998e-b5f8d04b2827",
--   "sender_id": "ff325090-d5b9-4678-a545-f3ecaddb2718",
--   "message": "ㅇㅇㅇㅇㅇ",
--   "is_read": true,
--   "created_at": "2025-11-07T06:20:52.49125+00:00",
--   "updated_at": "2025-11-07T06:20:52.49125+00:00",
--   "file_url": null,
--   "file_name": null,
--   "file_size": null,
--   "file_type": null
-- }

-- ============================================
-- Table: chat_rooms
-- Records: 4
-- ============================================

CREATE TABLE IF NOT EXISTS chat_rooms (
  id uuid,
  user1_id uuid,
  user2_id uuid,
  service_id uuid,
  last_message_at timestamp with time zone,
  created_at timestamp with time zone,
  updated_at timestamp with time zone
);

-- Sample data:
-- {
--   "id": "af4fff4e-82cd-47a7-be77-3685c3e839a8",
--   "user1_id": "ccf26cba-d1d5-4aae-b5d9-0fe85449f086",
--   "user2_id": "ff325090-d5b9-4678-a545-f3ecaddb2718",
--   "service_id": "94799fe1-850a-4755-80f8-f7d720e0f373",
--   "last_message_at": "2025-11-10T07:57:47.402687+00:00",
--   "created_at": "2025-11-10T06:01:45.566139+00:00",
--   "updated_at": "2025-11-10T07:57:47.402687+00:00"
-- }

-- ============================================
-- Table: conversations
-- Records: 0
-- ============================================

CREATE TABLE IF NOT EXISTS conversations (
  -- No data available to infer schema
);

-- ============================================
-- Table: coupons
-- Records: 2
-- ============================================

CREATE TABLE IF NOT EXISTS coupons (
  id uuid,
  code text,
  name text,
  description text,
  discount_type text,
  discount_value integer,
  max_discount text,
  min_amount integer,
  applicable_categories text,
  applicable_services text,
  total_quantity text,
  issued_quantity integer,
  max_per_user integer,
  starts_at timestamp with time zone,
  expires_at timestamp with time zone,
  is_active boolean,
  created_at timestamp with time zone,
  updated_at timestamp with time zone
);

-- Sample data:
-- {
--   "id": "52da3f95-7e86-43c1-b718-15c72850d985",
--   "code": "WELCOME5000",
--   "name": "신규 가입 축하 쿠폰",
--   "description": "5,000원 할인 쿠폰",
--   "discount_type": "fixed",
--   "discount_value": 5000,
--   "max_discount": null,
--   "min_amount": 30000,
--   "applicable_categories": null,
--   "applicable_services": null,
--   "total_quantity": null,
--   "issued_quantity": 0,
--   "max_per_user": 1,
--   "starts_at": "2025-10-28T06:05:45.946631+00:00",
--   "expires_at": "2026-01-28T06:05:45.946631+00:00",
--   "is_active": true,
--   "created_at": "2025-10-28T06:05:45.946631+00:00",
--   "updated_at": "2025-10-28T06:05:45.946631+00:00"
-- }

-- ============================================
-- Table: disputes
-- Records: 0
-- ============================================

CREATE TABLE IF NOT EXISTS disputes (
  -- No data available to infer schema
);

-- ============================================
-- Table: earnings_transactions
-- Records: 0
-- ============================================

CREATE TABLE IF NOT EXISTS earnings_transactions (
  -- No data available to infer schema
);

-- ============================================
-- Table: favorites
-- Records: 0
-- ============================================

CREATE TABLE IF NOT EXISTS favorites (
  -- No data available to infer schema
);

-- ============================================
-- Table: messages
-- Records: 0
-- ============================================

CREATE TABLE IF NOT EXISTS messages (
  -- No data available to infer schema
);

-- ============================================
-- Table: notifications
-- Records: 0
-- ============================================

CREATE TABLE IF NOT EXISTS notifications (
  -- No data available to infer schema
);

-- ============================================
-- Table: orders
-- Records: 5
-- ============================================

CREATE TABLE IF NOT EXISTS orders (
  id uuid,
  order_number text,
  buyer_id uuid,
  seller_id uuid,
  service_id uuid,
  requirements text,
  attachments text,
  base_amount integer,
  express_amount integer,
  additional_amount integer,
  discount_amount integer,
  total_amount integer,
  commission_rate integer,
  commission_fee integer,
  seller_amount integer,
  delivery_date timestamp with time zone,
  used_revisions integer,
  status text,
  payment_status text,
  work_status text,
  delivered_at text,
  completed_at text,
  cancellation_reason text,
  auto_complete_at text,
  buyer_satisfied text,
  seller_rating text,
  created_at timestamp with time zone,
  updated_at timestamp with time zone,
  review_id text,
  payment_id text,
  merchant_uid text,
  payment_request_id text,
  delivery_days integer,
  revision_count integer,
  revisions_used integer,
  title text,
  description text,
  paid_at timestamp with time zone,
  started_at timestamp with time zone,
  cancelled_at text,
  amount integer,
  revision_reason text,
  revision_requested_at text
);

-- Sample data:
-- {
--   "id": "e8d4d57c-002c-48dd-9aad-a268958809f3",
--   "order_number": "ORD-20251109-000010",
--   "buyer_id": "ff325090-d5b9-4678-a545-f3ecaddb2718",
--   "seller_id": "ccf26cba-d1d5-4aae-b5d9-0fe85449f086",
--   "service_id": "6e7a8d72-ffa6-4816-a7fd-3a546594907d",
--   "requirements": null,
--   "attachments": null,
--   "base_amount": 380000,
--   "express_amount": 0,
--   "additional_amount": 0,
--   "discount_amount": 0,
--   "total_amount": 380000,
--   "commission_rate": 0,
--   "commission_fee": 0,
--   "seller_amount": 380000,
--   "delivery_date": "2025-11-16",
--   "used_revisions": 0,
--   "status": "paid",
--   "payment_status": "paid",
--   "work_status": "waiting",
--   "delivered_at": null,
--   "completed_at": null,
--   "cancellation_reason": null,
--   "auto_complete_at": null,
--   "buyer_satisfied": null,
--   "seller_rating": null,
--   "created_at": "2025-11-09T07:44:07.019722+00:00",
--   "updated_at": "2025-11-09T07:45:02.419219+00:00",
--   "review_id": null,
--   "payment_id": null,
--   "merchant_uid": "order_1762674246954_hpqfv37",
--   "payment_request_id": null,
--   "delivery_days": 7,
--   "revision_count": 999,
--   "revisions_used": 0,
--   "title": "빠른 답변, 정직한 조언, 확실한 결과물을 약속드립니다",
--   "description": "빠른 답변, 정직한 조언, 확실한 결과물을 약속드립니다",
--   "paid_at": "2025-11-09T07:45:02.339+00:00",
--   "started_at": "2025-11-09T07:45:02.339+00:00",
--   "cancelled_at": null,
--   "amount": 380000,
--   "revision_reason": null,
--   "revision_requested_at": null
-- }

-- ============================================
-- Table: payment_requests
-- Records: 0
-- ============================================

CREATE TABLE IF NOT EXISTS payment_requests (
  -- No data available to infer schema
);

-- ============================================
-- Table: payments
-- Records: 0
-- ============================================

CREATE TABLE IF NOT EXISTS payments (
  -- No data available to infer schema
);

-- ============================================
-- Table: portfolio_items
-- Records: 0
-- ============================================

CREATE TABLE IF NOT EXISTS portfolio_items (
  -- No data available to infer schema
);

-- ============================================
-- Table: portfolio_services
-- Records: 6
-- ============================================

CREATE TABLE IF NOT EXISTS portfolio_services (
  id uuid,
  portfolio_id uuid,
  service_id uuid,
  created_at timestamp with time zone
);

-- Sample data:
-- {
--   "id": "18973a23-1dc6-413d-a27a-73158caefc0e",
--   "portfolio_id": "88f4ddbf-2456-4f5d-b437-8fa9e79d460f",
--   "service_id": "53eb9742-f04a-4b2b-bc3c-68447414a3af",
--   "created_at": "2025-11-07T03:49:33.511336+00:00"
-- }

-- ============================================
-- Table: premium_placements
-- Records: 0
-- ============================================

CREATE TABLE IF NOT EXISTS premium_placements (
  -- No data available to infer schema
);

-- ============================================
-- Table: quote_responses
-- Records: 0
-- ============================================

CREATE TABLE IF NOT EXISTS quote_responses (
  -- No data available to infer schema
);

-- ============================================
-- Table: quotes
-- Records: 0
-- ============================================

CREATE TABLE IF NOT EXISTS quotes (
  -- No data available to infer schema
);

-- ============================================
-- Table: refunds
-- Records: 0
-- ============================================

CREATE TABLE IF NOT EXISTS refunds (
  -- No data available to infer schema
);

-- ============================================
-- Table: reports
-- Records: 0
-- ============================================

CREATE TABLE IF NOT EXISTS reports (
  -- No data available to infer schema
);

-- ============================================
-- Table: reviews
-- Records: 1
-- ============================================

CREATE TABLE IF NOT EXISTS reviews (
  id uuid,
  order_id uuid,
  buyer_id uuid,
  seller_id uuid,
  service_id uuid,
  rating integer,
  communication_rating text,
  quality_rating text,
  delivery_rating text,
  comment text,
  tags text,
  images text,
  seller_reply text,
  seller_reply_at text,
  helpful_count integer,
  not_helpful_count integer,
  is_visible boolean,
  is_featured boolean,
  moderated boolean,
  moderation_reason text,
  created_at timestamp with time zone,
  updated_at timestamp with time zone
);

-- Sample data:
-- {
--   "id": "6dbe724f-6b94-471d-b821-e4c5f14e099a",
--   "order_id": "0a3dc2c2-ee98-4d40-9b23-875386f95e68",
--   "buyer_id": "ff325090-d5b9-4678-a545-f3ecaddb2718",
--   "seller_id": "ccf26cba-d1d5-4aae-b5d9-0fe85449f086",
--   "service_id": "6e7a8d72-ffa6-4816-a7fd-3a546594907d",
--   "rating": 5,
--   "communication_rating": null,
--   "quality_rating": null,
--   "delivery_rating": null,
--   "comment": "ㅜㅜㅜㅜㅜㅜㅜㅜㅜ",
--   "tags": null,
--   "images": null,
--   "seller_reply": null,
--   "seller_reply_at": null,
--   "helpful_count": 0,
--   "not_helpful_count": 0,
--   "is_visible": true,
--   "is_featured": false,
--   "moderated": false,
--   "moderation_reason": null,
--   "created_at": "2025-11-10T10:16:43.321822+00:00",
--   "updated_at": "2025-11-10T10:16:43.321822+00:00"
-- }

-- ============================================
-- Table: schema_migrations
-- Records: 5
-- ============================================

CREATE TABLE IF NOT EXISTS schema_migrations (
  version text,
  executed_at timestamp with time zone
);

-- Sample data:
-- {
--   "version": "001_initial_schema",
--   "executed_at": "2025-10-26T04:19:39.305128+00:00"
-- }

-- ============================================
-- Table: search_logs
-- Records: 0
-- ============================================

CREATE TABLE IF NOT EXISTS search_logs (
  -- No data available to infer schema
);

-- ============================================
-- Table: seller_earnings
-- Records: 1
-- ============================================

CREATE TABLE IF NOT EXISTS seller_earnings (
  id uuid,
  seller_id uuid,
  available_balance integer,
  pending_balance integer,
  total_withdrawn integer,
  total_earned integer,
  created_at timestamp with time zone,
  updated_at timestamp with time zone
);

-- Sample data:
-- {
--   "id": "9c31a40a-7075-4ecf-b698-1dd075fb5121",
--   "seller_id": "ccf26cba-d1d5-4aae-b5d9-0fe85449f086",
--   "available_balance": 0,
--   "pending_balance": 0,
--   "total_withdrawn": 0,
--   "total_earned": 0,
--   "created_at": "2025-11-07T09:20:42.24344+00:00",
--   "updated_at": "2025-11-07T09:20:42.24344+00:00"
-- }

-- ============================================
-- Table: seller_portfolio
-- Records: 2
-- ============================================

CREATE TABLE IF NOT EXISTS seller_portfolio (
  id uuid,
  seller_id uuid,
  title text,
  description text,
  category_id uuid,
  thumbnail_url text,
  image_urls jsonb,
  project_url text,
  tags jsonb,
  view_count integer,
  created_at timestamp with time zone,
  updated_at timestamp with time zone,
  youtube_url text,
  service_id text
);

-- Sample data:
-- {
--   "id": "88f4ddbf-2456-4f5d-b437-8fa9e79d460f",
--   "seller_id": "60d6e3d2-37b1-4ca7-8604-0aa1a7a5b98d",
--   "title": "ddddddddd",
--   "description": "ddddddddd",
--   "category_id": "1bc1fd04-678b-4572-ae0a-950d39bede68",
--   "thumbnail_url": "https://bpvfkkrlyrjkwgwmfrci.supabase.co/storage/v1/object/public/portfolio/portfolio/1762425891979_absssahwzz.webp",
--   "image_urls": [
--     "https://bpvfkkrlyrjkwgwmfrci.supabase.co/storage/v1/object/public/portfolio/portfolio/1762425892950_hwm6ge9gtnr.png"
--   ],
--   "project_url": null,
--   "tags": [],
--   "view_count": 0,
--   "created_at": "2025-11-06T10:44:55.994775+00:00",
--   "updated_at": "2025-11-07T03:49:33.144+00:00",
--   "youtube_url": null,
--   "service_id": null
-- }

-- ============================================
-- Table: sellers
-- Records: 1
-- ============================================

CREATE TABLE IF NOT EXISTS sellers (
  id uuid,
  user_id uuid,
  business_name text,
  business_number text,
  business_registration_file text,
  bank_name text,
  account_number text,
  account_holder text,
  is_verified boolean,
  verification_status text,
  verified_at text,
  rejection_reason text,
  total_sales integer,
  total_revenue integer,
  service_count integer,
  rating integer,
  review_count integer,
  last_sale_at text,
  is_active boolean,
  created_at timestamp with time zone,
  updated_at timestamp with time zone,
  display_name text,
  profile_image text,
  bio text,
  phone text,
  show_phone boolean,
  kakao_id text,
  kakao_openchat text,
  whatsapp text,
  website text,
  preferred_contact jsonb,
  certificates text,
  experience text,
  is_business boolean,
  status text,
  real_name text,
  contact_hours text,
  tax_invoice_available boolean
);

-- Sample data:
-- {
--   "id": "60d6e3d2-37b1-4ca7-8604-0aa1a7a5b98d",
--   "user_id": "ccf26cba-d1d5-4aae-b5d9-0fe85449f086",
--   "business_name": null,
--   "business_number": "000000000000000",
--   "business_registration_file": null,
--   "bank_name": "KB국민은행",
--   "account_number": "1111111111",
--   "account_holder": "ghdrlfed",
--   "is_verified": false,
--   "verification_status": "pending",
--   "verified_at": null,
--   "rejection_reason": null,
--   "total_sales": 0,
--   "total_revenue": 0,
--   "service_count": 0,
--   "rating": 0,
--   "review_count": 0,
--   "last_sale_at": null,
--   "is_active": true,
--   "created_at": "2025-10-30T14:04:33.92675+00:00",
--   "updated_at": "2025-11-06T03:40:10.954999+00:00",
--   "display_name": "180도 ",
--   "profile_image": "https://bpvfkkrlyrjkwgwmfrci.supabase.co/storage/v1/object/public/profiles/seller-profiles/ccf26cba-d1d5-4aae-b5d9-0fe85449f086-profile.jpg",
--   "bio": "노련한 프로다 ",
--   "phone": "023-3444-4000",
--   "show_phone": false,
--   "kakao_id": null,
--   "kakao_openchat": null,
--   "whatsapp": null,
--   "website": null,
--   "preferred_contact": [],
--   "certificates": null,
--   "experience": null,
--   "is_business": true,
--   "status": "pending_review",
--   "real_name": null,
--   "contact_hours": "00:00-18:00",
--   "tax_invoice_available": true
-- }

-- ============================================
-- Table: service_categories
-- Records: 7
-- ============================================

CREATE TABLE IF NOT EXISTS service_categories (
  service_id uuid,
  category_id text,
  is_primary boolean,
  created_at timestamp with time zone
);

-- Sample data:
-- {
--   "service_id": "a8445fd7-7c7c-4710-98a8-b37e4b83d22b",
--   "category_id": "gnuboard",
--   "is_primary": false,
--   "created_at": "2025-11-03T02:21:31.639354+00:00"
-- }

-- ============================================
-- Table: service_favorites
-- Records: 4
-- ============================================

CREATE TABLE IF NOT EXISTS service_favorites (
  id uuid,
  user_id uuid,
  service_id uuid,
  created_at timestamp with time zone
);

-- Sample data:
-- {
--   "id": "e18d2ea2-c74c-4fdb-97df-ce49c874b6c1",
--   "user_id": "ccf26cba-d1d5-4aae-b5d9-0fe85449f086",
--   "service_id": "a8445fd7-7c7c-4710-98a8-b37e4b83d22b",
--   "created_at": "2025-11-02T08:24:28.96485+00:00"
-- }

-- ============================================
-- Table: service_revision_categories
-- Records: 6
-- ============================================

CREATE TABLE IF NOT EXISTS service_revision_categories (
  id uuid,
  revision_id uuid,
  category_id text,
  created_at timestamp with time zone
);

-- Sample data:
-- {
--   "id": "969ce0e9-c83d-4826-ad88-5331dd148a83",
--   "revision_id": "8c209115-c1da-4585-9dc8-4a8c0d7598e5",
--   "category_id": "rhymix",
--   "created_at": "2025-11-02T05:27:36.781807+00:00"
-- }

-- ============================================
-- Table: service_revisions
-- Records: 6
-- ============================================

CREATE TABLE IF NOT EXISTS service_revisions (
  id uuid,
  service_id uuid,
  seller_id uuid,
  title text,
  description text,
  thumbnail_url text,
  price integer,
  status text,
  revision_note text,
  admin_note text,
  created_at timestamp with time zone,
  reviewed_at timestamp with time zone,
  reviewed_by uuid,
  delivery_days integer,
  revision_count integer
);

-- Sample data:
-- {
--   "id": "0eaf7a66-8398-4116-ae2d-4eb24d8399aa",
--   "service_id": "a8445fd7-7c7c-4710-98a8-b37e4b83d22b",
--   "seller_id": "60d6e3d2-37b1-4ca7-8604-0aa1a7a5b98d",
--   "title": "어떤 플랫폼이라도 개발 합니다",
--   "description": "ㅎㅎㅎㅎㅎㅎㅎㅎㅎㅎㅎㅎㅎㅎㅎㅎㅎㅎㅎㅎㅎㅎㅎㅎㅎㅎㅎㅎㅎㅎㅎㅎㅎㅎㅎㅎㅎㅎㅎㅎㅎㅎㅎㅎㅎㅎㅎㅎㅎㅎㅎ",
--   "thumbnail_url": "https://bpvfkkrlyrjkwgwmfrci.supabase.co/storage/v1/object/public/services/service-thumbnails/ccf26cba-d1d5-4aae-b5d9-0fe85449f086-1762136449181.webp",
--   "price": 100000,
--   "status": "approved",
--   "revision_note": "서비스 정보 수정",
--   "admin_note": null,
--   "created_at": "2025-11-03T02:20:50.046779+00:00",
--   "reviewed_at": "2025-11-03T02:21:31.639354+00:00",
--   "reviewed_by": "ccf26cba-d1d5-4aae-b5d9-0fe85449f086",
--   "delivery_days": 44,
--   "revision_count": 0
-- }

-- ============================================
-- Table: service_tags
-- Records: 0
-- ============================================

CREATE TABLE IF NOT EXISTS service_tags (
  -- No data available to infer schema
);

-- ============================================
-- Table: service_view_logs
-- Records: 0
-- ============================================

CREATE TABLE IF NOT EXISTS service_view_logs (
  -- No data available to infer schema
);

-- ============================================
-- Table: service_views
-- Records: 13
-- ============================================

CREATE TABLE IF NOT EXISTS service_views (
  id uuid,
  user_id uuid,
  service_id uuid,
  viewed_at timestamp with time zone
);

-- Sample data:
-- {
--   "id": "9fe6a4d0-257e-4282-9eab-1e780d97a5de",
--   "user_id": "ccf26cba-d1d5-4aae-b5d9-0fe85449f086",
--   "service_id": "f7f8fb66-2c50-40b2-967d-342bb8c13074",
--   "viewed_at": "2025-11-10T11:02:03.732+00:00"
-- }

-- ============================================
-- Table: services
-- Records: 8
-- ============================================

CREATE TABLE IF NOT EXISTS services (
  id uuid,
  seller_id uuid,
  title text,
  slug text,
  description text,
  requirements text,
  price integer,
  price_unit text,
  delivery_days integer,
  revision_count integer,
  express_delivery boolean,
  express_days text,
  express_price text,
  thumbnail_url text,
  portfolio_urls text,
  video_url text,
  views integer,
  clicks integer,
  orders_count integer,
  in_progress_orders integer,
  completed_orders integer,
  rating integer,
  review_count integer,
  status text,
  is_featured boolean,
  featured_until text,
  meta_title text,
  meta_description text,
  version integer,
  last_modified_by text,
  deleted_at text,
  created_at timestamp with time zone,
  updated_at timestamp with time zone,
  search_keywords text,
  wishlist_count integer
);

-- Sample data:
-- {
--   "id": "53eb9742-f04a-4b2b-bc3c-68447414a3af",
--   "seller_id": "60d6e3d2-37b1-4ca7-8604-0aa1a7a5b98d",
--   "title": "ssssssssssssss",
--   "slug": "ssssssssssssss",
--   "description": "ssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssss",
--   "requirements": null,
--   "price": 40000,
--   "price_unit": "project",
--   "delivery_days": 4,
--   "revision_count": 1,
--   "express_delivery": false,
--   "express_days": null,
--   "express_price": null,
--   "thumbnail_url": "https://bpvfkkrlyrjkwgwmfrci.supabase.co/storage/v1/object/public/services/services/1762485707717_8xud1zpemzx.jpg",
--   "portfolio_urls": null,
--   "video_url": null,
--   "views": 0,
--   "clicks": 0,
--   "orders_count": 0,
--   "in_progress_orders": 0,
--   "completed_orders": 0,
--   "rating": 0,
--   "review_count": 0,
--   "status": "active",
--   "is_featured": false,
--   "featured_until": null,
--   "meta_title": null,
--   "meta_description": null,
--   "version": 1,
--   "last_modified_by": null,
--   "deleted_at": null,
--   "created_at": "2025-11-07T03:21:47.784417+00:00",
--   "updated_at": "2025-11-07T03:53:05.415601+00:00",
--   "search_keywords": null,
--   "wishlist_count": 0
-- }

-- ============================================
-- Table: settlement_details
-- Records: 0
-- ============================================

CREATE TABLE IF NOT EXISTS settlement_details (
  -- No data available to infer schema
);

-- ============================================
-- Table: settlements
-- Records: 0
-- ============================================

CREATE TABLE IF NOT EXISTS settlements (
  -- No data available to infer schema
);

-- ============================================
-- Table: tags
-- Records: 0
-- ============================================

CREATE TABLE IF NOT EXISTS tags (
  -- No data available to infer schema
);

-- ============================================
-- Table: user_coupons
-- Records: 0
-- ============================================

CREATE TABLE IF NOT EXISTS user_coupons (
  -- No data available to infer schema
);

-- ============================================
-- Table: user_wallets
-- Records: 2
-- ============================================

CREATE TABLE IF NOT EXISTS user_wallets (
  id uuid,
  user_id uuid,
  balance integer,
  total_charged integer,
  total_used integer,
  created_at timestamp with time zone,
  updated_at timestamp with time zone
);

-- Sample data:
-- {
--   "id": "cc0e6f06-5feb-452b-bd87-e472b23335d3",
--   "user_id": "ccf26cba-d1d5-4aae-b5d9-0fe85449f086",
--   "balance": 0,
--   "total_charged": 0,
--   "total_used": 0,
--   "created_at": "2025-10-30T10:07:18.003072+00:00",
--   "updated_at": "2025-10-30T10:07:18.003072+00:00"
-- }

-- ============================================
-- Table: users
-- Records: 3
-- ============================================

CREATE TABLE IF NOT EXISTS users (
  id uuid,
  email text,
  name text,
  phone text,
  profile_image text,
  bio text,
  email_verified boolean,
  phone_verified boolean,
  is_active boolean,
  last_login_at text,
  deleted_at text,
  created_at timestamp with time zone,
  updated_at timestamp with time zone,
  user_type text
);

-- Sample data:
-- {
--   "id": "ff325090-d5b9-4678-a545-f3ecaddb2718",
--   "email": "body2402@naver.com",
--   "name": "choi ho chan",
--   "phone": "",
--   "profile_image": null,
--   "bio": null,
--   "email_verified": false,
--   "phone_verified": false,
--   "is_active": true,
--   "last_login_at": null,
--   "deleted_at": null,
--   "created_at": "2025-10-26T07:01:03.459722+00:00",
--   "updated_at": "2025-11-07T09:20:42.24344+00:00",
--   "user_type": "buyer"
-- }

-- ============================================
-- Table: wallet_transactions
-- Records: 0
-- ============================================

CREATE TABLE IF NOT EXISTS wallet_transactions (
  -- No data available to infer schema
);

-- ============================================
-- Table: withdrawal_requests
-- Records: 1
-- ============================================

CREATE TABLE IF NOT EXISTS withdrawal_requests (
  id uuid,
  seller_id uuid,
  amount integer,
  bank_name text,
  account_number text,
  account_holder text,
  status text,
  processed_by text,
  processed_at text,
  rejection_reason text,
  requested_at timestamp with time zone,
  created_at timestamp with time zone,
  updated_at timestamp with time zone,
  completed_at timestamp with time zone,
  rejected_reason text
);

-- Sample data:
-- {
--   "id": "ee563711-d467-4e87-b077-fe54307cba4a",
--   "seller_id": "60d6e3d2-37b1-4ca7-8604-0aa1a7a5b98d",
--   "amount": 380000,
--   "bank_name": "KB국민은행",
--   "account_number": "1111111111",
--   "account_holder": "ghdrlfed",
--   "status": "completed",
--   "processed_by": null,
--   "processed_at": null,
--   "rejection_reason": null,
--   "requested_at": "2025-11-10T23:13:27.742+00:00",
--   "created_at": "2025-11-10T23:13:27.833247+00:00",
--   "updated_at": "2025-11-10T23:40:32.450669+00:00",
--   "completed_at": "2025-11-10T23:40:32.336+00:00",
--   "rejected_reason": null
-- }

