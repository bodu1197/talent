'use client';

import { FaTimes, FaExclamationTriangle } from 'react-icons/fa';

interface ConfirmModalProps {
  readonly isOpen: boolean;
  readonly submitting: boolean;
  readonly onClose: () => void;
  readonly onConfirm: () => void;
}

export default function ConfirmModal({
  isOpen,
  submitting,
  onClose,
  onConfirm,
}: ConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">구매 확정</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <FaTimes className="text-2xl" />
          </button>
        </div>

        <div className="mb-6">
          <div className="bg-yellow-50 rounded-lg p-4 mb-4">
            <div className="flex items-start gap-2">
              <FaExclamationTriangle className="text-yellow-600 mt-1" />
              <div className="text-sm text-yellow-800">
                <p className="font-medium mb-1">구매 확정 전 확인사항</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>납품된 파일을 모두 확인하셨나요?</li>
                  <li>요구사항이 충족되었나요?</li>
                  <li>수정이 필요한 부분은 없나요?</li>
                </ul>
              </div>
            </div>
          </div>
          <p className="text-gray-700">
            구매 확정 시 판매자에게 대금이 정산되며, 이후에는 수정 요청이 불가능합니다.
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={submitting}
            className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium disabled:opacity-50"
          >
            취소
          </button>
          <button
            onClick={onConfirm}
            disabled={submitting}
            className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50"
          >
            {submitting ? '처리 중...' : '확정하기'}
          </button>
        </div>
      </div>
    </div>
  );
}
