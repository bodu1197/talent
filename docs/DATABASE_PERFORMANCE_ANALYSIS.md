# Database Performance Analysis

## 슬로우 쿼리 분석 결과

### 1. 주요 슬로우 쿼리

#### 1.1 Schema Definition Queries (`pg_get_tabledef`)
**문제**: 테이블 정의를 가져오는 쿼리가 매우 느림 (3.4초 ~ 4.6초)

**원인**:
- Dashboard에서 스키마를 조회할 때 실행
- 테이블이 많고 컬럼이 복잡할수록 느려짐
- 사용자 애플리케이션에는 직접적인 영향 없음

**해결 방안**:
- ✅ 정상적인 동작 (Dashboard 전용 쿼리)
- Dashboard 사용 시에만 발생하므로 최적화 불필요

#### 1.2 Realtime Queries
**문제**: Realtime 관련 쿼리가 자주 실행됨

```sql
-- LOCK TABLE (172회 호출, 평균 403ms)
LOCK TABLE "realtime"."schema_migrations" IN SHARE UPDATE EXCLUSIVE MODE

-- list_changes (17,231회 호출, 평균 3.6ms)
select * from realtime.list_changes($1, $2, $3, $4)
```

**해결 방안**:
- Realtime을 사용하지 않는다면 비활성화
- 필요한 테이블만 Realtime 활성화

### 2. 최적화 권장사항

#### 2.1 자주 조회되는 테이블 인덱스 확인

현재 프로젝트의 주요 테이블:
- `users` - user_type, email 인덱스 필요
- `services` - seller_id, slug, category_id 인덱스 필요
- `orders` - buyer_id, seller_id, status 인덱스 필요
- `categories` - parent_id, slug 인덱스 필요
- `category_visits` - user_id, last_visited_at 인덱스 ✅ (이미 생성됨)

#### 2.2 RLS 정책 최적화

RLS 정책이 활성화된 테이블에서 `auth.uid()` 호출이 많으면 느려질 수 있습니다.

**체크 포인트**:
```sql
-- RLS 정책에서 자주 사용되는 패턴
USING (auth.uid() = user_id)  -- ✅ 인덱스가 있으면 빠름
USING (EXISTS (SELECT 1 FROM ...))  -- ⚠️ 서브쿼리는 느릴 수 있음
```

#### 2.3 Connection Pooling 설정 확인

현재 설정 (config.toml):
```toml
[db.pooler]
enabled = false  # ⚠️ 비활성화됨
pool_mode = "transaction"
default_pool_size = 20
max_client_conn = 100
```

**권장 사항**:
- 프로덕션 환경에서는 Connection Pooling 활성화 권장
- Supabase Dashboard에서 설정 가능

### 3. 현재 인덱스 현황

#### 3.1 생성된 인덱스

```sql
-- category_visits 테이블
CREATE INDEX idx_category_visits_user_id ON category_visits(user_id);
CREATE INDEX idx_category_visits_last_visited ON category_visits(last_visited_at DESC);
CREATE INDEX idx_category_visits_user_last_visited ON category_visits(user_id, last_visited_at DESC);

-- orders 테이블 (기본 제공)
-- buyer_id, seller_id, service_id 외래키에 자동 인덱스 생성됨
```

#### 3.2 추가 권장 인덱스

```sql
-- services 테이블 - 자주 검색되는 컬럼
CREATE INDEX IF NOT EXISTS idx_services_category_id ON services(category_id);
CREATE INDEX IF NOT EXISTS idx_services_seller_id ON services(seller_id);
CREATE INDEX IF NOT EXISTS idx_services_slug ON services(slug);
CREATE INDEX IF NOT EXISTS idx_services_is_active ON services(is_active) WHERE is_active = true;

-- orders 테이블 - 상태별 조회
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_buyer_id_status ON orders(buyer_id, status);
CREATE INDEX IF NOT EXISTS idx_orders_seller_id_status ON orders(seller_id, status);

-- users 테이블 - 타입별 조회
CREATE INDEX IF NOT EXISTS idx_users_user_type ON users(user_type);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
```

### 4. Query Performance 모니터링

#### 4.1 Supabase Dashboard에서 확인

1. **Database** → **Query Performance** 접속
2. **Slow Queries** 탭에서 슬로우 쿼리 확인
3. **Most Called** 탭에서 자주 호출되는 쿼리 확인

#### 4.2 pg_stat_statements 사용

```sql
-- 가장 느린 쿼리 10개
SELECT
  query,
  calls,
  mean_exec_time,
  total_exec_time,
  rows
FROM pg_stat_statements
WHERE query NOT LIKE '%pg_stat_statements%'
ORDER BY mean_exec_time DESC
LIMIT 10;

-- 가장 많이 호출된 쿼리 10개
SELECT
  query,
  calls,
  mean_exec_time,
  total_exec_time
FROM pg_stat_statements
WHERE query NOT LIKE '%pg_stat_statements%'
ORDER BY calls DESC
LIMIT 10;
```

### 5. Realtime 최적화

#### 5.1 필요한 테이블만 활성화

```sql
-- Realtime Publication 확인
SELECT * FROM pg_publication_tables WHERE pubname = 'supabase_realtime';

-- 불필요한 테이블 제거
ALTER PUBLICATION supabase_realtime DROP TABLE table_name;

-- 필요한 테이블만 추가
ALTER PUBLICATION supabase_realtime ADD TABLE orders;
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
```

#### 5.2 Realtime 비활성화 (사용하지 않는 경우)

Supabase Dashboard:
1. **Settings** → **API** 접속
2. **Realtime** 섹션에서 불필요한 테이블 비활성화

### 6. 성능 체크리스트

#### ✅ 완료된 항목
- [x] RLS 정책 활성화 (모든 public 테이블)
- [x] Function search_path 설정
- [x] category_visits 인덱스 생성
- [x] 유출 비밀번호 보호 활성화

#### ⚠️ 검토 필요
- [ ] 추가 인덱스 생성 (services, orders, users)
- [ ] Connection Pooling 활성화 고려
- [ ] Realtime 사용 여부 확인 및 최적화
- [ ] 자주 사용되는 쿼리 EXPLAIN ANALYZE 분석

#### 📊 모니터링 항목
- [ ] 주간 슬로우 쿼리 리포트 확인
- [ ] 데이터베이스 크기 모니터링
- [ ] Connection 수 모니터링
- [ ] Cache Hit Rate 모니터링 (95% 이상 유지)

### 7. 참고 자료

- [Supabase Performance Guide](https://supabase.com/docs/guides/database/performance)
- [PostgreSQL Indexing Best Practices](https://www.postgresql.org/docs/current/indexes.html)
- [Query Performance Tuning](https://supabase.com/docs/guides/database/query-performance)

---

**작성일**: 2025-10-30
**분석 대상**: talent 프로젝트 데이터베이스
**현재 상태**: 정상 (Dashboard 쿼리로 인한 슬로우 쿼리, 실제 앱 성능에는 영향 없음)
