-- =====================================================
-- 돌파구 동네 배달 - DB 스키마
-- 수수료: 음식점 건당 300원, 라이더 건당 100원
-- =====================================================

-- 1. 음식점 카테고리 ENUM
CREATE TYPE food_store_category AS ENUM (
  'korean',      -- 한식
  'chinese',     -- 중식
  'japanese',    -- 일식
  'western',     -- 양식
  'chicken',     -- 치킨
  'pizza',       -- 피자
  'burger',      -- 버거
  'snack',       -- 분식
  'cafe',        -- 카페/디저트
  'asian',       -- 아시안
  'lunchbox',    -- 도시락
  'nightfood',   -- 야식
  'etc'          -- 기타
);

-- 2. 주문 상태 ENUM
CREATE TYPE food_order_status AS ENUM (
  'pending',      -- 주문 대기 (고객 주문 완료)
  'accepted',     -- 접수 완료 (음식점 수락)
  'cooking',      -- 조리 중
  'ready',        -- 조리 완료 (픽업 대기)
  'picked_up',    -- 라이더 픽업 완료
  'delivering',   -- 배달 중
  'delivered',    -- 배달 완료
  'cancelled'     -- 주문 취소
);

-- 3. 음식점 테이블
CREATE TABLE food_stores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- 기본 정보
  name VARCHAR(100) NOT NULL,
  description TEXT,
  category food_store_category NOT NULL DEFAULT 'etc',

  -- 위치 정보
  address VARCHAR(255) NOT NULL,
  address_detail VARCHAR(100),
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),

  -- 연락처
  phone VARCHAR(20) NOT NULL,

  -- 영업 정보
  business_hours JSONB DEFAULT '{"mon": {"open": "09:00", "close": "21:00"}, "tue": {"open": "09:00", "close": "21:00"}, "wed": {"open": "09:00", "close": "21:00"}, "thu": {"open": "09:00", "close": "21:00"}, "fri": {"open": "09:00", "close": "21:00"}, "sat": {"open": "09:00", "close": "21:00"}, "sun": {"open": "09:00", "close": "21:00"}}',
  closed_days TEXT[], -- 휴무일 (예: ['mon', 'tue'])

  -- 배달 정보
  min_order_amount INTEGER DEFAULT 10000, -- 최소 주문 금액
  delivery_fee INTEGER DEFAULT 3000, -- 배달비 (라이더에게 지급)
  delivery_radius INTEGER DEFAULT 3000, -- 배달 반경 (미터)
  estimated_prep_time INTEGER DEFAULT 30, -- 예상 조리 시간 (분)

  -- 이미지
  logo_url TEXT,
  banner_url TEXT,

  -- 상태
  is_open BOOLEAN DEFAULT false, -- 영업 중 여부 (사장님이 수동 설정)
  is_verified BOOLEAN DEFAULT false, -- 관리자 승인 여부
  is_active BOOLEAN DEFAULT true, -- 활성화 여부

  -- 통계
  rating DECIMAL(2, 1) DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  order_count INTEGER DEFAULT 0,

  -- 사업자 정보
  business_number VARCHAR(20), -- 사업자등록번호
  business_name VARCHAR(100), -- 상호명
  business_document_url TEXT, -- 사업자등록증 이미지

  -- 광고 (추후)
  is_premium BOOLEAN DEFAULT false,
  premium_until TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. 메뉴 카테고리 테이블 (음식점별 메뉴 분류)
