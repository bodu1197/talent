import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import {
  generateChatResponse,
  searchKnowledgeBase,
  generateSessionId,
  type ChatMessage,
} from '@/lib/ai/gemini';
import { aiChatRateLimit, isRedisConfigured } from '@/lib/rate-limit';

interface ChatRequestBody {
  message: string;
  sessionId?: string;
}

// ============================================
// 메모리 기반 Rate Limiter (Redis 미설정 시 fallback)
// 주의: 서버리스 환경에서는 인스턴스마다 메모리가 분리되어 완벽하지 않음
// ============================================
const MEMORY_RATE_LIMIT = 20; // 시간당 요청 수
const MEMORY_WINDOW_MS = 60 * 60 * 1000; // 1시간

// 메모리 저장소: { identifier: { count, resetAt } }
const memoryRateLimitStore: Map<string, { count: number; resetAt: number }> = new Map();

// 오래된 항목 정리 (메모리 누수 방지)
function cleanupOldEntries() {
  const now = Date.now();
  for (const [key, value] of memoryRateLimitStore.entries()) {
    if (value.resetAt < now) {
      memoryRateLimitStore.delete(key);
    }
  }
}

// 메모리 기반 Rate Limit 체크
function checkMemoryRateLimit(identifier: string): {
  success: boolean;
  remaining: number;
  limit: number;
  resetAt: number;
} {
  const now = Date.now();

  // 5분마다 정리 (최대 1000개 초과 시에도)
  if (memoryRateLimitStore.size > 1000) {
    cleanupOldEntries();
  }

  let entry = memoryRateLimitStore.get(identifier);

  // 새 사용자이거나 리셋 시간이 지난 경우
  if (!entry || entry.resetAt < now) {
    entry = { count: 0, resetAt: now + MEMORY_WINDOW_MS };
    memoryRateLimitStore.set(identifier, entry);
  }

  // 카운트 증가
  entry.count++;

  const remaining = Math.max(0, MEMORY_RATE_LIMIT - entry.count);
  const success = entry.count <= MEMORY_RATE_LIMIT;

  return { success, remaining, limit: MEMORY_RATE_LIMIT, resetAt: entry.resetAt };
}

// Rate Limit 상태 조회용 캐시 (요청당 1회만 체크하기 위해)
let lastRateLimitResult: {
  identifier: string;
  remaining: number;
  limit: number;
  resetInMinutes: number;
} | null = null;

// Rate Limit 체크 결과 저장 (실제 limit 체크 후 호출)
function cacheRateLimitResult(identifier: string, remaining: number, limit: number, reset: number) {
  const resetInMinutes = Math.max(0, Math.ceil((reset - Date.now()) / 60000));
  lastRateLimitResult = { identifier, remaining, limit, resetInMinutes };
}

// Rate Limit 상태 조회를 위한 함수 (캐시된 결과 반환)
function getRateLimitInfo(identifier: string) {
  // 캐시된 결과가 있고 같은 사용자면 반환
  if (lastRateLimitResult?.identifier === identifier) {
    return lastRateLimitResult;
  }

  // 캐시 없으면 기본값
  return { remaining: MEMORY_RATE_LIMIT, limit: MEMORY_RATE_LIMIT, resetInMinutes: 60 };
}

// Rate Limit 초과 응답 생성 헬퍼
function createRateLimitExceededResponse(limit: number, reset: number) {
  const resetInMinutes = Math.ceil((reset - Date.now()) / 60000);
  return NextResponse.json(
    {
      error: '질문 횟수를 초과했습니다.',
      message: '시간당 20회까지 질문할 수 있습니다. 잠시 후 다시 시도해주세요.',
      rateLimited: true,
      retryAfterMinutes: resetInMinutes,
      rateLimit: {
        remaining: 0,
        limit,
        resetInMinutes,
      },
    },
    {
      status: 429,
      headers: {
        'X-RateLimit-Limit': limit.toString(),
        'X-RateLimit-Remaining': '0',
        'X-RateLimit-Reset': reset.toString(),
      },
    }
  );
}

