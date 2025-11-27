'use client';

import { useState, useEffect, use } from 'react';
import MypageLayoutWrapper from '@/components/mypage/MypageLayoutWrapper';
import Link from 'next/link';
import { useAuth } from '@/components/providers/AuthProvider';
import { confirmOrder, requestRevision, cancelOrder } from '@/lib/supabase/mutations/orders';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import ErrorState from '@/components/common/ErrorState';
import { logger } from '@/lib/logger';
import type { Order, Service, User, Seller, Deliverable } from '@/types/common';
import toast from 'react-hot-toast';
import ConfirmModal from '../components/ConfirmModal';
import CancelModal from '../components/CancelModal';
import RevisionModal from '../components/RevisionModal';

import {
  ArrowLeft,
  MessageSquare,
  RotateCcw,
  Check,
  Star,
  User as UserIcon,
  Headphones,
  FileText,
  Download,
  UserCircle,
  ImageIcon,
  Info,
  AlertTriangle,
  Ban,
} from 'lucide-react';

interface PageProps {
  readonly params: Promise<{
    readonly id: string;
  }>;
}

interface OrderDetail extends Order {
  order_number?: string;
  title?: string;
  package_type?: string;
  delivery_date?: string | null;
  delivered_at?: string | null;
  revision_count?: number;
  remaining_revisions?: number;
  requirements?: string;
  buyer_note?: string;
  seller_message?: string;
  service?: Service;
  seller?: Seller;
  buyer?: User;
}

interface StatusHistory {
  status: string;
  date: string;
  actor: string;
}

// Helper functions extracted to reduce complexity
function getStatusLabel(status: string): string {
  switch (status) {
    case 'paid':
      return '결제완료';
    case 'in_progress':
      return '진행중';
    case 'delivered':
      return '도착 확인 대기';
    case 'completed':
      return '완료';
    case 'cancelled':
      return '취소/환불';
    case 'refunded':
      return '환불완료';
    default:
      return status;
  }
}

function createStatusEntry(
  status: string,
  timestamp: string | null | undefined,
  actor: string
): StatusHistory | null {
  if (!timestamp) return null;

  return {
    status,
    date: new Date(timestamp).toLocaleString('ko-KR'),
    actor,
  };
}

function buildStatusHistory(order: OrderDetail): StatusHistory[] {
  const entries = [
    createStatusEntry('주문 접수', order.created_at, '시스템'),
    createStatusEntry('결제 완료', order.paid_at, '구매자'),
    createStatusEntry('작업 시작', order.started_at, '판매자'),
    createStatusEntry('작업 완료', order.delivered_at, '판매자'),
    createStatusEntry('구매 확정', order.completed_at, '구매자'),
  ];

  return entries.filter((entry): entry is StatusHistory => entry !== null);
}

