# RLS (Row Level Security) 정책 가이드

## 개요

이 문서는 Supabase 데이터베이스의 RLS(Row Level Security) 정책을 관리하기 위한 가이드입니다.

## 현재 상태

### RLS 함수 정의 ✅

database.ts에 다음 RLS 함수들이 정의되어 있습니다:

```typescript
Functions: {
  is_admin: { Args: never; Returns: boolean }
  is_seller: { Args: never; Returns: boolean }
  owns_service: { Args: { service_id: string }; Returns: boolean }
}
```

## 테이블별 RLS 정책 권장사항

### 1. users 테이블
```sql
-- 자신의 정보만 읽기 가능
CREATE POLICY "Users can view own data"
ON users FOR SELECT
USING (auth.uid() = id);

-- 자신의 정보만 수정 가능
CREATE POLICY "Users can update own data"
ON users FOR UPDATE
USING (auth.uid() = id);
```

### 2. seller_profiles 테이블
```sql
-- 모든 사용자가 판매자 프로필 조회 가능
CREATE POLICY "Anyone can view seller profiles"
ON seller_profiles FOR SELECT
TO public
USING (true);

-- 자신의 판매자 프로필만 수정 가능
CREATE POLICY "Sellers can update own profile"
ON seller_profiles FOR UPDATE
USING (auth.uid() = user_id);
```

### 3. services 테이블
```sql
-- 모든 사용자가 공개된 서비스 조회 가능
CREATE POLICY "Anyone can view active services"
ON services FOR SELECT
USING (status = 'active' AND deleted_at IS NULL);

-- 자신이 등록한 서비스만 수정/삭제 가능
CREATE POLICY "Sellers can manage own services"
ON services FOR ALL
USING (auth.uid() = seller_id);
```

### 4. orders 테이블
```sql
-- 구매자와 판매자만 주문 조회 가능
CREATE POLICY "Buyers and sellers can view their orders"
ON orders FOR SELECT
USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

-- 구매자만 주문 생성 가능
CREATE POLICY "Buyers can create orders"
ON orders FOR INSERT
WITH CHECK (auth.uid() = buyer_id);

-- 관련자만 주문 상태 업데이트 가능
CREATE POLICY "Related users can update orders"
ON orders FOR UPDATE
USING (auth.uid() = buyer_id OR auth.uid() = seller_id);
```

### 5. payments 테이블
```sql
-- 주문 당사자만 결제 정보 조회 가능
CREATE POLICY "Order participants can view payments"
ON payments FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM orders
    WHERE orders.id = payments.order_id
    AND (orders.buyer_id = auth.uid() OR orders.seller_id = auth.uid())
  )
);
```

### 6. reviews 테이블
```sql
-- 모든 사용자가 공개된 리뷰 조회 가능
CREATE POLICY "Anyone can view visible reviews"
ON reviews FOR SELECT
USING (is_visible = true);

-- 구매자만 자신의 주문에 대해 리뷰 작성 가능
CREATE POLICY "Buyers can create reviews"
ON reviews FOR INSERT
WITH CHECK (
  auth.uid() = buyer_id AND
  EXISTS (
    SELECT 1 FROM orders
    WHERE orders.id = review.order_id
    AND orders.buyer_id = auth.uid()
    AND orders.status = 'completed'
  )
);

-- 판매자는 자신이 받은 리뷰에 답변 가능
CREATE POLICY "Sellers can reply to reviews"
ON reviews FOR UPDATE
USING (auth.uid() = seller_id)
WITH CHECK (auth.uid() = seller_id);
```

### 7. conversations & messages
```sql
-- 대화 참여자만 조회 가능
CREATE POLICY "Participants can view conversations"
ON conversations FOR SELECT
USING (auth.uid() = participant1_id OR auth.uid() = participant2_id);

-- 대화 참여자만 메시지 조회/생성 가능
CREATE POLICY "Participants can view messages"
ON messages FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM conversations
    WHERE conversations.id = messages.conversation_id
    AND (conversations.participant1_id = auth.uid() OR conversations.participant2_id = auth.uid())
  )
);

CREATE POLICY "Participants can send messages"
ON messages FOR INSERT
WITH CHECK (
  auth.uid() = sender_id AND
  EXISTS (
    SELECT 1 FROM conversations
    WHERE conversations.id = messages.conversation_id
    AND (conversations.participant1_id = auth.uid() OR conversations.participant2_id = auth.uid())
  )
);
```

### 8. favorites 테이블
```sql
-- 자신의 찜 목록만 조회 가능
CREATE POLICY "Users can view own favorites"
ON favorites FOR SELECT
USING (auth.uid() = user_id);

-- 자신만 찜 추가/삭제 가능
CREATE POLICY "Users can manage own favorites"
ON favorites FOR ALL
USING (auth.uid() = user_id);
```

### 9. admin 테이블
```sql
-- 관리자만 조회 가능
CREATE POLICY "Admins can view admin data"
ON admins FOR SELECT
USING (is_admin());

-- 슈퍼 관리자만 관리자 추가/수정 가능
CREATE POLICY "Super admins can manage admins"
ON admins FOR ALL
USING (
  is_admin() AND
  EXISTS (
    SELECT 1 FROM admins
    WHERE user_id = auth.uid() AND role = 'super_admin'
  )
);
```

### 10. activity_logs 테이블
```sql
-- 관리자만 로그 조회 가능
CREATE POLICY "Admins can view logs"
ON activity_logs FOR SELECT
USING (is_admin());

-- 시스템만 로그 생성 가능 (service_role)
CREATE POLICY "System can create logs"
ON activity_logs FOR INSERT
TO service_role
WITH CHECK (true);
```

## RLS 정책 적용 순서

### 1단계: Supabase 대시보드 접속
```
https://supabase.com/dashboard/project/YOUR_PROJECT_ID
```

### 2단계: SQL Editor에서 RLS 활성화
```sql
-- 모든 테이블에 RLS 활성화
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE seller_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE search_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE disputes ENABLE ROW LEVEL SECURITY;
ALTER TABLE settlements ENABLE ROW LEVEL SECURITY;
ALTER TABLE refunds ENABLE ROW LEVEL SECURITY;
```

### 3단계: 정책 생성
위의 테이블별 정책을 하나씩 적용

### 4단계: 테스트
```sql
-- 테스트 사용자로 로그인하여 정책 확인
SET LOCAL role = 'authenticated';
SET LOCAL request.jwt.claim.sub = 'test-user-uuid';

-- 쿼리 실행하여 RLS 동작 확인
SELECT * FROM users;
SELECT * FROM orders;
```

## 주의사항

1. **Service Role Key는 RLS를 우회합니다**
   - 서버 사이드 코드에서만 사용
   - 클라이언트에 절대 노출 금지

2. **anon key는 RLS를 적용받습니다**
   - 공개 API에 사용 가능
   - 정책에 따라 접근 제한됨

3. **정책 순서가 중요합니다**
   - OR 조건: 하나라도 true면 허용
   - AND 조건: 모두 true여야 허용

4. **성능 고려**
   - 복잡한 서브쿼리는 성능 저하 가능
   - 인덱스를 적절히 활용
   - 필요시 뷰(View)나 함수 사용

## 모니터링

### RLS 정책 확인
```sql
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE schemaname = 'public';
```

### RLS 활성화 상태 확인
```sql
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public';
```

## 참고 자료

- [Supabase RLS 공식 문서](https://supabase.com/docs/guides/auth/row-level-security)
- [PostgreSQL RLS 문서](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)

---

**작성일:** 2025-11-12
**작성자:** AI Talent Hub Team
**버전:** 1.0
