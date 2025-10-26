# 관리자 페이지 기능 명세서
## AI 재능 거래 플랫폼 - Admin Dashboard

---

## 📊 1. 대시보드 (메인)
**목적**: 플랫폼 전체 현황을 한눈에 파악

### 핵심 지표 (KPI)
```typescript
interface DashboardStats {
  // 사용자 관련
  totalUsers: number           // 전체 회원 수
  newUsersToday: number       // 오늘 신규 가입
  newUsersThisWeek: number    // 이번 주 신규 가입
  activeBuyers: number        // 활성 구매자
  activeSellers: number       // 활성 판매자

  // 서비스 관련
  totalServices: number       // 전체 서비스
  pendingServices: number     // 승인 대기 서비스
  activeServices: number      // 활성 서비스

  // 거래 관련
  totalOrders: number         // 전체 주문
  todayOrders: number         // 오늘 주문
  inProgressOrders: number    // 진행중 주문
  completedOrders: number     // 완료된 주문

  // 매출 관련
  todayRevenue: number        // 오늘 매출
  thisWeekRevenue: number     // 이번 주 매출
  thisMonthRevenue: number    // 이번 달 매출
  platformFee: number         // 플랫폼 수수료 수익

  // 이슈 관련
  pendingReports: number      // 처리 대기 신고
  activeDisputes: number      // 진행중 분쟁
  pendingSettlements: number  // 정산 대기
}
```

### 실시간 모니터링
- 최근 10분간 주문 현황
- 최근 가입 회원 (실시간)
- 최근 신고/분쟁 알림
- 시스템 이상 징후 알림

### 차트/그래프
- 일별 매출 추이 (최근 30일)
- 회원 증가 추이
- 카테고리별 매출 비중
- 인기 서비스 TOP 10

---

## 👥 2. 사용자 관리
**목적**: 구매자/판매자 계정 관리 및 모니터링

### 2.1 사용자 목록
```typescript
interface UserListFilter {
  userType: 'all' | 'buyer' | 'seller' | 'both'
  status: 'all' | 'active' | 'suspended' | 'deleted'
  verificationStatus: 'all' | 'verified' | 'pending' | 'rejected'
  searchKeyword: string        // 이름, 이메일 검색
  joinDateRange: [Date, Date]  // 가입일 범위
  sortBy: 'newest' | 'oldest' | 'most_orders' | 'most_revenue'
}
```

### 2.2 사용자 상세
- 기본 정보: 이름, 이메일, 전화번호, 가입일
- 활동 정보: 마지막 접속, 총 주문수, 총 결제액
- 판매자 정보 (판매자인 경우):
  - 판매 서비스 수
  - 총 매출
  - 평균 평점
  - 응답 시간
  - 정산 계좌 정보
- 제재 이력: 경고, 정지, 영구정지 기록

### 2.3 사용자 액션
- ✅ **계정 승인/거부** (판매자 전환 신청)
- ⚠️ **경고 발송**
- 🚫 **계정 정지** (기간 설정: 7일, 30일, 영구)
- 🔓 **정지 해제**
- 🗑️ **계정 삭제** (GDPR 준수)
- 📧 **이메일/알림 발송**

---

## 🛍️ 3. 서비스 관리
**목적**: 등록된 서비스 검토 및 품질 관리

### 3.1 서비스 목록
```typescript
interface ServiceListFilter {
  status: 'all' | 'pending' | 'active' | 'inactive' | 'rejected' | 'suspended'
  category: string[]           // 카테고리 필터
  priceRange: [number, number]
  searchKeyword: string
  sellerVerified: boolean
  hasDispute: boolean          // 분쟁이 있는 서비스
  sortBy: 'newest' | 'popular' | 'highest_price' | 'most_orders'
}
```

### 3.2 서비스 상세
- 서비스 정보: 제목, 설명, 카테고리, 가격
- 패키지 정보: BASIC/STANDARD/PREMIUM
- 판매자 정보
- 통계: 조회수, 찜하기 수, 주문 수, 평점
- 리뷰 목록
- 연관 신고/분쟁 내역

