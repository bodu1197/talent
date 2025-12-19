import { GoogleGenerativeAI } from '@google/generative-ai';

// Gemini API 클라이언트 초기화
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// 시스템 프롬프트 - 플랫폼 특화 AI 어시스턴트
const SYSTEM_PROMPT = `당신은 'Dolpagu'(돌파구)의 공식 AI 고객지원 어시스턴트입니다.

=== 플랫폼 핵심 정보 ===
- 이름: Dolpagu (돌파구) - https://dolpagu.com
- 슬로건: "플랫폼은 다리여야 합니다. 통행료를 걷는 관문이 아니라."
- 핵심 가치: **수수료 0원** 재능 거래 플랫폼 (판매자·구매자 모두 무료)
- 설립: 2025년
- 서비스 지역: 대한민국

=== 주요 기능 ===
1. **재능 서비스 거래**: 디자인, 개발, 영상, 마케팅, 번역 등 다양한 분야
2. **심부름 서비스**: 배달, 물건 구매 대행, 간단한 작업 의뢰
3. **실시간 채팅**: 판매자-구매자 간 직접 소통
4. **안전 결제**: 카드, 계좌이체, 카카오페이, 네이버페이 지원
5. **본인인증**: 판매자 신원 확인으로 안전한 거래 보장

=== 수수료 정책 (가장 중요한 차별점!) ===
- **판매 수수료: 0원** (타 플랫폼은 15-20% 수수료)
- **구매 수수료: 0원**
- **플랫폼 이용료: 무료**
- 비교: 크몽(15%), 숨고(10-20%), 프리모아(15%) vs 돌파구(0%)

=== 회원가입/판매자 등록 ===
1. **회원가입**: 이메일, Google, 카카오 소셜 로그인 지원
2. **판매자 등록**: 
   - 마이페이지 → 판매자 등록
   - 휴대폰 본인인증 필수
   - 사업자는 사업자등록증 인증 가능
3. **서비스 등록**: 제목, 설명, 가격, 카테고리 입력 후 바로 판매 시작

=== 결제/환불 ===
- **결제 방법**: 신용카드, 체크카드, 계좌이체, 간편결제
- **환불 정책**: 
  - 서비스 시작 전: 전액 환불
  - 서비스 진행 중: 판매자 협의 후 부분 환불
  - 환불 요청: 마이페이지 → 구매내역 → 환불 요청

=== 분쟁 조정 (AI 심판관) ===
- **분쟁 신청**: https://dolpagu.com/help/dispute
- **AI 심판관**: 양측 주장을 분석하여 공정한 판결
- **환불 기본 규정**:
  1. 서비스 시작 전: 전액 환불 가능
  2. 서비스 진행 중 (가분적 용역): 미진행분 환불 가능
  3. 서비스 진행 중 (불가분적 용역, 예: 로고 디자인): 환불 불가
  4. 표시/광고와 다른 경우: 3개월 이내 취소 가능
- **절차**: 신청 → 상대방 답변(72시간) → AI 심사 → 판결 → 수용/이의신청

=== 고객지원 ===
- **AI 챗봇**: 24시간 자동 상담 (지금 대화 중)
- **1:1 문의**: https://dolpagu.com/help/contact (AI 상담으로 해결되지 않을 때)
- **분쟁 조정**: https://dolpagu.com/help/dispute (거래 관련 분쟁 발생 시)
- **FAQ**: 웹사이트 하단 도움말 센터

=== 응답 규칙 ===
1. 돌파구 관련 질문: 위 정보를 기반으로 정확하게 답변
2. 다른 플랫폼(크몽, 숨고 등) 비교 질문: 돌파구의 0% 수수료 장점 강조
3. 답변 길이: 간결하게 3-5문장 (필요시 리스트 사용)
4. 톤: 친절하고 전문적, 이모지 적절히 사용 (😊, 💡, ✅)
5. 모르는 질문: "https://dolpagu.com/help/contact 에서 1:1 문의해주시면 담당자가 빠르게 도와드립니다" 안내
6. 플랫폼 외 질문: 정중히 플랫폼 관련 도움만 가능하다고 안내
7. **링크 형식**: URL을 제공할 때는 마크다운 사용하지 말고 URL만 단독으로 제공 (예: "1:1 문의: https://dolpagu.com/help/contact"). 절대로 [URL](URL) 형식 사용 금지!`;

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ChatContext {
  sessionId: string;
  userId?: string;
  history: ChatMessage[];
  knowledgeBase?: string;
  // 사용자 맞춤 컨텍스트 (개인화 응답용)
  userContext?: {
    displayName?: string;
    isSeller?: boolean;
    isBuyer?: boolean;
    activeOrders?: number;
    pendingDisputes?: number;
    recentCategories?: string[];
  };
}

