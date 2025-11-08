'use client'

import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'

type Stats = {
  newOrders: number
  inProgressOrders: number
  deliveredOrders: number
  monthlyRevenue: number
}

type Order = {
  id: string
  order_number?: string
  title?: string
  status: string
  total_amount?: number
  service?: {
    title: string
  }
  buyer?: {
    name: string
  }
}

type Props = {
  stats: Stats
  recentOrders: Order[]
}

export default function SellerDashboardClient({ stats, recentOrders }: Props) {
  // 테스트용 - Header와 Footer만 렌더링
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />
      <div style={{ flex: 1, backgroundColor: '#f3f4f6', padding: '20px', textAlign: 'center', paddingTop: '80px' }}>
        <h1>테스트: Body 영역 제거됨</h1>
        <p>Header와 Footer의 정렬 상태를 확인하세요</p>
        <p>Footer의 폭을 확인하세요</p>
      </div>
      <div style={{ width: '100%', backgroundColor: 'red' }}>
        <p style={{ color: 'white', textAlign: 'center' }}>Footer 컨테이너 (빨간 배경)</p>
        <Footer />
      </div>
    </div>
  )
}