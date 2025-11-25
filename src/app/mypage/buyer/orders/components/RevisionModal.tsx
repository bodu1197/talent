'use client';

import { FaTimes, FaInfoCircle, FaCloudUploadAlt, FaRedo } from 'react-icons/fa';

interface RevisionModalProps {
  readonly isOpen: boolean;
  readonly submitting: boolean;
  readonly revisionDetails: string;
  readonly remainingRevisions: number;
  readonly onClose: () => void;
  readonly onSubmit: () => void;
  readonly onDetailsChange: (details: string) => void;
}

export default function RevisionModal({
  isOpen,
  submitting,
  revisionDetails,
  remainingRevisions,
  onClose,
  onSubmit,
  onDetailsChange,
}: RevisionModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">수정 요청</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <FaTimes className="text-2xl" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center gap-2 text-blue-900 mb-2">
              <FaInfoCircle />
              <span className="font-medium">남은 수정 횟수: {remainingRevisions}회</span>
            </div>
            <p className="text-sm text-blue-700">수정 요청 시 판매자에게 알림이 전송됩니다.</p>
          </div>

          <div>
            <label
              htmlFor="revision-details"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              수정 요청 사항 *
            </label>
            <textarea
              id="revision-details"
              rows={6}
              value={revisionDetails}
              onChange={(e) => onDetailsChange(e.target.value)}
              placeholder="수정이 필요한 부분을 구체적으로 작성해주세요"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
            ></textarea>
          </div>

          <div>
            <label
              htmlFor="revision-file-upload"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              참고 파일 첨부 (선택)
            </label>
            <div
              id="revision-file-upload"
              className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-brand-primary transition-colors cursor-pointer"
            >
              <FaCloudUploadAlt className="text-gray-400 text-3xl mb-2" />
              <p className="text-gray-600 text-sm">클릭하여 파일 선택</p>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={onClose}
              disabled={submitting}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium disabled:opacity-50"
            >
              취소
            </button>
            <button
              onClick={onSubmit}
              disabled={submitting}
              className="flex-1 px-6 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors font-medium disabled:opacity-50 flex items-center justify-center"
            >
              {submitting ? (
                '전송 중...'
              ) : (
                <>
                  <FaRedo className="mr-2" />
                  수정 요청하기
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