export default function BuyerOrderDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const { user } = useAuth();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showRevisionModal, setShowRevisionModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [revisionDetails, setRevisionDetails] = useState('');
  const [cancelReason, setCancelReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [creatingChat, setCreatingChat] = useState(false);

  useEffect(() => {
    if (user) {
      loadOrder();
    }
  }, [user, id]);

  async function loadOrder() {
    try {
      setLoading(true);
      setError(null);

      // API를 통해 주문 조회
      const response = await fetch(`/api/orders/${id}`);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || '주문을 찾을 수 없습니다');
      }

      const { order } = await response.json();
      setOrder(order);
    } catch (err: unknown) {
      logger.error('주문 조회 실패:', err);
      setError(err instanceof Error ? err.message : '주문 정보를 불러오는데 실패했습니다');
    } finally {
      setLoading(false);
    }
  }

  const handleConfirm = async () => {
    try {
      setSubmitting(true);
      await confirmOrder(id);
      setShowConfirmModal(false);
      await loadOrder(); // Reload to get updated status
      toast.success('구매가 확정되었습니다');
    } catch (err: unknown) {
      logger.error('구매 확정 실패:', err);
      toast.error('구매 확정에 실패했습니다');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRevisionRequest = async () => {
    if (!revisionDetails.trim()) {
      toast.error('수정 요청 사항을 입력해주세요');
      return;
    }

    try {
      setSubmitting(true);
      await requestRevision(id, revisionDetails);
      setShowRevisionModal(false);
      setRevisionDetails('');
      await loadOrder(); // Reload to get updated status
      toast.success('수정 요청이 전송되었습니다');
    } catch (err: unknown) {
      logger.error('수정 요청 실패:', err);
      toast.error('수정 요청에 실패했습니다');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!cancelReason.trim()) {
      toast.error('취소 사유를 입력해주세요');
      return;
    }

    try {
      setSubmitting(true);
      await cancelOrder(id, cancelReason);
      setShowCancelModal(false);
      setCancelReason('');
      await loadOrder(); // Reload to get updated status
      toast.success('주문이 취소되었습니다');
    } catch (err: unknown) {
      logger.error('주문 취소 실패:', err);
      toast.error('주문 취소에 실패했습니다');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateChat = async () => {
    try {
      setCreatingChat(true);
      const response = await fetch('/api/chat/rooms/create-from-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order_id: id }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || '채팅방 생성에 실패했습니다');
      }

      const data = await response.json();
      globalThis.location.href = `/chat/${data.room.id}`;
    } catch (err: unknown) {
      logger.error('채팅방 생성 실패:', err);
      toast.error(err instanceof Error ? err.message : '채팅방 생성 중 오류가 발생했습니다');
    } finally {
      setCreatingChat(false);
    }
  };

  if (loading) {
    return (
      <MypageLayoutWrapper mode="buyer">
        <div className="pt-2 pb-4 px-4 lg:py-8 lg:px-6">
          <LoadingSpinner message="주문 정보를 불러오는 중..." />
        </div>
      </MypageLayoutWrapper>
    );
  }

  if (error || !order) {
    return (
      <MypageLayoutWrapper mode="buyer">
        <div className="pt-2 pb-4 px-4 lg:py-8 lg:px-6">
          <ErrorState message={error || '주문을 찾을 수 없습니다'} retry={loadOrder} />
        </div>
      </MypageLayoutWrapper>
    );
  }

  const statusHistory = buildStatusHistory(order);

  return (
    <MypageLayoutWrapper mode="buyer">
      <div className="pt-2 pb-4 px-4 lg:py-8 lg:px-6">
        {/* 상단 네비게이션 */}
        <div className="mb-4 lg:mb-6">
          <Link
            href="/mypage/buyer/orders"
            className="text-gray-600 hover:text-gray-900 flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4 lg:w-5 lg:h-5" />
            <span className="text-sm lg:text-base">주문 목록으로</span>
          </Link>
        </div>

        {/* 페이지 헤더 */}
        <div className="mb-4 lg:mb-8">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
            <div>
              <h1 className="text-base lg:text-xl font-semibold text-gray-900 mb-1 lg:mb-2">
                주문 상세
              </h1>
              <p className="text-gray-600 text-xs lg:text-sm">
                주문 번호: #{order.order_number || id}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2 lg:gap-3">
              <button
                onClick={handleCreateChat}
                disabled={creatingChat}
                className="px-3 py-1.5 text-xs lg:px-4 lg:py-2 lg:text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium disabled:opacity-50"
              >
                <MessageSquare className="w-3 h-3 lg:w-4 lg:h-4 mr-1.5" />
                {creatingChat ? '로딩 중...' : '메시지'}
              </button>
              {order.status === 'delivered' && (
                <>
                  <button
                    onClick={() => setShowRevisionModal(true)}
                    className="px-3 py-1.5 text-xs lg:px-4 lg:py-2 lg:text-sm bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors font-medium"
                  >
                    <RotateCcw className="w-3 h-3 lg:w-4 lg:h-4 mr-1.5" />
                    수정 요청
                  </button>
                  <button
                    onClick={() => setShowConfirmModal(true)}
                    className="px-4 py-2 text-sm lg:px-6 lg:py-2 lg:text-base bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                  >
                    <Check className="w-4 h-4 lg:w-5 lg:h-5 mr-1.5" />
                    구매 확정
                  </button>
                </>
              )}
              {order.status === 'completed' && (
                <Link
                  href={`/mypage/buyer/reviews?order=${id}`}
                  className="px-4 py-2 text-sm lg:px-6 lg:py-2 lg:text-base bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
                >
                  <Star className="w-4 h-4 lg:w-5 lg:h-5 mr-1.5" />
                  리뷰 작성
                </Link>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-8">
          {/* 왼쪽: 주요 정보 */}
          <div className="lg:col-span-2 space-y-4 lg:space-y-6">
            {/* 주문 정보 */}
            <div className="bg-white rounded-lg border border-gray-200 p-3 lg:p-4">
              <h2 className="text-sm lg:text-base font-semibold text-gray-900 mb-3 lg:mb-4">
                주문 정보
              </h2>

              <div className="space-y-3 lg:space-y-4">
                <div className="flex items-start gap-3 lg:gap-4">
                  <div className="w-20 h-20 lg:w-32 lg:h-32 bg-gray-100 rounded-lg flex-shrink-0 flex items-center justify-center">
                    {order.service?.thumbnail_url ? (
                      <img
                        src={order.service.thumbnail_url}
                        alt={order.title || order.service.title}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <ImageIcon className="w-6 h-6 lg:w-8 lg:h-8 text-gray-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm lg:text-lg font-semibold text-gray-900 mb-2 break-words">
                      {order.title || order.service?.title}
                    </h3>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 lg:gap-3 text-xs lg:text-sm">
                      <div>
                        <span className="text-gray-600">패키지:</span>
                        <span className="ml-2 font-medium">{order.package_type || 'standard'}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">수정 횟수:</span>
                        <span className="ml-2 font-medium">{order.revision_count || 0}회</span>
                      </div>
                      <div>
                        <span className="text-gray-600">남은 수정:</span>
                        <span className="ml-2 font-medium text-blue-600">
                          {order.remaining_revisions || 0}회
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">예상 완료일:</span>
                        <span className="ml-2 font-medium">
                          {order.delivery_date
                            ? new Date(order.delivery_date).toLocaleDateString('ko-KR')
                            : '-'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 내 요구사항 */}
            <div className="bg-white rounded-lg border border-gray-200 p-3 lg:p-4">
              <h2 className="text-sm lg:text-base font-semibold text-gray-900 mb-3 lg:mb-4">
                내 요구사항
              </h2>
              <div className="bg-gray-50 rounded-lg p-3 lg:p-4 mb-3 lg:mb-4">
                <p className="text-gray-700 whitespace-pre-wrap text-xs lg:text-sm">
                  {order.requirements || '요구사항이 없습니다'}
                </p>
              </div>
              {order.buyer_note && (
                <div className="bg-blue-50 rounded-lg p-3 lg:p-4">
                  <div className="flex items-start gap-2">
                    <Info className="w-4 h-4 lg:w-5 lg:h-5 text-blue-600 mt-1" />
                    <div>
                      <div className="font-medium text-blue-900 mb-1 text-xs lg:text-sm">
                        추가 메모
                      </div>
                      <p className="text-blue-700 text-xs lg:text-sm">{order.buyer_note}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 납품 파일 */}
            <div className="bg-white rounded-lg border border-gray-200 p-3 lg:p-4">
              <h2 className="text-sm lg:text-base font-semibold text-gray-900 mb-3 lg:mb-4">
                납품 파일
                {order.deliverables && order.deliverables.length > 0 && (
                  <span className="ml-2 text-xs lg:text-sm font-normal text-gray-600">
                    ({order.deliverables.length}개)
                  </span>
                )}
              </h2>

              {order.seller_message && (
                <div className="bg-green-50 rounded-lg p-3 lg:p-4 mb-3 lg:mb-4">
                  <div className="flex items-start gap-2">
                    <UserCircle className="w-4 h-4 lg:w-5 lg:h-5 text-green-600 mt-1" />
                    <div>
                      <div className="font-medium text-green-900 mb-1 text-xs lg:text-sm">
                        판매자 메시지
                      </div>
                      <p className="text-green-700 text-xs lg:text-sm">{order.seller_message}</p>
                    </div>
                  </div>
                </div>
              )}

              {order.deliverables && order.deliverables.length > 0 ? (
                <div className="space-y-2 lg:space-y-3">
                  {order.deliverables.map((file: Deliverable, _index: number) => (
                    <div
                      key={file.id || `deliverable-${file.file_name}`}
                      className="flex items-center justify-between p-3 lg:p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors gap-2"
                    >
                      <div className="flex items-center gap-2 lg:gap-3 min-w-0 flex-1">
                        <FileText className="w-5 h-5 lg:w-7 lg:h-7 text-blue-500 flex-shrink-0" />
                        <div className="min-w-0">
                          <div className="font-medium text-gray-900 text-xs lg:text-sm truncate">
                            {file.file_name}
                          </div>
                          <div className="text-xs lg:text-sm text-gray-600">
                            {file.file_size ? (file.file_size / 1024 / 1024).toFixed(2) : '0.00'}
                            MB •
                            {file.uploaded_at
                              ? new Date(file.uploaded_at).toLocaleString('ko-KR')
                              : ''}
                          </div>
                        </div>
                      </div>
                      <a
                        href={file.file_url || '#'}
                        download
                        className="px-3 py-1.5 text-xs lg:px-4 lg:py-2 lg:text-sm bg-brand-primary text-white rounded-lg hover:bg-brand-light transition-colors flex-shrink-0"
                      >
                        <Download className="w-3 h-3 lg:w-4 lg:h-4 mr-1 lg:mr-2" />
                        <span className="hidden sm:inline">다운로드</span>
                        <span className="sm:hidden">다운</span>
                      </a>
                    </div>
                  ))}

                  {order.status === 'delivered' && (
                    <button className="w-full px-4 py-2 lg:px-4 lg:py-3 bg-brand-primary text-white rounded-lg hover:bg-brand-light transition-colors font-medium text-xs lg:text-sm">
                      <Download className="w-3 h-3 lg:w-4 lg:h-4 mr-1.5" />
                      전체 다운로드
                    </button>
                  )}
                </div>
              ) : (
                <div className="text-center py-6 lg:py-8 text-gray-500 text-xs lg:text-sm">
                  아직 납품한 파일이 없습니다
                </div>
              )}
            </div>

            {/* 상태 이력 */}
            <div className="bg-white rounded-lg border border-gray-200 p-3 lg:p-4">
              <h2 className="text-sm lg:text-base font-semibold text-gray-900 mb-3 lg:mb-4">
                진행 상태
              </h2>
              <div className="space-y-2 lg:space-y-3">
                {statusHistory.map((history, index) => (
                  <div
                    key={`status-${history.status}-${index}`}
                    className="flex items-start gap-2 lg:gap-3 pb-2 lg:pb-3 border-b border-gray-200 last:border-0"
                  >
                    <div className="w-6 h-6 lg:w-8 lg:h-8 bg-brand-primary rounded-full flex items-center justify-center flex-shrink-0">
                      <Check className="w-3 h-3 lg:w-4 lg:h-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-gray-900 text-xs lg:text-sm">
                        {history.status}
                      </div>
                      <div className="text-xs lg:text-sm text-gray-600">
                        {history.date} • {history.actor}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 오른쪽: 사이드바 */}
          <div className="space-y-4 lg:space-y-6">
            {/* 현재 상태 */}
            <div className="bg-white rounded-lg border border-gray-200 p-3 lg:p-4">
              <h3 className="font-semibold text-gray-900 mb-3 lg:mb-4 text-xs lg:text-base">
                현재 상태
              </h3>
              <div className="flex items-center justify-center py-3 lg:py-4">
                <span
                  className={`px-4 py-2 lg:px-6 lg:py-3 rounded-lg font-semibold text-sm lg:text-lg ${(() => {
                    if (order.status === 'delivered') return 'bg-red-100 text-red-700';
                    if (order.status === 'in_progress') return 'bg-yellow-100 text-yellow-700';
                    if (order.status === 'completed') return 'bg-green-100 text-green-700';
                    return 'bg-gray-100 text-gray-700';
                  })()}`}
                >
                  {getStatusLabel(order.status)}
                </span>
              </div>
              {order.status === 'delivered' && (
                <div className="mt-3 lg:mt-4 p-2 lg:p-3 bg-yellow-50 rounded-lg">
                  <p className="text-xs lg:text-sm text-yellow-800 text-center flex items-center justify-center gap-2">
                    <AlertTriangle className="w-3 h-3 lg:w-4 lg:h-4" />
                    구매 확정을 해주세요
                  </p>
                </div>
              )}
            </div>

            {/* 판매자 정보 */}
            <div className="bg-white rounded-lg border border-gray-200 p-3 lg:p-4">
              <h3 className="font-semibold text-gray-900 mb-3 lg:mb-4 text-xs lg:text-base">
                판매자 정보
              </h3>
              <div className="flex items-center gap-2 lg:gap-3 mb-3 lg:mb-4">
                <div className="w-10 h-10 lg:w-12 lg:h-12 bg-brand-primary rounded-full flex items-center justify-center text-white font-semibold text-sm lg:text-base">
                  {order.seller?.name?.[0] || 'S'}
                </div>
                <div>
                  <div className="font-medium text-gray-900 text-xs lg:text-sm">
                    {order.seller?.name || '판매자'}
                  </div>
                  <div className="text-xs lg:text-sm text-gray-600">판매자</div>
                </div>
              </div>
              <div className="space-y-2">
                <button
                  onClick={handleCreateChat}
                  disabled={creatingChat}
                  className="w-full px-3 py-1.5 lg:px-4 lg:py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-light transition-colors font-medium text-xs lg:text-sm disabled:opacity-50"
                >
                  <MessageSquare className="w-3 h-3 lg:w-4 lg:h-4 mr-1.5" />
                  {creatingChat ? '로딩 중...' : '메시지 보내기'}
                </button>
                <Link
                  href={`/seller/${order.seller_id}`}
                  className="w-full px-3 py-1.5 lg:px-4 lg:py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium text-center block text-xs lg:text-sm"
                >
                  <UserIcon className="w-3 h-3 lg:w-4 lg:h-4 mr-1.5" />
                  프로필 보기
                </Link>
              </div>
            </div>

            {/* 결제 정보 */}
            <div className="bg-white rounded-lg border border-gray-200 p-3 lg:p-4">
              <h3 className="font-semibold text-gray-900 mb-3 lg:mb-4 text-xs lg:text-base">
                결제 정보
              </h3>
              <div className="space-y-2 lg:space-y-3">
                <div className="flex items-center justify-between text-xs lg:text-sm">
                  <span className="text-gray-600">주문 금액</span>
                  <span className="font-medium">
                    {order.total_amount?.toLocaleString() || '0'}원
                  </span>
                </div>
                <div className="flex items-center justify-between pt-2 lg:pt-3 border-t border-gray-200">
                  <span className="font-semibold text-gray-900 text-xs lg:text-sm">결제 금액</span>
                  <span className="font-semibold text-brand-primary text-sm lg:text-lg">
                    {order.total_amount?.toLocaleString() || '0'}원
                  </span>
                </div>
                <div className="pt-2 lg:pt-3 border-t border-gray-200 text-xs lg:text-sm text-gray-600 space-y-1">
                  <div>주문일: {new Date(order.created_at).toLocaleString('ko-KR')}</div>
                  {order.paid_at && (
                    <div>결제일: {new Date(order.paid_at).toLocaleString('ko-KR')}</div>
                  )}
                  {order.delivered_at && (
                    <div>납품일: {new Date(order.delivered_at).toLocaleString('ko-KR')}</div>
                  )}
                </div>
              </div>
            </div>

            {/* 빠른 액션 */}
            <div className="bg-white rounded-lg border border-gray-200 p-3 lg:p-4">
              <h3 className="font-semibold text-gray-900 mb-3 lg:mb-4 text-xs lg:text-base">
                빠른 액션
              </h3>
              <div className="space-y-2">
                <button
                  onClick={() => setShowCancelModal(true)}
                  className="w-full px-3 py-1.5 lg:px-4 lg:py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium text-xs lg:text-sm"
                >
                  <Ban className="w-3 h-3 lg:w-4 lg:h-4 mr-1.5" />
                  취소 요청
                </button>
                <button className="w-full px-3 py-1.5 lg:px-4 lg:py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium text-xs lg:text-sm">
                  <Headphones className="w-3 h-3 lg:w-4 lg:h-4 mr-1.5" />
                  고객센터 문의
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 모달 컴포넌트들 */}
        <ConfirmModal
          isOpen={showConfirmModal}
          submitting={submitting}
          onClose={() => setShowConfirmModal(false)}
          onConfirm={handleConfirm}
        />

        <CancelModal
          isOpen={showCancelModal}
          submitting={submitting}
          cancelReason={cancelReason}
          onClose={() => setShowCancelModal(false)}
          onCancel={handleCancelOrder}
          onReasonChange={setCancelReason}
        />

        <RevisionModal
          isOpen={showRevisionModal}
          submitting={submitting}
          revisionDetails={revisionDetails}
          remainingRevisions={order.remaining_revisions || 0}
          onClose={() => setShowRevisionModal(false)}
          onSubmit={handleRevisionRequest}
          onDetailsChange={setRevisionDetails}
        />
      </div>
    </MypageLayoutWrapper>
  );
}
