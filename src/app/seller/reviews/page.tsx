'use client'

import { useState, useEffect, useMemo } from 'react'
import { useAuth } from '@/components/providers/AuthProvider'
import { createClient } from '@/lib/supabase/client'

interface Review {
  id: string
  rating: number
  comment: string
  created_at: string
  buyer?: {
    name: string
  }
  service?: {
    title: string
  }
}

export default function SellerReviewsPage() {
  const { user } = useAuth()
  const supabase = useMemo(() => createClient(), [])

  const [reviews, setReviews] = useState<Review[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [averageRating, setAverageRating] = useState(0)

  useEffect(() => {
    const fetchReviews = async () => {
    if (!user?.id) return

    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select(`
          *,
          buyer:users!buyer_id(name),
          service:services(title)
        `)
        .eq('seller_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error

      setReviews(data || [])
      const avg = data && data.length > 0
        ? data.reduce((sum, r) => sum + r.rating, 0) / data.length
        : 0
      setAverageRating(avg)
    } catch (error) {
      console.error('리뷰 조회 실패:', error)
    } finally {
      setIsLoading(false)
    }
    }

    if (user?.id) {
      supabase.from('users').update({ last_mode: 'seller' }).eq('id', user.id)
      fetchReviews()
    }
  }, [user])

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <i
            key={star}
            className={`fas fa-star ${star <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
          ></i>
        ))}
      </div>
    )
  }

  return (
    <div className="py-8">
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">리뷰 관리</h1>
          <p className="text-gray-600">고객 리뷰를 확인하고 답변하세요.</p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#0f3460]"></div>
          </div>
        ) : (
          <>
            {/* 평점 통계 */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
              <div className="flex items-center gap-6">
                <div className="text-center">
                  <div className="text-4xl font-bold text-[#0f3460] mb-2">
                    {averageRating.toFixed(1)}
                  </div>
                  {renderStars(Math.round(averageRating))}
                  <div className="text-sm text-gray-600 mt-2">{reviews.length}개 리뷰</div>
                </div>
              </div>
            </div>

            {/* 리뷰 목록 */}
            <div className="bg-white rounded-lg shadow-sm">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-bold">받은 리뷰</h2>
              </div>

              {reviews.length === 0 ? (
                <div className="p-12 text-center text-gray-500">
                  <i className="fas fa-star text-4xl mb-3"></i>
                  <p>아직 받은 리뷰가 없습니다</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {reviews.map((review) => (
                    <div key={review.id} className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 bg-[#0f3460] rounded-full flex items-center justify-center text-white font-semibold">
                          {review.buyer?.name?.[0] || 'U'}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <div className="font-semibold">{review.buyer?.name || '익명'}</div>
                              <div className="text-sm text-gray-500">{review.service?.title}</div>
                            </div>
                            <div className="text-sm text-gray-500">
                              {new Date(review.created_at).toLocaleDateString()}
                            </div>
                          </div>
                          {renderStars(review.rating)}
                          <p className="mt-2 text-gray-700">{review.comment}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
