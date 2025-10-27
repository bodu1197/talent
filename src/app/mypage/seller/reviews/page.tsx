'use client'

import { useState } from 'react'
import Sidebar from '@/components/mypage/Sidebar'
import Link from 'next/link'

type RatingFilter = 'all' | '5' | '4' | '3' | '2' | '1'

export default function SellerReviewsPage() {
  const [ratingFilter, setRatingFilter] = useState<RatingFilter>('all')
  const [showReplyModal, setShowReplyModal] = useState(false)
  const [selectedReview, setSelectedReview] = useState<string | null>(null)

  // TODO: 실제로는 API에서 데이터를 가져와야 합니다
  const mockReviews = [
    {
      id: '1',
      buyerName: '홍길동',
      buyerProfile: null,
      serviceName: '로고 디자인 작업',
      rating: 5,
      content: '정말 만족스러운 작업이었습니다. 요구사항을 완벽하게 반영해주셨고, 빠른 작업에 감사드립니다!',
      date: '2025-01-25',
      orderNumber: '12345',
      hasReply: true,
      reply: '좋은 평가 감사합니다. 앞으로도 좋은 서비스로 보답하겠습니다!'
    },
    {
      id: '2',
      buyerName: '김철수',
      buyerProfile: null,
      serviceName: '영상 편집',
      rating: 4,
      content: '전반적으로 만족합니다. 수정 요청에도 빠르게 대응해주셨어요.',
      date: '2025-01-23',
      orderNumber: '12344',
      hasReply: false,
      reply: null
    },
    {
      id: '3',
      buyerName: '이영희',
      buyerProfile: null,
      serviceName: '명함 디자인',
      rating: 5,
      content: '기대 이상이었습니다. 디자인 감각이 뛰어나시네요!',
      date: '2025-01-20',
      orderNumber: '12343',
      hasReply: false,
      reply: null
    }
  ]

  const filteredReviews = mockReviews.filter(review => {
    if (ratingFilter !== 'all' && review.rating !== parseInt(ratingFilter)) return false
    return true
  })

  const stats = {
    avgRating: 4.8,
    totalReviews: mockReviews.length,
    rating5: mockReviews.filter(r => r.rating === 5).length,
    rating4: mockReviews.filter(r => r.rating === 4).length,
    rating3: mockReviews.filter(r => r.rating === 3).length,
    rating2: mockReviews.filter(r => r.rating === 2).length,
    rating1: mockReviews.filter(r => r.rating === 1).length,
    replyRate: (mockReviews.filter(r => r.hasReply).length / mockReviews.length) * 100
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
                const count = mockReviews.filter(r => r.rating === rating).length
                const percentage = (count / stats.totalReviews) * 100
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
                <div className="text-3xl font-bold text-[#0f3460] mb-1">{stats.replyRate.toFixed(0)}%</div>
                <div className="text-sm text-gray-600">답변율</div>
              </div>
              <div className="text-sm text-gray-500">
                {mockReviews.filter(r => r.hasReply).length} / {stats.totalReviews} 답변 완료
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
                    ? 'border-[#0f3460] text-[#0f3460]'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab.label}
                {tab.count > 0 && (
                  <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                    ratingFilter === tab.value
                      ? 'bg-[#0f3460] text-white'
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
          {filteredReviews.map((review) => (
            <div key={review.id} className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-[#0f3460] rounded-full flex items-center justify-center text-white font-bold">
                    {review.buyerName[0]}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{review.buyerName}</div>
                    <div className="text-sm text-gray-600">{review.date}</div>
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
                  href={`/services/${review.orderNumber}`}
                  className="text-sm text-gray-600 hover:text-[#0f3460]"
                >
                  {review.serviceName} • 주문번호 #{review.orderNumber}
                </Link>
              </div>

              <p className="text-gray-700 mb-4">{review.content}</p>

              {review.hasReply && review.reply ? (
                <div className="bg-gray-50 rounded-lg p-4 mb-3">
                  <div className="flex items-center gap-2 mb-2">
                    <i className="fas fa-reply text-[#0f3460]"></i>
                    <span className="text-sm font-medium text-gray-900">판매자 답변</span>
                  </div>
                  <p className="text-gray-700">{review.reply}</p>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setSelectedReview(review.id)
                    setShowReplyModal(true)
                  }}
                  className="px-4 py-2 bg-[#0f3460] text-white rounded-lg hover:bg-[#1a4b7d] transition-colors text-sm font-medium"
                >
                  <i className="fas fa-reply mr-2"></i>
                  답변하기
                </button>
              )}
            </div>
          ))}
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
                    placeholder="고객에게 감사의 말씀을 전하고, 긍정적인 답변을 작성해주세요"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0f3460] focus:border-transparent"
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
                    onClick={() => setShowReplyModal(false)}
                    className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                  >
                    취소
                  </button>
                  <button
                    onClick={() => {
                      // TODO: API 호출
                      setShowReplyModal(false)
                    }}
                    className="flex-1 px-6 py-3 bg-[#0f3460] text-white rounded-lg hover:bg-[#1a4b7d] transition-colors font-medium"
                  >
                    <i className="fas fa-check mr-2"></i>
                    답변 등록
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
