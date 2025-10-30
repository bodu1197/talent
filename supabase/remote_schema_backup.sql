


SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE SCHEMA IF NOT EXISTS "public";


ALTER SCHEMA "public" OWNER TO "pg_database_owner";


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE OR REPLACE FUNCTION "public"."create_seller_earnings"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO ''
    AS $$
BEGIN
    IF NEW.user_type IN ('seller', 'both') THEN
        INSERT INTO public.seller_earnings (seller_id, available_balance, pending_balance, total_withdrawn, total_earned)
        VALUES (NEW.id, 0, 0, 0, 0)
        ON CONFLICT (seller_id) DO NOTHING;
    END IF;
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."create_seller_earnings"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."create_user_wallet"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO ''
    AS $$
BEGIN
    INSERT INTO public.user_wallets (user_id, balance)
    VALUES (NEW.id, 0)
    ON CONFLICT (user_id) DO NOTHING;
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."create_user_wallet"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."generate_order_number"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO ''
    AS $$
BEGIN
    NEW.order_number := 'ORD-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' ||
                       LPAD(NEXTVAL('public.order_number_seq')::TEXT, 6, '0');
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."generate_order_number"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."generate_service_slug"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO ''
    AS $$
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
$$;


ALTER FUNCTION "public"."generate_service_slug"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
    INSERT INTO public.users (id, email, name, phone, user_type, email_verified, is_active)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'name', '사용자'),
        COALESCE(NEW.raw_user_meta_data->>'phone', NULL),
        'buyer',  -- 기본값: 구매자
        false,
        true
    );
    RETURN NEW;
EXCEPTION
    WHEN unique_violation THEN
        -- 이미 존재하는 경우 무시
        RETURN NEW;
    WHEN OTHERS THEN
        -- 다른 에러는 로그만 남기고 계속 진행
        RAISE WARNING 'Failed to create user profile: %', SQLERRM;
        RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";


COMMENT ON FUNCTION "public"."handle_new_user"() IS '회원가입 시 자동으로 users 테이블에 프로필 생성 (SECURITY DEFINER로 RLS 우회)';



CREATE OR REPLACE FUNCTION "public"."is_admin"() RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO ''
    AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.admins
        WHERE user_id = auth.uid()
    );
END;
$$;


ALTER FUNCTION "public"."is_admin"() OWNER TO "postgres";


COMMENT ON FUNCTION "public"."is_admin"() IS 'Check if current user is an admin (search_path secured)';



CREATE OR REPLACE FUNCTION "public"."is_buyer"() RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO ''
    AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.users
        WHERE id = auth.uid()
        AND user_type IN ('buyer', 'both')
    );
END;
$$;


ALTER FUNCTION "public"."is_buyer"() OWNER TO "postgres";


COMMENT ON FUNCTION "public"."is_buyer"() IS 'Check if current user is a buyer (search_path secured)';



CREATE OR REPLACE FUNCTION "public"."is_buyer"("check_user_id" "uuid") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.buyers
        WHERE user_id = check_user_id AND is_active = true
    );
END;
$$;


ALTER FUNCTION "public"."is_buyer"("check_user_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."is_seller"() RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO ''
    AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.users
        WHERE id = auth.uid()
        AND user_type IN ('seller', 'both')
    );
END;
$$;


ALTER FUNCTION "public"."is_seller"() OWNER TO "postgres";


COMMENT ON FUNCTION "public"."is_seller"() IS 'Check if current user is a seller (search_path secured)';



CREATE OR REPLACE FUNCTION "public"."is_seller"("check_user_id" "uuid") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.sellers
        WHERE user_id = check_user_id AND is_active = true
    );
END;
$$;


ALTER FUNCTION "public"."is_seller"("check_user_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."is_verified_seller"("check_user_id" "uuid") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.sellers
        WHERE user_id = check_user_id
        AND is_active = true
        AND is_verified = true
    );
END;
$$;


ALTER FUNCTION "public"."is_verified_seller"("check_user_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."owns_service"("service_id" "uuid") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO ''
    AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.services
        WHERE id = service_id
        AND seller_id = auth.uid()
    );
END;
$$;


ALTER FUNCTION "public"."owns_service"("service_id" "uuid") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."owns_service"("service_id" "uuid") IS 'Check if current user owns the service (search_path secured)';



CREATE OR REPLACE FUNCTION "public"."update_coupon_issued_quantity"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO ''
    AS $$
BEGIN
    UPDATE public.coupons
    SET issued_quantity = issued_quantity + 1
    WHERE id = NEW.coupon_id;
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_coupon_issued_quantity"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_quote_response_count"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO ''
    AS $$
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
$$;


ALTER FUNCTION "public"."update_quote_response_count"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO ''
    AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_updated_at_column"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO ''
    AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_updated_at_column"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_users_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO ''
    AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_users_updated_at"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."activity_logs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid",
    "admin_id" "uuid",
    "action" "text" NOT NULL,
    "entity_type" "text",
    "entity_id" "uuid",
    "old_value" "jsonb",
    "new_value" "jsonb",
    "ip_address" "inet",
    "user_agent" "text",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."activity_logs" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."admins" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "role" "text" NOT NULL,
    "permissions" "jsonb" DEFAULT '{}'::"jsonb",
    "department" "text",
    "notes" "text",
    "last_action_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "admins_role_check" CHECK (("role" = ANY (ARRAY['super_admin'::"text", 'admin'::"text", 'moderator'::"text", 'cs_agent'::"text"])))
);


ALTER TABLE "public"."admins" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."advertising_campaigns" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "seller_id" "uuid" NOT NULL,
    "campaign_name" "text" NOT NULL,
    "campaign_type" "text" NOT NULL,
    "daily_budget" integer,
    "total_budget" integer,
    "spent_amount" integer DEFAULT 0,
    "target_categories" "uuid"[],
    "target_keywords" "text"[],
    "target_user_types" "text"[],
    "bid_type" "text" DEFAULT 'cpc'::"text",
    "bid_amount" integer NOT NULL,
    "start_date" timestamp with time zone NOT NULL,
    "end_date" timestamp with time zone NOT NULL,
    "status" "text" DEFAULT 'draft'::"text",
    "approval_status" "text" DEFAULT 'pending'::"text",
    "rejection_reason" "text",
    "impressions" integer DEFAULT 0,
    "clicks" integer DEFAULT 0,
    "conversions" integer DEFAULT 0,
    "ctr" numeric(5,2) DEFAULT 0.00,
    "conversion_rate" numeric(5,2) DEFAULT 0.00,
    "roi" numeric(10,2) DEFAULT 0.00,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "advertising_campaigns_approval_status_check" CHECK (("approval_status" = ANY (ARRAY['pending'::"text", 'approved'::"text", 'rejected'::"text"]))),
    CONSTRAINT "advertising_campaigns_bid_type_check" CHECK (("bid_type" = ANY (ARRAY['cpc'::"text", 'cpm'::"text", 'fixed'::"text"]))),
    CONSTRAINT "advertising_campaigns_campaign_type_check" CHECK (("campaign_type" = ANY (ARRAY['premium_placement'::"text", 'sponsored_search'::"text", 'banner'::"text"]))),
    CONSTRAINT "advertising_campaigns_status_check" CHECK (("status" = ANY (ARRAY['draft'::"text", 'pending'::"text", 'active'::"text", 'paused'::"text", 'completed'::"text", 'cancelled'::"text"])))
);


ALTER TABLE "public"."advertising_campaigns" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."ai_services" (
    "service_id" "uuid" NOT NULL,
    "ai_tool" character varying(255) NOT NULL,
    "version" character varying(50),
    "features" "text"[] DEFAULT '{}'::"text"[],
    "sample_prompts" "text"[] DEFAULT '{}'::"text"[],
    "created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    "updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE "public"."ai_services" OWNER TO "postgres";


COMMENT ON TABLE "public"."ai_services" IS 'AI service additional information';



COMMENT ON COLUMN "public"."ai_services"."ai_tool" IS 'AI tool name (e.g. ChatGPT, Midjourney)';



COMMENT ON COLUMN "public"."ai_services"."version" IS 'AI tool version';



COMMENT ON COLUMN "public"."ai_services"."features" IS 'AI service features list';



COMMENT ON COLUMN "public"."ai_services"."sample_prompts" IS 'Sample prompts list';



CREATE TABLE IF NOT EXISTS "public"."buyers" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "total_orders" integer DEFAULT 0,
    "total_spent" integer DEFAULT 0,
    "points" integer DEFAULT 0,
    "coupon_count" integer DEFAULT 0,
    "last_order_at" timestamp with time zone,
    "is_active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."buyers" OWNER TO "postgres";


COMMENT ON TABLE "public"."buyers" IS '구매자 활동 데이터 - 주문, 포인트, 쿠폰 등';



COMMENT ON COLUMN "public"."buyers"."user_id" IS 'users 테이블 참조 - 한 유저가 buyer와 seller 둘 다 될 수 있음';



CREATE TABLE IF NOT EXISTS "public"."categories" (
    "id" "text" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "slug" "text" NOT NULL,
    "parent_id" "text",
    "level" integer,
    "icon" "text",
    "description" "text",
    "meta_title" "text",
    "meta_description" "text",
    "keywords" "text"[],
    "display_order" integer DEFAULT 0,
    "service_count" integer DEFAULT 0,
    "is_ai_category" boolean DEFAULT false,
    "is_featured" boolean DEFAULT false,
    "commission_rate" numeric(5,2) DEFAULT 20.00,
    "is_active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "popularity_score" integer DEFAULT 0,
    CONSTRAINT "categories_level_check" CHECK (("level" = ANY (ARRAY[1, 2, 3])))
);


ALTER TABLE "public"."categories" OWNER TO "postgres";


COMMENT ON COLUMN "public"."categories"."level" IS 'Hierarchy depth level (0=top-level, 1=sub-category, etc.)';



COMMENT ON COLUMN "public"."categories"."keywords" IS 'Search keywords for this category';



COMMENT ON COLUMN "public"."categories"."service_count" IS 'Number of services in this category';



COMMENT ON COLUMN "public"."categories"."popularity_score" IS 'Popularity score for sorting (higher = more popular)';



CREATE TABLE IF NOT EXISTS "public"."category_visits" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "category_id" character varying(100) NOT NULL,
    "category_name" character varying(255) NOT NULL,
    "category_slug" character varying(255) NOT NULL,
    "visit_count" integer DEFAULT 1,
    "last_visited_at" timestamp with time zone DEFAULT "now"(),
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."category_visits" OWNER TO "postgres";


COMMENT ON TABLE "public"."category_visits" IS '사용자의 카테고리 방문 기록을 저장하는 테이블';



COMMENT ON COLUMN "public"."category_visits"."user_id" IS '사용자 ID (auth.users 테이블 참조)';



COMMENT ON COLUMN "public"."category_visits"."category_id" IS '카테고리 ID';



COMMENT ON COLUMN "public"."category_visits"."category_name" IS '카테고리 이름 (1차 카테고리)';



COMMENT ON COLUMN "public"."category_visits"."category_slug" IS '카테고리 슬러그 (URL용)';



COMMENT ON COLUMN "public"."category_visits"."visit_count" IS '방문 횟수';



COMMENT ON COLUMN "public"."category_visits"."last_visited_at" IS '마지막 방문 시간';



CREATE TABLE IF NOT EXISTS "public"."conversations" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "order_id" "uuid",
    "participant1_id" "uuid" NOT NULL,
    "participant2_id" "uuid" NOT NULL,
    "is_active" boolean DEFAULT true,
    "last_message_at" timestamp with time zone,
    "last_message_preview" "text",
    "participant1_last_read" timestamp with time zone,
    "participant2_last_read" timestamp with time zone,
    "participant1_unread_count" integer DEFAULT 0,
    "participant2_unread_count" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."conversations" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."coupons" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "code" "text" NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "discount_type" "text" NOT NULL,
    "discount_value" integer NOT NULL,
    "max_discount" integer,
    "min_amount" integer DEFAULT 0,
    "applicable_categories" "uuid"[],
    "applicable_services" "uuid"[],
    "total_quantity" integer,
    "issued_quantity" integer DEFAULT 0,
    "max_per_user" integer DEFAULT 1,
    "starts_at" timestamp with time zone NOT NULL,
    "expires_at" timestamp with time zone NOT NULL,
    "is_active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "coupons_discount_type_check" CHECK (("discount_type" = ANY (ARRAY['fixed'::"text", 'percent'::"text"]))),
    CONSTRAINT "coupons_discount_value_check" CHECK (("discount_value" > 0))
);


