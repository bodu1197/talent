import { ImageIcon } from 'lucide-react';

interface OrderInfoSectionProps {
  readonly order: {
    readonly title?: string | null;
    readonly service?: {
      readonly thumbnail_url?: string | null;
      readonly title?: string;
    } | null;
  };
  readonly children: React.ReactNode;
}

export default function OrderInfoSection({ order, children }: OrderInfoSectionProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-3 lg:p-4">
      <h2 className="text-sm lg:text-base font-semibold text-gray-900 mb-3 lg:mb-4">주문 정보</h2>

      <div className="space-y-3 lg:space-y-4">
        <div className="flex items-start gap-3 lg:gap-4">
          <div className="w-20 h-20 lg:w-32 lg:h-32 bg-gray-100 rounded-lg flex-shrink-0 flex items-center justify-center">
            {order.service?.thumbnail_url ? (
              <img
                src={order.service.thumbnail_url}
                alt={order.title || order.service.title || '주문 이미지'}
                className="w-full h-full object-cover rounded-lg"
              />
            ) : (
              <ImageIcon className="w-6 h-6 lg:w-8 lg:h-8 text-gray-400" />
            )}
          </div>
          <div className="flex-1 min-w-0">{children}</div>
        </div>
      </div>
    </div>
  );
}
