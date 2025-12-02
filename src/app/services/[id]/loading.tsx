export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-50 animate-pulse">
      {/* 모바일: 썸네일 스켈레톤 */}
      <div className="lg:hidden w-full bg-gray-300" style={{ aspectRatio: '16/10' }} />

      {/* PC: Breadcrumb 스켈레톤 */}
      <div className="hidden lg:block bg-white border-b mt-20">
        <div className="container-1200 px-4 py-4">
          <div className="h-4 bg-gray-200 rounded w-48" />
        </div>
      </div>

      {/* PC: 헤더 영역 스켈레톤 */}
      <div
        className="hidden lg:block w-full py-8"
        style={{ background: 'linear-gradient(to right, #d1fae5, #ecfdf5)' }}
      >
        <div className="container-1200 px-4">
          <div className="flex gap-5">
            <div className="flex-1">
              {/* 제목 */}
              <div className="h-8 bg-gray-200 rounded w-3/4 mb-6" />
              {/* 별점 */}
              <div className="h-6 bg-gray-200 rounded w-48 mb-6" />
              {/* 전문가 카드 */}
              <div className="bg-white rounded-lg h-[70px] p-3">
                <div className="flex items-center gap-3">
                  <div className="w-[54px] h-[54px] bg-gray-200 rounded-full" />
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-24 mb-2" />
                    <div className="h-3 bg-gray-200 rounded w-40" />
                  </div>
                </div>
              </div>
            </div>
            {/* 썸네일 */}
            <div className="w-[350px] h-[260px] bg-gray-200 rounded-xl" />
          </div>
        </div>
      </div>

      {/* 모바일: 전문가 카드 스켈레톤 */}
      <div className="lg:hidden bg-white px-4 py-3 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gray-200 rounded-full" />
          <div className="flex-1">
            <div className="h-4 bg-gray-200 rounded w-24 mb-2" />
            <div className="h-3 bg-gray-200 rounded w-32" />
          </div>
          <div className="w-16 h-8 bg-gray-200 rounded-lg" />
        </div>
      </div>

      {/* 모바일: 별점 스켈레톤 */}
      <div className="lg:hidden bg-white px-4 py-3 border-b border-gray-100">
        <div className="h-5 bg-gray-200 rounded w-48" />
      </div>

      {/* 모바일: 제목/가격 스켈레톤 */}
      <div className="lg:hidden bg-white px-4 py-4">
        <div className="h-6 bg-gray-200 rounded w-3/4 mb-3" />
        <div className="h-7 bg-gray-200 rounded w-32" />
      </div>

      {/* 메인 컨텐츠 영역 */}
      <div className="container-1200 px-4 pb-8 pt-5">
        <div className="flex flex-col lg:flex-row gap-5">
          {/* 왼쪽: 서비스 설명 */}
          <div className="flex-1 min-w-0 space-y-8">
            {/* 서비스 설명 카드 */}
            <div className="bg-white rounded-xl shadow-sm p-3 lg:p-6">
              <div className="h-6 bg-gray-200 rounded w-32 mb-4" />
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded w-full" />
                <div className="h-4 bg-gray-200 rounded w-5/6" />
                <div className="h-4 bg-gray-200 rounded w-4/6" />
                <div className="h-4 bg-gray-200 rounded w-full" />
                <div className="h-4 bg-gray-200 rounded w-3/4" />
              </div>
            </div>

            {/* 전문가 정보 카드 */}
            <div className="bg-white rounded-xl shadow-sm p-3 lg:p-6">
              <div className="h-6 bg-gray-200 rounded w-28 mb-6" />
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 bg-gray-200 rounded-full" />
                  <div className="flex-1">
                    <div className="h-5 bg-gray-200 rounded w-32 mb-2" />
                    <div className="h-4 bg-gray-200 rounded w-48 mb-1" />
                    <div className="h-4 bg-gray-200 rounded w-40" />
                  </div>
                </div>
              </div>
            </div>

            {/* 리뷰 카드 */}
            <div className="bg-white rounded-xl shadow-sm p-3 lg:p-6">
              <div className="h-6 bg-gray-200 rounded w-24 mb-6" />
              <div className="space-y-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="border-b border-gray-200 pb-6">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-gray-200 rounded-full" />
                      <div>
                        <div className="h-4 bg-gray-200 rounded w-20 mb-1" />
                        <div className="h-3 bg-gray-200 rounded w-24" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-full" />
                      <div className="h-4 bg-gray-200 rounded w-4/5" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 오른쪽: 가격 정보 (PC만) */}
          <div className="hidden lg:block w-[350px] flex-shrink-0">
            <div className="sticky top-20 space-y-6">
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="h-8 bg-gray-200 rounded w-32 mb-2" />
                <div className="h-4 bg-gray-200 rounded w-48 mb-6" />
                <div className="h-12 bg-gray-200 rounded-lg mb-3" />
                <div className="h-10 bg-gray-200 rounded-lg mb-3" />
                <div className="space-y-2">
                  <div className="h-10 bg-gray-200 rounded-lg" />
                  <div className="h-10 bg-gray-200 rounded-lg" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 모바일: 하단 고정 버튼 스켈레톤 */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
        <div className="flex items-center h-12">
          <div className="w-14 h-full bg-gray-200" />
          <div className="flex-1 h-full bg-gray-100" />
          <div className="flex-1 h-full bg-gray-200" />
        </div>
      </div>
    </div>
  );
}
