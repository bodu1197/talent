import { Check } from 'lucide-react';

interface StatusHistory {
  status: string;
  date: string;
  actor: string;
}

interface StatusHistorySectionProps {
  readonly statusHistory: StatusHistory[];
  readonly title?: string;
}

export default function StatusHistorySection({
  statusHistory,
  title = '진행 상태',
}: StatusHistorySectionProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-3 lg:p-4">
      <h2 className="text-sm lg:text-base font-semibold text-gray-900 mb-3 lg:mb-4">{title}</h2>
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
              <div className="font-medium text-gray-900 text-xs lg:text-sm">{history.status}</div>
              <div className="text-xs lg:text-sm text-gray-600">
                {history.date} • {history.actor}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
