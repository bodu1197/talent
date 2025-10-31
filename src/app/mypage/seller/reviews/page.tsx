'use client'

import { useState, useEffect } from 'react'
import Sidebar from '@/components/mypage/Sidebar'
import Link from 'next/link'
import { useAuth } from '@/components/providers/AuthProvider'
import { getSellerReviews } from '@/lib/supabase/queries/reviews'
import { createReviewReply } from '@/lib/supabase/mutations/reviews'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import ErrorState from '@/components/common/ErrorState'
import EmptyState from '@/components/common/EmptyState'

type RatingFilter = 'all' | '5' | '4' | '3' | '2' | '1'

export default function SellerReviewsPage() {
  const { user } = useAuth()
  const [ratingFilter, setRatingFilter] = useState<RatingFilter>('all')
  const [showReplyModal, setShowReplyModal] = useState(false)
  const [selectedReview, setSelectedReview] = useState<any>(null)
  const [reviews, setReviews] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [replyContent, setReplyContent] = useState('')

  useEffect(() => {
    if (user) {
      loadReviews()
    }
  }, [user])

  async function loadReviews() {
    try {
      setLoading(true)
      setError(null)
      const data = await getSellerReviews(user!.id)
      setReviews(data)
    } catch (err: any) {
      console.error('리뷰 조회 실패:', err)
      setError(err.message || '리뷰 목록을 불러오는데 실패했습니다')
    } finally {
      setLoading(false)
    }
  }

  async function handleReplySubmit() {
    if (!replyContent.trim()) {
      alert('답변 내용을 입력해주세요')
      return
    }

    if (!selectedReview) {
      alert('선택된 리뷰가 없습니다')
      return
    }

    try {
      setSubmitting(true)
      await createReviewReply(selectedReview.id, replyContent)
      setShowReplyModal(false)
      setReplyContent('')
      setSelectedReview(null)
      await loadReviews()
      alert('답변이 등록되었습니다')
    } catch (err: any) {
      console.error('답변 등록 실패:', err)
      alert('답변 등록에 실패했습니다: ' + err.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <>
        <Sidebar mode="seller" />
        <main className="flex-1 overflow-y-auto p-8">
          <LoadingSpinner message="리뷰 목록을 불러오는 중..." />
        </main>
      </>
    )
  }

  if (error) {
    return (
      <>
        <Sidebar mode="seller" />
        <main className="flex-1 overflow-y-auto p-8">
          <ErrorState message={error} retry={loadReviews} />
        </main>
      </>
    )
  }

  const filteredReviews = reviews.filter(review => {
    if (ratingFilter !== 'all' && review.rating !== parseInt(ratingFilter)) return false
    return true
  })

  const totalReviews = reviews.length
  const avgRating = totalReviews > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
    : 0

  const stats = {
    avgRating,
    totalReviews,
    rating5: reviews.filter(r => r.rating === 5).length,
    rating4: reviews.filter(r => r.rating === 4).length,
    rating3: reviews.filter(r => r.rating === 3).length,
    rating2: reviews.filter(r => r.rating === 2).length,
    rating1: reviews.filter(r => r.rating === 1).length,
    replyRate: totalReviews > 0
      ? (reviews.filter(r => r.seller_reply).length / totalReviews) * 100
      : 0
  }

  const tabs: { value: RatingFilter; label: string; count: number }[] = [
    { value: 'all', label: '전체', count: stats.totalReviews },
    { value: '5', label: '⭐️⭐️⭐️⭐️⭐️', count: stats.rating5 },
    { value: '4', label: '⭐️⭐️⭐️⭐️', count: stats.rating4 },
    { value: '3', label: '⭐️⭐️⭐️', count: stats.rating3 },
    { value: '2', label: '⭐️⭐️', count: stats.rating2 },
    { value: '1', label: '⭐️', count: stats.rating1 }
  ]

  return (
    <>
      <Sidebar mode="seller" />
      <main className="flex-1 overflow-y-auto p-8">
        {/* 페이지 헤더 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">리뷰 관리</h1>
          <p className="text-gray-600">고객 리뷰를 확인하고 답변하세요</p>
        </div>

        {/* 평점 요약 */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-5xl font-bold text-gray-900 mb-2">{stats.avgRating}</div>
              <div className="flex items-center justify-center gap-1 mb-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <i key={star} className={`fas fa-star ${star <= Math.floor(stats.avgRating) ? 'text-yellow-400' : 'text-gray-300'} text-xl`}></i>
                ))}
              </div>
              <div className="text-sm text-gray-600">총 {stats.totalReviews}개의 리뷰</div>
            </div>

            <div className="space-y-2">
              {[5, 4, 3, 2, 1].map((rating) => {
                const count = reviews.filter(r => r.rating === rating).length
                const percentage = stats.totalReviews > 0 ? (count / stats.totalReviews) * 100 : 0
                return (
                  <div key={rating} className="flex items-center gap-3">
                    <span className="text-sm text-gray-600 w-8">{rating}점</span>
                    <div className="flex-1 bg-gray-100 rounded-full h-4 overflow-hidden">
                      <div
                        className="bg-yellow-400 h-full rounded-full"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-600 w-8 text-right">{count}</span>
                  </div>
                )
              })}
            </div>

            <div className="flex flex-col items-center justify-center">
              <div className="text-center mb-4">
                <div className="text-3xl font-bold text-brand-primary mb-1">{stats.replyRate.toFixed(0)}%</div>
                <div className="text-sm text-gray-600">답변율</div>
              </div>
              <div className="text-sm text-gray-500">
                {reviews.filter(r => r.seller_reply).length} / {stats.totalReviews} 답변 완료
              </div>
            </div>
          </div>
        </div>

        {/* 탭 네비게이션 */}
        <div className="bg-white rounded-lg border border-gray-200 mb-6">
          <div className="flex items-center overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.value}
                onClick={() => setRatingFilter(tab.value)}
                className={`flex-shrink-0 px-6 py-4 font-medium text-sm border-b-2 transition-colors whitespace-nowrap ${
                  ratingFilter === tab.value
                    ? 'border-brand-primary text-brand-primary'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab.label}
                {tab.count > 0 && (
                  <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                    ratingFilter === tab.value
                      ? 'bg-brand-primary text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* 결과 카운트 */}
        <div className="mb-4 text-sm text-gray-600">
          총 <span className="font-bold text-gray-900">{filteredReviews.length}</span>개의 리뷰
        </div>

        {/* 리뷰 목록 */}
        <div className="space-y-4">
          {filteredReviews.length > 0 ? (
            filteredReviews.map((review) => (
              <div key={review.id} className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-brand-primary rounded-full flex items-center justify-center text-white font-bold">
                      {(review.buyer?.name || '구매자')[0]}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{review.buyer?.name || '구매자'}</div>
                      <div className="text-sm text-gray-600">{new Date(review.created_at).toLocaleDateString('ko-KR')}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <i key={star} className={`fas fa-star ${star <= review.rating ? 'text-yellow-400' : 'text-gray-300'}`}></i>
                    ))}
                  </div>
                </div>

                <div className="mb-3">
                  <Link
                    href={`/services/${review.service_id}`}
                    className="text-sm text-gray-600 hover:text-brand-primary"
                  >
                    {review.service?.title} • 주문번호 #{review.order?.order_number || review.order_id?.slice(0, 8)}
                  </Link>
                </div>

                <p className="text-gray-700 mb-4">{review.content}</p>

                {review.seller_reply ? (
                  <div className="bg-gray-50 rounded-lg p-4 mb-3">
                    <div className="flex items-center gap-2 mb-2">
                      <i className="fas fa-reply text-brand-primary"></i>
                      <span className="text-sm font-medium text-gray-900">판매자 답변</span>
                      {review.seller_reply_at && (
                        <span className="text-xs text-gray-500">• {new Date(review.seller_reply_at).toLocaleDateString('ko-KR')}</span>
                      )}
                    </div>
                    <p className="text-gray-700">{review.seller_reply}</p>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setSelectedReview(review)
                      setShowReplyModal(true)
                    }}
                    className="px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-light transition-colors text-sm font-medium"
                  >
                    <i className="fas fa-reply mr-2"></i>
                    답변하기
                  </button>
                )}
              </div>
            ))
          ) : (
            <EmptyState
              icon="fa-star"
              title="리뷰가 없습니다"
              description="아직 받은 리뷰가 없습니다"
            />
          )}
        </div>

        {/* 답변 모달 */}
        {showReplyModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">리뷰 답변</h2>
                <button
                  onClick={() => setShowReplyModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <i className="fas fa-times text-2xl"></i>
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    답변 내용 *
                  </label>
                  <textarea
                    rows={6}
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    placeholder="고객에게 감사의 말씀을 전하고, 긍정적인 답변을 작성해주세요"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                  ></textarea>
                </div>

                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex items-start gap-2">
                    <i className="fas fa-lightbulb text-blue-600 mt-1"></i>
                    <div className="text-sm text-blue-700">
                      <p className="font-medium mb-1">답변 팁</p>
                      <ul className="list-disc list-inside space-y-1">
                        <li>긍정적인 리뷰에는 감사의 말씀을 전하세요</li>
                        <li>부정적인 리뷰에는 개선 의지를 보여주세요</li>
                        <li>간결하고 진정성 있게 작성하세요</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => {
                      setShowReplyModal(false)
                      setReplyContent('')
                    }}
                    disabled={submitting}
                    className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium disabled:opacity-50"
                  >
                    취소
                  </button>
                  <button
                    onClick={handleReplySubmit}
                    disabled={submitting}
                    className="flex-1 px-6 py-3 bg-brand-primary text-white rounded-lg hover:bg-brand-light transition-colors font-medium disabled:opacity-50"
                  >
                    <i className="fas fa-check mr-2"></i>
                    {submitting ? '처리중...' : '답변 등록'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </>
  )
}