ALTER TABLE "public"."coupons" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."disputes" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "order_id" "uuid" NOT NULL,
    "initiated_by" "uuid" NOT NULL,
    "dispute_type" "text" NOT NULL,
    "reason" "text" NOT NULL,
    "requested_action" "text",
    "evidence_description" "text",
    "evidence_urls" "text"[],
    "status" "text" DEFAULT 'open'::"text",
    "resolution" "text",
    "resolution_details" "text",
    "mediator_id" "uuid",
    "mediation_notes" "text",
    "opened_at" timestamp with time zone DEFAULT "now"(),
    "mediation_started_at" timestamp with time zone,
    "resolved_at" timestamp with time zone,
    "closed_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "disputes_dispute_type_check" CHECK (("dispute_type" = ANY (ARRAY['quality'::"text", 'non_delivery'::"text", 'delay'::"text", 'communication'::"text"]))),
    CONSTRAINT "disputes_requested_action_check" CHECK (("requested_action" = ANY (ARRAY['refund'::"text", 'revision'::"text", 'compensation'::"text"]))),
    CONSTRAINT "disputes_resolution_check" CHECK (("resolution" = ANY (ARRAY['refund_full'::"text", 'refund_partial'::"text", 'revision'::"text", 'rejected'::"text"]))),
    CONSTRAINT "disputes_status_check" CHECK (("status" = ANY (ARRAY['open'::"text", 'in_mediation'::"text", 'resolved'::"text", 'closed'::"text"])))
);


ALTER TABLE "public"."disputes" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."earnings_transactions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "seller_id" "uuid" NOT NULL,
    "order_id" "uuid",
    "type" "text" NOT NULL,
    "amount" integer NOT NULL,
    "status" "text" NOT NULL,
    "description" "text",
    "order_number" "text",
    "transaction_date" timestamp with time zone DEFAULT "now"(),
    "completed_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "earnings_transactions_status_check" CHECK (("status" = ANY (ARRAY['pending'::"text", 'available'::"text", 'completed'::"text", 'cancelled'::"text"]))),
    CONSTRAINT "earnings_transactions_type_check" CHECK (("type" = ANY (ARRAY['sale'::"text", 'withdraw'::"text", 'refund'::"text", 'adjustment'::"text"])))
);


ALTER TABLE "public"."earnings_transactions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."favorites" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "service_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."favorites" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."messages" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "conversation_id" "uuid" NOT NULL,
    "sender_id" "uuid" NOT NULL,
    "message_type" "text" DEFAULT 'text'::"text",
    "content" "text",
    "attachments" "jsonb",
    "is_read" boolean DEFAULT false,
    "read_at" timestamp with time zone,
    "is_edited" boolean DEFAULT false,
    "edited_at" timestamp with time zone,
    "is_deleted" boolean DEFAULT false,
    "deleted_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "messages_message_type_check" CHECK (("message_type" = ANY (ARRAY['text'::"text", 'image'::"text", 'file'::"text", 'system'::"text"])))
);


ALTER TABLE "public"."messages" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."notifications" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "type" "text" NOT NULL,
    "title" "text" NOT NULL,
    "content" "text",
    "data" "jsonb",
    "link_url" "text",
    "is_read" boolean DEFAULT false,
    "read_at" timestamp with time zone,
    "is_pushed" boolean DEFAULT false,
    "pushed_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."notifications" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."order_number_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."order_number_seq" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."orders" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "order_number" "text" NOT NULL,
    "buyer_id" "uuid" NOT NULL,
    "seller_id" "uuid" NOT NULL,
    "service_id" "uuid" NOT NULL,
    "title" "text" NOT NULL,
    "description" "text",
    "requirements" "text",
    "attachments" "text"[],
    "base_amount" integer NOT NULL,
    "express_amount" integer DEFAULT 0,
    "additional_amount" integer DEFAULT 0,
    "discount_amount" integer DEFAULT 0,
    "total_amount" integer NOT NULL,
    "commission_rate" numeric(5,2) NOT NULL,
    "commission_fee" integer NOT NULL,
    "seller_amount" integer NOT NULL,
    "delivery_date" "date" NOT NULL,
    "revision_count" integer DEFAULT 1,
    "used_revisions" integer DEFAULT 0,
    "status" "text" DEFAULT 'pending_payment'::"text",
    "payment_status" "text" DEFAULT 'pending'::"text",
    "work_status" "text" DEFAULT 'waiting'::"text",
    "paid_at" timestamp with time zone,
    "started_at" timestamp with time zone,
    "delivered_at" timestamp with time zone,
    "completed_at" timestamp with time zone,
    "cancelled_at" timestamp with time zone,
    "cancellation_reason" "text",
    "auto_complete_at" timestamp with time zone,
    "buyer_satisfied" boolean,
    "seller_rating" integer,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "package_type" "text",
    CONSTRAINT "orders_package_type_check" CHECK (("package_type" = ANY (ARRAY['BASIC'::"text", 'STANDARD'::"text", 'PREMIUM'::"text"]))),
    CONSTRAINT "orders_payment_status_check" CHECK (("payment_status" = ANY (ARRAY['pending'::"text", 'paid'::"text", 'failed'::"text", 'refunded'::"text"]))),
    CONSTRAINT "orders_seller_rating_check" CHECK ((("seller_rating" >= 1) AND ("seller_rating" <= 5))),
    CONSTRAINT "orders_status_check" CHECK (("status" = ANY (ARRAY['pending_payment'::"text", 'paid'::"text", 'in_progress'::"text", 'delivered'::"text", 'revision_requested'::"text", 'completed'::"text", 'cancelled'::"text", 'refund_requested'::"text", 'refunded'::"text"]))),
    CONSTRAINT "orders_work_status_check" CHECK (("work_status" = ANY (ARRAY['waiting'::"text", 'working'::"text", 'delivered'::"text", 'accepted'::"text"])))
);


ALTER TABLE "public"."orders" OWNER TO "postgres";


COMMENT ON COLUMN "public"."orders"."package_type" IS 'Selected service package type when ordering';



CREATE TABLE IF NOT EXISTS "public"."payments" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "order_id" "uuid",
    "transaction_id" "text" NOT NULL,
    "payment_method" "text" NOT NULL,
    "pg_provider" "text" NOT NULL,
    "amount" integer NOT NULL,
    "vat" integer DEFAULT 0,
    "card_company" "text",
    "card_number_masked" "text",
    "installment_months" integer DEFAULT 0,
    "status" "text" DEFAULT 'pending'::"text",
    "pg_response" "jsonb",
    "approval_number" "text",
    "paid_at" timestamp with time zone,
    "failed_at" timestamp with time zone,
    "cancelled_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "payments_payment_method_check" CHECK (("payment_method" = ANY (ARRAY['card'::"text", 'bank_transfer'::"text", 'kakao_pay'::"text", 'naver_pay'::"text"]))),
    CONSTRAINT "payments_status_check" CHECK (("status" = ANY (ARRAY['pending'::"text", 'completed'::"text", 'failed'::"text", 'cancelled'::"text", 'refunded'::"text"])))
);


ALTER TABLE "public"."payments" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."portfolio_items" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "seller_id" "uuid" NOT NULL,
    "title" "text" NOT NULL,
    "description" "text",
    "thumbnail_url" "text",
    "images" "text"[],
    "view_count" integer DEFAULT 0,
    "is_visible" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."portfolio_items" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."premium_placements" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "campaign_id" "uuid",
    "service_id" "uuid" NOT NULL,
    "placement_type" "text" NOT NULL,
    "placement_slot" integer,
    "category_id" "text",
    "keywords" "text"[],
    "position_score" integer DEFAULT 0,
    "display_priority" integer DEFAULT 0,
    "start_date" timestamp with time zone NOT NULL,
    "end_date" timestamp with time zone NOT NULL,
    "daily_cost" integer,
    "total_cost" integer,
    "actual_cost" integer DEFAULT 0,
    "impressions" integer DEFAULT 0,
    "clicks" integer DEFAULT 0,
    "conversions" integer DEFAULT 0,
    "revenue_generated" bigint DEFAULT 0,
    "is_active" boolean DEFAULT true,
    "paused_at" timestamp with time zone,
    "paused_reason" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "premium_placements_placement_type_check" CHECK (("placement_type" = ANY (ARRAY['home_hero'::"text", 'home_top'::"text", 'category_top'::"text", 'search_top'::"text"])))
);


ALTER TABLE "public"."premium_placements" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."quote_responses" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "quote_id" "uuid" NOT NULL,
    "seller_id" "uuid" NOT NULL,
    "message" "text" NOT NULL,
    "proposed_price" integer NOT NULL,
    "delivery_days" integer NOT NULL,
    "attachments" "text"[],
    "status" "text" DEFAULT 'pending'::"text",
    "is_read" boolean DEFAULT false,
    "read_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "quote_responses_status_check" CHECK (("status" = ANY (ARRAY['pending'::"text", 'accepted'::"text", 'rejected'::"text"])))
);


ALTER TABLE "public"."quote_responses" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."quotes" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "buyer_id" "uuid" NOT NULL,
    "title" "text" NOT NULL,
    "category_id" "text",
    "description" "text" NOT NULL,
    "requirements" "text",
    "attachments" "text"[],
    "budget_min" integer,
    "budget_max" integer,
    "deadline" "date",
    "status" "text" DEFAULT 'pending'::"text",
    "response_count" integer DEFAULT 0,
    "view_count" integer DEFAULT 0,
    "selected_response_id" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "quotes_status_check" CHECK (("status" = ANY (ARRAY['pending'::"text", 'received'::"text", 'selected'::"text", 'cancelled'::"text"])))
);


ALTER TABLE "public"."quotes" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."refunds" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "order_id" "uuid" NOT NULL,
    "payment_id" "uuid" NOT NULL,
    "refund_amount" integer NOT NULL,
    "refund_reason" "text" NOT NULL,
    "refund_description" "text",
    "commission_refund" integer DEFAULT 0,
    "seller_penalty" integer DEFAULT 0,
    "status" "text" DEFAULT 'requested'::"text",
    "approval_status" "text" DEFAULT 'pending'::"text",
    "requested_by" "uuid",
    "approved_by" "uuid",
    "rejection_reason" "text",
    "pg_refund_id" "text",
    "pg_response" "jsonb",
    "requested_at" timestamp with time zone DEFAULT "now"(),
    "approved_at" timestamp with time zone,
    "completed_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "refunds_approval_status_check" CHECK (("approval_status" = ANY (ARRAY['pending'::"text", 'approved'::"text", 'rejected'::"text"]))),
    CONSTRAINT "refunds_status_check" CHECK (("status" = ANY (ARRAY['requested'::"text", 'approved'::"text", 'rejected'::"text", 'completed'::"text"])))
);


