
-- 기존에 잘못되었을 수 있는 정책을 제거합니다.
DROP POLICY IF EXISTS "Authenticated users can view their own profile." ON public.users;
DROP POLICY IF EXISTS "Enable read access for authenticated users on their own records" ON public.users;
DROP POLICY IF EXISTS "사용자는 자신의 프로필 정보를 조회할 수 있습니다." ON public.users;


-- 새로운 RLS 정책을 생성합니다.
-- 이 정책은 인증된 사용자가 자신의 user 레코드만 조회할 수 있도록 허용합니다.
CREATE POLICY "사용자는 자신의 프로필 정보를 조회할 수 있습니다."
ON public.users
FOR SELECT
USING (auth.uid() = id);

-- 참고: users 테이블에 RLS가 활성화되어 있는지 확인합니다.
-- 만약 비활성화 상태라면 아래 주석을 해제하고 실행해야 합니다.
-- ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

