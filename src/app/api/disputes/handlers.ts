/**
 * 분쟁 처리 핸들러 모듈
 * POST 함수의 Cognitive Complexity 감소를 위해 분리
 */

import { NextResponse } from 'next/server';
import { SupabaseClient } from '@supabase/supabase-js';
import { 
  SERVICE_TYPES, 
  DISPUTE_TYPES, 
  analyzeDispute,
  generateVerdictDocument,
  DisputeContext
} from '@/lib/dispute/verdict-engine';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Gemini 초기화
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

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

interface VerdictBasic {
  verdict: string;
  reason: string;
  recommendations: string[];
}

// 주문 상태를 서비스 단계로 매핑
function mapOrderStatusToStage(orderStatus?: string): keyof typeof import('@/lib/dispute/verdict-engine').SERVICE_STAGES {
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
  const progressMap: Record<string, number> = {
    'pending': 0,
    'paid': 0,
    'in_progress': 50,
    'delivered': 80,
    'revision': 70,
    'completed': 100,
  };
  return progressMap[orderStatus ?? ''] ?? 50;
}

// 실제 수정 횟수 계산
async function getActualRevisionCount(
  supabase: SupabaseClient,
  orderId?: string
): Promise<number> {
  if (!orderId) return 0;
  
  try {
    // 주문 관련 메시지에서 수정 요청 횟수 계산
    const { count } = await supabase
      .from('chat_messages')
      .select('*', { count: 'exact', head: true })
      .eq('order_id', orderId)
      .ilike('content', '%수정%');
    
    return count ?? 0;
  } catch {
    return 0;
  }
}

// 증거 존재 여부 확인
async function checkEvidenceExists(
  supabase: SupabaseClient,
  disputeId: string
): Promise<{ chatLogs: boolean; contract: boolean; deliverables: boolean }> {
  try {
    // 분쟁 관련 메시지 확인
    const { count: messageCount } = await supabase
      .from('dispute_messages')
      .select('*', { count: 'exact', head: true })
      .eq('dispute_id', disputeId);
    
    // 증거 첨부 확인
    const { count: evidenceCount } = await supabase
      .from('dispute_evidence')
      .select('*', { count: 'exact', head: true })
      .eq('dispute_id', disputeId);
    
    return {
      chatLogs: (messageCount ?? 0) > 0,
      contract: true, // 주문이 있으면 계약 존재
      deliverables: (evidenceCount ?? 0) > 0,
    };
  } catch {
    return { chatLogs: false, contract: true, deliverables: false };
  }
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
  'design': 'CREATIVE',
  'development': 'DEVELOPMENT',
  'lesson': 'LESSON',
  'consultation': 'CONSULTATION',
  'translation': 'AGENCY',
  'errand': 'ERRAND',
  'offline': 'OFFLINE',
};

// Gemini를 통한 추가 분석
async function analyzeWithGemini(
  dispute: Dispute,
  context: DisputeContext,
  basicVerdict: VerdictBasic
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

## 추가 고려사항
- 양측의 주장이 모순되는 경우, 증거와 합리성을 기준으로 판단
- 판매자 무응답 시 구매자에게 유리하게 판단
- 복합적인 분쟁(예: 품질 불만 + 납기 지연)인 경우 각각 평가 후 종합

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
    
    // 안전한 JSON 파싱 (ReDoS 취약점 방지)
    const firstBrace = responseText.indexOf('{');
    const lastBrace = responseText.lastIndexOf('}');
    
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      try {
        const jsonString = responseText.substring(firstBrace, lastBrace + 1);
        const aiResult = JSON.parse(jsonString);
        return {
          verdict: aiResult.verdict,
          refundAmount: Math.round(dispute.dispute_amount * (aiResult.refundPercentage / 100)),
          refundPercentage: aiResult.refundPercentage,
          reason: aiResult.reason,
          recommendations: aiResult.recommendations || [],
          confidence: 'high' as const,
        };
      } catch {
        console.warn('Failed to parse AI response as JSON');
      }
    }

    return null;
  } catch (error) {
    console.error('Gemini analysis error:', error);
    return null;
  }
}

// 피고 답변 제출 핸들러
export async function handleSubmitResponse(
  supabase: SupabaseClient,
  disputeId: string,
  userId: string,
  response: string
) {
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

  await supabase.from('dispute_messages').insert({
    dispute_id: disputeId,
    sender_id: userId,
    message_type: 'response',
    content: response,
  });

  return NextResponse.json({ success: true, message: '답변이 제출되었습니다. AI 심사가 시작됩니다.' });
}

// AI 판결 요청 핸들러
export async function handleRequestVerdict(
  supabase: SupabaseClient,
  dispute: Dispute
) {
  // 실제 수정 횟수 계산
  const revisionsUsed = await getActualRevisionCount(supabase, dispute.order?.id);
  
  // 증거 존재 여부 확인
  const evidence = await checkEvidenceExists(supabase, dispute.id);

  // 분쟁 컨텍스트 구성
  const context: DisputeContext = {
    serviceType: serviceTypeMap[dispute.service?.category ?? ''] || 'CREATIVE',
    disputeType: dispute.dispute_type.toUpperCase() as keyof typeof DISPUTE_TYPES,
    serviceStage: mapOrderStatusToStage(dispute.order?.status),
    plaintiffRole: dispute.plaintiff_role,
    contractDetails: {
      totalAmount: dispute.dispute_amount,
      revisionLimit: dispute.service?.revision_count,
    },
    progress: {
      percentage: calculateProgress(dispute.order?.status),
      revisionsUsed,
    },
    evidence: {
      chatLogs: evidence.chatLogs,
      contract: evidence.contract,
      deliverables: evidence.deliverables,
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
    .eq('id', dispute.id);

  // AI 판결 메시지 저장
  await supabase.from('dispute_messages').insert({
    dispute_id: dispute.id,
    sender_id: null,
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

// 판결 수용 핸들러
export async function handleAcceptVerdict(
  supabase: SupabaseClient,
  disputeId: string,
  userId: string,
  isPlaintiff: boolean
) {
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

    return NextResponse.json({ success: true, message: '양측 모두 판결을 수용하여 분쟁이 해결되었습니다.' });
  }

  // 수용 메시지 저장
  await supabase.from('dispute_messages').insert({
    dispute_id: disputeId,
    sender_id: userId,
    message_type: 'acceptance',
    content: `${isPlaintiff ? '원고' : '피고'}가 판결을 수용했습니다.`,
  });

  return NextResponse.json({ success: true, message: '판결을 수용했습니다. 상대방의 수용을 기다립니다.' });
}

// 이의 신청 핸들러
export async function handleAppeal(
  supabase: SupabaseClient,
  disputeId: string,
  userId: string,
  appealReason: string
) {
  if (!appealReason || appealReason.length < 20) {
    return NextResponse.json({ error: '이의 사유를 20자 이상 작성해주세요.' }, { status: 400 });
  }

  await supabase
    .from('disputes')
    .update({ status: 'admin_review' })
    .eq('id', disputeId);

  await supabase.from('dispute_messages').insert({
    dispute_id: disputeId,
    sender_id: userId,
    message_type: 'appeal',
    content: appealReason,
  });

  return NextResponse.json({ success: true, message: '이의 신청이 접수되었습니다. 관리자가 검토 후 연락드립니다.' });
}
