# 프로필 통합 마이그레이션 가이드

## 📋 개요

회원가입 시 자동 부여되는 이름과 프로필 사진을 회원 정보에 자동으로 적용하고, 판매자 프로필 사진과 회원 기본정보 프로필을 통합하는 마이그레이션입니다.

## 🎯 목표

1. **profiles 테이블 생성** - 사용자 프로필의 단일 소스
2. **자동 동기화** - auth.users.raw_user_meta_data → profiles 자동 동기화
3. **sellers 통합** - sellers.display_name, sellers.profile_image 제거하고 profiles 참조

## 🚀 마이그레이션 적용 방법

### 방법 1: Supabase Dashboard에서 직접 실행 (권장)

1. **Supabase SQL Editor 접속**
   ```
   https://supabase.com/dashboard/project/bpvfkkrlyrjkwgwmfrci/sql/new
   ```

2. **마이그레이션 SQL 복사**
   - 파일: `combined_profile_migration.sql`
   - 또는 아래 SQL 복사

3. **실행**
   - SQL Editor에 붙여넣기
   - "Run" 버튼 클릭

### 방법 2: npx supabase 사용 (로컬 동기화 후)

```bash
# 1. 로컬 마이그레이션 히스토리 복구
npx supabase migration repair --status reverted [모든 원격 마이그레이션 ID]

# 2. 원격 DB 상태를 로컬로 동기화
npx supabase db pull

# 3. 새 마이그레이션 푸시
npx supabase db push
```

⚠️ **주의**: 방법 2는 시간이 오래 걸리므로 방법 1을 권장합니다.

## 📄 마이그레이션 SQL

**파일 위치**: `combined_profile_migration.sql`

### 주요 내용:

1. **profiles 테이블 생성**
   - user_id (auth.users 참조)
   - name (표시 이름)
   - profile_image (프로필 이미지 URL)
   - bio (자기소개)

2. **RLS 정책**
   - 모든 사용자가 프로필 읽기 가능
   - 본인 프로필만 수정 가능

3. **자동 동기화 트리거**
   - auth.users INSERT/UPDATE 시 profiles 자동 생성/업데이트
   - raw_user_meta_data의 name, profile_image → profiles 동기화

4. **기존 데이터 백필**
   - 기존 auth.users의 메타데이터 → profiles로 마이그레이션
   - 기존 sellers의 display_name, profile_image → profiles로 마이그레이션

5. **seller_profiles VIEW 생성**
   - 하위 호환성을 위한 뷰
   - sellers + profiles 조인
   - 기존 코드 수정 없이 작동

6. **sellers 테이블 정리**
   - display_name 컬럼 제거
   - profile_image 컬럼 제거
   - (bio는 seller별 추가 정보용으로 유지)

## ✅ 적용 후 확인사항

### 1. profiles 테이블 확인

```sql
-- profiles 테이블 데이터 확인
SELECT * FROM public.profiles LIMIT 5;

-- 모든 사용자에게 profile이 있는지 확인
SELECT
  COUNT(u.id) as total_users,
  COUNT(p.id) as profiles_created
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.user_id;
```

**예상 결과**: total_users = profiles_created

### 2. seller_profiles VIEW 확인

```sql
-- 판매자 프로필 뷰 확인
SELECT
  user_id,
  display_name,
  profile_image,
  bio
FROM public.seller_profiles
LIMIT 5;
```

**예상 결과**: display_name, profile_image가 profiles에서 가져온 값으로 표시됨

### 3. 자동 동기화 테스트

```sql
-- 테스트: auth.users 메타데이터 업데이트
UPDATE auth.users
SET raw_user_meta_data = jsonb_set(
  raw_user_meta_data,
  '{name}',
  '"테스트이름"'
)
WHERE email = 'test@example.com';

-- profiles에 자동 반영되었는지 확인
SELECT name FROM public.profiles
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'test@example.com');
```

**예상 결과**: profiles.name이 "테스트이름"으로 업데이트됨

## 🔧 다음 단계 (코드 수정)

마이그레이션 적용 후 다음 코드 수정이 필요합니다:

1. **Sidebar 컴포넌트** (`src/components/mypage/Sidebar.tsx`)
   - ~~sellers.display_name, sellers.profile_image~~
   - → `seller_profiles` VIEW 사용 (자동 호환)

2. **Settings 페이지** (`src/app/mypage/settings/page.tsx`)
   - profiles 테이블에서 name, profile_image 가져오기
   - 업데이트 시 profiles 테이블 수정

3. **회원가입 페이지** (`src/app/auth/register/page.tsx`)
   - 현재 코드 그대로 작동 (트리거가 자동 처리)

## 📊 데이터 흐름

```
회원가입
  ↓
auth.signUp() → auth.users.raw_user_meta_data에 {name, profile_image} 저장
  ↓
on_auth_user_profile_sync 트리거 발동
  ↓
profiles 테이블에 자동 생성
  ↓
판매자 등록 시
  ↓
sellers 테이블 생성 (display_name, profile_image 없음)
  ↓
seller_profiles VIEW → profiles에서 display_name, profile_image 가져옴
```

## 🎉 완료!

마이그레이션 적용이 완료되면:
- ✅ 회원가입 시 자동 부여된 이름/사진이 profiles에 저장됨
- ✅ 판매자와 구매자 모두 단일 프로필 소스 사용
- ✅ 기존 코드는 seller_profiles VIEW로 자동 호환
- ✅ 새 코드는 profiles 테이블 직접 사용 가능

---

**작성일**: 2025-11-14
**프로젝트**: Talent Platform
**마이그레이션 파일**:
- `supabase/migrations/20251114080000_create_profiles_table.sql`
- `supabase/migrations/20251114090000_unify_seller_profile_with_profiles.sql`
- `combined_profile_migration.sql` (통합 파일)