CREATE TABLE food_menu_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES food_stores(id) ON DELETE CASCADE,
  name VARCHAR(50) NOT NULL, -- 예: "메인메뉴", "사이드", "음료"
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. 메뉴 테이블
CREATE TABLE food_menus (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES food_stores(id) ON DELETE CASCADE,
  category_id UUID REFERENCES food_menu_categories(id) ON DELETE SET NULL,

  -- 메뉴 정보
  name VARCHAR(100) NOT NULL,
  description TEXT,
  price INTEGER NOT NULL, -- 원래 가격
  sale_price INTEGER, -- 할인 가격 (NULL이면 할인 없음)

  -- 이미지
  image_url TEXT,

  -- 상태
  is_popular BOOLEAN DEFAULT false, -- 인기 메뉴 뱃지
  is_new BOOLEAN DEFAULT false, -- 신메뉴 뱃지
  is_sold_out BOOLEAN DEFAULT false, -- 품절
  is_active BOOLEAN DEFAULT true, -- 메뉴 노출 여부

  -- 정렬
  sort_order INTEGER DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. 메뉴 옵션 그룹 테이블 (예: "맛 선택", "추가 토핑")
CREATE TABLE food_menu_option_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  menu_id UUID NOT NULL REFERENCES food_menus(id) ON DELETE CASCADE,

  name VARCHAR(50) NOT NULL, -- 예: "맛 선택"
  is_required BOOLEAN DEFAULT false, -- 필수 선택 여부
  min_select INTEGER DEFAULT 0, -- 최소 선택 개수
  max_select INTEGER DEFAULT 1, -- 최대 선택 개수
  sort_order INTEGER DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. 메뉴 옵션 항목 테이블 (예: "순한맛", "매운맛")
CREATE TABLE food_menu_option_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  option_group_id UUID NOT NULL REFERENCES food_menu_option_groups(id) ON DELETE CASCADE,

  name VARCHAR(50) NOT NULL, -- 예: "순한맛"
  price INTEGER DEFAULT 0, -- 추가 금액
  is_sold_out BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. 주문 테이블
CREATE TABLE food_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number VARCHAR(20) NOT NULL UNIQUE, -- 주문번호 (예: FD20251208001)

  -- 관계
  store_id UUID NOT NULL REFERENCES food_stores(id),
  customer_id UUID NOT NULL REFERENCES auth.users(id),
  rider_id UUID REFERENCES auth.users(id), -- 라이더 배정 후
  errand_id UUID REFERENCES errands(id), -- 심부름 연동

  -- 주문 상태
  status food_order_status DEFAULT 'pending',

  -- 주문 내용 (JSON으로 저장)
  items JSONB NOT NULL, -- [{menu_id, name, price, quantity, options: [{name, price}]}]

  -- 금액
  subtotal INTEGER NOT NULL, -- 메뉴 합계
  delivery_fee INTEGER NOT NULL, -- 배달비
  total_amount INTEGER NOT NULL, -- 총 결제 금액

  -- 수수료
  platform_fee_store INTEGER DEFAULT 300, -- 음식점 플랫폼 수수료
  platform_fee_rider INTEGER DEFAULT 100, -- 라이더 플랫폼 수수료

  -- 배달 정보
  delivery_address VARCHAR(255) NOT NULL,
  delivery_address_detail VARCHAR(100),
  delivery_latitude DECIMAL(10, 8),
  delivery_longitude DECIMAL(11, 8),

  -- 고객 정보
  customer_phone VARCHAR(20) NOT NULL,
  customer_request TEXT, -- 요청사항

  -- 결제 정보
  payment_method VARCHAR(20) DEFAULT 'card', -- card, kakao, naver 등
  payment_status VARCHAR(20) DEFAULT 'pending', -- pending, paid, refunded
  payment_id VARCHAR(100), -- PG 결제 ID

  -- 예상 시간
  estimated_prep_time INTEGER, -- 예상 조리 시간 (분)
  estimated_delivery_time INTEGER, -- 예상 배달 시간 (분)

  -- 타임스탬프
  accepted_at TIMESTAMPTZ,
  cooking_at TIMESTAMPTZ,
  ready_at TIMESTAMPTZ,
  picked_up_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  cancel_reason TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. 음식점 찜하기 테이블
CREATE TABLE food_store_favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  store_id UUID NOT NULL REFERENCES food_stores(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, store_id)
);

-- 10. 리뷰 테이블
CREATE TABLE food_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES food_orders(id) ON DELETE CASCADE,
  store_id UUID NOT NULL REFERENCES food_stores(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  content TEXT,
  image_urls TEXT[],

  -- 사장님 답글
  reply TEXT,
  reply_at TIMESTAMPTZ,

  is_visible BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(order_id) -- 주문당 1개 리뷰
);

-- 11. 장바구니 테이블
CREATE TABLE food_carts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  store_id UUID NOT NULL REFERENCES food_stores(id) ON DELETE CASCADE,

  items JSONB NOT NULL DEFAULT '[]', -- [{menu_id, name, price, quantity, options}]

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, store_id)
);

-- =====================================================
-- 인덱스
-- =====================================================

