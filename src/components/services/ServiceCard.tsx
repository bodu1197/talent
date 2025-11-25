'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Service } from '@/types';
import { FaBox, FaStar, FaCheckCircle } from 'react-icons/fa';

// Service 타입에 is_advertised 속성 추가 (광고 서비스 여부)
interface AdvertisedService extends Service {
  is_advertised?: boolean;
}

interface ServiceCardProps {
  readonly service: AdvertisedService;
  readonly position?: number; // 카드의 위치 (광고 통계용)
  readonly categoryId?: string; // 현재 카테고리 ID
  readonly page?: number; // 현재 페이지
}

export default function ServiceCard({ service, position, categoryId, page }: ServiceCardProps) {
  const impressionTracked = useRef(false);

  // 노출 추적 (한 번만 실행)
  useEffect(() => {
    // is_advertised 플래그가 있는 서비스만 추적
    if (service.is_advertised && !impressionTracked.current && categoryId) {
      impressionTracked.current = true;

      // 노출 기록 API 호출 (비동기, 오류 무시)
      fetch('/api/advertising/track/impression', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceId: service.id,
          categoryId,
          position: position || 1,
          page: page || 1,
        }),
      }).catch(() => {
        // 추적 실패는 조용히 무시 (사용자 경험에 영향 없음)
      });
    }
  }, [service.id, categoryId, position, page]);

  // 클릭 추적
  const handleClick = () => {
    // 광고 서비스인 경우에만 클릭 추적
    if (service.is_advertised) {
      // 클릭 기록 API 호출 (비동기, 오류 무시)
      fetch('/api/advertising/track/click', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceId: service.id,
        }),
      }).catch(() => {
        // 추적 실패는 조용히 무시
      });
    }
  };

  return (
    <Link
      href={`/services/${service.id}`}
      className="group relative"
      aria-label={`${service.title} 서비스 상세보기`}
      onClick={handleClick}
    >
      {/* 썸네일 */}
      <div
        className="bg-gray-100 rounded-lg overflow-hidden w-full relative"
        style={{ aspectRatio: '210/160' }}
      >
        {service.thumbnail_url ? (
          <Image
            src={service.thumbnail_url}
            alt={`${service.title} 썸네일 이미지`}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-200"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-100">
            <FaBox className="text-4xl text-gray-400" aria-hidden="true" />
          </div>
        )}

        {/* 추천 배지 */}
        {service.is_advertised && (
          <div className="absolute top-2 right-2">
            <span
              className="px-2 py-1 bg-blue-600 text-white text-xs font-bold rounded shadow-lg inline-block"
              aria-label="추천"
            >
              추천
            </span>
          </div>
        )}
        {/* 프리미엄 배지 */}
        {service.is_featured && (
          <div className="absolute top-2 left-2">
            <span
              className="px-2 py-1 bg-yellow-500 text-white text-xs font-bold rounded shadow-lg inline-flex items-center gap-1"
              aria-label="프리미엄 서비스"
            >
              <FaStar aria-hidden="true" />
              PREMIUM
            </span>
          </div>
        )}
      </div>

      {/* 서비스 정보 */}
      <div className="mt-2">
        {/* 판매자 */}
        <div className="flex items-center gap-1 mb-1">
          <div
            className="w-4 h-4 rounded-full bg-brand-primary flex items-center justify-center text-white text-[8px] font-bold"
            aria-hidden="true"
          >
            {service.seller?.display_name?.[0] || 'S'}
          </div>
          <span className="text-xs text-gray-600 truncate">{service.seller?.display_name}</span>
          {service.seller?.is_verified && (
            <FaCheckCircle className="text-[10px] text-blue-500" aria-label="인증된 판매자" />
          )}
        </div>

        {/* 제목 */}
        <h3 className="font-medium text-sm line-clamp-2 group-hover:text-brand-primary transition-colors mb-1">
          {service.title}
        </h3>

        {/* 평점 및 주문 수 */}
        <div className="flex items-center gap-2 text-xs text-gray-600 mb-1">
          <span className="flex items-center gap-1">
            <FaStar className="text-yellow-400" aria-hidden="true" />
            <span className="sr-only">평점</span>
            {(service.rating || 0).toFixed(1)}
          </span>
        </div>

        {/* 가격 */}
        <p className="text-brand-primary font-bold text-sm">
          <span className="sr-only">가격</span>
          {(service.price || 0).toLocaleString()}원
        </p>
      </div>
    </Link>
  );
}
