import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import {
  generateChatResponse,
  searchKnowledgeBase,
  generateSessionId,
  type ChatMessage,
} from '@/lib/ai/gemini';

interface ChatRequestBody {
  message: string;
  sessionId?: string;
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

    return NextResponse.json({
      response: aiResponse,
      sessionId,
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