-- 음식점 검색용 인덱스
CREATE INDEX idx_food_stores_location ON food_stores(latitude, longitude);
CREATE INDEX idx_food_stores_category ON food_stores(category);
CREATE INDEX idx_food_stores_is_open ON food_stores(is_open, is_verified, is_active);
CREATE INDEX idx_food_stores_owner ON food_stores(owner_id);
CREATE INDEX idx_food_stores_name ON food_stores USING gin(to_tsvector('simple', name));

-- 메뉴 검색용 인덱스
CREATE INDEX idx_food_menus_store ON food_menus(store_id);
CREATE INDEX idx_food_menus_name ON food_menus USING gin(to_tsvector('simple', name));

-- 주문 인덱스
CREATE INDEX idx_food_orders_store ON food_orders(store_id, status);
CREATE INDEX idx_food_orders_customer ON food_orders(customer_id);
CREATE INDEX idx_food_orders_rider ON food_orders(rider_id);
CREATE INDEX idx_food_orders_created ON food_orders(created_at DESC);

-- 찜하기 인덱스
CREATE INDEX idx_food_favorites_user ON food_store_favorites(user_id);

-- =====================================================
-- RLS (Row Level Security)
-- =====================================================

ALTER TABLE food_stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE food_menu_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE food_menus ENABLE ROW LEVEL SECURITY;
ALTER TABLE food_menu_option_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE food_menu_option_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE food_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE food_store_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE food_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE food_carts ENABLE ROW LEVEL SECURITY;

-- 음식점: 누구나 조회, 사장님만 수정
CREATE POLICY "food_stores_select" ON food_stores FOR SELECT USING (true);
CREATE POLICY "food_stores_insert" ON food_stores FOR INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "food_stores_update" ON food_stores FOR UPDATE USING (auth.uid() = owner_id);
CREATE POLICY "food_stores_delete" ON food_stores FOR DELETE USING (auth.uid() = owner_id);

-- 메뉴 카테고리: 누구나 조회, 사장님만 수정
CREATE POLICY "food_menu_categories_select" ON food_menu_categories FOR SELECT USING (true);
CREATE POLICY "food_menu_categories_insert" ON food_menu_categories FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM food_stores WHERE id = store_id AND owner_id = auth.uid()));
CREATE POLICY "food_menu_categories_update" ON food_menu_categories FOR UPDATE
  USING (EXISTS (SELECT 1 FROM food_stores WHERE id = store_id AND owner_id = auth.uid()));
CREATE POLICY "food_menu_categories_delete" ON food_menu_categories FOR DELETE
  USING (EXISTS (SELECT 1 FROM food_stores WHERE id = store_id AND owner_id = auth.uid()));

-- 메뉴: 누구나 조회, 사장님만 수정
CREATE POLICY "food_menus_select" ON food_menus FOR SELECT USING (true);
CREATE POLICY "food_menus_insert" ON food_menus FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM food_stores WHERE id = store_id AND owner_id = auth.uid()));
CREATE POLICY "food_menus_update" ON food_menus FOR UPDATE
  USING (EXISTS (SELECT 1 FROM food_stores WHERE id = store_id AND owner_id = auth.uid()));
CREATE POLICY "food_menus_delete" ON food_menus FOR DELETE
  USING (EXISTS (SELECT 1 FROM food_stores WHERE id = store_id AND owner_id = auth.uid()));

-- 옵션 그룹: 누구나 조회, 사장님만 수정
CREATE POLICY "food_option_groups_select" ON food_menu_option_groups FOR SELECT USING (true);
CREATE POLICY "food_option_groups_insert" ON food_menu_option_groups FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM food_menus m
    JOIN food_stores s ON m.store_id = s.id
    WHERE m.id = menu_id AND s.owner_id = auth.uid()
  ));
CREATE POLICY "food_option_groups_update" ON food_menu_option_groups FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM food_menus m
    JOIN food_stores s ON m.store_id = s.id
    WHERE m.id = menu_id AND s.owner_id = auth.uid()
  ));
CREATE POLICY "food_option_groups_delete" ON food_menu_option_groups FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM food_menus m
    JOIN food_stores s ON m.store_id = s.id
    WHERE m.id = menu_id AND s.owner_id = auth.uid()
  ));

-- 옵션 항목: 누구나 조회, 사장님만 수정
CREATE POLICY "food_option_items_select" ON food_menu_option_items FOR SELECT USING (true);
CREATE POLICY "food_option_items_insert" ON food_menu_option_items FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM food_menu_option_groups og
    JOIN food_menus m ON og.menu_id = m.id
    JOIN food_stores s ON m.store_id = s.id
    WHERE og.id = option_group_id AND s.owner_id = auth.uid()
  ));
