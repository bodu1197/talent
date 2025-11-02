'use client'

import Link from 'next/link'

interface PlaceholderServiceCardProps {
  categoryId?: string
}

export default function PlaceholderServiceCard({ categoryId }: PlaceholderServiceCardProps) {
  const registerUrl = categoryId
    ? `/expert/register?category=${categoryId}`
    : '/expert/register'

  return (
    <Link href={registerUrl}>
      <div className="card group cursor-pointer group-hover:scale-105 transition-transform duration-200" style={{ width: '210px' }}>
        <div className="relative bg-gradient-to-br from-brand-primary to-brand-light rounded-t-lg overflow-hidden flex items-center justify-center" style={{ width: '210px', height: '160px' }}>
          {/* 배경 패턴 */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0 pattern-diagonal-stripes"></div>
          </div>

          {/* 컨텐츠 */}
          <div className="relative z-10 text-center px-3 py-4 text-white">
            <h3 className="font-bold text-lg mb-4">공평한 판매기회 !</h3>

            <div className="space-y-1.5 text-xs text-white/90 mb-4">
              <div>✓ 판매 수수료 0원</div>
              <div>✓ 광고비 1,500만원 무료 지원</div>
              <div>✓ 실력으로 승부하는 공평한 플랫폼</div>
            </div>

            <div className="inline-block px-4 py-2 bg-white/20 rounded-full text-xs font-medium group-hover:bg-white/30 transition-colors">
              지금 시작하기 →
            </div>
          </div>
        </div>

        {/* 하단 정보 영역 */}
        <div className="p-4">
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
            <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center">
              <i className="fas fa-rocket text-xs text-gray-500"></i>
            </div>
            <span>여기가 당신의 자리입니다</span>
          </div>
          <p className="font-bold text-brand-primary text-lg">이 자리를 선점하세요!</p>
        </div>
      </div>
    </Link>
  )
}