ALTER TABLE "public"."refunds" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."reports" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "reporter_id" "uuid" NOT NULL,
    "reported_user_id" "uuid",
    "reported_service_id" "uuid",
    "reported_order_id" "uuid",
    "reported_review_id" "uuid",
    "report_type" "text" NOT NULL,
    "report_reason" "text" NOT NULL,
    "description" "text",
    "evidence_urls" "text"[],
    "status" "text" DEFAULT 'pending'::"text",
    "severity" "text" DEFAULT 'low'::"text",
    "assigned_to" "uuid",
    "admin_notes" "text",
    "action_taken" "text",
    "assigned_at" timestamp with time zone,
    "resolved_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "reports_report_type_check" CHECK (("report_type" = ANY (ARRAY['spam'::"text", 'fraud'::"text", 'inappropriate_content'::"text", 'copyright'::"text", 'quality_issue'::"text", 'non_delivery'::"text"]))),
    CONSTRAINT "reports_severity_check" CHECK (("severity" = ANY (ARRAY['low'::"text", 'medium'::"text", 'high'::"text", 'critical'::"text"]))),
    CONSTRAINT "reports_status_check" CHECK (("status" = ANY (ARRAY['pending'::"text", 'reviewing'::"text", 'resolved'::"text", 'rejected'::"text"])))
);


ALTER TABLE "public"."reports" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."reviews" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "order_id" "uuid" NOT NULL,
    "buyer_id" "uuid" NOT NULL,
    "seller_id" "uuid" NOT NULL,
    "service_id" "uuid" NOT NULL,
    "rating" integer NOT NULL,
    "communication_rating" integer,
    "quality_rating" integer,
    "delivery_rating" integer,
    "comment" "text",
    "tags" "text"[],
    "images" "text"[],
    "seller_reply" "text",
    "seller_reply_at" timestamp with time zone,
    "helpful_count" integer DEFAULT 0,
    "not_helpful_count" integer DEFAULT 0,
    "is_visible" boolean DEFAULT true,
    "is_featured" boolean DEFAULT false,
    "moderated" boolean DEFAULT false,
    "moderation_reason" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "reviews_communication_rating_check" CHECK ((("communication_rating" >= 1) AND ("communication_rating" <= 5))),
    CONSTRAINT "reviews_delivery_rating_check" CHECK ((("delivery_rating" >= 1) AND ("delivery_rating" <= 5))),
    CONSTRAINT "reviews_quality_rating_check" CHECK ((("quality_rating" >= 1) AND ("quality_rating" <= 5))),
    CONSTRAINT "reviews_rating_check" CHECK ((("rating" >= 1) AND ("rating" <= 5)))
);


ALTER TABLE "public"."reviews" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."schema_migrations" (
    "version" "text" NOT NULL,
    "executed_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."schema_migrations" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."search_logs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid",
    "session_id" "text",
    "keyword" "text" NOT NULL,
    "category_id" "text",
    "filters" "jsonb",
    "result_count" integer,
    "clicked_service_ids" "uuid"[],
    "converted_service_id" "uuid",
    "search_duration_ms" integer,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."search_logs" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."seller_earnings" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "seller_id" "uuid" NOT NULL,
    "available_balance" integer DEFAULT 0,
    "pending_balance" integer DEFAULT 0,
    "total_withdrawn" integer DEFAULT 0,
    "total_earned" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "seller_earnings_available_balance_check" CHECK (("available_balance" >= 0)),
    CONSTRAINT "seller_earnings_pending_balance_check" CHECK (("pending_balance" >= 0)),
    CONSTRAINT "seller_earnings_total_earned_check" CHECK (("total_earned" >= 0)),
    CONSTRAINT "seller_earnings_total_withdrawn_check" CHECK (("total_withdrawn" >= 0))
);


ALTER TABLE "public"."seller_earnings" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."sellers" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "business_name" "text",
    "business_number" "text",
    "business_registration_file" "text",
    "bank_name" "text",
    "account_number" "text",
    "account_holder" "text",
    "is_verified" boolean DEFAULT false,
    "verification_status" "text" DEFAULT 'pending'::"text",
    "verified_at" timestamp with time zone,
    "rejection_reason" "text",
    "total_sales" integer DEFAULT 0,
    "total_revenue" integer DEFAULT 0,
    "service_count" integer DEFAULT 0,
    "rating" numeric(3,2) DEFAULT 0.0,
    "review_count" integer DEFAULT 0,
    "last_sale_at" timestamp with time zone,
    "is_active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "sellers_verification_status_check" CHECK (("verification_status" = ANY (ARRAY['pending'::"text", 'verified'::"text", 'rejected'::"text"])))
);


ALTER TABLE "public"."sellers" OWNER TO "postgres";


COMMENT ON TABLE "public"."sellers" IS '판매자 활동 데이터 - 비즈니스 정보, 인증, 정산 등';



COMMENT ON COLUMN "public"."sellers"."user_id" IS 'users 테이블 참조 - 한 유저가 buyer와 seller 둘 다 될 수 있음';



CREATE TABLE IF NOT EXISTS "public"."service_categories" (
    "service_id" "uuid" NOT NULL,
    "category_id" "text" NOT NULL,
    "is_primary" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."service_categories" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."service_packages" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "service_id" "uuid" NOT NULL,
    "package_type" "text" NOT NULL,
    "name" character varying(100) NOT NULL,
    "description" "text",
    "price" integer NOT NULL,
    "delivery_days" integer NOT NULL,
    "revision_count" integer DEFAULT 1,
    "features" "text"[] DEFAULT '{}'::"text"[],
    "is_express_available" boolean DEFAULT false,
    "express_days" integer,
    "express_price" integer,
    "is_active" boolean DEFAULT true,
    "display_order" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "service_packages_delivery_days_check" CHECK (("delivery_days" > 0)),
    CONSTRAINT "service_packages_express_days_check" CHECK (("express_days" > 0)),
    CONSTRAINT "service_packages_express_price_check" CHECK (("express_price" > 0)),
    CONSTRAINT "service_packages_package_type_check" CHECK (("package_type" = ANY (ARRAY['BASIC'::"text", 'STANDARD'::"text", 'PREMIUM'::"text"]))),
    CONSTRAINT "service_packages_price_check" CHECK (("price" > 0)),
    CONSTRAINT "service_packages_revision_count_check" CHECK (("revision_count" >= 0))
);


ALTER TABLE "public"."service_packages" OWNER TO "postgres";


COMMENT ON TABLE "public"."service_packages" IS 'Service package information (BASIC/STANDARD/PREMIUM)';



COMMENT ON COLUMN "public"."service_packages"."service_id" IS 'Service ID';



COMMENT ON COLUMN "public"."service_packages"."package_type" IS 'Package type (BASIC/STANDARD/PREMIUM)';



COMMENT ON COLUMN "public"."service_packages"."features" IS 'Included features/items';



CREATE TABLE IF NOT EXISTS "public"."service_tags" (
    "service_id" "uuid" NOT NULL,
    "tag_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."service_tags" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."services" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "seller_id" "uuid" NOT NULL,
    "title" "text" NOT NULL,
    "slug" "text" NOT NULL,
    "description" "text" NOT NULL,
    "requirements" "text",
    "price" integer NOT NULL,
    "price_unit" "text" DEFAULT 'project'::"text",
    "delivery_days" integer NOT NULL,
    "revision_count" integer DEFAULT 1,
    "express_delivery" boolean DEFAULT false,
    "express_days" integer,
    "express_price" integer,
    "thumbnail_url" "text",
    "portfolio_urls" "text"[],
    "video_url" "text",
    "views" integer DEFAULT 0,
    "clicks" integer DEFAULT 0,
    "orders_count" integer DEFAULT 0,
    "in_progress_orders" integer DEFAULT 0,
    "completed_orders" integer DEFAULT 0,
    "rating" numeric(3,2) DEFAULT 0.00,
    "review_count" integer DEFAULT 0,
    "status" "text" DEFAULT 'draft'::"text",
    "is_featured" boolean DEFAULT false,
    "featured_until" timestamp with time zone,
    "meta_title" "text",
    "meta_description" "text",
    "version" integer DEFAULT 1,
    "last_modified_by" "uuid",
    "deleted_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "services_delivery_days_check" CHECK (("delivery_days" > 0)),
    CONSTRAINT "services_price_check" CHECK (("price" > 0)),
    CONSTRAINT "services_price_unit_check" CHECK (("price_unit" = ANY (ARRAY['project'::"text", 'hour'::"text", 'revision'::"text"]))),
    CONSTRAINT "services_rating_check" CHECK ((("rating" >= (0)::numeric) AND ("rating" <= (5)::numeric))),
    CONSTRAINT "services_revision_count_check" CHECK (("revision_count" >= 0)),
    CONSTRAINT "services_status_check" CHECK (("status" = ANY (ARRAY['draft'::"text", 'pending_review'::"text", 'active'::"text", 'suspended'::"text", 'deleted'::"text"])))
);


ALTER TABLE "public"."services" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."settlement_details" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "settlement_id" "uuid" NOT NULL,
    "order_id" "uuid" NOT NULL,
    "order_amount" integer NOT NULL,
    "commission_amount" integer NOT NULL,
    "seller_amount" integer NOT NULL,
    "type" "text" DEFAULT 'order'::"text",
    "description" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "settlement_details_type_check" CHECK (("type" = ANY (ARRAY['order'::"text", 'refund'::"text", 'adjustment'::"text"])))
);


ALTER TABLE "public"."settlement_details" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."settlements" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "seller_id" "uuid" NOT NULL,
    "settlement_date" "date" NOT NULL,
    "start_date" "date" NOT NULL,
    "end_date" "date" NOT NULL,
    "total_sales" bigint DEFAULT 0,
    "total_commission" bigint DEFAULT 0,
    "total_refunds" bigint DEFAULT 0,
    "adjustments" bigint DEFAULT 0,
    "settlement_amount" bigint NOT NULL,
    "status" "text" DEFAULT 'pending'::"text",
    "bank_name" "text",
    "bank_account" "text",
    "account_holder" "text",
    "confirmed_at" timestamp with time zone,
    "paid_at" timestamp with time zone,
    "payment_proof" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "settlements_status_check" CHECK (("status" = ANY (ARRAY['pending'::"text", 'confirmed'::"text", 'paid'::"text", 'failed'::"text"])))
);


ALTER TABLE "public"."settlements" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."tags" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "slug" "text" NOT NULL,
    "usage_count" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."tags" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_coupons" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "coupon_id" "uuid" NOT NULL,
    "is_used" boolean DEFAULT false,
    "used_at" timestamp with time zone,
    "order_id" "uuid",
    "expires_at" timestamp with time zone NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."user_coupons" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_wallets" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "balance" integer DEFAULT 0,
    "total_charged" integer DEFAULT 0,
    "total_used" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "user_wallets_balance_check" CHECK (("balance" >= 0))
);


