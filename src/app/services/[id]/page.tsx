import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import ViewTracker from '@/components/services/ViewTracker'
import FavoriteButton from '@/components/services/FavoriteButton'
import { logger } from '@/lib/logger'
import { getCategoryPath } from '@/lib/categories'

interface ServiceDetailProps {
  params: Promise<{
    id: string
  }>
}

export default async function ServiceDetailPage({ params }: ServiceDetailProps) {
  const { id } = await params
  const supabase = await createClient()

  const { data: service, error } = await supabase
    .from('services')
    .select(`
      *,
      seller:sellers(
        id,
        business_name,
        display_name,
        profile_image,
        contact_hours,
        tax_invoice_available,
        user_id
      ),
      service_categories(
        category:categories(id, name, slug)
      )
    `)
    .eq('id', id)
    .single()

  if (error) {
    logger.error('Service fetch error:', error)
    notFound()
  }

  if (!service) {
    notFound()
  }

  // seller의 user 정보를 별도로 조회
  if (service?.seller?.user_id) {
    const { data: userData } = await supabase
      .from('users')
      .select('id, name, email, profile_image, created_at')
      .eq('id', service.seller.user_id)
      .single()

    if (userData) {
      service.seller.user = userData
    }
  }

  const categories = service.service_categories?.map((sc: any) => sc.category) || []

  // 카테고리 경로 가져오기 (1차 > 2차 > 3차)
  let categoryPath: any[] = []
  if (categories.length > 0) {
    // 첫 번째 카테고리의 전체 경로를 가져옴
    categoryPath = await getCategoryPath(categories[0].id)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 조회수 추적 */}
      <ViewTracker serviceId={id} />

      {/* 상단 네비게이션 (Breadcrumb) */}
      <nav className="bg-white border-b mt-16">
        <div className="container-1200 px-4 py-4">
          <div className="flex items-center gap-2 text-sm">
            <Link href="/" className="text-gray-500 hover:text-gray-700">홈</Link>
            {categoryPath.map((cat: any, index: number) => (
              <div key={cat.id} className="flex items-center gap-2">
                <span className="text-gray-400">/</span>
                <Link
                  href={`/categories/${cat.slug}`}
                  className="text-gray-500 hover:text-gray-700"
                >
                  {cat.name}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </nav>

      <div className="container-1200 px-4 pb-8">
        <div className="flex flex-col lg:flex-row gap-5">
          {/* 왼쪽: 서비스 정보 */}
          <div className="flex-1 space-y-8 pt-8">
            {/* 서비스 설명 */}
            <div className="bg-white rounded-xl shadow-sm">
              <h1 className="text-2xl font-bold mb-6">{service.title}</h1>

              {/* 통계 */}
              <div className="flex items-center gap-6 py-4 border-y border-gray-200 mb-6">
                <div className="flex items-center gap-2">
                  <i className="fas fa-star text-yellow-400"></i>
                  <span className="font-bold">{service.rating || 0}</span>
                  <span className="text-gray-500">({service.review_count || 0})</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <i className="fas fa-heart text-red-400"></i>
                  <span>{service.wishlist_count || 0}회 찜</span>
                </div>
              </div>

              {/* 판매자 정보 카드 */}
              <div className="bg-white border-2 border-[#0f3460] rounded-lg p-3 mb-6 h-[70px] flex items-center">
                <div className="flex items-center gap-3 w-full">
                  {/* 프로필 이미지 */}
                  <div className="w-[54px] h-[54px] bg-gray-200 rounded-full overflow-hidden flex-shrink-0">
                    {service.seller?.profile_image ? (
                      <img src={service.seller.profile_image} alt={service.seller.business_name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <i className="fas fa-user text-xl"></i>
                      </div>
                    )}
                  </div>

                  {/* 정보 영역 */}
                  <div className="flex-1 flex flex-col justify-center gap-1 min-w-0">
                    {/* 판매자명 */}
                    <h3 className="font-bold text-sm leading-tight truncate">
                      {service.seller?.business_name}
                      {service.seller?.display_name && ` ${service.seller.display_name}`}
                    </h3>

                    {/* 정보 한 줄 */}
                    <div className="flex items-center gap-3 text-xs text-gray-600">
                      {/* 연락 가능 시간 */}
                      {service.seller?.contact_hours && (
                        <span className="whitespace-nowrap">
                          연락: {service.seller.contact_hours}
                        </span>
                      )}

                      {/* 평균 응답 시간 */}
                      <span className="whitespace-nowrap">
                        응답: 00분
                      </span>

                      {/* 세금계산서 */}
                      <span className="whitespace-nowrap">
                        세금계산서: {service.seller?.tax_invoice_available ? (
                          <span className="text-green-600 font-medium">가능</span>
                        ) : (
                          <span className="text-gray-500">불가</span>
                        )}
                      </span>
                    </div>
                  </div>

                  {/* 버튼 */}
                  <div className="flex gap-2 flex-shrink-0">
                    <button className="px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-xs whitespace-nowrap">
                      <i className="far fa-comment mr-1"></i> 문의
                    </button>
                    <button className="px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-xs whitespace-nowrap">
                      <i className="far fa-user mr-1"></i> 프로필
                    </button>
                  </div>
                </div>
              </div>

              <div className="prose prose-lg max-w-none whitespace-pre-wrap">
                {service.description}
              </div>
            </div>
          </div>

          {/* 오른쪽: 구매 옵션 */}
          <div className="w-full lg:w-[350px] flex-shrink-0 lg:-mt-[20px]">
            <div className="sticky top-12 space-y-6">
              {/* 썸네일 이미지 */}
              <div className="bg-white rounded-xl overflow-hidden shadow-sm">
                <div className="h-[260px] relative bg-gray-100">
                  {service.thumbnail_url ? (
                    <img
                      src={service.thumbnail_url}
                      alt={service.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                      <i className="fas fa-image text-[40px]"></i>
                    </div>
                  )}
                </div>
                {service.portfolio_urls && service.portfolio_urls.length > 0 && (
                  <div className="grid grid-cols-2 gap-2 p-4">
                    {service.portfolio_urls.slice(0, 4).map((url: string, i: number) => (
                      <div key={i} className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                        <img src={url} alt={`Portfolio ${i + 1}`} className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 가격 정보 */}
              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="p-6">
                  <div className="text-3xl font-bold mb-1">
                    ₩{service.price?.toLocaleString() || 0}
                  </div>
                  <div className="text-sm text-gray-600 mb-6">
                    {service.delivery_days || 0}일 이내 완료 · {service.revision_count === 999 ? '무제한' : `${service.revision_count || 0}회`} 수정
                  </div>

                  <button className="w-full py-3 bg-[#0f3460] text-white rounded-lg font-medium hover:bg-[#1a4d8f] transition-colors">
                    구매하기
                  </button>

                  <div className="flex gap-2 mt-3">
                    <FavoriteButton serviceId={id} />
                    <button className="flex-1 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                      <i className="fas fa-share"></i> 공유
                    </button>
                  </div>
                </div>
              </div>

              {/* 안전거래 배지 */}
              <div className="bg-blue-50 rounded-xl p-4 text-center">
                <i className="fas fa-shield-alt text-2xl text-[#0f3460] mb-2"></i>
                <h4 className="font-bold mb-1">100% 안전거래</h4>
                <p className="text-xs text-gray-600">
                  에스크로 결제 시스템으로<br/>
                  안전하게 거래하세요
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
