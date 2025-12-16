'use client';

import { useState } from 'react';
import { FileText, Clock, RotateCw, Hourglass, Check, Loader2, Info } from 'lucide-react';
import toast from 'react-hot-toast';
import { logger } from '@/lib/logger';

export interface PaymentRequest {
  id: string;
  room_id: string;
  seller_id: string;
  buyer_id: string;
  service_id: string | null;
  amount: number;
  title: string;
  description: string | null;
  delivery_days: number;
  revision_count: number;
  status: 'pending' | 'accepted' | 'rejected' | 'expired' | 'paid';
  buyer_response: string | null;
  responded_at: string | null;
  order_id: string | null;
  paid_at: string | null;
  expires_at: string;
  created_at: string;
  updated_at: string;
}

interface PaymentRequestCardProps {
  readonly paymentRequest: PaymentRequest;
  readonly userId: string;
  readonly isSeller: boolean;
  readonly onUpdate: () => void;
}

export default function PaymentRequestCard({
  paymentRequest,
  isSeller,
  onUpdate,
}: PaymentRequestCardProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const isExpired = new Date(paymentRequest.expires_at) < new Date();
  const isPending = paymentRequest.status === 'pending' && !isExpired;
  const canRespond = !isSeller && isPending;

  const handleResponse = async (action: 'accept' | 'reject', reason?: string) => {
    if (isProcessing) return;

    setIsProcessing(true);
    try {
      const response = await fetch(`/api/payment-requests/${paymentRequest.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          buyer_response: reason,
        }),
      });

      if (response.ok) {
        if (action === 'accept') {
          globalThis.location.href = `/payment/${paymentRequest.id}`;
        } else {
          toast.error('결제 요청을 거부했습니다');
          onUpdate();
        }
      } else {
        const error = await response.json();
        toast.error(`처리 실패: ${error.error || '알 수 없는 오류'}`);
      }
    } catch (error) {
      logger.error('Response error:', error);
      toast.error('처리 중 오류가 발생했습니다');
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusBadge = () => {
    if (isExpired && paymentRequest.status === 'pending') {
      return (
        <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
          만료됨
        </span>
      );
    }

    switch (paymentRequest.status) {
      case 'pending':
        return (
          <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">
            대기 중
          </span>
        );
      case 'accepted':
        return (
          <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
            수락됨
          </span>
        );
      case 'rejected':
        return (
          <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
            거부됨
          </span>
        );
      case 'paid':
        return (
          <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
            결제완료
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex justify-center mb-4">
      <div className="bg-green-50 border-2 border-green-200 rounded-xl p-5 max-w-md w-full shadow-sm">
        {/* 헤더 */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">결제 요청</h3>
              <p className="text-xs text-gray-500">
                {new Date(paymentRequest.created_at).toLocaleDateString('ko-KR', {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
          </div>
          {getStatusBadge()}
        </div>

        {/* 내용 */}
        <div className="bg-white rounded-lg p-4 mb-4">
          <h4 className="font-semibold text-lg text-gray-900 mb-2">{paymentRequest.title}</h4>

          {paymentRequest.description && (
            <p className="text-sm text-gray-600 mb-3 whitespace-pre-wrap">
              {paymentRequest.description}
            </p>
          )}

          <div className="flex items-baseline gap-2 mb-3">
            <span className="text-2xl font-semibold text-green-600">
              {paymentRequest.amount.toLocaleString()}원
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="flex items-center gap-2 text-gray-600">
              <Clock className="w-4 h-4 text-gray-400" />
              <span>작업 기간: {paymentRequest.delivery_days}일</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <RotateCw className="w-4 h-4 text-gray-400" />
              <span>수정: {paymentRequest.revision_count}회</span>
            </div>
          </div>

          {isPending && (
            <div className="mt-3 pt-3 border-t border-gray-200">
              <p className="text-xs text-gray-500">
                <Hourglass className="w-3 h-3 mr-1 inline" />
                {new Date(paymentRequest.expires_at).toLocaleDateString('ko-KR', {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
                까지 유효
              </p>
            </div>
          )}
        </div>

        {/* 액션 버튼 (구매자만) */}
        {canRespond && (
          <div className="flex gap-2">
            <button
              onClick={() => {
                const reason = prompt('거부 사유를 입력해주세요 (선택사항):');
                if (reason !== null) {
                  handleResponse('reject', reason || undefined);
                }
              }}
              disabled={isProcessing}
              className="flex-1 px-4 py-2.5 bg-white border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium disabled:opacity-50"
            >
              거부
            </button>
            <button
              onClick={() => handleResponse('accept')}
              disabled={isProcessing}
              className="flex-1 px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 inline animate-spin" />
                  처리 중...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 mr-2 inline" />
                  수락 및 결제
                </>
              )}
            </button>
          </div>
        )}

        {/* 전문가 안내 */}
        {isSeller && isPending && (
          <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
            <p className="text-xs text-blue-700">
              <Info className="w-3 h-3 mr-1 inline" />
              구매자의 응답을 기다리고 있습니다
            </p>
          </div>
        )}

        {/* 거부 사유 표시 */}
        {paymentRequest.status === 'rejected' && paymentRequest.buyer_response && (
          <div className="bg-red-50 rounded-lg p-3 border border-red-200">
            <p className="text-xs font-medium text-red-900 mb-1">거부 사유:</p>
            <p className="text-xs text-red-700">{paymentRequest.buyer_response}</p>
          </div>
        )}
      </div>
    </div>
  );
}
