'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'react-hot-toast';
import {
  Scale,
  AlertCircle,
  Upload,
  X,
  ChevronRight,
  FileText,
  MessageSquare,
  Clock,
} from 'lucide-react';
import Link from 'next/link';

interface Order {
  id: string;
  service: {
    id: string;
    title: string;
    seller_id: string;
    seller: {
      display_name: string;
    };
  };
  buyer_id: string;
  total_amount: number;
  status: string;
  created_at: string;
}

const DISPUTE_TYPES = [
  {
    value: 'refund',
    label: '환불 요청',
    description: '서비스가 제공되지 않았거나 취소하고 싶습니다',
  },
  {
    value: 'quality',
    label: '서비스 품질 불만',
    description: '제공된 서비스가 기대에 미치지 못합니다',
  },
  {
    value: 'mismatch',
    label: '계약 내용과 다름',
    description: '서비스 설명과 실제 제공 내용이 다릅니다',
  },
  {
    value: 'no_response',
    label: '무응답/연락두절',
    description: '판매자/구매자가 연락이 되지 않습니다',
  },
  {
    value: 'extra_charge',
    label: '추가 비용 분쟁',
    description: '예상치 못한 추가 비용이 청구되었습니다',
  },
  { value: 'other', label: '기타', description: '위 항목에 해당하지 않는 분쟁' },
];

function getStatusBadge(status: string): { className: string; label: string } {
  if (status === 'completed') {
    return { className: 'bg-green-100 text-green-700', label: '완료' };
  }
  if (status === 'in_progress') {
    return { className: 'bg-blue-100 text-blue-700', label: '진행중' };
  }
  return { className: 'bg-gray-100 text-gray-700', label: status };
}

