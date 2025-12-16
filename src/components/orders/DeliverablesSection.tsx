import { FileText, Download, UserCircle } from 'lucide-react';

interface Deliverable {
  id?: string;
  file_name: string;
  file_url: string;
  file_size: number;
  created_at?: string;
  uploaded_at?: string;
}

interface DeliverablesSectionProps {
  readonly deliverables: Deliverable[] | null | undefined;
  readonly sellerMessage?: string | null;
  readonly showDownloadAll?: boolean;
  readonly mode?: 'buyer' | 'seller';
}

export default function DeliverablesSection({
  deliverables,
  sellerMessage,
  showDownloadAll = false,
  mode = 'buyer',
}: DeliverablesSectionProps) {
  const messageLabel = mode === 'buyer' ? '전문가 메시지' : '전달 메시지';

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-3 lg:p-4">
      <h2 className="text-sm lg:text-base font-semibold text-gray-900 mb-3 lg:mb-4">
        납품 파일
        {deliverables && deliverables.length > 0 && (
          <span className="ml-2 text-xs lg:text-sm font-normal text-gray-600">
            ({deliverables.length}개)
          </span>
        )}
      </h2>

      {sellerMessage && (
        <div className="bg-green-50 rounded-lg p-3 lg:p-4 mb-3 lg:mb-4">
          <div className="flex items-start gap-2">
            <UserCircle className="w-4 h-4 lg:w-5 lg:h-5 text-green-600 mt-1" />
            <div>
              <div className="font-medium text-green-900 mb-1 text-xs lg:text-sm">
                {messageLabel}
              </div>
              <p className="text-green-700 text-xs lg:text-sm">{sellerMessage}</p>
            </div>
          </div>
        </div>
      )}

      {deliverables && deliverables.length > 0 ? (
        <div className="space-y-2 lg:space-y-3">
          {deliverables.map((file) => {
            const timestamp = file.uploaded_at || file.created_at;
            return (
              <div
                key={file.id}
                className="flex items-center justify-between p-3 lg:p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors gap-2"
              >
                <div className="flex items-center gap-2 lg:gap-3 min-w-0 flex-1">
                  <FileText className="w-5 h-5 lg:w-7 lg:h-7 text-blue-500 flex-shrink-0" />
                  <div className="min-w-0">
                    <div className="font-medium text-gray-900 text-xs lg:text-sm truncate">
                      {file.file_name}
                    </div>
                    <div className="text-xs lg:text-sm text-gray-600">
                      {(file.file_size / 1024 / 1024).toFixed(2)}MB •{' '}
                      {timestamp
                        ? new Date(timestamp).toLocaleString('ko-KR', {
                            timeZone: 'Asia/Seoul',
                          })
                        : '날짜 정보 없음'}
                    </div>
                  </div>
                </div>
                <a
                  href={file.file_url || '#'}
                  download
                  className={`px-3 py-1.5 text-xs lg:px-4 lg:py-2 lg:text-sm rounded-lg transition-colors flex-shrink-0 ${
                    mode === 'buyer'
                      ? 'bg-brand-primary text-white hover:bg-brand-light'
                      : 'text-brand-primary hover:bg-blue-50'
                  }`}
                >
                  <Download className="w-3 h-3 lg:w-4 lg:h-4 mr-1 lg:mr-2 inline" />
                  <span className="hidden sm:inline">다운로드</span>
                  <span className="sm:hidden">다운</span>
                </a>
              </div>
            );
          })}

          {showDownloadAll && (
            <button className="w-full px-4 py-2 lg:px-4 lg:py-3 bg-brand-primary text-white rounded-lg hover:bg-brand-light transition-colors font-medium text-xs lg:text-sm">
              <Download className="w-3 h-3 lg:w-4 lg:h-4 mr-1.5 inline" />
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
  );
}
