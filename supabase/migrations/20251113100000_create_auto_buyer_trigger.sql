-- 회원가입 시 buyers 자동 생성 트리거
-- sellers는 "판매자 되기" 클릭 시에만 생성

-- 1. handle_new_user 함수 생성
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- users 테이블에 프로필 생성
  INSERT INTO public.users (id, email, name, profile_image)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', '익명'),
    COALESCE(NEW.raw_user_meta_data->>'profile_image', '')
  );

  -- buyers 테이블에 자동 생성 (모든 회원은 기본 구매자)
  INSERT INTO public.buyers (user_id)
  VALUES (NEW.id);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. 트리거 생성
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 3. sellers 테이블에 verified 컬럼 추가 (없으면)
ALTER TABLE public.sellers
ADD COLUMN IF NOT EXISTS verified boolean DEFAULT false;

ALTER TABLE public.sellers
ADD COLUMN IF NOT EXISTS verified_at timestamp with time zone;

ALTER TABLE public.sellers
ADD COLUMN IF NOT EXISTS verified_name text;

ALTER TABLE public.sellers
ADD COLUMN IF NOT EXISTS verified_phone text;

-- 4. 기존 users에 대해 buyers 생성 (없는 경우만)
INSERT INTO public.buyers (user_id)
SELECT u.id
FROM public.users u
LEFT JOIN public.buyers b ON b.user_id = u.id
WHERE b.id IS NULL;

-- 5. 코멘트 추가
COMMENT ON FUNCTION public.handle_new_user() IS '회원가입 시 users, buyers 자동 생성. sellers는 "판매자 되기" 시 수동 생성';
COMMENT ON COLUMN public.sellers.verified IS '본인인증 완료 여부';
COMMENT ON COLUMN public.sellers.verified_at IS '본인인증 완료 시간';
COMMENT ON COLUMN public.sellers.verified_name IS '본인인증으로 확인된 실명';
COMMENT ON COLUMN public.sellers.verified_phone IS '본인인증으로 확인된 전화번호';
