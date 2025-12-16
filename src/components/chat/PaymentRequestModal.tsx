'use client';

import { useState } from 'react';
import { X, Info, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { logger } from '@/lib/logger';

interface Service {
  id: string;
  title: string;
  thumbnail_url: string | null;
}

interface PaymentRequestModalProps {
  readonly roomId: string;
  readonly service: Service | null;
  readonly onClose: () => void;
  readonly onSuccess: () => void;
}

export default function PaymentRequestModal({
  roomId,
  service,
  onClose,
  onSuccess,
}: PaymentRequestModalProps) {
  const [formData, setFormData] = useState({
    title: service?.title || '',
    amount: '',
    description: '',
    deliveryDays: '7',
    revisionCount: '2',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.amount || Number.parseInt(formData.amount) < 1000) {
      toast.error('최소 결제 금액은 1,000원입니다');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/payment-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          room_id: roomId,
          service_id: service?.id,
          title: formData.title,
          amount: Number.parseInt(formData.amount),
          description: formData.description,
          delivery_days: Number.parseInt(formData.deliveryDays),
          revision_count: Number.parseInt(formData.revisionCount),
        }),
      });

      if (response.ok) {
        toast.success('결제 요청을 전송했습니다');
        onSuccess();
      } else {
        const error = await response.json();
        toast.error(`결제 요청 실패: ${error.error || '알 수 없는 오류'}`);
      }
    } catch (error) {
      logger.error('Payment request error:', error);
      toast.error('결제 요청 중 오류가 발생했습니다');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">결제 요청</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="payment-title" className="block text-sm font-medium text-gray-700 mb-2">
              제목 *
            </label>
            <input
              id="payment-title"
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
              placeholder="작업 제목"
              required
            />
          </div>

          <div>
            <label
              htmlFor="payment-amount"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              결제 금액 (원) *
            </label>
            <input
              id="payment-amount"
              type="number"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
              placeholder="10000"
              min="1000"
              step="1000"
              required
            />
            <p className="text-xs text-gray-500 mt-1">최소 1,000원</p>
          </div>

          <div>
            <label
              htmlFor="payment-description"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              작업 설명
            </label>
            <textarea
              id="payment-description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
              rows={3}
              placeholder="작업 내용 및 요구사항"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="delivery-days"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                작업 기간 (일)
              </label>
              <input
                id="delivery-days"
                type="number"
                value={formData.deliveryDays}
                onChange={(e) => setFormData({ ...formData, deliveryDays: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                min="1"
                max="365"
              />
            </div>

            <div>
              <label
                htmlFor="revision-count"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                수정 횟수
              </label>
              <input
                id="revision-count"
                type="number"
                value={formData.revisionCount}
                onChange={(e) => setFormData({ ...formData, revisionCount: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                min="0"
                max="10"
              />
            </div>
          </div>

          <div className="bg-blue-50 rounded-lg p-4">
            <p className="text-sm text-blue-900">
              <Info className="w-4 h-4 mr-2 inline" />
              구매자가 결제 요청을 수락하면 결제 페이지로 이동합니다. 결제 요청은 72시간 후 자동으로
              만료됩니다.
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium disabled:opacity-50"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 inline animate-spin" />
                  전송 중...
                </>
              ) : (
                '결제 요청 전송'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