### 3.3 서비스 액션
- ✅ **승인** (pending → active)
- ❌ **거부** (사유 입력 필수)
- 🚫 **숨김 처리** (부적절한 콘텐츠)
- 🔄 **재검토 요청**
- 🗑️ **삭제**

---

## 📦 4. 주문/거래 관리
**목적**: 모든 거래 모니터링 및 이슈 대응

### 4.1 주문 목록
```typescript
interface OrderListFilter {
  status: 'all' | 'pending_payment' | 'paid' | 'in_progress' |
          'delivered' | 'completed' | 'cancelled' | 'refunded'
  dateRange: [Date, Date]
  amountRange: [number, number]
  hasDispute: boolean
  searchKeyword: string        // 주문번호, 구매자, 판매자
}
```

### 4.2 주문 상세
- 주문 정보: 주문번호, 서비스, 패키지, 금액
- 진행 상태 타임라인
- 구매자/판매자 정보
- 결제 정보
- 배송/파일 정보
- 대화 내역 (선택적)
- 관련 분쟁 내역

### 4.3 주문 액션
- 🔍 **상태 변경** (특수한 경우)
- 💰 **환불 처리** (분쟁 해결)
- 📋 **메모 추가** (관리자 메모)
- 📧 **양측에 알림 발송**

---

## 💳 5. 결제/정산 관리
**목적**: 결제 내역 관리 및 판매자 정산 처리

### 5.1 결제 내역
- 전체 결제 목록
- 결제 방법별 통계
- 결제 실패 내역
- 환불 내역

### 5.2 정산 관리
```typescript
interface SettlementListFilter {
  status: 'pending' | 'processing' | 'completed' | 'failed'
  sellerName: string
  dateRange: [Date, Date]
  amountRange: [number, number]
}
```

### 정산 프로세스
1. **정산 요청 검토**: 판매자 정산 신청 목록
2. **정산 승인**: 계좌 확인 및 금액 검증
3. **정산 처리**: 실제 이체 처리
4. **정산 완료**: 완료 알림 발송

### 5.3 정산 통계
- 이번 달 총 정산 금액
- 정산 대기 금액
- 판매자별 정산 내역
- 정산 수수료 수익

---

## ⭐ 6. 리뷰 관리
**목적**: 부적절한 리뷰 관리 및 품질 유지

### 6.1 리뷰 목록
```typescript
interface ReviewListFilter {
  rating: number[]             // 1~5점
  hasReport: boolean           // 신고된 리뷰
  isVisible: boolean
  searchKeyword: string
  dateRange: [Date, Date]
}
```

### 6.2 리뷰 액션
- 👁️ **숨김/표시 전환**
- 🗑️ **삭제** (부적절한 내용)
- ⚠️ **작성자 경고**
- 📝 **답변 추가** (관리자 답변)

---

## 🚨 7. 신고/분쟁 관리
**목적**: 사용자 신고 처리 및 분쟁 중재

### 7.1 신고 관리 (Reports)
```typescript
interface Report {
  id: string
  reporterType: 'user' | 'service' | 'review' | 'message'
  reportedUserId: string
  reportedEntityId: string      // 신고 대상 ID
  reason: string                // 신고 사유
  category: 'spam' | 'abuse' | 'fraud' | 'inappropriate' | 'other'
  description: string
  evidence: string[]            // 증거 자료 (이미지/파일)
  status: 'pending' | 'reviewing' | 'resolved' | 'rejected'
  adminNote: string             // 관리자 메모
  createdAt: Date
}
```

### 신고 처리 프로세스
1. **신고 접수**: 신고 내용 검토
2. **증거 확인**: 첨부 자료 검토
3. **조치 결정**: 경고/정지/삭제 등
4. **조치 실행**: 자동화된 액션 수행
5. **결과 통보**: 신고자와 피신고자에게 알림

