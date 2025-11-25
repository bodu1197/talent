import { createClient } from '@/lib/supabase/server';
import Image from 'next/image';

interface ReviewData {
  id: string;
  rating: number;
  comment: string;
  created_at: string;
  buyer_id: string;
  services: {
    id: string;
    title: string;
    thumbnail_url?: string;
  } | null;
}

export default async function UserReviews() {
  const supabase = await createClient();

  // 최근 리뷰 데이터 가져오기 (모든 공개 리뷰, 최근 12개)
  const { data: reviews } = await supabase
    .from('reviews')
    .select(
      `
      id,
      rating,
      comment,
      created_at,
      buyer_id,
      services(
        id,
        title,
        thumbnail_url
      )
    `
    )
    .eq('is_visible', true)
    .order('created_at', { ascending: false })
    .limit(12);

  const reviewData = (reviews as unknown as ReviewData[]) || [];

  if (reviewData.length === 0) {
    return null;
  }

  return (
    <section className="py-16 bg-white">
      <div className="container-1200">
        {/* 제목 */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            고객들의 생생한 후기
          </h2>
          <p className="text-lg text-gray-600">돌파구를 이용한 고객들의 실제 경험을 확인해보세요</p>
        </div>

        {/* 리뷰 그리드 */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reviewData.map((review) => (
            <div
              key={review.id}
              className="bg-gray-50 rounded-xl p-6 hover:shadow-lg transition-shadow"
            >
              {/* 별점 */}
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, index) => (
                  <svg
                    key={`rating-star-${index}`}
                    className={`w-5 h-5 ${
                      index < review.rating ? 'text-yellow-400' : 'text-gray-300'
                    }`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
                <span className="ml-2 text-sm font-semibold text-gray-700">
                  {review.rating.toFixed(1)}
                </span>
              </div>

              {/* 리뷰 내용 */}
              <p className="text-gray-700 mb-4 line-clamp-3">{review.comment}</p>

              {/* 서비스 정보 */}
              {review.services && (
                <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-200">
                  {review.services.thumbnail_url && (
                    <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                      <Image
                        src={review.services.thumbnail_url}
                        alt={review.services.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {review.services.title}
                    </p>
                  </div>
                </div>
              )}

              {/* 작성자 정보 */}
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">돌파구 고객</p>
                  <p className="text-xs text-gray-500">
                    {new Date(review.created_at).toLocaleDateString('ko-KR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 더보기 안내 */}
        <div className="text-center mt-10">
          <p className="text-gray-600">
            더 많은 후기가 궁금하신가요?{' '}
            <span className="text-blue-600 font-semibold">서비스 페이지에서 확인하세요</span>
          </p>
        </div>
      </div>
    </section>
  );
}
