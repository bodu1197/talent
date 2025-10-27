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