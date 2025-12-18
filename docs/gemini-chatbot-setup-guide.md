# Gemini 3 Flash AI 챗봇 구축 가이드

## 📋 목차
1. [Google AI API 키 발급](#1-google-ai-api-키-발급)
2. [환경 설정](#2-환경-설정)
3. [패키지 설치](#3-패키지-설치)
4. [데이터베이스 스키마](#4-데이터베이스-스키마)
5. [구현](#5-구현)

---

## 1. Google AI API 키 발급

### 단계별 가이드

#### Step 1: Google AI Studio 접속
1. 브라우저에서 [https://aistudio.google.com/](https://aistudio.google.com/) 접속
2. Google 계정으로 로그인

#### Step 2: API 키 발급
1. 좌측 메뉴에서 **"Get API key"** 또는 **"API keys"** 클릭
2. **"Create API key"** 버튼 클릭
3. 새 프로젝트에서 생성 또는 기존 Google Cloud 프로젝트 선택
4. API 키 복사 (한 번만 표시되므로 안전한 곳에 저장)

#### Step 3: API 키 제한 설정 (권장)
1. Google Cloud Console에서 해당 API 키 선택
2. "API restrictions" 설정:
   - **Generative Language API** 활성화
3. "Application restrictions" 설정:
   - IP 주소 제한 또는 HTTP referrer 제한 추가 (선택사항)

### 💡 무료 할당량
- **Gemini 3 Flash**: 분당 15 요청 (무료)
- **일일 제한**: 1,500 요청
- **유료 전환**: 필요시 Cloud Billing 연결

---

## 2. 환경 설정

### `.env.local` 파일 업데이트

```bash
# Google AI API
GEMINI_API_KEY=your_gemini_api_key_here

# (기존 환경 변수는 유지)
```

### Vercel 환경 변수 설정 (배포용)
1. Vercel 대시보드 → 프로젝트 선택
2. **Settings** → **Environment Variables**
3. 추가:
   - Name: `GEMINI_API_KEY`
   - Value: `your_gemini_api_key_here`
   - Environment: Production, Preview, Development

---

## 3. 패키지 설치

```bash
npm install @google/generative-ai
```

---

## 4. 데이터베이스 스키마

### Supabase 테이블 생성

```sql
-- 챗봇 세션 테이블
CREATE TABLE chat_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- 챗봇 메시지 테이블
CREATE TABLE chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES chat_sessions(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- 지식 베이스 테이블 (FAQ)
CREATE TABLE chat_knowledge_base (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  keywords TEXT[] DEFAULT ARRAY[]::TEXT[],
  priority INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스 생성
CREATE INDEX idx_chat_messages_session_id ON chat_messages(session_id);
CREATE INDEX idx_chat_messages_created_at ON chat_messages(created_at);
CREATE INDEX idx_chat_sessions_user_id ON chat_sessions(user_id);
CREATE INDEX idx_chat_sessions_session_id ON chat_sessions(session_id);
CREATE INDEX idx_chat_knowledge_base_category ON chat_knowledge_base(category);
CREATE INDEX idx_chat_knowledge_base_keywords ON chat_knowledge_base USING GIN(keywords);

-- RLS 정책
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_knowledge_base ENABLE ROW LEVEL SECURITY;

-- chat_sessions 정책
CREATE POLICY "Users can view own sessions"
  ON chat_sessions FOR SELECT
  USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can create sessions"
  ON chat_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- chat_messages 정책
CREATE POLICY "Users can view messages from own sessions"
  ON chat_messages FOR SELECT
  USING (
    session_id IN (
      SELECT id FROM chat_sessions 
      WHERE user_id = auth.uid() OR user_id IS NULL
    )
  );

CREATE POLICY "Users can create messages"
  ON chat_messages FOR INSERT
  WITH CHECK (
    session_id IN (
      SELECT id FROM chat_sessions 
      WHERE user_id = auth.uid() OR user_id IS NULL
    )
  );

-- chat_knowledge_base 정책 (모두 읽기 가능)
CREATE POLICY "Anyone can read active knowledge base"
  ON chat_knowledge_base FOR SELECT
  USING (is_active = TRUE);
```

---

## 5. 구현

구현은 다음 단계로 진행됩니다:

1. **챗봇 UI 컴포넌트** - 플로팅 버튼 + 대화창
2. **API Routes** - 메시지 처리
3. **Gemini 통합** - AI 응답 생성
4. **지식 베이스 연동** - FAQ 기반 답변

자세한 구현 코드는 다음 단계에서 제공됩니다.

---

## 📚 참고 자료

- [Google AI Studio](https://aistudio.google.com/)
- [Gemini API Documentation](https://ai.google.dev/docs)
- [Gemini 3 Flash Release Notes](https://developers.googleblog.com/en/gemini-3-flash-now-available-to-developers/)

---

## 🔒 보안 고려사항

1. **API 키 보호**
   - `.env.local` 파일을 `.gitignore`에 포함
   - 클라이언트 사이드에서 절대 노출 금지
   - 모든 AI 호출은 서버 사이드에서만 실행

2. **Rate Limiting**
   - 악용 방지를 위한 요청 제한 설정
   - Upstash Redis로 사용자별 제한 구현

3. **입력 검증**
   - 사용자 입력 sanitization
   - 악의적인 프롬프트 필터링

---

**다음 단계**: 실제 코드 구현을 시작합니다.
