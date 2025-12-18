import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import {
  generateChatResponse,
  searchKnowledgeBase,
  generateSessionId,
  type ChatMessage,
} from '@/lib/ai/gemini';
import { aiChatRateLimit, checkRateLimit, isRedisConfigured } from '@/lib/rate-limit';

interface ChatRequestBody {
  message: string;
  sessionId?: string;
}

// Rate Limit 상태 조회를 위한 함수
async function getRateLimitInfo(identifier: string) {
  if (!isRedisConfigured()) {
    return { remaining: 20, limit: 20, resetInMinutes: 60 };
  }
  
  try {
    const { success, limit, remaining, reset } = await aiChatRateLimit.limit(identifier);
    // limit 호출로 카운트가 증가했으므로, 성공했다면 remaining은 이미 감소한 상태
    // 실패했다면 remaining은 0
    const resetInMinutes = Math.ceil((reset - Date.now()) / 60000);
    
    return {
      remaining: success ? remaining : 0,
      limit,
      resetInMinutes: Math.max(0, resetInMinutes),
      isLimited: !success,
    };
  } catch {
    return { remaining: 20, limit: 20, resetInMinutes: 60 };
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: ChatRequestBody = await request.json();
    const { message, sessionId: clientSessionId } = body;

    if (!message || message.trim().length === 0) {
      return NextResponse.json(
        { error: '메시지를 입력해주세요.' },
        { status: 400 }
      );
    }

    // Supabase 클라이언트 생성
    const supabase = await createClient();
    
    // 현재 사용자 확인 (선택사항 - 비로그인 사용자도 허용)
    const { data: { user } } = await supabase.auth.getUser();

    // Rate Limiting 체크
    // 로그인 사용자: user_id 기반, 비로그인: IP 기반
    const clientIp = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() 
      || request.headers.get('x-real-ip') 
      || 'anonymous';
    const rateLimitIdentifier = user?.id || `ip:${clientIp}`;

    if (isRedisConfigured()) {
      const rateLimitResult = await checkRateLimit(rateLimitIdentifier, aiChatRateLimit);
      
      if (!rateLimitResult.success && rateLimitResult.error) {
        // Rate limit 초과 - 친절한 메시지 반환
        return NextResponse.json(
          { 
            error: '질문 횟수를 초과했습니다.',
            message: '시간당 20회까지 질문할 수 있습니다. 잠시 후 다시 시도해주세요.',
            rateLimited: true,
            retryAfterMinutes: 60,
          },
          { 
            status: 429,
            headers: {
              'X-RateLimit-Limit': '20',
              'X-RateLimit-Remaining': '0',
            }
          }
        );
      }
    }

    // 세션 ID 처리
    let sessionId = clientSessionId;
    let dbSessionId: string | null = null;

    if (!sessionId) {
      sessionId = generateSessionId();
    }

    // 기존 세션 조회 또는 생성 (ai_support_sessions 테이블 사용)
    const { data: existingSession } = await supabase
      .from('ai_support_sessions')
      .select('id')
      .eq('session_key', sessionId)
      .single();

    if (existingSession) {
      dbSessionId = existingSession.id;
    } else {
      // 새 세션 생성
      const { data: newSession, error: sessionError } = await supabase
        .from('ai_support_sessions')
        .insert({
          session_key: sessionId,
          user_id: user?.id || null,
          metadata: {
            created_from: 'web',
            user_agent: request.headers.get('user-agent'),
            ip: clientIp,
          },
        })
        .select('id')
        .single();

      if (sessionError) {
        console.error('Session creation error:', sessionError);
        throw sessionError;
      }

      dbSessionId = newSession.id;
    }

    // 대화 히스토리 조회 (최근 10개) - ai_support_messages 테이블 사용
    const { data: historyMessages } = await supabase
      .from('ai_support_messages')
      .select('role, content')
      .eq('session_id', dbSessionId)
      .order('created_at', { ascending: true })
      .limit(10);

    const history: ChatMessage[] = historyMessages || [];

    // 지식 베이스 조회 - ai_support_knowledge 테이블 사용
    const { data: knowledgeBase } = await supabase
      .from('ai_support_knowledge')
      .select('question, answer, keywords')
      .eq('is_active', true)
      .order('priority', { ascending: false });

    // 지식 베이스 검색
    const relevantKnowledge = knowledgeBase
      ? searchKnowledgeBase(message, knowledgeBase)
      : null;

    // 사용자 메시지 저장 - ai_support_messages 테이블 사용
    await supabase.from('ai_support_messages').insert({
      session_id: dbSessionId,
      role: 'user',
      content: message,
    });

    // AI 응답 생성
    const aiResponse = await generateChatResponse(message, {
      sessionId,
      userId: user?.id,
      history,
      knowledgeBase: relevantKnowledge || undefined,
    });

    // AI 응답 저장
    await supabase.from('ai_support_messages').insert({
      session_id: dbSessionId,
      role: 'assistant',
      content: aiResponse,
    });

    // 세션 업데이트
    await supabase
      .from('ai_support_sessions')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', dbSessionId);

    // 남은 질문 횟수 조회
    const rateLimitInfo = await getRateLimitInfo(rateLimitIdentifier);

    return NextResponse.json({
      response: aiResponse,
      sessionId,
      rateLimit: {
        remaining: rateLimitInfo.remaining,
        limit: rateLimitInfo.limit,
        resetInMinutes: rateLimitInfo.resetInMinutes,
      },
    });
  } catch (error) {
    console.error('Chat API Error:', error);
    return NextResponse.json(
      { 
        error: '응답 생성 중 오류가 발생했습니다.',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// GET: 대화 히스토리 조회
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json(
        { error: 'sessionId가 필요합니다.' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // 세션 확인 - ai_support_sessions 테이블 사용
    const { data: session } = await supabase
      .from('ai_support_sessions')
      .select('id')
      .eq('session_key', sessionId)
      .single();

    if (!session) {
      return NextResponse.json(
        { error: '세션을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 메시지 조회 - ai_support_messages 테이블 사용
    const { data: messages } = await supabase
      .from('ai_support_messages')
      .select('role, content, created_at')
      .eq('session_id', session.id)
      .order('created_at', { ascending: true });

    return NextResponse.json({
      sessionId,
      messages: messages || [],
    });
  } catch (error) {
    console.error('Chat history error:', error);
    return NextResponse.json(
      { error: '대화 히스토리 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
