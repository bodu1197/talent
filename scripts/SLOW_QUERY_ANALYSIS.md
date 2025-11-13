# 느린 쿼리 분석 및 최적화 보고서

생성일: 2025-11-14
프로젝트: Talent (bpvfkkrlyrjkwgwmfrci)
분석 기간: 최근 운영 데이터

---

## 📊 전체 요약

### 심각한 성능 문제 발견

**1위: Supabase Realtime 구독 과다 (94.7%)**
- **전체 쿼리 시간의 94.7%** 차지
- 2,034,594회 호출 (비정상적!)
- 총 실행 시간: **3.5시간**
- **조치 필요: 최우선 해결**

**2위: categories 테이블 조회 (4.0%)**
- 63,397회 빈번한 조회
- 총 실행 시간: 528초
- **인덱스는 이미 최적화됨** ✅

**3위: chat_rooms seller_id 조회 (미비)**
- **seller_id 인덱스 누락** 발견
- 마이그레이션 필요

---

## 🔥 우선순위 1: Realtime 구독 과다 (심각)

### 문제점

```
쿼리: realtime.list_changes()
호출 횟수: 2,034,594회
평균 시간: 6.15ms
최대 시간: 7,099ms (7초!)
총 시간: 12,506,144ms (3.5시간)
전체 대비: 94.7%
```

### 원인 분석

**Realtime 구독 사용처 (11개 파일):**
1. `NotificationBell.tsx` - 알림 실시간 업데이트
2. `NotificationProvider.tsx` - 알림 글로벌 상태
3. `ChatListClient.tsx` - 채팅방 목록
4. `DirectChatClient.tsx` - 채팅 메시지
5. `ChatUnreadProvider.tsx` - 읽지 않은 채팅 수
6. `chat/[roomId]/page.tsx` - 채팅방 페이지
7. 나머지 API Routes (서버 사이드)

**문제:**
- 클라이언트가 너무 많은 테이블/채널을 구독
- 페이지 이동 시 구독 해제가 제대로 안 되고 있을 가능성
- 중복 구독 (같은 데이터를 여러 컴포넌트에서 구독)

### 해결 방안

#### 1. 중복 구독 제거 (가장 중요!)

**Before (문제):**
```tsx
// NotificationBell.tsx
useEffect(() => {
  const channel = supabase.channel('notifications')
    .on('postgres_changes', { ... }, handler)
    .subscribe()

  // cleanup 누락 또는 제대로 동작 안 함!
}, [])

// NotificationProvider.tsx
useEffect(() => {
  const channel = supabase.channel('notifications') // 중복!
    .on('postgres_changes', { ... }, handler)
    .subscribe()
}, [])
```

**After (해결):**
```tsx
// 전역 Provider에서만 구독
// NotificationProvider.tsx
useEffect(() => {
  const channel = supabase
    .channel('notifications')
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'notifications',
      filter: `user_id=eq.${userId}`  // 현재 사용자만!
    }, handler)
    .subscribe()

  return () => {
    supabase.removeChannel(channel) // 반드시 cleanup!
  }
}, [userId])

// NotificationBell.tsx에서는 구독 제거, Provider의 상태만 사용
```

#### 2. 필터링 최적화

**Before (모든 데이터 구독):**
```tsx
.on('postgres_changes', {
  event: '*',
  schema: 'public',
  table: 'chat_rooms'
}, handler) // 모든 채팅방 구독!
```

**After (필요한 것만):**
```tsx
.on('postgres_changes', {
  event: '*',
  schema: 'public',
  table: 'chat_rooms',
  filter: `user1_id=eq.${userId}` // 내 채팅방만!
}, handler)
```

#### 3. Cleanup 철저히

```tsx
useEffect(() => {
  const channel = supabase.channel('my-channel')
    .on('postgres_changes', { ... }, handler)
    .subscribe()

  return () => {
    supabase.removeChannel(channel) // 필수!
  }
}, [dependencies])
```

### 예상 효과

- **호출 횟수**: 2,034,594 → 10,000 이하 (99.5% 감소)
- **총 실행 시간**: 3.5시간 → 1분 이내 (99.5% 감소)
- **전체 성능**: 94.7% 향상

### 코드 수정 우선순위

1. **ChatUnreadProvider.tsx** - 읽지 않은 채팅 수 (필터링 추가)
2. **NotificationProvider.tsx** - 알림 (필터링 추가)
3. **ChatListClient.tsx** - 채팅방 목록 (필터링 추가)
4. **DirectChatClient.tsx** - 채팅 메시지 (cleanup 확인)
5. **NotificationBell.tsx** - 중복 구독 제거

---

## 📈 우선순위 2: categories 테이블 최적화 (해결됨)

### 현황

```
쿼리: SELECT * FROM categories WHERE is_active = true ORDER BY display_order
호출 횟수: 63,397회
평균 시간: 8.34ms
총 시간: 528초 (4.0%)
```

### 인덱스 상태 확인 결과

✅ **이미 최적화되어 있음!**

```sql
-- 존재하는 인덱스
CREATE INDEX idx_categories_active
ON categories(is_active, display_order);

-- slug 인덱스도 존재
CREATE UNIQUE INDEX categories_slug_key
ON categories(slug);
```

### 결론