CREATE POLICY "food_option_items_update" ON food_menu_option_items FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM food_menu_option_groups og
    JOIN food_menus m ON og.menu_id = m.id
    JOIN food_stores s ON m.store_id = s.id
    WHERE og.id = option_group_id AND s.owner_id = auth.uid()
  ));
CREATE POLICY "food_option_items_delete" ON food_menu_option_items FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM food_menu_option_groups og
    JOIN food_menus m ON og.menu_id = m.id
    JOIN food_stores s ON m.store_id = s.id
    WHERE og.id = option_group_id AND s.owner_id = auth.uid()
  ));

-- 주문: 관련자만 조회/수정
CREATE POLICY "food_orders_select" ON food_orders FOR SELECT
  USING (
    auth.uid() = customer_id OR
    auth.uid() = rider_id OR
    EXISTS (SELECT 1 FROM food_stores WHERE id = store_id AND owner_id = auth.uid())
  );
CREATE POLICY "food_orders_insert" ON food_orders FOR INSERT WITH CHECK (auth.uid() = customer_id);
CREATE POLICY "food_orders_update" ON food_orders FOR UPDATE
  USING (
    auth.uid() = customer_id OR
    auth.uid() = rider_id OR
    EXISTS (SELECT 1 FROM food_stores WHERE id = store_id AND owner_id = auth.uid())
  );

-- 찜하기: 본인만
CREATE POLICY "food_favorites_select" ON food_store_favorites FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "food_favorites_insert" ON food_store_favorites FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "food_favorites_delete" ON food_store_favorites FOR DELETE USING (auth.uid() = user_id);

-- 리뷰: 누구나 조회, 본인만 작성
CREATE POLICY "food_reviews_select" ON food_reviews FOR SELECT USING (true);
CREATE POLICY "food_reviews_insert" ON food_reviews FOR INSERT WITH CHECK (auth.uid() = customer_id);
CREATE POLICY "food_reviews_update" ON food_reviews FOR UPDATE USING (auth.uid() = customer_id);

-- 장바구니: 본인만
CREATE POLICY "food_carts_select" ON food_carts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "food_carts_insert" ON food_carts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "food_carts_update" ON food_carts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "food_carts_delete" ON food_carts FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- 함수: 주문번호 생성
-- =====================================================

CREATE OR REPLACE FUNCTION generate_food_order_number()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  today_date TEXT;
  seq_num INTEGER;
BEGIN
  today_date := TO_CHAR(NOW(), 'YYYYMMDD');

  SELECT COALESCE(MAX(CAST(SUBSTRING(order_number FROM 11) AS INTEGER)), 0) + 1
  INTO seq_num
  FROM food_orders
  WHERE order_number LIKE 'FD' || today_date || '%';

  NEW.order_number := 'FD' || today_date || LPAD(seq_num::TEXT, 4, '0');

  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_generate_food_order_number
  BEFORE INSERT ON food_orders
  FOR EACH ROW
  EXECUTE FUNCTION generate_food_order_number();

-- =====================================================
-- 함수: 리뷰 작성 시 음식점 평점 업데이트
-- =====================================================

CREATE OR REPLACE FUNCTION update_food_store_rating()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE food_stores
  SET
    rating = (SELECT AVG(rating) FROM food_reviews WHERE store_id = NEW.store_id AND is_visible = true),
    review_count = (SELECT COUNT(*) FROM food_reviews WHERE store_id = NEW.store_id AND is_visible = true)
  WHERE id = NEW.store_id;

  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_update_food_store_rating
  AFTER INSERT OR UPDATE ON food_reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_food_store_rating();

-- =====================================================
-- 함수: 주문 완료 시 음식점 주문 수 업데이트
-- =====================================================

CREATE OR REPLACE FUNCTION update_food_store_order_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.status = 'delivered' AND (OLD.status IS NULL OR OLD.status != 'delivered') THEN
    UPDATE food_stores
    SET order_count = order_count + 1
    WHERE id = NEW.store_id;
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_update_food_store_order_count
  AFTER INSERT OR UPDATE ON food_orders
  FOR EACH ROW
  EXECUTE FUNCTION update_food_store_order_count();
