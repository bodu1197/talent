-- profiles.name 값을 auth.users raw_user_meta_data.name으로 동기화
-- 자동 생성된 닉네임을 사용자가 설정한 이름으로 덮어씀

UPDATE auth.users u
SET raw_user_meta_data = jsonb_set(
  COALESCE(u.raw_user_meta_data, '{}'::jsonb),
  '{name}',
  to_jsonb(p.name)
)
FROM public.profiles p
WHERE u.id = p.user_id
  AND p.name IS NOT NULL
  AND p.name != ''
  AND (
    u.raw_user_meta_data->>'name' IS NULL
    OR u.raw_user_meta_data->>'name' != p.name
  );
