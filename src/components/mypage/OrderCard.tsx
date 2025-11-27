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
    <div className="bg-white border border-gray-200 rounded-lg p-6 hover:border-brand-primary transition-colors">
      <div className="flex gap-4">
        {/* 썸네일 */}
        <div className="w-24 h-24 bg-gray-100 rounded-lg flex-shrink-0 flex items-center justify-center overflow-hidden relative">
          {order.thumbnailUrl ? (
            <Image
              src={order.thumbnailUrl}
              alt={order.title}
              fill
              className="object-cover"
              sizes="96px"
              loading="lazy"
            />
          ) : (
            <ImageIcon className="w-8 h-8 text-gray-400" aria-hidden="true" />
          )}
        </div>

        {/* 주문 정보 */}
        <div className="flex-1">
          {/* 주문번호 + 제목 */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm text-gray-500">#{order.orderNumber || 'N/A'}</span>
                <Link
                  href={`/mypage/${mode}/orders/${order.id}`}
                  className="text-base font-bold text-gray-900 hover:text-brand-primary"
                >
                  {order.title}
                </Link>
              </div>

              {/* 사용자 정보 */}
              <div className="flex items-center gap-3 text-sm text-gray-600 mb-2">
                <span>
                  {userLabel}: {userName}
                </span>
                <span>•</span>
                <span>{order.orderDate}</span>
              </div>

              {/* 상태 + 가격 + 납기일 */}
              <div className="flex items-center gap-3 flex-wrap">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium border ${statusColorClasses[order.statusColor]}`}
                >
                  {order.statusLabel}
                </span>
                {order.daysLeft !== undefined && order.daysLeft > 0 && (
                  <span className="text-sm text-gray-600 flex items-center gap-1">
                    <Clock className="w-3 h-3" aria-hidden="true" />
                    D-{order.daysLeft}일
                  </span>
                )}
                {order.expectedDeliveryDate && (
                  <span className="text-sm text-gray-600">
                    예상완료: {order.expectedDeliveryDate}
                  </span>
                )}
                <span className="text-sm font-bold text-gray-900">
                  {order.price.toLocaleString()}원
                </span>
              </div>
            </div>
          </div>

          {/* 요구사항 (있을 경우) */}
          {order.requirements && (
            <div className="bg-gray-50 rounded p-3 mb-3 text-sm text-gray-700">
              <div className="font-medium mb-1">요구사항:</div>
              <div className="line-clamp-2">{order.requirements}</div>
            </div>
          )}

          {/* 액션 버튼들 */}
          {actions && <div className="flex items-center gap-2 mt-3">{actions}</div>}
        </div>
      </div>
    </div>
  );
}
