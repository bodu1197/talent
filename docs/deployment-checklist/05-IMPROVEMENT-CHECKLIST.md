# 📋 배포 전 개선 작업 체크리스트

**마지막 업데이트**: 2025-11-12
**전체 진행률**: 0/35 (0%)

---

## 🔴 Phase 1: 긴급 보안 이슈 (필수 - 배포 차단)

### 1.1 하드코딩된 시크릿 제거
- [ ] `scripts/migrate-chat-rooms.js` 수정
- [ ] `scripts/run-migration-direct.js` 수정
- [ ] `scripts/run-migration.js` 수정
- [ ] Git 히스토리에서 키 노출 여부 확인
- [ ] 만약 노출되었다면 Supabase 키 재발급

**예상 시간**: 30분
**담당자**:
**완료일**:

---

### 1.2 핵심 테이블 RLS 정책 생성
- [ ] users 테이블 RLS 정책 마이그레이션 작성
- [ ] sellers 테이블 RLS 정책 마이그레이션 작성
- [ ] buyers 테이블 RLS 정책 마이그레이션 작성
- [ ] orders 테이블 RLS 정책 마이그레이션 작성
- [ ] services 테이블 RLS 정책 마이그레이션 작성
- [ ] 마이그레이션 적용 및 테스트

**예상 시간**: 4시간
**담당자**:
**완료일**:

---

### 1.3 Storage RLS 정책 생성
- [ ] portfolio 버킷 RLS 정책 작성
- [ ] 마이그레이션 적용

**예상 시간**: 1시간
**담당자**:
**완료일**:

---

## 🟡 Phase 2: 데이터베이스 최적화 (강력 권장)

### 2.1 채팅 시스템 인덱스 추가
- [ ] `idx_chat_messages_room_id` 생성
- [ ] `idx_chat_messages_sender_id` 생성
- [ ] `idx_chat_rooms_user1_id` 생성
- [ ] `idx_chat_rooms_user2_id` 생성
- [ ] `idx_chat_rooms_last_message_at` 생성

**예상 시간**: 1시간
**담당자**:
**완료일**:

---

### 2.2 주문 시스템 인덱스 추가
- [ ] `idx_orders_seller_status` 생성
- [ ] `idx_orders_buyer_status` 생성
- [ ] `idx_orders_merchant_uid` 생성

**예상 시간**: 30분
**담당자**:
**완료일**:

---

### 2.3 알림 시스템 인덱스 추가
- [ ] `idx_notifications_user_read` 복합 인덱스 생성

**예상 시간**: 15분
**담당자**:
**완료일**:

---

### 2.4 서비스/리뷰 인덱스 추가
- [ ] `idx_reviews_service_visible` 생성
- [ ] `idx_services_seller_status` 생성
- [ ] `idx_services_featured` 생성

**예상 시간**: 30분
**담당자**:
**완료일**:

---

### 2.5 카테고리 인덱스 추가
- [ ] `idx_categories_parent_id` 생성

**예상 시간**: 15분
**담당자**:
**완료일**:

---

## 💻 Phase 3: 코드 품질 개선 (강력 권장)

### 3.1 Console.log 제거 - ChatUnreadProvider
- [ ] 20개 console.log를 logger.dev()로 교체
- [ ] 테스트 확인

**예상 시간**: 30분
**담당자**:
**완료일**:

---

### 3.2 Console.log 제거 - ChatListClient
- [ ] 18개 console.log를 logger.dev()로 교체
- [ ] 테스트 확인

**예상 시간**: 30분
**담당자**:
**완료일**:

---

### 3.3 Console.log 제거 - DirectChatClient
- [ ] 8개 console.log를 logger.dev()로 교체
- [ ] 테스트 확인

**예상 시간**: 15분
**담당자**:
**완료일**:

---

### 3.4 Console.log 제거 - CategoryVisitTracker
- [ ] 9개 console.log를 logger.dev()로 교체
- [ ] 테스트 확인

**예상 시간**: 15분
**담당자**:
**완료일**:

---

### 3.5 Console.error를 logger.error로 교체
- [ ] API routes의 console.error 15개 교체

**예상 시간**: 30분
**담당자**:
**완료일**:

---

## 🎯 Phase 4: TypeScript 타입 안전성 (권장)

### 4.1 database.ts 재생성
- [ ] Supabase에서 최신 타입 정의 생성
- [ ] src/types/database.ts 교체
- [ ] 타입 오류 수정

**예상 시간**: 1시간
**담당자**:
**완료일**:

---

### 4.2 logger.ts 제네릭 타입 적용
- [ ] 8개 any 타입을 제네릭으로 교체

**예상 시간**: 30분
**담당자**:
**완료일**:

---

### 4.3 admin.ts 타입 정의
- [ ] 13개 any 타입 제거
- [ ] 쿼리 결과 타입 정의

**예상 시간**: 2시간
**담당자**:
**완료일**:

---

### 4.4 Admin 페이지 타입 정의
- [ ] types/admin.ts 생성
- [ ] Dashboard 타입 정의
- [ ] Users 타입 정의
- [ ] Orders 타입 정의
- [ ] Services 타입 정의
- [ ] Reviews 타입 정의

**예상 시간**: 3시간
**담당자**:
**완료일**:

---

## 🧪 Phase 5: 테스트 인프라 구축 (권장)

### 5.1 Vitest 설정
- [ ] vitest.config.ts 생성
- [ ] 기존 테스트 수정 및 실행 확인

