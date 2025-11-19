import Link from "next/link";
import Image from "next/image";
import { Service } from "@/types";
import { FaBox, FaStar, FaCheckCircle } from "react-icons/fa";

interface ServiceCardProps {
  service: Service;
}

export default function ServiceCard({ service }: ServiceCardProps) {
  return (
    <Link
      href={`/services/${service.id}`}
      className="group relative"
      aria-label={`${service.title} 서비스 상세보기`}
    >
      {/* 썸네일 */}
      <div
        className="bg-gray-100 rounded-lg overflow-hidden w-full relative"
        style={{ aspectRatio: "210/160" }}
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

        {/* 광고 배지 */}
        {(service as any).is_promoted && (
          <div className="absolute top-2 right-2">
            <div
              className="px-2 py-1 bg-blue-600 text-white text-xs font-bold rounded shadow-lg"
              role="status"
              aria-label="광고 서비스"
            >
              광고
            </div>
          </div>
        )}
        {/* 프리미엄 배지 */}
        {service.is_featured && (
          <div className="absolute top-2 left-2">
            <div
              className="px-2 py-1 bg-yellow-500 text-white text-xs font-bold rounded shadow-lg flex items-center gap-1"
              role="status"
              aria-label="프리미엄 서비스"
            >
              <FaStar aria-hidden="true" />
              PREMIUM
            </div>
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
            {service.seller?.display_name?.[0] || "S"}
          </div>
          <span className="text-xs text-gray-600 truncate">
            {service.seller?.display_name}
          </span>
          {service.seller?.is_verified && (
            <FaCheckCircle
              className="text-[10px] text-blue-500"
              aria-label="인증된 판매자"
            />
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
