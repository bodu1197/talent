'use client';

import { useState, useEffect } from 'react';
import ErrandMypageLayout from '@/components/errands/ErrandMypageLayout';
import { useAuth } from '@/components/providers/AuthProvider';
import ProfileImage from '@/components/common/ProfileImage';
import {
  Star,
  TrendingUp,
  TrendingDown,
  MessageSquare,
  ThumbsUp,
  Clock,
} from 'lucide-react';

interface Review {
  id: string;
  rating: number;
  content: string;
  created_at: string;
  errand_title: string;
  reviewer: {
    id: string;
    name: string;
    profile_image: string | null;
  };
}

interface ReviewStats {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: { [key: number]: number };
  recentTrend: 'up' | 'down' | 'stable';
}

export default function HelperReviewsPage() {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<ReviewStats>({
    averageRating: 0,
    totalReviews: 0,
    ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
    recentTrend: 'stable',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadReviews();
    }
  }, [user]);

  async function loadReviews() {
    try {
      setLoading(true);
      const response = await fetch('/api/helper/reviews');
      if (response.ok) {
        const data = await response.json();
        setReviews(data.reviews || []);
        setStats(data.stats || {
          averageRating: 0,
          totalReviews: 0,
          ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
          recentTrend: 'stable',
        });
      }
    } catch (error) {
      console.error('리뷰 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  }

  const renderStars = (rating: number, size: 'sm' | 'lg' = 'sm') => {
    const starSize = size === 'lg' ? 'w-6 h-6' : 'w-4 h-4';
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${starSize} ${
              star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  const getTrendIcon = (trend: string) => {
    if (trend === 'up') return { icon: TrendingUp, color: 'text-green-500', text: '상승' };
    if (trend === 'down') return { icon: TrendingDown, color: 'text-red-500', text: '하락' };
    return { icon: ThumbsUp, color: 'text-gray-500', text: '유지' };
  };

  return (
    <ErrandMypageLayout mode="helper">
      <div className="p-4 lg:p-0">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-gray-900">리뷰 관리</h1>
          <p className="text-gray-600 mt-1">받은 리뷰를 확인하고 평점을 관리하세요</p>
        </div>

        {loading ? (
          <div className="bg-white rounded-xl p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent mx-auto" />
            <p className="mt-4 text-gray-500">불러오는 중...</p>
          </div>
        ) : (
          <>
            {/* 평점 요약 */}
            <div className="bg-white rounded-xl p-6 mb-6 shadow-sm">
              <div className="flex items-center gap-6">
                <div className="text-center">
                  <p className="text-4xl font-bold text-gray-900">
                    {stats.averageRating.toFixed(1)}
                  </p>
                  <div className="flex justify-center mt-1">
                    {renderStars(Math.round(stats.averageRating), 'lg')}
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    {stats.totalReviews}개 리뷰
                  </p>
                </div>
                <div className="flex-1">
                  {[5, 4, 3, 2, 1].map((rating) => {
                    const count = stats.ratingDistribution[rating] || 0;
                    const percentage = stats.totalReviews > 0 ? (count / stats.totalReviews) * 100 : 0;
                    return (
                      <div key={rating} className="flex items-center gap-2 mb-1">
                        <span className="text-xs text-gray-500 w-3">{rating}</span>
                        <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                        <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-yellow-400 rounded-full"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-500 w-8">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
              {stats.totalReviews > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-center gap-2">
                  {(() => {
                    const trend = getTrendIcon(stats.recentTrend);
                    const TrendIcon = trend.icon;
                    return (
                      <>
                        <TrendIcon className={`w-4 h-4 ${trend.color}`} />
                        <span className="text-sm text-gray-600">
                          최근 30일 평점 {trend.text} 추세
                        </span>
                      </>
                    );
                  })()}
                </div>
              )}
            </div>

            {/* 리뷰 목록 */}
            <div className="bg-white rounded-xl shadow-sm">
              <div className="flex items-center justify-between p-4 border-b border-gray-100">
                <h2 className="font-bold text-gray-900">받은 리뷰</h2>
                <span className="text-sm text-gray-500">총 {stats.totalReviews}개</span>
              </div>

              {reviews.length === 0 ? (
                <div className="p-8 text-center">
                  <MessageSquare className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                  <p className="text-gray-500">아직 받은 리뷰가 없습니다</p>
                  <p className="text-sm text-gray-400 mt-1">
                    심부름을 완료하면 리뷰를 받을 수 있습니다
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {reviews.map((review) => (
                    <div key={review.id} className="p-4">
                      <div className="flex items-start gap-3">
                        <ProfileImage
                          src={review.reviewer.profile_image}
                          alt={review.reviewer.name}
                          size={40}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <p className="font-medium text-gray-900">
                              {review.reviewer.name}
                            </p>
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                              <Clock className="w-3 h-3" />
                              {new Date(review.created_at).toLocaleDateString('ko-KR')}
                            </div>
                          </div>
                          <div className="mb-2">
                            {renderStars(review.rating)}
                          </div>
                          <p className="text-sm text-gray-500 mb-2 truncate">
                            심부름: {review.errand_title}
                          </p>
                          {review.content && (
                            <p className="text-gray-700">{review.content}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 팁 */}
            <div className="mt-6 bg-yellow-50 rounded-xl p-4">
              <h3 className="font-semibold text-yellow-900 mb-2">좋은 리뷰 받는 팁</h3>
              <ul className="space-y-2 text-sm text-yellow-700">
                <li className="flex items-start gap-2">
                  <Star className="w-4 h-4 text-yellow-500 flex-shrink-0 mt-0.5" />
                  <span>약속된 시간을 정확히 지키세요</span>
                </li>
                <li className="flex items-start gap-2">
                  <Star className="w-4 h-4 text-yellow-500 flex-shrink-0 mt-0.5" />
                  <span>요청자와 친절하게 소통하세요</span>
                </li>
                <li className="flex items-start gap-2">
                  <Star className="w-4 h-4 text-yellow-500 flex-shrink-0 mt-0.5" />
                  <span>심부름 물품을 안전하게 배달하세요</span>
                </li>
                <li className="flex items-start gap-2">
                  <Star className="w-4 h-4 text-yellow-500 flex-shrink-0 mt-0.5" />
                  <span>진행 상황을 중간중간 알려드리세요</span>
                </li>
              </ul>
            </div>
          </>
        )}
      </div>
    </ErrandMypageLayout>
  );
}