- 인덱스는 이미 완벽하게 구성되어 있음
- 63,397회 호출 자체가 많지만 캐싱으로 해결 가능
- 현재 성능은 허용 범위 (8.34ms)

### 추가 최적화 (선택사항)

**Next.js에서 캐싱 적용:**

```tsx
// app/api/categories/route.ts
export const revalidate = 3600 // 1시간 캐싱

export async function GET() {
  const { data } = await supabase
    .from('categories')
    .select('*')
    .eq('is_active', true)
    .order('display_order')

  return Response.json(data)
}
```

---

## 🔧 우선순위 3: chat_rooms seller_id 인덱스 추가

### 문제점

```
쿼리: SELECT id FROM chat_rooms WHERE seller_id = ?
호출 횟수: 6,910회
평균 시간: 0.87ms
총 시간: 6초
```

**인덱스 누락:**
- `seller_id` 컬럼에 인덱스가 없음
- FK 제약은 있지만 인덱스는 자동 생성 안 됨

### 해결 방법

**마이그레이션 파일 생성:**

```sql
-- 20251114070000_add_chat_rooms_seller_id_index.sql

CREATE INDEX IF NOT EXISTS idx_chat_rooms_seller_id
ON chat_rooms(seller_id);

COMMENT ON INDEX idx_chat_rooms_seller_id IS
'판매자별 채팅방 조회 성능 향상';
```

### 예상 효과

- **평균 시간**: 0.87ms → 0.1-0.2ms (80% 향상)
- **총 시간**: 6초 → 1초 이하

---

## 📊 전체 최적화 효과 예상

| 항목 | Before | After | 개선율 |
|------|--------|-------|--------|
| Realtime 구독 시간 | 3.5시간 (94.7%) | 1분 (0.01%) | **99.5%** |
| categories 조회 | 528초 (4.0%) | 528초 (유지) | 0% (이미 최적화됨) |
| chat_rooms 조회 | 6초 (0.05%) | 1초 (0.008%) | **80%** |
| **총 실행 시간** | **13,208초** | **591초** | **95.5% 향상** |

---

## 🛠️ 실행 계획

### 1단계: chat_rooms 인덱스 추가 (즉시 가능)

```bash
# 마이그레이션 생성 및 실행
node scripts/execute-pending-migrations.js
```

**파일**: `supabase/migrations/20251114070000_add_chat_rooms_seller_id_index.sql`

### 2단계: Realtime 구독 최적화 (코드 수정 필요)

**수정할 파일 (우선순위 순):**

1. **src/components/providers/ChatUnreadProvider.tsx**
   - 필터 추가: `user1_id=eq.${userId} OR user2_id=eq.${userId}`
   - cleanup 확인

2. **src/components/providers/NotificationProvider.tsx**
   - 필터 추가: `user_id=eq.${userId}`
   - cleanup 확인

3. **src/app/chat/ChatListClient.tsx**
   - 필터 추가
   - cleanup 확인

4. **src/components/notifications/NotificationBell.tsx**
   - 중복 구독 제거 (Provider 사용)

5. **src/app/chat/[roomId]/DirectChatClient.tsx**
   - cleanup 확인
   - 필터 최적화

### 3단계: 검증

```bash
# 1시간 후 다시 느린 쿼리 확인
# Realtime 호출이 99% 감소했는지 확인
```

---

## 📋 체크리스트

### 즉시 실행 (데이터베이스)
- [ ] chat_rooms seller_id 인덱스 추가
- [ ] 마이그레이션 실행 및 검증

### 코드 수정 필요 (우선순위 순)
- [ ] ChatUnreadProvider.tsx - Realtime 구독 필터링
- [ ] NotificationProvider.tsx - Realtime 구독 필터링
- [ ] ChatListClient.tsx - Realtime 구독 필터링
- [ ] NotificationBell.tsx - 중복 구독 제거
- [ ] DirectChatClient.tsx - cleanup 확인

### 모니터링
- [ ] 1시간 후 느린 쿼리 재확인
- [ ] Realtime 호출 횟수 감소 확인 (목표: 99% 감소)
- [ ] 전체 성능 95% 향상 확인

---

## 🎯 핵심 요약

### 발견된 문제

1. **심각**: Realtime 구독 과다 (94.7% 차지)
   - 2백만+ 호출은 비정상
   - 중복 구독, cleanup 누락, 필터링 부족

2. **보통**: chat_rooms seller_id 인덱스 누락
   - 간단한 인덱스 추가로 해결

3. **해결됨**: categories 테이블
   - 인덱스 이미 최적화됨

### 조치 사항

**즉시 (5분):**
- ✅ chat_rooms seller_id 인덱스 추가

**단기 (1-2일):**
- ⚠️ Realtime 구독 최적화 (코드 수정)
  - 필터링 추가
  - cleanup 철저히
  - 중복 구독 제거

**예상 효과:**
- 전체 성능 **95.5% 향상**
- 데이터베이스 부하 **99% 감소**
- 사용자 경험 대폭 개선

---

**생성 일시**: 2025-11-14T21:35:00+09:00
**작성자**: Claude Code (AI Assistant)
**프로젝트**: Talent Platform
**상태**: ⚠️ Realtime 구독 과다 - 즉시 조치 필요
