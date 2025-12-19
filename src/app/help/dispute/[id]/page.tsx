'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'react-hot-toast';
import {
  Scale,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  MessageSquare,
  FileText,
  ChevronRight,
  User,
  Send,
  ThumbsUp,
  ThumbsDown,
  AlertCircle,
} from 'lucide-react';
import Link from 'next/link';

interface Dispute {
  id: string;
  case_number: string;
  plaintiff_id: string;
  defendant_id: string;
  dispute_type: string;
  dispute_amount: number;
  plaintiff_claim: string;
  defendant_response: string | null;
  plaintiff_role: 'buyer' | 'seller';
  status: string;
  ai_verdict: string | null;
  ai_refund_amount: number | null;
  ai_verdict_reason: string | null;
  ai_verdict_at: string | null;
  plaintiff_accepted: boolean | null;
  defendant_accepted: boolean | null;
  response_deadline: string | null;
  created_at: string;
  plaintiff: { display_name: string; avatar_url: string | null };
  defendant: { display_name: string; avatar_url: string | null };
  service: { id: string; title: string; category: string } | null;
  order: { id: string; total_amount: number } | null;
}

interface Message {
  id: string;
  message_type: string;
  content: string;
  sender_id: string | null;
  created_at: string;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  pending: {
    label: '접수 대기',
    color: 'bg-gray-100 text-gray-700',
    icon: <Clock className="w-4 h-4" />,
  },
  waiting_response: {
    label: '답변 대기',
    color: 'bg-yellow-100 text-yellow-700',
    icon: <Clock className="w-4 h-4" />,
  },
  ai_reviewing: {
    label: 'AI 심사 중',
    color: 'bg-blue-100 text-blue-700',
    icon: <Scale className="w-4 h-4" />,
  },
  ai_verdict: {
    label: 'AI 판결 완료',
    color: 'bg-purple-100 text-purple-700',
    icon: <Scale className="w-4 h-4" />,
  },
  plaintiff_accepted: {
    label: '원고 수용',
    color: 'bg-green-100 text-green-700',
    icon: <CheckCircle className="w-4 h-4" />,
  },
  defendant_accepted: {
    label: '피고 수용',
    color: 'bg-green-100 text-green-700',
    icon: <CheckCircle className="w-4 h-4" />,
  },
  both_accepted: {
    label: '양측 수용',
    color: 'bg-green-100 text-green-700',
    icon: <CheckCircle className="w-4 h-4" />,
  },
  appealed: {
    label: '이의 신청',
    color: 'bg-orange-100 text-orange-700',
    icon: <AlertTriangle className="w-4 h-4" />,
  },
  admin_review: {
    label: '관리자 검토',
    color: 'bg-orange-100 text-orange-700',
    icon: <AlertTriangle className="w-4 h-4" />,
  },
  resolved: {
    label: '해결 완료',
    color: 'bg-green-100 text-green-700',
    icon: <CheckCircle className="w-4 h-4" />,
  },
  cancelled: {
    label: '취소됨',
    color: 'bg-gray-100 text-gray-700',
    icon: <XCircle className="w-4 h-4" />,
  },
};

const DISPUTE_TYPE_LABELS: Record<string, string> = {
  refund: '환불 요청',
  quality: '품질 불만',
  mismatch: '계약/광고 불일치',
  no_response: '무응답',
  extra_charge: '추가 비용 분쟁',
  deadline: '납기 지연',
  incomplete: '불완전 이행',
  damaged: '물품 파손/분실',
  buyer_no_response: '구매자 무응답',
  unfair_review: '부당한 리뷰',
  buyer_cancel: '일방적 취소',
  mod_abuse: '과도한 수정 요청',
  other: '기타',
};