ALTER TABLE "public"."user_wallets" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."users" (
    "id" "uuid" NOT NULL,
    "email" "text" NOT NULL,
    "name" "text" NOT NULL,
    "phone" "text",
    "profile_image" "text",
    "bio" "text",
    "email_verified" boolean DEFAULT false,
    "phone_verified" boolean DEFAULT false,
    "is_active" boolean DEFAULT true,
    "last_login_at" timestamp with time zone,
    "deleted_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."users" OWNER TO "postgres";


COMMENT ON TABLE "public"."users" IS '기본 회원 정보만 - 활동 데이터는 buyers/sellers 테이블에서 관리';



CREATE TABLE IF NOT EXISTS "public"."wallet_transactions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "wallet_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "type" "text" NOT NULL,
    "amount" integer NOT NULL,
    "balance_after" integer NOT NULL,
    "description" "text" NOT NULL,
    "order_id" "uuid",
    "payment_id" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "wallet_transactions_type_check" CHECK (("type" = ANY (ARRAY['charge'::"text", 'use'::"text", 'refund'::"text", 'reward'::"text"])))
);


ALTER TABLE "public"."wallet_transactions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."withdrawal_requests" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "seller_id" "uuid" NOT NULL,
    "amount" integer NOT NULL,
    "bank_name" "text" NOT NULL,
    "account_number" "text" NOT NULL,
    "account_holder" "text" NOT NULL,
    "status" "text" DEFAULT 'pending'::"text",
    "processed_by" "uuid",
    "processed_at" timestamp with time zone,
    "rejection_reason" "text",
    "requested_at" timestamp with time zone DEFAULT "now"(),
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "withdrawal_requests_amount_check" CHECK (("amount" > 0)),
    CONSTRAINT "withdrawal_requests_status_check" CHECK (("status" = ANY (ARRAY['pending'::"text", 'processing'::"text", 'completed'::"text", 'rejected'::"text", 'cancelled'::"text"])))
);


ALTER TABLE "public"."withdrawal_requests" OWNER TO "postgres";


ALTER TABLE ONLY "public"."activity_logs"
    ADD CONSTRAINT "activity_logs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."admins"
    ADD CONSTRAINT "admins_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."admins"
    ADD CONSTRAINT "admins_user_id_key" UNIQUE ("user_id");



ALTER TABLE ONLY "public"."advertising_campaigns"
    ADD CONSTRAINT "advertising_campaigns_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."ai_services"
    ADD CONSTRAINT "ai_services_pkey" PRIMARY KEY ("service_id");



ALTER TABLE ONLY "public"."buyers"
    ADD CONSTRAINT "buyers_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."buyers"
    ADD CONSTRAINT "buyers_user_id_key" UNIQUE ("user_id");



ALTER TABLE ONLY "public"."categories"
    ADD CONSTRAINT "categories_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."categories"
    ADD CONSTRAINT "categories_slug_key" UNIQUE ("slug");



ALTER TABLE ONLY "public"."category_visits"
    ADD CONSTRAINT "category_visits_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."conversations"
    ADD CONSTRAINT "conversations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."coupons"
    ADD CONSTRAINT "coupons_code_key" UNIQUE ("code");



ALTER TABLE ONLY "public"."coupons"
    ADD CONSTRAINT "coupons_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."disputes"
    ADD CONSTRAINT "disputes_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."earnings_transactions"
    ADD CONSTRAINT "earnings_transactions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."favorites"
    ADD CONSTRAINT "favorites_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."favorites"
    ADD CONSTRAINT "favorites_user_id_service_id_key" UNIQUE ("user_id", "service_id");



ALTER TABLE ONLY "public"."messages"
    ADD CONSTRAINT "messages_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."notifications"
    ADD CONSTRAINT "notifications_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."orders"
    ADD CONSTRAINT "orders_order_number_key" UNIQUE ("order_number");



ALTER TABLE ONLY "public"."orders"
    ADD CONSTRAINT "orders_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."payments"
    ADD CONSTRAINT "payments_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."payments"
    ADD CONSTRAINT "payments_transaction_id_key" UNIQUE ("transaction_id");



ALTER TABLE ONLY "public"."portfolio_items"
    ADD CONSTRAINT "portfolio_items_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."premium_placements"
    ADD CONSTRAINT "premium_placements_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."quote_responses"
    ADD CONSTRAINT "quote_responses_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."quotes"
    ADD CONSTRAINT "quotes_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."refunds"
    ADD CONSTRAINT "refunds_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."reports"
    ADD CONSTRAINT "reports_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."reviews"
    ADD CONSTRAINT "reviews_order_id_key" UNIQUE ("order_id");



ALTER TABLE ONLY "public"."reviews"
    ADD CONSTRAINT "reviews_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."schema_migrations"
    ADD CONSTRAINT "schema_migrations_pkey" PRIMARY KEY ("version");



ALTER TABLE ONLY "public"."search_logs"
    ADD CONSTRAINT "search_logs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."seller_earnings"
    ADD CONSTRAINT "seller_earnings_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."seller_earnings"
    ADD CONSTRAINT "seller_earnings_seller_id_key" UNIQUE ("seller_id");



ALTER TABLE ONLY "public"."sellers"
    ADD CONSTRAINT "sellers_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."sellers"
    ADD CONSTRAINT "sellers_user_id_key" UNIQUE ("user_id");



ALTER TABLE ONLY "public"."service_categories"
    ADD CONSTRAINT "service_categories_pkey" PRIMARY KEY ("service_id", "category_id");



ALTER TABLE ONLY "public"."service_packages"
    ADD CONSTRAINT "service_packages_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."service_packages"
    ADD CONSTRAINT "service_packages_service_id_package_type_key" UNIQUE ("service_id", "package_type");



ALTER TABLE ONLY "public"."service_tags"
    ADD CONSTRAINT "service_tags_pkey" PRIMARY KEY ("service_id", "tag_id");



ALTER TABLE ONLY "public"."services"
    ADD CONSTRAINT "services_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."services"
    ADD CONSTRAINT "services_slug_key" UNIQUE ("slug");



ALTER TABLE ONLY "public"."settlement_details"
    ADD CONSTRAINT "settlement_details_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."settlements"
    ADD CONSTRAINT "settlements_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."tags"
    ADD CONSTRAINT "tags_name_key" UNIQUE ("name");



ALTER TABLE ONLY "public"."tags"
    ADD CONSTRAINT "tags_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."tags"
    ADD CONSTRAINT "tags_slug_key" UNIQUE ("slug");



ALTER TABLE ONLY "public"."category_visits"
    ADD CONSTRAINT "unique_user_category" UNIQUE ("user_id", "category_id");



ALTER TABLE ONLY "public"."user_coupons"
    ADD CONSTRAINT "user_coupons_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_wallets"
    ADD CONSTRAINT "user_wallets_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_wallets"
    ADD CONSTRAINT "user_wallets_user_id_key" UNIQUE ("user_id");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_email_key" UNIQUE ("email");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."wallet_transactions"
    ADD CONSTRAINT "wallet_transactions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."withdrawal_requests"
    ADD CONSTRAINT "withdrawal_requests_pkey" PRIMARY KEY ("id");



CREATE INDEX "idx_ai_services_ai_tool" ON "public"."ai_services" USING "btree" ("ai_tool");



CREATE INDEX "idx_buyers_created_at" ON "public"."buyers" USING "btree" ("created_at" DESC);



CREATE INDEX "idx_buyers_is_active" ON "public"."buyers" USING "btree" ("is_active");



CREATE INDEX "idx_buyers_user_id" ON "public"."buyers" USING "btree" ("user_id");



CREATE INDEX "idx_campaigns_seller" ON "public"."advertising_campaigns" USING "btree" ("seller_id");



CREATE INDEX "idx_campaigns_status" ON "public"."advertising_campaigns" USING "btree" ("status", "approval_status");



CREATE INDEX "idx_categories_ai" ON "public"."categories" USING "btree" ("is_ai_category", "is_active");



CREATE INDEX "idx_categories_keywords" ON "public"."categories" USING "gin" ("keywords");



CREATE INDEX "idx_categories_level" ON "public"."categories" USING "btree" ("level");



CREATE INDEX "idx_categories_parent" ON "public"."categories" USING "btree" ("parent_id");



CREATE INDEX "idx_categories_popularity" ON "public"."categories" USING "btree" ("popularity_score" DESC);



CREATE INDEX "idx_categories_service_count" ON "public"."categories" USING "btree" ("service_count" DESC);



CREATE INDEX "idx_categories_slug" ON "public"."categories" USING "btree" ("slug");



CREATE INDEX "idx_category_visits_last_visited" ON "public"."category_visits" USING "btree" ("last_visited_at" DESC);



CREATE INDEX "idx_category_visits_user_id" ON "public"."category_visits" USING "btree" ("user_id");



CREATE INDEX "idx_category_visits_user_last_visited" ON "public"."category_visits" USING "btree" ("user_id", "last_visited_at" DESC);



CREATE INDEX "idx_conversations_participants" ON "public"."conversations" USING "btree" ("participant1_id", "participant2_id");



CREATE INDEX "idx_coupons_active" ON "public"."coupons" USING "btree" ("is_active", "starts_at", "expires_at");



CREATE INDEX "idx_coupons_code" ON "public"."coupons" USING "btree" ("code");



CREATE INDEX "idx_earnings_transactions_date" ON "public"."earnings_transactions" USING "btree" ("transaction_date" DESC);



CREATE INDEX "idx_earnings_transactions_order_id" ON "public"."earnings_transactions" USING "btree" ("order_id");



CREATE INDEX "idx_earnings_transactions_seller_id" ON "public"."earnings_transactions" USING "btree" ("seller_id");



CREATE INDEX "idx_earnings_transactions_status" ON "public"."earnings_transactions" USING "btree" ("status");



CREATE INDEX "idx_favorites_service" ON "public"."favorites" USING "btree" ("service_id");



CREATE INDEX "idx_favorites_user" ON "public"."favorites" USING "btree" ("user_id");



CREATE INDEX "idx_messages_conversation" ON "public"."messages" USING "btree" ("conversation_id");



CREATE INDEX "idx_messages_sender" ON "public"."messages" USING "btree" ("sender_id");



CREATE INDEX "idx_notifications_unread" ON "public"."notifications" USING "btree" ("user_id", "is_read");



CREATE INDEX "idx_notifications_user" ON "public"."notifications" USING "btree" ("user_id");



CREATE INDEX "idx_orders_buyer" ON "public"."orders" USING "btree" ("buyer_id");



CREATE INDEX "idx_orders_number" ON "public"."orders" USING "btree" ("order_number");



CREATE INDEX "idx_orders_seller" ON "public"."orders" USING "btree" ("seller_id");



CREATE INDEX "idx_orders_service" ON "public"."orders" USING "btree" ("service_id");



CREATE INDEX "idx_orders_status" ON "public"."orders" USING "btree" ("status", "payment_status");



CREATE INDEX "idx_payments_order" ON "public"."payments" USING "btree" ("order_id");



CREATE INDEX "idx_payments_status" ON "public"."payments" USING "btree" ("status");



CREATE INDEX "idx_payments_transaction" ON "public"."payments" USING "btree" ("transaction_id");



CREATE INDEX "idx_portfolio_items_seller_id" ON "public"."portfolio_items" USING "btree" ("seller_id");



CREATE INDEX "idx_portfolio_items_visible" ON "public"."portfolio_items" USING "btree" ("is_visible");



