'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/providers/AuthProvider'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

interface Favorite {
  id: string
  created_at: string
  service: {
    id: string
    title: string
    description: string
    thumbnail_url: string | null
    price: number
    rating: number
    review_count: number
    seller_id: string
    seller?: {
      business_name: string | null
      name: string
      is_verified: boolean
    }
  }
}

export default function BuyerFavoritesPage() {
  const { user } = useAuth()
  const router = useRouter()
  const supabase = createClient()

  const [favorites, setFavorites] = useState<Favorite[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      router.push('/auth/login')
      return
    }
    fetchFavorites()
  }, [user])

  const fetchFavorites = async () => {
    if (!user?.id) return

    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from('favorites')
        .select(`
          id,
          created_at,
          service:services(
            id,
            title,
            description,
            thumbnail_url,
            price,
            rating,
            review_count,
            seller_id
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error

      // seller 정보 추가 조회
      const favoritesWithSeller = await Promise.all(
        (data || []).map(async (fav: any) => {
          if (fav.service) {
            const { data: sellerData } = await supabase
              .from('seller_profiles')
              .select('business_name, is_verified')
              .eq('user_id', fav.service.seller_id)
              .single()

            const { data: userData } = await supabase
              .from('users')
              .select('name')
              .eq('id', fav.service.seller_id)
              .single()

            return {
              ...fav,
              service: {
                ...fav.service,
                seller: {
                  ...sellerData,
                  name: userData?.name || '',
                },
              },
            }
          }
          return fav
        })
      )

      setFavorites(favoritesWithSeller as Favorite[])
    } catch (error) {
      console.error('찜 목록 조회 실패:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRemoveFavorite = async (favoriteId: string) => {
    if (!confirm('찜 목록에서 삭제하시겠습니까?')) return

    try {
      const { error } = await supabase.from('favorites').delete().eq('id', favoriteId)

      if (error) throw error

      setFavorites(favorites.filter((fav) => fav.id !== favoriteId))
    } catch (error) {
      console.error('찜 삭제 실패:', error)
      alert('삭제 중 오류가 발생했습니다.')
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner-lg"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container-1200">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">찜한 서비스</h1>
          <p className="text-gray-600">관심있는 서비스를 저장하고 나중에 확인하세요.</p>
        </div>

        {/* 통계 */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-gray-600">총</span>
              <span className="text-2xl font-bold text-[#0f3460] ml-2">{favorites.length}</span>
              <span className="text-gray-600 ml-1">개의 서비스</span>
            </div>
            {favorites.length > 0 && (
              <button
                onClick={() => {
                  if (confirm('모든 찜을 삭제하시겠습니까?')) {
                    favorites.forEach((fav) => handleRemoveFavorite(fav.id))
                  }
                }}
                className="text-sm text-red-600 hover:text-red-700"
              >
                전체 삭제
              </button>
            )}
          </div>
        </div>

        {/* 서비스 목록 */}
        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="spinner-lg"></div>
          </div>
        ) : favorites.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="far fa-heart text-gray-400 text-2xl"></i>
            </div>
            <h3 className="text-lg font-semibold mb-2">찜한 서비스가 없습니다</h3>
            <p className="text-gray-600 mb-6">마음에 드는 서비스를 찜해보세요!</p>
            <Link href="/services" className="btn-primary px-6 py-2 inline-block">
              서비스 둘러보기
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {favorites.map((favorite) => (
              <div key={favorite.id} className="bg-white rounded-lg shadow-sm hover:shadow-lg transition-shadow overflow-hidden group">
                {/* 썸네일 */}
                <Link href={`/services/${favorite.service.id}`} className="block relative">
                  <div className="aspect-w-16 aspect-h-12 bg-gray-100 relative h-48">
                    {favorite.service.thumbnail_url ? (
                      <img
                        src={favorite.service.thumbnail_url}
                        alt={favorite.service.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <i className="fas fa-image text-gray-300 text-4xl"></i>
                      </div>
                    )}
                  </div>

                  {/* 찜 해제 버튼 */}
                  <button
                    onClick={(e) => {
                      e.preventDefault()
                      handleRemoveFavorite(favorite.id)
                    }}
                    className="absolute top-3 right-3 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition-colors shadow-lg"
                  >
                    <i className="fas fa-heart text-red-500"></i>
                  </button>
                </Link>

                {/* 내용 */}
                <div className="p-4">
                  {/* 판매자 */}
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 rounded-full bg-[#0f3460] flex items-center justify-center text-white text-xs font-bold">
                      {favorite.service.seller?.business_name?.[0] ||
                        favorite.service.seller?.name?.[0] ||
                        'S'}
                    </div>
                    <span className="text-sm text-gray-600">
                      {favorite.service.seller?.business_name || favorite.service.seller?.name}
                    </span>
                    {favorite.service.seller?.is_verified && (
                      <span className="text-xs px-2 py-0.5 bg-blue-100 text-[#0f3460] rounded">인증</span>
                    )}
                  </div>

                  {/* 제목 */}
                  <Link href={`/services/${favorite.service.id}`}>
                    <h3 className="font-bold mb-2 line-clamp-2 hover:text-[#0f3460] transition-colors">
                      {favorite.service.title}
                    </h3>
                  </Link>

                  {/* 평점 */}
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                    <span className="flex items-center">
                      <i className="fas fa-star text-yellow-400 mr-1"></i>
                      {favorite.service.rating.toFixed(1)}
                    </span>
                    <span>({favorite.service.review_count})</span>
                  </div>

                  {/* 가격 */}
                  <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <div>
                      <span className="text-xl font-bold">{favorite.service.price.toLocaleString()}</span>
                      <span className="text-gray-600 ml-1">원~</span>
                    </div>
                    <Link
                      href={`/services/${favorite.service.id}`}
                      className="px-4 py-2 bg-[#0f3460] text-white text-sm rounded-lg hover:bg-[#1a4b7d] transition-colors"
                    >
                      상세보기
                    </Link>
                  </div>
                </div>

                {/* 찜한 날짜 */}
                <div className="px-4 pb-4">
                  <div className="text-xs text-gray-500">
                    <i className="far fa-clock mr-1"></i>
                    {new Date(favorite.created_at).toLocaleDateString()} 추가
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
