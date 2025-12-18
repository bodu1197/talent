import { GoogleGenerativeAI } from '@google/generative-ai';

// Gemini API 클라이언트 초기화
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// 시스템 프롬프트 - 플랫폼 특화 AI 어시스턴트
const SYSTEM_PROMPT = `당신은 'Dolpagu'라는 AI 재능 거래 플랫폼의 고객 지원 AI 어시스턴트입니다.

플랫폼 정보:
- 이름: Dolpagu (돌파구)
- 서비스: AI 기반 재능 거래 플랫폼
- 기능: 서비스 판매/구매, 심부름 의뢰, 실시간 채팅, 결제 시스템

당신의 역할:
1. 친절하고 전문적인 톤으로 사용자를 도와줍니다
2. 한국어로 자연스럽게 대화합니다
3. 플랫폼 이용 방법, 결제, 환불 등에 대해 안내합니다
4. 복잡한 문제는 고객센터 이메일(help@dolpagu.com)로 안내합니다
5. 항상 긍정적이고 해결 중심적으로 응답합니다

응답 규칙:
- 답변은 간결하고 명확하게 (3-5 문장 이내)
- 리스트나 단계가 필요하면 마크다운 형식 사용
- 불확실한 정보는 추측하지 말고 확인을 권장
- 이모지는 적절히 사용하여 친근함 표현 (😊, 👍, 💡 등)`;

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ChatContext {
  sessionId: string;
  userId?: string;
  history: ChatMessage[];
  knowledgeBase?: string;
}

/**
 * Gemini 3 Flash 모델을 사용하여 챗봇 응답 생성
 */
export async function generateChatResponse(
  message: string,
  context: ChatContext
): Promise<string> {
  try {
    // Gemini 1.5 Flash 모델 초기화 (안정적인 무료 모델)
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.5-flash-lite', // 할당량 관대한 모델
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

    // 지식 베이스가 있으면 시스템 프롬프트에 추가
    let enhancedSystemPrompt = SYSTEM_PROMPT;
    if (context.knowledgeBase) {
      enhancedSystemPrompt += `\n\n관련 정보:\n${context.knowledgeBase}`;
    }

    // 채팅 세션 시작
    const chat = model.startChat({
      history: [
        {
          role: 'user',
          parts: [{ text: enhancedSystemPrompt }],
        },
        {
          role: 'model',
          parts: [{ text: '안녕하세요! Dolpagu 고객 지원팀입니다. 무엇을 도와드릴까요? 😊' }],
        },
        ...history,
      ],
    });

    // 응답 생성
    const result = await chat.sendMessage(message);
    const response = await result.response;
    const text = response.text();

    return text;
  } catch (error) {
    console.error('Gemini API Error:', error);
    
    // API 오류시 친절한 폴백 메시지
    if (error instanceof Error) {
      if (error.message.includes('quota')) {
        return '죄송합니다. 현재 많은 문의가 몰려 일시적으로 AI 상담이 어렵습니다. help@dolpagu.com으로 문의주시면 빠르게 도와드리겠습니다. 🙏';
      }
      if (error.message.includes('API key')) {
        return '시스템 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
      }
    }
    
    return '죄송합니다. 응답 생성 중 오류가 발생했습니다. 다시 시도해주시거나 help@dolpagu.com으로 문의해주세요.';
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
  return matches
    .map((item) => `Q: ${item.question}\nA: ${item.answer}`)
    .join('\n\n');
}

/**
 * 세션 ID 생성
 */
export function generateSessionId(): string {
  // crypto.randomUUID()를 사용하여 보안성 향상
  const uuid = crypto.randomUUID();
  return `session_${Date.now()}_${uuid.substring(0, 8)}`;
}
