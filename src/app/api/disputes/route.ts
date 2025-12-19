import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import {
  handleSubmitResponse,
  handleRequestVerdict,
  handleAcceptVerdict,
  handleAppeal,
} from './handlers';

// 분쟁 타입 정의
interface Dispute {
  id: string;
  case_number: string;
  plaintiff_id: string;
  defendant_id: string;
  dispute_amount: number;
  dispute_type: string;
  plaintiff_claim: string;
  defendant_response?: string;
  plaintiff_role: 'buyer' | 'seller';
  status: string;
  plaintiff?: { display_name: string };
  defendant?: { display_name: string };
  order?: { id: string; total_amount: number; status: string; created_at: string };
  service?: { id: string; title: string; category: string; revision_count?: number };
}

// 분쟁 목록 조회
export async function GET(_request: NextRequest) {
  try {
    const supabase = await createClient();
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
    }

    // 내가 관련된 분쟁 조회
    const { data: disputes, error } = await supabase
      .from('disputes')
      .select(`
        *,
        plaintiff:profiles!disputes_plaintiff_id_fkey(display_name, avatar_url),
        defendant:profiles!disputes_defendant_id_fkey(display_name, avatar_url),
        order:orders(id, total_amount, status),
        service:services(id, title, category)
      `)
      .or(`plaintiff_id.eq.${user.id},defendant_id.eq.${user.id}`)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Disputes fetch error:', error);
      return NextResponse.json({ error: '분쟁 목록을 불러오는데 실패했습니다.' }, { status: 500 });
    }

    return NextResponse.json({ disputes });

  } catch (error) {
    console.error('Disputes API error:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}

// AI 판결 요청
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
    }

    const body = await request.json();
    const { disputeId, action } = body;

    if (!disputeId) {
      return NextResponse.json({ error: '분쟁 ID가 필요합니다.' }, { status: 400 });
    }

    // 분쟁 정보 조회
    const { data: dispute, error: disputeError } = await supabase
      .from('disputes')
      .select(`
        *,
        plaintiff:profiles!disputes_plaintiff_id_fkey(display_name),
        defendant:profiles!disputes_defendant_id_fkey(display_name),
        order:orders(id, total_amount, status, created_at),
        service:services(id, title, category, revision_count)
      `)
      .eq('id', disputeId)
      .single();

    if (disputeError || !dispute) {
      return NextResponse.json({ error: '분쟁을 찾을 수 없습니다.' }, { status: 404 });
    }

    // 권한 확인 (당사자인지)
    const isPlaintiff = user.id === dispute.plaintiff_id;
    const isDefendant = user.id === dispute.defendant_id;
    
    if (!isPlaintiff && !isDefendant) {
      return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 });
    }

    // 타입 변환
    const typedDispute = dispute as unknown as Dispute;

    // 액션별 처리 (각 핸들러로 분리)
    switch (action) {
      case 'submit_response':
        if (!isDefendant) {
          return NextResponse.json({ error: '피고만 답변을 제출할 수 있습니다.' }, { status: 403 });
        }
        return handleSubmitResponse(supabase, disputeId, user.id, body.response);

      case 'request_verdict':
        if (dispute.status !== 'ai_reviewing' && dispute.status !== 'waiting_response') {
          return NextResponse.json({ error: '현재 상태에서는 AI 판결을 요청할 수 없습니다.' }, { status: 400 });
        }
        return handleRequestVerdict(supabase, typedDispute);

      case 'accept_verdict':
        if (dispute.status !== 'ai_verdict') {
          return NextResponse.json({ error: 'AI 판결 후에만 수용할 수 있습니다.' }, { status: 400 });
        }
        return handleAcceptVerdict(supabase, disputeId, user.id, isPlaintiff);

      case 'appeal':
        if (dispute.status !== 'ai_verdict') {
          return NextResponse.json({ error: 'AI 판결 후에만 이의 신청할 수 있습니다.' }, { status: 400 });
        }
        return handleAppeal(supabase, disputeId, user.id, body.appealReason);

      default:
        return NextResponse.json({ error: '알 수 없는 액션입니다.' }, { status: 400 });
    }

  } catch (error) {
    console.error('Dispute action error:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}