### 7.2 분쟁 관리 (Disputes)
```typescript
interface Dispute {
  id: string
  orderId: string
  initiatedBy: 'buyer' | 'seller'
  reason: 'quality' | 'delivery' | 'refund' | 'other'
  description: string
  requestedAction: 'refund' | 'revision' | 'cancellation'
  status: 'open' | 'in_review' | 'resolved' | 'closed'
  evidence: DisputeEvidence[]
  adminDecision: string
  resolution: 'full_refund' | 'partial_refund' | 'revision' | 'no_action'
  createdAt: Date
  resolvedAt: Date
}
```

### 분쟁 해결 프로세스
1. **분쟁 검토**: 양측 주장 및 증거 확인
2. **조사**: 대화 내역, 파일, 진행 상황 확인
3. **중재안 제시**: 환불, 수정, 재작업 등
4. **결정 집행**: 환불 처리 또는 작업 지시
5. **분쟁 종료**: 양측 동의 및 종료

---

## 📂 8. 카테고리 관리
**목적**: 서비스 분류 체계 관리

### 8.1 카테고리 구조
- **Level 1**: 대분류 (예: AI 그래픽/디자인)
- **Level 2**: 중분류 (예: 로고 디자인)
- **Level 3**: 소분류 (예: 미니멀 로고)

### 8.2 카테고리 액션
- ➕ **카테고리 추가**
- ✏️ **카테고리 수정**
- 🗑️ **카테고리 삭제** (서비스가 없을 때만)
- 🔀 **순서 변경** (드래그 앤 드롭)
- 👁️ **활성화/비활성화**

### 8.3 카테고리 통계
- 카테고리별 서비스 수
- 카테고리별 주문 수
- 카테고리별 매출

---

## 📊 9. 통계/분석
**목적**: 데이터 기반 의사결정 지원

### 9.1 매출 분석
- **일별/주별/월별 매출 그래프**
- **카테고리별 매출 비중**
- **TOP 판매자 랭킹**
- **평균 주문 금액 추이**

### 9.2 사용자 분석
- **신규 가입 추이**
- **구매자/판매자 비율**
- **사용자 활동률** (DAU/MAU)
- **이탈률 분석**

### 9.3 서비스 분석
- **인기 서비스 TOP 20**
- **카테고리별 서비스 분포**
- **평균 가격 분석**
- **신규 등록 추이**

### 9.4 운영 분석
- **고객 응대 시간**
- **분쟁 해결 시간**
- **정산 처리 시간**
- **신고 처리율**

---

## ⚙️ 10. 시스템 설정
**목적**: 플랫폼 운영 정책 및 설정 관리

### 10.1 수수료 설정
```typescript
interface FeeSettings {
  platformFeeRate: number       // 플랫폼 수수료율 (%)
  paymentGatewayFee: number    // PG 수수료율 (%)
  minServicePrice: number       // 최소 서비스 가격
  maxServicePrice: number       // 최대 서비스 가격
  settlementCycle: 'weekly' | 'biweekly' | 'monthly'
  settlementMinAmount: number   // 최소 정산 금액
}
```

### 10.2 정책 설정
- **서비스 등록 정책**
  - 자동 승인 / 수동 검토
  - 필수 입력 항목
  - 금지 키워드

- **환불 정책**
  - 환불 가능 기간
  - 환불 수수료
  - 자동 환불 조건

- **리뷰 정책**
  - 리뷰 작성 가능 기간
  - 리뷰 수정 가능 여부
  - 별점 최소 기준

### 10.3 공지사항 관리
- 전체 공지 등록
- 팝업 공지
- 긴급 공지

### 10.4 관리자 계정 관리
```typescript
interface AdminRole {
  superAdmin: boolean          // 모든 권한
  userManagement: boolean      // 사용자 관리
  serviceManagement: boolean   // 서비스 관리
  orderManagement: boolean     // 주문 관리
  settlementManagement: boolean // 정산 관리
  reportManagement: boolean    // 신고/분쟁 관리
  statisticsView: boolean      // 통계 조회
  systemSettings: boolean      // 시스템 설정
}
```

---

## 📱 11. 활동 로그 (Activity Logs)
**목적**: 관리자 행위 추적 및 감사