CREATE INDEX "idx_premium_active" ON "public"."premium_placements" USING "btree" ("is_active", "start_date", "end_date");



CREATE INDEX "idx_premium_service" ON "public"."premium_placements" USING "btree" ("service_id");



CREATE INDEX "idx_quote_responses_quote_id" ON "public"."quote_responses" USING "btree" ("quote_id");



CREATE INDEX "idx_quote_responses_seller_id" ON "public"."quote_responses" USING "btree" ("seller_id");



CREATE INDEX "idx_quote_responses_status" ON "public"."quote_responses" USING "btree" ("status");



CREATE INDEX "idx_quotes_buyer_id" ON "public"."quotes" USING "btree" ("buyer_id");



CREATE INDEX "idx_quotes_category_id" ON "public"."quotes" USING "btree" ("category_id");



CREATE INDEX "idx_quotes_created_at" ON "public"."quotes" USING "btree" ("created_at" DESC);



CREATE INDEX "idx_quotes_status" ON "public"."quotes" USING "btree" ("status");



CREATE INDEX "idx_reports_reporter" ON "public"."reports" USING "btree" ("reporter_id");



CREATE INDEX "idx_reports_status" ON "public"."reports" USING "btree" ("status", "severity");



CREATE INDEX "idx_reviews_buyer" ON "public"."reviews" USING "btree" ("buyer_id");



CREATE INDEX "idx_reviews_seller" ON "public"."reviews" USING "btree" ("seller_id");



CREATE INDEX "idx_reviews_service" ON "public"."reviews" USING "btree" ("service_id");



CREATE INDEX "idx_reviews_visible" ON "public"."reviews" USING "btree" ("is_visible", "is_featured");



CREATE INDEX "idx_search_logs_keyword" ON "public"."search_logs" USING "btree" ("keyword");



CREATE INDEX "idx_search_logs_user" ON "public"."search_logs" USING "btree" ("user_id");



CREATE INDEX "idx_seller_earnings_seller_id" ON "public"."seller_earnings" USING "btree" ("seller_id");



CREATE INDEX "idx_sellers_created_at" ON "public"."sellers" USING "btree" ("created_at" DESC);



CREATE INDEX "idx_sellers_is_active" ON "public"."sellers" USING "btree" ("is_active");



CREATE INDEX "idx_sellers_is_verified" ON "public"."sellers" USING "btree" ("is_verified");



CREATE INDEX "idx_sellers_user_id" ON "public"."sellers" USING "btree" ("user_id");



CREATE INDEX "idx_sellers_verification_status" ON "public"."sellers" USING "btree" ("verification_status");



CREATE INDEX "idx_service_packages_active" ON "public"."service_packages" USING "btree" ("is_active");



CREATE INDEX "idx_service_packages_service" ON "public"."service_packages" USING "btree" ("service_id");



CREATE INDEX "idx_service_packages_type" ON "public"."service_packages" USING "btree" ("package_type");



CREATE INDEX "idx_services_rating" ON "public"."services" USING "btree" ("rating" DESC, "review_count" DESC);



CREATE INDEX "idx_services_seller" ON "public"."services" USING "btree" ("seller_id");



CREATE INDEX "idx_services_slug" ON "public"."services" USING "btree" ("slug");



CREATE INDEX "idx_services_status" ON "public"."services" USING "btree" ("status", "deleted_at");



CREATE INDEX "idx_settlements_date" ON "public"."settlements" USING "btree" ("settlement_date");



CREATE INDEX "idx_settlements_seller" ON "public"."settlements" USING "btree" ("seller_id");



CREATE INDEX "idx_settlements_status" ON "public"."settlements" USING "btree" ("status");



CREATE INDEX "idx_user_coupons_coupon_id" ON "public"."user_coupons" USING "btree" ("coupon_id");



CREATE UNIQUE INDEX "idx_user_coupons_unique" ON "public"."user_coupons" USING "btree" ("user_id", "coupon_id") WHERE ("is_used" = false);



CREATE INDEX "idx_user_coupons_used" ON "public"."user_coupons" USING "btree" ("is_used", "expires_at");



CREATE INDEX "idx_user_coupons_user_id" ON "public"."user_coupons" USING "btree" ("user_id");



CREATE INDEX "idx_user_wallets_user_id" ON "public"."user_wallets" USING "btree" ("user_id");



CREATE INDEX "idx_users_active" ON "public"."users" USING "btree" ("is_active", "deleted_at");



CREATE INDEX "idx_users_email" ON "public"."users" USING "btree" ("email");



CREATE INDEX "idx_users_is_active" ON "public"."users" USING "btree" ("is_active");



CREATE INDEX "idx_wallet_transactions_created_at" ON "public"."wallet_transactions" USING "btree" ("created_at" DESC);



CREATE INDEX "idx_wallet_transactions_user_id" ON "public"."wallet_transactions" USING "btree" ("user_id");



CREATE INDEX "idx_wallet_transactions_wallet_id" ON "public"."wallet_transactions" USING "btree" ("wallet_id");



CREATE INDEX "idx_withdrawal_requests_seller_id" ON "public"."withdrawal_requests" USING "btree" ("seller_id");



CREATE INDEX "idx_withdrawal_requests_status" ON "public"."withdrawal_requests" USING "btree" ("status");



CREATE OR REPLACE TRIGGER "create_wallet_on_user_creation" AFTER INSERT ON "public"."users" FOR EACH ROW EXECUTE FUNCTION "public"."create_user_wallet"();



CREATE OR REPLACE TRIGGER "generate_order_number_trigger" BEFORE INSERT ON "public"."orders" FOR EACH ROW WHEN (("new"."order_number" IS NULL)) EXECUTE FUNCTION "public"."generate_order_number"();



CREATE OR REPLACE TRIGGER "generate_service_slug_trigger" BEFORE INSERT OR UPDATE OF "title" ON "public"."services" FOR EACH ROW EXECUTE FUNCTION "public"."generate_service_slug"();



CREATE OR REPLACE TRIGGER "trigger_create_seller_earnings" AFTER INSERT OR UPDATE ON "public"."users" FOR EACH ROW EXECUTE FUNCTION "public"."create_seller_earnings"();



CREATE OR REPLACE TRIGGER "update_ai_services_updated_at" BEFORE UPDATE ON "public"."ai_services" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_buyers_updated_at" BEFORE UPDATE ON "public"."buyers" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_campaigns_updated_at" BEFORE UPDATE ON "public"."advertising_campaigns" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at"();



CREATE OR REPLACE TRIGGER "update_categories_updated_at" BEFORE UPDATE ON "public"."categories" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at"();



CREATE OR REPLACE TRIGGER "update_category_visits_updated_at" BEFORE UPDATE ON "public"."category_visits" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_conversations_updated_at" BEFORE UPDATE ON "public"."conversations" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at"();



CREATE OR REPLACE TRIGGER "update_coupon_quantity_on_issue" AFTER INSERT ON "public"."user_coupons" FOR EACH ROW EXECUTE FUNCTION "public"."update_coupon_issued_quantity"();



CREATE OR REPLACE TRIGGER "update_coupons_updated_at" BEFORE UPDATE ON "public"."coupons" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_disputes_updated_at" BEFORE UPDATE ON "public"."disputes" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at"();



CREATE OR REPLACE TRIGGER "update_orders_updated_at" BEFORE UPDATE ON "public"."orders" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at"();



CREATE OR REPLACE TRIGGER "update_payments_updated_at" BEFORE UPDATE ON "public"."payments" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at"();



CREATE OR REPLACE TRIGGER "update_portfolio_items_updated_at" BEFORE UPDATE ON "public"."portfolio_items" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at"();



CREATE OR REPLACE TRIGGER "update_premium_updated_at" BEFORE UPDATE ON "public"."premium_placements" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at"();



CREATE OR REPLACE TRIGGER "update_quote_response_count_on_change" AFTER INSERT OR DELETE ON "public"."quote_responses" FOR EACH ROW EXECUTE FUNCTION "public"."update_quote_response_count"();



CREATE OR REPLACE TRIGGER "update_quote_responses_updated_at" BEFORE UPDATE ON "public"."quote_responses" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_quotes_updated_at" BEFORE UPDATE ON "public"."quotes" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_reports_updated_at" BEFORE UPDATE ON "public"."reports" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at"();



CREATE OR REPLACE TRIGGER "update_reviews_updated_at" BEFORE UPDATE ON "public"."reviews" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at"();



CREATE OR REPLACE TRIGGER "update_seller_earnings_updated_at" BEFORE UPDATE ON "public"."seller_earnings" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at"();



CREATE OR REPLACE TRIGGER "update_sellers_updated_at" BEFORE UPDATE ON "public"."sellers" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_service_packages_updated_at" BEFORE UPDATE ON "public"."service_packages" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_services_updated_at" BEFORE UPDATE ON "public"."services" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at"();



CREATE OR REPLACE TRIGGER "update_settlements_updated_at" BEFORE UPDATE ON "public"."settlements" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at"();



CREATE OR REPLACE TRIGGER "update_user_wallets_updated_at" BEFORE UPDATE ON "public"."user_wallets" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_users_updated_at" BEFORE UPDATE ON "public"."users" FOR EACH ROW EXECUTE FUNCTION "public"."update_users_updated_at"();



CREATE OR REPLACE TRIGGER "update_withdrawal_requests_updated_at" BEFORE UPDATE ON "public"."withdrawal_requests" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at"();



ALTER TABLE ONLY "public"."activity_logs"
    ADD CONSTRAINT "activity_logs_admin_id_fkey" FOREIGN KEY ("admin_id") REFERENCES "public"."admins"("id");



ALTER TABLE ONLY "public"."activity_logs"
    ADD CONSTRAINT "activity_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id");



ALTER TABLE ONLY "public"."admins"
    ADD CONSTRAINT "admins_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."advertising_campaigns"
    ADD CONSTRAINT "advertising_campaigns_seller_id_fkey" FOREIGN KEY ("seller_id") REFERENCES "public"."users"("id");



ALTER TABLE ONLY "public"."ai_services"
    ADD CONSTRAINT "ai_services_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "public"."services"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."buyers"
    ADD CONSTRAINT "buyers_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."categories"
    ADD CONSTRAINT "categories_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "public"."categories"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."category_visits"
    ADD CONSTRAINT "category_visits_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."conversations"
    ADD CONSTRAINT "conversations_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id");



ALTER TABLE ONLY "public"."conversations"
    ADD CONSTRAINT "conversations_participant1_id_fkey" FOREIGN KEY ("participant1_id") REFERENCES "public"."users"("id");



ALTER TABLE ONLY "public"."conversations"
    ADD CONSTRAINT "conversations_participant2_id_fkey" FOREIGN KEY ("participant2_id") REFERENCES "public"."users"("id");



ALTER TABLE ONLY "public"."disputes"
    ADD CONSTRAINT "disputes_initiated_by_fkey" FOREIGN KEY ("initiated_by") REFERENCES "public"."users"("id");



ALTER TABLE ONLY "public"."disputes"
    ADD CONSTRAINT "disputes_mediator_id_fkey" FOREIGN KEY ("mediator_id") REFERENCES "public"."admins"("id");



ALTER TABLE ONLY "public"."disputes"
    ADD CONSTRAINT "disputes_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id");



