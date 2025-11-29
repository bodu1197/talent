-- 사용자 본인인증 관련 컬럼 추가
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_verified boolean DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS verified_at timestamptz;
ALTER TABLE users ADD COLUMN IF NOT EXISTS verification_ci text; -- 중복가입 확인용 CI
ALTER TABLE users ADD COLUMN IF NOT EXISTS real_name text; -- 실명
ALTER TABLE users ADD COLUMN IF NOT EXISTS birth_date date; -- 생년월일
ALTER TABLE users ADD COLUMN IF NOT EXISTS gender text; -- 성별 (male/female)

-- 인덱스 추가
CREATE INDEX IF NOT EXISTS idx_users_is_verified ON users(is_verified);
CREATE INDEX IF NOT EXISTS idx_users_verification_ci ON users(verification_ci);

-- 코멘트 추가
COMMENT ON COLUMN users.is_verified IS '본인인증 완료 여부';
COMMENT ON COLUMN users.verified_at IS '본인인증 완료 시각';
COMMENT ON COLUMN users.verification_ci IS '본인인증 CI (중복가입 확인용)';
COMMENT ON COLUMN users.real_name IS '본인인증된 실명';
COMMENT ON COLUMN users.birth_date IS '본인인증된 생년월일';
COMMENT ON COLUMN users.gender IS '본인인증된 성별 (male/female)';
