'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import DataTable from '@/components/admin/common/DataTable'
import Badge from '@/components/admin/common/Badge'
import Modal from '@/components/admin/common/Modal'
import type { AdminReviewFilter } from '@/types/admin'

export default function AdminReviewsPage() {
  const supabase = createClient()
  const [reviews, setReviews] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedReview, setSelectedReview] = useState<any | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showActionModal, setShowActionModal] = useState(false)
  const [actionType, setActionType] = useState<'hide' | 'unhide' | 'delete' | null>(null)
  const [actionReason, setActionReason] = useState('')

  const [filter, setFilter] = useState<AdminReviewFilter>({
    rating: [],
    hasReport: 'all',
    isVisible: 'all',
    dateRange: { from: null, to: null },
    searchKeyword: '',
    sortBy: 'newest',
  })

  useEffect(() => {
    fetchReviews()
  }, [filter])

  async function fetchReviews() {
    setLoading(true)
    try {
      let query = supabase
        .from('reviews')
        .select(`
          id,
          rating,
          comment,
          is_hidden,
          created_at,
          buyer:users!buyer_id(name, email),
          service:services(
            title,
            seller:seller_profiles!seller_id(business_name)
          ),
          order:orders(order_number)
        `)

      // Apply rating filter
      if (filter.rating.length > 0) {
        query = query.in('rating', filter.rating)
      }

      // Apply visible filter
      if (filter.isVisible === 'true') {
        query = query.eq('is_hidden', false)
      } else if (filter.isVisible === 'false') {
        query = query.eq('is_hidden', true)
      }

      if (filter.searchKeyword) {
        query = query.or(`comment.ilike.%${filter.searchKeyword}%`)
      }

      // Apply sorting
      if (filter.sortBy === 'newest') {
        query = query.order('created_at', { ascending: false })
      } else if (filter.sortBy === 'oldest') {
        query = query.order('created_at', { ascending: true })
      } else if (filter.sortBy === 'highest_rating') {
        query = query.order('rating', { ascending: false })
      } else if (filter.sortBy === 'lowest_rating') {
        query = query.order('rating', { ascending: true })
      }

      const { data, error } = await query.limit(50)

      if (error) throw error
      setReviews(data || [])
    } catch (error) {
      console.error('Error fetching reviews:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleAction() {
    if (!selectedReview || !actionType) return

    try {
      if (actionType === 'hide') {
        const { error } = await supabase
          .from('reviews')
          .update({ is_hidden: true })
          .eq('id', selectedReview.id)

        if (error) throw error

        alert(`리뷰가 숨김 처리되었습니다.`)
      } else if (actionType === 'unhide') {
        const { error } = await supabase
          .from('reviews')
          .update({ is_hidden: false })
          .eq('id', selectedReview.id)

        if (error) throw error

        alert(`리뷰 숨김이 해제되었습니다.`)
      } else if (actionType === 'delete') {
        const { error } = await supabase
          .from('reviews')
          .delete()
          .eq('id', selectedReview.id)

        if (error) throw error

        alert(`리뷰가 삭제되었습니다.`)
      }

      setShowActionModal(false)
      setActionType(null)
      setActionReason('')
      fetchReviews()
    } catch (error: any) {
      console.error('Action error:', error)
      alert('오류가 발생했습니다: ' + error.message)
    }
  }

  function openActionModal(review: any, type: typeof actionType) {
    setSelectedReview(review)
    setActionType(type)
    setShowActionModal(true)
  }

  function renderStars(rating: number) {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <i
            key={star}
            className={`fas fa-star ${star <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
          ></i>
        ))}
      </div>
    )
  }

  const columns = [
    {
      key: 'service',
      label: '서비스',
      render: (review: any) => (
        <div>
          <div className="text-sm text-gray-900">{review.service?.title}</div>
          <div className="text-xs text-gray-500">
            판매자: {review.service?.seller?.business_name}
          </div>
        </div>
      ),
    },
    {
      key: 'buyer',
      label: '구매자',
      render: (review: any) => (
        <div>
          <div className="text-sm text-gray-900">{review.buyer?.name}</div>
          <div className="text-xs text-gray-500">{review.buyer?.email}</div>
        </div>
      ),
    },
    {
      key: 'rating',
      label: '평점',
      render: (review: any) => (
        <div>
          {renderStars(review.rating)}
          <span className="text-sm font-medium text-gray-700 ml-2">{review.rating}.0</span>
        </div>
      ),
      width: 'w-32',
    },
    {
      key: 'comment',
      label: '리뷰 내용',
      render: (review: any) => (
        <div className="max-w-xs">
          <p className="text-sm text-gray-900 line-clamp-2">{review.comment}</p>
        </div>
      ),
    },
    {
      key: 'status',
      label: '상태',
      render: (review: any) => (
        <Badge variant={review.is_hidden ? 'gray' : 'success'} size="sm">
          {review.is_hidden ? '숨김' : '공개'}
        </Badge>
      ),
      width: 'w-20',
    },
    {
      key: 'created_at',
      label: '작성일',
      render: (review: any) => (
        <span className="text-gray-600 text-sm">
          {new Date(review.created_at).toLocaleDateString('ko-KR')}
        </span>
      ),
    },
    {
      key: 'actions',
      label: '액션',
      render: (review: any) => (
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation()
              setSelectedReview(review)
              setShowDetailModal(true)
            }}
            className="text-blue-600 hover:text-blue-800"
            title="상세보기"
          >
            <i className="fas fa-eye"></i>
          </button>
          {!review.is_hidden ? (
            <button
              onClick={(e) => {
                e.stopPropagation()
                openActionModal(review, 'hide')
              }}
              className="text-orange-600 hover:text-orange-800"
              title="숨김"
            >
              <i className="fas fa-eye-slash"></i>
            </button>
          ) : (
            <button
              onClick={(e) => {
                e.stopPropagation()
                openActionModal(review, 'unhide')
              }}
              className="text-green-600 hover:text-green-800"
              title="숨김 해제"
            >
              <i className="fas fa-eye"></i>
            </button>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation()
              openActionModal(review, 'delete')
            }}
            className="text-red-600 hover:text-red-800"
            title="삭제"
          >
            <i className="fas fa-trash"></i>
          </button>
        </div>
      ),
      width: 'w-28',
    },
  ]

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">리뷰 관리</h1>
          <p className="text-gray-600 mt-1">전체 {reviews.length}개의 리뷰</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Rating Filter - Note: Simplified to single select for now */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              평점 필터
            </label>
            <select
              onChange={(e) => {
                const val = e.target.value
                if (val === 'all') {
                  setFilter({ ...filter, rating: [] })
                } else {
                  setFilter({ ...filter, rating: [parseInt(val)] })
                }
              }}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#0f3460]"
            >
              <option value="all">전체</option>
              <option value="5">5점</option>
              <option value="4">4점</option>
              <option value="3">3점</option>
              <option value="2">2점</option>
              <option value="1">1점</option>
            </select>
          </div>

          {/* Visible Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              공개 상태
            </label>
            <select
              value={filter.isVisible}
              onChange={(e) => setFilter({ ...filter, isVisible: e.target.value as any })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#0f3460]"
            >
              <option value="all">전체</option>
              <option value="true">공개</option>
              <option value="false">숨김</option>
            </select>
          </div>

          {/* Sort */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              정렬
            </label>
            <select
              value={filter.sortBy}
              onChange={(e) => setFilter({ ...filter, sortBy: e.target.value as any })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#0f3460]"
            >
              <option value="newest">최신순</option>
              <option value="oldest">오래된순</option>
              <option value="highest_rating">평점 높은순</option>
              <option value="lowest_rating">평점 낮은순</option>
            </select>
          </div>

          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              검색
            </label>
            <input
              type="text"
              value={filter.searchKeyword}
              onChange={(e) => setFilter({ ...filter, searchKeyword: e.target.value })}
              placeholder="리뷰 내용 검색"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#0f3460]"
            />
          </div>
        </div>
      </div>

      {/* Reviews Table */}
      <DataTable
        data={reviews}
        columns={columns}
        loading={loading}
        emptyMessage="리뷰가 없습니다"
      />

      {/* Review Detail Modal */}
      {showDetailModal && selectedReview && (
        <Modal
          isOpen={showDetailModal}
          onClose={() => setShowDetailModal(false)}
          title="리뷰 상세 정보"
          size="lg"
        >
          <div className="space-y-6">
            {/* Review Info */}
            <div>
              <h4 className="font-semibold text-lg mb-3">리뷰 정보</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">평점</label>
                  <div className="mt-1">
                    {renderStars(selectedReview.rating)}
                    <span className="text-lg font-medium text-gray-700 ml-2">
                      {selectedReview.rating}.0
                    </span>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">작성일</label>
                  <p className="text-gray-900">
                    {new Date(selectedReview.created_at).toLocaleString('ko-KR')}
                  </p>
                </div>
                <div className="col-span-2">
                  <label className="text-sm font-medium text-gray-500">리뷰 내용</label>
                  <p className="text-gray-900 whitespace-pre-wrap mt-2 p-4 bg-gray-50 rounded-lg">
                    {selectedReview.comment}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">공개 상태</label>
                  <div className="mt-1">
                    <Badge variant={selectedReview.is_hidden ? 'gray' : 'success'}>
                      {selectedReview.is_hidden ? '숨김' : '공개'}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            {/* Service Info */}
            <div className="pt-4 border-t border-gray-200">
              <h4 className="font-semibold text-lg mb-3">서비스 정보</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="text-sm font-medium text-gray-500">서비스명</label>
                  <p className="text-gray-900">{selectedReview.service?.title}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">판매자</label>
                  <p className="text-gray-900">{selectedReview.service?.seller?.business_name}</p>
                </div>
              </div>
            </div>

            {/* Buyer Info */}
            <div className="pt-4 border-t border-gray-200">
              <h4 className="font-semibold text-lg mb-3">구매자 정보</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">이름</label>
                  <p className="text-gray-900">{selectedReview.buyer?.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">이메일</label>
                  <p className="text-gray-900">{selectedReview.buyer?.email}</p>
                </div>
              </div>
            </div>

            {/* Admin Actions */}
            <div className="pt-4 border-t border-gray-200">
              <h4 className="font-semibold mb-3">관리 액션</h4>
              <div className="flex gap-2">
                {!selectedReview.is_hidden ? (
                  <button
                    onClick={() => openActionModal(selectedReview, 'hide')}
                    className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                  >
                    <i className="fas fa-eye-slash mr-2"></i>
                    숨김 처리
                  </button>
                ) : (
                  <button
                    onClick={() => openActionModal(selectedReview, 'unhide')}
                    className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                  >
                    <i className="fas fa-eye mr-2"></i>
                    숨김 해제
                  </button>
                )}
                <button
                  onClick={() => openActionModal(selectedReview, 'delete')}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  <i className="fas fa-trash mr-2"></i>
                  삭제
                </button>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Action Confirmation Modal */}
      {showActionModal && actionType && (
        <Modal
          isOpen={showActionModal}
          onClose={() => {
            setShowActionModal(false)
            setActionType(null)
            setActionReason('')
          }}
          title={`리뷰 ${
            actionType === 'hide' ? '숨김' :
            actionType === 'unhide' ? '숨김 해제' : '삭제'
          }`}
          footer={
            <>
              <button
                onClick={() => {
                  setShowActionModal(false)
                  setActionType(null)
                  setActionReason('')
                }}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleAction}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                확인
              </button>
            </>
          }
        >
          <div className="space-y-4">
            <p className="text-gray-700">
              {selectedReview?.buyer?.name}님의 리뷰를{' '}
              {actionType === 'hide' ? '숨김 처리' :
               actionType === 'unhide' ? '숨김 해제' : '삭제'}
              하시겠습니까?
            </p>

            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-700">
                <strong>평점:</strong> {selectedReview?.rating}.0
              </p>
              <p className="text-sm text-gray-700 mt-2">
                <strong>내용:</strong> {selectedReview?.comment}
              </p>
            </div>

            {(actionType === 'hide' || actionType === 'delete') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  사유 <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={actionReason}
                  onChange={(e) => setActionReason(e.target.value)}
                  placeholder="조치 사유를 입력하세요..."
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#0f3460]"
                  rows={4}
                  required
                />
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  )
}