ALTER TABLE ONLY "public"."earnings_transactions"
    ADD CONSTRAINT "earnings_transactions_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."earnings_transactions"
    ADD CONSTRAINT "earnings_transactions_seller_id_fkey" FOREIGN KEY ("seller_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."favorites"
    ADD CONSTRAINT "favorites_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "public"."services"("id");



ALTER TABLE ONLY "public"."favorites"
    ADD CONSTRAINT "favorites_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id");



ALTER TABLE ONLY "public"."messages"
    ADD CONSTRAINT "messages_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "public"."conversations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."messages"
    ADD CONSTRAINT "messages_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "public"."users"("id");



ALTER TABLE ONLY "public"."notifications"
    ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id");



ALTER TABLE ONLY "public"."orders"
    ADD CONSTRAINT "orders_buyer_id_fkey" FOREIGN KEY ("buyer_id") REFERENCES "public"."users"("id");



ALTER TABLE ONLY "public"."orders"
    ADD CONSTRAINT "orders_seller_id_fkey" FOREIGN KEY ("seller_id") REFERENCES "public"."users"("id");



ALTER TABLE ONLY "public"."orders"
    ADD CONSTRAINT "orders_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "public"."services"("id");



ALTER TABLE ONLY "public"."payments"
    ADD CONSTRAINT "payments_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."portfolio_items"
    ADD CONSTRAINT "portfolio_items_seller_id_fkey" FOREIGN KEY ("seller_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."premium_placements"
    ADD CONSTRAINT "premium_placements_campaign_id_fkey" FOREIGN KEY ("campaign_id") REFERENCES "public"."advertising_campaigns"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."premium_placements"
    ADD CONSTRAINT "premium_placements_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."premium_placements"
    ADD CONSTRAINT "premium_placements_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "public"."services"("id");



ALTER TABLE ONLY "public"."quote_responses"
    ADD CONSTRAINT "quote_responses_quote_id_fkey" FOREIGN KEY ("quote_id") REFERENCES "public"."quotes"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."quote_responses"
    ADD CONSTRAINT "quote_responses_seller_id_fkey" FOREIGN KEY ("seller_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."quotes"
    ADD CONSTRAINT "quotes_buyer_id_fkey" FOREIGN KEY ("buyer_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."quotes"
    ADD CONSTRAINT "quotes_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."refunds"
    ADD CONSTRAINT "refunds_approved_by_fkey" FOREIGN KEY ("approved_by") REFERENCES "public"."admins"("id");



ALTER TABLE ONLY "public"."refunds"
    ADD CONSTRAINT "refunds_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id");



ALTER TABLE ONLY "public"."refunds"
    ADD CONSTRAINT "refunds_payment_id_fkey" FOREIGN KEY ("payment_id") REFERENCES "public"."payments"("id");



ALTER TABLE ONLY "public"."refunds"
    ADD CONSTRAINT "refunds_requested_by_fkey" FOREIGN KEY ("requested_by") REFERENCES "public"."users"("id");



ALTER TABLE ONLY "public"."reports"
    ADD CONSTRAINT "reports_assigned_to_fkey" FOREIGN KEY ("assigned_to") REFERENCES "public"."admins"("id");



ALTER TABLE ONLY "public"."reports"
    ADD CONSTRAINT "reports_reported_order_id_fkey" FOREIGN KEY ("reported_order_id") REFERENCES "public"."orders"("id");



ALTER TABLE ONLY "public"."reports"
    ADD CONSTRAINT "reports_reported_review_id_fkey" FOREIGN KEY ("reported_review_id") REFERENCES "public"."reviews"("id");



ALTER TABLE ONLY "public"."reports"
    ADD CONSTRAINT "reports_reported_service_id_fkey" FOREIGN KEY ("reported_service_id") REFERENCES "public"."services"("id");



ALTER TABLE ONLY "public"."reports"
    ADD CONSTRAINT "reports_reported_user_id_fkey" FOREIGN KEY ("reported_user_id") REFERENCES "public"."users"("id");



ALTER TABLE ONLY "public"."reports"
    ADD CONSTRAINT "reports_reporter_id_fkey" FOREIGN KEY ("reporter_id") REFERENCES "public"."users"("id");



ALTER TABLE ONLY "public"."reviews"
    ADD CONSTRAINT "reviews_buyer_id_fkey" FOREIGN KEY ("buyer_id") REFERENCES "public"."users"("id");



ALTER TABLE ONLY "public"."reviews"
    ADD CONSTRAINT "reviews_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id");



ALTER TABLE ONLY "public"."reviews"
    ADD CONSTRAINT "reviews_seller_id_fkey" FOREIGN KEY ("seller_id") REFERENCES "public"."users"("id");



ALTER TABLE ONLY "public"."reviews"
    ADD CONSTRAINT "reviews_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "public"."services"("id");



ALTER TABLE ONLY "public"."search_logs"
    ADD CONSTRAINT "search_logs_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."search_logs"
    ADD CONSTRAINT "search_logs_converted_service_id_fkey" FOREIGN KEY ("converted_service_id") REFERENCES "public"."services"("id");



ALTER TABLE ONLY "public"."search_logs"
    ADD CONSTRAINT "search_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id");



ALTER TABLE ONLY "public"."seller_earnings"
    ADD CONSTRAINT "seller_earnings_seller_id_fkey" FOREIGN KEY ("seller_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."sellers"
    ADD CONSTRAINT "sellers_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."service_categories"
    ADD CONSTRAINT "service_categories_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."service_categories"
    ADD CONSTRAINT "service_categories_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "public"."services"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."service_packages"
    ADD CONSTRAINT "service_packages_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "public"."services"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."service_tags"
    ADD CONSTRAINT "service_tags_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "public"."services"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."service_tags"
    ADD CONSTRAINT "service_tags_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."services"
    ADD CONSTRAINT "services_last_modified_by_fkey" FOREIGN KEY ("last_modified_by") REFERENCES "public"."users"("id");



ALTER TABLE ONLY "public"."services"
    ADD CONSTRAINT "services_seller_id_fkey" FOREIGN KEY ("seller_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."settlement_details"
    ADD CONSTRAINT "settlement_details_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id");



ALTER TABLE ONLY "public"."settlement_details"
    ADD CONSTRAINT "settlement_details_settlement_id_fkey" FOREIGN KEY ("settlement_id") REFERENCES "public"."settlements"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."settlements"
    ADD CONSTRAINT "settlements_seller_id_fkey" FOREIGN KEY ("seller_id") REFERENCES "public"."users"("id");



ALTER TABLE ONLY "public"."user_coupons"
    ADD CONSTRAINT "user_coupons_coupon_id_fkey" FOREIGN KEY ("coupon_id") REFERENCES "public"."coupons"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_coupons"
    ADD CONSTRAINT "user_coupons_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."user_coupons"
    ADD CONSTRAINT "user_coupons_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_wallets"
    ADD CONSTRAINT "user_wallets_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."wallet_transactions"
    ADD CONSTRAINT "wallet_transactions_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."wallet_transactions"
    ADD CONSTRAINT "wallet_transactions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."wallet_transactions"
    ADD CONSTRAINT "wallet_transactions_wallet_id_fkey" FOREIGN KEY ("wallet_id") REFERENCES "public"."user_wallets"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."withdrawal_requests"
    ADD CONSTRAINT "withdrawal_requests_processed_by_fkey" FOREIGN KEY ("processed_by") REFERENCES "public"."users"("id");



ALTER TABLE ONLY "public"."withdrawal_requests"
    ADD CONSTRAINT "withdrawal_requests_seller_id_fkey" FOREIGN KEY ("seller_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



CREATE POLICY "AI services access policy" ON "public"."ai_services" USING (((EXISTS ( SELECT 1
   FROM "public"."services" "s"
  WHERE (("s"."id" = "ai_services"."service_id") AND (("s"."seller_id" = ( SELECT "auth"."uid"() AS "uid")) OR (EXISTS ( SELECT 1
           FROM "public"."admins" "a"
          WHERE ("a"."user_id" = ( SELECT "auth"."uid"() AS "uid")))))))) OR true)) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."services" "s"
  WHERE (("s"."id" = "ai_services"."service_id") AND (("s"."seller_id" = ( SELECT "auth"."uid"() AS "uid")) OR (EXISTS ( SELECT 1
           FROM "public"."admins" "a"
          WHERE ("a"."user_id" = ( SELECT "auth"."uid"() AS "uid")))))))));



CREATE POLICY "Admins can manage tags" ON "public"."tags" USING ((EXISTS ( SELECT 1
   FROM "public"."admins"
  WHERE ("admins"."user_id" = ( SELECT "auth"."uid"() AS "uid"))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."admins"
  WHERE ("admins"."user_id" = ( SELECT "auth"."uid"() AS "uid")))));



CREATE POLICY "Admins can view all settlement details" ON "public"."settlement_details" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."admins"
  WHERE ("admins"."user_id" = ( SELECT "auth"."uid"() AS "uid")))));



CREATE POLICY "Admins delete own info" ON "public"."admins" FOR DELETE USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Admins update own info" ON "public"."admins" FOR UPDATE USING ((( SELECT "auth"."uid"() AS "uid") = "user_id")) WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Admins update reports" ON "public"."reports" FOR UPDATE USING ("public"."is_admin"()) WITH CHECK ("public"."is_admin"());



CREATE POLICY "Anyone can view schema migrations" ON "public"."schema_migrations" FOR SELECT USING (true);



COMMENT ON POLICY "Anyone can view schema migrations" ON "public"."schema_migrations" IS '모든 사용자가 마이그레이션 버전 조회 가능';



CREATE POLICY "Authenticated users view admins" ON "public"."admins" FOR SELECT USING ((( SELECT "auth"."uid"() AS "uid") IS NOT NULL));



CREATE POLICY "Buyers create orders" ON "public"."orders" FOR INSERT WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "buyer_id"));



CREATE POLICY "Buyers create payments" ON "public"."payments" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."orders"
  WHERE (("orders"."id" = "payments"."order_id") AND ("orders"."buyer_id" = ( SELECT "auth"."uid"() AS "uid"))))));



CREATE POLICY "Buyers create quotes" ON "public"."quotes" FOR INSERT WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "buyer_id"));



CREATE POLICY "Buyers create reviews" ON "public"."reviews" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."orders"
  WHERE (("orders"."id" = "reviews"."order_id") AND ("orders"."buyer_id" = ( SELECT "auth"."uid"() AS "uid"))))));



CREATE POLICY "Buyers delete own quotes" ON "public"."quotes" FOR DELETE USING ((( SELECT "auth"."uid"() AS "uid") = "buyer_id"));



CREATE POLICY "Buyers update own quotes" ON "public"."quotes" FOR UPDATE USING ((( SELECT "auth"."uid"() AS "uid") = "buyer_id")) WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "buyer_id"));



CREATE POLICY "Buyers update own reviews" ON "public"."reviews" FOR UPDATE USING ((( SELECT "auth"."uid"() AS "uid") = "buyer_id")) WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "buyer_id"));



CREATE POLICY "Campaign owners create placements" ON "public"."premium_placements" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."advertising_campaigns"
  WHERE (("advertising_campaigns"."id" = "premium_placements"."campaign_id") AND ("advertising_campaigns"."seller_id" = ( SELECT "auth"."uid"() AS "uid"))))));



CREATE POLICY "Categories are viewable by everyone" ON "public"."categories" FOR SELECT USING ((("is_active" = true) OR "public"."is_admin"()));



