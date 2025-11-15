'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import ServiceCard from '@/components/services/ServiceCard'
import { Service } from '@/types'

interface ServiceGridProps {
  initialServices: Service[]
}

export default function ServiceGrid({ initialServices }: ServiceGridProps) {
  const searchParams = useSearchParams()
  const sort = searchParams.get('sort') || 'popular'
  const price = searchParams.get('price')

  const [services, setServices] = useState<Service[]>(initialServices)

  useEffect(() => {
    let filtered = [...initialServices]

    // 가격 필터 적용
    if (price) {
      filtered = filtered.filter(service => {
        const servicePrice = service.price || 0
        switch (price) {
          case 'under-50000':
            return servicePrice < 50000
          case '50000-100000':
            return servicePrice >= 50000 && servicePrice < 100000
          case '100000-300000':
            return servicePrice >= 100000 && servicePrice < 300000
          case '300000-500000':
            return servicePrice >= 300000 && servicePrice < 500000
          case 'over-500000':
            return servicePrice >= 500000
          default:
            return true
        }
      })
    }

    // 광고 서비스와 일반 서비스 분리 (광고 우선순위 유지)
    const advertisedServices = filtered.filter(s => (s as any).is_advertised === true)
    const regularServices = filtered.filter(s => (s as any).is_advertised !== true)

    // 정렬 함수
    const sortServices = (services: Service[]) => {
      const sorted = [...services]
      switch (sort) {
        case 'latest':
          // 이미 created_at 기준 정렬됨
          break
        case 'price_low':
          sorted.sort((a, b) => (a.price || 0) - (b.price || 0))
          break
        case 'price_high':
          sorted.sort((a, b) => (b.price || 0) - (a.price || 0))
          break
        case 'rating':
          sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0))
          break
        case 'popular':
        default:
          sorted.sort((a, b) => (b.orders_count || 0) - (a.orders_count || 0))
          break
      }
      return sorted
    }

    // 광고 서비스와 일반 서비스 각각 정렬
    const sortedAdvertised = sortServices(advertisedServices)
    const sortedRegular = sortServices(regularServices)

    // 광고 서비스(정렬) + 일반 서비스(정렬) 순서로 합치기
    const combined = [...sortedAdvertised, ...sortedRegular]

    setServices(combined)
  }, [sort, price, initialServices])

  if (services.length === 0) {
    return (
      <div className="col-span-full text-center py-12">
        <i className="fas fa-inbox text-4xl text-gray-300 mb-4"></i>
        <p className="text-gray-500">해당 조건의 서비스가 없습니다.</p>
      </div>
    )
  }

  return (
    <>
      {services.map(service => (
        <ServiceCard key={service.id} service={service} />
      ))}
    </>
  )
}
