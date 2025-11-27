import Image from 'next/image';
import Link from 'next/link';
import { ImageIcon, Clock } from 'lucide-react';

interface OrderCardProps {
  readonly order: {
    readonly id: string;
    readonly orderNumber: string | undefined;
    readonly title: string;
    readonly thumbnailUrl?: string | null;
    readonly buyerName?: string;
    readonly sellerName?: string;
    readonly status: string;
    readonly statusLabel: string;
    readonly statusColor: 'red' | 'yellow' | 'blue' | 'green' | 'gray';
    readonly price: number;
    readonly orderDate: string;
    readonly expectedDeliveryDate?: string;
    readonly daysLeft?: number;
    readonly requirements?: string;
  };
  readonly mode: 'seller' | 'buyer';
  readonly actions?: React.ReactNode;
}

const statusColorClasses = {
  red: 'bg-red-100 text-red-700 border-red-200',
  yellow: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  blue: 'bg-blue-100 text-blue-700 border-blue-200',
  green: 'bg-green-100 text-green-700 border-green-200',
  gray: 'bg-gray-100 text-gray-700 border-gray-200',
};

export default function OrderCard({ order, mode, actions }: OrderCardProps) {
  const userName = mode === 'seller' ? order.buyerName : order.sellerName;
  const userLabel = mode === 'seller' ? '구매자' : '판매자';

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-3 hover:border-brand-primary transition-colors">
      {/* 상단: 썸네일 + 서비스명 + 상태 */}
      <div className="flex gap-3 mb-2">
        <div className="w-12 h-12 bg-gray-100 rounded-lg flex-shrink-0 flex items-center justify-center overflow-hidden relative">
          {order.thumbnailUrl ? (
            <Image
              src={order.thumbnailUrl}
              alt={order.title}
              fill
              className="object-cover"
              sizes="48px"
              loading="lazy"
            />
          ) : (
            <ImageIcon className="w-5 h-5 text-gray-400" aria-hidden="true" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <Link
            href={`/mypage/${mode}/orders/${order.id}`}
            className="text-sm font-medium text-gray-900 hover:text-brand-primary block truncate"
          >
            {order.title}
          </Link>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs text-gray-500">#{order.orderNumber || 'N/A'}</span>
            <span
              className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColorClasses[order.statusColor]}`}
            >
              {order.statusLabel}
            </span>
            {order.daysLeft !== undefined && order.daysLeft > 0 && (
              <span className="text-xs text-gray-500 flex items-center gap-0.5">
                <Clock className="w-3 h-3" aria-hidden="true" />
                D-{order.daysLeft}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 요구사항 (있을 경우) */}
      {order.requirements && (
        <div className="bg-gray-50 rounded p-2 mb-2 text-xs text-gray-700">
          <div className="font-medium mb-0.5">요구사항:</div>
          <div className="line-clamp-2">{order.requirements}</div>
        </div>
      )}

      {/* 하단: 사용자 + 금액 + 버튼 */}
      <div className="flex items-center justify-between pt-2 border-t border-gray-100">
        <div className="flex items-center gap-2 text-xs text-gray-600">
          <span>
            {userLabel}: {userName}
          </span>
          <span className="font-semibold text-gray-900">{order.price.toLocaleString()}원</span>
        </div>
        {actions && <div className="flex items-center gap-1.5 flex-shrink-0">{actions}</div>}
      </div>
    </div>
  );
}