CREATE POLICY "Create reports" ON "public"."reports" FOR INSERT WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "reporter_id"));



CREATE POLICY "Insert search logs" ON "public"."search_logs" FOR INSERT WITH CHECK (true);



CREATE POLICY "Notifications access" ON "public"."notifications" USING ((("user_id" = ( SELECT "auth"."uid"() AS "uid")) OR (EXISTS ( SELECT 1
   FROM "public"."admins"
  WHERE ("admins"."user_id" = ( SELECT "auth"."uid"() AS "uid")))))) WITH CHECK ((("user_id" = ( SELECT "auth"."uid"() AS "uid")) OR (EXISTS ( SELECT 1
   FROM "public"."admins"
  WHERE ("admins"."user_id" = ( SELECT "auth"."uid"() AS "uid"))))));



CREATE POLICY "Only admins can delete categories" ON "public"."categories" FOR DELETE USING ("public"."is_admin"());



CREATE POLICY "Only admins can insert categories" ON "public"."categories" FOR INSERT WITH CHECK ("public"."is_admin"());



CREATE POLICY "Only admins can update categories" ON "public"."categories" FOR UPDATE USING ("public"."is_admin"()) WITH CHECK ("public"."is_admin"());



CREATE POLICY "Related users update orders" ON "public"."orders" FOR UPDATE USING (((( SELECT "auth"."uid"() AS "uid") = "buyer_id") OR (( SELECT "auth"."uid"() AS "uid") = "seller_id") OR "public"."is_admin"())) WITH CHECK (((( SELECT "auth"."uid"() AS "uid") = "buyer_id") OR (( SELECT "auth"."uid"() AS "uid") = "seller_id") OR "public"."is_admin"()));



CREATE POLICY "Sellers create responses" ON "public"."quote_responses" FOR INSERT WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "seller_id"));



CREATE POLICY "Sellers create services" ON "public"."services" FOR INSERT WITH CHECK (("public"."is_seller"() AND (( SELECT "auth"."uid"() AS "uid") = "seller_id")));



CREATE POLICY "Sellers delete own services" ON "public"."services" FOR DELETE USING (((( SELECT "auth"."uid"() AS "uid") = "seller_id") OR "public"."is_admin"()));



CREATE POLICY "Sellers manage own campaigns" ON "public"."advertising_campaigns" USING (((( SELECT "auth"."uid"() AS "uid") = "seller_id") OR "public"."is_admin"())) WITH CHECK (((( SELECT "auth"."uid"() AS "uid") = "seller_id") OR "public"."is_admin"()));



CREATE POLICY "Sellers update own responses" ON "public"."quote_responses" FOR UPDATE USING ((( SELECT "auth"."uid"() AS "uid") = "seller_id")) WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "seller_id"));



CREATE POLICY "Sellers update own services" ON "public"."services" FOR UPDATE USING (((( SELECT "auth"."uid"() AS "uid") = "seller_id") OR "public"."is_admin"())) WITH CHECK (((( SELECT "auth"."uid"() AS "uid") = "seller_id") OR "public"."is_admin"()));



CREATE POLICY "Sellers view own earnings transactions" ON "public"."earnings_transactions" FOR SELECT USING (((( SELECT "auth"."uid"() AS "uid") = "seller_id") OR (EXISTS ( SELECT 1
   FROM "public"."admins"
  WHERE ("admins"."user_id" = ( SELECT "auth"."uid"() AS "uid"))))));



CREATE POLICY "Send messages in conversations" ON "public"."messages" FOR INSERT WITH CHECK (((( SELECT "auth"."uid"() AS "uid") = "sender_id") AND (EXISTS ( SELECT 1
   FROM "public"."conversations"
  WHERE (("conversations"."id" = "messages"."conversation_id") AND (("conversations"."participant1_id" = ( SELECT "auth"."uid"() AS "uid")) OR ("conversations"."participant2_id" = ( SELECT "auth"."uid"() AS "uid"))))))));



CREATE POLICY "Service owners can manage their service tags" ON "public"."service_tags" USING ((EXISTS ( SELECT 1
   FROM "public"."services"
  WHERE (("services"."id" = "service_tags"."service_id") AND ("services"."seller_id" = ( SELECT "auth"."uid"() AS "uid")))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."services"
  WHERE (("services"."id" = "service_tags"."service_id") AND ("services"."seller_id" = ( SELECT "auth"."uid"() AS "uid"))))));



CREATE POLICY "Service owners manage packages" ON "public"."service_packages" USING (((EXISTS ( SELECT 1
   FROM "public"."services"
  WHERE (("services"."id" = "service_packages"."service_id") AND ("services"."seller_id" = ( SELECT "auth"."uid"() AS "uid"))))) OR "public"."is_admin"())) WITH CHECK (((EXISTS ( SELECT 1
   FROM "public"."services"
  WHERE (("services"."id" = "service_packages"."service_id") AND ("services"."seller_id" = ( SELECT "auth"."uid"() AS "uid"))))) OR "public"."is_admin"()));



CREATE POLICY "System can insert activity logs" ON "public"."activity_logs" FOR INSERT WITH CHECK (true);



CREATE POLICY "System can insert schema migrations" ON "public"."schema_migrations" FOR INSERT WITH CHECK (true);



COMMENT ON POLICY "System can insert schema migrations" ON "public"."schema_migrations" IS '시스템이 마이그레이션 기록 삽입 가능';



CREATE POLICY "Users and admins manage category visits" ON "public"."category_visits" USING (((( SELECT "auth"."uid"() AS "uid") = "user_id") OR (EXISTS ( SELECT 1
   FROM "public"."admins"
  WHERE ("admins"."user_id" = ( SELECT "auth"."uid"() AS "uid")))))) WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Users and admins view activity logs" ON "public"."activity_logs" FOR SELECT USING (((( SELECT "auth"."uid"() AS "uid") = "user_id") OR (( SELECT "auth"."uid"() AS "uid") = "admin_id") OR (EXISTS ( SELECT 1
   FROM "public"."admins"
  WHERE ("admins"."user_id" = ( SELECT "auth"."uid"() AS "uid"))))));



CREATE POLICY "Users and admins view search logs" ON "public"."search_logs" FOR SELECT USING (((( SELECT "auth"."uid"() AS "uid") = "user_id") OR (EXISTS ( SELECT 1
   FROM "public"."admins"
  WHERE ("admins"."user_id" = ( SELECT "auth"."uid"() AS "uid"))))));



CREATE POLICY "Users can insert their own buyer profile" ON "public"."buyers" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can insert their own seller profile" ON "public"."sellers" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update their own buyer profile" ON "public"."buyers" FOR UPDATE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update their own seller profile" ON "public"."sellers" FOR UPDATE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view their own buyer record" ON "public"."buyers" FOR SELECT TO "authenticated" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view their own profile" ON "public"."users" FOR SELECT TO "authenticated" USING (("auth"."uid"() = "id"));



CREATE POLICY "Users can view their own seller record" ON "public"."sellers" FOR SELECT TO "authenticated" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users create conversations" ON "public"."conversations" FOR INSERT WITH CHECK (((( SELECT "auth"."uid"() AS "uid") = "participant1_id") OR (( SELECT "auth"."uid"() AS "uid") = "participant2_id")));



CREATE POLICY "Users manage own coupons" ON "public"."user_coupons" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id")) WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Users manage own favorites" ON "public"."favorites" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id")) WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Users manage own wallet" ON "public"."user_wallets" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id")) WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Users update own profile" ON "public"."users" FOR UPDATE USING ((( SELECT "auth"."uid"() AS "uid") = "id")) WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "id"));



CREATE POLICY "Users view own wallet transactions" ON "public"."wallet_transactions" FOR SELECT USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "View active coupons" ON "public"."coupons" FOR SELECT USING (((("is_active" = true) AND ("starts_at" <= "now"()) AND ("expires_at" >= "now"())) OR (EXISTS ( SELECT 1
   FROM "public"."admins"
  WHERE ("admins"."user_id" = ( SELECT "auth"."uid"() AS "uid"))))));



CREATE POLICY "View active or own placements" ON "public"."premium_placements" FOR SELECT USING ((("is_active" = true) OR (EXISTS ( SELECT 1
   FROM "public"."advertising_campaigns"
  WHERE (("advertising_campaigns"."id" = "premium_placements"."campaign_id") AND ("advertising_campaigns"."seller_id" = ( SELECT "auth"."uid"() AS "uid"))))) OR "public"."is_admin"()));



CREATE POLICY "View active or own quotes" ON "public"."quotes" FOR SELECT USING ((("status" = 'pending'::"text") OR (( SELECT "auth"."uid"() AS "uid") = "buyer_id")));



CREATE POLICY "View active or own services" ON "public"."services" FOR SELECT USING ((("status" = 'active'::"text") OR (( SELECT "auth"."uid"() AS "uid") = "seller_id") OR "public"."is_admin"()));



CREATE POLICY "View conversation messages" ON "public"."messages" FOR SELECT USING (((EXISTS ( SELECT 1
   FROM "public"."conversations"
  WHERE (("conversations"."id" = "messages"."conversation_id") AND (("conversations"."participant1_id" = ( SELECT "auth"."uid"() AS "uid")) OR ("conversations"."participant2_id" = ( SELECT "auth"."uid"() AS "uid")))))) OR "public"."is_admin"()));



CREATE POLICY "View own or all withdrawal requests" ON "public"."withdrawal_requests" FOR SELECT USING (((( SELECT "auth"."uid"() AS "uid") = "seller_id") OR (EXISTS ( SELECT 1
   FROM "public"."admins"
  WHERE ("admins"."user_id" = ( SELECT "auth"."uid"() AS "uid"))))));



CREATE POLICY "View own or managed reports" ON "public"."reports" FOR SELECT USING (((( SELECT "auth"."uid"() AS "uid") = "reporter_id") OR "public"."is_admin"()));



CREATE POLICY "View public or own reviews" ON "public"."reviews" FOR SELECT USING ((("is_visible" = true) OR (( SELECT "auth"."uid"() AS "uid") = "buyer_id") OR (( SELECT "auth"."uid"() AS "uid") = "seller_id") OR "public"."is_admin"()));



CREATE POLICY "View related orders" ON "public"."orders" FOR SELECT USING (((( SELECT "auth"."uid"() AS "uid") = "buyer_id") OR (( SELECT "auth"."uid"() AS "uid") = "seller_id") OR "public"."is_admin"()));



CREATE POLICY "View related payments" ON "public"."payments" FOR SELECT USING (((EXISTS ( SELECT 1
   FROM "public"."orders"
  WHERE (("orders"."id" = "payments"."order_id") AND (("orders"."buyer_id" = ( SELECT "auth"."uid"() AS "uid")) OR ("orders"."seller_id" = ( SELECT "auth"."uid"() AS "uid")))))) OR "public"."is_admin"()));



CREATE POLICY "View relevant quote responses" ON "public"."quote_responses" FOR SELECT USING (((( SELECT "auth"."uid"() AS "uid") = "seller_id") OR (EXISTS ( SELECT 1
   FROM "public"."quotes"
  WHERE (("quotes"."id" = "quote_responses"."quote_id") AND ("quotes"."buyer_id" = ( SELECT "auth"."uid"() AS "uid")))))));



CREATE POLICY "View visible portfolios or own portfolios" ON "public"."portfolio_items" FOR SELECT USING ((("is_visible" = true) OR (( SELECT "auth"."uid"() AS "uid") = "seller_id")));



