'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Package, Star, CheckCircle, MapPin } from 'lucide-react';

// ServiceCard가 실제로 사용하는 최소 필드만 정의
interface ServiceCardData {
  id: string;
  title: string;
  thumbnail_url?: string | null;
  price?: number;
  rating?: number;
  is_featured?: boolean;
  is_advertised?: boolean;
  is_promoted?: boolean; // 검색 결과에서 사용
  location_region?: string | null; // 서비스 제공 지역
  _distance?: number; // 사용자 위치와의 거리 (km)
  seller?: {
    display_name?: string;
    is_verified?: boolean;
    is_business?: boolean; // 사업자 여부 (VAT 계산용)
  } | null;
}

// VAT 포함 가격 계산 함수 (사업자용)
const calculateBusinessPrice = (price: number): number => Math.floor(price * 1.1);

// VAT 미포함 가격 계산 함수 (일반 소비자용)
const calculateConsumerPrice = (price: number): number => price;

interface ServiceCardProps {
  readonly service: ServiceCardData;
  readonly position?: number; // 카드의 위치 (광고 통계용)
  readonly categoryId?: string; // 현재 카테고리 ID
  readonly page?: number; // 현재 페이지
  readonly priority?: boolean; // LCP 최적화를 위한 이미지 우선 로딩
  readonly showLocation?: boolean; // 오프라인 카테고리에서만 위치 정보 표시
}

export default function ServiceCard({
  service,
  position,
  categoryId,
  page,
  priority = false,
  showLocation = false,
}: ServiceCardProps) {
  const impressionTracked = useRef(false);

  // 광고/추천 서비스 여부 (is_advertised 또는 is_promoted)
  const isPromotedService = service.is_advertised || service.is_promoted;

  // 노출 추적 (한 번만 실행)
  useEffect(() => {
    // 광고/추천 플래그가 있는 서비스만 추적
    if (isPromotedService && !impressionTracked.current && categoryId) {
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
  }, [service.id, categoryId, position, page, isPromotedService]);

  // 클릭 추적
  const handleClick = () => {
    // 광고/추천 서비스인 경우에만 클릭 추적
    if (isPromotedService) {
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
            priority={priority}
            loading={priority ? 'eager' : 'lazy'}
            fetchPriority={priority ? 'high' : 'auto'}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-100">
            <Package className="w-10 h-10 text-gray-400" aria-hidden="true" />
          </div>
        )}

        {/* 추천 배지 */}
        {isPromotedService && (
          <div className="absolute top-2 right-2">
            <span
              className="px-2 py-1 bg-blue-600 text-white text-xs font-semibold rounded shadow-lg inline-block"
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
              className="px-2 py-1 bg-yellow-500 text-white text-xs font-semibold rounded shadow-lg inline-flex items-center gap-1"
              aria-label="프리미엄 서비스"
            >
              <Star className="w-3 h-3 fill-current" aria-hidden="true" />
              PREMIUM
            </span>
          </div>
        )}
      </div>

      {/* 서비스 정보 */}
      <div className="mt-2">
        {/* 전문가 */}
        <div className="flex items-center gap-1 mb-1">
          <div
            className="w-4 h-4 rounded-full bg-brand-primary flex items-center justify-center text-white text-[8px] font-semibold"
            aria-hidden="true"
          >
            {service.seller?.display_name?.[0] || 'S'}
          </div>
          <span className="text-xs text-gray-600 truncate">{service.seller?.display_name}</span>
          {service.seller?.is_verified && (
            <CheckCircle className="w-3 h-3 text-blue-500" aria-label="인증된 전문가" />
          )}
        </div>

        {/* 제목 */}
        <h3 className="font-medium text-sm line-clamp-2 group-hover:text-brand-primary transition-colors mb-1">
          {service.title}
        </h3>

        {/* 평점 및 거리 */}
        <div className="flex items-center gap-2 text-xs text-gray-600 mb-1">
          <span className="flex items-center gap-1">
            <Star className="w-3 h-3 text-yellow-400 fill-current" aria-hidden="true" />
            <span className="sr-only">평점</span>
            {(service.rating || 0).toFixed(1)}
          </span>
          {/* 위치 정보 표시 (오프라인 카테고리에서만) */}
          {showLocation && (
            <>
              {/* 거리 표시 (위치 정보가 있을 때만) */}
              {service._distance !== undefined && service._distance < 99999 && (
                <span className="flex items-center gap-1 text-gray-500">
                  <MapPin className="w-3 h-3" aria-hidden="true" />
                  <span className="sr-only">거리</span>
                  {service._distance < 1
                    ? `${Math.round(service._distance * 1000)}m`
                    : `${service._distance.toFixed(1)}km`}
                </span>
              )}
              {/* 지역 표시 (거리 정보 없고 지역 정보만 있을 때) */}
              {(service._distance === undefined || service._distance >= 99999) &&
                service.location_region && (
                  <span className="flex items-center gap-1 text-gray-500">
                    <MapPin className="w-3 h-3" aria-hidden="true" />
                    <span className="sr-only">지역</span>
                    {service.location_region}
                  </span>
                )}
            </>
          )}
        </div>

        {/* 가격 */}
        <p className="text-brand-primary font-semibold text-sm">
          <span className="sr-only">가격</span>
          {(service.seller?.is_business
            ? calculateBusinessPrice(service.price || 0)
            : calculateConsumerPrice(service.price || 0)
          ).toLocaleString()}
          원
        </p>
      </div>
    </Link>
  );
}