export default function DisputeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const disputeId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [dispute, setDispute] = useState<Dispute | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [user, setUser] = useState<{ id: string } | null>(null);

  // 폼 상태
  const [response, setResponse] = useState('');
  const [appealReason, setAppealReason] = useState('');
  const [showAppealForm, setShowAppealForm] = useState(false);

  const loadDispute = useCallback(async () => {
    const supabase = createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      toast.error('로그인이 필요합니다.');
      router.push('/auth/login');
      return;
    }
    setUser(user);

    // 분쟁 정보 조회
    const { data: disputeData, error: disputeError } = await supabase
      .from('disputes')
      .select(
        `
        *,
        plaintiff:profiles!disputes_plaintiff_id_fkey(display_name, avatar_url),
        defendant:profiles!disputes_defendant_id_fkey(display_name, avatar_url),
        service:services(id, title, category),
        order:orders(id, total_amount)
      `
      )
      .eq('id', disputeId)
      .single();

    if (disputeError || !disputeData) {
      toast.error('분쟁을 찾을 수 없습니다.');
      router.push('/help/dispute');
      return;
    }

    // 권한 확인
    if (disputeData.plaintiff_id !== user.id && disputeData.defendant_id !== user.id) {
      toast.error('접근 권한이 없습니다.');
      router.push('/help/dispute');
      return;
    }

    setDispute(disputeData as unknown as Dispute);

    // 메시지 조회
    const { data: messagesData } = await supabase
      .from('dispute_messages')
      .select('*')
      .eq('dispute_id', disputeId)
      .order('created_at', { ascending: true });

    setMessages(messagesData || []);
    setLoading(false);
  }, [disputeId, router]);

  useEffect(() => {
    loadDispute();
  }, [loadDispute]);

  // 답변 제출
  const handleSubmitResponse = async () => {
    if (!response.trim() || response.length < 20) {
      toast.error('답변을 20자 이상 입력해주세요.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/disputes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          disputeId,
          action: 'submit_response',
          response: response.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      toast.success(data.message);
      setResponse('');
      loadDispute();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '답변 제출에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  // AI 판결 요청
  const handleRequestVerdict = async () => {
    setSubmitting(true);
    try {
      const res = await fetch('/api/disputes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          disputeId,
          action: 'request_verdict',
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      toast.success('AI 판결이 완료되었습니다.');
      loadDispute();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'AI 판결 요청에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  // 판결 수용
  const handleAcceptVerdict = async () => {
    setSubmitting(true);
    try {
      const res = await fetch('/api/disputes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          disputeId,
          action: 'accept_verdict',
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      toast.success(data.message);
      loadDispute();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '수용 처리에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  // 이의 신청
  const handleAppeal = async () => {
    if (!appealReason.trim() || appealReason.length < 20) {
      toast.error('이의 사유를 20자 이상 입력해주세요.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/disputes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          disputeId,
          action: 'appeal',
          appealReason: appealReason.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      toast.success(data.message);
      setAppealReason('');
      setShowAppealForm(false);
      loadDispute();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '이의 신청에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!dispute) return null;

  const isPlaintiff = user?.id === dispute.plaintiff_id;
  const isDefendant = user?.id === dispute.defendant_id;
  const statusConfig = STATUS_CONFIG[dispute.status] || STATUS_CONFIG.pending;
  const myRole = isPlaintiff ? '원고' : '피고';
  const myAccepted = isPlaintiff ? dispute.plaintiff_accepted : dispute.defendant_accepted;

  // 답변 기한 계산
  const responseDeadline = dispute.response_deadline ? new Date(dispute.response_deadline) : null;
  const isDeadlinePassed = responseDeadline ? responseDeadline < new Date() : false;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* 헤더 */}
        <div className="mb-6">
          <Link
            href="/mypage/disputes"
            className="text-blue-600 hover:underline text-sm mb-2 inline-block"
          >
            ← 분쟁 목록으로
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Scale className="w-6 h-6 text-blue-600" />
                분쟁 #{dispute.case_number}
              </h1>
              <p className="text-gray-600 mt-1">{dispute.service?.title || '서비스 정보 없음'}</p>
            </div>
            <div className={`px-4 py-2 rounded-full flex items-center gap-2 ${statusConfig.color}`}>
              {statusConfig.icon}
              <span className="font-medium">{statusConfig.label}</span>
            </div>
          </div>
        </div>

        {/* 분쟁 요약 */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 className="font-semibold text-gray-900 mb-4">분쟁 요약</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-500">분쟁 유형</p>
              <p className="font-medium">
                {DISPUTE_TYPE_LABELS[dispute.dispute_type] || dispute.dispute_type}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">분쟁 금액</p>
              <p className="font-medium text-lg">{dispute.dispute_amount.toLocaleString()}원</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">신청일</p>
              <p className="font-medium">
                {new Date(dispute.created_at).toLocaleDateString('ko-KR')}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">내 역할</p>
              <p className="font-medium">
                {myRole} ({isPlaintiff ? '신청자' : '상대방'})
              </p>
            </div>
          </div>
        </div>

        {/* 당사자 정보 */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 className="font-semibold text-gray-900 mb-4">당사자</h2>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="font-medium">{dispute.plaintiff?.display_name || '익명'}</p>
                <p className="text-sm text-gray-500">
                  원고 ({dispute.plaintiff_role === 'buyer' ? '구매자' : '판매자'})
                </p>
              </div>
            </div>
            <ChevronRight className="w-6 h-6 text-gray-300" />
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-gray-600" />
              </div>
              <div>
                <p className="font-medium">{dispute.defendant?.display_name || '익명'}</p>
                <p className="text-sm text-gray-500">
                  피고 ({dispute.plaintiff_role === 'buyer' ? '판매자' : '구매자'})
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 주장 내용 */}
        <div className="space-y-4 mb-6">
          {/* 원고 주장 */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-2 mb-3">
              <MessageSquare className="w-5 h-5 text-blue-600" />
              <h3 className="font-semibold text-gray-900">원고 주장</h3>
            </div>
            <p className="text-gray-700 whitespace-pre-wrap">{dispute.plaintiff_claim}</p>
          </div>

          {/* 피고 답변 */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-gray-600" />
                <h3 className="font-semibold text-gray-900">피고 답변</h3>
              </div>
              {responseDeadline && dispute.status === 'waiting_response' && (
                <span className={`text-sm ${isDeadlinePassed ? 'text-red-600' : 'text-gray-500'}`}>
                  {isDeadlinePassed
                    ? '기한 만료'
                    : `답변 기한: ${responseDeadline.toLocaleString('ko-KR')}`}
                </span>
              )}
            </div>

            {dispute.defendant_response ? (
              <p className="text-gray-700 whitespace-pre-wrap">{dispute.defendant_response}</p>
            ) : isDefendant && dispute.status === 'waiting_response' ? (
              <div className="space-y-3">
                <textarea
                  value={response}
                  onChange={(e) => setResponse(e.target.value)}
                  placeholder="분쟁에 대한 답변을 작성해주세요. (최소 20자)"
                  rows={5}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
                />
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">{response.length}자</span>
                  <button
                    onClick={handleSubmitResponse}
                    disabled={submitting || response.length < 20}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    {submitting ? '제출 중...' : '답변 제출'}
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-gray-400 italic">아직 답변이 없습니다.</p>
            )}
          </div>
        </div>

        {/* AI 판결 */}
        {dispute.ai_verdict && (
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl shadow-sm p-6 mb-6 border border-blue-200">
            <div className="flex items-center gap-2 mb-4">
              <Scale className="w-6 h-6 text-blue-600" />
              <h3 className="font-bold text-xl text-gray-900">AI 심판관 판결</h3>
            </div>

            {dispute.ai_refund_amount !== null && (
              <div className="bg-white rounded-lg p-4 mb-4">
                <p className="text-sm text-gray-500">판결 결과</p>
                <p className="text-2xl font-bold text-blue-600">
                  {dispute.ai_refund_amount > 0
                    ? `${dispute.ai_refund_amount.toLocaleString()}원 환불`
                    : '환불 없음'}
                </p>
              </div>
            )}

            <div className="bg-white rounded-lg p-4">
              <pre className="whitespace-pre-wrap text-sm text-gray-700 font-mono leading-relaxed overflow-x-auto">
                {dispute.ai_verdict_reason}
              </pre>
            </div>

            {dispute.ai_verdict_at && (
              <p className="text-sm text-gray-500 mt-4">
                판결일: {new Date(dispute.ai_verdict_at).toLocaleString('ko-KR')}
              </p>
            )}
          </div>
        )}

        {/* 액션 버튼 */}
        {dispute.status === 'ai_reviewing' && (
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <div className="text-center">
              <Scale className="w-12 h-12 text-blue-600 mx-auto mb-3 animate-pulse" />
              <p className="text-gray-700 mb-4">AI 심판관이 분쟁을 분석하고 있습니다.</p>
              <button
                onClick={handleRequestVerdict}
                disabled={submitting}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg disabled:opacity-50"
              >
                {submitting ? 'AI 판결 진행 중...' : 'AI 판결 요청'}
              </button>
            </div>
          </div>
        )}

        {dispute.status === 'ai_verdict' && !myAccepted && (
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <h3 className="font-semibold text-gray-900 mb-4">판결에 대한 응답</h3>
            <div className="flex gap-4">
              <button
                onClick={handleAcceptVerdict}
                disabled={submitting}
                className="flex-1 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <ThumbsUp className="w-5 h-5" />
                판결 수용
              </button>
              <button
                onClick={() => setShowAppealForm(true)}
                disabled={submitting}
                className="flex-1 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <ThumbsDown className="w-5 h-5" />
                이의 신청
              </button>
            </div>

            {showAppealForm && (
              <div className="mt-4 p-4 bg-orange-50 rounded-lg">
                <div className="flex items-start gap-2 mb-3">
                  <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-orange-700">
                    이의 신청 시 관리자가 직접 검토합니다. 이의 신청은 1회만 가능합니다.
                  </p>
                </div>
                <textarea
                  value={appealReason}
                  onChange={(e) => setAppealReason(e.target.value)}
                  placeholder="이의 사유를 상세히 작성해주세요. (최소 20자)"
                  rows={4}
                  className="w-full px-4 py-3 border border-orange-300 rounded-lg focus:ring-2 focus:ring-orange-500 resize-none mb-3"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowAppealForm(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    취소
                  </button>
                  <button
                    onClick={handleAppeal}
                    disabled={submitting || appealReason.length < 20}
                    className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50"
                  >
                    이의 신청
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {dispute.status === 'ai_verdict' && myAccepted && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-6">
            <div className="flex items-center gap-2 text-green-700">
              <CheckCircle className="w-5 h-5" />
              <span>판결을 수용했습니다. 상대방의 응답을 기다리고 있습니다.</span>
            </div>
          </div>
        )}

        {dispute.status === 'admin_review' && (
          <div className="bg-orange-50 border border-orange-200 rounded-xl p-6 mb-6">
            <div className="flex items-center gap-2 text-orange-700">
              <AlertTriangle className="w-5 h-5" />
              <span>이의 신청이 접수되어 관리자가 검토 중입니다. 결과는 별도로 안내드립니다.</span>
            </div>
          </div>
        )}

        {dispute.status === 'resolved' && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-6">
            <div className="flex items-center gap-2 text-green-700">
              <CheckCircle className="w-6 h-6" />
              <span className="text-lg font-semibold">분쟁이 해결되었습니다!</span>
            </div>
          </div>
        )}

        {/* 타임라인 */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-gray-600" />
            진행 내역
          </h3>
          <div className="space-y-4">
            {messages.map((msg) => (
              <div key={msg.id} className="flex gap-3">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                    msg.message_type === 'ai_verdict'
                      ? 'bg-purple-100'
                      : msg.message_type === 'claim'
                        ? 'bg-blue-100'
                        : msg.message_type === 'response'
                          ? 'bg-gray-100'
                          : msg.message_type === 'acceptance'
                            ? 'bg-green-100'
                            : 'bg-orange-100'
                  }`}
                >
                  {msg.message_type === 'ai_verdict' ? (
                    <Scale className="w-5 h-5 text-purple-600" />
                  ) : msg.message_type === 'claim' ? (
                    <MessageSquare className="w-5 h-5 text-blue-600" />
                  ) : msg.message_type === 'response' ? (
                    <MessageSquare className="w-5 h-5 text-gray-600" />
                  ) : msg.message_type === 'acceptance' ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-orange-600" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900">
                      {msg.message_type === 'ai_verdict'
                        ? 'AI 심판관'
                        : msg.message_type === 'claim'
                          ? '원고 주장'
                          : msg.message_type === 'response'
                            ? '피고 답변'
                            : msg.message_type === 'acceptance'
                              ? '판결 수용'
                              : msg.message_type === 'appeal'
                                ? '이의 신청'
                                : '시스템'}
                    </span>
                    <span className="text-sm text-gray-400">
                      {new Date(msg.created_at).toLocaleString('ko-KR')}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm mt-1 line-clamp-3">{msg.content}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
