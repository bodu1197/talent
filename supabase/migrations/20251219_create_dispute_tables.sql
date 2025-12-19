-- AI 분쟁 조정 시스템 테이블 (수정된 버전)
-- 작성일: 2025-12-19

-- 기존 테이블 삭제 (개발 환경용)
DROP TABLE IF EXISTS dispute_messages CASCADE;
DROP TABLE IF EXISTS dispute_evidences CASCADE;
DROP TABLE IF EXISTS disputes CASCADE;

-- 1. 분쟁 테이블
CREATE TABLE disputes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  case_number TEXT UNIQUE, -- 사건 번호 (예: 2024-0001) - 트리거로 자동 생성
  
  -- 당사자
  plaintiff_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL, -- 원고 (신청자)
  defendant_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL, -- 피고 (상대방)
  
  -- 관련 주문
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  service_id UUID REFERENCES services(id) ON DELETE SET NULL,
  
  -- 분쟁 내용
  dispute_type TEXT NOT NULL CHECK (dispute_type IN (
    'refund', -- 환불 요청
    'quality', -- 서비스 품질 불만
    'mismatch', -- 계약 내용과 다름
    'no_response', -- 무응답/연락두절
    'extra_charge', -- 추가 비용 분쟁
    'other' -- 기타
  )),
  plaintiff_role TEXT NOT NULL CHECK (plaintiff_role IN ('buyer', 'seller')), -- 신청자 역할
  
  -- 금액
  dispute_amount INTEGER NOT NULL DEFAULT 0, -- 분쟁 금액 (원)
  
  -- 주장 내용
  plaintiff_claim TEXT NOT NULL, -- 원고 주장
  defendant_response TEXT, -- 피고 답변
  
  -- AI 판결
  ai_verdict TEXT CHECK (ai_verdict IN (
    'full_refund', -- 전액 환불
    'partial_refund', -- 부분 환불
    'no_refund', -- 환불 불가
    'extra_payment', -- 추가 정산
    'negotiation', -- 합의 권고
    'pending' -- 검토 중
  )),
  ai_refund_amount INTEGER, -- AI 판정 환불 금액
  ai_verdict_reason TEXT, -- AI 판결 이유
  ai_verdict_at TIMESTAMPTZ, -- AI 판결 시간
  
  -- 상태
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
    'pending', -- 접수 대기
    'waiting_response', -- 피고 답변 대기
    'ai_reviewing', -- AI 심사 중
    'ai_verdict', -- AI 판결 완료
    'plaintiff_accepted', -- 원고 수용
    'defendant_accepted', -- 피고 수용
    'both_accepted', -- 양측 수용 (완료)
    'appealed', -- 이의 신청
    'admin_review', -- 관리자 검토
    'resolved', -- 해결 완료
    'cancelled' -- 취소
  )),
  
  -- 수용 여부
  plaintiff_accepted BOOLEAN,
  defendant_accepted BOOLEAN,
  
  -- 시간
  response_deadline TIMESTAMPTZ, -- 피고 답변 기한 (72시간)
  verdict_deadline TIMESTAMPTZ, -- 판결 기한
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. 분쟁 증거 테이블
CREATE TABLE dispute_evidences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  dispute_id UUID REFERENCES disputes(id) ON DELETE CASCADE NOT NULL,
  submitted_by UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  evidence_type TEXT NOT NULL CHECK (evidence_type IN (
    'screenshot', -- 스크린샷
    'file', -- 파일
    'chat_log', -- 채팅 로그
    'contract', -- 계약 내용
    'other' -- 기타
  )),
  
  file_url TEXT,
  description TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. 분쟁 메시지 (타임라인)
