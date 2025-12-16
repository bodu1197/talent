import Image from 'next/image';
import { Check, ImageIcon } from 'lucide-react';

interface Service {
  thumbnail_url: string | null;
}

interface Order {
  title: string;
  description: string | null;
  delivery_days: number;
  revision_count: number;
  amount: number;
}

interface DirectOrderProductInfoProps {
  readonly order: Order;
  readonly service: Service | null;
  readonly sellerName: string;
}

export default function DirectOrderProductInfo({
  order,
  service,
  sellerName,
}: DirectOrderProductInfoProps) {
  return (
    <section className="bg-white rounded-lg border border-gray-200 p-6">
      <h2 className="text-lg font-bold text-gray-900 mb-4">주문 내역</h2>

      {/* 상품 정보 */}
      <div className="flex gap-4 pb-4 border-b border-gray-100">
        <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 relative">
          {service?.thumbnail_url ? (
            <Image
              src={service.thumbnail_url}
              alt={order.title}
              fill
              className="object-cover"
              sizes="80px"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <ImageIcon className="w-8 h-8 text-gray-400" />
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-gray-900 mb-1 line-clamp-2">{order.title}</h3>
          <p className="text-sm text-gray-500">{sellerName}</p>
        </div>
      </div>

      {/* 기본항목 테이블 */}
      <div className="mt-4">
        <div className="grid grid-cols-4 text-sm text-gray-500 pb-2 border-b border-gray-100">
          <span>기본항목</span>
          <span className="text-center">수량</span>
          <span className="text-center">작업일</span>
          <span className="text-right">가격</span>
        </div>
        <div className="grid grid-cols-4 text-sm py-3 items-center">
          <span className="text-gray-900 font-medium">{order.title}</span>
          <span className="text-center text-gray-700">1</span>
          <span className="text-center text-gray-700">{order.delivery_days}일</span>
          <span className="text-right font-semibold text-gray-900">
            {order.amount.toLocaleString()}원
          </span>
        </div>
      </div>

      {/* 포함 사항 */}
      <div className="mt-4 space-y-2">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Check className="w-4 h-4 text-green-500" />
          <span>작업기간: {order.delivery_days}일</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Check className="w-4 h-4 text-green-500" />
          <span>수정: {order.revision_count === 999 ? '무제한' : `${order.revision_count}회`}</span>
        </div>
      </div>
    </section>
  );
}