// Rate Limit 체크 및 처리 (Redis 또는 메모리 기반)
async function checkRateLimit(identifier: string): Promise<NextResponse | null> {
  if (isRedisConfigured()) {
    const { success, limit, remaining, reset } = await aiChatRateLimit.limit(identifier);
    cacheRateLimitResult(identifier, remaining, limit, reset);
    if (!success) {
      return createRateLimitExceededResponse(limit, reset);
    }
  } else {
    const { success, remaining, limit, resetAt } = checkMemoryRateLimit(identifier);
    cacheRateLimitResult(identifier, remaining, limit, resetAt);
    if (!success) {
      return createRateLimitExceededResponse(limit, resetAt);
    }
  }
  return null;
}

export async function POST(request: NextRequest) {
  try {
    const body: ChatRequestBody = await request.json();
    const { message, sessionId: clientSessionId } = body;

    if (!message || message.trim().length === 0) {
      return NextResponse.json({ error: '메시지를 입력해주세요.' }, { status: 400 });
    }

    // Supabase 클라이언트 생성
    const supabase = await createClient();

    // 현재 사용자 확인 (선택사항 - 비로그인 사용자도 허용)
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Rate Limiting 체크
    // 로그인 사용자: user_id 기반, 비로그인: IP 기반
    const clientIp =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('x-real-ip') ||
      'anonymous';
    const rateLimitIdentifier = user?.id || `ip:${clientIp}`;

    const rateLimitResponse = await checkRateLimit(rateLimitIdentifier);
    if (rateLimitResponse) {
      return rateLimitResponse;
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
    const relevantKnowledge = knowledgeBase ? searchKnowledgeBase(message, knowledgeBase) : null;

    // 사용자 컨텍스트 조회 (개인화 응답용)
    let userContext:
      | {
          displayName?: string;
          isSeller?: boolean;
          isBuyer?: boolean;
          activeOrders?: number;
          pendingDisputes?: number;
          recentCategories?: string[];
        }
      | undefined;

    if (user) {
      // 사용자 프로필 정보
      const { data: profile } = await supabase
        .from('profiles')
        .select('display_name, is_seller')
        .eq('id', user.id)
        .single();

      // 진행 중인 주문 수
      const { count: orderCount } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('buyer_id', user.id)
        .in('status', ['pending', 'paid', 'in_progress', 'delivered', 'revision']);

      // 진행 중인 분쟁 수
      const { count: disputeCount } = await supabase
        .from('disputes')
        .select('*', { count: 'exact', head: true })
        .or(`plaintiff_id.eq.${user.id},defendant_id.eq.${user.id}`)
        .in('status', ['pending', 'waiting_response', 'ai_reviewing', 'ai_verdict']);

      // 최근 방문 카테고리
      const { data: recentCategories } = await supabase
        .from('category_visits')
        .select('category_name')
        .eq('user_id', user.id)
        .order('last_visited_at', { ascending: false })
        .limit(3);

      userContext = {
        displayName: profile?.display_name,
        isSeller: profile?.is_seller,
        isBuyer: true,
        activeOrders: orderCount ?? 0,
        pendingDisputes: disputeCount ?? 0,
        recentCategories: recentCategories?.map((c) => c.category_name),
      };
    }

    // 사용자 메시지 저장 - ai_support_messages 테이블 사용
    await supabase.from('ai_support_messages').insert({
      session_id: dbSessionId,
      role: 'user',
      content: message,
    });

    // AI 응답 생성 (개인화 컨텍스트 포함)
    const aiResponse = await generateChatResponse(message, {
      sessionId,
      userId: user?.id,
      history,
      knowledgeBase: relevantKnowledge || undefined,
      userContext,
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
        details: error instanceof Error ? error.message : 'Unknown error',
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
      return NextResponse.json({ error: 'sessionId가 필요합니다.' }, { status: 400 });
    }

    const supabase = await createClient();

    // 세션 확인 - ai_support_sessions 테이블 사용
    const { data: session } = await supabase
      .from('ai_support_sessions')
      .select('id')
      .eq('session_key', sessionId)
      .single();

    if (!session) {
      return NextResponse.json({ error: '세션을 찾을 수 없습니다.' }, { status: 404 });
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
