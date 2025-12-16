'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import MypageLayoutWrapper from '@/components/mypage/MypageLayoutWrapper';
import Link from 'next/link';
import { useAuth } from '@/components/providers/AuthProvider';
import { confirmOrder, requestRevision } from '@/lib/supabase/mutations/orders';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import ErrorState from '@/components/common/ErrorState';
import { logger } from '@/lib/logger';
import type { Order, Service, User, Seller } from '@/types/common';
import toast from 'react-hot-toast';
import { loadOrderData } from '@/lib/api/order-loader';
import ConfirmModal from '../components/ConfirmModal';
import CancelModal from '../components/CancelModal';
import RevisionModal from '../components/RevisionModal';
import OrderInfoSection from '@/components/orders/OrderInfoSection';
import PaymentInfoSidebar from '@/components/orders/PaymentInfoSidebar';
import RequirementsSection from '@/components/orders/RequirementsSection';
import DeliverablesSection from '@/components/orders/DeliverablesSection';
import StatusHistorySection from '@/components/orders/StatusHistorySection';
import { getStatusLabel, getStatusColor, buildStatusHistory } from '@/lib/orders/statusHelpers';

import {
  ArrowLeft,
  MessageSquare,
  RotateCcw,
  Check,
  Star,
  User as UserIcon,
  Headphones,
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

export default function BuyerOrderDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const { user } = useAuth();
  const router = useRouter();
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
    await loadOrderData({
      orderId: id,
      onStart: () => {
        setLoading(true);
        setError(null);
      },
      onSuccess: (order) => setOrder(order as OrderDetail),
      onError: (error) => setError(error),
      onFinally: () => setLoading(false),
    });
  }

  const handleConfirm = async () => {
    try {
      setSubmitting(true);
      await confirmOrder(id);
      setShowConfirmModal(false);
      await loadOrder();
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
      await loadOrder();
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
      const response = await fetch(`/api/orders/${id}/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cancel_reason: cancelReason }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || '주문 취소에 실패했습니다');
      }

      setShowCancelModal(false);
      setCancelReason('');
      await loadOrder();
      toast.success('주문이 취소되었습니다');
    } catch (err: unknown) {
      logger.error('주문 취소 실패:', err);
      toast.error(err instanceof Error ? err.message : '주문 취소에 실패했습니다');
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
                className="px-3 py-1.5 text-xs lg:px-4 lg:py-2 lg:text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium disabled:opacity-50 flex items-center"
              >
                <MessageSquare className="w-3 h-3 lg:w-4 lg:h-4 mr-1.5" />
                {creatingChat ? '로딩 중...' : '메시지'}
              </button>
              {['in_progress', 'delivered', 'revision_requested', 'revision_completed'].includes(
                order.status
              ) && (
                <>
                  {order.status === 'delivered' && (
                    <button
                      onClick={() => setShowRevisionModal(true)}
                      className="px-3 py-1.5 text-xs lg:px-4 lg:py-2 lg:text-sm bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors font-medium flex items-center"
                    >
                      <RotateCcw className="w-3 h-3 lg:w-4 lg:h-4 mr-1.5" />
                      수정 요청
                    </button>
                  )}
                  <button
                    onClick={() => setShowConfirmModal(true)}
                    className="px-4 py-2 text-sm lg:px-6 lg:py-2 lg:text-base bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center"
                  >
                    <Check className="w-4 h-4 lg:w-5 lg:h-5 mr-1.5" />
                    구매 확정
                  </button>
                </>
              )}
              {order.status === 'completed' && (
                <Link
                  href={`/mypage/buyer/reviews?order=${id}`}
                  className="px-4 py-2 text-sm lg:px-6 lg:py-2 lg:text-base bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium flex items-center"
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
            <OrderInfoSection order={order}>
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
                      ? new Date(order.delivery_date).toLocaleDateString('ko-KR', {
                          timeZone: 'Asia/Seoul',
                        })
                      : '-'}
                  </span>
                </div>
              </div>
            </OrderInfoSection>

            {/* 내 요구사항 */}
            <RequirementsSection
              requirements={order.requirements}
              buyerNote={order.buyer_note}
              title="내 요구사항"
            />

            {/* 납품 파일 */}
            <DeliverablesSection
              deliverables={order.deliverables}
              sellerMessage={order.seller_message}
              showDownloadAll={order.status === 'delivered'}
              mode="buyer"
            />

            {/* 상태 이력 */}
            <StatusHistorySection statusHistory={statusHistory} title="진행 상태" />
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
                  className={`px-4 py-2 lg:px-6 lg:py-3 rounded-lg font-semibold text-sm lg:text-lg ${getStatusColor(order.status)}`}
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

            {/* 전문가 정보 */}
            <div className="bg-white rounded-lg border border-gray-200 p-3 lg:p-4">
              <h3 className="font-semibold text-gray-900 mb-3 lg:mb-4 text-xs lg:text-base">
                전문가 정보
              </h3>
              <div className="flex items-center gap-2 lg:gap-3 mb-3 lg:mb-4">
                <div className="w-10 h-10 lg:w-12 lg:h-12 bg-brand-primary rounded-full flex items-center justify-center text-white font-semibold text-sm lg:text-base">
                  {order.seller?.name?.[0] || 'S'}
                </div>
                <div>
                  <div className="font-medium text-gray-900 text-xs lg:text-sm">
                    {order.seller?.name || '전문가'}
                  </div>
                  <div className="text-xs lg:text-sm text-gray-600">전문가</div>
                </div>
              </div>
              <div className="space-y-2">
                <button
                  onClick={handleCreateChat}
                  disabled={creatingChat}
                  className="w-full px-3 py-1.5 lg:px-4 lg:py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-light transition-colors font-medium text-xs lg:text-sm disabled:opacity-50 flex items-center justify-center"
                >
                  <MessageSquare className="w-3 h-3 lg:w-4 lg:h-4 mr-1.5" />
                  {creatingChat ? '로딩 중...' : '메시지 보내기'}
                </button>
                <Link
                  href={`/experts/${order.seller_id}`}
                  className="w-full px-3 py-1.5 lg:px-4 lg:py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium text-xs lg:text-sm flex items-center justify-center"
                >
                  <UserIcon className="w-3 h-3 lg:w-4 lg:h-4 mr-1.5" />
                  프로필 보기
                </Link>
              </div>
            </div>

            {/* 결제 정보 */}
            <PaymentInfoSidebar totalAmount={order.total_amount} finalLabel="결제 금액" />

            {/* 빠른 액션 */}
            <div className="bg-white rounded-lg border border-gray-200 p-3 lg:p-4">
              <h3 className="font-semibold text-gray-900 mb-3 lg:mb-4 text-xs lg:text-base">
                빠른 액션
              </h3>
              <div className="space-y-2">
                <button
                  onClick={() => setShowCancelModal(true)}
                  className="w-full px-3 py-1.5 lg:px-4 lg:py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium text-xs lg:text-sm flex items-center justify-center"
                >
                  <Ban className="w-3 h-3 lg:w-4 lg:h-4 mr-1.5" />
                  취소 요청
                </button>
                <button
                  onClick={() => router.push('/help/contact')}
                  className="w-full px-3 py-1.5 lg:px-4 lg:py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium text-xs lg:text-sm flex items-center justify-center"
                >
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