### 로그 기록 항목
```typescript
interface ActivityLog {
  adminId: string
  action: string               // 수행한 작업
  entityType: 'user' | 'service' | 'order' | 'settlement' | 'report'
  entityId: string
  oldValue: any                // 변경 전
  newValue: any                // 변경 후
  ipAddress: string
  userAgent: string
  createdAt: Date
}
```

### 추적 액션
- 사용자 정지/해제
- 서비스 승인/거부
- 환불 처리
- 정산 승인
- 분쟁 결정
- 설정 변경

---

## 🔔 12. 알림 센터
**목적**: 중요 이벤트 실시간 알림

### 알림 우선순위
1. **긴급 (RED)**
   - 대량 환불 요청
   - 시스템 오류
   - 결제 실패 급증

2. **중요 (ORANGE)**
   - 신규 분쟁 발생
   - 신고 접수
   - 고액 거래

3. **일반 (BLUE)**
   - 신규 서비스 등록
   - 정산 요청
   - 리뷰 작성

---

## 📋 우선순위별 개발 순서 (권장)

### Phase 1 (필수 - MVP)
1. ✅ **대시보드** - 핵심 지표만
2. ✅ **사용자 관리** - 목록, 상세, 정지/해제
3. ✅ **서비스 관리** - 목록, 승인/거부
4. ✅ **신고 관리** - 기본 처리 기능

### Phase 2 (중요)
5. ✅ **주문 관리** - 모니터링, 환불 처리
6. ✅ **분쟁 관리** - 중재 및 해결
7. ✅ **정산 관리** - 정산 승인 및 처리
8. ✅ **리뷰 관리** - 부적절 리뷰 관리

### Phase 3 (개선)
9. ✅ **통계/분석** - 차트 및 리포트
10. ✅ **카테고리 관리**
11. ✅ **시스템 설정**
12. ✅ **활동 로그**

---

## 🎨 UI/UX 권장사항

### 레이아웃
```
┌─────────────────────────────────────────┐
│  [Logo] AI Talent Hub - Admin           │
├──────┬──────────────────────────────────┤
│      │  📊 대시보드                      │
│ 사이드│  👥 사용자 관리                   │
│ 바   │  🛍️ 서비스 관리                   │
│ 메뉴 │  📦 주문 관리                      │
│      │  💳 정산 관리                      │
│      │  ⭐ 리뷰 관리                     │
│      │  🚨 신고/분쟁                     │
│      │  📂 카테고리                      │
│      │  📊 통계                          │
│      │  ⚙️ 설정                          │
└──────┴──────────────────────────────────┘
```

### 컬러 시스템
- **주색상**: #0f3460 (기존 브랜드 컬러)
- **성공**: #10b981 (green)
- **경고**: #f59e0b (orange)
- **위험**: #ef4444 (red)
- **정보**: #3b82f6 (blue)

### 주요 컴포넌트
- 데이터 테이블 (정렬, 필터, 페이지네이션)
- 통계 카드
- 차트/그래프 (Chart.js 또는 Recharts)
- 모달 다이얼로그
- 알림 토스트
- 로딩 스피너
- 상태 뱃지

---

## 🔐 보안 고려사항

1. **접근 제어**
   - Role-based access control (RBAC)
   - 관리자 권한 분리
   - IP 화이트리스트

2. **감사 추적**
   - 모든 중요 액션 로그
   - 변경 이력 보관
   - 정기 감사

3. **데이터 보호**
   - 민감 정보 마스킹
   - GDPR 준수
   - 개인정보 처리 방침

---

## 📚 기술 스택 권장

### Frontend
- **Framework**: Next.js 16 (현재 사용중)
- **State**: React Hooks + Context API
- **Charts**: Recharts 또는 Chart.js
- **Tables**: TanStack Table (React Table v8)
- **Forms**: React Hook Form + Zod
- **Icons**: FontAwesome (현재 사용중)

### Backend
- **Database**: Supabase PostgreSQL (현재 사용중)
- **Auth**: Supabase Auth (RLS 활용)
- **API**: Next.js API Routes
- **Realtime**: Supabase Realtime (알림용)

---

이 구조로 체계적이고 확장 가능한 관리자 페이지를 구축할 수 있습니다!
