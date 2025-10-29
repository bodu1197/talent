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
      <div className="group cursor-pointer">
        <div className="relative bg-gradient-to-br from-[#0f3460] to-[#1a4b7d] rounded-lg overflow-hidden aspect-[4/3] flex items-center justify-center">
          {/* 배경 패턴 */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,.05) 10px, rgba(255,255,255,.05) 20px)'
            }}></div>
          </div>

          {/* 컨텐츠 */}
          <div className="relative z-10 text-center p-6 text-white">
            <div className="text-4xl mb-3">🚀</div>
            <h3 className="font-bold text-lg mb-2">첫 발을 내딛는</h3>
            <h3 className="font-bold text-lg mb-4">당신을 응원합니다</h3>

            <div className="space-y-1.5 text-sm text-white/90 mb-4">
              <div className="flex items-center justify-center gap-2">
                <span className="text-yellow-300">✓</span>
                <span>수수료 0%, 번 돈은 100% 당신 것</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <span className="text-yellow-300">✓</span>
                <span>광고비 1,500만원 무료 지원</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <span className="text-yellow-300">✓</span>
                <span>실력으로 승부하는 공평한 플랫폼</span>
              </div>
            </div>

            <div className="inline-block px-4 py-2 bg-white/20 rounded-full text-sm font-medium group-hover:bg-white/30 transition-colors">
              지금 시작하기 →
            </div>
          </div>
        </div>

        {/* 하단 정보 영역 */}
        <div className="mt-3 px-1">
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
            <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center">
              <i className="fas fa-rocket text-xs text-gray-500"></i>
            </div>
            <span>여기가 당신의 자리입니다</span>
          </div>
          <p className="font-bold text-[#0f3460] text-lg">이 자리를 선점하세요!</p>
        </div>
      </div>
    </Link>
  )
}
