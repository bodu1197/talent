const https = require('https');

const sql = `
-- 공지사항 테이블 생성
CREATE TABLE IF NOT EXISTS notices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(200) NOT NULL,
  content TEXT NOT NULL,
  category VARCHAR(20) NOT NULL DEFAULT '공지' CHECK (category IN ('공지', '이벤트', '업데이트', '점검', '정책')),
  is_important BOOLEAN DEFAULT FALSE,
  is_published BOOLEAN DEFAULT TRUE,
  view_count INTEGER DEFAULT 0,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_notices_is_published ON notices(is_published);
CREATE INDEX IF NOT EXISTS idx_notices_created_at ON notices(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notices_category ON notices(category);
CREATE INDEX IF NOT EXISTS idx_notices_is_important ON notices(is_important);

-- RLS 활성화
ALTER TABLE notices ENABLE ROW LEVEL SECURITY;

-- RLS 정책: 누구나 공개된 공지사항 조회 가능
DROP POLICY IF EXISTS "notices_select_published" ON notices;
CREATE POLICY "notices_select_published" ON notices
  FOR SELECT USING (is_published = TRUE);

-- RLS 정책: 관리자만 모든 공지사항 조회 가능
DROP POLICY IF EXISTS "notices_select_admin" ON notices;
CREATE POLICY "notices_select_admin" ON notices
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM admins
      WHERE admins.user_id = auth.uid()
      AND admins.role = 'super_admin'
    )
  );

-- RLS 정책: 관리자만 공지사항 생성 가능
DROP POLICY IF EXISTS "notices_insert_admin" ON notices;
CREATE POLICY "notices_insert_admin" ON notices
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM admins
      WHERE admins.user_id = auth.uid()
      AND admins.role = 'super_admin'
    )
  );

-- RLS 정책: 관리자만 공지사항 수정 가능
DROP POLICY IF EXISTS "notices_update_admin" ON notices;
CREATE POLICY "notices_update_admin" ON notices
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM admins
      WHERE admins.user_id = auth.uid()
      AND admins.role = 'super_admin'
    )
  );

-- RLS 정책: 관리자만 공지사항 삭제 가능
DROP POLICY IF EXISTS "notices_delete_admin" ON notices;
CREATE POLICY "notices_delete_admin" ON notices
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM admins
      WHERE admins.user_id = auth.uid()
      AND admins.role = 'super_admin'
    )
  );

-- updated_at 자동 업데이트 트리거
CREATE OR REPLACE FUNCTION update_notices_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_notices_updated_at ON notices;
CREATE TRIGGER trigger_notices_updated_at
  BEFORE UPDATE ON notices
  FOR EACH ROW
  EXECUTE FUNCTION update_notices_updated_at();

-- 조회수 증가 함수 (익명 사용자도 호출 가능)
CREATE OR REPLACE FUNCTION increment_notice_view_count(notice_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE notices
  SET view_count = view_count + 1
  WHERE id = notice_id AND is_published = TRUE;
END;
$$;
`;

const sampleData = `
INSERT INTO notices (title, content, category, is_important, is_published) VALUES
('돌파구 서비스 정식 오픈 안내', '안녕하세요, 돌파구입니다.

드디어 돌파구 서비스가 정식으로 오픈되었습니다!

돌파구는 판매자와 구매자 모두 수수료 0%로 운영되는 국내 유일의 재능 거래 플랫폼입니다.

많은 이용 부탁드립니다.

감사합니다.', '공지', TRUE, TRUE),
('신규 회원 가입 이벤트 - 첫 구매 10% 할인', '신규 회원 가입을 축하합니다!

가입일로부터 30일 이내 첫 구매 시 10% 할인 혜택을 드립니다.

이벤트 기간: 2025년 12월 31일까지

많은 참여 부탁드립니다.', '이벤트', FALSE, TRUE),
('서비스 개선 업데이트 안내', '더 나은 서비스를 위해 다음과 같은 기능들이 업데이트되었습니다.

1. 메시지 알림 기능 개선
2. 서비스 검색 정확도 향상
3. 모바일 UI/UX 개선

더 나은 돌파구가 되겠습니다.', '업데이트', FALSE, TRUE),
('시스템 정기 점검 안내', '시스템 안정화를 위한 정기 점검이 예정되어 있습니다.

점검 일시: 2025년 12월 1일 오전 3시 ~ 6시
점검 내용: 서버 최적화 및 보안 업데이트

점검 시간 동안 서비스 이용이 제한될 수 있습니다.
양해 부탁드립니다.', '점검', FALSE, TRUE),
('이용약관 및 개인정보처리방침 변경 안내', '이용약관 및 개인정보처리방침이 일부 변경되었습니다.

변경 시행일: 2025년 12월 1일

주요 변경 사항은 이용약관 페이지에서 확인하실 수 있습니다.

문의사항이 있으시면 고객센터로 연락 부탁드립니다.', '정책', FALSE, TRUE)
ON CONFLICT DO NOTHING;
`;

async function runQuery(_query) {
  return new Promise((resolve, reject) => {

    const options = {
      hostname: 'api.supabase.com',
      port: 443,
      path: '/v1/projects/bpvfkkrlyrjkwgwmfrci/database/query',
      method: 'POST',
      headers: {
        Authorization: 'Bearer sbp_140ed0f35c7b31aa67f56bdca11db02fd469802f',
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data),
      },
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        try {
          resolve(result);
        } catch {
          resolve({ raw: body });
        }
      });
    });

    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function main() {
  console.warn('공지사항 테이블 생성 중...');

  try {
    const result1 = await runQuery(sql);

    console.warn('테이블 생성 결과:', JSON.stringify(result1, null, 2));

    console.warn('\n샘플 데이터 삽입 중...');
    const result2 = await runQuery(sampleData);

    console.warn('샘플 데이터 삽입 결과:', JSON.stringify(result2, null, 2));

    console.warn('\n마이그레이션 완료!');
  } catch (error) {
    console.error('오류:', error);
  }
}

main();
