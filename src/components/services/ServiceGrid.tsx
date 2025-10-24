'use client'

import { useState, useEffect } from 'react'
import ServiceCard from './ServiceCard'
import { Service } from '@/types'

interface ServiceGridProps {
  categoryId?: string
  sellerId?: string
  featured?: boolean
}

export default function ServiceGrid({ categoryId, sellerId, featured }: ServiceGridProps) {
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)

  // 임시 더미 데이터
  const dummyServices: Service[] = Array.from({ length: 12 }, (_, i) => ({
    id: `service-${i}`,
    seller_id: `seller-${i}`,
    category_id: categoryId || 'ai-image-design',
    title: [
      'Midjourney로 브랜드 로고 디자인 - 24시간 완성',
      'ChatGPT 활용 SEO 최적화 블로그 콘텐츠 작성',
      'Stable Diffusion으로 제품 이미지 생성',
      'AI 보이스오버 - 자연스러운 한국어 내레이션',
      'Runway Gen-2로 프로모션 영상 제작',
      'Claude로 기술 문서 작성 및 번역',
      'GitHub Copilot 활용 웹 개발 프로젝트',
      'DALL-E 3로 일러스트레이션 제작',
      'Suno AI로 배경음악 작곡',
      'AI 아바타로 교육 영상 제작',
      'Jasper AI로 마케팅 카피 작성',
      'Leonardo AI로 게임 컨셉아트 제작'
    ][i],
    description: 'AI 기술을 활용한 전문적인 서비스를 제공합니다.',
    thumbnail_url: '',
    price_min: Math.floor(Math.random() * 50000) + 30000,
    price_max: Math.floor(Math.random() * 200000) + 100000,
    delivery_days: Math.floor(Math.random() * 7) + 1,
    revision_count: Math.floor(Math.random() * 5) + 1,
    is_express_available: Math.random() > 0.5,
    express_price: Math.floor(Math.random() * 50000) + 20000,
    express_days: 1,
    status: 'active',
    view_count: Math.floor(Math.random() * 1000),
    order_count: Math.floor(Math.random() * 100),
    rating: Math.random() * 1.5 + 3.5,
    is_featured: i === 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    seller: {
      id: `seller-${i}`,
      user_id: `user-${i}`,
      business_name: ['AI마스터', '디자인프로', 'AI크리에이터', '콘텐츠메이커'][i % 4],
      description: 'AI 전문가',
      rating: Math.random() * 1 + 4,
      total_sales: Math.floor(Math.random() * 500) + 50,
      response_time: Math.floor(Math.random() * 24) + 1,
      is_verified: Math.random() > 0.5,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    ai_services: [
      {
        id: `ai-service-${i}`,
        service_id: `service-${i}`,
        ai_tool: ['Midjourney', 'ChatGPT', 'Stable Diffusion', 'ElevenLabs'][i % 4],
        version: 'v5.2',
        features: ['빠른 생성', '고품질 결과', '무제한 수정'],
        sample_prompts: ['예시 프롬프트 1', '예시 프롬프트 2'],
        created_at: new Date().toISOString()
      }
    ]
  }))

  useEffect(() => {
    // TODO: Supabase에서 실제 데이터 가져오기
    setServices(dummyServices)
    setLoading(false)
  }, [categoryId, sellerId, featured])

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 8 }, (_, i) => (
          <div key={i} className="skeleton h-96 rounded-xl"></div>
        ))}
      </div>
    )
  }

  if (services.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="text-[40px] mb-4">🔍</div>
        <h3 className="text-xl font-semibold mb-2">서비스를 찾을 수 없습니다</h3>
        <p className="text-gray-600">다른 필터를 선택해 보세요</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {services.map(service => (
        <ServiceCard key={service.id} service={service} />
      ))}
    </div>
  )
}