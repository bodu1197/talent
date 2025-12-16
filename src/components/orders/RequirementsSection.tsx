import { Info } from 'lucide-react';

interface RequirementsSectionProps {
  readonly requirements: string | null | undefined;
  readonly buyerNote?: string | null;
  readonly title?: string;
}

export default function RequirementsSection({
  requirements,
  buyerNote,
  title = '내 요구사항',
}: RequirementsSectionProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-3 lg:p-4">
      <h2 className="text-sm lg:text-base font-semibold text-gray-900 mb-3 lg:mb-4">{title}</h2>
      <div className="bg-gray-50 rounded-lg p-3 lg:p-4 mb-3 lg:mb-4">
        <p className="text-gray-700 whitespace-pre-wrap text-xs lg:text-sm">
          {requirements || '요구사항이 없습니다'}
        </p>
      </div>
      {buyerNote && (
        <div className="bg-blue-50 rounded-lg p-3 lg:p-4">
          <div className="flex items-start gap-2">
            <Info className="w-4 h-4 lg:w-5 lg:h-5 text-blue-600 mt-1" />
            <div>
              <div className="font-medium text-blue-900 mb-1 text-xs lg:text-sm">추가 메모</div>
              <p className="text-blue-700 text-xs lg:text-sm">{buyerNote}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