export default function DisputeApplyPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [user, setUser] = useState<{ id: string } | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // 폼 상태
  const [disputeType, setDisputeType] = useState('');
  const [claim, setClaim] = useState('');
  const [evidenceFiles, setEvidenceFiles] = useState<File[]>([]);

  useEffect(() => {
    loadData();
  }, [orderId]);

  async function loadData() {
    const supabase = createClient();

    // 로그인 확인
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      toast.error('로그인이 필요합니다.');
      router.push('/auth/login?redirect=/help/dispute');
      return;
    }
    setUser(user);

    // 내 주문 목록 조회
    const { data: ordersData, error } = await supabase
      .from('orders')
      .select(
        `
        id,
        total_amount,
        status,
        created_at,
        buyer_id,
        service:services(
          id,
          title,
          seller_id,
          seller:profiles!services_seller_id_fkey(display_name)
        )
      `
      )
      .or(`buyer_id.eq.${user.id},service.seller_id.eq.${user.id}`)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error('Orders load error:', error);
    } else if (ordersData) {
      // 타입 변환
      const formattedOrders = ordersData.map((order) => ({
        ...order,
        service: order.service as unknown as Order['service'],
      })) as Order[];
      setOrders(formattedOrders);

      // URL에 orderId가 있으면 자동 선택
      if (orderId) {
        const found = formattedOrders.find((o) => o.id === orderId);
        if (found) setSelectedOrder(found);
      }
    }

    setLoading(false);
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (evidenceFiles.length + files.length > 5) {
      toast.error('증거 파일은 최대 5개까지 첨부할 수 있습니다.');
      return;
    }
    setEvidenceFiles([...evidenceFiles, ...files]);
  };

  const removeFile = (index: number) => {
    setEvidenceFiles(evidenceFiles.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedOrder) {
      toast.error('주문을 선택해주세요.');
      return;
    }
    if (!disputeType) {
      toast.error('분쟁 유형을 선택해주세요.');
      return;
    }
    if (!claim.trim() || claim.length < 20) {
      toast.error('분쟁 내용을 20자 이상 입력해주세요.');
      return;
    }

    setSubmitting(true);

    try {
      const supabase = createClient();

      // 원고/피고 결정
      const isBuyer = user?.id === selectedOrder.buyer_id;
      const plaintiffId = user?.id;
      const defendantId = isBuyer ? selectedOrder.service.seller_id : selectedOrder.buyer_id;

      // 분쟁 생성
      const { data: dispute, error: disputeError } = await supabase
        .from('disputes')
        .insert({
          plaintiff_id: plaintiffId,
          defendant_id: defendantId,
          order_id: selectedOrder.id,
          service_id: selectedOrder.service.id,
          dispute_type: disputeType,
          plaintiff_role: isBuyer ? 'buyer' : 'seller',
          dispute_amount: selectedOrder.total_amount,
          plaintiff_claim: claim,
          status: 'waiting_response',
          response_deadline: new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString(), // 72시간 후
        })
        .select('id, case_number')
        .single();

      if (disputeError) throw disputeError;

      // 증거 파일 업로드
      for (const file of evidenceFiles) {
        const fileName = `${dispute.id}/${Date.now()}_${file.name}`;
        const { error: uploadError } = await supabase.storage
          .from('disputes')
          .upload(fileName, file);

        if (!uploadError) {
          const {
            data: { publicUrl },
          } = supabase.storage.from('disputes').getPublicUrl(fileName);

          await supabase.from('dispute_evidences').insert({
            dispute_id: dispute.id,
            submitted_by: user?.id,
            evidence_type: file.type.startsWith('image/') ? 'screenshot' : 'file',
            file_url: publicUrl,
            description: file.name,
          });
        }
      }

      // 시스템 메시지 추가
      await supabase.from('dispute_messages').insert({
        dispute_id: dispute.id,
        sender_id: user?.id,
        message_type: 'claim',
        content: claim,
      });

      toast.success(`분쟁이 접수되었습니다. 사건번호: ${dispute.case_number}`);
      router.push(`/help/dispute/${dispute.id}`);
    } catch (error) {
      console.error('Dispute submit error:', error);
      toast.error('분쟁 신청에 실패했습니다. 다시 시도해주세요.');
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

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4">
        {/* 헤더 */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Scale className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">분쟁 조정 신청</h1>
          <p className="text-gray-600 mt-2">AI 심판관이 공정하게 분쟁을 해결해드립니다</p>
        </div>

        {/* 진행 과정 안내 */}
        <div className="bg-white rounded-xl p-6 shadow-sm mb-8">
          <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-600" />
            분쟁 해결 과정
          </h2>
          <div className="flex items-center justify-between">
            <div className="flex flex-col items-center text-center flex-1">
              <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                1
              </div>
              <span className="text-sm mt-2 text-gray-700">신청서 제출</span>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-300" />
            <div className="flex flex-col items-center text-center flex-1">
              <div className="w-10 h-10 bg-gray-200 text-gray-600 rounded-full flex items-center justify-center font-bold">
                2
              </div>
              <span className="text-sm mt-2 text-gray-500">
                상대방 답변
                <br />
                (72시간)
              </span>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-300" />
            <div className="flex flex-col items-center text-center flex-1">
              <div className="w-10 h-10 bg-gray-200 text-gray-600 rounded-full flex items-center justify-center font-bold">
                3
              </div>
              <span className="text-sm mt-2 text-gray-500">AI 심사</span>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-300" />
            <div className="flex flex-col items-center text-center flex-1">
              <div className="w-10 h-10 bg-gray-200 text-gray-600 rounded-full flex items-center justify-center font-bold">
                4
              </div>
              <span className="text-sm mt-2 text-gray-500">판결 통보</span>
            </div>
          </div>
        </div>

        {/* 분쟁 신청 폼 */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 주문 선택 */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              관련 주문 선택
            </h2>

            {orders.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p className="mb-4">진행 중인 주문이 없습니다.</p>
                <div className="flex flex-col sm:flex-row justify-center gap-4">
                  <Link
                    href="/mypage/buyer/orders"
                    className="px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-medium"
                  >
                    구매 내역 확인하기
                  </Link>
                  <Link
                    href="/mypage/seller/orders"
                    className="px-4 py-2 border border-purple-600 text-purple-600 rounded-lg hover:bg-purple-50 transition-colors font-medium"
                  >
                    판매 내역 확인하기
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {orders.slice(0, 5).map((order) => (
                  <label
                    key={order.id}
                    htmlFor={`order-${order.id}`}
                    aria-label={`주문 선택: ${order.service?.title || '서비스'} - ${order.total_amount?.toLocaleString()}원`}
                    className={`block p-4 border rounded-lg cursor-pointer transition ${selectedOrder?.id === order.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                      }`}
                  >
                    <input
                      type="radio"
                      id={`order-${order.id}`}
                      name="order"
                      value={order.id}
                      checked={selectedOrder?.id === order.id}
                      onChange={() => setSelectedOrder(order)}
                      className="sr-only"
                    />
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-gray-900">
                          {order.service?.title || '서비스 정보 없음'}
                        </p>
                        <p className="text-sm text-gray-500">
                          판매자: {order.service?.seller?.display_name || '알 수 없음'}
                        </p>
                        <p className="text-sm text-gray-400">
                          {new Date(order.created_at).toLocaleDateString('ko-KR')}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">
                          {order.total_amount?.toLocaleString()}원
                        </p>
                        <span
                          className={`text-xs px-2 py-1 rounded ${getStatusBadge(order.status).className}`}
                        >
                          {getStatusBadge(order.status).label}
                        </span>
                      </div>
                    </div>
                  </label>
                ))}
                {orders.length > 5 && (
                  <p className="text-sm text-gray-500 text-center">
                    최근 5개 주문만 표시됩니다. 다른 주문은 마이페이지에서 확인하세요.
                  </p>
                )}
              </div>
            )}
          </div>

          {/* 분쟁 유형 */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="font-semibold text-gray-900 mb-4">분쟁 유형</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {DISPUTE_TYPES.map((type) => (
                <label
                  key={type.value}
                  className={`p-4 border rounded-lg cursor-pointer transition ${disputeType === type.value
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                    }`}
                >
                  <input
                    type="radio"
                    name="disputeType"
                    value={type.value}
                    checked={disputeType === type.value}
                    onChange={(e) => setDisputeType(e.target.value)}
                    className="sr-only"
                  />
                  <p className="font-medium text-gray-900">{type.label}</p>
                  <p className="text-sm text-gray-500">{type.description}</p>
                </label>
              ))}
            </div>
          </div>

          {/* 분쟁 내용 */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-blue-600" />
              분쟁 내용
            </h2>
            <textarea
              value={claim}
              onChange={(e) => setClaim(e.target.value)}
              placeholder="분쟁 내용을 상세히 작성해주세요. (최소 20자)&#10;&#10;예시:&#10;- 어떤 문제가 발생했나요?&#10;- 언제 발생했나요?&#10;- 상대방에게 어떤 요청을 했나요?&#10;- 어떤 해결을 원하시나요?"
              rows={8}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              required
            />
            <p className="text-sm text-gray-500 mt-2">{claim.length}자 / 최소 20자</p>
          </div>

          {/* 증거 첨부 */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Upload className="w-5 h-5 text-blue-600" />
              증거 첨부 (선택)
            </h2>
            <p className="text-sm text-gray-500 mb-4">
              스크린샷, 채팅 캡처, 계약서 등 증거 자료를 첨부해주세요. (최대 5개)
            </p>

            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
              <input
                type="file"
                id="evidence"
                accept="image/*,.pdf,.doc,.docx"
                multiple
                onChange={handleFileChange}
                className="hidden"
              />
              <label htmlFor="evidence" className="flex flex-col items-center cursor-pointer">
                <Upload className="w-8 h-8 text-gray-400 mb-2" />
                <span className="text-gray-600">파일을 선택하거나 드래그하세요</span>
                <span className="text-sm text-gray-400">이미지, PDF, 문서 파일</span>
              </label>
            </div>

            {evidenceFiles.length > 0 && (
              <div className="mt-4 space-y-2">
                {evidenceFiles.map((file, index) => (
                  <div
                    key={`evidence-${file.name}-${file.size}`}
                    className="flex items-center justify-between bg-gray-50 px-4 py-2 rounded-lg"
                  >
                    <span className="text-sm text-gray-700 truncate">{file.name}</span>
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 안내사항 */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
            <div className="flex gap-3">
              <AlertCircle className="w-6 h-6 text-amber-600 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-amber-800">중요 안내사항</h3>
                <ul className="mt-2 text-sm text-amber-700 space-y-1">
                  <li>• 분쟁 신청 후 상대방에게 72시간 내 답변 기회가 주어집니다.</li>
                  <li>• AI 심판관이 양측 주장을 검토하여 공정한 판결을 내립니다.</li>
                  <li>• 판결에 동의하지 않으면 이의 신청이 가능합니다.</li>
                  <li>• 허위 신고 시 서비스 이용이 제한될 수 있습니다.</li>
                </ul>
              </div>
            </div>
          </div>

          {/* 제출 버튼 */}
          <button
            type="submit"
            disabled={submitting || !selectedOrder || !disputeType || claim.length < 20}
            className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? '제출 중...' : '분쟁 조정 신청하기'}
          </button>
        </form>
      </div>
    </div>
  );
}