ALTER TABLE "public"."activity_logs" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."admins" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."advertising_campaigns" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."ai_services" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."buyers" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."categories" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."category_visits" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."conversations" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."coupons" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."disputes" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."earnings_transactions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."favorites" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."messages" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."notifications" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."orders" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."payments" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."portfolio_items" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."premium_placements" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."quote_responses" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."quotes" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."refunds" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."reports" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."reviews" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."schema_migrations" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."search_logs" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."seller_earnings" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."sellers" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."service_categories" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."service_packages" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."service_tags" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."services" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."settlement_details" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."settlements" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."tags" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_coupons" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_wallets" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."users" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."wallet_transactions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."withdrawal_requests" ENABLE ROW LEVEL SECURITY;


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";



GRANT ALL ON FUNCTION "public"."create_seller_earnings"() TO "anon";
GRANT ALL ON FUNCTION "public"."create_seller_earnings"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_seller_earnings"() TO "service_role";



GRANT ALL ON FUNCTION "public"."create_user_wallet"() TO "anon";
GRANT ALL ON FUNCTION "public"."create_user_wallet"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_user_wallet"() TO "service_role";



GRANT ALL ON FUNCTION "public"."generate_order_number"() TO "anon";
GRANT ALL ON FUNCTION "public"."generate_order_number"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."generate_order_number"() TO "service_role";



GRANT ALL ON FUNCTION "public"."generate_service_slug"() TO "anon";
GRANT ALL ON FUNCTION "public"."generate_service_slug"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."generate_service_slug"() TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";



GRANT ALL ON FUNCTION "public"."is_admin"() TO "anon";
GRANT ALL ON FUNCTION "public"."is_admin"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_admin"() TO "service_role";



GRANT ALL ON FUNCTION "public"."is_buyer"() TO "anon";
GRANT ALL ON FUNCTION "public"."is_buyer"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_buyer"() TO "service_role";



GRANT ALL ON FUNCTION "public"."is_buyer"("check_user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."is_buyer"("check_user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_buyer"("check_user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."is_seller"() TO "anon";
GRANT ALL ON FUNCTION "public"."is_seller"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_seller"() TO "service_role";



GRANT ALL ON FUNCTION "public"."is_seller"("check_user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."is_seller"("check_user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_seller"("check_user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."is_verified_seller"("check_user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."is_verified_seller"("check_user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_verified_seller"("check_user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."owns_service"("service_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."owns_service"("service_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."owns_service"("service_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."update_coupon_issued_quantity"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_coupon_issued_quantity"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_coupon_issued_quantity"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_quote_response_count"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_quote_response_count"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_quote_response_count"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_users_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_users_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_users_updated_at"() TO "service_role";



GRANT ALL ON TABLE "public"."activity_logs" TO "anon";
GRANT ALL ON TABLE "public"."activity_logs" TO "authenticated";
GRANT ALL ON TABLE "public"."activity_logs" TO "service_role";



GRANT ALL ON TABLE "public"."admins" TO "anon";
GRANT ALL ON TABLE "public"."admins" TO "authenticated";
GRANT ALL ON TABLE "public"."admins" TO "service_role";



GRANT ALL ON TABLE "public"."advertising_campaigns" TO "anon";
GRANT ALL ON TABLE "public"."advertising_campaigns" TO "authenticated";
GRANT ALL ON TABLE "public"."advertising_campaigns" TO "service_role";



GRANT ALL ON TABLE "public"."ai_services" TO "anon";
GRANT ALL ON TABLE "public"."ai_services" TO "authenticated";
GRANT ALL ON TABLE "public"."ai_services" TO "service_role";



GRANT ALL ON TABLE "public"."buyers" TO "anon";
GRANT ALL ON TABLE "public"."buyers" TO "authenticated";
GRANT ALL ON TABLE "public"."buyers" TO "service_role";



GRANT ALL ON TABLE "public"."categories" TO "anon";
GRANT ALL ON TABLE "public"."categories" TO "authenticated";
GRANT ALL ON TABLE "public"."categories" TO "service_role";



GRANT ALL ON TABLE "public"."category_visits" TO "anon";
GRANT ALL ON TABLE "public"."category_visits" TO "authenticated";
GRANT ALL ON TABLE "public"."category_visits" TO "service_role";



GRANT ALL ON TABLE "public"."conversations" TO "anon";
GRANT ALL ON TABLE "public"."conversations" TO "authenticated";
GRANT ALL ON TABLE "public"."conversations" TO "service_role";



GRANT ALL ON TABLE "public"."coupons" TO "anon";
GRANT ALL ON TABLE "public"."coupons" TO "authenticated";
GRANT ALL ON TABLE "public"."coupons" TO "service_role";



GRANT ALL ON TABLE "public"."disputes" TO "anon";
GRANT ALL ON TABLE "public"."disputes" TO "authenticated";
GRANT ALL ON TABLE "public"."disputes" TO "service_role";



GRANT ALL ON TABLE "public"."earnings_transactions" TO "anon";
GRANT ALL ON TABLE "public"."earnings_transactions" TO "authenticated";
GRANT ALL ON TABLE "public"."earnings_transactions" TO "service_role";



GRANT ALL ON TABLE "public"."favorites" TO "anon";
GRANT ALL ON TABLE "public"."favorites" TO "authenticated";
GRANT ALL ON TABLE "public"."favorites" TO "service_role";



GRANT ALL ON TABLE "public"."messages" TO "anon";
GRANT ALL ON TABLE "public"."messages" TO "authenticated";
GRANT ALL ON TABLE "public"."messages" TO "service_role";



GRANT ALL ON TABLE "public"."notifications" TO "anon";
GRANT ALL ON TABLE "public"."notifications" TO "authenticated";
GRANT ALL ON TABLE "public"."notifications" TO "service_role";



GRANT ALL ON SEQUENCE "public"."order_number_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."order_number_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."order_number_seq" TO "service_role";



GRANT ALL ON TABLE "public"."orders" TO "anon";
GRANT ALL ON TABLE "public"."orders" TO "authenticated";
GRANT ALL ON TABLE "public"."orders" TO "service_role";



GRANT ALL ON TABLE "public"."payments" TO "anon";
GRANT ALL ON TABLE "public"."payments" TO "authenticated";
GRANT ALL ON TABLE "public"."payments" TO "service_role";



GRANT ALL ON TABLE "public"."portfolio_items" TO "anon";
GRANT ALL ON TABLE "public"."portfolio_items" TO "authenticated";
GRANT ALL ON TABLE "public"."portfolio_items" TO "service_role";



GRANT ALL ON TABLE "public"."premium_placements" TO "anon";
GRANT ALL ON TABLE "public"."premium_placements" TO "authenticated";
GRANT ALL ON TABLE "public"."premium_placements" TO "service_role";



GRANT ALL ON TABLE "public"."quote_responses" TO "anon";
GRANT ALL ON TABLE "public"."quote_responses" TO "authenticated";
GRANT ALL ON TABLE "public"."quote_responses" TO "service_role";



GRANT ALL ON TABLE "public"."quotes" TO "anon";
GRANT ALL ON TABLE "public"."quotes" TO "authenticated";
GRANT ALL ON TABLE "public"."quotes" TO "service_role";



GRANT ALL ON TABLE "public"."refunds" TO "anon";
GRANT ALL ON TABLE "public"."refunds" TO "authenticated";
GRANT ALL ON TABLE "public"."refunds" TO "service_role";



GRANT ALL ON TABLE "public"."reports" TO "anon";
GRANT ALL ON TABLE "public"."reports" TO "authenticated";
GRANT ALL ON TABLE "public"."reports" TO "service_role";



GRANT ALL ON TABLE "public"."reviews" TO "anon";
GRANT ALL ON TABLE "public"."reviews" TO "authenticated";
GRANT ALL ON TABLE "public"."reviews" TO "service_role";



GRANT ALL ON TABLE "public"."schema_migrations" TO "anon";
GRANT ALL ON TABLE "public"."schema_migrations" TO "authenticated";
GRANT ALL ON TABLE "public"."schema_migrations" TO "service_role";



GRANT ALL ON TABLE "public"."search_logs" TO "anon";
GRANT ALL ON TABLE "public"."search_logs" TO "authenticated";
GRANT ALL ON TABLE "public"."search_logs" TO "service_role";



GRANT ALL ON TABLE "public"."seller_earnings" TO "anon";
GRANT ALL ON TABLE "public"."seller_earnings" TO "authenticated";
GRANT ALL ON TABLE "public"."seller_earnings" TO "service_role";



GRANT ALL ON TABLE "public"."sellers" TO "anon";
GRANT ALL ON TABLE "public"."sellers" TO "authenticated";
GRANT ALL ON TABLE "public"."sellers" TO "service_role";



GRANT ALL ON TABLE "public"."service_categories" TO "anon";
GRANT ALL ON TABLE "public"."service_categories" TO "authenticated";
GRANT ALL ON TABLE "public"."service_categories" TO "service_role";



GRANT ALL ON TABLE "public"."service_packages" TO "anon";
GRANT ALL ON TABLE "public"."service_packages" TO "authenticated";
GRANT ALL ON TABLE "public"."service_packages" TO "service_role";



GRANT ALL ON TABLE "public"."service_tags" TO "anon";
GRANT ALL ON TABLE "public"."service_tags" TO "authenticated";
GRANT ALL ON TABLE "public"."service_tags" TO "service_role";



GRANT ALL ON TABLE "public"."services" TO "anon";
GRANT ALL ON TABLE "public"."services" TO "authenticated";
GRANT ALL ON TABLE "public"."services" TO "service_role";



GRANT ALL ON TABLE "public"."settlement_details" TO "anon";
GRANT ALL ON TABLE "public"."settlement_details" TO "authenticated";
GRANT ALL ON TABLE "public"."settlement_details" TO "service_role";



GRANT ALL ON TABLE "public"."settlements" TO "anon";
GRANT ALL ON TABLE "public"."settlements" TO "authenticated";
GRANT ALL ON TABLE "public"."settlements" TO "service_role";



GRANT ALL ON TABLE "public"."tags" TO "anon";
GRANT ALL ON TABLE "public"."tags" TO "authenticated";
GRANT ALL ON TABLE "public"."tags" TO "service_role";



GRANT ALL ON TABLE "public"."user_coupons" TO "anon";
GRANT ALL ON TABLE "public"."user_coupons" TO "authenticated";
GRANT ALL ON TABLE "public"."user_coupons" TO "service_role";



GRANT ALL ON TABLE "public"."user_wallets" TO "anon";
GRANT ALL ON TABLE "public"."user_wallets" TO "authenticated";
GRANT ALL ON TABLE "public"."user_wallets" TO "service_role";



GRANT ALL ON TABLE "public"."users" TO "anon";
GRANT ALL ON TABLE "public"."users" TO "authenticated";
GRANT ALL ON TABLE "public"."users" TO "service_role";



GRANT ALL ON TABLE "public"."wallet_transactions" TO "anon";
GRANT ALL ON TABLE "public"."wallet_transactions" TO "authenticated";
GRANT ALL ON TABLE "public"."wallet_transactions" TO "service_role";



GRANT ALL ON TABLE "public"."withdrawal_requests" TO "anon";
GRANT ALL ON TABLE "public"."withdrawal_requests" TO "authenticated";
GRANT ALL ON TABLE "public"."withdrawal_requests" TO "service_role";



ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";







