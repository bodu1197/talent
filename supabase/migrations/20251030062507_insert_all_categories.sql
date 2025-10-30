-- Insert all categories from categories-full.ts into database
-- This migration populates the categories table with all predefined categories

-- First, clear any existing categories (optional - comment out if you want to keep existing)
-- TRUNCATE TABLE categories CASCADE;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('life-service', '생활 서비스', 'life-service', 'home', '일상 생활 편의 서비스', NULL, NULL, 35, 88, 0, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('home-service', '가정 서비스', 'home-service', NULL, NULL, NULL, 'life-service', 0, 0, 1, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('cleaning-service', '청소 서비스', 'cleaning-service', NULL, NULL, NULL, 'home-service', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('housekeeping', '파출부/가사도우미', 'housekeeping', NULL, NULL, NULL, 'home-service', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('organizing-consulting', '정리정돈/수납 컨설팅', 'organizing-consulting', NULL, NULL, NULL, 'home-service', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('appliance-install', '가전 설치/수리', 'appliance-install', NULL, NULL, NULL, 'home-service', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('aircon-cleaning', '에어컨 청소', 'aircon-cleaning', NULL, NULL, NULL, 'home-service', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('pest-control', '해충방제/방역', 'pest-control', NULL, NULL, NULL, 'home-service', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('disinfection-service', '소독 서비스', 'disinfection-service', NULL, NULL, NULL, 'home-service', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('repair-service', '일반 수리 서비스', 'repair-service', NULL, NULL, NULL, 'home-service', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('moving-service', '이사 서비스', 'moving-service', NULL, NULL, NULL, 'home-service', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('daily-service', '일상 서비스', 'daily-service', NULL, NULL, NULL, 'life-service', 0, 0, 1, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('laundry-service', '세탁 서비스', 'laundry-service', NULL, NULL, NULL, 'daily-service', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('pet-care', '반려동물 케어', 'pet-care', NULL, NULL, NULL, 'daily-service', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('pet-walking', '반려동물 산책 대행', 'pet-walking', NULL, NULL, NULL, 'daily-service', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('pet-grooming', '반려동물 미용', 'pet-grooming', NULL, NULL, NULL, 'daily-service', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('babysitter', '베이비시터', 'babysitter', NULL, NULL, NULL, 'daily-service', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('senior-care', '시니어 케어/간병', 'senior-care', NULL, NULL, NULL, 'daily-service', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('vehicle-service', '차량 서비스', 'vehicle-service', NULL, NULL, NULL, 'life-service', 0, 0, 1, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('car-wash', '세차 서비스', 'car-wash', NULL, NULL, NULL, 'vehicle-service', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('car-maintenance', '차량 정비 예약 대행', 'car-maintenance', NULL, NULL, NULL, 'vehicle-service', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('designated-driver', '대리 운전', 'designated-driver', NULL, NULL, NULL, 'vehicle-service', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('chauffeur-service', '운전 기사', 'chauffeur-service', NULL, NULL, NULL, 'vehicle-service', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('booking-agency', '예약/대행 서비스', 'booking-agency', NULL, NULL, NULL, 'life-service', 0, 0, 1, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('queue-waiting', '줄서기 대행', 'queue-waiting', NULL, NULL, NULL, 'booking-agency', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('restaurant-booking', '레스토랑 예약 대행', 'restaurant-booking', NULL, NULL, NULL, 'booking-agency', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('hospital-booking', '병원 예약/동행', 'hospital-booking', NULL, NULL, NULL, 'booking-agency', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('government-office', '관공서 업무 대행', 'government-office', NULL, NULL, NULL, 'booking-agency', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('interpretation-companion', '통역 동행', 'interpretation-companion', NULL, NULL, NULL, 'booking-agency', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('rental-service', '렌탈 서비스', 'rental-service', NULL, NULL, NULL, 'life-service', 0, 0, 1, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('appliance-rental', '가전 렌탈', 'appliance-rental', NULL, NULL, NULL, 'rental-service', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('living-goods-rental', '생활용품 렌탈', 'living-goods-rental', NULL, NULL, NULL, 'rental-service', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('party-equipment-rental', '파티/이벤트 용품 렌탈', 'party-equipment-rental', NULL, NULL, NULL, 'rental-service', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('errands', '심부름', 'errands', 'motorcycle', '빠른 배달 및 심부름 서비스', NULL, NULL, 13, 75, 0, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('delivery-service', '배달 서비스', 'delivery-service', NULL, NULL, NULL, 'errands', 0, 0, 1, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('quick-delivery', '퀵 서비스', 'quick-delivery', NULL, NULL, NULL, 'delivery-service', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('document-delivery', '서류 배달', 'document-delivery', NULL, NULL, NULL, 'delivery-service', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('package-delivery', '택배 대행', 'package-delivery', NULL, NULL, NULL, 'delivery-service', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('food-delivery', '음식 배달 대행', 'food-delivery', NULL, NULL, NULL, 'delivery-service', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('medicine-delivery', '약 배달', 'medicine-delivery', NULL, NULL, NULL, 'delivery-service', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('flower-delivery', '꽃 배달', 'flower-delivery', NULL, NULL, NULL, 'delivery-service', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('gift-delivery', '선물 배달', 'gift-delivery', NULL, NULL, NULL, 'delivery-service', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('errand-service', '심부름 대행', 'errand-service', NULL, NULL, NULL, 'errands', 0, 0, 1, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('shopping-errands', '장보기 대행', 'shopping-errands', NULL, NULL, NULL, 'errand-service', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('pickup-service', '픽업 서비스', 'pickup-service', NULL, NULL, NULL, 'errand-service', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('secondhand-trade', '중고 거래 대행', 'secondhand-trade', NULL, NULL, NULL, 'errand-service', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('return-exchange', '반품/교환 대행', 'return-exchange', NULL, NULL, NULL, 'errand-service', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('postal-service', '우편 업무 대행', 'postal-service', NULL, NULL, NULL, 'errand-service', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('ai-services', 'AI 서비스', 'ai-services', 'robot', NULL, NULL, NULL, 16, 999, 0, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('ai-design', 'AI 디자인', 'ai-design', NULL, NULL, NULL, 'ai-services', 0, 0, 1, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('ai-illustration', 'AI 일러스트', 'ai-illustration', NULL, NULL, NULL, 'ai-design', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('ai-photorealistic-model', 'AI 실사·모델', 'ai-photorealistic-model', NULL, NULL, NULL, 'ai-design', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('ai-ad-material-design', 'AI 광고소재 디자인', 'ai-ad-material-design', NULL, NULL, NULL, 'ai-design', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('ai-character-design', 'AI 캐릭터 디자인', 'ai-character-design', NULL, NULL, NULL, 'ai-design', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('ai-product-package-design', 'AI 제품·패키지 디자인', 'ai-product-package-design', NULL, NULL, NULL, 'ai-design', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('ai-space-design', 'AI 공간 디자인', 'ai-space-design', NULL, NULL, NULL, 'ai-design', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('ai-retouching-composition', 'AI 보정·누끼·합성', 'ai-retouching-composition', NULL, NULL, NULL, 'ai-design', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('ai-book-cover', 'AI 책 표지', 'ai-book-cover', NULL, NULL, NULL, 'ai-design', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('ai-design-etc', 'AI 디자인 기타', 'ai-design-etc', NULL, NULL, NULL, 'ai-design', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('ai-image', 'AI 이미지', 'ai-image', NULL, NULL, NULL, 'ai-services', 0, 0, 1, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('ai-profile-photo', 'AI 프로필 사진 생성', 'ai-profile-photo', NULL, NULL, NULL, 'ai-image', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('ai-product-image', 'AI 제품 이미지 제작', 'ai-product-image', NULL, NULL, NULL, 'ai-image', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('ai-logo-design', 'AI 로고 디자인', 'ai-logo-design', NULL, NULL, NULL, 'ai-image', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('ai-illustration-character', 'AI 일러스트/캐릭터', 'ai-illustration-character', NULL, NULL, NULL, 'ai-image', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('ai-background-remove', 'AI 배경 제거/교체', 'ai-background-remove', NULL, NULL, NULL, 'ai-image', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('ai-upscaling', 'AI 이미지 업스케일링', 'ai-upscaling', NULL, NULL, NULL, 'ai-image', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('ai-brand-identity', 'AI 브랜드 아이덴티티', 'ai-brand-identity', NULL, NULL, NULL, 'ai-image', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('ai-interior-rendering', 'AI 인테리어 렌더링', 'ai-interior-rendering', NULL, NULL, NULL, 'ai-image', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('ai-fashion-lookbook', 'AI 패션 룩북', 'ai-fashion-lookbook', NULL, NULL, NULL, 'ai-image', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('ai-development', 'AI 개발', 'ai-development', NULL, NULL, NULL, 'ai-services', 0, 0, 1, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('ai-website-creation', 'AI 웹사이트 제작', 'ai-website-creation', NULL, NULL, NULL, 'ai-development', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('ai-app-development', 'AI 앱 개발 (MVP)', 'ai-app-development', NULL, NULL, NULL, 'ai-development', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('ai-code-review', 'AI 코드 리뷰/최적화', 'ai-code-review', NULL, NULL, NULL, 'ai-development', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('ai-bug-fixing', 'AI 버그 수정', 'ai-bug-fixing', NULL, NULL, NULL, 'ai-development', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('ai-database-design', 'AI 데이터베이스 설계', 'ai-database-design', NULL, NULL, NULL, 'ai-development', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('ai-api-integration', 'AI API 통합', 'ai-api-integration', NULL, NULL, NULL, 'ai-development', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('ai-chrome-extension', 'AI 크롬 익스텐션', 'ai-chrome-extension', NULL, NULL, NULL, 'ai-development', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('ai-automation-script', 'AI 자동화 스크립트', 'ai-automation-script', NULL, NULL, NULL, 'ai-development', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('ai-prompt', 'AI 프롬프트', 'ai-prompt', NULL, NULL, NULL, 'ai-services', 0, 0, 1, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('ai-prompt-child', 'AI 프롬프트', 'ai-prompt-child', NULL, NULL, NULL, 'ai-prompt', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('ai-marketing', 'AI 마케팅', 'ai-marketing', NULL, NULL, NULL, 'ai-services', 0, 0, 1, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('ai-competitor-analysis', 'AI 경쟁사 분석', 'ai-competitor-analysis', NULL, NULL, NULL, 'ai-marketing', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('ai-keyword-research', 'AI 키워드 리서치', 'ai-keyword-research', NULL, NULL, NULL, 'ai-marketing', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('ai-ad-copy', 'AI 광고 카피 제작', 'ai-ad-copy', NULL, NULL, NULL, 'ai-marketing', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('ai-marketing-strategy', 'AI 마케팅 전략 수립', 'ai-marketing-strategy', NULL, NULL, NULL, 'ai-marketing', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('ai-social-media-management', 'AI 소셜미디어 관리', 'ai-social-media-management', NULL, NULL, NULL, 'ai-marketing', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('ai-influencer-matching', 'AI 인플루언서 매칭', 'ai-influencer-matching', NULL, NULL, NULL, 'ai-marketing', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('ai-performance-report', 'AI 퍼포먼스 리포트', 'ai-performance-report', NULL, NULL, NULL, 'ai-marketing', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('ai-ab-test', 'AI A/B 테스트 분석', 'ai-ab-test', NULL, NULL, NULL, 'ai-marketing', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('ai-video', 'AI 영상', 'ai-video', NULL, NULL, NULL, 'ai-services', 0, 0, 1, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('ai-short-form-video', 'AI 숏폼 영상 (릴스/쇼츠/틱톡)', 'ai-short-form-video', NULL, NULL, NULL, 'ai-video', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('ai-ad-video', 'AI 광고 영상', 'ai-ad-video', NULL, NULL, NULL, 'ai-video', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('ai-avatar-video', 'AI 아바타 영상', 'ai-avatar-video', NULL, NULL, NULL, 'ai-video', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('ai-subtitle-generation', 'AI 자막 생성/번역', 'ai-subtitle-generation', NULL, NULL, NULL, 'ai-video', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('ai-video-editing', 'AI 영상 편집', 'ai-video-editing', NULL, NULL, NULL, 'ai-video', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('ai-motion-graphics', 'AI 모션 그래픽', 'ai-motion-graphics', NULL, NULL, NULL, 'ai-video', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('ai-product-promo-video', 'AI 제품 홍보 영상', 'ai-product-promo-video', NULL, NULL, NULL, 'ai-video', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('ai-education-video', 'AI 교육 콘텐츠 영상', 'ai-education-video', NULL, NULL, NULL, 'ai-video', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('ai-lipsync-video', 'AI 립싱크 영상', 'ai-lipsync-video', NULL, NULL, NULL, 'ai-video', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('ai-sound', 'AI 음향', 'ai-sound', NULL, NULL, NULL, 'ai-services', 0, 0, 1, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('ai-voice-dubbing', 'AI 성우 더빙', 'ai-voice-dubbing', NULL, NULL, NULL, 'ai-sound', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('ai-music-production', 'AI 노래/음악 제작', 'ai-music-production', NULL, NULL, NULL, 'ai-sound', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('ai-podcast', 'AI 팟캐스트 제작', 'ai-podcast', NULL, NULL, NULL, 'ai-sound', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('ai-sound-effect', 'AI 효과음/배경음악', 'ai-sound-effect', NULL, NULL, NULL, 'ai-sound', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('ai-voice-translation', 'AI 음성 번역', 'ai-voice-translation', NULL, NULL, NULL, 'ai-sound', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('ai-audiobook', 'AI 오디오북 제작', 'ai-audiobook', NULL, NULL, NULL, 'ai-sound', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('ai-ad-narration', 'AI 광고 나레이션', 'ai-ad-narration', NULL, NULL, NULL, 'ai-sound', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('ai-asmr', 'AI ASMR 콘텐츠', 'ai-asmr', NULL, NULL, NULL, 'ai-sound', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('ai-content-writing', 'AI 콘텐츠 라이팅', 'ai-content-writing', NULL, NULL, NULL, 'ai-services', 0, 0, 1, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('ai-blog-posting', 'AI 블로그 포스팅', 'ai-blog-posting', NULL, NULL, NULL, 'ai-content-writing', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('ai-seo-writing', 'AI SEO 글쓰기', 'ai-seo-writing', NULL, NULL, NULL, 'ai-content-writing', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('ai-shopping-detail-page', 'AI 쇼핑몰 상세페이지', 'ai-shopping-detail-page', NULL, NULL, NULL, 'ai-content-writing', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('ai-social-media-content', 'AI 소셜미디어 콘텐츠', 'ai-social-media-content', NULL, NULL, NULL, 'ai-content-writing', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('ai-email-marketing', 'AI 이메일 마케팅 문구', 'ai-email-marketing', NULL, NULL, NULL, 'ai-content-writing', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('ai-press-release', 'AI 보도자료 작성', 'ai-press-release', NULL, NULL, NULL, 'ai-content-writing', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('ai-ebook-guide', 'AI 전자책/가이드북', 'ai-ebook-guide', NULL, NULL, NULL, 'ai-content-writing', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('ai-youtube-script', 'AI 유튜브 대본', 'ai-youtube-script', NULL, NULL, NULL, 'ai-content-writing', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('ai-translation-localization', 'AI 번역/현지화', 'ai-translation-localization', NULL, NULL, NULL, 'ai-content-writing', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('ai-startup-monetization', 'AI 창업·수익화', 'ai-startup-monetization', NULL, NULL, NULL, 'ai-services', 0, 0, 1, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('ai-business-monetization-ebook', 'AI 사업·수익화 전자책', 'ai-business-monetization-ebook', NULL, NULL, NULL, 'ai-startup-monetization', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('ai-startup-consulting', 'AI 창업 자문', 'ai-startup-consulting', NULL, NULL, NULL, 'ai-startup-monetization', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('ai-management-operation-consulting', 'AI 경영·운영 자문', 'ai-management-operation-consulting', NULL, NULL, NULL, 'ai-startup-monetization', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('ai-business-automation', 'AI 비즈니스 자동화', 'ai-business-automation', NULL, NULL, NULL, 'ai-services', 0, 0, 1, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('ai-chatbot-build', 'AI 챗봇 구축', 'ai-chatbot-build', NULL, NULL, NULL, 'ai-business-automation', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('ai-data-analysis-report', 'AI 데이터 분석 리포트', 'ai-data-analysis-report', NULL, NULL, NULL, 'ai-business-automation', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('ai-excel-automation', 'AI 엑셀 자동화', 'ai-excel-automation', NULL, NULL, NULL, 'ai-business-automation', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('ai-meeting-minutes', 'AI 회의록 작성', 'ai-meeting-minutes', NULL, NULL, NULL, 'ai-business-automation', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('ai-presentation-creation', 'AI 프레젠테이션 제작', 'ai-presentation-creation', NULL, NULL, NULL, 'ai-business-automation', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('ai-business-plan', 'AI 사업계획서 작성', 'ai-business-plan', NULL, NULL, NULL, 'ai-business-automation', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('ai-market-research', 'AI 시장조사 리포트', 'ai-market-research', NULL, NULL, NULL, 'ai-business-automation', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('ai-rpa-automation', 'AI RPA 자동화', 'ai-rpa-automation', NULL, NULL, NULL, 'ai-business-automation', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('ai-education-consulting', 'AI 교육/컨설팅', 'ai-education-consulting', NULL, NULL, NULL, 'ai-services', 0, 0, 1, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('ai-tool-training', 'AI 도구 사용법 교육', 'ai-tool-training', NULL, NULL, NULL, 'ai-education-consulting', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('ai-prompt-engineering-training', 'AI 프롬프트 엔지니어링', 'ai-prompt-engineering-training', NULL, NULL, NULL, 'ai-education-consulting', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('ai-workflow-build', 'AI 워크플로우 구축', 'ai-workflow-build', NULL, NULL, NULL, 'ai-education-consulting', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('ai-business-application-consulting', 'AI 비즈니스 적용 컨설팅', 'ai-business-application-consulting', NULL, NULL, NULL, 'ai-education-consulting', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('ai-adoption-strategy', 'AI 도입 전략 수립', 'ai-adoption-strategy', NULL, NULL, NULL, 'ai-education-consulting', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('ai-custom-training', '맞춤형 AI 교육 프로그램', 'ai-custom-training', NULL, NULL, NULL, 'ai-education-consulting', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('ai-specialized-service', 'AI 특화 서비스', 'ai-specialized-service', NULL, NULL, NULL, 'ai-services', 0, 0, 1, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('ai-resume-cover-letter', 'AI 이력서/자소서', 'ai-resume-cover-letter', NULL, NULL, NULL, 'ai-specialized-service', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('ai-interview-prep', 'AI 면접 준비', 'ai-interview-prep', NULL, NULL, NULL, 'ai-specialized-service', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('ai-legal-document-review', 'AI 법률 문서 검토', 'ai-legal-document-review', NULL, NULL, NULL, 'ai-specialized-service', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('ai-medical-info', 'AI 의료 정보 정리', 'ai-medical-info', NULL, NULL, NULL, 'ai-specialized-service', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('ai-real-estate-analysis', 'AI 부동산 시세 분석', 'ai-real-estate-analysis', NULL, NULL, NULL, 'ai-specialized-service', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('ai-financial-data-analysis', 'AI 금융 데이터 분석', 'ai-financial-data-analysis', NULL, NULL, NULL, 'ai-specialized-service', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('ai-learning-plan', 'AI 학습 플랜 생성', 'ai-learning-plan', NULL, NULL, NULL, 'ai-specialized-service', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('ai-integrated-solution', 'AI 통합 솔루션', 'ai-integrated-solution', NULL, NULL, NULL, 'ai-services', 0, 0, 1, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('ai-branding-package', 'AI 브랜딩 풀패키지', 'ai-branding-package', NULL, NULL, NULL, 'ai-integrated-solution', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('ai-startup-launch-package', 'AI 스타트업 런칭 패키지', 'ai-startup-launch-package', NULL, NULL, NULL, 'ai-integrated-solution', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('ai-marketing-full-package', 'AI 마케팅 풀패키지', 'ai-marketing-full-package', NULL, NULL, NULL, 'ai-integrated-solution', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('ai-content-subscription', 'AI 콘텐츠 구독 서비스', 'ai-content-subscription', NULL, NULL, NULL, 'ai-integrated-solution', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('ai-employment-admission', 'AI 취업·입시', 'ai-employment-admission', NULL, NULL, NULL, 'ai-services', 0, 0, 1, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('ai-employment-admission-consulting', 'AI 취업·입시 컨설팅', 'ai-employment-admission-consulting', NULL, NULL, NULL, 'ai-employment-admission', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('ai-education', 'AI 교육', 'ai-education', NULL, NULL, NULL, 'ai-services', 0, 0, 1, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('ai-skill-ebook', 'AI 스킬 전자책', 'ai-skill-ebook', NULL, NULL, NULL, 'ai-education', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('ai-work-utilization-lesson', 'AI 업무 활용 레슨', 'ai-work-utilization-lesson', NULL, NULL, NULL, 'ai-education', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('ai-development-analysis-lesson', 'AI 개발·분석 레슨', 'ai-development-analysis-lesson', NULL, NULL, NULL, 'ai-education', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('ai-marketing-lesson', 'AI 마케팅 레슨', 'ai-marketing-lesson', NULL, NULL, NULL, 'ai-education', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('ai-content-production-lesson', 'AI 콘텐츠 제작 레슨', 'ai-content-production-lesson', NULL, NULL, NULL, 'ai-education', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('etc-ai-lesson', '기타 AI 레슨', 'etc-ai-lesson', NULL, NULL, NULL, 'ai-education', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('ai-translation-interpretation', 'AI 통·번역', 'ai-translation-interpretation', NULL, NULL, NULL, 'ai-services', 0, 0, 1, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('ai-translation-review-editing', 'AI 번역 검수·편집', 'ai-translation-review-editing', NULL, NULL, NULL, 'ai-translation-interpretation', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('ai-interpretation', 'AI 통역', 'ai-interpretation', NULL, NULL, NULL, 'ai-translation-interpretation', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('design', '디자인', 'design', 'palette', '창의적인 디자인 솔루션', NULL, NULL, 58, 95, 0, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('logo-branding', '로고·브랜딩', 'logo-branding', NULL, NULL, NULL, 'design', 0, 0, 1, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('logo-design', '로고 디자인', 'logo-design', NULL, NULL, NULL, 'logo-branding', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('brand-design-guide', '브랜드 디자인·가이드', 'brand-design-guide', NULL, NULL, NULL, 'logo-branding', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('print-promotional', '인쇄·홍보물', 'print-promotional', NULL, NULL, NULL, 'design', 0, 0, 1, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('business-card', '명함', 'business-card', NULL, NULL, NULL, 'print-promotional', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('flyer-poster-print', '전단지·포스터·인쇄물', 'flyer-poster-print', NULL, NULL, NULL, 'print-promotional', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('banner-x-banner', '현수막·X배너', 'banner-x-banner', NULL, NULL, NULL, 'print-promotional', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('menu-board', '메뉴판', 'menu-board', NULL, NULL, NULL, 'print-promotional', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('promotional-print-output', '홍보물 인쇄·출력', 'promotional-print-output', NULL, NULL, NULL, 'print-promotional', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('sticker-envelope-invitation', '스티커·봉투·초대장', 'sticker-envelope-invitation', NULL, NULL, NULL, 'print-promotional', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('web-mobile-design', '웹·모바일 디자인', 'web-mobile-design', NULL, NULL, NULL, 'design', 0, 0, 1, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('web-ui-ux', '웹 UI·UX', 'web-ui-ux', NULL, NULL, NULL, 'web-mobile-design', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('app-mobile-ui-ux', '앱·모바일 UI·UX', 'app-mobile-ui-ux', NULL, NULL, NULL, 'web-mobile-design', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('template-homepage', '템플릿형 홈페이지', 'template-homepage', NULL, NULL, NULL, 'web-mobile-design', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('icon-button', '아이콘·버튼', 'icon-button', NULL, NULL, NULL, 'web-mobile-design', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('ai-design', 'AI 디자인', 'ai-design', NULL, NULL, NULL, 'design', 0, 0, 1, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('ai-design-service', 'AI 디자인', 'ai-design-service', NULL, NULL, NULL, 'ai-design', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('marketing-design', '마케팅 디자인', 'marketing-design', NULL, NULL, NULL, 'design', 0, 0, 1, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('detail-page', '상세페이지', 'detail-page', NULL, NULL, NULL, 'marketing-design', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('sns-ad-thumbnail', 'SNS·광고소재·썸네일', 'sns-ad-thumbnail', NULL, NULL, NULL, 'marketing-design', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('channel-art-design', '채널아트 디자인', 'channel-art-design', NULL, NULL, NULL, 'marketing-design', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('broadcast-avatar', '방송용 아바타', 'broadcast-avatar', NULL, NULL, NULL, 'marketing-design', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('banner-delivery-app', '배너·배달어플', 'banner-delivery-app', NULL, NULL, NULL, 'marketing-design', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('blog-cafe-design', '블로그·카페 디자인', 'blog-cafe-design', NULL, NULL, NULL, 'marketing-design', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('package-cover', '패키지·커버', 'package-cover', NULL, NULL, NULL, 'design', 0, 0, 1, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('package', '패키지', 'package', NULL, NULL, NULL, 'package-cover', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('book-cover-interior', '책표지·내지', 'book-cover-interior', NULL, NULL, NULL, 'package-cover', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('ebook-cover-interior', '전자책 표지·내지', 'ebook-cover-interior', NULL, NULL, NULL, 'package-cover', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('album-cover', '앨범커버', 'album-cover', NULL, NULL, NULL, 'package-cover', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('character-illustration', '캐릭터·일러스트', 'character-illustration', NULL, NULL, NULL, 'design', 0, 0, 1, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('illustration', '일러스트', 'illustration', NULL, NULL, NULL, 'character-illustration', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('caricature', '캐리커쳐', 'caricature', NULL, NULL, NULL, 'character-illustration', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('webtoon-storyboard', '웹툰·콘티', 'webtoon-storyboard', NULL, NULL, NULL, 'character-illustration', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('2d-character', '2D 캐릭터', '2d-character', NULL, NULL, NULL, 'character-illustration', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('emoticon', '이모티콘', 'emoticon', NULL, NULL, NULL, 'character-illustration', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('graphic-design', '그래픽 디자인', 'graphic-design', NULL, NULL, NULL, 'design', 0, 0, 1, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('ppt-infographic', 'PPT·인포그래픽', 'ppt-infographic', NULL, NULL, NULL, 'graphic-design', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('photoshop-file-conversion', '포토샵·파일변환', 'photoshop-file-conversion', NULL, NULL, NULL, 'graphic-design', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('3d-design', '3D 디자인', '3d-design', NULL, NULL, NULL, 'design', 0, 0, 1, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('3d-character-figure', '3D 캐릭터·피규어', '3d-character-figure', NULL, NULL, NULL, '3d-design', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('3d-product-modeling-rendering', '3D 제품모델링·렌더링', '3d-product-modeling-rendering', NULL, NULL, NULL, '3d-design', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('3d-space-modeling', '3D 공간 모델링', '3d-space-modeling', NULL, NULL, NULL, '3d-design', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('3d-clothing-jewelry', '3D 의류·쥬얼리', '3d-clothing-jewelry', NULL, NULL, NULL, '3d-design', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('3d-game-source', '3D 게임용 소스', '3d-game-source', NULL, NULL, NULL, '3d-design', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('3d-graphics', '3D 그래픽', '3d-graphics', NULL, NULL, NULL, '3d-design', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('prototype-3d-printing', '시제품·3D프린팅', 'prototype-3d-printing', NULL, NULL, NULL, '3d-design', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('game-web3', '게임·웹3.0', 'game-web3', NULL, NULL, NULL, 'design', 0, 0, 1, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('vr-ar-game', 'VR·AR·게임', 'vr-ar-game', NULL, NULL, NULL, 'game-web3', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('metaverse', '메타버스', 'metaverse', NULL, NULL, NULL, 'game-web3', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('nft-art', 'NFT아트', 'nft-art', NULL, NULL, NULL, 'game-web3', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('industrial-product-design', '산업·제품 디자인', 'industrial-product-design', NULL, NULL, NULL, 'design', 0, 0, 1, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('product-mechanism-design', '제품·기구 설계', 'product-mechanism-design', NULL, NULL, NULL, 'industrial-product-design', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('product-drawing-sketch', '제품 도면·스케치', 'product-drawing-sketch', NULL, NULL, NULL, 'industrial-product-design', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('space-architecture', '공간·건축', 'space-architecture', NULL, NULL, NULL, 'design', 0, 0, 1, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('drawing-creation-modification', '도면 제작·수정', 'drawing-creation-modification', NULL, NULL, NULL, 'space-architecture', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('interior-consulting', '인테리어 컨설팅', 'interior-consulting', NULL, NULL, NULL, 'space-architecture', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('exhibition-stage-design', '전시·무대 디자인', 'exhibition-stage-design', NULL, NULL, NULL, 'space-architecture', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('signboard-construction', '간판·시공', 'signboard-construction', NULL, NULL, NULL, 'space-architecture', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('calligraphy-font', '캘리그라피·폰트', 'calligraphy-font', NULL, NULL, NULL, 'design', 0, 0, 1, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('calligraphy', '캘리그라피', 'calligraphy', NULL, NULL, NULL, 'calligraphy-font', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('typography', '타이포그래피', 'typography', NULL, NULL, NULL, 'calligraphy-font', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('font-design', '폰트', 'font-design', NULL, NULL, NULL, 'calligraphy-font', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('signature-seal', '사인·직인', 'signature-seal', NULL, NULL, NULL, 'calligraphy-font', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('fashion-textile', '패션·텍스타일', 'fashion-textile', NULL, NULL, NULL, 'design', 0, 0, 1, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('clothing-jewelry-design', '의류·쥬얼리 디자인', 'clothing-jewelry-design', NULL, NULL, NULL, 'fashion-textile', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('work-instruction-diagram', '작업지시서·도식화', 'work-instruction-diagram', NULL, NULL, NULL, 'fashion-textile', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('pattern-sample-production', '패턴·샘플제작', 'pattern-sample-production', NULL, NULL, NULL, 'fashion-textile', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('design-etc', '기타', 'design-etc', NULL, NULL, NULL, 'design', 0, 0, 1, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('designer-subscription', '디자이너 구독제', 'designer-subscription', NULL, NULL, NULL, 'design-etc', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('design-template', '디자인 템플릿', 'design-template', NULL, NULL, NULL, 'design-etc', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('ai-prompt-design', 'AI 프롬프트', 'ai-prompt-design', NULL, NULL, NULL, 'design-etc', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('barcode-qr-code', '바코드·QR코드', 'barcode-qr-code', NULL, NULL, NULL, 'design-etc', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('other-design', '기타 디자인', 'other-design', NULL, NULL, NULL, 'design-etc', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('it-programming', 'IT/프로그래밍', 'it-programming', 'code', '웹, 앱, 소프트웨어 개발', NULL, NULL, 66, 999, 0, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('web-builder', '웹빌더', 'web-builder', NULL, NULL, NULL, 'it-programming', 0, 0, 1, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('rhymix', '라이믹스', 'rhymix', NULL, NULL, NULL, 'web-builder', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('gnuboard', '그누보드', 'gnuboard', NULL, NULL, NULL, 'web-builder', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('wordpress', '워드프레스', 'wordpress', NULL, NULL, NULL, 'web-builder', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('cafe24', '카페24', 'cafe24', NULL, NULL, NULL, 'web-builder', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('imweb', '아임웹', 'imweb', NULL, NULL, NULL, 'web-builder', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('notion-web', '노션', 'notion-web', NULL, NULL, NULL, 'web-builder', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('shopify', '쇼피파이', 'shopify', NULL, NULL, NULL, 'web-builder', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('wix', '윅스', 'wix', NULL, NULL, NULL, 'web-builder', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('web-creation', '웹 제작', 'web-creation', NULL, NULL, NULL, 'it-programming', 0, 0, 1, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('homepage-new-creation', '홈페이지 신규 제작', 'homepage-new-creation', NULL, NULL, NULL, 'web-creation', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('shopping-mall-new-creation', '쇼핑몰 신규 제작', 'shopping-mall-new-creation', NULL, NULL, NULL, 'web-creation', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('landing-page', '랜딩페이지', 'landing-page', NULL, NULL, NULL, 'web-creation', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('web-maintenance', '웹 유지보수', 'web-maintenance', NULL, NULL, NULL, 'it-programming', 0, 0, 1, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('homepage-modification-maintenance', '홈페이지 수정·유지보수', 'homepage-modification-maintenance', NULL, NULL, NULL, 'web-maintenance', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('shopping-mall-modification-maintenance', '쇼핑몰 수정·유지보수', 'shopping-mall-modification-maintenance', NULL, NULL, NULL, 'web-maintenance', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('publishing', '퍼블리싱', 'publishing', NULL, NULL, NULL, 'web-maintenance', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('search-optimization-seo', '검색최적화·SEO', 'search-optimization-seo', NULL, NULL, NULL, 'web-maintenance', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('analytics', '애널리틱스', 'analytics', NULL, NULL, NULL, 'web-maintenance', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('program', '프로그램', 'program', NULL, NULL, NULL, 'it-programming', 0, 0, 1, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('complete-program-store', '완성형 프로그램 스토어', 'complete-program-store', NULL, NULL, NULL, 'program', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('revenue-automation', '수익 자동화', 'revenue-automation', NULL, NULL, NULL, 'program', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('work-automation', '업무 자동화', 'work-automation', NULL, NULL, NULL, 'program', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('crawling-scraping', '크롤링·스크래핑', 'crawling-scraping', NULL, NULL, NULL, 'program', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('general-program', '일반 프로그램', 'general-program', NULL, NULL, NULL, 'program', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('program-modification-maintenance', '프로그램 수정·유지보수', 'program-modification-maintenance', NULL, NULL, NULL, 'program', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('server-cloud', '서버·클라우드', 'server-cloud', NULL, NULL, NULL, 'program', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('excel-spreadsheet', '엑셀·스프레드시트', 'excel-spreadsheet', NULL, NULL, NULL, 'program', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('bot-chatbot', '봇·챗봇', 'bot-chatbot', NULL, NULL, NULL, 'program', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('mobile', '모바일', 'mobile', NULL, NULL, NULL, 'it-programming', 0, 0, 1, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('app', '앱', 'app', NULL, NULL, NULL, 'mobile', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('app-packaging', '앱 패키징', 'app-packaging', NULL, NULL, NULL, 'mobile', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('app-modification-maintenance', '앱 수정·유지보수', 'app-modification-maintenance', NULL, NULL, NULL, 'mobile', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('security-quality', '보안·품질관리', 'security-quality', NULL, NULL, NULL, 'it-programming', 0, 0, 1, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('information-security', '정보 보안', 'information-security', NULL, NULL, NULL, 'security-quality', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('qa-test', 'QA·테스트', 'qa-test', NULL, NULL, NULL, 'security-quality', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('ai-it', 'AI', 'ai-it', NULL, NULL, NULL, 'it-programming', 0, 0, 1, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('ai-system-service-it', 'AI 시스템·서비스', 'ai-system-service-it', NULL, NULL, NULL, 'ai-it', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('custom-chatbot-gpt-it', '맞춤형 챗봇·GPT', 'custom-chatbot-gpt-it', NULL, NULL, NULL, 'ai-it', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('ai-automation-program-it', 'AI 자동화 프로그램', 'ai-automation-program-it', NULL, NULL, NULL, 'ai-it', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('prompt-engineering-it', '프롬프트 설계(엔지니어링)', 'prompt-engineering-it', NULL, NULL, NULL, 'ai-it', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('ai-modeling-optimization-it', 'AI 모델링·최적화', 'ai-modeling-optimization-it', NULL, NULL, NULL, 'ai-it', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('image-voice-recognition-it', '이미지·음성 인식', 'image-voice-recognition-it', NULL, NULL, NULL, 'ai-it', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('ai-feature-development-integration-it', 'AI 기능 개발·연동', 'ai-feature-development-integration-it', NULL, NULL, NULL, 'ai-it', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('ai-agent-it', 'AI 에이전트', 'ai-agent-it', NULL, NULL, NULL, 'ai-it', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('ai-data-analysis-it', 'AI 데이터 분석', 'ai-data-analysis-it', NULL, NULL, NULL, 'ai-it', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('ai-introduction-consulting-it', 'AI 도입 컨설팅', 'ai-introduction-consulting-it', NULL, NULL, NULL, 'ai-it', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('natural-language-processing-it', '자연어 처리', 'natural-language-processing-it', NULL, NULL, NULL, 'ai-it', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('data', '데이터', 'data', NULL, NULL, NULL, 'it-programming', 0, 0, 1, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('data-purchase-construction', '데이터 구매·구축', 'data-purchase-construction', NULL, NULL, NULL, 'data', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('data-labeling', '데이터 라벨링', 'data-labeling', NULL, NULL, NULL, 'data', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('data-preprocessing-analysis-visualization', '데이터 전처리·분석·시각화', 'data-preprocessing-analysis-visualization', NULL, NULL, NULL, 'data', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('database', '데이터베이스', 'database', NULL, NULL, NULL, 'data', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('trend-tech', '트렌드', 'trend-tech', NULL, NULL, NULL, 'it-programming', 0, 0, 1, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('game-ar-vr', '게임·AR·VR', 'game-ar-vr', NULL, NULL, NULL, 'trend-tech', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('metaverse-it', '메타버스', 'metaverse-it', NULL, NULL, NULL, 'trend-tech', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('blockchain-nft', '블록체인·NFT', 'blockchain-nft', NULL, NULL, NULL, 'trend-tech', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('job-position', '직무직군', 'job-position', NULL, NULL, NULL, 'it-programming', 0, 0, 1, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('ui-ux-planning', 'UI·UX 기획', 'ui-ux-planning', NULL, NULL, NULL, 'job-position', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('frontend-position', '프론트엔드', 'frontend-position', NULL, NULL, NULL, 'job-position', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('backend-position', '백엔드', 'backend-position', NULL, NULL, NULL, 'job-position', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('fullstack-position', '풀스택', 'fullstack-position', NULL, NULL, NULL, 'job-position', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('data-ml-dl', '데이터·ML·DL', 'data-ml-dl', NULL, NULL, NULL, 'job-position', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('devops-infra', '데브옵스·인프라', 'devops-infra', NULL, NULL, NULL, 'job-position', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('it-etc', '기타', 'it-etc', NULL, NULL, NULL, 'it-programming', 0, 0, 1, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('service-mvp-development', '서비스·MVP 개발', 'service-mvp-development', NULL, NULL, NULL, 'it-etc', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('computer-tech-support', '컴퓨터 기술지원', 'computer-tech-support', NULL, NULL, NULL, 'it-etc', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('hardware-embedded', '하드웨어·임베디드', 'hardware-embedded', NULL, NULL, NULL, 'it-etc', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('file-conversion', '파일변환', 'file-conversion', NULL, NULL, NULL, 'it-etc', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('other-programming', '기타 프로그래밍', 'other-programming', NULL, NULL, NULL, 'it-etc', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('marketing', '마케팅', 'marketing', 'bullhorn', '효과적인 마케팅 전략', NULL, NULL, 48, 90, 0, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('channel-activation', '채널 활성화', 'channel-activation', NULL, NULL, NULL, 'marketing', 0, 0, 1, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('blog-management', '블로그 관리', 'blog-management', NULL, NULL, NULL, 'channel-activation', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('cafe-management', '카페 관리', 'cafe-management', NULL, NULL, NULL, 'channel-activation', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('instagram-management', '인스타그램 관리', 'instagram-management', NULL, NULL, NULL, 'channel-activation', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('youtube-management', '유튜브 관리', 'youtube-management', NULL, NULL, NULL, 'channel-activation', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('reels-shorts-tiktok-management', '릴스·숏츠·틱톡 관리', 'reels-shorts-tiktok-management', NULL, NULL, NULL, 'channel-activation', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('threads-marketing', '스레드 마케팅', 'threads-marketing', NULL, NULL, NULL, 'channel-activation', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('linkedin-marketing', '링크드인 마케팅', 'linkedin-marketing', NULL, NULL, NULL, 'channel-activation', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('other-channel-management', '기타 채널 관리', 'other-channel-management', NULL, NULL, NULL, 'channel-activation', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('viral-sponsorship', '바이럴·협찬', 'viral-sponsorship', NULL, NULL, NULL, 'marketing', 0, 0, 1, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('influencer-marketing', '인플루언서 마케팅', 'influencer-marketing', NULL, NULL, NULL, 'viral-sponsorship', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('experience-group-recruitment', '체험단 모집', 'experience-group-recruitment', NULL, NULL, NULL, 'viral-sponsorship', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('viral-posting', '바이럴·포스팅', 'viral-posting', NULL, NULL, NULL, 'viral-sponsorship', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('map-marketing', '지도 마케팅', 'map-marketing', NULL, NULL, NULL, 'marketing', 0, 0, 1, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('map-setup', '지도 세팅', 'map-setup', NULL, NULL, NULL, 'map-marketing', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('map-activation', '지도 활성화', 'map-activation', NULL, NULL, NULL, 'map-marketing', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('map-optimization-exposure', '지도 최적화노출', 'map-optimization-exposure', NULL, NULL, NULL, 'map-marketing', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('clip-marketing', '클립 마케팅', 'clip-marketing', NULL, NULL, NULL, 'map-marketing', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('industry-purpose', '업종·목적별', 'industry-purpose', NULL, NULL, NULL, 'marketing', 0, 0, 1, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('store-marketing', '스토어 마케팅', 'store-marketing', NULL, NULL, NULL, 'industry-purpose', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('press-release', '언론홍보', 'press-release', NULL, NULL, NULL, 'industry-purpose', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('app-marketing', '앱마케팅', 'app-marketing', NULL, NULL, NULL, 'industry-purpose', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('portal-qa', '포털질문·답변', 'portal-qa', NULL, NULL, NULL, 'industry-purpose', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('live-commerce', '라이브커머스', 'live-commerce', NULL, NULL, NULL, 'industry-purpose', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('industry-marketing-package', '업종별 마케팅 패키지', 'industry-marketing-package', NULL, NULL, NULL, 'industry-purpose', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('total-ad-agency', '종합광고대행', 'total-ad-agency', NULL, NULL, NULL, 'industry-purpose', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('db-marketing', 'DB 마케팅', 'db-marketing', NULL, NULL, NULL, 'industry-purpose', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('message-marketing', '메시지 마케팅', 'message-marketing', NULL, NULL, NULL, 'industry-purpose', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('seo-optimization', 'SEO 최적화 노출', 'seo-optimization', NULL, NULL, NULL, 'marketing', 0, 0, 1, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('technical-seo', '테크니컬 SEO', 'technical-seo', NULL, NULL, NULL, 'seo-optimization', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('content-seo', '콘텐츠 SEO', 'content-seo', NULL, NULL, NULL, 'seo-optimization', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('keyword-competitor-analysis', '키워드·경쟁사 분석', 'keyword-competitor-analysis', NULL, NULL, NULL, 'seo-optimization', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('backlink-traffic', '백링크·트래픽', 'backlink-traffic', NULL, NULL, NULL, 'seo-optimization', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('portal-optimization-exposure', '포털 최적화노출', 'portal-optimization-exposure', NULL, NULL, NULL, 'seo-optimization', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('popular-post-management', '인기게시물 관리', 'popular-post-management', NULL, NULL, NULL, 'seo-optimization', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('global-marketing', '해외 마케팅', 'global-marketing', NULL, NULL, NULL, 'marketing', 0, 0, 1, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('global-press-release', '해외 언론홍보', 'global-press-release', NULL, NULL, NULL, 'global-marketing', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('global-store-channel-operation', '해외 쇼핑몰·채널 운영', 'global-store-channel-operation', NULL, NULL, NULL, 'global-marketing', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('global-store-channel-activation', '해외 쇼핑몰·채널 활성화', 'global-store-channel-activation', NULL, NULL, NULL, 'global-marketing', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('global-influencer-seeding', '해외 인플루언서 시딩', 'global-influencer-seeding', NULL, NULL, NULL, 'global-marketing', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('global-marketing-etc', '기타 해외 마케팅', 'global-marketing-etc', NULL, NULL, NULL, 'global-marketing', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('performance-ads', '광고(퍼포먼스)', 'performance-ads', NULL, NULL, NULL, 'marketing', 0, 0, 1, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('sns-ads', 'SNS 광고', 'sns-ads', NULL, NULL, NULL, 'performance-ads', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('keyword-search-ads', '키워드·검색 광고', 'keyword-search-ads', NULL, NULL, NULL, 'performance-ads', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('display-video-banner', '디스플레이·영상·배너', 'display-video-banner', NULL, NULL, NULL, 'performance-ads', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('analysis-strategy', '분석·전략', 'analysis-strategy', NULL, NULL, NULL, 'marketing', 0, 0, 1, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('marketing-consulting', '마케팅 컨설팅', 'marketing-consulting', NULL, NULL, NULL, 'analysis-strategy', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('brand-consulting', '브랜드 컨설팅', 'brand-consulting', NULL, NULL, NULL, 'analysis-strategy', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('data-performance-analysis', '데이터 성과 분석', 'data-performance-analysis', NULL, NULL, NULL, 'analysis-strategy', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('ai-marketing', 'AI 마케팅', 'ai-marketing', NULL, NULL, NULL, 'marketing', 0, 0, 1, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('ai-marketing-service', 'AI 마케팅', 'ai-marketing-service', NULL, NULL, NULL, 'ai-marketing', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('marketing-etc', '기타 마케팅', 'marketing-etc', NULL, NULL, NULL, 'marketing', 0, 0, 1, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('outdoor-print-broadcast-ad', '옥외·인쇄·방송 광고', 'outdoor-print-broadcast-ad', NULL, NULL, NULL, 'marketing-etc', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('community-site-banner', '커뮤니티·사이트 배너', 'community-site-banner', NULL, NULL, NULL, 'marketing-etc', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('video-ad', '영상 광고', 'video-ad', NULL, NULL, NULL, 'marketing-etc', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('marketing-material-keyword', '마케팅 자료·키워드', 'marketing-material-keyword', NULL, NULL, NULL, 'marketing-etc', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('event-promotion', '행사·이벤트', 'event-promotion', NULL, NULL, NULL, 'marketing-etc', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('other-marketing', '기타 마케팅', 'other-marketing', NULL, NULL, NULL, 'marketing-etc', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('video-photo', '영상/사진', 'video-photo', 'camera', '영상 제작 및 사진 촬영', NULL, NULL, 44, 85, 0, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('video', '영상', 'video', NULL, NULL, NULL, 'video-photo', 0, 0, 1, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('ad-promo-video', '광고·홍보 영상', 'ad-promo-video', NULL, NULL, NULL, 'video', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('short-form-video', '숏폼 영상', 'short-form-video', NULL, NULL, NULL, 'video', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('industry-video', '업종별 영상', 'industry-video', NULL, NULL, NULL, 'video', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('product-video', '제품 영상', 'product-video', NULL, NULL, NULL, 'video', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('educational-video', '교육 영상', 'educational-video', NULL, NULL, NULL, 'video', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('event-video', '행사 영상', 'event-video', NULL, NULL, NULL, 'video', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('youtube-video', '유튜브 영상', 'youtube-video', NULL, NULL, NULL, 'video', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('online-streaming', '온라인 중계', 'online-streaming', NULL, NULL, NULL, 'video', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('drone-filming', '드론 촬영', 'drone-filming', NULL, NULL, NULL, 'video', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('video-post-production', '영상 후반작업', 'video-post-production', NULL, NULL, NULL, 'video', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('on-site-staff', '현장 스탭', 'on-site-staff', NULL, NULL, NULL, 'video', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('video-etc', '영상 기타', 'video-etc', NULL, NULL, NULL, 'video', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('computer-graphics', '컴퓨터 그래픽(CG)', 'computer-graphics', NULL, NULL, NULL, 'video-photo', 0, 0, 1, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('motion-graphics', '모션그래픽', 'motion-graphics', NULL, NULL, NULL, 'computer-graphics', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('infographic', '인포그래픽', 'infographic', NULL, NULL, NULL, 'computer-graphics', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('media-art', '미디어 아트', 'media-art', NULL, NULL, NULL, 'computer-graphics', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('intro-logo', '인트로·로고', 'intro-logo', NULL, NULL, NULL, 'computer-graphics', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('typography-cg', '타이포그래피', 'typography-cg', NULL, NULL, NULL, 'computer-graphics', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('3d-modeling-cg', '3D 모델링', '3d-modeling-cg', NULL, NULL, NULL, 'computer-graphics', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('ar-vr-xr', 'AR·VR·XR', 'ar-vr-xr', NULL, NULL, NULL, 'computer-graphics', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('animation', '애니메이션', 'animation', NULL, NULL, NULL, 'video-photo', 0, 0, 1, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('2d-animation', '2D 애니메이션', '2d-animation', NULL, NULL, NULL, 'animation', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('3d-animation', '3D 애니메이션', '3d-animation', NULL, NULL, NULL, 'animation', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('whiteboard-animation', '화이트보드 애니메이션', 'whiteboard-animation', NULL, NULL, NULL, 'animation', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('lottie-web-animation', '로티·web 애니메이션', 'lottie-web-animation', NULL, NULL, NULL, 'animation', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('ai-content', 'AI 콘텐츠', 'ai-content', NULL, NULL, NULL, 'video-photo', 0, 0, 1, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('ai-video', 'AI 영상', 'ai-video', NULL, NULL, NULL, 'ai-content', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('ai-image', 'AI 이미지', 'ai-image', NULL, NULL, NULL, 'ai-content', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('ai-sound', 'AI 음향', 'ai-sound', NULL, NULL, NULL, 'ai-content', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('photography', '사진', 'photography', NULL, NULL, NULL, 'video-photo', 0, 0, 1, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('product-promo-photography', '제품·홍보 사진', 'product-promo-photography', NULL, NULL, NULL, 'photography', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('personal-profile-photography', '개인·프로필 사진', 'personal-profile-photography', NULL, NULL, NULL, 'photography', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('event-snap', '이벤트 스냅', 'event-snap', NULL, NULL, NULL, 'photography', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('photo-retouching', '사진 보정', 'photo-retouching', NULL, NULL, NULL, 'photography', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('audio', '음향', 'audio', NULL, NULL, NULL, 'video-photo', 0, 0, 1, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('voice-actor', '성우', 'voice-actor', NULL, NULL, NULL, 'audio', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('music-source', '음악·음원', 'music-source', NULL, NULL, NULL, 'audio', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('audio-content', '오디오 콘텐츠', 'audio-content', NULL, NULL, NULL, 'audio', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('audio-engineering', '오디오 엔지니어링', 'audio-engineering', NULL, NULL, NULL, 'audio', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('audio-etc', '기타 음향·음악', 'audio-etc', NULL, NULL, NULL, 'audio', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('entertainer', '엔터테이너', 'entertainer', NULL, NULL, NULL, 'video-photo', 0, 0, 1, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('model', '모델', 'model', NULL, NULL, NULL, 'entertainer', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('actor', '배우', 'actor', NULL, NULL, NULL, 'entertainer', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('show-host', '쇼호스트', 'show-host', NULL, NULL, NULL, 'entertainer', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('mc', 'MC', 'mc', NULL, NULL, NULL, 'entertainer', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('performance', '공연', 'performance', NULL, NULL, NULL, 'entertainer', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('video-photo-etc', '기타', 'video-photo-etc', NULL, NULL, NULL, 'video-photo', 0, 0, 1, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('storyboard', '콘티·스토리보드', 'storyboard', NULL, NULL, NULL, 'video-photo-etc', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('hair-makeup', '헤어·메이크업', 'hair-makeup', NULL, NULL, NULL, 'video-photo-etc', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('studio-rental', '스튜디오 렌탈', 'studio-rental', NULL, NULL, NULL, 'video-photo-etc', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('video-photo-other', '기타 영상·사진·음향', 'video-photo-other', NULL, NULL, NULL, 'video-photo-etc', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('translation', '번역/통역', 'translation', 'language', '전문 번역 및 통역 서비스', NULL, NULL, 25, 70, 0, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('document-translation', '번역', 'document-translation', NULL, NULL, NULL, 'translation', 0, 0, 1, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('english-translation', '영어 번역', 'english-translation', NULL, NULL, NULL, 'document-translation', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('chinese-translation', '중국어 번역', 'chinese-translation', NULL, NULL, NULL, 'document-translation', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('japanese-translation', '일본어 번역', 'japanese-translation', NULL, NULL, NULL, 'document-translation', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('spanish-translation', '스페인어 번역', 'spanish-translation', NULL, NULL, NULL, 'document-translation', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('french-translation', '프랑스어 번역', 'french-translation', NULL, NULL, NULL, 'document-translation', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('german-translation', '독일어 번역', 'german-translation', NULL, NULL, NULL, 'document-translation', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('other-language-translation', '기타 언어 번역', 'other-language-translation', NULL, NULL, NULL, 'document-translation', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('proofreading', '감수', 'proofreading', NULL, NULL, NULL, 'document-translation', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('notarized-translation', '번역공증대행', 'notarized-translation', NULL, NULL, NULL, 'document-translation', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('ai-translation-review', 'AI 번역 검수·편집', 'ai-translation-review', NULL, NULL, NULL, 'document-translation', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('media-translation', '영상 번역', 'media-translation', NULL, NULL, NULL, 'translation', 0, 0, 1, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('subtitle-translation', '자막 번역', 'subtitle-translation', NULL, NULL, NULL, 'media-translation', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('dubbing', '더빙', 'dubbing', NULL, NULL, NULL, 'media-translation', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('transcription', '음성 텍스트 변환', 'transcription', NULL, NULL, NULL, 'media-translation', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('professional-translation', '전문 분야 번역', 'professional-translation', NULL, NULL, NULL, 'translation', 0, 0, 1, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('legal-translation', '법률 번역', 'legal-translation', NULL, NULL, NULL, 'professional-translation', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('medical-translation', '의료 번역', 'medical-translation', NULL, NULL, NULL, 'professional-translation', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('technical-translation', '기술 번역', 'technical-translation', NULL, NULL, NULL, 'professional-translation', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('academic-translation', '학술 번역', 'academic-translation', NULL, NULL, NULL, 'professional-translation', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('interpretation', '통역', 'interpretation', NULL, NULL, NULL, 'translation', 0, 0, 1, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('english-interpretation', '영어 통역', 'english-interpretation', NULL, NULL, NULL, 'interpretation', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('chinese-interpretation', '중국어 통역', 'chinese-interpretation', NULL, NULL, NULL, 'interpretation', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('japanese-interpretation', '일본어 통역', 'japanese-interpretation', NULL, NULL, NULL, 'interpretation', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('other-language-interpretation', '기타 언어 통역', 'other-language-interpretation', NULL, NULL, NULL, 'interpretation', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('simultaneous-interpretation', '동시통역', 'simultaneous-interpretation', NULL, NULL, NULL, 'interpretation', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('consecutive-interpretation', '순차통역', 'consecutive-interpretation', NULL, NULL, NULL, 'interpretation', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('business-interpretation', '비즈니스 통역', 'business-interpretation', NULL, NULL, NULL, 'interpretation', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('ai-interpretation', 'AI 통역', 'ai-interpretation', NULL, NULL, NULL, 'interpretation', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('writing', '문서/글쓰기', 'writing', 'pen-fancy', '전문적인 문서 작성 서비스', NULL, NULL, 32, 80, 0, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('content-writing', '콘텐츠 글쓰기', 'content-writing', NULL, NULL, NULL, 'writing', 0, 0, 1, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('blog-cafe-manuscript', '블로그·카페 원고', 'blog-cafe-manuscript', NULL, NULL, NULL, 'content-writing', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('script-writing', '대본 작성', 'script-writing', NULL, NULL, NULL, 'content-writing', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('press-article-column', '보도자료·기사·칼럼', 'press-article-column', NULL, NULL, NULL, 'content-writing', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('book-ebook-publishing', '책·전자책 출판', 'book-ebook-publishing', NULL, NULL, NULL, 'content-writing', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('industry-specialized-writing', '산업별 전문 글작성', 'industry-specialized-writing', NULL, NULL, NULL, 'content-writing', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('business-copy', '비즈니스 카피', 'business-copy', NULL, NULL, NULL, 'writing', 0, 0, 1, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('naming-branding', '네이밍·브랜딩', 'naming-branding', NULL, NULL, NULL, 'business-copy', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('product-copywriting', '제품 카피라이팅', 'product-copywriting', NULL, NULL, NULL, 'business-copy', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('ad-copywriting', '광고 카피라이팅', 'ad-copywriting', NULL, NULL, NULL, 'business-copy', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('other-copywriting', '기타 카피라이팅', 'other-copywriting', NULL, NULL, NULL, 'business-copy', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('thesis-research', '논문·자료 조사', 'thesis-research', NULL, NULL, NULL, 'writing', 0, 0, 1, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('thesis-consulting', '논문 컨설팅', 'thesis-consulting', NULL, NULL, NULL, 'thesis-research', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('thesis-editing-proofreading', '논문 교정·편집', 'thesis-editing-proofreading', NULL, NULL, NULL, 'thesis-research', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('thesis-statistics-analysis', '논문 통계분석', 'thesis-statistics-analysis', NULL, NULL, NULL, 'thesis-research', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('data-research', '자료 조사', 'data-research', NULL, NULL, NULL, 'thesis-research', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('typing-editing', '타이핑·편집', 'typing-editing', NULL, NULL, NULL, 'writing', 0, 0, 1, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('typing-document', '타이핑(문서)', 'typing-document', NULL, NULL, NULL, 'typing-editing', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('typing-video', '타이핑(영상)', 'typing-video', NULL, NULL, NULL, 'typing-editing', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('document-editing', '문서 편집', 'document-editing', NULL, NULL, NULL, 'typing-editing', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('proofreading-revision', '교정·첨삭', 'proofreading-revision', NULL, NULL, NULL, 'writing', 0, 0, 1, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('proofreading-correction', '교정·교열 첨삭', 'proofreading-correction', NULL, NULL, NULL, 'proofreading-revision', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('ai-writing', 'AI 글쓰기', 'ai-writing', NULL, NULL, NULL, 'writing', 0, 0, 1, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('ai-content-production', 'AI 콘텐츠 생산', 'ai-content-production', NULL, NULL, NULL, 'ai-writing', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('ai-content-review-editing', 'AI 콘텐츠 검수·편집', 'ai-content-review-editing', NULL, NULL, NULL, 'ai-writing', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('business-documents', '비즈니스 문서', 'business-documents', NULL, NULL, NULL, 'writing', 0, 0, 1, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('business-plan', '사업계획서', 'business-plan', NULL, NULL, NULL, 'business-documents', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('proposal-writing', '제안서 작성', 'proposal-writing', NULL, NULL, NULL, 'business-documents', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('report-writing', '보고서 작성', 'report-writing', NULL, NULL, NULL, 'business-documents', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('presentation', '프레젠테이션', 'presentation', NULL, NULL, NULL, 'business-documents', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('cv-resume', '이력서/자소서', 'cv-resume', NULL, NULL, NULL, 'business-documents', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('academic-documents', '학술 문서', 'academic-documents', NULL, NULL, NULL, 'writing', 0, 0, 1, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('research-paper', '연구 보고서', 'research-paper', NULL, NULL, NULL, 'academic-documents', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('essay-writing', '에세이', 'essay-writing', NULL, NULL, NULL, 'academic-documents', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('creative-writing', '창작 글쓰기', 'creative-writing', NULL, NULL, NULL, 'writing', 0, 0, 1, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('novel-writing', '소설', 'novel-writing', NULL, NULL, NULL, 'creative-writing', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('scenario-writing', '시나리오', 'scenario-writing', NULL, NULL, NULL, 'creative-writing', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('webtoon-story', '웹툰 스토리', 'webtoon-story', NULL, NULL, NULL, 'creative-writing', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('poetry', '시/수필', 'poetry', NULL, NULL, NULL, 'creative-writing', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('writing-etc', '기타', 'writing-etc', NULL, NULL, NULL, 'writing', 0, 0, 1, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('other-writing', '기타 글쓰기', 'other-writing', NULL, NULL, NULL, 'writing-etc', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('document-materials', '문서 자료', 'document-materials', NULL, NULL, NULL, 'writing-etc', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('music-audio', '음악/오디오', 'music-audio', 'music', '음악 제작 및 오디오 서비스', NULL, NULL, 10, 65, 0, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('music-production', '음악 제작', 'music-production', NULL, NULL, NULL, 'music-audio', 0, 0, 1, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('music-composition', '작곡', 'music-composition', NULL, NULL, NULL, 'music-production', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('music-arrangement', '편곡', 'music-arrangement', NULL, NULL, NULL, 'music-production', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('bgm-production', 'BGM 제작', 'bgm-production', NULL, NULL, NULL, 'music-production', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('jingle-production', '징글/CM송', 'jingle-production', NULL, NULL, NULL, 'music-production', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('audio-production', '오디오 작업', 'audio-production', NULL, NULL, NULL, 'music-audio', 0, 0, 1, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('mixing-mastering', '믹싱/마스터링', 'mixing-mastering', NULL, NULL, NULL, 'audio-production', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('sound-effects', '효과음 제작', 'sound-effects', NULL, NULL, NULL, 'audio-production', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('audio-editing', '오디오 편집', 'audio-editing', NULL, NULL, NULL, 'audio-production', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('podcast-editing', '팟캐스트 편집', 'podcast-editing', NULL, NULL, NULL, 'audio-production', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('voice-narration', '보이스/나레이션', 'voice-narration', NULL, NULL, NULL, 'music-audio', 0, 0, 1, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('voice-over', '성우/나레이션', 'voice-over', NULL, NULL, NULL, 'voice-narration', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('ars-recording', 'ARS 녹음', 'ars-recording', NULL, NULL, NULL, 'voice-narration', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('audiobook', '오디오북', 'audiobook', NULL, NULL, NULL, 'voice-narration', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('business', '비즈니스', 'business', 'briefcase', '비즈니스 성장을 위한 전문 서비스', NULL, NULL, 42, 78, 0, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('business-plan', '사업계획', 'business-plan', NULL, NULL, NULL, 'business', 0, 0, 1, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('business-plan-investment-proposal', '사업계획서·투자제안서', 'business-plan-investment-proposal', NULL, NULL, NULL, 'business-plan', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('business-research', '리서치', 'business-research', NULL, NULL, NULL, 'business-plan', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('corporate-consulting', '기업 자문', 'corporate-consulting', NULL, NULL, NULL, 'business', 0, 0, 1, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('sales-consulting', '세일즈', 'sales-consulting', NULL, NULL, NULL, 'corporate-consulting', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('general-management-consulting', '일반 경영 자문', 'general-management-consulting', NULL, NULL, NULL, 'corporate-consulting', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('branding-consulting', '브랜딩', 'branding-consulting', NULL, NULL, NULL, 'corporate-consulting', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('logistics-production', '물류·생산', 'logistics-production', NULL, NULL, NULL, 'corporate-consulting', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('hr-corporate-culture', 'HR·기업문화', 'hr-corporate-culture', NULL, NULL, NULL, 'corporate-consulting', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('global-business', '해외 사업·해외 진출', 'global-business', NULL, NULL, NULL, 'corporate-consulting', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('it-consulting', 'IT 컨설팅', 'it-consulting', NULL, NULL, NULL, 'corporate-consulting', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('financial-consulting', '재무 자문', 'financial-consulting', NULL, NULL, NULL, 'corporate-consulting', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('operation-support', '운영 지원', 'operation-support', NULL, NULL, NULL, 'corporate-consulting', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('industry-startup', '업종별 창업', 'industry-startup', NULL, NULL, NULL, 'business', 0, 0, 1, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('online-store-startup', '온라인 쇼핑몰 창업', 'online-store-startup', NULL, NULL, NULL, 'industry-startup', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('cafe-restaurant-startup', '카페·요식업 창업', 'cafe-restaurant-startup', NULL, NULL, NULL, 'industry-startup', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('fashion-startup', '패션 창업', 'fashion-startup', NULL, NULL, NULL, 'industry-startup', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('beauty-care-startup', '미용·뷰티케어 창업', 'beauty-care-startup', NULL, NULL, NULL, 'industry-startup', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('health-food-startup', '건강기능식품 창업', 'health-food-startup', NULL, NULL, NULL, 'industry-startup', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('cosmetics-startup', '화장품 창업', 'cosmetics-startup', NULL, NULL, NULL, 'industry-startup', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('hospital-pharmacy-startup', '병원·약국 창업', 'hospital-pharmacy-startup', NULL, NULL, NULL, 'industry-startup', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('franchise-startup', '프랜차이즈 창업', 'franchise-startup', NULL, NULL, NULL, 'industry-startup', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('unmanned-space-rental-startup', '무인점포·공간대여 창업', 'unmanned-space-rental-startup', NULL, NULL, NULL, 'industry-startup', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('pet-startup', '반려동물 창업', 'pet-startup', NULL, NULL, NULL, 'industry-startup', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('other-startup', '기타 창업', 'other-startup', NULL, NULL, NULL, 'industry-startup', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('startup-consulting', '스타트업 자문', 'startup-consulting', NULL, NULL, NULL, 'business', 0, 0, 1, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('vision-mission-branding', '비전·미션·초기 브랜딩', 'vision-mission-branding', NULL, NULL, NULL, 'startup-consulting', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('personal-org-goal-management', '개인·조직 목표 관리', 'personal-org-goal-management', NULL, NULL, NULL, 'startup-consulting', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('startup-hr-consulting', '스타트업 인사 자문', 'startup-hr-consulting', NULL, NULL, NULL, 'startup-consulting', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('startup-investment-attraction', '스타트업 투자 유치', 'startup-investment-attraction', NULL, NULL, NULL, 'startup-consulting', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('consulting', '컨설팅', 'consulting', NULL, NULL, NULL, 'business', 0, 0, 1, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('startup-consulting-general', '창업 컨설팅', 'startup-consulting-general', NULL, NULL, NULL, 'consulting', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('management-consulting', '경영 컨설팅', 'management-consulting', NULL, NULL, NULL, 'consulting', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('marketing-consulting', '마케팅 컨설팅', 'marketing-consulting', NULL, NULL, NULL, 'consulting', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('hr-consulting', '인사 컨설팅', 'hr-consulting', NULL, NULL, NULL, 'consulting', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('finance-accounting', '재무/회계', 'finance-accounting', NULL, NULL, NULL, 'business', 0, 0, 1, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('bookkeeping', '장부 기장', 'bookkeeping', NULL, NULL, NULL, 'finance-accounting', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('tax-service', '세무 서비스', 'tax-service', NULL, NULL, NULL, 'finance-accounting', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('financial-planning', '재무 설계', 'financial-planning', NULL, NULL, NULL, 'finance-accounting', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('investment-consulting', '투자 컨설팅', 'investment-consulting', NULL, NULL, NULL, 'finance-accounting', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('legal-services', '법률 서비스', 'legal-services', NULL, NULL, NULL, 'business', 0, 0, 1, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('legal-consulting', '법률 자문', 'legal-consulting', NULL, NULL, NULL, 'legal-services', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('patent-trademark', '특허/상표', 'patent-trademark', NULL, NULL, NULL, 'legal-services', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('contract-drafting', '계약서 작성', 'contract-drafting', NULL, NULL, NULL, 'legal-services', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('business-support', '비즈니스 지원', 'business-support', NULL, NULL, NULL, 'business', 0, 0, 1, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('virtual-assistant', '가상 비서', 'virtual-assistant', NULL, NULL, NULL, 'business-support', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('data-entry', '데이터 입력', 'data-entry', NULL, NULL, NULL, 'business-support', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('market-research', '시장 조사', 'market-research', NULL, NULL, NULL, 'business-support', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('business-materials', '자료·콘텐츠', 'business-materials', NULL, NULL, NULL, 'business', 0, 0, 1, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('business-documents', '비즈니스 문서', 'business-documents', NULL, NULL, NULL, 'business-materials', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('business-etc', '기타', 'business-etc', NULL, NULL, NULL, 'business', 0, 0, 1, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('other-consulting-support', '기타 자문·지원', 'other-consulting-support', NULL, NULL, NULL, 'business-etc', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('lifestyle', '라이프스타일', 'lifestyle', 'book', '삶의 질을 높이는 서비스', NULL, NULL, 20, 0, 0, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('online-lessons', '온라인 레슨', 'online-lessons', NULL, NULL, NULL, 'lifestyle', 0, 0, 1, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('language-lesson', '외국어 레슨', 'language-lesson', NULL, NULL, NULL, 'online-lessons', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('music-lesson', '음악 레슨', 'music-lesson', NULL, NULL, NULL, 'online-lessons', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('art-lesson', '미술 레슨', 'art-lesson', NULL, NULL, NULL, 'online-lessons', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('cooking-lesson', '요리 레슨', 'cooking-lesson', NULL, NULL, NULL, 'online-lessons', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('coding-lesson', '코딩 레슨', 'coding-lesson', NULL, NULL, NULL, 'online-lessons', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('health-wellness', '건강/웰니스', 'health-wellness', NULL, NULL, NULL, 'lifestyle', 0, 0, 1, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('fitness-training', '피트니스 트레이닝', 'fitness-training', NULL, NULL, NULL, 'health-wellness', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('diet-consulting', '다이어트 상담', 'diet-consulting', NULL, NULL, NULL, 'health-wellness', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('yoga-pilates', '요가/필라테스', 'yoga-pilates', NULL, NULL, NULL, 'health-wellness', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('meditation', '명상', 'meditation', NULL, NULL, NULL, 'health-wellness', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('coaching-counseling', '코칭/상담', 'coaching-counseling', NULL, NULL, NULL, 'lifestyle', 0, 0, 1, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('life-coaching', '라이프 코칭', 'life-coaching', NULL, NULL, NULL, 'coaching-counseling', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('career-coaching', '커리어 코칭', 'career-coaching', NULL, NULL, NULL, 'coaching-counseling', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('relationship-counseling', '연애 상담', 'relationship-counseling', NULL, NULL, NULL, 'coaching-counseling', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('psychological-counseling', '심리 상담', 'psychological-counseling', NULL, NULL, NULL, 'coaching-counseling', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('astrology-fortune', '운세/타로', 'astrology-fortune', NULL, NULL, NULL, 'lifestyle', 0, 0, 1, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('tarot-reading', '타로 리딩', 'tarot-reading', NULL, NULL, NULL, 'astrology-fortune', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('fortune-telling', '사주/운세', 'fortune-telling', NULL, NULL, NULL, 'astrology-fortune', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('naming-service', '작명', 'naming-service', NULL, NULL, NULL, 'astrology-fortune', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('event', '이벤트', 'event', 'calendar', '특별한 날을 위한 서비스', NULL, NULL, 14, 0, 0, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('event-planning', '행사 기획', 'event-planning', NULL, NULL, NULL, 'event', 0, 0, 1, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('wedding-planning', '웨딩 플래닝', 'wedding-planning', NULL, NULL, NULL, 'event-planning', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('birthday-party', '생일 파티', 'birthday-party', NULL, NULL, NULL, 'event-planning', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('corporate-event', '기업 행사', 'corporate-event', NULL, NULL, NULL, 'event-planning', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('seminar-conference', '세미나/컨퍼런스', 'seminar-conference', NULL, NULL, NULL, 'event-planning', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('event-services', '행사 서비스', 'event-services', NULL, NULL, NULL, 'event', 0, 0, 1, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('mc-hosting', '사회/진행', 'mc-hosting', NULL, NULL, NULL, 'event-services', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('performance', '공연', 'performance', NULL, NULL, NULL, 'event-services', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('dj-service', 'DJ 서비스', 'dj-service', NULL, NULL, NULL, 'event-services', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('catering', '케이터링', 'catering', NULL, NULL, NULL, 'event-services', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('hobby-handmade', '취미/핸드메이드', 'hobby-handmade', 'scissors', '취미 활동과 수제 작품', NULL, NULL, 23, 0, 0, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('handmade-craft', '핸드메이드', 'handmade-craft', NULL, NULL, NULL, 'hobby-handmade', 0, 0, 1, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('custom-goods', '맞춤 제작', 'custom-goods', NULL, NULL, NULL, 'handmade-craft', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('jewelry-making', '액세서리', 'jewelry-making', NULL, NULL, NULL, 'handmade-craft', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('pottery', '도자기', 'pottery', NULL, NULL, NULL, 'handmade-craft', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('knitting', '뜨개질', 'knitting', NULL, NULL, NULL, 'handmade-craft', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('gift-items', '선물/기념품', 'gift-items', NULL, NULL, NULL, 'hobby-handmade', 0, 0, 1, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('personalized-gift', '개인화 선물', 'personalized-gift', NULL, NULL, NULL, 'gift-items', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('gift-wrapping', '선물 포장', 'gift-wrapping', NULL, NULL, NULL, 'gift-items', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('flower-arrangement', '꽃꽂이', 'flower-arrangement', NULL, NULL, NULL, 'gift-items', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('gaming', '게임', 'gaming', NULL, NULL, NULL, 'hobby-handmade', 0, 0, 1, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('game-coaching', '게임 코칭', 'game-coaching', NULL, NULL, NULL, 'gaming', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('game-leveling', '레벨링 대행', 'game-leveling', NULL, NULL, NULL, 'gaming', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('game-account', '게임 계정', 'game-account', NULL, NULL, NULL, 'gaming', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('beauty-fashion', '뷰티/패션', 'beauty-fashion', 'spa', '뷰티와 패션 관련 서비스', NULL, NULL, 14, 0, 0, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('beauty-services', '뷰티 서비스', 'beauty-services', NULL, NULL, NULL, 'beauty-fashion', 0, 0, 1, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('makeup', '메이크업', 'makeup', NULL, NULL, NULL, 'beauty-services', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('hair-styling', '헤어 스타일링', 'hair-styling', NULL, NULL, NULL, 'beauty-services', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('nail-art', '네일아트', 'nail-art', NULL, NULL, NULL, 'beauty-services', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('fashion-styling', '패션 스타일링', 'fashion-styling', NULL, NULL, NULL, 'beauty-fashion', 0, 0, 1, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('personal-color', '퍼스널 컬러', 'personal-color', NULL, NULL, NULL, 'fashion-styling', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('styling-consulting', '스타일링 컨설팅', 'styling-consulting', NULL, NULL, NULL, 'fashion-styling', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('counseling-coaching', '상담/코칭', 'counseling-coaching', 'bullseye', '전문적인 상담과 코칭', NULL, NULL, 14, 0, 0, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('life-coaching', '라이프 코칭', 'life-coaching', NULL, NULL, NULL, 'counseling-coaching', 0, 0, 1, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('career-coaching', '커리어 코칭', 'career-coaching', NULL, NULL, NULL, 'life-coaching', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('relationship-counseling', '관계 상담', 'relationship-counseling', NULL, NULL, NULL, 'life-coaching', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('psychological-counseling', '심리 상담', 'psychological-counseling', NULL, NULL, NULL, 'counseling-coaching', 0, 0, 1, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('stress-management', '스트레스 관리', 'stress-management', NULL, NULL, NULL, 'psychological-counseling', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('emotional-healing', '감정 치유', 'emotional-healing', NULL, NULL, NULL, 'psychological-counseling', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('fortune-tarot', '운세/타로', 'fortune-tarot', 'star', '운세와 타로 상담', NULL, NULL, 16, 0, 0, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('tarot-reading', '타로 리딩', 'tarot-reading', NULL, NULL, NULL, 'fortune-tarot', 0, 0, 1, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('love-tarot', '연애운 타로', 'love-tarot', NULL, NULL, NULL, 'tarot-reading', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('career-tarot', '직업운 타로', 'career-tarot', NULL, NULL, NULL, 'tarot-reading', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('fortune-telling', '사주/운세', 'fortune-telling', NULL, NULL, NULL, 'fortune-tarot', 0, 0, 1, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('saju-reading', '사주 풀이', 'saju-reading', NULL, NULL, NULL, 'fortune-telling', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('naming', '작명/개명', 'naming', NULL, NULL, NULL, 'fortune-telling', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('ebook-template', '전자책/템플릿', 'ebook-template', 'book-open', '전자책과 각종 템플릿', NULL, NULL, 15, 0, 0, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('ebook', '전자책', 'ebook', NULL, NULL, NULL, 'ebook-template', 0, 0, 1, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('ebook-creation', '전자책 제작', 'ebook-creation', NULL, NULL, NULL, 'ebook', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('ebook-publishing', '전자책 출판', 'ebook-publishing', NULL, NULL, NULL, 'ebook', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('templates', '템플릿', 'templates', NULL, NULL, NULL, 'ebook-template', 0, 0, 1, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('ppt-template', 'PPT 템플릿', 'ppt-template', NULL, NULL, NULL, 'templates', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('excel-template', '엑셀 템플릿', 'excel-template', NULL, NULL, NULL, 'templates', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('notion-template', '노션 템플릿', 'notion-template', NULL, NULL, NULL, 'templates', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('custom-order', '주문제작', 'custom-order', 'hammer', '맞춤형 주문 제작 서비스', NULL, NULL, 13, 0, 0, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('print-promotional', '인쇄·판촉물', 'print-promotional', NULL, NULL, NULL, 'custom-order', 0, 0, 1, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('printing', '인쇄', 'printing', NULL, NULL, NULL, 'print-promotional', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('3d-printing', '3D프린팅', '3d-printing', NULL, NULL, NULL, 'print-promotional', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('package-making', '패키지 제작', 'package-making', NULL, NULL, NULL, 'print-promotional', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('store-goods-making', '가게용품 제작', 'store-goods-making', NULL, NULL, NULL, 'print-promotional', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('souvenir-making', '기념품 제작', 'souvenir-making', NULL, NULL, NULL, 'print-promotional', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('model-making', '모형 제작', 'model-making', NULL, NULL, NULL, 'print-promotional', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('product-making', '제품 제작', 'product-making', NULL, NULL, NULL, 'print-promotional', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('custom-goods', '굿즈 제작', 'custom-goods', NULL, NULL, NULL, 'custom-order', 0, 0, 1, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('tshirt-making', '티셔츠 제작', 'tshirt-making', NULL, NULL, NULL, 'custom-goods', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('mug-making', '머그컵 제작', 'mug-making', NULL, NULL, NULL, 'custom-goods', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('sticker-making', '스티커 제작', 'sticker-making', NULL, NULL, NULL, 'custom-goods', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('printing-materials', '인쇄물', 'printing-materials', NULL, NULL, NULL, 'custom-order', 0, 0, 1, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('business-card-printing', '명함 인쇄', 'business-card-printing', NULL, NULL, NULL, 'printing-materials', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('poster-printing', '포스터 인쇄', 'poster-printing', NULL, NULL, NULL, 'printing-materials', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('custom-order-etc', '기타', 'custom-order-etc', NULL, NULL, NULL, 'custom-order', 0, 0, 1, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('other-custom-order', '기타 주문제작', 'other-custom-order', NULL, NULL, NULL, 'custom-order-etc', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('tax-legal-labor', '세무/법무/노무', 'tax-legal-labor', 'gavel', '세무, 법률, 노무 전문 서비스', NULL, NULL, 16, 0, 0, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('legal-service', '법무', 'legal-service', NULL, NULL, NULL, 'tax-legal-labor', 0, 0, 1, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('business-legal-consulting', '사업자 법률 자문', 'business-legal-consulting', NULL, NULL, NULL, 'legal-service', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('personal-legal-consulting', '개인 법률 자문', 'personal-legal-consulting', NULL, NULL, NULL, 'legal-service', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('legal-administration', '법무·행정', 'legal-administration', NULL, NULL, NULL, 'legal-service', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('contract-review', '계약서 검토', 'contract-review', NULL, NULL, NULL, 'legal-service', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('legal-consulting', '법률 상담', 'legal-consulting', NULL, NULL, NULL, 'legal-service', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('tax-accounting', '세무·회계', 'tax-accounting', NULL, NULL, NULL, 'tax-legal-labor', 0, 0, 1, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('business-tax-accounting', '사업자 세무·회계', 'business-tax-accounting', NULL, NULL, NULL, 'tax-accounting', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('personal-tax-accounting', '개인 세무·회계', 'personal-tax-accounting', NULL, NULL, NULL, 'tax-accounting', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('tax-return', '세금 신고', 'tax-return', NULL, NULL, NULL, 'tax-accounting', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('tax-consulting', '세무 상담', 'tax-consulting', NULL, NULL, NULL, 'tax-accounting', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('intellectual-property', '지식재산권 보호', 'intellectual-property', NULL, NULL, NULL, 'tax-legal-labor', 0, 0, 1, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('domestic-patent-trademark', '국내 특허·상표', 'domestic-patent-trademark', NULL, NULL, NULL, 'intellectual-property', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('other-intellectual-property', '기타 지식재산권', 'other-intellectual-property', NULL, NULL, NULL, 'intellectual-property', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('labor-service', '노무', 'labor-service', NULL, NULL, NULL, 'tax-legal-labor', 0, 0, 1, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('employer-labor-consulting', '고용인 노무 상담', 'employer-labor-consulting', NULL, NULL, NULL, 'labor-service', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('worker-labor-consulting', '근로자 노무 상담', 'worker-labor-consulting', NULL, NULL, NULL, 'labor-service', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('employment-contract-consulting', '근로계약서 상담', 'employment-contract-consulting', NULL, NULL, NULL, 'labor-service', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('employment-subsidy-consulting', '고용지원금 상담', 'employment-subsidy-consulting', NULL, NULL, NULL, 'labor-service', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('tax-legal-labor-etc', '기타', 'tax-legal-labor-etc', NULL, NULL, NULL, 'tax-legal-labor', 0, 0, 1, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('other-consulting-customs', '기타 자문(관세사 등)', 'other-consulting-customs', NULL, NULL, NULL, 'tax-legal-labor-etc', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('career-admission', '취업/입시', 'career-admission', 'graduation-cap', '취업과 입시 준비 서비스', NULL, NULL, 14, 0, 0, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('job-preparation', '취업 준비', 'job-preparation', NULL, NULL, NULL, 'career-admission', 0, 0, 1, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('resume-writing', '이력서 작성', 'resume-writing', NULL, NULL, NULL, 'job-preparation', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('interview-coaching', '면접 코칭', 'interview-coaching', NULL, NULL, NULL, 'job-preparation', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('portfolio-making', '포트폴리오 제작', 'portfolio-making', NULL, NULL, NULL, 'job-preparation', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('admission-prep', '입시 준비', 'admission-prep', NULL, NULL, NULL, 'career-admission', 0, 0, 1, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('college-consulting', '대입 컨설팅', 'college-consulting', NULL, NULL, NULL, 'admission-prep', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('essay-writing', '자소서 작성', 'essay-writing', NULL, NULL, NULL, 'admission-prep', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('job-skills', '직무역량', 'job-skills', 'chart-line', '직무 능력 향상 서비스', NULL, NULL, 16, 0, 0, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('office-skills', '오피스 스킬', 'office-skills', NULL, NULL, NULL, 'job-skills', 0, 0, 1, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('excel-training', '엑셀 교육', 'excel-training', NULL, NULL, NULL, 'office-skills', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('ppt-training', 'PPT 교육', 'ppt-training', NULL, NULL, NULL, 'office-skills', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('business-skills', '비즈니스 스킬', 'business-skills', NULL, NULL, NULL, 'job-skills', 0, 0, 1, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('presentation-skill', '프레젠테이션', 'presentation-skill', NULL, NULL, NULL, 'business-skills', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('negotiation-skill', '협상 스킬', 'negotiation-skill', NULL, NULL, NULL, 'business-skills', 0, 0, 2, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;


-- Verify the insert
SELECT
  COUNT(*) as total_categories,
  COUNT(DISTINCT parent_id) as unique_parents,
  COUNT(*) FILTER (WHERE parent_id IS NULL) as top_level_categories
FROM categories;
