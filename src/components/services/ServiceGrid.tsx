'use client'

import { useState, useEffect } from 'react'
import ServiceCard from './ServiceCard'
import PlaceholderServiceCard from './PlaceholderServiceCard'
import { Service } from '@/types'

interface ServiceGridProps {
  categoryId?: string
  sellerId?: string
  featured?: boolean
}

export default function ServiceGrid({ categoryId, sellerId, featured }: ServiceGridProps) {
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // TODO: Supabase에서 실제 데이터 가져오기
    setServices([])
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

  // 최소 12개의 카드를 표시하기 위해 플레이스홀더 추가
  const MINIMUM_CARDS = 12
  const placeholderCount = Math.max(0, MINIMUM_CARDS - services.length)

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {services.map(service => (
        <ServiceCard key={service.id} service={service} />
      ))}
      {Array.from({ length: placeholderCount }, (_, i) => (
        <PlaceholderServiceCard key={`placeholder-${i}`} categoryId={categoryId} />
      ))}
    </div>
  )
}