/**
 * 사용자 컨텍스트를 문자열로 변환
 */
function buildUserContextString(userContext?: ChatContext['userContext']): string {
  if (!userContext) return '';
  
  const parts: string[] = ['\n\n=== 현재 사용자 정보 ==='];
  
  if (userContext.displayName) {
    parts.push(`- 닉네임: ${userContext.displayName}`);
  }
  if (userContext.isSeller) {
    parts.push('- 역할: 판매자 (서비스 등록 가능)');
  }
  if (userContext.isBuyer && userContext.activeOrders) {
    parts.push(`- 진행 중인 주문: ${userContext.activeOrders}건`);
  }
  if (userContext.pendingDisputes && userContext.pendingDisputes > 0) {
    parts.push(`- 진행 중인 분쟁: ${userContext.pendingDisputes}건 (분쟁 관련 질문 시 상세 안내)`);
  }
  if (userContext.recentCategories && userContext.recentCategories.length > 0) {
    parts.push(`- 관심 카테고리: ${userContext.recentCategories.join(', ')}`);
  }
  
  parts.push('\n이 정보를 활용하여 맞춤형 답변을 제공하세요. 비로그인 사용자에게는 회원가입 혜택을 안내하세요.');
  
  return parts.join('\n');
}

/**
 * API 오류에 대한 사용자 친화적 메시지 반환
 */
function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    if (error.message.includes('quota')) {
      return '죄송합니다. 현재 많은 문의가 몰려 일시적으로 AI 상담이 어렵습니다. https://dolpagu.com/help/contact 에서 1:1 문의해주시면 빠르게 도와드리겠습니다. 🙏';
    }
    if (error.message.includes('API key')) {
      return '시스템 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
    }
  }
  return '죄송합니다. 응답 생성 중 오류가 발생했습니다. 다시 시도해주시거나 https://dolpagu.com/help/contact 에서 1:1 문의해주세요.';
}

/**
 * Gemini 3 Flash (Preview) 모델을 사용하여 챗봇 응답 생성
 */
export async function generateChatResponse(message: string, context: ChatContext): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-3-flash-preview',
      generationConfig: {
        temperature: 0.7,
        topP: 0.8,
        topK: 40,
        maxOutputTokens: 1024,
      },
    });

    // 대화 히스토리 구성
    const history = context.history.map((msg) => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }],
    }));

    // 시스템 프롬프트 구성
    let enhancedSystemPrompt = SYSTEM_PROMPT;
    
    if (context.knowledgeBase) {
      enhancedSystemPrompt += `\n\n관련 정보:\n${context.knowledgeBase}`;
    }
    
    enhancedSystemPrompt += buildUserContextString(context.userContext);

    // 채팅 세션 시작 및 응답 생성
    const chat = model.startChat({
      history: [
        { role: 'user', parts: [{ text: enhancedSystemPrompt }] },
        { role: 'model', parts: [{ text: '안녕하세요! Dolpagu 고객 지원팀입니다. 무엇을 도와드릴까요? 😊' }] },
        ...history,
      ],
    });

    const result = await chat.sendMessage(message);
    return result.response.text();
  } catch (error) {
    console.error('Gemini API Error:', error);
    return getErrorMessage(error);
  }
}

/**
 * 간단한 FAQ 검색 (지식 베이스 활용)
 */
export function searchKnowledgeBase(
  query: string,
  knowledgeBase: Array<{ question: string; answer: string; keywords: string[] }>
): string | null {
  const normalizedQuery = query.toLowerCase();

  // 키워드 매칭
  const matches = knowledgeBase.filter((item) => {
    const keywordMatch = item.keywords.some((keyword) =>
      normalizedQuery.includes(keyword.toLowerCase())
    );
    const questionMatch = item.question.toLowerCase().includes(normalizedQuery);
    return keywordMatch || questionMatch;
  });

  if (matches.length === 0) return null;

  // 매칭된 FAQ를 컨텍스트로 구성
  return matches.map((item) => `Q: ${item.question}\nA: ${item.answer}`).join('\n\n');
}

/**
 * 세션 ID 생성
 */
export function generateSessionId(): string {
  // crypto.randomUUID()를 사용하여 보안성 향상
  const uuid = crypto.randomUUID();
  return `session_${Date.now()}_${uuid.substring(0, 8)}`;
}
