# Database Migrations

## 적용 방법

### 1. Supabase Dashboard SQL Editor 사용 (권장)

1. [Supabase Dashboard](https://supabase.com/dashboard/project/bpvfkkrlyrjkwgwmfrci/sql) 접속
2. SQL Editor 메뉴 선택
3. 아래 마이그레이션 파일의 내용을 복사하여 실행

### 2. 최근 마이그레이션

#### 20251112000000_remove_duplicate_indexes.sql
**목적**: 중복 인덱스 제거로 성능 개선

**제거할 인덱스**:
- `idx_favorites_service` (중복)
- `idx_favorites_user_service` (중복)
- `idx_orders_service` (중복)

**실행 방법**:
```sql
-- Supabase Dashboard > SQL Editor에서 실행

-- 1. favorites 테이블 중복 인덱스 제거
DROP INDEX IF EXISTS public.idx_favorites_service;
DROP INDEX IF EXISTS public.idx_favorites_user_service;

-- 2. orders 테이블 중복 인덱스 제거
DROP INDEX IF EXISTS public.idx_orders_service;
```

**확인 방법**:
```sql
-- 인덱스 목록 확인
SELECT
    tablename,
    indexname,
    indexdef
FROM
    pg_indexes
WHERE
    schemaname = 'public'
    AND tablename IN ('favorites', 'orders')
ORDER BY
    tablename, indexname;
```

## 성능 개선 효과

✅ **저장 공간 절약**: 중복 인덱스 제거로 디스크 사용량 감소
✅ **쓰기 성능 향상**: INSERT/UPDATE/DELETE 시 유지해야 할 인덱스 수 감소
✅ **읽기 성능 유지**: 필수 인덱스는 그대로 유지하여 SELECT 성능 영향 없음

## 롤백

만약 문제가 발생하면 아래 SQL로 롤백:
```sql
-- favorites 테이블 인덱스 재생성
CREATE INDEX idx_favorites_service ON public.favorites USING btree (service_id);
CREATE INDEX idx_favorites_user_service ON public.favorites USING btree (user_id, service_id);

-- orders 테이블 인덱스 재생성
CREATE INDEX idx_orders_service ON public.orders USING btree (service_id);
```
