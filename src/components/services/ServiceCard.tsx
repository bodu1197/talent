'use client'

import Link from 'next/link'
import { Service } from '@/types'

interface ServiceCardProps {
  service: Service
}

export default function ServiceCard({ service }: ServiceCardProps) {
  return (
    <Link href={`/services/${service.id}`} className="group">
      <div className="card group-hover:scale-105 transition-transform duration-200 w-full">
        {/* 프리미엄 배지 */}
        {service.is_featured && (
          <div className="absolute top-4 left-4 z-10">
            <span className="badge badge-featured"><i className="fas fa-star"></i> PREMIUM</span>
          </div>
        )}

        {/* 썸네일 */}
        <div className="bg-gray-100 relative overflow-hidden w-full" style={{ aspectRatio: '210/160' }}>
          {service.thumbnail_url ? (
            <img
              src={service.thumbnail_url}
              alt={service.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-[40px] opacity-50 text-gray-400">
                {service.ai_services?.[0]?.ai_tool === 'Midjourney' && <i className="fas fa-palette"></i>}
                {service.ai_services?.[0]?.ai_tool === 'ChatGPT' && <i className="fas fa-pen-fancy"></i>}
                {service.ai_services?.[0]?.ai_tool === 'Stable Diffusion' && <i className="fas fa-image"></i>}
                {service.ai_services?.[0]?.ai_tool === 'ElevenLabs' && <i className="fas fa-microphone"></i>}
                {!service.ai_services?.[0]?.ai_tool && <i className="fas fa-box"></i>}
              </span>
            </div>
          )}
        </div>

        {/* 내용 */}
        <div className="p-4">
          {/* 판매자 정보 */}
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-brand-primary flex items-center justify-center text-white text-xs font-bold">
              {service.seller?.business_name?.[0] || 'S'}
            </div>
            <span className="text-sm text-gray-600">{service.seller?.business_name}</span>
            {service.seller?.is_verified && (
              <span className="badge badge-ai text-xs">인증</span>
            )}
          </div>

          {/* 제목 */}
          <h3 className="font-bold mb-2 line-clamp-2 group-hover:text-brand-primary transition-colors">
            {service.title}
          </h3>

          {/* AI 툴 태그 */}
          {service.ai_services && service.ai_services.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {service.ai_services.map(ai => (
                <span key={ai.id} className="text-xs px-2 py-1 bg-blue-50 text-brand-primary rounded">
                  {ai.ai_tool}
                </span>
              ))}
            </div>
          )}

          {/* 평점 및 리뷰 */}
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
            <span className="flex items-center gap-1">
              <i className="fas fa-star text-yellow-400"></i> {(service.rating || 0).toFixed(1)}
            </span>
            <span>({service.order_count || 0})</span>
            {service.is_express_available && (
              <>
                <span>•</span>
                <span className="text-brand-primary font-medium flex items-center gap-1">
                  <i className="fas fa-bolt"></i> 익스프레스
                </span>
              </>
            )}
          </div>

          {/* 가격 */}
          <div className="flex items-center justify-between">
            <div>
              <span className="text-2xl font-bold">
                {(service.price || 0).toLocaleString()}
              </span>
              <span className="text-gray-600 ml-1">원</span>
            </div>
            <button className="btn-primary px-4 py-2 opacity-0 group-hover:opacity-100 transition-opacity">
              상세보기
            </button>
          </div>
        </div>
      </div>
    </Link>
  )
}