import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '회사 소개 - 돌파구 | 수수료 0원 재능 거래 플랫폼',
  description: '돌파구는 판매자와 구매자 모두에게 수수료 0원을 제공하는 혁신적인 재능 거래 플랫폼입니다. 우리의 미션과 비전을 확인하세요.',
  keywords: '돌파구 소개, 회사 소개, 재능 거래 플랫폼, 수수료 0원, 돌파구 미션',
}

export default function AboutPage() {
  return (
    <div className="container-1200 py-16">
      <h1 className="text-3xl font-semibold mb-8">회사 소개</h1>
      <div className="prose max-w-none">
        <p className="text-gray-600">회사 소개 페이지입니다.</p>
      </div>
    </div>
  )
}
