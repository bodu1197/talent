'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import ServiceCard from '@/components/services/ServiceCard';
import { Service } from '@/types';
import { Inbox } from 'lucide-react';

interface ServiceGridProps {
  readonly initialServices: Service[];
  readonly categoryId?: string;
  readonly page?: number;
  readonly showLocation?: boolean; // 오프라인 카테고리에서만 위치 정보 표시
}

export default function ServiceGrid({
  initialServices,
  categoryId,
  page,
  showLocation = false,
}: ServiceGridProps) {
  const searchParams = useSearchParams();
  const sort = searchParams.get('sort') || 'popular';
  const price = searchParams.get('price');
  const tax = searchParams.get('tax');

  const [services, setServices] = useState<Service[]>(initialServices);

  useEffect(() => {
    let filtered = [...initialServices];

    // 가격 필터 적용
    if (price) {
      filtered = filtered.filter((service) => {
        const servicePrice = service.price || 0;
        switch (price) {
          case 'under-50000':
            return servicePrice < 50000;
          case '50000-100000':
            return servicePrice >= 50000 && servicePrice < 100000;
          case '100000-300000':
            return servicePrice >= 100000 && servicePrice < 300000;
          case '300000-500000':
            return servicePrice >= 300000 && servicePrice < 500000;
          case 'over-500000':
            return servicePrice >= 500000;
          default:
            return true;
        }
      });
    }

    // 세금계산서 필터 적용 (seller.is_business 기준)
    if (tax) {
      filtered = filtered.filter((service) => {
        const isBusiness = service.seller?.is_business ?? false;
        switch (tax) {
          case 'issued':
            return isBusiness === true; // 사업자 = 세금계산서 발행 가능
          case 'not-issued':
            return isBusiness === false; // 비사업자 = 세금계산서 미발행
          default:
            return true;
        }
      });
    }

    // 정렬이 기본(popular)이거나 latest일 경우, 서버에서 이미 정렬된 순서를 유지
    // (서버에서 광고 우선 + 랜덤 셔플 완료)
    if (sort === 'popular' || sort === 'latest') {
      setServices(filtered);
      return;
    }

    // 가격/별점 정렬만 클라이언트에서 처리
    const sorted = [...filtered];
    switch (sort) {
      case 'price_low':
        sorted.sort((a, b) => (a.price || 0) - (b.price || 0));
        break;
      case 'price_high':
        sorted.sort((a, b) => (b.price || 0) - (a.price || 0));
        break;
      case 'rating':
        sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
    }

    setServices(sorted);
  }, [sort, price, tax, initialServices]);

  if (services.length === 0) {
    return (
      <div className="col-span-full text-center py-12">
        <Inbox className="w-10 h-10 text-gray-300 mb-4 mx-auto" />
        <p className="text-gray-500">해당 조건의 서비스가 없습니다.</p>
      </div>
    );
  }

  return (
    <>
      {services.map((service, index) => (
        <ServiceCard
          key={service.id}
          service={service}
          categoryId={categoryId}
          position={index + 1}
          page={page || 1}
          priority={index < 4}
          showLocation={showLocation}
        />
      ))}
    </>
  );
}
