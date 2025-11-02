'use client'

import Link from 'next/link'
import { Service } from '@/types'

interface ServiceCardProps {
  service: Service
}

export default function ServiceCard({ service }: ServiceCardProps) {
  return (
    <Link href={`/services/${service.id}`} className="group relative">
      {/* 썸네일 */}
      <div className="bg-gray-100 rounded-lg overflow-hidden w-full relative" style={{ aspectRatio: '210/160' }}>
        {service.thumbnail_url ? (
          <img
            src={service.thumbnail_url}
            alt={service.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-100">
            <i className="fas fa-box text-4xl text-gray-400"></i>
          </div>
        )}

        {/* 프리미엄 배지 */}
        {service.is_featured && (
          <div className="absolute top-2 left-2">
            <div className="px-2 py-1 bg-yellow-500 text-white text-xs font-bold rounded shadow-lg flex items-center gap-1">
              <i className="fas fa-star"></i>
              PREMIUM
            </div>
          </div>
        )}
      </div>

      {/* 서비스 정보 */}
      <div className="mt-2">
        {/* 판매자 */}
        <div className="flex items-center gap-1 mb-1">
          <div className="w-4 h-4 rounded-full bg-[#0f3460] flex items-center justify-center text-white text-[8px] font-bold">
            {service.seller?.business_name?.[0] || 'S'}
          </div>
          <span className="text-xs text-gray-600 truncate">
            {service.seller?.business_name}
          </span>
          {service.seller?.is_verified && (
            <i className="fas fa-check-circle text-[10px] text-blue-500"></i>
          )}
        </div>

        {/* 제목 */}
        <h3 className="font-medium text-sm line-clamp-2 group-hover:text-[#0f3460] transition-colors mb-1">
          {service.title}
        </h3>

        {/* 평점 및 주문 수 */}
        <div className="flex items-center gap-2 text-xs text-gray-600 mb-1">
          <span className="flex items-center gap-1">
            <i className="fas fa-star text-yellow-400"></i>
            {(service.rating || 0).toFixed(1)}
          </span>
          <span>({service.order_count || 0})</span>
        </div>

        {/* 가격 */}
        <p className="text-[#0f3460] font-bold text-sm">
          {(service.price || 0).toLocaleString()}원
        </p>
      </div>
    </Link>
  )
}