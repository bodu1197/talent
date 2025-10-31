'use client'

import { useState, useEffect } from 'react'
import Sidebar from '@/components/mypage/Sidebar'
import Link from 'next/link'
import { useAuth } from '@/components/providers/AuthProvider'
import { getFavorites } from '@/lib/supabase/queries/favorites'
import { removeFavorite } from '@/lib/supabase/mutations/favorites'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import EmptyState from '@/components/common/EmptyState'
import ErrorState from '@/components/common/ErrorState'

export default function BuyerFavoritesPage() {
  const { user } = useAuth()
  const [favorites, setFavorites] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set())
  const [removing, setRemoving] = useState(false)

  useEffect(() => {
    if (user) {
      loadFavorites()
    }
  }, [user])

  async function loadFavorites() {
    try {
      setLoading(true)
      setError(null)
      const data = await getFavorites(user!.id)
      setFavorites(data)
    } catch (err: any) {
      console.error('찜 목록 조회 실패:', err)
      setError(err.message || '찜 목록을 불러오는데 실패했습니다')
    } finally {
      setLoading(false)
    }
  }

  async function handleRemoveFavorite(serviceId: string) {
    if (!user) return

    try {
      await removeFavorite(user.id, serviceId)
      setFavorites(favorites.filter(fav => fav.service.id !== serviceId))
      setSelectedItems(prev => {
        const newSet = new Set(prev)
        newSet.delete(serviceId)
        return newSet
      })
    } catch (err: any) {
      console.error('찜 삭제 실패:', err)
      alert('찜을 삭제하는데 실패했습니다')
    }
  }

  async function handleRemoveSelected() {
    if (!user || selectedItems.size === 0) return

    const confirmed = confirm(`선택한 ${selectedItems.size}개의 서비스를 찜 목록에서 삭제하시겠습니까?`)
    if (!confirmed) return

    try {
      setRemoving(true)
      await Promise.all(
        Array.from(selectedItems).map(serviceId =>
          removeFavorite(user.id, serviceId)
        )
      )
      setFavorites(favorites.filter(fav => !selectedItems.has(fav.service.id)))
      setSelectedItems(new Set())
    } catch (err: any) {
      console.error('일괄 삭제 실패:', err)
      alert('찜 삭제에 실패했습니다')
    } finally {
      setRemoving(false)
    }
  }

  const toggleSelect = (serviceId: string) => {
    const newSelected = new Set(selectedItems)
    if (newSelected.has(serviceId)) {
      newSelected.delete(serviceId)
    } else {
      newSelected.add(serviceId)
    }
    setSelectedItems(newSelected)
  }

  const toggleSelectAll = () => {
    if (selectedItems.size === favorites.length) {
      setSelectedItems(new Set())
    } else {
      setSelectedItems(new Set(favorites.map(fav => fav.service.id)))
    }
  }

  if (loading) {
    return (
      <>
        <Sidebar mode="buyer" />
        <main className="flex-1 overflow-y-auto p-8">
          <LoadingSpinner message="찜 목록을 불러오는 중..." />
        </main>
      </>
    )
  }

  if (error) {
    return (
      <>
        <Sidebar mode="buyer" />
        <main className="flex-1 overflow-y-auto p-8">
          <ErrorState message={error} retry={loadFavorites} />
        </main>
      </>
    )
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

        {favorites.length > 0 ? (
          <>
            {/* 액션 바 */}
            <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={selectedItems.size === favorites.length}
                      onChange={toggleSelectAll}
                      className="w-4 h-4 text-brand-primary border-gray-300 rounded focus:ring-brand-primary"
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
                  <button
                    onClick={handleRemoveSelected}
                    disabled={removing}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium disabled:opacity-50"
                  >
                    <i className="fas fa-trash mr-2"></i>
                    {removing ? '삭제 중...' : '선택 삭제'}
                  </button>
                )}
              </div>
            </div>

            {/* 결과 카운트 */}
            <div className="mb-4 text-sm text-gray-600">
              총 <span className="font-bold text-gray-900">{favorites.length}</span>개의 서비스
            </div>

            {/* 찜 목록 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {favorites.map((favorite) => {
                const service = favorite.service
                if (!service) return null

                return (
                  <div key={favorite.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:border-brand-primary transition-colors">
                    {/* 썸네일 */}
                    <div className="relative">
                      <div className="aspect-[4/3] bg-gray-100 flex items-center justify-center">
                        {service.thumbnail_url ? (
                          <img src={service.thumbnail_url} alt={service.title} className="w-full h-full object-cover" />
                        ) : (
                          <i className="fas fa-image text-gray-400 text-4xl"></i>
                        )}
                      </div>
                      <div className="absolute top-3 left-3">
                        <input
                          type="checkbox"
                          checked={selectedItems.has(service.id)}
                          onChange={() => toggleSelect(service.id)}
                          className="w-5 h-5 text-brand-primary border-gray-300 rounded focus:ring-brand-primary"
                        />
                      </div>
                      <button
                        onClick={() => handleRemoveFavorite(service.id)}
                        className="absolute top-3 right-3 w-10 h-10 bg-white rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors"
                      >
                        <i className="fas fa-heart text-red-500"></i>
                      </button>
                    </div>

                    {/* 정보 */}
                    <div className="p-4">
                      <Link
                        href={`/services/${service.id}`}
                        className="text-lg font-bold text-gray-900 hover:text-brand-primary line-clamp-2 mb-2 block"
                      >
                        {service.title}
                      </Link>

                      <div className="text-sm text-gray-600 mb-3">
                        {service.seller?.name || '판매자'}
                      </div>

                      <div className="flex items-center gap-2 mb-3">
                        <div className="flex items-center gap-1">
                          <i className="fas fa-star text-yellow-400 text-sm"></i>
                          <span className="text-sm font-medium text-gray-900">
                            {service.rating ? service.rating.toFixed(1) : '0.0'}
                          </span>
                        </div>
                        <span className="text-sm text-gray-600">
                          ({service.review_count || 0})
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="text-lg font-bold text-brand-primary">
                          {service.price?.toLocaleString() || '0'}원
                        </div>
                        <Link
                          href={`/services/${service.id}`}
                          className="px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-light transition-colors text-sm font-medium"
                        >
                          보기
                        </Link>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        ) : (
          <EmptyState
            icon="fa-heart"
            title="찜한 서비스가 없습니다"
            description="관심있는 서비스를 찜하고 나중에 다시 확인해보세요"
            action={{
              label: '서비스 둘러보기',
              href: '/'
            }}
          />
        )}
      </main>
    </>
  )
}