CREATE TABLE dispute_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  dispute_id UUID REFERENCES disputes(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  
  message_type TEXT NOT NULL CHECK (message_type IN (
    'claim', -- 원고 주장
    'response', -- 피고 답변
    'evidence', -- 증거 제출
    'ai_analysis', -- AI 분석 결과
    'ai_verdict', -- AI 판결
    'acceptance', -- 수용
    'appeal', -- 이의 신청
    'admin_note', -- 관리자 메모
    'system' -- 시스템 메시지
  )),
  
  content TEXT NOT NULL,
  metadata JSONB, -- 추가 데이터
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. 인덱스
CREATE INDEX idx_disputes_plaintiff ON disputes(plaintiff_id);
CREATE INDEX idx_disputes_defendant ON disputes(defendant_id);
CREATE INDEX idx_disputes_order ON disputes(order_id);
CREATE INDEX idx_disputes_status ON disputes(status);
CREATE INDEX idx_disputes_case_number ON disputes(case_number);
CREATE INDEX idx_dispute_evidences_dispute ON dispute_evidences(dispute_id);
CREATE INDEX idx_dispute_messages_dispute ON dispute_messages(dispute_id);

-- 5. 사건번호 자동 생성 함수
CREATE OR REPLACE FUNCTION generate_case_number()
RETURNS TRIGGER AS $$
DECLARE
  year_part TEXT;
  sequence_num INTEGER;
BEGIN
  year_part := EXTRACT(YEAR FROM NOW())::TEXT;
  
  SELECT COALESCE(MAX(CAST(SUBSTRING(case_number FROM 6) AS INTEGER)), 0) + 1
  INTO sequence_num
  FROM disputes
  WHERE case_number LIKE year_part || '-%';
  
  NEW.case_number := year_part || '-' || LPAD(sequence_num::TEXT, 4, '0');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_case_number ON disputes;
CREATE TRIGGER set_case_number
  BEFORE INSERT ON disputes
  FOR EACH ROW
  EXECUTE FUNCTION generate_case_number();

-- 6. updated_at 자동 업데이트
DROP TRIGGER IF EXISTS update_disputes_updated_at ON disputes;
CREATE TRIGGER update_disputes_updated_at
  BEFORE UPDATE ON disputes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 7. RLS 정책
ALTER TABLE disputes ENABLE ROW LEVEL SECURITY;
ALTER TABLE dispute_evidences ENABLE ROW LEVEL SECURITY;
ALTER TABLE dispute_messages ENABLE ROW LEVEL SECURITY;

-- 분쟁 조회: 당사자만
CREATE POLICY "disputes_select_policy" ON disputes
  FOR SELECT USING (
    auth.uid() = plaintiff_id OR 
    auth.uid() = defendant_id
  );

-- 분쟁 생성: 인증된 사용자
CREATE POLICY "disputes_insert_policy" ON disputes
  FOR INSERT WITH CHECK (auth.uid() = plaintiff_id);

-- 분쟁 수정: 당사자만
CREATE POLICY "disputes_update_policy" ON disputes
  FOR UPDATE USING (
    auth.uid() = plaintiff_id OR 
    auth.uid() = defendant_id
  );

-- 증거 조회
CREATE POLICY "dispute_evidences_select_policy" ON dispute_evidences
  FOR SELECT USING (
    dispute_id IN (
      SELECT id FROM disputes 
      WHERE plaintiff_id = auth.uid() OR defendant_id = auth.uid()
    )
  );

-- 증거 생성
CREATE POLICY "dispute_evidences_insert_policy" ON dispute_evidences
  FOR INSERT WITH CHECK (auth.uid() = submitted_by);

-- 메시지 조회
CREATE POLICY "dispute_messages_select_policy" ON dispute_messages
  FOR SELECT USING (
    dispute_id IN (
      SELECT id FROM disputes 
      WHERE plaintiff_id = auth.uid() OR defendant_id = auth.uid()
    )
  );

-- 메시지 생성
CREATE POLICY "dispute_messages_insert_policy" ON dispute_messages
  FOR INSERT WITH CHECK (
    auth.uid() = sender_id OR sender_id IS NULL
  );
