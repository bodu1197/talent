# 메인 페이지 성능 감사 보고서

## 📊 실행일: 2025-11-11

---

## 🔴 심각한 성능 문제

### 1. **중복된 AI 카테고리 쿼리** (최우선 수정 필요)
**위치**: `src/app/page.tsx` + `src/components/home/RecommendedServices.tsx`

**문제점**:
- AI 카테고리를 찾는 동일한 로직이 **2번 실행**됨
- `AIServicesSection` (line 61-75)에서 1번
- `RecommendedServices` (line 8-27)에서 1번
- 동일한 쿼리를 2번 실행하여 **불필요한 DB 부하**

**영향도**:
- DB 쿼리 2회 중복 실행
- 네트워크 왕복 시간 2배
- 데이터베이스 부하 증가

**해결방안**:
```typescript
// 1. page.tsx에서 AI 카테고리 한 번만 조회
const { data: aiCategories } = await supabase
  .from('categories')
  .select('id')
  .eq('is_ai', true)

// 2. 자식 컴포넌트에 props로 전달
<AIServicesSection aiCategories={aiCategories} />
<RecommendedServices aiCategories={aiCategories} />
```

---

### 2. **비효율적인 리뷰 통계 쿼리** (N+1 쿼리 패턴)
**위치**: 모든 섹션 (AI, Recommended, Personalized, RecentViewed)

**문제점**:
- 각 섹션마다 별도로 리뷰 통계를 조회함
- 동일한 서비스가 여러 섹션에 나타날 경우 **중복 조회**
- 서비스 조회 후 → 리뷰 통계 조회 (2단계 쿼리)

**현재 구조**:
```typescript
// 1단계: 서비스 조회
const { data: services } = await supabase.from('services').select(...)

// 2단계: 리뷰 통계 별도 조회
const { data: reviewStats } = await supabase
  .from('reviews')
  .select('service_id, rating')
  .in('service_id', serviceIds)
```

**개선 방안**:
```sql
-- Materialized View 또는 Computed Column 사용
-- services 테이블에 avg_rating, review_count 컬럼 추가
-- Trigger로 자동 업데이트
```

---

### 3. **RecommendedServices의 과도한 데이터 로딩**
**위치**: `src/components/home/RecommendedServices.tsx:49`

**문제점**:
```typescript
.limit(1000) // 충분히 많이 가져오기
```
- **1000개**의 서비스를 가져온 후 클라이언트에서 셔플
- 필요한 건 **15개**인데 1000개를 전송
- 네트워크 대역폭 낭비
- 메모리 낭비

**데이터 크기 추정**:
- 서비스 1개 ≈ 2KB (썸네일 URL, seller 정보 포함)
- 1000개 × 2KB = **2MB**
- 실제 필요: 15개 × 2KB = **30KB**
- **불필요한 데이터: 1.97MB (약 66배)**

**해결방안**:
```typescript
// PostgreSQL에서 랜덤 정렬
.order('created_at', { ascending: false }) // 또는 random()
.limit(50) // 충분한 풀에서 선택
// 클라이언트에서 15개만 선택
```

---

### 4. **PersonalizedServices의 과도한 쿼리**
**위치**: `src/lib/supabase/queries/personalized-services.ts`

**문제점**:
카테고리마다 **5개의 개별 쿼리** 실행:
1. `categories` 테이블 조회 (line 57-60)
2. `service_categories` 링크 테이블 조회 (line 80-83)
3. `services` 테이블 조회 (line 101-114)
4. `reviews` 통계 조회 (line 130-134)
5. RPC `get_recent_category_visits` (line 28-31)

**3개 카테고리 × 5쿼리 = 15개의 DB 쿼리**

**추가 문제**:
```typescript
.limit(1000) // line 114 - 또 1000개!
```

**해결방안**:
- JOIN 쿼리로 통합
- Materialized View 사용
- 서버 사이드 랜덤 정렬

---

### 5. **RecentViewedServices의 복잡한 중첩 쿼리**
**위치**: `src/components/home/RecentViewedServices.tsx`

**문제점**:
```typescript
.select(`
  service_id,
  viewed_at,
  service:services(
    *,
    seller:sellers(...),
    service_categories(
      category:categories(id, name, slug),
      category_id
    )
  )
`)
```

- 깊은 중첩 JOIN (3단계)
- `service_categories`는 배열로 반환 (N+1)
- 불필요한 데이터 페칭 (`services.*` 전체)

---

## 🟡 성능 저하 문제

### 6. **캐싱 완전 비활성화**
**위치**: `src/app/page.tsx:12-14`

```typescript
export const dynamic = 'force-dynamic'
export const revalidate = 0
export const fetchCache = 'force-no-store'
```

**문제점**:
- 모든 요청마다 **전체 페이지 재생성**
- CDN 캐싱 불가능
- 서버 부하 증가

