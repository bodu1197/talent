import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { 
  SERVICE_TYPES, 
  DISPUTE_TYPES, 
  SERVICE_STAGES, 
  analyzeDispute,
  generateVerdictDocument,
  DisputeContext
} from '@/lib/dispute/verdict-engine';

// Gemini 초기화
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

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

    // 액션별 처리
    switch (action) {
      case 'submit_response': {
        // 피고 답변 제출
        if (!isDefendant) {
          return NextResponse.json({ error: '피고만 답변을 제출할 수 있습니다.' }, { status: 403 });
        }

        const { response } = body;
        if (!response || response.length < 20) {
          return NextResponse.json({ error: '답변은 20자 이상이어야 합니다.' }, { status: 400 });
        }

        await supabase
          .from('disputes')
          .update({
            defendant_response: response,
            status: 'ai_reviewing',
          })
          .eq('id', disputeId);

        // 답변 메시지 저장
        await supabase.from('dispute_messages').insert({
          dispute_id: disputeId,
          sender_id: user.id,
          message_type: 'response',
          content: response,
        });

        return NextResponse.json({ success: true, message: '답변이 제출되었습니다. AI 심사가 시작됩니다.' });
      }

      case 'request_verdict': {
        // AI 판결 요청 (답변 기한 만료 또는 양측 답변 완료)
        if (dispute.status !== 'ai_reviewing' && dispute.status !== 'waiting_response') {
          return NextResponse.json({ error: '현재 상태에서는 AI 판결을 요청할 수 없습니다.' }, { status: 400 });
        }

        // 서비스 유형 매핑
        const serviceTypeMap: Record<string, keyof typeof SERVICE_TYPES> = {
          '디자인': 'CREATIVE',
          '개발': 'DEVELOPMENT',
          '레슨': 'LESSON',
          '상담': 'CONSULTATION',
          '번역': 'AGENCY',
          '심부름': 'ERRAND',
          '오프라인': 'OFFLINE',
        };

        // 분쟁 컨텍스트 구성
        const context: DisputeContext = {
          serviceType: serviceTypeMap[dispute.service?.category] || 'CREATIVE',
          disputeType: dispute.dispute_type.toUpperCase() as keyof typeof DISPUTE_TYPES,
          serviceStage: mapOrderStatusToStage(dispute.order?.status),
          plaintiffRole: dispute.plaintiff_role as 'buyer' | 'seller',
          contractDetails: {
            totalAmount: dispute.dispute_amount,
            revisionLimit: dispute.service?.revision_count,
          },
          progress: {
            percentage: calculateProgress(dispute.order?.status),
            revisionsUsed: 0, // TODO: 실제 수정 횟수 계산
          },
          evidence: {
            chatLogs: true, // TODO: 실제 증거 확인
            contract: true,
          },
          claims: {
            plaintiff: dispute.plaintiff_claim,
            defendant: dispute.defendant_response,
          },
        };

        // 기본 분석
        const basicVerdict = analyzeDispute(context);

        // Gemini를 통한 추가 분석
        const aiAnalysis = await analyzeWithGemini(dispute, context, basicVerdict);

        // 최종 판결 결정
        const finalVerdict = aiAnalysis || basicVerdict;

        // 판결문 생성
        const verdictDocument = generateVerdictDocument(
          dispute.case_number,
          { name: dispute.plaintiff?.display_name || '원고', role: dispute.plaintiff_role === 'buyer' ? '구매자' : '판매자' },
          { name: dispute.defendant?.display_name || '피고', role: dispute.plaintiff_role === 'buyer' ? '판매자' : '구매자' },
          context,
          finalVerdict
        );

        // 판결 저장
        await supabase
          .from('disputes')
          .update({
            ai_verdict: finalVerdict.verdict,
            ai_refund_amount: finalVerdict.refundAmount,
            ai_verdict_reason: verdictDocument,
            ai_verdict_at: new Date().toISOString(),
            status: 'ai_verdict',
          })
          .eq('id', disputeId);

        // AI 판결 메시지 저장
        await supabase.from('dispute_messages').insert({
          dispute_id: disputeId,
          sender_id: null, // 시스템
          message_type: 'ai_verdict',
          content: verdictDocument,
          metadata: { verdict: finalVerdict },
        });

        return NextResponse.json({ 
          success: true, 
          verdict: finalVerdict,
          verdictDocument,
        });
      }

      case 'accept_verdict': {
        // 판결 수용
        if (dispute.status !== 'ai_verdict') {
          return NextResponse.json({ error: 'AI 판결 후에만 수용할 수 있습니다.' }, { status: 400 });
        }

        const updateField = isPlaintiff ? 'plaintiff_accepted' : 'defendant_accepted';
        
        await supabase
          .from('disputes')
          .update({ [updateField]: true })
          .eq('id', disputeId);

        // 양측 모두 수용했는지 확인
        const { data: updatedDispute } = await supabase
          .from('disputes')
          .select('plaintiff_accepted, defendant_accepted')
          .eq('id', disputeId)
          .single();

        if (updatedDispute?.plaintiff_accepted && updatedDispute?.defendant_accepted) {
          await supabase
            .from('disputes')
            .update({ status: 'resolved' })
            .eq('id', disputeId);

          // 환불 처리 (실제 구현 필요)
          // await processRefund(dispute);

          return NextResponse.json({ success: true, message: '양측 모두 판결을 수용하여 분쟁이 해결되었습니다.' });
        }

        // 수용 메시지 저장
        await supabase.from('dispute_messages').insert({
          dispute_id: disputeId,
          sender_id: user.id,
          message_type: 'acceptance',
          content: `${isPlaintiff ? '원고' : '피고'}가 판결을 수용했습니다.`,
        });

        return NextResponse.json({ success: true, message: '판결을 수용했습니다. 상대방의 수용을 기다립니다.' });
      }

      case 'appeal': {
        // 이의 신청
        if (dispute.status !== 'ai_verdict') {
          return NextResponse.json({ error: 'AI 판결 후에만 이의 신청할 수 있습니다.' }, { status: 400 });
        }

        const { appealReason } = body;
        if (!appealReason || appealReason.length < 20) {
          return NextResponse.json({ error: '이의 사유를 20자 이상 작성해주세요.' }, { status: 400 });
        }

        await supabase
          .from('disputes')
          .update({ status: 'admin_review' })
          .eq('id', disputeId);

        // 이의 신청 메시지 저장
        await supabase.from('dispute_messages').insert({
          dispute_id: disputeId,
          sender_id: user.id,
          message_type: 'appeal',
          content: appealReason,
        });

        return NextResponse.json({ success: true, message: '이의 신청이 접수되었습니다. 관리자가 검토 후 연락드립니다.' });
      }

      default:
        return NextResponse.json({ error: '알 수 없는 액션입니다.' }, { status: 400 });
    }

  } catch (error) {
    console.error('Dispute action error:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}

// 주문 상태를 서비스 단계로 매핑
function mapOrderStatusToStage(orderStatus?: string): keyof typeof SERVICE_STAGES {
  switch (orderStatus) {
    case 'pending':
    case 'paid':
      return 'BEFORE_START';
    case 'in_progress':
      return 'IN_PROGRESS';
    case 'delivered':
      return 'DELIVERED';
    case 'revision':
      return 'REVISION';
    case 'completed':
      return 'COMPLETED';
    default:
      return 'IN_PROGRESS';
  }
}

// 진행률 계산
function calculateProgress(orderStatus?: string): number {
  switch (orderStatus) {
    case 'pending':
    case 'paid':
      return 0;
    case 'in_progress':
      return 50;
    case 'delivered':
      return 80;
    case 'revision':
      return 70;
    case 'completed':
      return 100;
    default:
      return 50;
  }
}

// Gemini를 통한 추가 분석
async function analyzeWithGemini(
  dispute: Record<string, unknown>,
  context: DisputeContext,
  basicVerdict: { verdict: string; reason: string; recommendations: string[] }
) {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-3-flash-preview' });

    const prompt = `
당신은 돌파구 플랫폼의 AI 분쟁 심판관입니다. 다음 분쟁 사안을 분석하고 판결해주세요.

## 분쟁 정보
- 사건번호: ${dispute.case_number}
- 분쟁 금액: ${dispute.dispute_amount}원
- 분쟁 유형: ${dispute.dispute_type}
- 서비스 유형: ${context.serviceType}
- 진행 상태: ${context.serviceStage}

## 원고 주장 (${context.plaintiffRole === 'buyer' ? '구매자' : '판매자'})
${dispute.plaintiff_claim}

## 피고 답변
${dispute.defendant_response || '(답변 없음)'}

## 기본 분석 결과
- 판결: ${basicVerdict.verdict}
- 이유: ${basicVerdict.reason}

## 법적 기준
1. 용역 시작 전: 전액 환불 가능
2. 가분적 용역 진행 중: 미진행분 환불 가능
3. 불가분적 용역 진행 중: 환불 불가 (협의 필요)
4. 표시/광고와 다른 경우: 3개월 내 취소 가능
5. 구매 확정 후: 당사자 협의 필요

## 요청
위 정보를 바탕으로:
1. 기본 분석 결과가 적절한지 검토
2. 양측 주장의 타당성 평가
3. 최종 판결 권고 (full_refund / partial_refund / no_refund / negotiation)
4. 환불 비율 (0-100%)
5. 판결 이유

JSON 형식으로 응답해주세요:
{
  "verdict": "판결 유형",
  "refundPercentage": 숫자,
  "reason": "판결 이유",
  "plaintiffClaimValid": true/false,
  "defendantClaimValid": true/false,
  "recommendations": ["권고사항1", "권고사항2"]
}
`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    // JSON 파싱 시도
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const aiResult = JSON.parse(jsonMatch[0]);
      return {
        verdict: aiResult.verdict,
        refundAmount: Math.round((dispute.dispute_amount as number) * (aiResult.refundPercentage / 100)),
        refundPercentage: aiResult.refundPercentage,
        reason: aiResult.reason,
        recommendations: aiResult.recommendations || [],
        confidence: 'high' as const,
      };
    }

    return null;
  } catch (error) {
    console.error('Gemini analysis error:', error);
    return null; // 실패 시 기본 분석 결과 사용
  }
}