**예상 시간**: 1시간
**담당자**:
**완료일**:

---

### 5.2 Playwright 설정
- [ ] playwright.config.ts 생성
- [ ] E2E 테스트 분리
- [ ] 기존 E2E 테스트 실행 확인

**예상 시간**: 1시간
**담당자**:
**완료일**:

---

### 5.3 결제 검증 테스트 작성
- [ ] /api/payments/verify 단위 테스트
- [ ] Rate limiting 테스트
- [ ] UUID 검증 테스트
- [ ] 금액 검증 테스트

**예상 시간**: 3시간
**담당자**:
**완료일**:

---

### 5.4 주문 관리 테스트 작성
- [ ] getBuyerOrders 테스트
- [ ] getSellerOrders 테스트
- [ ] confirmOrder 테스트
- [ ] requestRevision 테스트

**예상 시간**: 3시간
**담당자**:
**완료일**:

---

## 💳 Phase 6: 결제 시스템 프로덕션 준비

### 6.1 PortOne 프로덕션 설정
- [ ] PortOne 대시보드에서 스토어 ID 발급
- [ ] API Secret 발급
- [ ] PG사 계약 완료
- [ ] .env에 프로덕션 키 설정

**예상 시간**: 외부 의존 (1-3일)
**담당자**:
**완료일**:

---

### 6.2 실제 결제 테스트
- [ ] 테스트 결제 진행
- [ ] 결제 검증 확인
- [ ] 환불 테스트

**예상 시간**: 2시간
**담당자**:
**완료일**:

---

### 6.3 실제 계좌 정보 설정
- [ ] 무통장 입금 계좌 실제 정보로 변경

**예상 시간**: 5분
**담당자**:
**완료일**:

---

## 🟢 Phase 7: 모니터링 및 SEO (배포 후)

### 7.1 Sentry 설정
- [ ] Sentry 프로젝트 생성
- [ ] DSN 발급
- [ ] 환경 변수 설정
- [ ] 에러 발생 테스트

**예상 시간**: 1시간
**담당자**:
**완료일**:

---

### 7.2 SEO 추가 최적화
- [ ] robots.txt 생성
- [ ] sitemap.xml 생성
- [ ] 각 서비스 페이지 동적 메타데이터

**예상 시간**: 2시간
**담당자**:
**완료일**:

---

## 🎉 Phase 8: 최종 검증

### 8.1 프로덕션 빌드 테스트
- [ ] `npm run build` 성공 확인
- [ ] 빌드 경고 없는지 확인
- [ ] 번들 크기 확인

**예상 시간**: 30분
**담당자**:
**완료일**:

---

### 8.2 수동 기능 테스트
- [ ] 회원가입/로그인
- [ ] 서비스 등록
- [ ] 서비스 구매
- [ ] 결제 진행
- [ ] 채팅 기능
- [ ] 리뷰 작성
- [ ] 출금 요청

**예상 시간**: 2시간
**담당자**:
**완료일**:

---

### 8.3 성능 테스트
- [ ] Lighthouse 점수 확인
- [ ] 주요 페이지 로딩 속도 확인

**예상 시간**: 1시간
**담당자**:
**완료일**:

---

## 📊 진행 상황 요약

| Phase | 작업 수 | 완료 | 진행률 | 예상 시간 |
|-------|---------|------|--------|-----------|
| Phase 1: 긴급 보안 | 3 | 0 | 0% | 5.5시간 |
| Phase 2: 데이터베이스 | 5 | 0 | 0% | 2.5시간 |
| Phase 3: 코드 품질 | 5 | 0 | 0% | 2시간 |
| Phase 4: TypeScript | 4 | 0 | 0% | 6.5시간 |
| Phase 5: 테스트 | 4 | 0 | 0% | 8시간 |
| Phase 6: 결제 시스템 | 3 | 0 | 0% | 외부+2시간 |
| Phase 7: 모니터링/SEO | 2 | 0 | 0% | 3시간 |
| Phase 8: 최종 검증 | 3 | 0 | 0% | 3.5시간 |
| **전체** | **29** | **0** | **0%** | **~33시간** |

---

## 🎯 권장 작업 순서

### Week 1 (긴급)
- [ ] Phase 1: 긴급 보안 (5.5시간)
- [ ] Phase 2: 데이터베이스 (2.5시간)
- [ ] Phase 6.1: PortOne 설정 시작

### Week 2 (강력 권장)
- [ ] Phase 3: 코드 품질 (2시간)
- [ ] Phase 4.1-4.2: TypeScript 기본 (1.5시간)
- [ ] Phase 5.1-5.2: 테스트 인프라 (2시간)
- [ ] Phase 6.2-6.3: 결제 테스트 (2시간)

### Week 3-4 (권장)
- [ ] Phase 4.3-4.4: TypeScript 심화 (5시간)
- [ ] Phase 5.3-5.4: 테스트 작성 (6시간)
- [ ] Phase 7: 모니터링/SEO (3시간)
- [ ] Phase 8: 최종 검증 (3.5시간)

---

## 📝 작업 완료 시 체크 방법

각 작업 완료 후:
1. 체크박스에 `[x]` 표시
2. 담당자 이름 기입
3. 완료일 기입
4. Git commit 메시지에 체크리스트 항목 번호 포함

예: `git commit -m "feat: [1.1] Remove hardcoded secrets from migration scripts"`

---

**다음 업데이트**: 각 Phase 완료 시
