'use client'

import { useState } from 'react'
import Sidebar from '@/components/mypage/Sidebar'
import Link from 'next/link'

export default function BuyerFavoritesPage() {
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set())

  // TODO: 실제로는 API에서 데이터를 가져와야 합니다
  const mockFavorites = [
    {
      id: '1',
      serviceId: 's1',
      title: '로고 디자인 작업',
      sellerName: '디자인스튜디오',
      thumbnailUrl: null,
      price: 50000,
      rating: 4.8,
      reviewCount: 42,
      addedAt: '2025-01-20'
    },
    {
      id: '2',
      serviceId: 's2',
      title: '영상 편집 서비스',
      sellerName: '비디오프로',
      thumbnailUrl: null,
      price: 150000,
      rating: 4.9,
      reviewCount: 35,
      addedAt: '2025-01-18'
    },
    {
      id: '3',
      serviceId: 's3',
      title: '명함 디자인',
      sellerName: '인쇄소A',
      thumbnailUrl: null,
      price: 30000,
      rating: 4.5,
      reviewCount: 28,
      addedAt: '2025-01-15'
    }
  ]

  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedItems)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedItems(newSelected)
  }

  const toggleSelectAll = () => {
    if (selectedItems.size === mockFavorites.length) {
      setSelectedItems(new Set())
    } else {
      setSelectedItems(new Set(mockFavorites.map(item => item.id)))
    }
  }

  return (
    <>
      <Sidebar mode="buyer" />
      <main className="flex-1 overflow-y-auto p-8">
        {/* 페이지 헤더 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">찜 목록</h1>
          <p className="text-gray-600">관심있는 서비스를 모아보세요</p>
        </div>

        {/* 액션 바 */}
        {mockFavorites.length > 0 && (
          <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={selectedItems.size === mockFavorites.length}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 text-[#0f3460] border-gray-300 rounded focus:ring-[#0f3460]"
                  />
                  <span className="text-sm text-gray-700">전체 선택</span>
                </label>
                {selectedItems.size > 0 && (
                  <span className="text-sm text-gray-600">
                    {selectedItems.size}개 선택됨
                  </span>
                )}
              </div>

              {selectedItems.size > 0 && (
                <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium">
                  <i className="fas fa-trash mr-2"></i>
                  선택 삭제
                </button>
              )}
            </div>
          </div>
        )}

        {/* 결과 카운트 */}
        <div className="mb-4 text-sm text-gray-600">
          총 <span className="font-bold text-gray-900">{mockFavorites.length}</span>개의 서비스
        </div>

        {/* 찜 목록 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockFavorites.length > 0 ? (
            mockFavorites.map((item) => (
              <div key={item.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:border-[#0f3460] transition-colors">
                {/* 썸네일 */}
                <div className="relative">
                  <div className="aspect-[4/3] bg-gray-100 flex items-center justify-center">
                    {item.thumbnailUrl ? (
                      <img src={item.thumbnailUrl} alt={item.title} className="w-full h-full object-cover" />
                    ) : (
                      <i className="fas fa-image text-gray-400 text-4xl"></i>
                    )}
                  </div>
                  <div className="absolute top-3 left-3">
                    <input
                      type="checkbox"
                      checked={selectedItems.has(item.id)}
                      onChange={() => toggleSelect(item.id)}
                      className="w-5 h-5 text-[#0f3460] border-gray-300 rounded focus:ring-[#0f3460]"
                    />
                  </div>
                  <button className="absolute top-3 right-3 w-10 h-10 bg-white rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors">
                    <i className="fas fa-heart text-red-500"></i>
                  </button>
                </div>

                {/* 정보 */}
                <div className="p-4">
                  <Link
                    href={`/services/${item.serviceId}`}
                    className="text-lg font-bold text-gray-900 hover:text-[#0f3460] line-clamp-2 mb-2 block"
                  >
                    {item.title}
                  </Link>

                  <div className="text-sm text-gray-600 mb-3">
                    {item.sellerName}
                  </div>

                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex items-center gap-1">
                      <i className="fas fa-star text-yellow-400 text-sm"></i>
                      <span className="text-sm font-medium text-gray-900">{item.rating}</span>
                    </div>
                    <span className="text-sm text-gray-600">({item.reviewCount})</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="text-lg font-bold text-[#0f3460]">
                      {item.price.toLocaleString()}원
                    </div>
                    <Link
                      href={`/services/${item.serviceId}`}
                      className="px-4 py-2 bg-[#0f3460] text-white rounded-lg hover:bg-[#1a4b7d] transition-colors text-sm font-medium"
                    >
                      보기
                    </Link>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full bg-white rounded-lg border border-gray-200 p-12 text-center">
              <i className="fas fa-heart text-gray-300 text-5xl mb-4"></i>
              <p className="text-gray-600 text-lg mb-4">찜한 서비스가 없습니다</p>
              <Link
                href="/"
                className="inline-block px-6 py-2 bg-[#0f3460] text-white rounded-lg hover:bg-[#1a4b7d] transition-colors font-medium"
              >
                서비스 둘러보기
              </Link>
            </div>
          )}
        </div>
      </main>
    </>
  )
}