**영향**:
- 첫 로딩 시간 증가
- 서버 CPU/메모리 사용량 증가
- Vercel 함수 실행 시간 증가 (비용 증가)

**개선 방안**:
```typescript
export const revalidate = 60 // 60초마다 재생성
// 또는 ISR (Incremental Static Regeneration) 사용
```

---

### 7. **클라이언트 사이드 랜덤 정렬의 비효율**
**여러 위치**: 모든 섹션

```typescript
// Fisher-Yates 셔플 (line 115-119, 51-56 등)
for (let i = shuffled.length - 1; i > 0; i--) {
  const j = Math.floor(Math.random() * (i + 1));
  [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
}
```

**문제점**:
- 서버에서 대량 데이터 전송 후 클라이언트에서 정렬
- 매번 동일한 결과 (캐싱 불가)
- CPU 낭비

**개선**:
```sql
-- PostgreSQL의 RANDOM() 사용
ORDER BY RANDOM() LIMIT 15
```

---

### 8. **과도한 Console.log**
**위치**: `src/components/home/PersonalizedServices.tsx` + `personalized-services.ts`

```typescript
console.log('[SERVER] PersonalizedServices - Categories count:', ...)
console.log('[PERSONALIZED] Starting - User ID:', ...)
console.log('[PERSONALIZED] RPC called')
console.log('[PERSONALIZED] RPC Error:', ...)
// ... 총 10개 이상의 console.log
```

**문제점**:
- Production 환경에서도 실행
- I/O 오버헤드
- 로그 스토리지 비용

---

## 🟢 개선 권장사항

### 9. **Suspense 경계 최적화 부족**
**위치**: `src/app/page.tsx:38-50`

**현재**:
- 각 섹션이 독립적으로 Suspense
- 하지만 내부 쿼리는 순차적 실행

**개선**:
```typescript
// 모든 쿼리를 병렬로 실행
const [aiServices, recommended, personalized] = await Promise.all([
  getAIServices(),
  getRecommendedServices(),
  getPersonalizedServices()
])
```

---

### 10. **이미지 최적화 누락**
**위치**: 여러 컴포넌트

```typescript
<img src={service.thumbnail_url} ... />
```

**문제점**:
- Next.js Image 컴포넌트 미사용
- 자동 최적화 없음
- lazy loading 미적용

**개선**:
```typescript
import Image from 'next/image'
<Image
  src={service.thumbnail_url}
  width={210}
  height={160}
  loading="lazy"
/>
```

---

## 📈 성능 지표 추정

### 현재 상태:
- **DB 쿼리 수**: ~30-40개 (페이지 로드당)
- **전송 데이터**: ~4-6MB
- **First Contentful Paint**: 2-3초
- **Time to Interactive**: 4-5초

### 최적화 후 예상:
- **DB 쿼리 수**: ~10-15개 (**60% 감소**)
- **전송 데이터**: ~500KB-1MB (**80% 감소**)
- **First Contentful Paint**: 0.8-1.2초 (**60% 개선**)
- **Time to Interactive**: 1.5-2초 (**60% 개선**)

---

## 🎯 우선순위별 수정 계획

### 🔥 최우선 (즉시):
1. AI 카테고리 중복 쿼리 제거
2. `limit(1000)` → `limit(50)` 변경
3. Console.log 제거

### ⚡ 높음 (1주일 내):
4. 리뷰 통계 Materialized View 생성
5. 캐싱 전략 개선 (revalidate: 60)
6. PostgreSQL RANDOM() 사용

### 📊 중간 (2주일 내):
7. PersonalizedServices 쿼리 최적화
8. Image 컴포넌트 적용
9. 병렬 쿼리 실행

### 🔧 낮음 (장기):
10. CDN 이미지 최적화
11. 서비스 워커 추가
12. 프리페칭 전략

---

## 💡 추가 권장사항

### Database:
- `services` 테이블에 `avg_rating`, `review_count` 컬럼 추가
- 인덱스 최적화: `(status, created_at)`, `(category_id, status)`
- Materialized View for 추천 알고리즘

### Caching:
```typescript
// Redis 또는 Vercel KV 사용
const cachedServices = await kv.get('ai-services')
if (cachedServices) return cachedServices

// 60초 캐시
await kv.set('ai-services', services, { ex: 60 })
```

### Monitoring:
- Vercel Analytics 활성화
- Database 쿼리 로깅
- Performance 메트릭 수집

---

## 📝 결론

메인 페이지의 주요 성능 병목:

1. **중복 쿼리**: 동일한 데이터를 여러 번 조회
2. **과도한 데이터 로딩**: 필요량의 66배 전송
3. **캐싱 부재**: 매 요청마다 전체 재생성
4. **비효율적인 쿼리 패턴**: N+1, 깊은 중첩 JOIN

**예상 개선 효과**: 로딩 시간 **60% 단축**, 데이터 전송량 **80% 감소**
