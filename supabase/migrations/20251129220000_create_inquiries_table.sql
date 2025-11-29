-- 1:1 문의 테이블 생성
CREATE TABLE IF NOT EXISTS inquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL,
  category VARCHAR(50) NOT NULL,
  title VARCHAR(200) NOT NULL,
  content TEXT NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'resolved', 'closed')),
  admin_reply TEXT,
  replied_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  replied_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_inquiries_user_id ON inquiries(user_id);
CREATE INDEX IF NOT EXISTS idx_inquiries_status ON inquiries(status);
CREATE INDEX IF NOT EXISTS idx_inquiries_created_at ON inquiries(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_inquiries_category ON inquiries(category);

-- RLS 활성화
ALTER TABLE inquiries ENABLE ROW LEVEL SECURITY;

-- RLS 정책: 본인 문의만 조회 가능
DROP POLICY IF EXISTS "inquiries_select_own" ON inquiries;
CREATE POLICY "inquiries_select_own" ON inquiries
  FOR SELECT USING (user_id = auth.uid());

-- RLS 정책: 관리자는 모든 문의 조회 가능
DROP POLICY IF EXISTS "inquiries_select_admin" ON inquiries;
CREATE POLICY "inquiries_select_admin" ON inquiries
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM admins
      WHERE admins.user_id = auth.uid()
      AND admins.role = 'super_admin'
    )
  );

-- RLS 정책: 누구나 문의 작성 가능 (비로그인도 가능)
DROP POLICY IF EXISTS "inquiries_insert_anyone" ON inquiries;
CREATE POLICY "inquiries_insert_anyone" ON inquiries
  FOR INSERT WITH CHECK (true);

-- RLS 정책: 관리자만 문의 수정 가능 (답변 등)
DROP POLICY IF EXISTS "inquiries_update_admin" ON inquiries;
CREATE POLICY "inquiries_update_admin" ON inquiries
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM admins
      WHERE admins.user_id = auth.uid()
      AND admins.role = 'super_admin'
    )
  );

-- RLS 정책: 관리자만 문의 삭제 가능
DROP POLICY IF EXISTS "inquiries_delete_admin" ON inquiries;
CREATE POLICY "inquiries_delete_admin" ON inquiries
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM admins
      WHERE admins.user_id = auth.uid()
      AND admins.role = 'super_admin'
    )
  );

-- updated_at 자동 업데이트 트리거
CREATE OR REPLACE FUNCTION update_inquiries_updated_at()
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

DROP TRIGGER IF EXISTS trigger_inquiries_updated_at ON inquiries;
CREATE TRIGGER trigger_inquiries_updated_at
  BEFORE UPDATE ON inquiries
  FOR EACH ROW
  EXECUTE FUNCTION update_inquiries_updated_at();

-- 공지사항 전체 알림 발송 함수
CREATE OR REPLACE FUNCTION notify_all_users_new_notice(
  p_notice_id UUID,
  p_notice_title TEXT
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count INTEGER := 0;
BEGIN
  -- 모든 활성 사용자에게 알림 발송
  INSERT INTO notifications (user_id, type, title, message, link_url, is_read)
  SELECT
    id,
    'notice',
    '새 공지사항',
    p_notice_title,
    '/help/notice/' || p_notice_id::text,
    false
  FROM auth.users
  WHERE id IS NOT NULL;

  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$;
