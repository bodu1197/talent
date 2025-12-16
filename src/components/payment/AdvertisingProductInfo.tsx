import Image from 'next/image';
import { Megaphone, ImageIcon } from 'lucide-react';

interface Service {
  title: string;
  thumbnail_url: string | null;
}

interface Payment {
  services: Service | null;
  months: number;
  monthly_price: number;
  supply_amount: number;
  vat_amount: number;
}

interface AdvertisingProductInfoProps {
  readonly payment: Payment;
}

export default function AdvertisingProductInfo({ payment }: AdvertisingProductInfoProps) {
  return (
    <section className="bg-white rounded-lg border border-gray-200 p-6">
      <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
        <Megaphone className="w-5 h-5 text-brand-primary" />
        광고 상품
      </h2>

      <div className="flex gap-4 pb-4 border-b border-gray-100">
        <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 relative">
          {payment.services?.thumbnail_url ? (
            <Image
              src={payment.services.thumbnail_url}
              alt={payment.services.title}
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
          <h3 className="font-medium text-gray-900 mb-1 line-clamp-2">
            {payment.services?.title || '서비스'}
          </h3>
          <p className="text-sm text-brand-primary font-semibold">{payment.months}개월 광고</p>
        </div>
      </div>

      {/* 금액 상세 */}
      <div className="mt-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">월 광고비</span>
          <span className="text-gray-900">{payment.monthly_price.toLocaleString()}원</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">광고 기간</span>
          <span className="text-gray-900">{payment.months}개월</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">공급가액</span>
          <span className="text-gray-900">{payment.supply_amount.toLocaleString()}원</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">부가세 (10%)</span>
          <span className="text-gray-900">{payment.vat_amount.toLocaleString()}원</span>
        </div>
      </div>
    </section>
  );
}
