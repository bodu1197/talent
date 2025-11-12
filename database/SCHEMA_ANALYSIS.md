# Supabase 스키마 분석 보고서

**생성일**: 2025-11-12
**프로젝트**: bpvfkkrlyrjkwgwmfrci.supabase.co

---

## 📊 데이터베이스 현황

### 전체 통계
- **총 테이블 수**: 48개
- **데이터 보유 테이블**: 24개
- **빈 테이블**: 24개

### 핵심 테이블 데이터 현황

| 테이블 | 레코드 수 | 상태 |
|--------|-----------|------|
| **categories** | 582 | ✅ 활성 |
| **category_visits** | 67 | ✅ 활성 |
| **chat_messages** | 54 | ✅ 활성 |
| **service_views** | 13 | ✅ 활성 |
| **services** | 8 | ✅ 활성 |
| **service_categories** | 7 | ✅ 활성 |
| **service_revisions** | 6 | ✅ 활성 |
| **portfolio_services** | 6 | ✅ 활성 |
| **orders** | 5 | ✅ 활성 |
| **chat_rooms** | 4 | ✅ 활성 |
| **service_favorites** | 4 | ✅ 활성 |
| **buyers** | 3 | ✅ 활성 |
| **users** | 3 | ✅ 활성 |
| **coupons** | 2 | ✅ 활성 |
| **chat_favorites** | 2 | ✅ 활성 |
| **seller_portfolio** | 2 | ✅ 활성 |
| **user_wallets** | 2 | ✅ 활성 |
| **admins** | 1 | ✅ 활성 |
| **sellers** | 1 | ✅ 활성 |
| **seller_earnings** | 1 | ✅ 활성 |
| **reviews** | 1 | ✅ 활성 |
| **withdrawal_requests** | 1 | ✅ 활성 |
| **schema_migrations** | 5 | ✅ 시스템 |

---

## 🔍 주요 테이블 구조

### 1. **users** (사용자)
```sql
CREATE TABLE users (
  id uuid PRIMARY KEY,
  email text UNIQUE,
  name text,
  profile_image text,
  phone text,
  role text,  -- 'buyer', 'seller', 'admin'
  is_active boolean DEFAULT true,
  created_at timestamp with time zone,
  updated_at timestamp with time zone
);
```

### 2. **services** (서비스/상품)
```sql
CREATE TABLE services (
  id uuid PRIMARY KEY,
  seller_id uuid REFERENCES sellers(id),
  title text NOT NULL,
  description text,
  price integer,
  thumbnail_url text,
  status text,  -- 'draft', 'pending', 'active', 'rejected', 'suspended'
  views integer DEFAULT 0,
  rating numeric,
  review_count integer DEFAULT 0,
  created_at timestamp with time zone,
  updated_at timestamp with time zone
);
```

### 3. **orders** (주문)
```sql
CREATE TABLE orders (
  id uuid PRIMARY KEY,
  buyer_id uuid REFERENCES buyers(id),
  seller_id uuid REFERENCES sellers(id),
  service_id uuid REFERENCES services(id),
  order_number text UNIQUE,
  status text,  -- 'pending_payment', 'paid', 'in_progress', 'completed', 'cancelled'
  total_amount integer,
  created_at timestamp with time zone,
  updated_at timestamp with time zone
);
```

### 4. **categories** (카테고리)
```sql
CREATE TABLE categories (
  id uuid PRIMARY KEY,
  name text NOT NULL,
  slug text UNIQUE,
  parent_id uuid REFERENCES categories(id),
  is_active boolean DEFAULT true,
  display_order integer,
  created_at timestamp with time zone
);
```

### 5. **chat_rooms** (채팅방)
```sql
CREATE TABLE chat_rooms (
  id uuid PRIMARY KEY,
  user1_id uuid REFERENCES users(id),
  user2_id uuid REFERENCES users(id),
  service_id uuid REFERENCES services(id),
  last_message_at timestamp with time zone,
  created_at timestamp with time zone
);
```

### 6. **chat_messages** (채팅 메시지)
```sql
CREATE TABLE chat_messages (
  id uuid PRIMARY KEY,
  room_id uuid REFERENCES chat_rooms(id),
  sender_id uuid REFERENCES users(id),
  message text,
  is_read boolean DEFAULT false,
  created_at timestamp with time zone
);
```

---

## ⚠️ 빈 테이블 (사용 안 됨)

다음 테이블들은 데이터가 없습니다:

1. **activity_logs** - 활동 로그
2. **advertising_campaigns** - 광고 캠페인
3. **conversations** - 대화 (chat_rooms와 중복?)
4. **disputes** - 분쟁
5. **earnings_transactions** - 수익 거래
6. **favorites** - 즐겨찾기 (service_favorites와 중복?)
7. **messages** - 메시지 (chat_messages와 중복?)
8. **notifications** - 알림
9. **payment_requests** - 결제 요청
10. **payments** - 결제
11. **portfolio_items** - 포트폴리오 항목
12. **premium_placements** - 프리미엄 배치
13. **quote_responses** - 견적 응답
14. **quotes** - 견적
15. **refunds** - 환불
16. **reports** - 신고
17. **search_logs** - 검색 로그
18. **settlement_details** - 정산 상세
19. **settlements** - 정산
20. **service_tags** - 서비스 태그
21. **service_view_logs** - 서비스 조회 로그
22. **tags** - 태그
23. **user_coupons** - 사용자 쿠폰
24. **wallet_transactions** - 지갑 거래

---

## 🔗 파일과 DB 비교

### TypeScript 타입 파일 위치
- `src/types/database.ts` - Supabase 자동 생성 타입
- `src/types/common.ts` - 커스텀 인터페이스

### 확인 필요 사항

1. **중복 테이블 확인**
   - `conversations` vs `chat_rooms`
   - `messages` vs `chat_messages`
   - `favorites` vs `service_favorites`

2. **타입 불일치 확인**
   - TypeScript에서 `view_count`로 사용
   - DB에서는 `views` 컬럼명 사용

3. **NULL 가능 필드 확인**
   - 모든 필드가 nullable로 보임
   - TypeScript 타입과 일치하는지 확인 필요

---

## 📝 다음 단계

1. **src/types/database.ts 업데이트**
   ```bash
   npx supabase gen types typescript --project-id bpvfkkrlyrjkwgwmfrci > src/types/database.ts
   ```

2. **사용하지 않는 테이블 정리**
   - 빈 테이블 24개 삭제 고려

3. **인덱스 최적화**
   - 이미 적용된 인덱스 확인 완료
   - 추가 인덱스 필요 없음

4. **RLS 정책 확인**
   - 각 테이블의 RLS 정책 검토 필요

---

## ✅ 저장된 파일

1. **database/supabase-schema-2025-11-12.sql** - 전체 스키마
2. **database/SCHEMA_ANALYSIS.md** - 이 분석 문서
