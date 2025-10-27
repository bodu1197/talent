'use client'

import Sidebar from '@/components/mypage/Sidebar'
import Link from 'next/link'

export default function SellerPortfolioPage() {
  const mockPortfolio = [
    {
      id: '1',
      title: '로고 디자인 포트폴리오',
      thumbnailUrl: null,
      description: '미니멀하고 세련된 로고 디자인 작업물입니다.',
      createdAt: '2025-01-20',
      viewCount: 342
    },
    {
      id: '2',
      title: '웹 디자인 포트폴리오',
      thumbnailUrl: null,
      description: '반응형 웹사이트 디자인 작업물입니다.',
      createdAt: '2025-01-15',
      viewCount: 521
    }
  ]

  return (
    <>
      <Sidebar mode="seller" />
      <main className="flex-1 overflow-y-auto p-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">포트폴리오</h1>
              <p className="text-gray-600">작업물을 등록하고 관리하세요</p>
            </div>
            <Link
              href="/mypage/seller/portfolio/new"
              className="px-6 py-3 bg-[#0f3460] text-white rounded-lg hover:bg-[#1a4b7d] transition-colors font-medium"
            >
              <i className="fas fa-plus mr-2"></i>
              포트폴리오 등록
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockPortfolio.map((item) => (
            <div key={item.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:border-[#0f3460] transition-colors">
              <div className="aspect-[4/3] bg-gray-100 flex items-center justify-center">
                {item.thumbnailUrl ? (
                  <img src={item.thumbnailUrl} alt={item.title} className="w-full h-full object-cover" />
                ) : (
                  <i className="fas fa-image text-gray-400 text-4xl"></i>
                )}
              </div>
              <div className="p-4">
                <h3 className="text-lg font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">{item.description}</p>
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span><i className="fas fa-eye mr-1"></i>{item.viewCount}</span>
                  <span>{item.createdAt}</span>
                </div>
                <div className="flex gap-2 mt-4">
                  <button className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium">
                    수정
                  </button>
                  <button className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium">
                    삭제
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </>
  )
}
