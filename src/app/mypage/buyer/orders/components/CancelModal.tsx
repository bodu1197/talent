'use client';

import { X, Ban } from 'lucide-react';

interface CancelModalProps {
  readonly isOpen: boolean;
  readonly submitting: boolean;
  readonly cancelReason: string;
  readonly onClose: () => void;
  readonly onCancel: () => void;
  readonly onReasonChange: (reason: string) => void;
}

export default function CancelModal({
  isOpen,
  submitting,
  cancelReason,
  onClose,
  onCancel,
  onReasonChange,
}: CancelModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold text-gray-900">주문 취소 요청</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-7 h-7" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="bg-red-50 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <Ban className="w-5 h-5 text-red-600 mt-1 flex-shrink-0" />
              <div className="text-sm text-red-800">
                <p className="font-medium mb-1">취소 요청 안내</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>취소 요청 시 판매자에게 알림이 전송됩니다</li>
                  <li>판매자 동의 후 취소가 확정됩니다</li>
                  <li>결제가 완료된 경우 환불 절차가 진행됩니다</li>
                </ul>
              </div>
            </div>
          </div>

          <div>
            <label htmlFor="cancel-reason" className="block text-sm font-medium text-gray-700 mb-2">
              취소 사유 *
            </label>
            <textarea
              id="cancel-reason"
              rows={4}
              value={cancelReason}
              onChange={(e) => onReasonChange(e.target.value)}
              placeholder="주문을 취소하려는 사유를 구체적으로 작성해주세요"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
            ></textarea>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={onClose}
              disabled={submitting}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium disabled:opacity-50"
            >
              닫기
            </button>
            <button
              onClick={onCancel}
              disabled={submitting}
              className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50"
            >
              {submitting ? '처리중...' : '취소 요청'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
